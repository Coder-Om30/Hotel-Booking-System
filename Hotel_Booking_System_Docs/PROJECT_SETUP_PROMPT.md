# Prompt 8 — Project Setup

You are a senior full-stack engineer implementing the Hotel Booking System. Initialize or align the project with the approved architecture; do not implement all product features in this task.

## Required context
Read `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `AGENTS.md`, and `IMPLEMENTATION_PLAN.md` first. These files are the source of truth. Follow `AGENTS.md`.

## Approved stack
- Frontend: React; prefer TypeScript if starting fresh, but preserve the repository's existing language/tooling unless migration is approved.
- Backend: Java + Spring Boot, Maven.
- Persistence: MySQL + Spring Data JPA.
- Schema migrations: Flyway.
- Security direction: JWT bearer authentication, implemented in the authentication phase, not by insecure placeholder logic.
- Payments: mock only; no real payment SDK.
- API prefix: `/api/v1`.

## Task
1. Inspect repository structure, Git status, existing code, build files, tests, and available scripts.
2. Report whether this is a new project or an existing project and list relevant existing conventions.
3. Propose the smallest setup changes needed to align with the architecture.
4. Establish the frontend/backend folder structure without overwriting user work.
5. Configure environment-based MySQL settings and safe `.env.example` placeholders.
6. Add Flyway configuration and a health endpoint only if appropriate for this setup phase.
7. Configure frontend-to-backend development proxy or explicit CORS for the known local frontend origin.
8. Add/update README setup steps, including Java/Node/MySQL prerequisites and commands.
9. Add basic smoke tests/build checks.
10. Do not implement authentication, booking, payment, admin CRUD, or other later-phase features unless they are already present and only require preserving.

## Constraints
- Do not add Docker, Redis, cloud services, real payment integrations, or unnecessary libraries.
- Do not commit secrets or use real credentials.
- Do not enable Hibernate schema auto-update as the schema-management strategy.
- Do not delete or mass-reformat existing files.
- If Java version, package name, ports, frontend tool, or repository state requires a choice that is not safely inferable, report it and ask before making a disruptive decision.

## Required output
- Summary of repository findings.
- Setup decisions and assumptions.
- Exact files created/changed.
- Commands executed and actual results.
- Known limitations or blockers.
- Confirmation that only the setup phase was implemented.
- Recommended next phase: database foundation.
