package com.example.hotelbooking.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(b.roomCount), 0) FROM Booking b " +
           "WHERE b.roomType.id = :roomTypeId " +
           "AND b.checkIn < :checkOut AND b.checkOut > :checkIn " +
           "AND (b.status = 'CONFIRMED' OR (b.status = 'PENDING_PAYMENT' AND b.holdExpiresAt > :now))")
    int countOccupiedRooms(
            @Param("roomTypeId") Long roomTypeId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("now") Instant now);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING_PAYMENT' AND b.holdExpiresAt <= :now")
    List<Booking> findExpiredHolds(@Param("now") Instant now);
}
