# System Architecture
## Hotel Booking System

## 1. Architecture decision
Use a **modular monolith**: one Spring Boot backend and one React frontend, with a relational MySQL database. Organize the backend by business feature so the project remains easy to develop and test without introducing microservice complexity.

## 2. Technology stack
### Frontend
- React with TypeScript preferred for safer API contracts; if repository already uses JavaScript, do not migrate without approval.
- Vite for local development/build unless the repository already has an established build tool.
- React Router for client-side routes.
- A shared `apiClient` layer for REST calls.
- A modest component/style system; avoid adding a UI framework without approval.

### Backend
- Supported Java LTS version selected at project setup (prefer Java 21 unless the repository mandates another supported version).
- Spring Boot, Spring Web, Spring Security, Spring Data JPA, Jakarta Bean Validation.
- Maven.
- Flyway migrations.
- JWT validation/issuance using a maintained, compatible library and a strong configured signing key.
- JUnit 5, Spring Boot Test, and Testcontainers where available and practical.

### Data
- MySQL 8.x-compatible SQL.
- InnoDB transactional tables.
- Decimal columns for monetary values.
- UTC timestamps for event records; hotel/business timezone rules explicitly configured for date validation.

## 3. High-level components
1. React browser application
2. REST API
3. Spring Security filter chain and JWT authentication
4. Feature controllers and request/response DTOs
5. Application services containing business rules
6. Repositories using Spring Data JPA
7. MySQL database
8. Flyway migration history
9. Mock payment service/provider abstraction

## 4. Suggested repository layout
```text
hotel-booking-system/
  frontend/
    src/
      app/
      components/
      features/
        auth/
        hotels/
        availability/
        bookings/
        payments/
        admin/
      services/
      types/
      styles/
    public/
    package.json
  backend/
    pom.xml
    src/main/java/com/example/hotelbooking/
      config/
      common/
      auth/
      user/
      hotel/
      room/
      availability/
      booking/
      payment/
      admin/
    src/main/resources/
      application.yml
      db/migration/
    src/test/java/com/example/hotelbooking/
  docs/
  .gitignore
  README.md
  .env.example
```
Adapt the Java package and directory layout to the existing repository. Do not restructure an established project without approval.

## 5. Backend layering
- **Controller:** HTTP mapping, input DTOs, response status; no business logic.
- **DTO:** validated external request/response contract; never serialize JPA entities directly.
- **Service:** business rules, transaction boundaries, authorization-relevant ownership checks.
- **Repository:** persistence and focused queries.
- **Entity:** persistence model, not an API contract.
- **Security/config:** JWT filter/provider, security rules, CORS, password encoder.
- **Common:** standard error response, exception mapping, pagination conventions.

## 6. Authentication architecture
- Stateless bearer-token API for the initial version.
- Access JWT should be short-lived and signed with a strong secret/key supplied through environment or secret manager.
- Verify signature, issuer/audience if configured, expiry, and expected token type/claims.
- Do not accept tokens from query strings.
- Do not log tokens or credentials.
- Choose and document token storage before implementation. Preferred baseline: short-lived access token held in memory; on refresh-token support, prefer a secure `HttpOnly`, `Secure`, appropriately `SameSite` cookie and CSRF protection for cookie-authenticated refresh/logout endpoints. Do not add refresh tokens unless planned and tested.
- For this project, begin with access JWT plus explicit re-login on expiry unless the user approves refresh-token functionality.
- Use role claims only as one authorization input; ensure account status and ownership are also enforced.

## 7. Booking and inventory correctness
- Recheck availability inside the booking transaction.
- Use row-level locking, optimistic versioning with retry, or a conditional atomic inventory update that guarantees no negative inventory.
- Apply a consistent lock order for all paths that modify the same inventory.
- Use `@Transactional` around booking state and inventory updates.
- Cancellation releases inventory exactly once; use explicit state transitions.
- Use unique constraints/idempotency keys where appropriate.
- Do not rely on frontend availability alone.

## 8. Mock payment architecture
Create a `PaymentService` abstraction and a mock implementation. Store amount, currency, payment status, provider type `MOCK`, and a generated reference; never store payment-card data. Make payment finalization idempotent. The booking should become confirmed only after a successful mock result and successful transactional finalization.

## 9. Error handling
Use a consistent JSON error format with timestamp, status, machine-readable code, safe message, path, and field errors where applicable. Map validation, not-found, conflict, unauthenticated, forbidden, and unexpected errors to appropriate HTTP statuses. Never expose stack traces or SQL details to clients.

## 10. Configuration and environments
- Keep secrets out of source control.
- Use environment variables for database credentials, JWT signing key, CORS origins, and runtime profile.
- Include `.env.example` with placeholders only.
- Keep development defaults non-production and clearly documented.
- Enable SQL schema creation only through Flyway migrations; do not rely on Hibernate auto-update in production-like environments.
