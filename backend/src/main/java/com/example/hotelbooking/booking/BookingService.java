package com.example.hotelbooking.booking;

import com.example.hotelbooking.common.BadRequestException;
import com.example.hotelbooking.common.ConflictException;
import com.example.hotelbooking.common.ForbiddenException;
import com.example.hotelbooking.common.PagedResponse;
import com.example.hotelbooking.common.ResourceNotFoundException;
import com.example.hotelbooking.room.RoomType;
import com.example.hotelbooking.room.RoomTypeRepository;
import com.example.hotelbooking.user.Role;
import com.example.hotelbooking.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final int holdExpiryMinutes;
    private final int cancellationWindowHours;
    private final String currency;

    public BookingService(
            BookingRepository bookingRepository,
            RoomTypeRepository roomTypeRepository,
            @Value("${app.business.hold-expiry-minutes:15}") int holdExpiryMinutes,
            @Value("${app.business.cancellation-window-hours:24}") int cancellationWindowHours,
            @Value("${app.business.currency:INR}") String currency) {
        this.bookingRepository = bookingRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.holdExpiryMinutes = holdExpiryMinutes;
        this.cancellationWindowHours = cancellationWindowHours;
        this.currency = currency;
    }

    @Transactional
    public BookingResponseDto createBookingHold(User user, CreateBookingRequestDto request) {
        LocalDate checkIn = request.getCheckIn();
        LocalDate checkOut = request.getCheckOut();
        LocalDate today = LocalDate.now();

        if (checkIn.isBefore(today)) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }
        if (request.getRoomCount() <= 0) {
            throw new BadRequestException("Room count must be at least 1");
        }
        if (request.getGuestCount() <= 0) {
            throw new BadRequestException("Guest count must be at least 1");
        }

        // Concurrency Control: Acquire row lock on the RoomType row
        RoomType roomType = roomTypeRepository.findByIdWithLock(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with id: " + request.getRoomTypeId()));

        if (!roomType.isActive() || !roomType.getHotel().isActive()) {
            throw new BadRequestException("This room type is currently inactive or unavailable for booking");
        }

        int maxAllowedGuests = request.getRoomCount() * roomType.getMaxOccupancy();
        if (request.getGuestCount() > maxAllowedGuests) {
            throw new BadRequestException(String.format(
                    "Requested guests (%d) exceeds maximum capacity (%d) for %d room(s) of this room type",
                    request.getGuestCount(), maxAllowedGuests, request.getRoomCount()));
        }

        // Calculate currently committed rooms across overlapping interval
        Instant now = Instant.now();
        int occupiedRooms = bookingRepository.countOccupiedRooms(roomType.getId(), checkIn, checkOut, now);
        int availableRooms = roomType.getTotalRooms() - occupiedRooms;

        if (availableRooms < request.getRoomCount()) {
            throw new ConflictException(String.format(
                    "Insufficient inventory: Only %d room(s) available for requested dates, but %d requested",
                    Math.max(0, availableRooms), request.getRoomCount()));
        }

        long nightCount = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal pricePerNight = roomType.getPricePerNight();
        BigDecimal totalAmount = pricePerNight.multiply(BigDecimal.valueOf(request.getRoomCount() * nightCount));
        String bookingReference = "BK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        Instant holdExpiresAt = now.plus(holdExpiryMinutes, ChronoUnit.MINUTES);

        Booking booking = new Booking(
                bookingReference,
                user,
                roomType,
                checkIn,
                checkOut,
                request.getRoomCount(),
                request.getGuestCount(),
                (int) nightCount,
                pricePerNight,
                totalAmount,
                currency,
                holdExpiresAt
        );

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Created PENDING_PAYMENT booking hold: ref={} for user={}", bookingReference, user.getEmail());

        return BookingResponseDto.from(savedBooking, cancellationWindowHours);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponseDto> getMyBookings(User user, Pageable pageable) {
        Page<Booking> page = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PagedResponse.from(page.map(b -> BookingResponseDto.from(b, cancellationWindowHours)));
    }

    @Transactional(readOnly = true)
    public BookingResponseDto getBookingById(User user, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Enforce ownership: only owner or ADMIN can view
        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You are not authorized to view this booking");
        }

        return BookingResponseDto.from(booking, cancellationWindowHours);
    }

    @Transactional
    public BookingResponseDto cancelBooking(User user, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Enforce ownership
        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ConflictException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.EXPIRED || booking.getStatus() == BookingStatus.PAYMENT_FAILED) {
            throw new ConflictException("Booking cannot be cancelled in status: " + booking.getStatus());
        }

        // Check cancellation deadline for confirmed bookings
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            LocalDate deadlineDate = LocalDate.now().plusDays(Math.max(1, cancellationWindowHours / 24));
            if (booking.getCheckIn().isBefore(deadlineDate)) {
                throw new BadRequestException(String.format(
                        "Cancellations must be made at least %d hours prior to check-in date (%s)",
                        cancellationWindowHours, booking.getCheckIn()));
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ref={} was CANCELLED by user={}", booking.getBookingReference(), user.getEmail());

        return BookingResponseDto.from(updatedBooking, cancellationWindowHours);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expirePendingHolds() {
        Instant now = Instant.now();
        List<Booking> expiredHolds = bookingRepository.findExpiredHolds(now);
        if (!expiredHolds.isEmpty()) {
            for (Booking booking : expiredHolds) {
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);
                log.info("Expired unconfirmed booking hold: ref={}", booking.getBookingReference());
            }
        }
    }
}
