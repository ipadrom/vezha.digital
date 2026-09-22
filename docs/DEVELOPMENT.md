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

### Windows workstation: Docker startup recovery

If the workstation has `%LOCALAPPDATA%\DockerStartup\Start-DockerDesktop.ps1`, use that local launcher (or its Docker Desktop desktop shortcut) when Docker is stopped. A direct `docker desktop start` bypasses its stale-socket recovery. The helper preserves the two runtime socket directories as timestamped backups and leaves containers, volumes, WSL disks and settings intact. It refuses to change files while Desktop is running; quit a failed Desktop instance first. The helper's README describes its checks and shortcut rollback. This is a workstation workaround for AF_UNIX error 1920, not a repository dependency or a Docker factory reset.

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

The production `frontend/Dockerfile` copies `package.json` and `yarn.lock` before running `yarn install --frozen-lockfile`, so the container installs the versions fixed by the Yarn lock file.

The root Makefile still uses npm. This is a known inconsistency, not permission to update lock files. Until a package manager and reproducible Docker path are selected, avoid dependency changes unless the task explicitly includes resolving the mismatch.

Frontend tests use Node's test runner but have no canonical package script. Most of them read component and CSS sources and assert on their structure, so a refactor that moves code must move the matching assertions. Run the relevant files from `frontend/`:

```bash
node --experimental-strip-types --test tests/landingStackOrbit.test.ts
node --test tests/landingHeroCapsules.test.mjs
```

`--experimental-strip-types` is needed for `.ts` files on Node 22 and is harmless on newer versions. Record the exact command in the handoff, and do not claim the whole frontend suite passed unless every test file was run. On `main` as of 2026-09-22, six case-builder assertions in `wellnessCase.test.ts` already fail. Compare against a clean `HEAD` before attributing a failure to your change.

`nuxt dev` falls back to another port when 3000 is taken (for example by Docker). Do not run `yarn build` while `nuxt dev` is running, because they share `.nuxt/`.

### Checking mobile layout on a real iPhone

Chromium device emulation does not reproduce iOS Safari's status-bar and toolbar tinting, safe-area behavior or its focus-ring heuristics. For mobile header, overlay or safe-area changes, open the dev server on a phone before merging.

- Same Wi-Fi: `yarn dev --host`, then open `http://<machine-LAN-IP>:3000`.
- Any network over HTTPS: run a temporary Cloudflare quick tunnel (`brew install cloudflared`, no account needed) to the dev server's port:

  ```bash
  cloudflared tunnel --url http://localhost:3000 --http-host-header localhost:3000
  ```

  Open the printed `*.trycloudflare.com` URL on the phone. `--http-host-header` avoids Vite's host check. If `nuxt dev` listens only on IPv6, use `'http://[::1]:<port>'` (quoted in zsh). Anyone with the URL can open the site while the tunnel runs, so stop it after checking.

During `nuxt dev`, the public API client sends browser requests through the frontend's `/api` proxy. Nitro forwards them to `NUXT_PUBLIC_API_URL` (default `http://localhost:8000`), so alternate local preview ports do not require backend CORS changes. Production requests continue to use the configured API URL directly.

### Local loader playground

Run `node tools/loader-preview/server.mjs` from `frontend/` to open the standalone loader playground at `http://127.0.0.1:3002/`. It uses the site's `LandingLoaderPattern.vue` component with progress, font-size and spacing controls. Settings persist only in browser local storage; use the copy button to export them. Changes in the playground do not update the site's defaults. This tool is outside Nuxt's public routes and is not included in deployment.

## Remotion

Each Remotion directory is an independent npm package. Use its README and package scripts. Rendered `out/` files are local deliverables and are ignored by Git.

## Safe change checklist

1. Confirm the target surface: public site, admin, API, schema, media or video.
2. Check `git status`; preserve unrelated work and any local worktrees.
3. Search for existing components, composables, schemas and services.
4. Run focused checks.
5. Inspect `git diff --check` and the final diff.
6. Ensure no `.env`, uploaded media, build output or visual QA artifact was staged.
7. Update current documentation only for material system changes.

## Production boundary

Do not invoke the deploy workflow, production Compose, production Alembic, MinIO cleanup or reverse-proxy changes during local development unless explicitly authorized.
