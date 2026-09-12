# Agent Guidance

## Project status

This repository currently contains infrastructure only. [infrastructure_plan.md](infrastructure_plan.md) records the confirmed decisions; configurations implement that plan without product behavior. Do not change plan decisions without using the `infra-planner` skill to revise the plan first.

## Repository map

- Application frontend/API: `app/`, `pages/`, and `src/` are **not created yet**.
- Database configuration: `prisma/schema.prisma`; no product models or migrations exist.
- Infrastructure smoke test: `scripts/smoke-db.mjs`.
- Tests: `tests/infrastructure/`; product unit, integration, and E2E tests are not created yet.
- Local services: `compose.yml` provides PostgreSQL only.
- CI/CD: `.github/workflows/pr-checks.yml` and `.github/workflows/release.yml`.
- Documentation: `README.md` and `infrastructure_plan.md`.
- Project skills: `.agents/skills/`.

## Required reading and skills

Read `infrastructure_plan.md`, this file, and the relevant existing configuration before changing a feature. Use `infra-planner` for infrastructure decisions, `infra-builder` for their implementation, `frontend-ui-engineering` for user interfaces, `api-and-interface-design` for public boundaries, `test-driven-development` for behavior changes, `browser-testing-with-devtools` or `test-in-browser` for browser verification, `security-and-hardening` for input/auth/data work, `documentation-and-adrs` for durable decisions, `code-review-and-quality` before merge, `ci-cd-and-automation` for workflow changes, and `git-workflow-and-versioning` for all changes.

## Boundaries

- Infrastructure work must not create product pages, components, routes, controllers, authentication flows, business schemas, seed users, or product tests.
- Never commit secrets, local `.env` files, generated reports, `.next/`, or `node_modules/`.
- PostgreSQL is local development infrastructure; never point local commands at a remote database unless an explicitly authorized release task requires it.
- Vercel deployment requires the protected GitHub `production` environment and named secrets/variables; never use real credentials in local verification.

## Verification

Run the relevant checks before handoff (with Node.js 22.12+ LTS):

```sh
npm run format:check
npm run lint
npm run typecheck
npm run coverage
npm run test:smoke
docker compose config
```

Start the local service with `npm run docker:up`; stop it after verification with `npm run docker:down`. The pull-request workflow is the CI equivalent, with PostgreSQL as a service container. Next.js build and Playwright checks become required once application files and E2E tests exist.

The dependency audit is currently non-blocking only for Prisma CLI's documented transitive findings; re-evaluate that exception on every Prisma/npm update and do not add unrelated audit suppressions.

## Change checklist

1. Confirm the work matches `infrastructure_plan.md`.
2. Keep infrastructure and product changes separate.
3. Run applicable local verification and record anything unavailable.
4. Update `README.md`, this file, and the plan when instructions or decisions change.
5. Inspect `git diff --check` and the final changed-file list before handoff.
