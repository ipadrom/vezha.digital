# Current state

Snapshot: 2026-09-22. This is a static repository assessment; live production was not queried.

## Working capabilities

- Public bilingual landing (split into section components and composables) and service pages, with a scroll-aware mobile header shared by the landing and case pages.
- Public project/case pages with structured case blocks and local fallbacks.
- Telegram-authenticated admin studio.
- CRUD for services, projects, content dictionaries and site settings.
- Case draft, publish, hide, duplicate, revision and restore flows.
- Media upload and MinIO-backed media library.
- Contact-request persistence and Telegram notification attempt.
- Docker development and production topologies.
- Two supporting Remotion projects with render and lint commands.

## Verification state

- Backend has 15 pytest files with 63 test functions.
- Frontend has 11 `node:test` files, mostly structural assertions over component and CSS sources.
- Tests are not executed by GitHub Actions.
- Frontend has no canonical `test` or `lint` package script.
- Live Telegram login, MinIO, production data, DNS/reverse proxy and deployment health are `Unknown / needs verification`.

## Known maintenance issues

- Frontend Docker installs with `yarn install --frozen-lockfile` from `yarn.lock`, the root Makefile uses npm, and `frontend/` also contains a `pnpm-lock.yaml`. The canonical package manager needs a decision.
- Root scaffolding files and the placeholder `backend/main.py` can mislead new contributors.
- Legacy `DEPLOY.md` and `deploy.sh` do not describe the current GitHub Actions/Compose path. A token-shaped literal in `DEPLOY.md` requires external verification and possible rotation before sanitization.
- Local ignored artifacts include dependency directories, builds, logs, Remotion outputs and visual QA captures. They were not cleaned.
- Manual code snapshots exist under ignored `design-concepts/`; retention needs a human decision.
- Some landing composables are still large (`useLandingStackSphere.ts`, `useSectionLiquid.ts`), as are the fallback case utilities. Change them in focused steps rather than broad rewrites.
- Mobile header and overlay changes need a real-iPhone check; see `DEVELOPMENT.md`.

## Current priorities

1. Verify and contain the credential-like value in legacy deployment documentation.
2. Select one frontend package manager and make development/CI commands consistent.
3. Add non-deploy CI gates for backend tests, frontend tests and linting.
4. Confirm the canonical reverse-proxy and production environment documentation.
5. Keep case schemas, frontend renderers and migration-backed content synchronized.
