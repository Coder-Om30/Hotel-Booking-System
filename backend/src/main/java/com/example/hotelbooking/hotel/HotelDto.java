package com.example.hotelbooking.hotel;

public class HotelDto {
    private Long id;
    private String name;
    private String description;
    private String addressLine;
    private String city;
    private String stateRegion;
    private String country;
    private String postalCode;
    private String imageUrl;
    private Integer starRating;
    private boolean active;

    public HotelDto() {}

    public HotelDto(Long id, String name, String description, String addressLine, String city,
                    String stateRegion, String country, String postalCode, String imageUrl,
                    Integer starRating, boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.addressLine = addressLine;
        this.city = city;
        this.stateRegion = stateRegion;
        this.country = country;
        this.postalCode = postalCode;
        this.imageUrl = imageUrl;
        this.starRating = starRating;
        this.active = active;
    }

    public static HotelDto from(Hotel hotel) {
        return new HotelDto(
                hotel.getId(),
                hotel.getName(),
                hotel.getDescription(),
                hotel.getAddressLine(),
                hotel.getCity(),
                hotel.getStateRegion(),
                hotel.getCountry(),
                hotel.getPostalCode(),
                hotel.getImageUrl(),
                hotel.getStarRating(),
                hotel.isActive()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStateRegion() { return stateRegion; }
    public void setStateRegion(String stateRegion) { this.stateRegion = stateRegion; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getStarRating() { return starRating; }
    public void setStarRating(Integer starRating) { this.starRating = starRating; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
