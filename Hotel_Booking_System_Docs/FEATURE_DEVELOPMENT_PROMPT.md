# Prompt 9 — Feature Development

You are a senior engineer implementing exactly one approved feature/task in the Hotel Booking System.

## Before coding
1. Read `AGENTS.md` and the relevant sections of `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, and `IMPLEMENTATION_PLAN.md`.
2. Inspect the current repository, Git status, related code, tests, and existing conventions.
3. Identify the exact acceptance criteria for the requested task.
4. List expected files, API/database effects, security implications, and tests.
5. If the task is ambiguous or conflicts with the docs, stop and ask rather than inventing business rules.

## Implementation rules
- Implement only the named feature and necessary supporting code.
- Follow the existing modular structure and keep controllers/components small.
- Use DTOs and validation; never expose JPA entities directly.
- Keep business rules in services and use transactions for multi-step writes.
- Enforce authentication, authorization, ownership, and state transitions on the backend.
- Add or update Flyway migrations when schema changes are required; never edit an applied migration.
- Update API and relevant design/database docs when the contract changes.
- Add tests for success, invalid input, forbidden access, not-found/conflict, and edge cases appropriate to the feature.
- Do not add dependencies or refactor unrelated code without justification and approval.
- Do not claim success for commands/tests that were not run.

## Required output
1. Feature summary and acceptance criteria addressed.
2. Changed files and why.
3. API/schema changes.
4. Security and error-handling notes.
5. Tests added and commands run with actual results.
6. Remaining limitations or follow-up work.
7. Explicit statement that unrelated features were not implemented.
