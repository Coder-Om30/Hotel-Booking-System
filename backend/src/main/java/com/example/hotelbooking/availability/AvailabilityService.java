package com.example.hotelbooking.availability;

import com.example.hotelbooking.booking.BookingRepository;
import com.example.hotelbooking.common.BadRequestException;
import com.example.hotelbooking.common.ResourceNotFoundException;
import com.example.hotelbooking.room.RoomType;
import com.example.hotelbooking.room.RoomTypeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class AvailabilityService {

    private final RoomTypeRepository roomTypeRepository;
    private final BookingRepository bookingRepository;
    private final String currency;

    public AvailabilityService(
            RoomTypeRepository roomTypeRepository,
            BookingRepository bookingRepository,
            @Value("${app.business.currency:INR}") String currency) {
        this.roomTypeRepository = roomTypeRepository;
        this.bookingRepository = bookingRepository;
        this.currency = currency;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponseDto checkAvailability(Long roomTypeId, LocalDate checkIn, LocalDate checkOut, int requestedRooms) {
        if (checkIn.isBefore(LocalDate.now())) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }
        if (requestedRooms <= 0) {
            throw new BadRequestException("Requested rooms count must be at least 1");
        }

        RoomType roomType = roomTypeRepository.findByIdAndActiveTrue(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Active room type not found with id: " + roomTypeId));

        int occupiedRooms = bookingRepository.countOccupiedRooms(roomTypeId, checkIn, checkOut, Instant.now());
        int totalInventory = roomType.getTotalRooms();
        int availableRooms = Math.max(0, totalInventory - occupiedRooms);
        boolean isAvailable = availableRooms >= requestedRooms;

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal totalPrice = roomType.getPricePerNight().multiply(BigDecimal.valueOf(requestedRooms * nights));

        AvailabilityResponseDto dto = new AvailabilityResponseDto();
        dto.setRoomTypeId(roomType.getId());
        dto.setHotelId(roomType.getHotel().getId());
        dto.setRoomTypeName(roomType.getName());
        dto.setCheckIn(checkIn);
        dto.setCheckOut(checkOut);
        dto.setNightCount(nights);
        dto.setRequestedRooms(requestedRooms);
        dto.setTotalInventory(totalInventory);
        dto.setOccupiedRooms(occupiedRooms);
        dto.setAvailableRooms(availableRooms);
        dto.setAvailable(isAvailable);
        dto.setPricePerNight(roomType.getPricePerNight());
        dto.setEstimatedTotalPrice(totalPrice);
        dto.setCurrency(currency);

        return dto;
    }
}
