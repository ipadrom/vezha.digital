# VEZHA Digital agent instructions

Apply available parent rules; this file also supports standalone clones.

## Scope and entry points

- Frontend entry: `frontend/app.vue`; routes are under `frontend/pages/`.
- Backend entry: `backend/app/main.py`. Ignore the placeholder `backend/main.py`.
- Public API is mounted under `/api`; authenticated administration is under `/api/admin`.
- Database models are in `backend/app/models/`; migrations are in `backend/alembic/versions/`.
- The landing is `frontend/pages/index.vue` composed from `components/landing/`, `composables/landing/` and `assets/css/landing-*.css`; the mobile header is `components/ui/MobileSiteMenu.vue`.
- The current case system already has backend schemas/services, admin composables and public builders. Search before creating a second case-authoring path.

Work only in this repository unless a task explicitly names another project. Preserve any `.worktrees/` checkouts and all unrelated local changes.

Before editing, inspect `git status`. Do not discard, reset, stash, commit or push existing work without explicit authorization.

## Secrets and working data

Never print `.env` files, Telegram tokens, JWT secrets, database credentials or MinIO credentials. `frontend/.env.production` contains public build configuration, but do not turn it into a secret store.

Do not copy production content, contact requests or uploaded media into tests or documentation. Use synthetic examples.

## Generated and local artifacts

Do not edit or commit dependency/build output such as:

- `node_modules/`, `.nuxt/`, `.output/`;
- `.venv/`, `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`;
- Remotion `out/` unless a media-delivery task explicitly requires rendered artifacts;
- `.codex-logs/`, `browser/`, root `image*.png` and local design/QA output.

## Development workflow

Read relevant source and direct dependencies first; reuse existing composables, utilities, services and case-authoring paths. Patch the minimum file set. Read docs only when needed:
- `README.md`: orientation/setup; `docs/DEVELOPMENT.md`: commands and checks.
- `docs/ARCHITECTURE.md`, `docs/CURRENT_STATE.md`: architecture, API, schema, auth, integrations, persisted-content compatibility or cross-layer behavior.
- Deployment docs, `.github/workflows/deploy.yml`, Compose/Docker: deployment tasks.
- `docs/DECISIONS.md`: relevant architectural decisions.
- `docs/superpowers/`: historical rationale only, never proof of current behavior.

Reuse already verified context. Batch independent checks and keep output bounded. Run focused checks from DEVELOPMENT (frontend tests: `node --experimental-strip-types --test tests/<file>`), check mobile layout changes on a real iPhone (Chromium previews miss Safari's status-bar tinting), review the diff for generated files or unrelated case changes. Update docs only for material changes to the contracts/workflows above or accepted/open decisions; cosmetic fixes and private refactors normally need none.

## Database and deployment safety

Do not run production Alembic migrations, seed production, deploy, clear MinIO, delete volumes or change reverse-proxy configuration without explicit authorization.

For schema work, inspect all Alembic heads before creating a migration. Migrations in this repository also include content backfills; do not assume every migration is schema-only.

## Authentication

Production administration uses Telegram verification plus an allowlist and JWT. The development login endpoint is available only when backend docs/development mode is enabled. Do not broaden that condition without a security review.

## Package managers

Backend dependency management is `uv`. Frontend package-manager choice is currently unresolved: Docker uses Yarn, while Makefile commands use npm. Follow the workflow relevant to the file being changed and do not update both lock files as incidental work.
