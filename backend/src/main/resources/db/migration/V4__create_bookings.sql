CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(32) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    room_type_id BIGINT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    room_count INT NOT NULL,
    guest_count INT NOT NULL,
    night_count INT NOT NULL,
    price_per_night DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(24) NOT NULL,
    hold_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_room_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
    CONSTRAINT chk_booking_dates CHECK (check_out > check_in),
    CONSTRAINT chk_booking_room_count CHECK (room_count > 0),
    CONSTRAINT chk_booking_guest_count CHECK (guest_count > 0),
    CONSTRAINT chk_booking_night_count CHECK (night_count > 0),
    CONSTRAINT chk_booking_total CHECK (total_amount >= 0.00)
);

CREATE INDEX idx_bookings_user_created ON bookings(user_id, created_at);
CREATE INDEX idx_bookings_room_dates ON bookings(room_type_id, check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
