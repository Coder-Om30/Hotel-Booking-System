package com.example.hotelbooking.hotel;

import com.example.hotelbooking.common.PagedResponse;
import com.example.hotelbooking.common.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<HotelDto> searchHotels(String destination, Pageable pageable) {
        Page<Hotel> page;
        if (StringUtils.hasText(destination)) {
            page = hotelRepository.searchActiveHotels(destination.trim(), pageable);
        } else {
            page = hotelRepository.findByActiveTrue(pageable);
        }
        return PagedResponse.from(page.map(HotelDto::from));
    }

    @Transactional(readOnly = true)
    public PagedResponse<HotelDto> getAllHotelsAdmin(Pageable pageable) {
        Page<Hotel> page = hotelRepository.findAll(pageable);
        return PagedResponse.from(page.map(HotelDto::from));
    }

    @Transactional(readOnly = true)
    public HotelDto getHotelById(Long id) {
        Hotel hotel = hotelRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return HotelDto.from(hotel);
    }

    @Transactional(readOnly = true)
    public Hotel getHotelEntity(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
    }

    @Transactional
    public HotelDto createHotel(CreateHotelRequestDto request) {
        Hotel hotel = new Hotel(
                request.getName().trim(),
                request.getDescription(),
                request.getAddressLine(),
                request.getCity().trim(),
                request.getStateRegion(),
                request.getCountry().trim(),
                request.getPostalCode(),
                request.getImageUrl(),
                request.getStarRating()
        );
        return HotelDto.from(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelDto updateHotel(Long id, UpdateHotelRequestDto request) {
        Hotel hotel = getHotelEntity(id);
        hotel.setName(request.getName().trim());
        hotel.setDescription(request.getDescription());
        hotel.setAddressLine(request.getAddressLine());
        hotel.setCity(request.getCity().trim());
        hotel.setStateRegion(request.getStateRegion());
        hotel.setCountry(request.getCountry().trim());
        hotel.setPostalCode(request.getPostalCode());
        hotel.setImageUrl(request.getImageUrl());
        if (request.getStarRating() != null) {
            hotel.setStarRating(request.getStarRating());
        }
        if (request.getActive() != null) {
            hotel.setActive(request.getActive());
        }
        return HotelDto.from(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelDto toggleHotelStatus(Long id, boolean active) {
        Hotel hotel = getHotelEntity(id);
        hotel.setActive(active);
        return HotelDto.from(hotelRepository.save(hotel));
    }
}
