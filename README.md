# TechStartup Template

## Status

The repository has a TypeScript/Next.js development foundation, local PostgreSQL service, quality tooling, and planned CI/CD. Production application code—pages, components, routes, data models, authentication, and product tests—has deliberately not been created yet. [infrastructure_plan.md](infrastructure_plan.md) remains the source of truth for infrastructure decisions.

## Repository map

- `app/`, `pages/`, and `src/` — not created yet; future frontend and backend application code.
- `prisma/schema.prisma` — database connection and client generation configuration only; no product models.
- `scripts/smoke-db.mjs` — infrastructure-only PostgreSQL readiness check.
- `tests/infrastructure/` — test-harness smoke test; `tests/e2e/` is not created until product flows exist.
- `compose.yml` — local PostgreSQL service.
- `.github/workflows/` — pull-request checks and Vercel release workflow.
- `.agents/skills/` — project-specific agent skills.

## Prerequisites

- Git, current supported stable release.
- Node.js 22.12+ LTS and the npm version bundled with it. Use the official Node.js installer or a version manager; `.nvmrc` records the minimum compatible release.
- Docker Desktop (macOS/Windows) or Docker Engine with Compose (Linux) for local PostgreSQL.
- A current browser for manual testing. Playwright installs its test browser separately when end-to-end tests are added.

## Local setup

```sh
cp .env.example .env
npm ci
npm run docker:up
npm run test:smoke
```

`POSTGRES_PASSWORD` in `.env.example` is deliberately a local-only placeholder. Prisma's CLI reads `DATABASE_URL`; `DIRECT_URL` is reserved for a future managed-provider integration. Never copy production credentials into `.env` or a tracked file.

## Available checks

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run coverage
npm run test:smoke
npm run verify
```

`npm run test` currently proves only the infrastructure test harness. `npm run test:e2e` and `npm run build` are configured for future application code and will not be useful until an application entrypoint and end-to-end tests exist. Future product models enable `npm run db:generate`, `npm run db:migrate:dev`, and the controlled production-only `npm run db:migrate:deploy` command.

To stop the local database, run `npm run docker:down`. This preserves `techstartup-postgres-data`; use `docker compose down -v` only when intentionally deleting local database data.

## CI and releases

`.github/workflows/pr-checks.yml` runs format, lint, type checking, harness coverage, PostgreSQL smoke testing, Gitleaks, and CodeQL on pull requests. It runs Next.js builds and Playwright only after relevant application files and tests exist.

The dependency-audit job currently reports, without blocking merging, known high findings in Prisma CLI's transitive tooling packages (`deepmerge-ts` and `mysql2`). Prisma is a development-only migration CLI and is not part of the deployed Next.js runtime; review this exception whenever Prisma or npm updates, and make the scan blocking after the vendor resolves it or an alternative migration tool is selected.

`.github/workflows/release.yml` validates `v*` tags or a manual production dispatch, then deploys through the Vercel CLI after the protected `production` environment approves it. Configure these later in GitHub/Vercel:

- GitHub `production` environment with required approvers.
- `VERCEL_TOKEN` GitHub secret.
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` GitHub variables.
- `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and future authentication-provider credentials as protected production secrets where required by application code.
- Vercel and managed PostgreSQL accounts; enable managed database backups before production use.

The release workflow intentionally fails before deployment if Vercel configuration is missing. It does not yet run a live HTTP smoke test because no public application route exists; add `PRODUCTION_SMOKE_URL` and an application smoke test with the product implementation.

## Troubleshooting

- **Wrong Node version:** switch to Node.js 22.12+ LTS, then rerun `npm ci`.
- **Database smoke test cannot connect:** run `npm run docker:up`, wait for `docker compose ps` to show `healthy`, and check that port `5432` is free or change `POSTGRES_PORT` in `.env`.
- **Docker permission or daemon error:** start Docker Desktop/Engine and ensure your account can run `docker compose`.
- **Missing environment variable:** copy `.env.example` to `.env` and use only local placeholder values.
