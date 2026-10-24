package com.example.hotelbooking.admin;

import com.example.hotelbooking.booking.Booking;
import com.example.hotelbooking.booking.BookingRepository;
import com.example.hotelbooking.booking.BookingResponseDto;
import com.example.hotelbooking.booking.BookingStatus;
import com.example.hotelbooking.common.PagedResponse;
import com.example.hotelbooking.common.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final BookingRepository bookingRepository;
    private final int cancellationWindowHours;

    public AdminService(
            BookingRepository bookingRepository,
            @Value("${app.business.cancellation-window-hours:24}") int cancellationWindowHours) {
        this.bookingRepository = bookingRepository;
        this.cancellationWindowHours = cancellationWindowHours;
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponseDto> getAllBookings(String status, Pageable pageable) {
        Page<Booking> page;
        if (StringUtils.hasText(status)) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase().trim());
            page = bookingRepository.findByStatus(bookingStatus, pageable);
        } else {
            page = bookingRepository.findAll(pageable);
        }
        return PagedResponse.from(page.map(b -> BookingResponseDto.from(b, cancellationWindowHours)));
    }

    @Transactional(readOnly = true)
    public BookingResponseDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return BookingResponseDto.from(booking, cancellationWindowHours);
    }

    @Transactional
    public BookingResponseDto updateBookingStatus(Long id, AdminBookingStatusUpdateDto request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        BookingStatus newStatus = BookingStatus.valueOf(request.getStatus().toUpperCase().trim());
        BookingStatus oldStatus = booking.getStatus();

        booking.setStatus(newStatus);
        if (newStatus == BookingStatus.CONFIRMED && booking.getConfirmedAt() == null) {
            booking.setConfirmedAt(Instant.now());
            booking.setHoldExpiresAt(null);
        } else if (newStatus == BookingStatus.CANCELLED && booking.getCancelledAt() == null) {
            booking.setCancelledAt(Instant.now());
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Admin updated booking ref={} status from {} to {} (notes={})",
                booking.getBookingReference(), oldStatus, newStatus, request.getNotes());

        return BookingResponseDto.from(saved, cancellationWindowHours);
    }
}
