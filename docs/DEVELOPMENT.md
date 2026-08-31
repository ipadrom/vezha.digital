# Development guide

## Prerequisites

- Docker with Compose for the full local stack.
- Python 3.11 and `uv` for backend-only work.
- Node.js 22 for frontend and Remotion work.
- A local environment file created from the nearest `.env.example`.

Never paste environment values into commands, tickets, logs or documentation.

## Full local stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

The development topology runs the frontend, backend, PostgreSQL and MinIO. Backend and frontend source directories are mounted for reload.

## Backend

```bash
cd backend
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The `dev` extra is required for the pytest and Ruff commands below. A runtime-only environment may use plain `uv sync`, but it will not install those optional tools.

Useful checks:

```bash
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

Create migrations only after inspecting models and current heads:

```bash
uv run alembic heads
uv run alembic revision --autogenerate -m "description"
```

Review generated migrations manually. Content migrations and data backfills are common in this repository.

## Frontend

The frontend source includes `yarn.lock`, so the direct contributor workflow can install from it:

```bash
cd frontend
yarn install --frozen-lockfile
yarn dev
yarn build
```

The production `frontend/Dockerfile` currently invokes `yarn install --frozen-lockfile` after copying only `package*.json`; it does not copy `yarn.lock` into that install layer. The production image therefore uses Yarn but is not reproducible from the repository lock file as written.

The root Makefile still uses npm. This is a known inconsistency, not permission to update lock files. Until a package manager and reproducible Docker path are selected, avoid dependency changes unless the task explicitly includes resolving the mismatch.

Frontend tests use Node's test runner but have no canonical package script. Run only the relevant existing test file using the Node version configured for the project, and record the exact command in the handoff. Do not claim the whole frontend suite passed unless every test file was run.

## Remotion

Each Remotion directory is an independent npm package. Use its README and package scripts. Rendered `out/` files are local deliverables and are ignored by Git.

## Safe change checklist

1. Confirm the target surface: public site, admin, API, schema, media or video.
2. Check `git status`; preserve unrelated work and the local worktree.
3. Search for existing components, composables, schemas and services.
4. Run focused checks.
5. Inspect `git diff --check` and the final diff.
6. Ensure no `.env`, uploaded media, build output or visual QA artifact was staged.
7. Update current documentation only for material system changes.

## Production boundary

Do not invoke the deploy workflow, production Compose, production Alembic, MinIO cleanup or reverse-proxy changes during local development unless explicitly authorized.
