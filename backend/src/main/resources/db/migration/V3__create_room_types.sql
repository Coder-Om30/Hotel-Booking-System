CREATE TABLE room_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    max_occupancy INT NOT NULL,
    total_rooms INT NOT NULL,
    price_per_night DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500),
    amenities VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_types_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    CONSTRAINT chk_room_occupancy CHECK (max_occupancy > 0),
    CONSTRAINT chk_room_total CHECK (total_rooms >= 0),
    CONSTRAINT chk_room_price CHECK (price_per_night >= 0.00)
);

CREATE INDEX idx_room_types_hotel_active ON room_types(hotel_id, active);
