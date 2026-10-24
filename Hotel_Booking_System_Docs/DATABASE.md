# Database Design
## Hotel Booking System

## 1. Database principles
- MySQL with InnoDB.
- Flyway owns schema evolution.
- Use `BIGINT` surrogate primary keys unless the established project already uses UUIDs.
- Use `DECIMAL(12,2)` for money; never floating-point types.
- Use `DATE` for check-in/check-out and `TIMESTAMP`/`DATETIME` consistently for event times (store event timestamps in UTC).
- Add foreign keys, appropriate unique constraints, and indexes.
- Do not delete historical bookings when hotels or room types are deactivated.

## 2. Core tables
### `users`
- `id` BIGINT PK
- `full_name` VARCHAR(120) NOT NULL
- `email` VARCHAR(254) NOT NULL; store normalized lowercase email
- `password_hash` VARCHAR(255) NOT NULL
- `role` VARCHAR(20) NOT NULL (`CUSTOMER`, `ADMIN`)
- `enabled` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at`, `updated_at`
- Unique index on normalized email.
- Public registration always creates `CUSTOMER`; never accept role from registration payload.

### `hotels`
- `id` BIGINT PK
- `name` VARCHAR(180) NOT NULL
- `description` TEXT
- `address_line`, `city`, `state_region`, `country`, `postal_code`
- `active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at`, `updated_at`
- Indexes for active state and common destination fields.

### `room_types`
- `id` BIGINT PK
- `hotel_id` FK to hotels
- `name` VARCHAR(120) NOT NULL
- `description` TEXT
- `max_occupancy` INT NOT NULL
- `total_rooms` INT NOT NULL
- `price_per_night` DECIMAL(12,2) NOT NULL
- `active` BOOLEAN NOT NULL DEFAULT TRUE
- `version` BIGINT for optimistic locking if selected
- `created_at`, `updated_at`
- Check constraints for positive occupancy, nonnegative inventory, and nonnegative rate where supported.
- Index on `(hotel_id, active)`.

### `bookings`
- `id` BIGINT PK
- `booking_reference` VARCHAR(32) NOT NULL UNIQUE
- `user_id` FK to users
- `room_type_id` FK to room_types
- `check_in` DATE NOT NULL
- `check_out` DATE NOT NULL
- `room_count` INT NOT NULL
- `guest_count` INT NOT NULL
- `night_count` INT NOT NULL
- `price_per_night` DECIMAL(12,2) NOT NULL (price snapshot)
- `total_amount` DECIMAL(12,2) NOT NULL (price snapshot)
- `currency` CHAR(3) NOT NULL
- `status` VARCHAR(24) NOT NULL (`PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `PAYMENT_FAILED`, `EXPIRED`)
- `created_at`, `updated_at`, `confirmed_at`, `cancelled_at`
- Indexes on `(user_id, created_at)`, `(room_type_id, check_in, check_out)`, and status where useful.
- Check constraints: `check_out > check_in`, room/guest/night counts positive.

### `payments`
- `id` BIGINT PK
- `booking_id` FK to bookings
- `provider` VARCHAR(20) NOT NULL (`MOCK`)
- `payment_reference` VARCHAR(64) NOT NULL UNIQUE
- `amount` DECIMAL(12,2) NOT NULL
- `currency` CHAR(3) NOT NULL
- `status` VARCHAR(20) NOT NULL (`INITIATED`, `SUCCEEDED`, `FAILED`, `CANCELLED`)
- `idempotency_key` VARCHAR(100) NOT NULL UNIQUE (or unique scoped key)
- `created_at`, `updated_at`, `completed_at`
- Do not store card numbers, CVV, bank credentials, or payment secrets.

## 3. Inventory model decision
For the initial scope, `room_types.total_rooms` represents physical inventory and booking overlap determines committed usage. For a given room type and date interval, a booking overlaps when:
`existing.check_in < requested.check_out AND existing.check_out > requested.check_in`
Count only inventory-consuming statuses (`PENDING_PAYMENT` while its hold is valid, and `CONFIRMED`). Expired/cancelled/failed bookings must not consume inventory.

A naive availability query is not enough to protect against concurrent bookings. Implement a transactional strategy, such as locking the room-type row with `SELECT ... FOR UPDATE`, then computing overlap and inserting the pending booking before releasing the lock. Every booking path must acquire the same lock. Add a timeout/expiry policy for pending-payment holds. If using a per-date inventory table instead, document the migration and invariants explicitly.

## 4. Relationships
- One user has many bookings.
- One hotel has many room types.
- One room type has many bookings.
- One booking has one or more payment attempts, depending on the selected model. If the implementation only permits one mock attempt, enforce it clearly; otherwise use idempotent payment attempts with unique references.

## 5. Migrations
Suggested Flyway files:
- `V1__create_users.sql`
- `V2__create_hotels.sql`
- `V3__create_room_types.sql`
- `V4__create_bookings.sql`
- `V5__create_payments.sql`
- `V6__add_indexes_and_constraints.sql` (if not included with table creation)
- Optional later migration for refresh-token revocation, audit events, or room inventory calendar.

Never edit an already-applied migration; add a new versioned migration.
