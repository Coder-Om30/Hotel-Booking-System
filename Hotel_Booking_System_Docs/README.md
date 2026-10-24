# Hotel Booking System — Coding Agent Documentation Pack

This pack uses the confirmed decisions:
- Frontend: React (prefer TypeScript for a new frontend; preserve existing tooling unless approved)
- Backend: Java + Spring Boot
- Database: MySQL
- Authentication: JWT bearer access tokens
- Payments: simulated/mock only

## Source-of-truth documents
1. `PRD.md` — scope, journeys, roles, requirements, acceptance criteria
2. `DESIGN.md` — UI/UX screens, components, accessibility, frontend behavior
3. `ARCHITECTURE.md` — components, boundaries, stack, security and inventory approach
4. `DATABASE.md` — schema and persistence invariants
5. `API.md` — endpoint and error contract
6. `AGENTS.md` — mandatory coding-agent rules
7. `IMPLEMENTATION_PLAN.md` — phases, dependencies, tests, completion gates

## Reusable prompts
8. `PROJECT_SETUP_PROMPT.md` — initialize/align the repository
9. `FEATURE_DEVELOPMENT_PROMPT.md` — implement one approved task
10. `DATABASE_BACKEND_CONNECTION_PROMPT.md` — connect Spring Boot and MySQL
11. `AUTHENTICATION_AUTHORIZATION_PROMPT.md` — implement JWT auth and authorization

## Recommended order
1. Give the coding agent all source-of-truth documents.
2. Run Prompt 8 to inspect and establish project setup.
3. Complete phases in `IMPLEMENTATION_PLAN.md` one at a time.
4. Use Prompt 10 during the database/backend foundation phase.
5. Use Prompt 11 for the authentication phase.
6. Use Prompt 9 for each later feature task, changing the task scope explicitly.
7. Require the agent to report real test/build results and changed files every time.

## Important
These documents are specifications and prompts, not a claim that the application itself has been implemented or tested. Resolve open business decisions (cancellation rules, hold expiry, currency/timezone, admin bootstrap) before the related implementation phase.
