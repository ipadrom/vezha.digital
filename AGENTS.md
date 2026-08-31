# VEZHA Digital agent instructions

If the workspace-level `../../AGENTS.md` exists, read it first. This file remains the complete repository-level instruction set when the repository is used as a standalone clone; parent instructions may add stricter workspace safety rules.

## Scope and entry points

- Frontend entry: `frontend/app.vue`; routes are under `frontend/pages/`.
- Backend entry: `backend/app/main.py`. Ignore the placeholder `backend/main.py`.
- Public API is mounted under `/api`; authenticated administration is under `/api/admin`.
- Database models are in `backend/app/models/`; migrations are in `backend/alembic/versions/`.
- The current case system already has backend schemas/services, admin composables and public builders. Search before creating a second case-authoring path.

Work only in this repository unless a task explicitly names another project. Preserve `.worktrees/` and all unrelated local changes.

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

The local `.worktrees/cases-product-showcase` checkout is intentional. Do not delete or modify it from the main checkout unless explicitly requested.

## Development workflow

Read only the documentation relevant to the task:

- use `README.md` for repository orientation and common setup;
- use `docs/ARCHITECTURE.md` and `docs/CURRENT_STATE.md` for architecture, API, schema, authentication, integrations, persisted-content compatibility or cross-layer behavior;
- use `docs/DEVELOPMENT.md` for setup, tests and local workflows;
- use the deployment sections of the current docs, `.github/workflows/deploy.yml` and Compose/Docker configuration for deployment work;
- use `docs/DECISIONS.md` when a task changes or depends on an architectural decision.

Files under `docs/superpowers/` are historical plans and specifications. They are not proof of current behavior and should not be read unless the task specifically needs historical design rationale.

Before changing behavior:

1. Determine whether the target is public content, admin content, case documents, media, API, schema, authentication, integration, setup or deployment.
2. Read the relevant current documentation from the routing list above and inspect the implementation/configuration that proves current behavior.
3. Search frontend composables/utilities and backend services for an existing implementation before adding a new path.
4. Choose and patch the minimum file set.

After changing code:

1. Run focused backend or frontend checks described in `docs/DEVELOPMENT.md`.
2. Inspect the diff and verify no generated files or unrelated case content changed.
3. Update documentation only if architecture, public APIs, schema, authentication, external integrations, setup/development workflow, deployment, an accepted/open decision or persisted-content compatibility materially changed. Small bug fixes, copy/cosmetic changes and private implementation details normally require no documentation update.

## Database and deployment safety

Do not run production Alembic migrations, seed production, deploy, clear MinIO, delete volumes or change reverse-proxy configuration without explicit authorization.

For schema work, inspect all Alembic heads before creating a migration. Migrations in this repository also include content backfills; do not assume every migration is schema-only.

## Authentication

Production administration uses Telegram verification plus an allowlist and JWT. The development login endpoint is available only when backend docs/development mode is enabled. Do not broaden that condition without a security review.

## Package managers

Backend dependency management is `uv`. Frontend package-manager choice is currently unresolved: Docker uses Yarn, while Makefile commands use npm. Follow the workflow relevant to the file being changed and do not update both lock files as incidental work.
