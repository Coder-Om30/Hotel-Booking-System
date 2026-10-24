package com.example.hotelbooking.booking;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class BookingResponseDto {
    private Long id;
    private String bookingReference;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private Long hotelId;
    private String hotelName;
    private String hotelCity;
    private String hotelImageUrl;
    private Long roomTypeId;
    private String roomTypeName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int roomCount;
    private int guestCount;
    private int nightCount;
    private BigDecimal pricePerNight;
    private BigDecimal totalAmount;
    private String currency;
    private BookingStatus status;
    private Instant holdExpiresAt;
    private Instant createdAt;
    private Instant confirmedAt;
    private Instant cancelledAt;
    private boolean cancellable;

    public BookingResponseDto() {}

    public static BookingResponseDto from(Booking booking, int cancellationWindowHours) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());
        dto.setUserId(booking.getUser().getId());
        dto.setCustomerName(booking.getUser().getFullName());
        dto.setCustomerEmail(booking.getUser().getEmail());

        if (booking.getRoomType() != null) {
            dto.setRoomTypeId(booking.getRoomType().getId());
            dto.setRoomTypeName(booking.getRoomType().getName());
            if (booking.getRoomType().getHotel() != null) {
                dto.setHotelId(booking.getRoomType().getHotel().getId());
                dto.setHotelName(booking.getRoomType().getHotel().getName());
                dto.setHotelCity(booking.getRoomType().getHotel().getCity());
                dto.setHotelImageUrl(booking.getRoomType().getHotel().getImageUrl());
            }
        }

        dto.setCheckIn(booking.getCheckIn());
        dto.setCheckOut(booking.getCheckOut());
        dto.setRoomCount(booking.getRoomCount());
        dto.setGuestCount(booking.getGuestCount());
        dto.setNightCount(booking.getNightCount());
        dto.setPricePerNight(booking.getPricePerNight());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setCurrency(booking.getCurrency());
        dto.setStatus(booking.getStatus());
        dto.setHoldExpiresAt(booking.getHoldExpiresAt());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setConfirmedAt(booking.getConfirmedAt());
        dto.setCancelledAt(booking.getCancelledAt());

        // Cancellable if CONFIRMED or PENDING_PAYMENT, and check-in date is at least cancellationWindowHours in the future
        boolean isEligibleStatus = booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PENDING_PAYMENT;
        LocalDate minCancellationDate = LocalDate.now().plusDays(Math.max(1, cancellationWindowHours / 24));
        dto.setCancellable(isEligibleStatus && !booking.getCheckIn().isBefore(minCancellationDate));

        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getHotelCity() { return hotelCity; }
    public void setHotelCity(String hotelCity) { this.hotelCity = hotelCity; }

    public String getHotelImageUrl() { return hotelImageUrl; }
    public void setHotelImageUrl(String hotelImageUrl) { this.hotelImageUrl = hotelImageUrl; }

    public Long getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(Long roomTypeId) { this.roomTypeId = roomTypeId; }

    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }

    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }

    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }

    public int getRoomCount() { return roomCount; }
    public void setRoomCount(int roomCount) { this.roomCount = roomCount; }

    public int getGuestCount() { return guestCount; }
    public void setGuestCount(int guestCount) { this.guestCount = guestCount; }

    public int getNightCount() { return nightCount; }
    public void setNightCount(int nightCount) { this.nightCount = nightCount; }

    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public Instant getHoldExpiresAt() { return holdExpiresAt; }
    public void setHoldExpiresAt(Instant holdExpiresAt) { this.holdExpiresAt = holdExpiresAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(Instant confirmedAt) { this.confirmedAt = confirmedAt; }

    public Instant getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Instant cancelledAt) { this.cancelledAt = cancelledAt; }

    public boolean isCancellable() { return cancellable; }
    public void setCancellable(boolean cancellable) { this.cancellable = cancellable; }
}
