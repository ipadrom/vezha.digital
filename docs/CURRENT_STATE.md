# Current state

Snapshot: 2026-08-31. This is a static repository assessment; live production was not queried.

## Working capabilities

- Public bilingual landing and service pages.
- Public project/case pages with structured case blocks and local fallbacks.
- Telegram-authenticated admin studio.
- CRUD for services, projects, content dictionaries and site settings.
- Case draft, publish, hide, duplicate, revision and restore flows.
- Media upload and MinIO-backed media library.
- Contact-request persistence and Telegram notification attempt.
- Docker development and production topologies.
- Two supporting Remotion projects with render and lint commands.

## Verification state

- Backend has 3 pytest files with 21 test functions.
- Frontend has 6 `node:test` files with a large set of structural and behavior assertions.
- Tests are not executed by GitHub Actions.
- Frontend has no canonical `test` or `lint` package script.
- Live Telegram login, MinIO, production data, DNS/reverse proxy and deployment health are `Unknown / needs verification`.

## Known maintenance issues

- Frontend Docker invokes Yarn but does not copy `yarn.lock` before its frozen install; the root Makefile uses npm. The canonical package manager and a lock-reproducible Docker path need a decision.
- Root scaffolding files and the placeholder `backend/main.py` can mislead new contributors.
- Legacy `DEPLOY.md` and `deploy.sh` do not describe the current GitHub Actions/Compose path. A token-shaped literal in `DEPLOY.md` requires external verification and possible rotation before sanitization.
- Local ignored artifacts include dependency directories, builds, logs, Remotion outputs, visual QA captures and an intentional secondary worktree. They were not cleaned.
- Manual code snapshots exist under ignored `design-concepts/`; retention needs a human decision.
- The frontend landing page and fallback case utilities are large and deserve careful, focused changes rather than broad rewrites.

## Current priorities

1. Verify and contain the credential-like value in legacy deployment documentation.
2. Select one frontend package manager and make development/CI commands consistent.
3. Add non-deploy CI gates for backend tests, frontend tests and linting.
4. Confirm the canonical reverse-proxy and production environment documentation.
5. Keep case schemas, frontend renderers and migration-backed content synchronized.
