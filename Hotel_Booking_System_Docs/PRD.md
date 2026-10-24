# Product Requirements Document (PRD)
## Hotel Booking System

**Status:** Approved baseline  
**Version:** 1.0  
**Technology decisions:** React, Java, Spring Boot, MySQL, JWT authentication, mock payments

## 1. Product summary
Build a responsive web application that lets customers discover hotels, inspect room options and availability, create and manage reservations, and view booking history. Administrators manage hotel information, room inventory, rates, and reservations.

This is an educational portfolio project. Payment is simulated; the application must never collect or store real card details.

## 2. Problem and value proposition
Travelers need a clear way to find accommodation and reserve rooms without contacting each property manually. Hotel staff need a central place to maintain listings and monitor reservations.

**Value proposition:** a straightforward booking journey with date-aware availability, transparent prices, authenticated booking management, and role-protected administration.

## 3. Target users
- **Guest visitor:** browses hotels and room information without an account.
- **Customer:** registers, logs in, books rooms, views bookings, and cancels eligible bookings.
- **Administrator:** manages hotels, room types/inventory, pricing, and reservations.
- **Developer/operator:** configures the application, database, JWT secrets, and environment.

## 4. Goals and success criteria
- A customer can search by destination and dates, inspect availability, and complete a mock-payment booking.
- The system does not confirm more rooms than are available.
- Customers can access only their own bookings.
- Administrative APIs require an administrator role.
- Invalid input returns consistent, useful validation errors.
- Database schema changes are versioned and repeatable.
- Core flows have automated tests and setup instructions.

## 5. Out of scope for the initial release
- Real payment processing or card storage.
- Airline/third-party travel integrations.
- Loyalty programs, coupons, reviews, chat, multi-currency conversion, and complex tax rules.
- Native mobile apps.
- Production-grade multi-region deployment.

## 6. Core user journeys
### 6.1 Discover hotels
1. Visitor opens the home/search page.
2. Enters destination, check-in date, check-out date, and guest/room count.
3. Sees matching hotels and available room types.
4. Opens a hotel detail page and reviews room details and total estimated price.

### 6.2 Register and sign in
1. User registers with name, email, and password.
2. Backend validates input and stores a password hash using a supported password encoder.
3. User logs in and receives a short-lived access JWT.
4. React sends the token as `Authorization: Bearer <token>` for protected API requests.
5. User can log out by clearing client-held token state/storage according to the approved token-storage design.

### 6.3 Book a room
1. Authenticated customer selects dates, room type, and quantity.
2. Backend validates dates, occupancy, price, and live availability.
3. Backend creates a pending booking and reserves inventory transactionally.
4. Customer confirms the mock payment.
5. Backend marks the mock payment successful and confirms the booking atomically.
6. Customer sees a booking reference and confirmation details.

### 6.4 View or cancel a booking
1. Customer opens “My Bookings”.
2. Backend returns only bookings owned by the authenticated customer.
3. Customer requests cancellation for an eligible booking.
4. Backend checks ownership, status, and cancellation policy, then updates status and releases inventory exactly once.

### 6.5 Administer the catalog
1. Administrator signs in through the same authentication system.
2. Admin creates or updates hotel, room type, rate, and inventory data.
3. Admin views and manages reservations.
4. All admin operations are authorized on the server, not merely hidden in the UI.

## 7. Functional requirements
### Accounts and access
- FR-01: Register with name, email, and password.
- FR-02: Reject duplicate normalized email addresses.
- FR-03: Authenticate credentials and issue a signed JWT with subject, expiry, and appropriate claims.
- FR-04: Protect customer endpoints and enforce ownership.
- FR-05: Protect admin endpoints using a server-enforced `ADMIN` role.
- FR-06: Do not expose public admin registration or allow users to self-assign roles.
- FR-07: Passwords must be stored only as strong one-way hashes.

### Hotel catalog
- FR-08: Browse and search active hotels.
- FR-09: View hotel description, location, amenities, photos/placeholder images, room types, occupancy limits, and base rates.
- FR-10: Admins can create, update, deactivate, and inspect hotel listings.
- FR-11: Admins can manage room types, inventory, occupancy limits, and prices.

### Availability and bookings
- FR-12: Search availability for valid check-in/check-out dates and requested room count.
- FR-13: Check-out must be after check-in; past check-in dates are rejected according to the configured business timezone.
- FR-14: Prices are calculated on the server using `BigDecimal`/decimal database columns.
- FR-15: Create bookings in a transaction with locking/atomic inventory control.
- FR-16: Prevent overselling under concurrent requests.
- FR-17: Generate a unique, non-guessable or safely unique booking reference.
- FR-18: Customers can view their own bookings and booking details.
- FR-19: Customers can cancel eligible bookings; cancellation releases inventory once.
- FR-20: Admins can view and update reservation status through explicit allowed transitions.

### Mock payment
- FR-21: Display a clearly labelled simulated payment step.
- FR-22: Record mock payment outcome and reference; never collect card number, CVV, or real payment credentials.
- FR-23: Confirm booking only after the mock payment succeeds.
- FR-24: Failed/cancelled mock payment must leave the booking in a safe state and release or expire held inventory according to the implementation plan.
- FR-25: Payment confirmation must be idempotent; repeating the same request cannot charge or confirm twice.

### Quality and operations
- FR-26: Provide consistent API errors and field-level validation.
- FR-27: Include database migrations and seed/demo data instructions.
- FR-28: Include unit and integration tests for authorization, booking, payment, cancellation, and concurrency-sensitive logic.
- FR-29: Provide environment-based configuration and safe example environment files.

## 8. Non-functional requirements
- **Security:** validate inputs, hash passwords, sign and verify JWTs, set expiry, avoid logging tokens/passwords, enforce authorization on every protected API.
- **Correctness:** transactional booking and cancellation; idempotent payment finalization; no negative inventory.
- **Performance:** paginate admin and booking lists; avoid unbounded queries; index common search and foreign-key columns.
- **Reliability:** clear error responses; rollback partial failures; database constraints for key invariants.
- **Maintainability:** modular monolith, feature-oriented packages, DTOs, service layer, migrations, automated tests.
- **Accessibility:** semantic React UI, labels, keyboard navigation, visible focus, readable errors.
- **Observability:** structured application logs with request correlation where practical; never log secrets or sensitive credentials.
- **Compatibility:** document supported Java, Node, and MySQL versions in the repository setup guide.

## 9. Pages and screens
### Public
- Home/search page
- Search results with filters and pagination
- Hotel details and room availability
- Register
- Login
- Not found / generic error

### Customer
- Checkout / booking review
- Mock payment result
- Booking confirmation
- My bookings
- Booking details / cancellation confirmation
- Profile (minimal account details)

### Admin
- Admin dashboard
- Hotel list/create/edit
- Room types and inventory management
- Pricing management
- Reservations list/details/status management
- Access denied page

## 10. Roles and permissions
| Capability | Guest | Customer | Admin |
|---|---:|---:|---:|
| Browse/search hotels | Yes | Yes | Yes |
| View hotel and room details | Yes | Yes | Yes |
| Register/login | Yes | Yes | Yes |
| Create a booking | No | Yes | If explicitly allowed by business rules; default no |
| View own bookings | No | Yes | Admin reservation view, audited |
| Cancel own booking | No | Yes | Admin cancellation only through admin workflow |
| Manage hotel/room/pricing data | No | No | Yes |
| View/manage all reservations | No | No | Yes |
| Assign roles | No | No | Restricted bootstrap/operations only; not public self-service |

## 11. Acceptance criteria
- A guest can search and view hotel details.
- A customer can register, log in, book with mock payment, view their own reservation, and cancel when eligible.
- Another customer cannot read, cancel, or modify the first customer's booking by changing an ID.
- A normal customer receives `403 Forbidden` for admin operations.
- Two concurrent attempts cannot reserve the same final room inventory.
- Mock payment retry does not duplicate confirmation or inventory changes.
- Validation errors are predictable and documented.
- A clean checkout can run the application using documented steps and migrations.
