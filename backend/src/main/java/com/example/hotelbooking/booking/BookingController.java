package com.example.hotelbooking.booking;

import com.example.hotelbooking.common.PagedResponse;
import com.example.hotelbooking.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponseDto> createBooking(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody CreateBookingRequestDto request) {
        BookingResponseDto response = bookingService.createBookingHold(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<PagedResponse<BookingResponseDto>> getMyBookings(
            @AuthenticationPrincipal User principal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDto> getBookingById(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(principal, id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDto> cancelBooking(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(principal, id));
    }
}
