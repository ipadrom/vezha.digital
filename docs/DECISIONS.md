# Technical decisions

This document records current architectural choices and unresolved choices. Git history remains the change history.

## Accepted decisions

### Separate Nuxt frontend and FastAPI backend

The public site and admin studio are a Nuxt application. Structured content, validation, authentication and persistence are handled by FastAPI. They communicate through explicit public and admin APIs.

### PostgreSQL for structured content, MinIO for media

Relational content, ordering, project blocks and revisions belong in PostgreSQL. Binary media belongs in MinIO/S3, with metadata and URLs stored relationally.

### Telegram-authenticated private studio

Administrator identity is verified through Telegram Login, restricted by an allowlist, then represented by a JWT. Local development login is conditional and must not become a production fallback.

### Structured case documents with revisions

Cases are represented as metadata plus ordered typed blocks. The established builder, serializer and public renderer are the extension point. Revisions provide restore capability; ad hoc parallel case formats are discouraged.

### Bilingual data and UI

Public content carries explicit Russian and English fields. Nuxt supplies UI localization. Missing translations should be handled intentionally, not silently copied from unrelated fields.

### Compose-based production deployment

The intended production topology is built and started by Docker Compose after a GitHub Actions SSH handoff. Backend startup applies migrations before serving traffic. The external reverse proxy remains server-managed infrastructure.

### Remotion is supporting media tooling

The two Remotion packages generate assets for Vezha cases. They remain in the repository but are not runtime services or separate business systems.

## Open decisions

### Frontend package manager

Docker uses Yarn while the Makefile uses npm, and both lock files exist. One manager must be selected before dependency maintenance. Until then: `Unknown / needs verification`.

### Canonical operational deployment documentation

GitHub Actions and `docker-compose.prod.yml` appear current, while `DEPLOY.md` and `deploy.sh` describe an older host/path. Live server state is `Unknown / needs verification`.

### Test gates

Backend and frontend tests exist but are not CI gates. The required fast suite, full suite and lint policy need an explicit decision.

### Legacy local artifacts and snapshots

The worktree is intentional; the long-term value of design code snapshots, root visual captures and retained Remotion renders needs a human retention decision.
