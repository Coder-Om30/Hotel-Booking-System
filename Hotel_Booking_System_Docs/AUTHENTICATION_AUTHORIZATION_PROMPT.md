# Prompt 11 — Authentication and Authorization (JWT)

You are a senior application-security engineer implementing authentication and authorization for the Hotel Booking System. Follow the approved Java, Spring Boot, React, and MySQL architecture.

## Required reading and inspection
Read `AGENTS.md`, `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, and `IMPLEMENTATION_PLAN.md`. Inspect the repository, current security configuration, dependency versions, Git status, and tests before changing files.

## Approved baseline
- Spring Security protects the Spring Boot REST API.
- JWT bearer access tokens are sent in `Authorization: Bearer <token>`.
- Begin with short-lived access JWTs and explicit re-login on expiry. Do not add refresh tokens unless separately approved.
- React keeps the access token in memory for the initial implementation where practical. Do not put tokens in URLs or logs. If persistence is proposed, explain XSS/storage trade-offs and ask before changing the baseline.
- Passwords are hashed with a supported strong password encoder, such as BCrypt or Argon2.
- Roles are `CUSTOMER` and `ADMIN`.
- Public registration always creates a `CUSTOMER`; public requests cannot set roles.
- Mock payment only; never collect real payment credentials.

## Backend requirements
1. Implement validated registration with normalized email and duplicate-email handling.
2. Hash passwords before persistence; never return password hashes.
3. Implement login with generic credential failure messages and issue a signed access JWT with subject, expiry, and appropriate claims.
4. Read signing configuration from environment/secret configuration. Use a sufficiently strong key and fail safely when required production configuration is absent.
5. Verify token signature, expiry, required claims, and expected token format. Reject malformed, expired, tampered, or unsupported tokens.
6. Configure stateless API security and explicit public/protected/admin route rules.
7. Implement `GET /api/v1/auth/me` with only safe profile fields.
8. Restrict catalog mutation and admin reservation endpoints to `ADMIN`.
9. Enforce booking ownership for viewing, cancelling, and simulating payment. Never trust a client-supplied user ID.
10. Use appropriate `401` vs `403` responses and consistent safe error bodies.
11. Configure CORS for explicit allowed frontend origins. Do not combine wildcard origins with credentials.
12. Do not log passwords, bearer tokens, signing keys, or sensitive request bodies.
13. Implement controlled admin bootstrap through a documented local/operational process. Never expose public admin registration.
14. If any cookie-based refresh/logout mechanism is added later, apply CSRF protections appropriate to that design.

## Frontend requirements
1. Add register/login forms with validation and accessible error states.
2. Centralize API calls and attach the access token only to the API Authorization header.
3. Keep auth state consistent across route changes; handle expiry/`401` by clearing stale auth state and guiding the user to sign in again.
4. Use protected customer/admin routes for navigation UX, while clearly retaining server-side authorization as the real security boundary.
5. Never display admin-only navigation as proof of authorization and never rely on hidden routes to protect data.
6. Do not log tokens or persist them to localStorage/sessionStorage without explicit approval and documented risk handling.

## Tests required
- Successful registration and login.
- Duplicate/normalized email behavior.
- Password is stored hashed and never returned.
- Invalid credentials, malformed JWT, tampered JWT, and expired JWT are rejected.
- Public registration cannot create an admin.
- Anonymous access to protected endpoints is rejected.
- Customer access to admin endpoints is rejected.
- Admin access to admin endpoints succeeds.
- Customer A cannot read, cancel, or simulate payment for Customer B's booking.
- Safe CORS behavior and error responses.
- Frontend handling of login success, invalid login, expired token, logout, and forbidden routes.

## Constraints
- Use maintained libraries compatible with the existing Spring Boot version; do not hand-roll cryptographic algorithms.
- Do not weaken security tests or disable CSRF/security globally merely to make a test pass.
- Do not claim JWT logout revokes tokens unless a revocation mechanism exists.
- Do not add refresh tokens, OAuth providers, social login, or external identity services without approval.
- If a design decision materially changes the approved baseline, stop and ask.

## Required output
Implement, test, and report the authentication flow, protected resources, permissions, changed files, API changes, and security considerations. Include commands run and actual test results, remaining risks/limitations, and confirmation that no unrelated features were implemented.
