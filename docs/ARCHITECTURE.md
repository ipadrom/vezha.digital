# VEZHA Digital architecture

## System context

VEZHA Digital is a bilingual public website with a private content studio. Public pages consume structured content from the API and render project cases, services and agency information. Administrators authenticate through Telegram and edit content, media and case documents.

```text
Browser
  ├── Nuxt public site ───────────────┐
  └── Nuxt admin studio + JWT ───────┤
                                      v
                               FastAPI API
                                ├── PostgreSQL
                                ├── MinIO/S3
                                └── Telegram Bot API
```

An external reverse proxy terminates public HTTP/TLS and routes requests to the frontend and backend containers. Exact production proxy configuration is `Unknown / needs verification` from local files alone.

## Frontend

`frontend/` is a Nuxt 3 application.

- `pages/index.vue` renders the main landing experience.
- `pages/services/[id].vue` renders service detail.
- `pages/cases/[slug].vue` renders published cases.
- `pages/admin/` contains the private studio, media library, project management and case builder.
- `composables/useApi.ts` is the public API client.
- `composables/useAuth.ts` stores the admin JWT and calls protected endpoints.
- `composables/useCaseAdmin.ts` and `utils/caseBuilder.ts` are part of the existing case-authoring system.
- `components/case-builder/` renders structured case documents publicly.
- `locales/` contains `ru/en` UI strings; content records also carry language-specific fields.

Local fallback case/content utilities exist so selected pages can render when API content is unavailable. They are not a second database and should not silently diverge from published content.

## Backend and API

`backend/app/main.py` creates the FastAPI application, CORS middleware, upload mount and routers.

Public `/api` groups:

- services and their items/features/examples;
- projects and published cases;
- advantages, client types and about sections;
- technology stack and work stages;
- public settings and section visibility;
- contact request submission.

Protected `/api/admin` groups add CRUD, ordering, uploads, media management, contact-request processing and case revision/publish/hide/duplicate/restore operations.

The backend is layered into:

- `api/` for HTTP routing;
- `schemas/` for request/response and case-document contracts;
- `services/` for serialization, case assembly, caching and external calls;
- `models/` for persistence;
- `core/` for database, security and storage.

## Data model

PostgreSQL is the structured source of truth. Main domains are:

- administrators and contact requests;
- services, service items, features and examples;
- projects, metrics, gallery items and technologies;
- project blocks and project revisions for the case builder;
- site settings and section visibility;
- advantages, client types, about sections, technology entries and work stages.

Project-owned child records use foreign keys with cascade behavior. Project revisions preserve restorable case snapshots. Alembic migrations include both schema changes and curated content backfills.

MinIO/S3 stores uploaded media; PostgreSQL stores media metadata and URLs. Local `backend/uploads/` remains as a compatibility/static mount and is not the preferred production media source.

## Authentication

1. The frontend loads the Telegram Login widget.
2. Backend validates Telegram auth data using the bot token.
3. The Telegram user ID must be in the configured admin allowlist.
4. Backend creates or updates the admin record and issues an HS256 JWT.
5. Frontend stores the token in `localStorage` and sends it as a Bearer token.

For localhost development, the UI may call a dev-login endpoint. Backend permits it only when documentation/development mode is enabled.

## Case publishing flow

```text
Admin edits case document
  -> backend validates meta + ordered blocks
  -> draft project/blocks are persisted
  -> publish creates the public snapshot/revision state
  -> public API serializes the published project
  -> Nuxt case page renders through PublicCaseBuilder
```

The case builder is an established product surface. New case formats should extend its block/schema system unless a separate architecture is explicitly approved.

The portfolio contains authored projects only. `seed.py` neither creates demo
projects nor clears existing cases, and frontend fallbacks must not invent work.
Retired seed cases are removed from `projects` and its child tables; their original
rows are retained in `retired_demo_case_backups` for manual recovery and are not
exposed by the public API or admin case list. Media storage is not deleted.

The `technologies` block supports `map`, `tags` and `contours` layouts. In `contours`,
items with the same localized `group` form an outlined group, ordered by first
appearance in the item list. Groups use two columns on larger screens and stack on
small phones. Selecting a pill displays its `description` and `related_ids` in a
side panel. Item `id` values are stable and language-independent; labels, roles,
groups and descriptions are localized. Legacy items without IDs retain a
deterministic index fallback. Icons use allowlisted keys from
`frontend/utils/caseTechnologies.ts` and bundled SVGs, with a generic component
fallback. The public page and admin canvas share `CaseTechnologyContours.vue`;
the existing inspector edits these fields without a separate editor or API.

The existing `challenge_solution` and `results` blocks also offer an opt-in `air`
layout ("Текст и воздух"). `CaseEditorialAir.vue` is shared by the public page and
the editable admin canvas. It keeps the section heading on the left, uses
`solution_label` / `impact_label` as inline introductions to their paragraphs,
and displays result items in an unnumbered two-column grid. Result items may
include an optional `title` alongside `text`; older text-only items are unchanged.
On narrow containers the layout stacks. Existing default layouts are preserved.

## Media tooling

- `media/wellness-promo-remotion/` produces the Training product film and compact process/context animations.
- `video/wellness-promo/` produces storyboard and final lifestyle promo compositions.

These packages support Vezha project cases. They are not separate business services and have no backend runtime dependency.

## Deployment

The current intended production path is:

```text
push to main
  -> GitHub Actions SSH workflow
  -> update server checkout
  -> docker compose -f docker-compose.prod.yml build/up
  -> backend runs Alembic before Uvicorn
  -> workflow waits for backend /health
```

Production compose runs frontend, backend, PostgreSQL and MinIO on a private Docker network with loopback-bound host ports. The externally installed reverse proxy is outside this repository.
