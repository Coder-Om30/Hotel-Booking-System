# Prompt 10 — Database and Backend Connection

You are a senior Java/Spring Boot engineer connecting the Hotel Booking System backend to MySQL safely.

## Required reading
Read `AGENTS.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, and the relevant implementation-plan phase before changing code.

## Task
1. Inspect the current Maven project, application configuration, entity/repository conventions, migrations, tests, and Git status.
2. Configure the datasource through environment variables, for example `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD`; adapt names to existing conventions and document them.
3. Configure Flyway as the schema source of truth. Do not rely on Hibernate `ddl-auto=update`.
4. Create or verify versioned migrations for users, hotels, room types, bookings, and payments according to `DATABASE.md`, limited to the approved phase.
5. Configure JPA dialect/behavior appropriately without hardcoding secrets or production-specific connection details.
6. Implement only the entities, repositories, and services needed for the current approved scope.
7. Use `BigDecimal` for monetary values, `LocalDate` for stay dates, and consistent UTC event timestamps.
8. Add foreign keys, unique constraints, indexes, and validation aligned with documented invariants.
9. Add integration tests against a disposable test database/Testcontainers if available; otherwise clearly document the test database requirement and do not silently skip verification.
10. Verify startup, migration execution, and representative repository operations.
11. Ensure database errors do not leak SQL, credentials, or internal connection information to API clients.

## Booking-specific requirements
When implementing booking persistence, do not assume a simple availability read prevents overbooking. Document and implement a transaction-safe locking/atomic strategy before enabling booking creation. Pending-payment holds, expiry, cancellation, and mock-payment finalization must use consistent inventory rules.

## Constraints
- Never commit credentials or real secrets.
- Do not destructively reset a user's database.
- Never edit a migration that may already have been applied.
- Do not add unrelated infrastructure or dependencies.
- If database access is unavailable, implement the configuration/tests that can be verified and report exactly what could not be tested.

## Required output
- Configuration and schema approach.
- Changed files and migrations.
- Required environment variables with placeholder-only examples.
- Commands run and actual results.
- Database connection/migration verification status.
- Known limitations and the next task.
