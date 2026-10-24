# Coding Agent Rules — Hotel Booking System

These rules are mandatory for every coding agent working in this repository.

## 1. Source of truth and authority
Read `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `IMPLEMENTATION_PLAN.md`, and this file before making changes. Follow the most specific approved requirement. If documents conflict, stop and report the conflict instead of silently choosing. The approved stack is React, Java, Spring Boot, MySQL, JWT authentication, and mock payments.

## 2. Inspect before editing
- Inspect repository structure, Git status, build files, existing tests, and configuration first.
- Preserve working user code and local changes. Never overwrite or delete files without understanding their purpose.
- Do not assume the repository is empty.
- Report assumptions, risks, and files likely to change before a large task.
- Implement only the approved phase/task; do not jump ahead or silently expand scope.

## 3. Architecture and code organization
- Use a modular monolith backend organized by feature, with controller/service/repository boundaries.
- Keep controllers thin. Put business rules and transaction boundaries in services.
- Use request/response DTOs; never expose JPA entities as API contracts.
- Keep React API calls in a shared service/client layer and group UI by feature.
- Prefer small, cohesive classes and components over giant files.
- Reuse existing project conventions unless they conflict with an approved requirement.

## 4. Naming and style
- Java classes use `UpperCamelCase`; methods and variables use `lowerCamelCase`; constants use `UPPER_SNAKE_CASE`.
- React components use `PascalCase`; hooks start with `use`; utility functions use `camelCase`.
- Use descriptive names; avoid abbreviations that obscure intent.
- Follow the formatter/linter already configured. Do not add formatters or lint rules without approval.
- Remove unused imports, dead code, debug prints, and commented-out implementations.

## 5. Type safety and validation
- Use Java types appropriate to the domain: `BigDecimal` for money, `LocalDate` for stay dates, `Instant`/UTC timestamps for events.
- Validate request DTOs with Jakarta Bean Validation and enforce business rules in services.
- In React, validate for usability, but never rely on client validation for security or correctness.
- Reject invalid date ranges, nonpositive room/guest counts, unsupported status transitions, and invalid amounts.
- Normalize email addresses consistently before uniqueness checks.

## 6. Security is non-negotiable
- Never commit secrets, real credentials, private keys, signing keys, or production connection strings.
- Read JWT signing configuration from environment/secret configuration; fail safely when a required production secret is absent.
- Verify JWT signature and expiry and validate required claims. Do not accept JWTs from URL query parameters.
- Do not log passwords, access tokens, refresh tokens, or sensitive personal information.
- Store passwords only using Spring Security's supported password encoder (prefer Argon2 or BCrypt as supported/configured).
- Registration must always assign `CUSTOMER`; never accept role/permissions from a public request.
- Enforce `ADMIN` access server-side. A protected React route is only a UX feature.
- Enforce booking ownership in service/API logic for read, cancel, and mock payment actions. Never trust a client-supplied user ID.
- Use restrictive CORS settings for configured frontend origins; do not use wildcard origins with credentials.
- With bearer JWTs, still protect any cookie-based refresh/logout mechanism against CSRF. Avoid unsafe token persistence; document the chosen storage trade-off.
- Return safe error messages without stack traces, SQL, secrets, or internal configuration.
- Never collect or store real card numbers, CVV, or banking credentials in the mock payment flow.

## 7. Booking and inventory invariants
- Recheck inventory within the same transaction that creates the booking hold.
- Use a proven concurrency-control strategy and ensure every inventory-changing path follows it.
- Never allow negative inventory or overbooking.
- Confirm payment and booking state atomically where feasible; make finalization idempotent.
- Cancellation must release inventory exactly once.
- Define pending-payment hold expiry and ensure expired holds stop consuming inventory.
- Use unique constraints and database transactions as a backstop to application checks.
- Add concurrency and duplicate-request tests for inventory-sensitive paths.

## 8. Database rules
- Use Flyway for schema changes; never rely on automatic Hibernate schema updates for shared or production-like environments.
- Never edit a migration that may have been applied; add a new migration.
- Add appropriate foreign keys, unique constraints, checks, and indexes.
- Use decimal columns for money and snapshot the booking price so later rate changes do not rewrite historical bookings.
- Do not delete historical booking/payment records to clean up catalog data.

## 9. API rules
- Keep `API.md` current with endpoint, request/response DTO, authorization, and status-code changes.
- Use consistent error responses and HTTP statuses.
- Paginate potentially large lists.
- Avoid N+1 queries and unbounded eager loading.
- Do not return password hashes or internal security fields in any response.
- Use idempotency keys or equivalent protections for operations that can be retried.

## 10. Error handling and logging
- Use centralized exception mapping (e.g., `@RestControllerAdvice`).
- Log actionable server-side context without credentials, tokens, or sensitive payloads.
- Do not swallow exceptions or return success after a failed write.
- Distinguish expected validation/conflict errors from unexpected failures.

## 11. Testing requirements
- Add or update tests with every meaningful behavior change.
- Test successful and rejected paths, especially authorization, ownership, payment idempotency, cancellation, and concurrency.
- Prefer service unit tests for business rules and integration tests for persistence/security/API behavior.
- Do not disable or weaken existing tests just to obtain a green build.
- Run relevant frontend/backend tests and builds; report any test not run and why.
- Never claim tests passed unless the commands actually ran successfully.

## 12. Dependencies and tools
- Prefer dependencies already present in the repository.
- Before adding a dependency, explain why existing libraries cannot solve the requirement.
- Pin versions through the existing dependency management approach; avoid unnecessary or unmaintained packages.
- Do not add Docker, Redis, message brokers, cloud services, or external payment SDKs unless approved.

## 13. React-specific rules
- Use semantic, accessible components and labelled forms.
- Keep loading, empty, error, and success states explicit.
- Centralize base URL, request headers, and API error handling.
- Never put tokens in URLs or log them. Prefer in-memory access-token storage for the initial flow; document any persistence choice.
- Clear authentication state on logout/expiry and handle `401` consistently.
- Do not treat client-side role checks as security enforcement.
- Prevent accidental duplicate submits in the UI; backend idempotency is still mandatory.

## 14. Documentation and configuration
- Update setup instructions, `.env.example`, API docs, and relevant architecture/database docs when behavior changes.
- `.env.example` contains placeholder values only.
- Explain required environment variables and local database setup.
- Do not put secrets in README examples, tests, screenshots, or generated logs.

## 15. Git and file discipline
- Do not reset, rebase, force-push, or discard user changes unless explicitly asked.
- Do not create commits unless requested.
- Avoid broad formatting churn or unrelated refactors.
- Keep changes scoped to the approved task.

## 16. Required task workflow
1. Read the project docs and inspect the current repository.
2. State the exact task and relevant assumptions.
3. Identify the intended files and migration/API/security impacts.
4. Implement the smallest coherent change.
5. Add/update tests.
6. Run relevant tests/builds and inspect the diff.
7. Update docs.
8. Report changed files, behavior, commands run, results, known limitations, and the next recommended task.

## 17. Stop and ask before proceeding if
- Requirements conflict or a key business rule is undefined.
- A task requires a destructive migration or data deletion.
- A dependency/service/paid API outside the approved stack is needed.
- The JWT storage/refresh design would need to change materially.
- Booking cancellation/refund/hold-expiry policy cannot be inferred safely.
- The repository's existing structure materially conflicts with these docs.
