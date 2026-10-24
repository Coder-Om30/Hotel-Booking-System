# AuraStay — Enterprise Hotel Booking System

A full-stack, enterprise-grade hotel reservation web application engineered with **Java 21 / Spring Boot 3.3.4**, **MySQL 8.0**, **Flyway**, **JJWT**, and **React 19 with TypeScript & Vite**.

Built strictly in accordance with the specifications in `Hotel_Booking_System_Docs` (`PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `DESIGN.md`, and `AGENTS.md`).

---

## 🌟 Key Capabilities & Architectural Invariants

- **Row-Level Concurrency Control:** Prevents overselling under concurrent booking attempts via pessimistic write locks (`SELECT ... FOR UPDATE`) and overlapping date query boundaries within `@Transactional` isolation.
- **15-Minute Inventory Hold Expiry:** Reserves rooms in `PENDING_PAYMENT` state with automatic expiration via scheduled background task if payment is abandoned.
- **Price Snapshotting:** Nightly room rates and totals are snapshotted permanently into booking records using `BigDecimal` (`DECIMAL(12,2)`) to ensure historical booking records remain invariant to future catalog price changes.
- **24-Hour Free Cancellation Policy:** Customers can cancel eligible confirmed reservations up to 24 hours prior to check-in date; cancellation atomically releases room inventory exactly once.
- **Simulated Mock Payment Engine:** Idempotent payment processing supporting simulation outcomes (`SUCCESS`, `FAILURE`, `CANCEL`) without collecting or storing real payment credentials or credit card data.
- **Role-Based Security & Server Enforcement:** Spring Security filter chain with stateless HMAC-SHA256 JWT bearer access tokens. Registration strictly enforces `CUSTOMER` assignment; `ADMIN` endpoints are guarded by server-side method and URL security.
- **Database Schema Evolution:** Version-controlled database migrations via Flyway (`V1` to `V6`) with comprehensive indexes and constraints.
- **Luxury Hospitality UI:** Glassmorphism aesthetics, live real-time date availability query engine, mobile responsiveness, and accessible feedback components.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite | React Router DOM, Lucide Icons, Vanilla CSS Design System |
| **Backend** | Java 21 / 22, Spring Boot 3.3.4 | Spring Web, Spring Data JPA, Spring Security, Bean Validation |
| **Security** | JJWT (io.jsonwebtoken 0.12.6) | HMAC-SHA256 Bearer Token, BCrypt Password Hashing |
| **Database** | MySQL 8.0 | InnoDB, Flyway Migrations, H2 in-memory test profile |
| **Build Tools** | Apache Maven 3.9.6, npm 10.8 | Maven Wrapper (`mvnw.cmd`), Vite Bundler |

---

## 📋 Default Credentials (Pre-Seeded)

The system automatically initializes demo credentials upon startup:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Demo Customer** | `customer@example.com` | `Password123!` | Search hotels, check live availability, book rooms, simulate payments, view & cancel own reservations |
| **Administrator** | `admin@example.com` | `Admin123!` | Full property management (create/edit/activate/deactivate), room suite configuration, rates, all system reservations |

*Tip: Quick autofill buttons for both accounts are available directly on the login screen.*

---

## 🚀 Getting Started

### Prerequisites
1. **Java JDK 21 or 22**
2. **Node.js v20+ & npm**
3. **MySQL Server 8.0** (running locally on port 3306)

---

### Step 1: Database Setup

Ensure your local MySQL service is running. You can configure your database password in either:
- The environment variable `DB_PASSWORD`
- Or directly in `backend/src/main/resources/application.yml`

Flyway will automatically create the `hotel_booking_db` database and run all migrations (`V1` through `V6`), seeding rich demo hotels across Jaipur, Goa, Mumbai, Bengaluru, and Manali.

---

### Step 2: Run the Backend (Spring Boot)

Open a terminal in `backend/` and execute:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The REST API will start on: **`http://localhost:8080`**  
Health Check endpoint: **`http://localhost:8080/api/v1/health`**

To run automated integration & unit tests:
```powershell
.\mvnw.cmd test
```

---

### Step 3: Run the Frontend (React + Vite)

Open a second terminal in `frontend/` and execute:

```powershell
cd frontend
npm run dev
```

The frontend web app will open at: **`http://localhost:5173`**

To create a production build of the frontend:
```powershell
npm run build
```

---

## 🧭 API Reference

Base Path: `/api/v1`

### Public Catalog & Availability
- `GET /api/v1/health` — Service health and uptime
- `GET /api/v1/hotels?destination=&page=&size=` — Paginated active hotel search
- `GET /api/v1/hotels/{hotelId}` — Hotel details
- `GET /api/v1/hotels/{hotelId}/room-types` — Active room suites for a hotel
- `GET /api/v1/availability?roomTypeId=&checkIn=&checkOut=&rooms=` — Live date availability calculation

### Authentication
- `POST /api/v1/auth/register` — Register new customer account
- `POST /api/v1/auth/login` — Authenticate and obtain JWT bearer token
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile
- `POST /api/v1/auth/logout` — Client token clearance

### Customer Bookings & Payments
- `POST /api/v1/bookings` — Create a 15-minute `PENDING_PAYMENT` booking hold with row lock
- `GET /api/v1/bookings/my` — List all reservations belonging to authenticated customer
- `GET /api/v1/bookings/{id}` — View single reservation (owner only)
- `POST /api/v1/bookings/{id}/cancel` — Cancel eligible booking (releases inventory)
- `POST /api/v1/bookings/{bookingId}/payment/mock` — Execute simulated payment with idempotency key

### Administration (Requires `ADMIN` Role)
- `GET /api/v1/admin/hotels` — List all hotels (active and inactive)
- `POST /api/v1/admin/hotels` — Create new hotel property
- `PUT /api/v1/admin/hotels/{id}` — Update hotel property
- `PATCH /api/v1/admin/hotels/{id}/status?active=` — Toggle hotel active status
- `GET /api/v1/admin/hotels/{hotelId}/room-types` — List room suites
- `POST /api/v1/admin/hotels/{hotelId}/room-types` — Add room suite and inventory
- `PUT /api/v1/admin/room-types/{id}` — Update room suite rates and total rooms
- `GET /api/v1/admin/bookings?status=` — View reservations across all system customers
- `PATCH /api/v1/admin/bookings/{id}/status` — Admin status management

---

## 🏛️ Project Directory Structure

```text
Hotel Booking System/
├── backend/
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src/main/java/com/example/hotelbooking/
│   │   ├── HotelBookingApplication.java
│   │   ├── config/ (SecurityConfig, JwtService, JwtFilter, DataInitializer)
│   │   ├── common/ (GlobalExceptionHandler, ErrorResponse, PagedResponse, HealthController)
│   │   ├── user/   (User, Role, UserRepository, UserResponseDto)
│   │   ├── auth/   (AuthController, AuthService, DTOs)
│   │   ├── hotel/  (Hotel, HotelRepository, HotelService, HotelController, DTOs)
│   │   ├── room/   (RoomType, RoomTypeRepository, RoomTypeService, RoomTypeController, DTOs)
│   │   ├── availability/ (AvailabilityController, AvailabilityService, DTOs)
│   │   ├── booking/ (Booking, BookingStatus, BookingRepository, BookingService, BookingController, DTOs)
│   │   ├── payment/ (Payment, PaymentStatus, PaymentRepository, PaymentService, PaymentController, DTOs)
│   │   └── admin/   (AdminController, AdminService, DTOs)
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-test.yml
│   │   └── db/migration/ (V1__... to V6__seed_initial_data.sql)
│   └── src/test/java/com/example/hotelbooking/
│       ├── HotelBookingApplicationTests.java
│       ├── auth/AuthControllerTest.java
│       └── booking/BookingServiceTest.java
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── types/index.ts
│   │   ├── services/apiClient.ts
│   │   ├── context/AuthContext.tsx
│   │   ├── components/ (Navbar, Footer, ProtectedRoute, AdminRoute, StatusBadge, LoadingSpinner)
│   │   └── pages/ (HomePage, HotelListPage, HotelDetailPage, CheckoutPage, ConfirmationPage, MyBookingsPage, LoginPage, RegisterPage, AdminDashboardPage, NotFoundPage)
├── .env.example
├── .gitignore
├── README.md
└── Hotel_Booking_System_Docs/ (Source of truth specifications)
```
