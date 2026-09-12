# Infrastructure Plan

> Planning only. This document describes future infrastructure work. No installations, configuration changes, containers, workflows, deployments, or other implementation files were created by the infrastructure-planning process.

## 1. Project and User Experience

- **Application:** Public-facing multi-user web application.
- **Primary users:** Public users with individual accounts.
- **Primary user task:** To be defined with product requirements; users will access shared or collaborative data.
- **Selected platform:** Browser-based web application.
- **User-experience rationale:** Immediate access in a modern browser is the stated priority, so no app installation is required.
- **Required operating systems, browsers, or devices:** Current supported desktop and mobile browsers; validate a support matrix before implementation.
- **Offline or native-device requirements:** No strong offline or native-device requirement selected.

## 2. Connectivity and Application Shape

- **Connectivity model:** Multi-user web-enabled.
- **Accounts and authentication:** Required; select a maintained Next.js-compatible authentication provider and configure account/session protection during implementation.
- **Backend required:** Yes, inside the Next.js application.
- **Cross-device persistence:** Hosted PostgreSQL makes each account's data available from any supported browser.
- **Interaction between accounts:** Supported; authorization rules must be defined per shared-data feature.
- **Primary application components:** Next.js web UI, server-rendered/server route functionality, authentication integration, and PostgreSQL persistence.

## 3. Selected Technology Stack

| Area | Selected technology | Purpose | Version policy |
|---|---|---|---|
| Primary language | TypeScript | Shared type-safe client and server development | Current supported stable release compatible with Next.js |
| Application framework | Next.js | Browser UI, server rendering, and application routes | Current supported stable major |
| Runtime or SDK | Node.js | Runs development tooling and the Next.js server | Active or maintenance LTS |
| Package manager | npm | Dependency and script management | Version bundled with selected Node.js LTS |
| Build tool | Next.js build tooling | Production web build | Version paired with Next.js |
| Backend framework | Next.js route handlers/server actions | Application backend within one deployable app | Same Next.js version |
| API layer | Typed application boundary in Next.js | Account-protected browser/server operations | Define contracts with TypeScript |
| Database access and migrations | Prisma ORM and Prisma Migrate | Typed PostgreSQL access and versioned schema changes | Current stable release compatible with Node.js LTS |

## 4. Storage and Persistence

- **Storage model:** Hosted relational storage.
- **Primary data store:** Managed PostgreSQL.
- **User files or object storage:** Not selected; add managed object storage only if a product feature accepts files or media.
- **Local-development storage:** PostgreSQL in a Docker Compose service.
- **Production hosting model:** A managed PostgreSQL provider, independently provisioned from the web host.
- **Schema and migration approach:** Prisma schema and reviewed Prisma Migrate migrations; run production migrations as a controlled release step.
- **Backup, export, or recovery approach:** Enable the provider's automated backups and point-in-time recovery; confirm retention and restore ownership before launch.
- **Secrets and connection-string approach:** Store database URLs only in local untracked environment files and managed-host/GitHub secrets; never commit them.
- **Reason this storage fits the access pattern:** PostgreSQL supports accounts, ownership, permissions, and shared relational data reliably.

## 5. Testing Tools

| Test layer | Tool or library | Planned scope | Planned execution point |
|---|---|---|---|
| Unit | Vitest | Domain logic, utilities, authorization decisions, and route helpers | Local and pull requests |
| Component | React Testing Library with Vitest | Accessible component behavior and states | Local and pull requests |
| Integration | Vitest with a disposable PostgreSQL database | Database-backed routes and authentication boundaries | Local and pull requests |
| End-to-end | Playwright | Sign-in and the most important public and collaborative workflows | Pull requests and releases |

## 6. Test Analysis

| Capability | Tool | Planned policy |
|---|---|---|
| Coverage | Vitest V8 coverage | Collect and publish coverage for unit, component, and integration tests. |
| Coverage threshold or regression rule | Vitest coverage thresholds | Start with a modest 70% line/function baseline; raise only after meaningful coverage is established. |
| Mutation testing | Not initially selected | Reconsider Stryker for small, high-risk authorization or billing modules only. |
| Flaky-test or duration analysis | GitHub Actions job timing and Playwright retries | Investigate recurring retries; do not conceal persistent flakiness. |
| Reporting | GitHub Actions artifacts | Retain coverage output and Playwright traces/screenshots on failures. |

## 7. Static Analysis and Security

| Check | Tool | Planned enforcement |
|---|---|---|
| Formatting | Prettier | Blocking verification on pull requests. |
| Linting | ESLint with Next.js rules | Blocking pull-request check. |
| Type checking | TypeScript compiler (`tsc --noEmit`) | Blocking pull-request check. |
| Dependency vulnerability scanning | Dependabot and npm audit in CI | Dependabot updates enabled; fail CI for actionable high/critical findings after triage policy is defined. |
| Secret scanning | Gitleaks | Blocking pull-request and scheduled scan. |
| Static security analysis | GitHub CodeQL (JavaScript/TypeScript) | Blocking pull-request scan where practical; scheduled full scan. |

## 8. Development Technologies Requiring Manual Installation

These are developer-workstation prerequisites that will not be supplied by the planned Docker environment.

| Technology | Why it is needed | Required on which machines | Version policy | Planned installation or verification method | Why Docker does not provide it |
|---|---|---|---|---|---|
| Git | Source control and GitHub workflow | All developer machines | Current supported stable | Future onboarding verification | Host repository workflow |
| Node.js and npm | Next.js development, tests, and builds | All developer machines and CI runners | Node.js LTS | Future version-manager or installer setup | App remains host-run in this plan |
| Docker Desktop/Engine with Compose | Local PostgreSQL service | Developer machines needing database-backed work | Current supported stable | Future Docker verification | Docker is used only for the database service |
| Supported browser | Manual development and Playwright browser execution | Developer machines and CI | Current stable | Future Playwright-managed browser setup | Browser UI validation runs outside the database container |

### Host tools intentionally not required

- **Not required because Docker supplies them:** Local PostgreSQL server installation.
- **Not required for this platform:** Native mobile SDKs, Xcode, Android Studio, desktop packaging SDKs, code-signing tools, and a production container runtime.

## 9. Docker Plan

- **Planned Docker role:** Local services only.
- **Future files that would be created during implementation:** `compose.yml`, a database initialization/migration integration if needed, and `.dockerignore` only if an application image is later introduced.
- **Planned images and services:** Official supported PostgreSQL image as a single `db` service.
- **Development container behavior:** The Next.js application runs on the host; Docker provides an isolated local database.
- **Ports:** Bind PostgreSQL to `localhost` only; choose and document a non-conflicting development port.
- **Bind mounts and named volumes:** Use a named volume for PostgreSQL data; no source-code bind mount is required.
- **Environment-variable and secret handling:** Compose reads non-committed local variables; use development-only credentials and never put production secrets in Compose files.
- **Local database or service containers:** PostgreSQL only.
- **Production image or non-container release path:** Deploy the compiled Next.js application to managed web hosting; use managed PostgreSQL in production.
- **Build stages and hardening:** Not applicable to the selected deployment path. If a future production image is added, require multi-stage builds, a non-root user, minimal runtime image, `.dockerignore`, health checks, and no embedded secrets.
- **Planned future development command:** `docker compose up -d db` (run only during implementation).
- **Planned future database shutdown command:** `docker compose down` (run only during implementation; retain the named volume unless intentionally resetting local data).

## 10. GitHub Actions Plan

### A. Automated pull-request checks

- **Future workflow file:** `.github/workflows/pr-checks.yml`
- **Trigger:** `pull_request`.
- **Runner or matrix:** Ubuntu latest with the selected Node.js LTS; add a browser-compatible runner for Playwright.
- **Permissions:** `contents: read`; grant only job-specific permissions where reporting requires them.
- **Planned jobs in order:**
  1. Checkout, set up Node.js, restore npm cache, and install with lockfile enforcement (`npm ci`).
  2. Run Prettier verification, ESLint, TypeScript checking, and unit/component tests with coverage.
  3. Start a PostgreSQL service container; apply test migrations and run integration tests.
  4. Build the Next.js application to validate production compilation.
  5. Run Playwright end-to-end workflows against the built application and test database.
  6. Run Gitleaks and applicable CodeQL analysis; upload coverage and failure artifacts.
- **Service containers:** PostgreSQL for integration and end-to-end test jobs.
- **Caching:** Cache npm's package-download cache keyed by OS, Node.js major, and lockfile hash; do not cache `node_modules`.
- **Coverage and analysis reporting:** Upload coverage; enforce the selected Vitest threshold; publish CodeQL findings through GitHub security features.
- **Failure artifacts:** Playwright traces, screenshots, videos when enabled, test logs, and coverage reports.
- **Checks that should block merging:** Dependency installation, format, lint, type check, test/coverage threshold, build, E2E, Gitleaks, and required CodeQL results.
- **Proposed branch-protection settings:** Require all blocking checks, one approving review, up-to-date branch before merge, and no force pushes to the protected default branch.

### B. New-release deployment

- **Future workflow file:** `.github/workflows/release.yml`
- **Release trigger:** A protected `v*` version tag or manual dispatch with an explicit version and target environment.
- **Release destination:** Managed web hosting for Next.js, plus managed PostgreSQL.
- **Runner or matrix:** Ubuntu latest with selected Node.js LTS.
- **Planned jobs in order:**
  1. Checkout, lockfile-enforced install, and rerun required format, lint, type, test, coverage, and production-build validation.
  2. Require production-environment approval, apply reviewed Prisma migrations once, and deploy to the managed host.
  3. Run post-deployment smoke tests against the production URL and publish release notes.
- **Build artifacts:** Managed-host build/deployment artifact; retain build and smoke-test logs.
- **Signing, notarization, or store requirements:** None for a browser application.
- **Database migration step:** Run Prisma migrations after validation and before or as part of the compatible deployment; migrations must be backward-compatible with rolling traffic.
- **Environment approval:** Use a protected GitHub `production` environment.
- **Post-deployment verification:** Smoke-test a public page, an authenticated route using a non-privileged test account where feasible, and database connectivity through the app.
- **Failed-release or rollback approach:** Stop promotion, restore the prior web deployment, and use only pre-tested reversible database migration/recovery procedures; do not automatically roll back destructive schema changes.

### GitHub configuration required later

| Name | Type | Purpose |
|---|---|---|
| `DATABASE_URL` | Secret | Production PostgreSQL connection string for migrations/application configuration. |
| `DIRECT_URL` | Secret | Direct PostgreSQL connection for migration tooling when the provider requires it. |
| `AUTH_SECRET` | Secret | Signs/encrypts application authentication sessions. |
| Authentication provider credentials | Secrets | OAuth/client credentials if external sign-in is selected. |
| Managed-host deployment token | Secret | Authorizes deployment from GitHub Actions. |
| Managed-host project/organization identifiers | Variables | Selects the correct hosting target without storing secrets. |
| `production` | GitHub environment | Adds approvals and scopes production secrets. |
| PostgreSQL provider account | External account | Hosts production data and backups. |
| Managed web-host account | External account | Hosts the public Next.js application. |

## 11. Planned Repository Artifacts - Not Created by This Skill

- [ ] Application manifest or project file: `package.json`
- [ ] Lockfile: `package-lock.json`
- [ ] Test configuration: Vitest, Testing Library, and Playwright configuration
- [ ] Static-analysis configuration: Prettier, ESLint, TypeScript, Gitleaks, and CodeQL configuration as applicable
- [ ] Docker or Compose files: `compose.yml` for local PostgreSQL
- [ ] `.github/workflows/pr-checks.yml`
- [ ] `.github/workflows/release.yml`
- [ ] Deployment configuration: Managed-host project settings and environment-variable configuration

## 12. Assumptions and Open Items

- **Assumptions:** The application has ordinary relational account and collaboration data, does not initially accept user files, and can operate online.
- **Decisions still requiring an external account, credential, certificate, or organizational approval:** Managed web-host selection, PostgreSQL provider selection, authentication provider/sign-in methods, deployment credentials, and production-environment approvers.
- **Items to confirm before implementation begins:** Supported-browser matrix, product-specific authorization model, data retention/backup requirements, production coverage baseline after the initial suite, database provider region, and hosting provider.
