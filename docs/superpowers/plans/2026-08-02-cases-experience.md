# Cases Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Case Dossier landing section and Story + Evidence case pages with one optional Technical Dossier module and localized backend content.

**Architecture:** Extend the existing `Project` aggregate with fixed bilingual narrative fields and three ordered child collections for metrics, gallery items, and technologies. The public API returns localized project summaries and one slug-addressable detail payload; focused Vue components render the landing dossier and case longread from normalized data without fetching independently.

**Tech Stack:** FastAPI, SQLAlchemy 2 async, Alembic, Pydantic 2, PostgreSQL, Nuxt 3.12, Vue 3.4, TypeScript 5.5, CSS, Node test runner, pytest.

## Global Constraints

- Preserve the approved visual language: Onest UI type, JetBrains Mono metadata, monochrome structure, thin borders, and one controlled gradient accent.
- Place `LandingCases` after `LandingClients` and before `LandingDevelopmentAnatomy`.
- Do not pin the page, hijack vertical scrolling, or intercept the mouse wheel.
- Desktop uses a 220–260 px project rail; mobile below 900 px uses a one-line horizontal chip list.
- Show 3–6 featured cases ordered by `sort_order`; the first item is deterministic.
- Use 320–450 ms crossfade/12–16 px slide transitions and disable them for `prefers-reduced-motion`.
- Publish only supplied metrics. Never invent fallback performance numbers.
- The case detail route is `/cases/[slug]`; `project_url` remains an optional external product link.
- A missing optional data group removes its whole presentation block without leaving empty grid cells.
- Do not introduce a generic page builder or new frontend dependencies.

---

## File Structure

### Backend

- `backend/app/models/project.py` — expanded project root and relationships.
- `backend/app/models/project_metric.py` — ordered result/fact records.
- `backend/app/models/project_gallery_item.py` — ordered case imagery and localized captions.
- `backend/app/models/project_technology.py` — ordered stack/integration labels.
- `backend/app/schemas/project.py` — aggregate write/read schemas and localized public summary/detail schemas.
- `backend/app/services/projects.py` — aggregate child replacement and locale serialization.
- `backend/app/api/public/projects.py` — public list and slug detail endpoints.
- `backend/app/api/admin/projects.py` — nested create/update handling.
- `backend/alembic/versions/g7b8c9d0e1f2_expand_projects_for_cases.py` — schema migration.
- `backend/tests/test_project_schemas.py` — nested payload contract tests.
- `backend/tests/test_project_serialization.py` — locale and optional-block serialization tests.

### Frontend

- `frontend/utils/interfaces/IProjects.ts` — normalized summary/detail types.
- `frontend/utils/landingCases.ts` — pure featured-selection and metric-layout helpers.
- `frontend/composables/useApi.ts` — slug detail fetcher.
- `frontend/components/landing/LandingCases.vue` — active-case state, rail/chips, atomic content switching.
- `frontend/components/cases/CaseVisual.vue` — cover/fallback visual and featured metric.
- `frontend/components/cases/CaseMetricGrid.vue` — reusable responsive metrics.
- `frontend/components/cases/CaseDetailHeader.vue` — compact theme/language/navigation header.
- `frontend/components/cases/CaseGallery.vue` — ordered figures and captions.
- `frontend/components/cases/CaseTechnicalModule.vue` — optional architecture/integrations/stack chapter.
- `frontend/components/cases/CaseResults.vue` — result summary and verified metrics.
- `frontend/pages/cases/[slug].vue` — detail loading, SEO, 404, and composition.
- `frontend/assets/css/landing-cases.css` — landing dossier styles.
- `frontend/assets/css/case-detail.css` — longread styles.
- `frontend/pages/index.vue` — landing integration and copy typing.
- `frontend/locales/ru.json` and `frontend/locales/en.json` — cases UI copy and navigation.
- `frontend/tests/landingCases.test.ts` — helper behavior and locale contract tests.
- `frontend/tests/casesMarkup.test.mjs` — structural/accessibility regression tests.

---

### Task 1: Project Aggregate and Database Migration

**Files:**
- Create: `backend/app/models/project_metric.py`
- Create: `backend/app/models/project_gallery_item.py`
- Create: `backend/app/models/project_technology.py`
- Modify: `backend/app/models/project.py`
- Modify: `backend/app/models/__init__.py`
- Create: `backend/alembic/versions/g7b8c9d0e1f2_expand_projects_for_cases.py`
- Modify: `backend/app/schemas/project.py`
- Modify: `backend/app/schemas/__init__.py`
- Create: `backend/tests/test_project_schemas.py`

**Interfaces:**
- Consumes: existing `Project` UUID primary key and bilingual field convention.
- Produces: `ProjectCreate`, `ProjectUpdate`, and `ProjectResponse` with `metrics`, `gallery`, and `technologies`; SQLAlchemy relationships with `cascade="all, delete-orphan"`.

- [ ] **Step 1: Write failing nested-schema tests**

```python
# backend/tests/test_project_schemas.py
from app.schemas.project import ProjectCreate, ProjectUpdate


def valid_project_payload() -> dict:
    return {
        "type_ru": "Telegram Mini App",
        "type_en": "Telegram Mini App",
        "name_ru": "Меню ресторана",
        "name_en": "Restaurant menu",
        "slug": "restaurant-menu",
        "subtitle_ru": "Меню, которое продаёт",
        "subtitle_en": "A menu that sells",
        "is_featured": True,
        "metrics": [
            {
                "value": "+28%",
                "label_ru": "конверсия в заказ",
                "label_en": "order conversion",
                "context_ru": "После запуска Mini App",
                "context_en": "After the Mini App launch",
                "sort_order": 0,
            }
        ],
        "gallery": [],
        "technologies": [{"label": "Vue", "category": "stack", "sort_order": 0}],
    }


def test_project_create_accepts_fixed_case_content() -> None:
    project = ProjectCreate.model_validate(valid_project_payload())
    assert project.slug == "restaurant-menu"
    assert project.metrics[0].label_ru == "конверсия в заказ"
    assert project.technologies[0].category == "stack"


def test_project_update_keeps_nested_collections_optional() -> None:
    update = ProjectUpdate.model_validate({"result_summary_ru": "Рост подтверждён"})
    assert update.metrics is None
    assert update.gallery is None
```

- [ ] **Step 2: Run the schema tests and confirm failure**

Run: `uv run pytest tests/test_project_schemas.py -q` from `backend/`  
Expected: FAIL because the new fields and child schemas do not exist.

- [ ] **Step 3: Add child models and expand the project root**

Create UUID child models with `project_id`, ordered fields, and `ondelete="CASCADE"`. Add these exact project fields:

```python
slug: Mapped[str | None] = mapped_column(String(160), unique=True, index=True, nullable=True)
subtitle_ru: Mapped[str | None] = mapped_column(String(255), nullable=True)
subtitle_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
industry_ru: Mapped[str | None] = mapped_column(String(160), nullable=True)
industry_en: Mapped[str | None] = mapped_column(String(160), nullable=True)
year: Mapped[str | None] = mapped_column(String(20), nullable=True)
timeline_ru: Mapped[str | None] = mapped_column(String(120), nullable=True)
timeline_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
challenge_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
challenge_en: Mapped[str | None] = mapped_column(Text, nullable=True)
solution_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
solution_en: Mapped[str | None] = mapped_column(Text, nullable=True)
result_summary_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
result_summary_en: Mapped[str | None] = mapped_column(Text, nullable=True)
cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
hero_metric_value: Mapped[str | None] = mapped_column(String(80), nullable=True)
hero_metric_label_ru: Mapped[str | None] = mapped_column(String(160), nullable=True)
hero_metric_label_en: Mapped[str | None] = mapped_column(String(160), nullable=True)
testimonial_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
testimonial_en: Mapped[str | None] = mapped_column(Text, nullable=True)
testimonial_author_ru: Mapped[str | None] = mapped_column(String(255), nullable=True)
testimonial_author_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
```

Define relationships with `lazy="selectin"` and ordered `sort_order`. Export all child models through `backend/app/models/__init__.py`.

- [ ] **Step 4: Add the migration**

Create nullable project columns so existing rows survive the migration, add a unique index for non-null `slug`, add `is_featured` with `server_default=sa.false()`, and create `project_metrics`, `project_gallery_items`, and `project_technologies`. The downgrade drops child tables before project columns.

- [ ] **Step 5: Add exact Pydantic child and aggregate schemas**

```python
class ProjectMetricInput(BaseModel):
    value: str
    label_ru: str
    label_en: str
    context_ru: str | None = None
    context_en: str | None = None
    sort_order: int = 0


class ProjectGalleryInput(BaseModel):
    image_url: str
    alt_ru: str
    alt_en: str
    caption_ru: str | None = None
    caption_en: str | None = None
    sort_order: int = 0


class ProjectTechnologyInput(BaseModel):
    label: str
    category: str = "stack"
    sort_order: int = 0
```

Use `Field(default_factory=list)` on create/response collections and `None` on update collections so omitted children are preserved while explicit empty arrays clear them.

- [ ] **Step 6: Run schema and lint checks**

Run: `uv run pytest tests/test_project_schemas.py -q`  
Expected: PASS.  
Run: `uv run ruff check app/models app/schemas tests/test_project_schemas.py`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/app/models backend/app/schemas backend/alembic/versions/g7b8c9d0e1f2_expand_projects_for_cases.py backend/tests/test_project_schemas.py
git commit -m "feat: extend projects with case content"
```

---

### Task 2: Localized Project API and Aggregate Persistence

**Files:**
- Create: `backend/app/services/projects.py`
- Modify: `backend/app/api/public/projects.py`
- Modify: `backend/app/api/admin/projects.py`
- Modify: `backend/app/schemas/project.py`
- Create: `backend/tests/test_project_serialization.py`

**Interfaces:**
- Consumes: nested project models and schemas from Task 1.
- Produces: `serialize_project_summary(project, lang) -> ProjectPublic`, `serialize_project_detail(project, lang) -> ProjectDetailPublic`, `replace_project_children(project, payload) -> None`, public `GET /api/projects/{slug}`.

- [ ] **Step 1: Write failing locale serialization tests**

```python
# backend/tests/test_project_serialization.py
from types import SimpleNamespace

from app.services.projects import serialize_project_detail, serialize_project_summary


def project_fixture():
    return SimpleNamespace(
        id="00000000-0000-0000-0000-000000000001",
        slug="restaurant-menu",
        type_ru="Мини-приложение",
        type_en="Mini App",
        name_ru="Меню ресторана",
        name_en="Restaurant menu",
        subtitle_ru="Меню, которое продаёт",
        subtitle_en="A menu that sells",
        industry_ru="Foodtech",
        industry_en="Foodtech",
        description_ru="Короткое описание",
        description_en="Short description",
        challenge_ru="Сложный заказ",
        challenge_en="A difficult order flow",
        solution_ru="Один сценарий",
        solution_en="One flow",
        result_summary_ru="Рост конверсии",
        result_summary_en="Conversion increased",
        image_url=None,
        cover_image_url="/cover.webp",
        project_url=None,
        year="2026",
        timeline_ru="4 недели",
        timeline_en="4 weeks",
        hero_metric_value="+28%",
        hero_metric_label_ru="конверсия",
        hero_metric_label_en="conversion",
        testimonial_ru=None,
        testimonial_en=None,
        testimonial_author_ru=None,
        testimonial_author_en=None,
        is_featured=True,
        sort_order=0,
        metrics=[],
        gallery=[],
        technologies=[],
    )


def test_summary_uses_requested_locale() -> None:
    summary = serialize_project_summary(project_fixture(), "en")
    assert summary.name == "Restaurant menu"
    assert summary.hero_metric_label == "conversion"


def test_detail_keeps_optional_technical_collection_empty() -> None:
    detail = serialize_project_detail(project_fixture(), "ru")
    assert detail.slug == "restaurant-menu"
    assert detail.technologies == []
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `uv run pytest tests/test_project_serialization.py -q` from `backend/`  
Expected: FAIL because the serializer module does not exist.

- [ ] **Step 3: Implement locale serializers**

Create a private helper:

```python
def localized(project: object, field: str, lang: str):
    return getattr(project, f"{field}_{lang}", None)
```

`ProjectPublic` includes landing fields, at most the supplied collections, `is_featured`, and `sort_order`. `ProjectDetailPublic` additionally includes challenge, solution, result summary, testimonial, gallery captions, technology category, and metric context. Never synthesize a metric value.

- [ ] **Step 4: Implement atomic child replacement**

```python
CHILD_MODELS = {
    "metrics": ProjectMetric,
    "gallery": ProjectGalleryItem,
    "technologies": ProjectTechnology,
}


def replace_project_children(project: Project, payload: dict) -> None:
    for field, model in CHILD_MODELS.items():
        if field not in payload:
            continue
        setattr(project, field, [model(**item) for item in payload.pop(field)])
```

Call this after `model_dump(exclude_unset=True)` and before commit in both create and update. On create, default child arrays may be empty.

- [ ] **Step 5: Extend public routes**

The list endpoint eagerly loads child collections, orders active projects, and serializes summaries. Add the slug route:

```python
@router.get("/{slug}", response_model=ProjectDetailPublic)
async def get_project_by_slug(db: DbSession, slug: str, lang: str = Query("ru", pattern="^(ru|en)$")):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.metrics), selectinload(Project.gallery), selectinload(Project.technologies))
        .where(Project.slug == slug, Project.is_active)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_project_detail(project, lang)
```

- [ ] **Step 6: Run API-focused checks**

Run: `uv run pytest tests/test_project_schemas.py tests/test_project_serialization.py -q`  
Expected: PASS.  
Run: `uv run ruff check app/api app/services/projects.py tests`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/app/api backend/app/services/projects.py backend/app/schemas/project.py backend/tests/test_project_serialization.py
git commit -m "feat: expose localized case project API"
```

---

### Task 3: Frontend Case Contracts, Copy, and Pure Helpers

**Files:**
- Modify: `frontend/utils/interfaces/IProjects.ts`
- Create: `frontend/utils/landingCases.ts`
- Modify: `frontend/composables/useApi.ts`
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`
- Create: `frontend/tests/landingCases.test.ts`

**Interfaces:**
- Consumes: localized public payloads from Task 2.
- Produces: `IProjectSummary`, `IProjectDetail`, `selectFeaturedProjects()`, `getNextProject()`, `getMetricGridClass()`, `getProjectBySlug()`.

- [ ] **Step 1: Write failing helper and locale tests**

```ts
// frontend/tests/landingCases.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getMetricGridClass, getNextProject, selectFeaturedProjects } from "../utils/landingCases";

const projects = Array.from({ length: 8 }, (_, index) => ({
  id: String(index),
  slug: `case-${index}`,
  is_featured: index !== 1,
  sort_order: 8 - index,
})) as any[];

test("selects at most six featured projects in sort order", () => {
  assert.deepEqual(
    selectFeaturedProjects(projects).map(({ slug }) => slug),
    ["case-7", "case-6", "case-5", "case-4", "case-3", "case-2"],
  );
});

test("maps metric counts without empty cells", () => {
  assert.equal(getMetricGridClass(1), "is-single");
  assert.equal(getMetricGridClass(2), "is-pair");
  assert.equal(getMetricGridClass(3), "is-triple");
});

test("wraps next-case navigation across the featured list", () => {
  const featured = selectFeaturedProjects(projects);
  assert.equal(getNextProject(featured, "case-2")?.slug, "case-7");
});

test("provides cases copy and navigation in both locales", () => {
  for (const locale of ["ru", "en"]) {
    const messages = JSON.parse(readFileSync(`locales/${locale}.json`, "utf8"));
    assert.equal(messages.landing.nav.items.some((item: any) => item.href === "#cases"), true);
    assert.ok(messages.landing.cases.title);
    assert.ok(messages.caseDetail.nextCase);
  }
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test --experimental-strip-types tests/landingCases.test.ts` from `frontend/`  
Expected: FAIL because `landingCases.ts` and localized copy do not exist.

- [ ] **Step 3: Define frontend payload types**

```ts
export interface IProjectMetric {
  id?: string;
  value: string;
  label: string;
  context?: string | null;
  sort_order: number;
}

export interface IProjectSummary {
  id: string;
  slug: string | null;
  type: string;
  name: string;
  subtitle?: string | null;
  industry?: string | null;
  description?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  project_url?: string | null;
  hero_metric_value?: string | null;
  hero_metric_label?: string | null;
  is_featured: boolean;
  sort_order: number;
  metrics: IProjectMetric[];
}
```

`IProjectDetail` extends the summary with `year`, `timeline`, `challenge`, `solution`, `result_summary`, `testimonial`, `testimonial_author`, `gallery`, and `technologies`.

- [ ] **Step 4: Implement deterministic helpers and API fetcher**

```ts
export function selectFeaturedProjects(projects: IProjectSummary[]) {
  return projects
    .filter((project) => project.is_featured && project.slug)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 6);
}

export function getMetricGridClass(count: number) {
  if (count <= 1) return "is-single";
  if (count === 2) return "is-pair";
  return "is-triple";
}

export function getNextProject(projects: IProjectSummary[], currentSlug: string) {
  if (projects.length < 2) return null;
  const index = projects.findIndex(({ slug }) => slug === currentSlug);
  if (index < 0) return null;
  return projects[(index + 1) % projects.length] ?? null;
}
```

Add `getProjectBySlug(slug, lang)` to `useApi` and return `IProjectDetail`.

- [ ] **Step 5: Add localized cases copy**

Add `#cases` navigation items and mirrored `landing.cases` keys: `label`, `title`, `hint`, `tabAria`, `openCase`, `empty`, and `metricAria`. Add `caseDetail` keys for chapter labels, product link, next case, contact CTA, loading, and not-found states.

- [ ] **Step 6: Run tests and type preparation**

Run: `node --test --experimental-strip-types tests/landingCases.test.ts`  
Expected: PASS.  
Run: `npx nuxi prepare`  
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add frontend/utils frontend/composables/useApi.ts frontend/locales frontend/tests/landingCases.test.ts
git commit -m "feat: add frontend case data contracts"
```

---

### Task 4: Landing Case Dossier

**Files:**
- Create: `frontend/components/cases/CaseVisual.vue`
- Create: `frontend/components/cases/CaseMetricGrid.vue`
- Create: `frontend/components/landing/LandingCases.vue`
- Create: `frontend/assets/css/landing-cases.css`
- Modify: `frontend/pages/index.vue`
- Create: `frontend/tests/casesMarkup.test.mjs`

**Interfaces:**
- Consumes: `IProjectSummary[]`, `landing.cases` copy, `selectFeaturedProjects()`, `getMetricGridClass()`.
- Produces: `<LandingCases :projects :copy />`, internal `/cases/:slug` links, accessible desktop tabs and mobile chips.

- [ ] **Step 1: Write failing structural tests**

```js
// frontend/tests/casesMarkup.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexPage = readFileSync("pages/index.vue", "utf8");
const component = readFileSync("components/landing/LandingCases.vue", "utf8");
const css = readFileSync("assets/css/landing-cases.css", "utf8");

test("places cases between clients and development anatomy", () => {
  const clients = indexPage.indexOf("<LandingClients");
  const cases = indexPage.indexOf("<LandingCases");
  const stages = indexPage.indexOf("<LandingDevelopmentAnatomy");
  assert.ok(clients < cases && cases < stages);
});

test("uses accessible tab selection and internal case links", () => {
  assert.match(component, /role="tablist"/);
  assert.match(component, /:aria-selected="index === activeIndex"/);
  assert.match(component, /`\/cases\/\$\{activeProject\.slug\}`/);
});

test("keeps mobile chips on one line without scroll hijacking", () => {
  assert.match(css, /\.vz-cases__chips\s*\{[^}]*overflow-x:\s*auto;/s);
  assert.match(css, /\.vz-cases__chips\s*\{[^}]*flex-wrap:\s*nowrap;/s);
  assert.doesNotMatch(component, /wheel|preventDefault/);
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/casesMarkup.test.mjs` from `frontend/`  
Expected: FAIL because the components and stylesheet do not exist.

- [ ] **Step 3: Implement reusable visual and metric components**

`CaseVisual.vue` renders `cover_image_url || image_url` with a fixed aspect ratio and `@error` fallback class. The fallback is a CSS-only VEZHA grid with the project number and does not invent imagery. Render the floating metric only when both value and label exist.

`CaseMetricGrid.vue` renders only `metrics.slice(0, 3)` and applies `getMetricGridClass(metrics.length)`. Use a single accessible list with value and label in each item.

- [ ] **Step 4: Implement LandingCases state and markup**

```ts
const featured = computed(() => selectFeaturedProjects(props.projects));
const activeIndex = ref(0);
const activeProject = computed(() => featured.value[activeIndex.value] ?? null);

watch(featured, (items) => {
  if (activeIndex.value >= items.length) activeIndex.value = 0;
});

function selectProject(index: number) {
  activeIndex.value = index;
}
```

Use buttons for the rail/chips, `role="tablist"`, `role="tab"`, `aria-controls`, a single `role="tabpanel"`, and keyed transition content. Add left/right arrow keyboard navigation without changing page scroll behavior. When there are no featured cases, keep the section shell and its minimum height, render `copy.empty`, and do not create fake project metrics.

- [ ] **Step 5: Implement approved responsive CSS**

Desktop: bordered grid with `grid-template-columns: clamp(220px, 18vw, 260px) 1fr`; active panel copy/visual split; bottom metric strip. Below 900 px: single column, rail hidden, `.vz-cases__chips` displayed, full-width visual, primary metric full width followed by two half-width metrics. Add reduced-motion overrides.

- [ ] **Step 6: Integrate into the landing page**

Import `LandingCases`, extend `LandingCopy` with the exact cases copy shape, and insert:

```vue
<LandingCases :projects="projects" :copy="copy.cases" />
```

after `LandingClients`. Import `~/assets/css/landing-cases.css` once through the component style source or Nuxt CSS configuration.

Track a small `casesStatus` state (`"loading" | "ready" | "error"`) around the existing public-data request and pass it to `LandingCases`, so loading and error shells retain the same minimum height without flashing invented fallback content.

- [ ] **Step 7: Run component tests and frontend build**

Run: `node --test tests/casesMarkup.test.mjs`  
Expected: PASS.  
Run: `node --test --experimental-strip-types tests/landingCases.test.ts`  
Expected: PASS.  
Run: `npm run build`  
Expected: Nuxt build exits 0.

- [ ] **Step 8: Commit**

```bash
git add frontend/components/cases frontend/components/landing/LandingCases.vue frontend/assets/css/landing-cases.css frontend/pages/index.vue frontend/tests/casesMarkup.test.mjs
git commit -m "feat: add landing case dossier"
```

---

### Task 5: Story + Evidence Case Detail Page

**Files:**
- Create: `frontend/components/cases/CaseDetailHeader.vue`
- Create: `frontend/components/cases/CaseGallery.vue`
- Create: `frontend/components/cases/CaseTechnicalModule.vue`
- Create: `frontend/components/cases/CaseResults.vue`
- Create: `frontend/pages/cases/[slug].vue`
- Create: `frontend/assets/css/case-detail.css`
- Modify: `frontend/tests/casesMarkup.test.mjs`

**Interfaces:**
- Consumes: `getProjectBySlug(slug, lang) -> Promise<IProjectDetail>`, `getProjects(lang) -> Promise<IProjectSummary[]>`, `getNextProject()`, and shared case visual/metric components.
- Produces: localized `/cases/[slug]` page with 404 handling, optional chapters, SEO metadata, and external product link.

- [ ] **Step 1: Add failing detail-page tests**

Append:

```js
const detailPage = readFileSync("pages/cases/[slug].vue", "utf8");
const technical = readFileSync("components/cases/CaseTechnicalModule.vue", "utf8");

test("loads a case by route slug and locale", () => {
  assert.match(detailPage, /Promise\.all\(\[\s*getProjectBySlug\(slug, currentLocale\.value\),\s*getProjects\(currentLocale\.value\)/s);
  assert.match(detailPage, /createError\(\{ statusCode: 404/);
});

test("renders optional technical content only when supplied", () => {
  assert.match(detailPage, /v-if="project\.technologies\.length"/);
  assert.match(technical, /data-case-technical/);
});

test("protects external product links", () => {
  assert.match(detailPage, /target="_blank"/);
  assert.match(detailPage, /rel="noopener noreferrer"/);
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/casesMarkup.test.mjs` from `frontend/`  
Expected: FAIL because the detail files do not exist.

- [ ] **Step 3: Implement page loading and SEO**

Resolve the string slug from `useRoute()`. Use `useAsyncData` keyed by slug and locale to load `Promise.all([getProjectBySlug(slug, locale), getProjects(locale)])`; reload on locale change and derive the adjacent featured case with `getNextProject`. Convert API 404 into `createError({ statusCode: 404, statusMessage: copy.notFound })`. Use `useSeoMeta` with project subtitle/name and description; use cover image only when present.

- [ ] **Step 4: Compose the narrative page**

Render in this exact order: compact header, hero, facts grid, context/challenge, solution narrative, gallery, optional technical module, results, optional testimonial, next-case link, and contact CTA. Do not render a chapter heading when its content is empty.

- [ ] **Step 5: Implement the bounded Technical Dossier module**

Group technologies by `category` into `stack` and `integration`. Render a simple flow only when two or more integration items exist; otherwise render chips. On desktop, nodes flow horizontally. Below 900 px, use `grid-template-columns: 1fr` and rotate arrow semantics into a vertical flow with CSS.

- [ ] **Step 6: Implement responsive longread CSS**

Use the approved Story + Evidence rhythm: large split hero, four-cell facts strip, editorial two-column chapters, wide gallery, one dark technical chapter, dark results band, and final CTA. Below 900 px, use one column, 2×2 facts, vertical gallery, and stacked technical nodes. Add fixed aspect ratios and image error fallbacks to prevent layout shift.

- [ ] **Step 7: Run detail tests and build**

Run: `node --test tests/casesMarkup.test.mjs`  
Expected: PASS.  
Run: `npm run build`  
Expected: Nuxt build exits 0 and generates the dynamic route bundle.

- [ ] **Step 8: Commit**

```bash
git add frontend/components/cases frontend/pages/cases frontend/assets/css/case-detail.css frontend/tests/casesMarkup.test.mjs
git commit -m "feat: add case story detail pages"
```

---

### Task 6: Seed Content, Integration Verification, and Visual QA

**Files:**
- Modify: `backend/seed.py`
- Modify: `frontend/tests/landingCases.test.ts`
- Modify: `frontend/tests/casesMarkup.test.mjs`

**Interfaces:**
- Consumes: completed backend API, landing dossier, and detail page.
- Produces: at least three clearly marked demonstration cases for local development and verified responsive behavior.

- [ ] **Step 1: Add a failing seed contract test**

Add to `backend/tests/test_project_schemas.py`:

```python
from pathlib import Path


def test_seed_marks_case_metrics_as_demo_content() -> None:
    source = Path("seed.py").read_text(encoding="utf-8")
    assert "DEMO CASE CONTENT" in source
    assert "is_featured=True" in source
    assert "slug=\"restaurant-menu\"" in source
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `uv run pytest tests/test_project_schemas.py::test_seed_marks_case_metrics_as_demo_content -q` from `backend/`  
Expected: FAIL because the seed has not been upgraded.

- [ ] **Step 3: Upgrade three seed projects**

Add slugs, bilingual story content, cover fields, and child records for Restaurant Menu, AI Support Assistant, and CRM System. Precede demonstration metric values with the exact source comment `# DEMO CASE CONTENT — replace with client-approved measurements before production.` Do not alter the remaining seed projects beyond safe nullable defaults.

- [ ] **Step 4: Run the full automated suite**

Backend:

```bash
uv run pytest -q
uv run ruff check app tests
```

Frontend:

```bash
node --test --experimental-strip-types tests/*.ts
node --test tests/*.mjs
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 5: Start the local stack and verify APIs**

Run: `docker compose up -d --build` from the repository root.  
Run: `Invoke-RestMethod 'http://localhost:8000/api/projects?lang=ru' | Select-Object -First 1`  
Expected: first featured summary contains `slug`, `metrics`, and `is_featured`.  
Run: `Invoke-RestMethod 'http://localhost:8000/api/projects/restaurant-menu?lang=en'`  
Expected: English detail payload with ordered gallery/technology arrays.

- [ ] **Step 6: Perform browser visual QA**

Using the in-app Browser, inspect `/` and `/cases/restaurant-menu` at 360, 390, 768, 1024, and 1440 px. Confirm:

- dossier sits between clients and development anatomy;
- desktop rail selection updates all active content atomically;
- mobile chips stay in one line with the next chip partially visible;
- no horizontal page overflow or wheel interception;
- metrics reflow to the approved mobile matrix;
- missing optional testimonial/technical data removes the whole block;
- long RU and EN titles do not collide;
- keyboard focus and arrow navigation work;
- reduced-motion mode removes crossfade/slide animation;
- case detail gallery and technical flow remain legible.

- [ ] **Step 7: Fix only issues found by verification and rerun affected checks**

For every fix, rerun the narrow test first, then `npm run build` or `uv run pytest -q` as appropriate. Do not add unrelated refactors.

- [ ] **Step 8: Commit**

```bash
git add backend/seed.py backend/tests frontend/tests
git commit -m "test: verify cases experience end to end"
```

---

## Final Verification

- [ ] Run `git status --short` and confirm only user-owned pre-existing files remain uncommitted.
- [ ] Run `git log --oneline -8` and confirm one focused commit per task.
- [ ] Run the complete backend and frontend commands from Task 7 once more.
- [ ] Recheck the design spec against the rendered landing and detail pages.
- [ ] Confirm no production-facing text presents demonstration metrics as verified client results.
