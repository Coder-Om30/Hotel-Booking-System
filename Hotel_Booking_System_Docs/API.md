# REST API Contract
## Hotel Booking System

**Base path:** `/api/v1`  
**Authentication:** `Authorization: Bearer <access-jwt>` for protected endpoints.  
**Content type:** JSON unless otherwise documented.

The coding agent must keep this contract synchronized with implementation. Exact DTO fields may be refined during implementation, but changes require updating this document and tests.

## 1. Standard conventions
- Use ISO 8601 dates (`YYYY-MM-DD`) for hotel stay dates.
- Use decimal JSON numbers or documented decimal strings for monetary values; never calculate money using Java `double`.
- Paginated list endpoints should return `content`, `page`, `size`, `totalElements`, and `totalPages`.
- Return DTOs, never JPA entities.
- Include a request/correlation ID when available.
- Errors should use a consistent shape such as:
```json
{
  "timestamp": "2026-01-01T12:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "path": "/api/v1/bookings",
  "fieldErrors": [{"field": "checkOut", "message": "Must be after check-in"}]
}
```

## 2. Authentication
- `POST /auth/register` — public; creates `CUSTOMER`; `201 Created`.
- `POST /auth/login` — public; validates credentials and returns access token, token type, and expiry metadata.
- `GET /auth/me` — authenticated; returns current user's safe profile and role.
- `POST /auth/logout` — if the implementation has no server-side token revocation, document that logout clears client state but does not revoke an already-issued JWT. Do not imply revocation exists unless implemented.
- `POST /auth/refresh` — out of initial scope unless refresh tokens are approved and securely implemented.

## 3. Public catalog
- `GET /hotels?destination=&page=&size=&sort=` — public, paginated active hotel search.
- `GET /hotels/{hotelId}` — public hotel details.
- `GET /hotels/{hotelId}/room-types` — public active room types.
- `GET /availability?roomTypeId=&checkIn=&checkOut=&rooms=` — public availability query; must not be treated as a reservation guarantee.

## 4. Customer bookings
- `POST /bookings` — authenticated customer; validates availability and creates a `PENDING_PAYMENT` hold.
  Example request:
```json
{
  "roomTypeId": 42,
  "checkIn": "2027-05-10",
  "checkOut": "2027-05-13",
  "roomCount": 1,
  "guestCount": 2
}
```
- `GET /bookings/my` — authenticated; only current user's bookings.
- `GET /bookings/{bookingId}` — owner or authorized admin only.
- `POST /bookings/{bookingId}/cancel` — owner or authorized admin workflow; idempotent or returns a well-defined conflict when already cancelled.
- Do not expose a customer endpoint that accepts arbitrary `userId` to list another user's bookings.

## 5. Mock payment
- `POST /bookings/{bookingId}/payment/mock` — authenticated owner; accepts only the supported mock outcome or simulation scenario. Must not accept card data.
- Payment finalization must be idempotent and verify booking ownership, current booking state, amount, and inventory hold validity.
- Return booking and mock payment status. Do not mark confirmed on client-side state alone.

## 6. Admin
All endpoints below require `ADMIN` role:
- `POST /admin/hotels`
- `PUT /admin/hotels/{hotelId}`
- `PATCH /admin/hotels/{hotelId}/status`
- `POST /admin/hotels/{hotelId}/room-types`
- `PUT /admin/room-types/{roomTypeId}`
- `PATCH /admin/room-types/{roomTypeId}/status`
- `GET /admin/bookings?page=&size=&status=`
- `GET /admin/bookings/{bookingId}`
- `PATCH /admin/bookings/{bookingId}/status` only for explicitly allowed transitions and with audit logging where practical.

## 7. HTTP status guidance
- `200 OK`: successful read/update.
- `201 Created`: successful registration or resource creation.
- `204 No Content`: successful operation with no response body.
- `400 Bad Request`: malformed/invalid request.
- `401 Unauthorized`: missing, expired, or invalid authentication.
- `403 Forbidden`: authenticated but insufficient permissions.
- `404 Not Found`: resource absent or intentionally hidden to prevent data leakage.
- `409 Conflict`: availability conflict, duplicate state transition, or idempotency conflict.
- `422 Unprocessable Entity` may be used for business validation if applied consistently.
- `500 Internal Server Error`: unexpected failure with safe generic message.
