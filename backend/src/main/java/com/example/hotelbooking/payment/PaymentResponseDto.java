package com.example.hotelbooking.payment;

import com.example.hotelbooking.booking.BookingStatus;
import java.math.BigDecimal;
import java.time.Instant;

public class PaymentResponseDto {
    private String paymentReference;
    private Long bookingId;
    private String bookingReference;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus paymentStatus;
    private BookingStatus bookingStatus;
    private Instant completedAt;
    private String message;

    public PaymentResponseDto() {}

    public PaymentResponseDto(String paymentReference, Long bookingId, String bookingReference,
                              BigDecimal amount, String currency, PaymentStatus paymentStatus,
                              BookingStatus bookingStatus, Instant completedAt, String message) {
        this.paymentReference = paymentReference;
        this.bookingId = bookingId;
        this.bookingReference = bookingReference;
        this.amount = amount;
        this.currency = currency;
        this.paymentStatus = paymentStatus;
        this.bookingStatus = bookingStatus;
        this.completedAt = completedAt;
        this.message = message;
    }

    public static PaymentResponseDto from(Payment payment, String message) {
        return new PaymentResponseDto(
                payment.getPaymentReference(),
                payment.getBooking().getId(),
                payment.getBooking().getBookingReference(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getBooking().getStatus(),
                payment.getCompletedAt(),
                message
        );
    }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
