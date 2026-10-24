package com.example.hotelbooking.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class MockPaymentRequestDto {

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;

    @NotBlank(message = "Simulation outcome is required")
    @Pattern(regexp = "^(SUCCESS|FAILURE|CANCEL)$", message = "Outcome must be SUCCESS, FAILURE, or CANCEL")
    private String outcome = "SUCCESS";

    public MockPaymentRequestDto() {}

    public MockPaymentRequestDto(String idempotencyKey, String outcome) {
        this.idempotencyKey = idempotencyKey;
        this.outcome = outcome;
    }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
}
