package com.example.hotelbooking.room;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CreateRoomTypeRequestDto {

    @NotBlank(message = "Room type name is required")
    @Size(max = 120, message = "Room type name cannot exceed 120 characters")
    private String name;

    private String description;

    @Min(value = 1, message = "Max occupancy must be at least 1")
    private int maxOccupancy = 2;

    @Min(value = 1, message = "Total rooms must be at least 1")
    private int totalRooms = 10;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.00", message = "Price per night must be non-negative")
    private BigDecimal pricePerNight;

    private String imageUrl;
    private String amenities;

    public CreateRoomTypeRequestDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getMaxOccupancy() { return maxOccupancy; }
    public void setMaxOccupancy(int maxOccupancy) { this.maxOccupancy = maxOccupancy; }

    public int getTotalRooms() { return totalRooms; }
    public void setTotalRooms(int totalRooms) { this.totalRooms = totalRooms; }

    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}
