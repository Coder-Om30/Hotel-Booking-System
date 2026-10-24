package com.example.hotelbooking.payment;

import com.example.hotelbooking.booking.Booking;
import com.example.hotelbooking.booking.BookingRepository;
import com.example.hotelbooking.booking.BookingStatus;
import com.example.hotelbooking.common.ConflictException;
import com.example.hotelbooking.common.ForbiddenException;
import com.example.hotelbooking.common.ResourceNotFoundException;
import com.example.hotelbooking.user.Role;
import com.example.hotelbooking.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public PaymentResponseDto processMockPayment(User user, Long bookingId, MockPaymentRequestDto request) {
        // 1. Check idempotency first
        Optional<Payment> existingPaymentOpt = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
        if (existingPaymentOpt.isPresent()) {
            Payment existingPayment = existingPaymentOpt.get();
            log.info("Idempotent payment request detected for key: {}", request.getIdempotencyKey());
            return PaymentResponseDto.from(existingPayment, "Payment was already processed previously (Idempotent response)");
        }

        // 2. Fetch booking with pessimistic lock to prevent concurrent payment race conditions
        Booking booking = bookingRepository.findByIdWithLock(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You are not authorized to process payment for this booking");
        }

        // 3. Verify booking state
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new ConflictException("Booking has already been confirmed and paid");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ConflictException("Booking has already been cancelled");
        }

        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new ConflictException("Pending booking hold has expired. Please select rooms and book again.");
        }

        // 4. Verify hold expiry
        Instant now = Instant.now();
        if (booking.getHoldExpiresAt() != null && booking.getHoldExpiresAt().isBefore(now)) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            throw new ConflictException("Pending booking hold has expired. Please select rooms and book again.");
        }

        // If retrying payment after a previous FAILURE outcome, verify inventory is still available
        String outcome = request.getOutcome().toUpperCase().trim();
        if (booking.getStatus() == BookingStatus.PAYMENT_FAILED && "SUCCESS".equals(outcome)) {
            int occupiedRooms = bookingRepository.countOccupiedRooms(
                    booking.getRoomType().getId(), booking.getCheckIn(), booking.getCheckOut(), now);
            int availableRooms = booking.getRoomType().getTotalRooms() - occupiedRooms;
            if (availableRooms < booking.getRoomCount()) {
                throw new ConflictException(String.format(
                        "Inventory is no longer available: Only %d room(s) available for requested dates",
                        Math.max(0, availableRooms)));
            }
        }
        String paymentReference = "MOCK-TX-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        PaymentStatus paymentStatus;
        String message;

        if ("SUCCESS".equals(outcome)) {
            paymentStatus = PaymentStatus.SUCCEEDED;
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setConfirmedAt(now);
            booking.setHoldExpiresAt(null); // hold fulfilled
            message = "Simulated payment succeeded. Your booking is confirmed!";
        } else if ("FAILURE".equals(outcome)) {
            paymentStatus = PaymentStatus.FAILED;
            booking.setStatus(BookingStatus.PAYMENT_FAILED);
            message = "Simulated payment failed. You may retry payment before hold expires.";
        } else {
            paymentStatus = PaymentStatus.CANCELLED;
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(now);
            message = "Simulated payment was cancelled by user. Held inventory released.";
        }

        Payment payment = new Payment(
                booking,
                paymentReference,
                booking.getTotalAmount(),
                booking.getCurrency(),
                paymentStatus,
                request.getIdempotencyKey().trim()
        );

        Payment savedPayment = paymentRepository.save(payment);
        bookingRepository.save(booking);

        log.info("Mock payment completed: ref={}, status={}, bookingRef={}",
                paymentReference, paymentStatus, booking.getBookingReference());

        return PaymentResponseDto.from(savedPayment, message);
    }
}
