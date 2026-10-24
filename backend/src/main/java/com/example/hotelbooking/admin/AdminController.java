package com.example.hotelbooking.admin;

import com.example.hotelbooking.booking.BookingResponseDto;
import com.example.hotelbooking.common.PagedResponse;
import com.example.hotelbooking.hotel.*;
import com.example.hotelbooking.room.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final HotelService hotelService;
    private final RoomTypeService roomTypeService;
    private final AdminService adminService;

    public AdminController(HotelService hotelService, RoomTypeService roomTypeService, AdminService adminService) {
        this.hotelService = hotelService;
        this.roomTypeService = roomTypeService;
        this.adminService = adminService;
    }

    // Hotel Management
    @GetMapping("/hotels")
    public ResponseEntity<PagedResponse<HotelDto>> getAllHotels(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(hotelService.getAllHotelsAdmin(pageable));
    }

    @PostMapping("/hotels")
    public ResponseEntity<HotelDto> createHotel(@Valid @RequestBody CreateHotelRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.createHotel(request));
    }

    @PutMapping("/hotels/{hotelId}")
    public ResponseEntity<HotelDto> updateHotel(
            @PathVariable Long hotelId,
            @Valid @RequestBody UpdateHotelRequestDto request) {
        return ResponseEntity.ok(hotelService.updateHotel(hotelId, request));
    }

    @PatchMapping("/hotels/{hotelId}/status")
    public ResponseEntity<HotelDto> toggleHotelStatus(
            @PathVariable Long hotelId,
            @RequestParam boolean active) {
        return ResponseEntity.ok(hotelService.toggleHotelStatus(hotelId, active));
    }

    // Room Type Management
    @GetMapping("/hotels/{hotelId}/room-types")
    public ResponseEntity<List<RoomTypeDto>> getHotelRoomTypes(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomTypeService.getAllRoomTypesByHotelIdAdmin(hotelId));
    }

    @PostMapping("/hotels/{hotelId}/room-types")
    public ResponseEntity<RoomTypeDto> createRoomType(
            @PathVariable Long hotelId,
            @Valid @RequestBody CreateRoomTypeRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomTypeService.createRoomType(hotelId, request));
    }

    @PutMapping("/room-types/{roomTypeId}")
    public ResponseEntity<RoomTypeDto> updateRoomType(
            @PathVariable Long roomTypeId,
            @Valid @RequestBody UpdateRoomTypeRequestDto request) {
        return ResponseEntity.ok(roomTypeService.updateRoomType(roomTypeId, request));
    }

    @PatchMapping("/room-types/{roomTypeId}/status")
    public ResponseEntity<RoomTypeDto> toggleRoomTypeStatus(
            @PathVariable Long roomTypeId,
            @RequestParam boolean active) {
        return ResponseEntity.ok(roomTypeService.toggleRoomTypeStatus(roomTypeId, active));
    }

    // Reservation Management
    @GetMapping("/bookings")
    public ResponseEntity<PagedResponse<BookingResponseDto>> getAllBookings(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllBookings(status, pageable));
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<BookingResponseDto> getBookingDetails(@PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.getBookingById(bookingId));
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public ResponseEntity<BookingResponseDto> updateBookingStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody AdminBookingStatusUpdateDto request) {
        return ResponseEntity.ok(adminService.updateBookingStatus(bookingId, request));
    }
}
