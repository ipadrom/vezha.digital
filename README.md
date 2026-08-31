# VEZHA Digital

Production website and content platform for VEZHA Digital. The repository contains a public Nuxt site, an authenticated content studio/case builder, a FastAPI API, PostgreSQL, MinIO media storage and supporting Remotion projects.

## Repository layout

```text
frontend/                         Nuxt 3 public site and admin studio
backend/                          FastAPI API, SQLAlchemy models and Alembic migrations
media/wellness-promo-remotion/    Training product film and process animations
video/wellness-promo/             Lifestyle storyboard/final promo
docs/                             Current architecture and development documentation
docker-compose.dev.yml            Local container development
docker-compose.prod.yml           Production service topology
.github/workflows/deploy.yml      Production SSH deployment
```

The root `pyproject.toml`, root `package-lock.json` and `backend/main.py` are scaffolding remnants, not application entry points.

## Stack

- Frontend: Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Three.js and bilingual `ru/en` content.
- Backend: FastAPI, async SQLAlchemy, asyncpg, Alembic and Pydantic Settings.
- Data: PostgreSQL for structured content; MinIO/S3 for media.
- Authentication: Telegram Login for allowlisted administrators, followed by a JWT.
- Delivery: Docker Compose, GitHub Actions, SSH and an external reverse proxy.

## Development

Copy only the relevant `.env.example` files and fill secrets locally. Never commit or print `.env` values.

```bash
# Full local stack
docker compose -f docker-compose.dev.yml up --build

# Backend only
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend only
cd frontend
yarn install --frozen-lockfile
yarn dev
```

The repository currently has an unresolved npm/Yarn inconsistency: production frontend Docker uses Yarn while the root Makefile uses npm. Do not regenerate either lock file until one package manager is explicitly selected.

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for checks and safe workflows, and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for system boundaries.

## Safety

Read [`AGENTS.md`](AGENTS.md) before making changes. Production deploys, migrations, storage cleanup and credential operations require an explicit user request.
