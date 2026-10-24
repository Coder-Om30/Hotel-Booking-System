package com.example.hotelbooking.hotel;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Page<Hotel> findByActiveTrue(Pageable pageable);

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND " +
           "(LOWER(h.city) LIKE LOWER(CONCAT('%', :destination, '%')) OR " +
           " LOWER(h.name) LIKE LOWER(CONCAT('%', :destination, '%')) OR " +
           " LOWER(h.stateRegion) LIKE LOWER(CONCAT('%', :destination, '%')))")
    Page<Hotel> searchActiveHotels(@Param("destination") String destination, Pageable pageable);

    Optional<Hotel> findByIdAndActiveTrue(Long id);
}
