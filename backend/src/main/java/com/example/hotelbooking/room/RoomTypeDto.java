package com.example.hotelbooking.room;

import java.math.BigDecimal;

public class RoomTypeDto {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String name;
    private String description;
    private int maxOccupancy;
    private int totalRooms;
    private BigDecimal pricePerNight;
    private String imageUrl;
    private String amenities;
    private boolean active;

    public RoomTypeDto() {}

    public RoomTypeDto(Long id, Long hotelId, String hotelName, String name, String description,
                       int maxOccupancy, int totalRooms, BigDecimal pricePerNight, String imageUrl,
                       String amenities, boolean active) {
        this.id = id;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.name = name;
        this.description = description;
        this.maxOccupancy = maxOccupancy;
        this.totalRooms = totalRooms;
        this.pricePerNight = pricePerNight;
        this.imageUrl = imageUrl;
        this.amenities = amenities;
        this.active = active;
    }

    public static RoomTypeDto from(RoomType roomType) {
        return new RoomTypeDto(
                roomType.getId(),
                roomType.getHotel().getId(),
                roomType.getHotel().getName(),
                roomType.getName(),
                roomType.getDescription(),
                roomType.getMaxOccupancy(),
                roomType.getTotalRooms(),
                roomType.getPricePerNight(),
                roomType.getImageUrl(),
                roomType.getAmenities(),
                roomType.isActive()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

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

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
