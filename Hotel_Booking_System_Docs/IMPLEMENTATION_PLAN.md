# Phased Implementation Plan
## Hotel Booking System

**Rule:** Complete and verify one phase at a time. Do not begin the next phase until the current phase's completion criteria pass and the user/owner approves continuation.

## Phase 0 — Repository and decisions baseline
**Goal:** Understand the repository before changing it.
- Inspect Git status, directory tree, package manifests, backend build, frontend build, tests, and existing conventions.
- Read all project documents.
- Confirm Java/Spring Boot/MySQL versions and the JWT library/token-storage baseline.
- Record unresolved business decisions: cancellation window, pending hold expiry, currency, timezone, admin bootstrap, and whether booking inventory is total-room overlap or per-date inventory.
- Do not overwrite files or create a new app until the repository state is understood.
**Complete when:** repository report and assumptions are documented; blocking decisions are raised.

## Phase 1 — Project foundation
**Goal:** Establish reproducible frontend/backend builds.
- Create or align React frontend and Spring Boot backend structure.
- Add Maven build, React scripts, formatting/lint/test commands only if appropriate.
- Add configuration profiles and `.env.example` placeholders.
- Configure CORS for known frontend origin.
- Add health endpoint and basic frontend shell.
**Tests:** clean backend build, frontend install/build, health endpoint.
**Complete when:** a new developer can run both applications using README instructions.

## Phase 2 — Database foundation
**Goal:** Establish safe schema evolution.
- Configure MySQL datasource from environment.
- Configure Flyway and create initial migrations for users, hotels, room types, bookings, payments.
- Add constraints, foreign keys, and indexes.
- Add optional development-only seed data that cannot run accidentally in production.
**Tests:** migrations on an empty test database; repository smoke tests.
**Complete when:** schema can be created from scratch with no manual SQL edits.

## Phase 3 — Shared API and error handling
**Goal:** Establish API conventions.
- Create common error DTO and centralized exception handling.
- Add validation response mapping and pagination conventions.
- Add health/readiness behavior without leaking internals.
**Tests:** validation, not-found, conflict, and generic-error response tests.
**Complete when:** API error shapes are consistent and documented.

## Phase 4 — Authentication and authorization
**Goal:** Secure identity and API access.
- Registration, normalized email uniqueness, password hashing, login, JWT issuance/validation, current-user endpoint.
- Configure security filter chain, stateless API behavior, role mapping, and safe CORS.
- Admin bootstrap must be a controlled local/operational process, not public registration.
- Add customer/admin endpoint authorization and booking ownership helper/pattern.
- Start with short-lived access JWT and in-memory frontend storage; re-login on expiry unless refresh tokens are explicitly approved.
**Tests:** valid/invalid login, expiry/signature failure, role restriction, customer role assignment, ownership rules, no secret leakage.
**Complete when:** protected resources are secured and security tests pass.

## Phase 5 — Hotel catalog
**Goal:** Deliver public hotel discovery and admin catalog management.
- Public paginated search, details, room-type listing.
- Admin create/update/deactivate hotels, room types, occupancy and rate.
- Add server-side validation and DTOs.
**Tests:** public visibility, inactive listing behavior, admin-only writes, pagination.
**Complete when:** catalog journeys work through UI and API.

## Phase 6 — Availability search
**Goal:** Calculate availability for a date range.
- Validate date range, room count, occupancy, and active catalog state.
- Implement overlap calculation with pending holds and confirmed bookings.
- Define and implement pending hold expiry.
- Display estimated price from server data.
**Tests:** boundary dates, same-day turnover, overlapping/non-overlapping bookings, expired holds.
**Complete when:** availability matches the documented inventory model.

## Phase 7 — Booking hold creation
**Goal:** Reserve inventory safely before payment.
- Add transactional booking creation.
- Lock room-type/inventory rows or use another documented concurrency-safe strategy.
- Snapshot rate and total; create unique booking reference and pending hold.
- Add idempotency or duplicate-request handling.
**Tests:** insufficient inventory, invalid input, concurrent requests for final room, rollback behavior.
**Complete when:** overselling is prevented in integration tests.

## Phase 8 — Mock payment
**Goal:** Complete payment simulation safely.
- Implement mock payment service and outcome handling.
- Do not accept or store real payment details.
- Make payment and booking finalization idempotent.
- Define behavior for failed/cancelled/expired payment holds.
**Tests:** success, failure, duplicate callback/request, expired hold, wrong booking owner.
**Complete when:** successful mock payment confirms booking exactly once and failure leaves consistent state.

## Phase 9 — Customer booking management
**Goal:** Show booking history and support cancellation.
- List only current customer's bookings.
- Booking details enforce owner/admin policy.
- Implement cancellation eligibility and transactional inventory release exactly once.
**Tests:** cross-user access denied, repeated cancellation, cancellation after disallowed state, inventory release.
**Complete when:** customer can safely manage their own reservations.

## Phase 10 — Admin reservation management
**Goal:** Give administrators controlled reservation visibility and actions.
- Paginated reservation list, filters, details, allowed status transitions.
- Add audit logging for privileged state changes where practical.
**Tests:** customer denied, admin allowed, invalid transitions rejected.
**Complete when:** admin operations follow explicit permissions and state transitions.

## Phase 11 — React customer journeys
**Goal:** Finish the public and customer UI.
- Search, results, hotel detail, login/register, checkout, mock payment, confirmation, booking history, cancellation.
- Integrate API client, auth state, loading/error/empty states, responsive layout and accessibility.
**Tests:** component tests for critical states and end-to-end happy path if tooling exists.
**Complete when:** customer can complete the full mock booking journey through the UI.

## Phase 12 — React admin journeys
**Goal:** Finish protected admin screens.
- Admin dashboard, catalog forms, room inventory/rates, reservation management.
- Handle forbidden/expired sessions and server validation.
**Tests:** route UX plus API authorization tests; UI tests do not replace backend security tests.
**Complete when:** authorized admins can manage catalog/reservations and customers cannot.

## Phase 13 — Hardening and release candidate
**Goal:** Verify the whole system.
- Review security headers, CORS, JWT config, error leakage, validation, SQL indexes, pagination, transaction boundaries, and secrets.
- Run backend tests, frontend tests, builds, migrations, and end-to-end scenarios.
- Review accessibility, responsive behavior, logs, README, API docs, and demo seed instructions.
- Document known limitations and production hardening gaps.
**Complete when:** all acceptance criteria are checked or each exception is explicitly documented and approved.

## Definition of done for every phase
- Only phase-scoped changes are made.
- Code compiles/builds.
- Relevant tests pass, or failures are reported accurately.
- Documentation and migrations are updated.
- Security and error cases are covered.
- Diff is reviewed for unrelated changes and secrets.
- Report includes changed files, decisions, commands/results, limitations, and next step.
