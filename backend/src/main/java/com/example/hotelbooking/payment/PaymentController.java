package com.example.hotelbooking.payment;

import com.example.hotelbooking.user.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings/{bookingId}/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/mock")
    public ResponseEntity<PaymentResponseDto> processMockPayment(
            @AuthenticationPrincipal User principal,
            @PathVariable Long bookingId,
            @Valid @RequestBody MockPaymentRequestDto request) {
        PaymentResponseDto response = paymentService.processMockPayment(principal, bookingId, request);
        return ResponseEntity.ok(response);
    }
}
