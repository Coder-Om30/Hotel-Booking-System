package com.example.hotelbooking.availability;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AvailabilityResponseDto {
    private Long roomTypeId;
    private Long hotelId;
    private String roomTypeName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private long nightCount;
    private int requestedRooms;
    private int totalInventory;
    private int occupiedRooms;
    private int availableRooms;
    private boolean available;
    private BigDecimal pricePerNight;
    private BigDecimal estimatedTotalPrice;
    private String currency;

    public AvailabilityResponseDto() {}

    public Long getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(Long roomTypeId) { this.roomTypeId = roomTypeId; }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }

    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }

    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }

    public long getNightCount() { return nightCount; }
    public void setNightCount(long nightCount) { this.nightCount = nightCount; }

    public int getRequestedRooms() { return requestedRooms; }
    public void setRequestedRooms(int requestedRooms) { this.requestedRooms = requestedRooms; }

    public int getTotalInventory() { return totalInventory; }
    public void setTotalInventory(int totalInventory) { this.totalInventory = totalInventory; }

    public int getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(int occupiedRooms) { this.occupiedRooms = occupiedRooms; }

    public int getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(int availableRooms) { this.availableRooms = availableRooms; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }

    public BigDecimal getEstimatedTotalPrice() { return estimatedTotalPrice; }
    public void setEstimatedTotalPrice(BigDecimal estimatedTotalPrice) { this.estimatedTotalPrice = estimatedTotalPrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
