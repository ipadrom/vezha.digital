# VEZHA Cases Experience Design

**Date:** 2026-08-02  
**Status:** Approved concept, pending written-spec review  
**Scope:** Cases section on the landing page and individual case pages

## 1. Goal

Add a cases experience that balances product presentation with credible business evidence. The section must feel native to the current VEZHA redesign: restrained black-and-white structure, thin grid lines, large Onest typography, JetBrains Mono metadata, one controlled color accent, and purposeful motion.

The design should answer two questions quickly:

1. What did VEZHA build?
2. What measurable difference did the work make?

## 2. Approved Direction

### Landing page: Case Dossier

Use the selected **Case Dossier** direction. On desktop, the section is a bordered two-part interface:

- a compact project index on the left;
- the active case on the right, with editorial copy, a large product visual, and a result strip.

The section is interactive but does not pin the page or hijack scrolling. Selecting a case changes the active content within the section.

### Individual case page: Story + Evidence with a Technical Dossier module

Use **Story + Evidence** as the main page rhythm. Add one optional technical module from **Technical Dossier** for architecture, integrations, or stack details. The page should remain readable as a narrative rather than becoming a dense engineering report.

## 3. Placement and Information Hierarchy

Place the cases section after `LandingClients` and before `LandingDevelopmentAnatomy`.

The resulting landing sequence is:

1. services — what VEZHA builds;
2. clients — who VEZHA builds for;
3. cases — proof that the work creates value;
4. development anatomy — how VEZHA delivers it;
5. contacts — conversion.

Add a `#cases` anchor to the appropriate landing navigation entry.

## 4. Landing Cases Section

### 4.1 Header

- Eyebrow: `КЕЙСЫ / NN` or localized equivalent.
- Title: a short proof-oriented phrase, for example `Работы, которым верят`.
- Optional compact hint explaining that cases can be selected.

### 4.2 Desktop layout

The main bordered frame uses two columns:

- project rail: approximately 220–260 px;
- active-case panel: remaining width.

The project rail contains the case number and short title. The active row uses an inverted black treatment. The active-case panel contains:

1. type and industry metadata;
2. a short, outcome-oriented title;
3. a two- or three-sentence summary;
4. an internal `Открыть кейс` link;
5. a large visual stage;
6. one featured metric overlaid on the visual;
7. up to three supporting metrics in a bordered strip.

The section shows 3–6 featured cases. The first active case is deterministic and follows `sort_order`.

### 4.3 Desktop interaction

- Pointer click and keyboard activation change the active case.
- Active content uses a 320–450 ms crossfade with a 12–16 px vertical slide.
- The visual and copy transition together so mixed states are never visible.
- No pinned scroll sequence and no horizontal-wheel interception.
- Focus remains on the selected rail item after keyboard selection.
- With reduced motion enabled, content switches immediately.

### 4.4 Mobile layout

Below 900 px, the left rail becomes a single-line horizontal chip list. Each chip contains a number and short case name; part of the next chip remains visible as a scrolling affordance.

The active case becomes a vertical sequence:

1. section header;
2. horizontal case chips;
3. full-width product visual;
4. featured metric overlay;
5. type, title, and summary;
6. metrics matrix;
7. internal case link.

The metrics matrix uses one primary full-width metric followed by two half-width supporting metrics. It does not require horizontal swiping. The entire active card should occupy approximately 1.25–1.5 typical phone viewports, so the following page section remains discoverable.

Changing a chip updates the card with the same short crossfade/slide used on desktop. The page itself retains ordinary vertical scrolling.

## 5. Individual Case Page

### 5.1 Route

Use an internal localized route based on a stable slug, for example:

`/cases/restaurant-menu`

`project_url` remains an optional external product link and is not used as the case-detail route.

### 5.2 Page structure

The standard page contains the following blocks:

1. **Case hero** — type, industry, outcome-oriented title, short summary, large product visual, and featured metric.
2. **Facts strip** — up to four facts such as timeline, conversion change, efficiency change, or delivery scope.
3. **Context and challenge** — the starting situation and the business or user problem.
4. **Solution narrative** — the product decisions and core experience, supported by product screens.
5. **Product gallery** — 4–6 screenshots or product compositions with meaningful captions.
6. **Optional technical module** — one bounded Technical Dossier block showing either architecture, integrations, or stack. It is omitted when the case does not benefit from it.
7. **Results** — verified metrics with concise explanations and measurement context.
8. **Optional testimonial** — quote and attribution when supplied.
9. **Next case and contact CTA** — one adjacent case and a direct project-discussion action.

### 5.3 Technical module

The module is visually denser than the surrounding narrative but remains a single chapter. It may contain:

- a simple node-and-connection architecture diagram;
- a list of key integrations;
- technology chips;
- one or two annotated system screens.

Do not render an empty technical chapter. On mobile, architecture nodes stack vertically and connections rotate into a top-to-bottom flow.

### 5.4 Mobile case page

- The page becomes a single readable column.
- The hero copy precedes the visual.
- The facts strip becomes a 2×2 grid.
- Galleries use vertical compositions; an optional small secondary pair may use a horizontal snap row, but core content must not depend on swiping.
- Technical diagrams stack vertically.
- Typography and section labels follow the compact mobile scale already used by the landing redesign.
- Any local chapter navigation becomes a single-line sticky chip row below the site header; it is optional for shorter cases.

## 6. Content Model

The current public project payload (`id`, `type`, `name`, `description`, `image_url`, `project_url`) is insufficient for result metrics and full case pages. Extend the project domain with a fixed case structure rather than a general-purpose page builder.

### Project fields

- `slug_ru`, `slug_en` or one locale-neutral stable slug;
- `subtitle_ru`, `subtitle_en`;
- `industry_ru`, `industry_en`;
- `year`;
- `timeline_ru`, `timeline_en`;
- `challenge_ru`, `challenge_en`;
- `solution_ru`, `solution_en`;
- `result_summary_ru`, `result_summary_en`;
- `cover_image_url`;
- `hero_metric_value`;
- `hero_metric_label_ru`, `hero_metric_label_en`;
- optional testimonial text and attribution;
- `is_featured`;
- existing `sort_order` and `is_active`.

### Repeatable child records

- project metrics: value, localized label, optional context, sort order;
- gallery items: image URL, localized alt text/caption, sort order;
- technology or integration items: label, category, sort order.

The technical module may initially derive from technology and integration items. A generic block editor is explicitly out of scope.

## 7. Component Boundaries

- `LandingCases.vue` — section shell, active-case state, desktop/mobile navigation.
- `LandingCaseVisual.vue` — visual stage and featured metric.
- `CaseMetricGrid.vue` — reusable metric layout for landing and detail pages.
- `pages/cases/[slug].vue` — data loading, metadata, and page composition.
- `CaseHero.vue` — individual case hero.
- `CaseGallery.vue` — screenshots and captions.
- `CaseTechnicalModule.vue` — optional architecture/integrations/stack chapter.
- `CaseResults.vue` — verified outcomes and context.
- Admin project editor extensions — fixed fields and repeatable metrics/gallery/technology inputs.

Each presentation component receives normalized case data and does not fetch independently.

## 8. Data Flow

1. The landing page fetches active projects through the existing public projects API.
2. The frontend filters or receives featured projects, sorts them by `sort_order`, and normalizes optional fields.
3. `LandingCases` owns the active case identifier and exposes no backend mutations.
4. A case link routes by slug.
5. The case page requests one public project by slug and renders only blocks with valid content.
6. Localized API output follows the existing locale-aware project response pattern.

## 9. Fallbacks and Error Handling

- Missing cover image: render a VEZHA-themed procedural placeholder, not a broken image box.
- Missing featured metric: do not show the floating metric card.
- Fewer than three metrics: recalculate the metric grid; do not add empty cells.
- Missing technical content: omit the entire technical module.
- Missing testimonial: move directly from results to the next-case/CTA block.
- Unknown or inactive slug: return the project-level 404 state.
- External product link missing: omit `Открыть продукт`; keep the internal case page available.
- Image loading failure: preserve the visual stage dimensions to avoid layout shift.

## 10. Accessibility and Motion

- The desktop project rail uses semantic buttons or a tab pattern with correct ARIA relationships.
- All controls have visible keyboard focus.
- Chip rows remain keyboard-scrollable.
- Images have localized, content-specific alt text; decorative device chrome is hidden from assistive technology.
- Metric values are paired with labels in the same accessible group.
- Color is not the sole active-state indicator.
- All transitions respect `prefers-reduced-motion`.

## 11. Verification

### Functional

- project selection updates title, summary, visual, metrics, and link atomically;
- keyboard navigation works in the desktop rail and mobile chips;
- case routing works for both locales;
- optional blocks disappear cleanly when their data is absent;
- external links use safe target and rel behavior.

### Responsive

Visually verify at 360, 390, 768, 1024, and 1440 px. Confirm:

- no clipped mobile chips without a visible scrolling affordance;
- no horizontal page overflow;
- metrics reflow correctly from strip to matrix;
- technical diagrams remain legible on mobile;
- long Russian and English titles do not collide with visuals or metadata.

### Quality

- loading and error states preserve section height;
- images do not create cumulative layout shift;
- reduced-motion mode removes decorative transitions;
- the cases section does not conflict with existing section reveal or negative-world effects.

## 12. Out of Scope

- a free-form case-page builder;
- video hosting or autoplay case reels;
- scroll hijacking or a pinned horizontal case gallery;
- client-authored public reviews;
- case filtering on the initial landing implementation;
- invented performance metrics. Only client-approved or otherwise verifiable results may be published.

