package com.example.hotelbooking.booking;

import com.example.hotelbooking.common.BadRequestException;
import com.example.hotelbooking.common.ConflictException;
import com.example.hotelbooking.common.ForbiddenException;
import com.example.hotelbooking.hotel.Hotel;
import com.example.hotelbooking.hotel.HotelRepository;
import com.example.hotelbooking.payment.MockPaymentRequestDto;
import com.example.hotelbooking.payment.PaymentResponseDto;
import com.example.hotelbooking.payment.PaymentService;
import com.example.hotelbooking.payment.PaymentStatus;
import com.example.hotelbooking.room.RoomType;
import com.example.hotelbooking.room.RoomTypeRepository;
import com.example.hotelbooking.user.Role;
import com.example.hotelbooking.user.User;
import com.example.hotelbooking.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class BookingServiceTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private User testUser;
    private RoomType testRoomType;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(new User(
                "Test Traveler",
                "traveler." + System.currentTimeMillis() + "@example.com",
                "hashedpwd",
                Role.CUSTOMER
        ));

        Hotel hotel = hotelRepository.save(new Hotel(
                "Test Luxury Hotel",
                "A charming test hotel",
                "123 Test St",
                "Goa",
                "Goa",
                "India",
                "403001",
                "https://example.com/img.jpg",
                5
        ));

        // Create a room type with strictly 2 total rooms to test inventory limits
        testRoomType = roomTypeRepository.save(new RoomType(
                hotel,
                "Limited Inventory Suite",
                "Only 2 rooms exist",
                2,
                2, // total rooms = 2
                BigDecimal.valueOf(5000.00),
                "https://example.com/suite.jpg",
                "WiFi, AC"
        ));
    }

    @Test
    @DisplayName("Create booking hold reserves inventory, and concurrent overselling is rejected")
    void testInventoryHoldAndOversellingRejection() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(7);

        // 1. First booking takes 1 room
        CreateBookingRequestDto req1 = new CreateBookingRequestDto();
        req1.setRoomTypeId(testRoomType.getId());
        req1.setCheckIn(checkIn);
        req1.setCheckOut(checkOut);
        req1.setRoomCount(1);
        req1.setGuestCount(2);

        BookingResponseDto booking1 = bookingService.createBookingHold(testUser, req1);
        assertNotNull(booking1.getBookingReference());
        assertEquals(BookingStatus.PENDING_PAYMENT, booking1.getStatus());
        assertEquals(0, new BigDecimal("10000.00").compareTo(booking1.getTotalAmount())); // 5000 * 1 * 2 nights

        // 2. Second booking takes 1 room (2 of 2 now reserved)
        CreateBookingRequestDto req2 = new CreateBookingRequestDto();
        req2.setRoomTypeId(testRoomType.getId());
        req2.setCheckIn(checkIn);
        req2.setCheckOut(checkOut);
        req2.setRoomCount(1);
        req2.setGuestCount(1);

        BookingResponseDto booking2 = bookingService.createBookingHold(testUser, req2);
        assertNotNull(booking2.getBookingReference());

        // 3. Third booking for the same dates must be REJECTED with ConflictException
        CreateBookingRequestDto req3 = new CreateBookingRequestDto();
        req3.setRoomTypeId(testRoomType.getId());
        req3.setCheckIn(checkIn);
        req3.setCheckOut(checkOut);
        req3.setRoomCount(1);
        req3.setGuestCount(1);

        assertThrows(ConflictException.class, () -> bookingService.createBookingHold(testUser, req3));

        // 4. Cancel booking1 -> inventory must be released
        BookingResponseDto cancelled = bookingService.cancelBooking(testUser, booking1.getId());
        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());

        // 5. Now req3 must succeed since 1 room was freed!
        BookingResponseDto booking3 = bookingService.createBookingHold(testUser, req3);
        assertNotNull(booking3.getBookingReference());
        assertEquals(BookingStatus.PENDING_PAYMENT, booking3.getStatus());
    }

    @Test
    @DisplayName("Mock payment confirms booking and is idempotent")
    void testMockPaymentSuccessAndIdempotency() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);

        CreateBookingRequestDto req = new CreateBookingRequestDto();
        req.setRoomTypeId(testRoomType.getId());
        req.setCheckIn(checkIn);
        req.setCheckOut(checkOut);
        req.setRoomCount(1);
        req.setGuestCount(2);

        BookingResponseDto booking = bookingService.createBookingHold(testUser, req);
        assertEquals(BookingStatus.PENDING_PAYMENT, booking.getStatus());

        // Process Mock Payment
        String idempotencyKey = "IDEM-" + System.currentTimeMillis();
        MockPaymentRequestDto paymentReq = new MockPaymentRequestDto(idempotencyKey, "SUCCESS");

        PaymentResponseDto paymentRes = paymentService.processMockPayment(testUser, booking.getId(), paymentReq);
        assertEquals(PaymentStatus.SUCCEEDED, paymentRes.getPaymentStatus());
        assertEquals(BookingStatus.CONFIRMED, paymentRes.getBookingStatus());

        // Repeat with identical idempotency key -> Must return same payment without error
        PaymentResponseDto duplicateRes = paymentService.processMockPayment(testUser, booking.getId(), paymentReq);
        assertEquals(paymentRes.getPaymentReference(), duplicateRes.getPaymentReference());
        assertEquals(PaymentStatus.SUCCEEDED, duplicateRes.getPaymentStatus());
    }

    @Test
    @DisplayName("Invalid inputs (past check-in, invalid checkout, exceeding capacity) are rejected")
    void testCreateBookingValidation() {
        // 1. Past check-in
        CreateBookingRequestDto pastReq = new CreateBookingRequestDto();
        pastReq.setRoomTypeId(testRoomType.getId());
        pastReq.setCheckIn(LocalDate.now().minusDays(1));
        pastReq.setCheckOut(LocalDate.now().plusDays(2));
        pastReq.setRoomCount(1);
        pastReq.setGuestCount(1);
        assertThrows(BadRequestException.class, () -> bookingService.createBookingHold(testUser, pastReq));

        // 2. Checkout on or before check-in
        CreateBookingRequestDto badDatesReq = new CreateBookingRequestDto();
        badDatesReq.setRoomTypeId(testRoomType.getId());
        badDatesReq.setCheckIn(LocalDate.now().plusDays(5));
        badDatesReq.setCheckOut(LocalDate.now().plusDays(5));
        badDatesReq.setRoomCount(1);
        badDatesReq.setGuestCount(1);
        assertThrows(BadRequestException.class, () -> bookingService.createBookingHold(testUser, badDatesReq));

        // 3. Exceeding room max occupancy (testRoomType has maxOccupancy = 2, 1 room requested for 5 guests)
        CreateBookingRequestDto overCapacityReq = new CreateBookingRequestDto();
        overCapacityReq.setRoomTypeId(testRoomType.getId());
        overCapacityReq.setCheckIn(LocalDate.now().plusDays(5));
        overCapacityReq.setCheckOut(LocalDate.now().plusDays(7));
        overCapacityReq.setRoomCount(1);
        overCapacityReq.setGuestCount(5);
        assertThrows(BadRequestException.class, () -> bookingService.createBookingHold(testUser, overCapacityReq));
    }

    @Test
    @DisplayName("Booking ownership is strictly enforced: other users cannot view, cancel, or pay")
    void testBookingOwnershipEnforcement() {
        User anotherUser = userRepository.save(new User(
                "Another User",
                "attacker." + System.currentTimeMillis() + "@example.com",
                "secret",
                Role.CUSTOMER
        ));

        CreateBookingRequestDto req = new CreateBookingRequestDto();
        req.setRoomTypeId(testRoomType.getId());
        req.setCheckIn(LocalDate.now().plusDays(20));
        req.setCheckOut(LocalDate.now().plusDays(22));
        req.setRoomCount(1);
        req.setGuestCount(2);

        BookingResponseDto booking = bookingService.createBookingHold(testUser, req);

        // Another user cannot view
        assertThrows(ForbiddenException.class, () -> bookingService.getBookingById(anotherUser, booking.getId()));

        // Another user cannot cancel
        assertThrows(ForbiddenException.class, () -> bookingService.cancelBooking(anotherUser, booking.getId()));

        // Another user cannot process payment
        MockPaymentRequestDto paymentReq = new MockPaymentRequestDto("ATTACK-KEY-" + System.currentTimeMillis(), "SUCCESS");
        assertThrows(ForbiddenException.class, () -> paymentService.processMockPayment(anotherUser, booking.getId(), paymentReq));
    }

    @Test
    @DisplayName("Mock payment simulation handles FAILURE and CANCEL safely")
    void testMockPaymentFailureAndCancel() {
        // Test FAILURE outcome
        CreateBookingRequestDto req1 = new CreateBookingRequestDto();
        req1.setRoomTypeId(testRoomType.getId());
        req1.setCheckIn(LocalDate.now().plusDays(25));
        req1.setCheckOut(LocalDate.now().plusDays(27));
        req1.setRoomCount(1);
        req1.setGuestCount(2);

        BookingResponseDto booking1 = bookingService.createBookingHold(testUser, req1);

        MockPaymentRequestDto failReq = new MockPaymentRequestDto("FAIL-KEY-" + System.currentTimeMillis(), "FAILURE");
        PaymentResponseDto failRes = paymentService.processMockPayment(testUser, booking1.getId(), failReq);
        assertEquals(PaymentStatus.FAILED, failRes.getPaymentStatus());
        assertEquals(BookingStatus.PAYMENT_FAILED, failRes.getBookingStatus());

        // Test CANCEL outcome
        CreateBookingRequestDto req2 = new CreateBookingRequestDto();
        req2.setRoomTypeId(testRoomType.getId());
        req2.setCheckIn(LocalDate.now().plusDays(28));
        req2.setCheckOut(LocalDate.now().plusDays(30));
        req2.setRoomCount(1);
        req2.setGuestCount(2);

        BookingResponseDto booking2 = bookingService.createBookingHold(testUser, req2);

        MockPaymentRequestDto cancelReq = new MockPaymentRequestDto("CANCEL-KEY-" + System.currentTimeMillis(), "CANCEL");
        PaymentResponseDto cancelRes = paymentService.processMockPayment(testUser, booking2.getId(), cancelReq);
        assertEquals(PaymentStatus.CANCELLED, cancelRes.getPaymentStatus());
        assertEquals(BookingStatus.CANCELLED, cancelRes.getBookingStatus());
    }

    @Test
    @DisplayName("Duplicate payment with different key on confirmed booking is rejected")
    void testDuplicatePaymentRejected() {
        CreateBookingRequestDto req = new CreateBookingRequestDto();
        req.setRoomTypeId(testRoomType.getId());
        req.setCheckIn(LocalDate.now().plusDays(35));
        req.setCheckOut(LocalDate.now().plusDays(37));
        req.setRoomCount(1);
        req.setGuestCount(2);

        BookingResponseDto booking = bookingService.createBookingHold(testUser, req);

        // First payment succeeds
        MockPaymentRequestDto req1 = new MockPaymentRequestDto("KEY-1-" + System.currentTimeMillis(), "SUCCESS");
        PaymentResponseDto res1 = paymentService.processMockPayment(testUser, booking.getId(), req1);
        assertEquals(BookingStatus.CONFIRMED, res1.getBookingStatus());

        // Second payment attempt with DIFFERENT key must throw ConflictException
        MockPaymentRequestDto req2 = new MockPaymentRequestDto("KEY-2-" + System.currentTimeMillis(), "SUCCESS");
        assertThrows(ConflictException.class, () -> paymentService.processMockPayment(testUser, booking.getId(), req2));
    }
}
