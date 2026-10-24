package com.example.hotelbooking.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class AdminBookingStatusUpdateDto {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(CONFIRMED|CANCELLED|EXPIRED|PAYMENT_FAILED)$",
             message = "Status must be CONFIRMED, CANCELLED, EXPIRED, or PAYMENT_FAILED")
    private String status;

    private String notes;

    public AdminBookingStatusUpdateDto() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
