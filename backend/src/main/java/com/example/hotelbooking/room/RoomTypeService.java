package com.example.hotelbooking.room;

import com.example.hotelbooking.common.ResourceNotFoundException;
import com.example.hotelbooking.hotel.Hotel;
import com.example.hotelbooking.hotel.HotelService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final HotelService hotelService;

    public RoomTypeService(RoomTypeRepository roomTypeRepository, HotelService hotelService) {
        this.roomTypeRepository = roomTypeRepository;
        this.hotelService = hotelService;
    }

    @Transactional(readOnly = true)
    public List<RoomTypeDto> getActiveRoomTypesByHotelId(Long hotelId) {
        return roomTypeRepository.findByHotelIdAndActiveTrue(hotelId)
                .stream()
                .map(RoomTypeDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoomTypeDto> getAllRoomTypesByHotelIdAdmin(Long hotelId) {
        return roomTypeRepository.findByHotelId(hotelId)
                .stream()
                .map(RoomTypeDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomTypeDto getRoomTypeById(Long id) {
        RoomType roomType = roomTypeRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with id: " + id));
        return RoomTypeDto.from(roomType);
    }

    @Transactional(readOnly = true)
    public RoomType getRoomTypeEntity(Long id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with id: " + id));
    }

    @Transactional
    public RoomTypeDto createRoomType(Long hotelId, CreateRoomTypeRequestDto request) {
        Hotel hotel = hotelService.getHotelEntity(hotelId);
        RoomType roomType = new RoomType(
                hotel,
                request.getName().trim(),
                request.getDescription(),
                request.getMaxOccupancy(),
                request.getTotalRooms(),
                request.getPricePerNight(),
                request.getImageUrl(),
                request.getAmenities()
        );
        return RoomTypeDto.from(roomTypeRepository.save(roomType));
    }

    @Transactional
    public RoomTypeDto updateRoomType(Long id, UpdateRoomTypeRequestDto request) {
        RoomType roomType = getRoomTypeEntity(id);
        roomType.setName(request.getName().trim());
        roomType.setDescription(request.getDescription());
        roomType.setMaxOccupancy(request.getMaxOccupancy());
        roomType.setTotalRooms(request.getTotalRooms());
        roomType.setPricePerNight(request.getPricePerNight());
        roomType.setImageUrl(request.getImageUrl());
        roomType.setAmenities(request.getAmenities());
        if (request.getActive() != null) {
            roomType.setActive(request.getActive());
        }
        return RoomTypeDto.from(roomTypeRepository.save(roomType));
    }

    @Transactional
    public RoomTypeDto toggleRoomTypeStatus(Long id, boolean active) {
        RoomType roomType = getRoomTypeEntity(id);
        roomType.setActive(active);
        return RoomTypeDto.from(roomTypeRepository.save(roomType));
    }
}
