# WELLNESS APP Case Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an anonymized WELLNESS APP card and complete responsive case study based on the real Vue product, including exact product screens, a dark hand-held-phone hero, an evolution narrative, and a technical dossier.

**Architecture:** Keep the generic case API and route, add WELLNESS APP as the fourth localized fallback case, and guarantee its presence beside API-backed projects with a merge helper. Route only the `wellness-app` slug through a focused editorial composition while reusing the existing metric and technical components. Build the hero from a generated photographic device scene plus an actual app screenshot overlay so its interface stays exact.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, CSS, Node test runner, Vite source application, in-app Browser, ImageGen.

## Global Constraints

- Public product name is exactly `WELLNESS APP`; never expose `Training`, personal data, or owner identity.
- Treat `C:\Users\artas\OneDrive\Рабочий стол\Training\.worktrees\recipes-tab` as a read-only visual/content source.
- Do not modify or create an admin interface.
- Temporary KPIs are `78%`, `3,2×`, `−42%`, and `18 дней`; mark every value as demonstration data until verified.
- The phone screen must use an exact screenshot from the Vue application, not generated interface text.
- Preserve the VEZHA grid, typography, borders, restrained blue/cyan accents, and dark hero/technical contrast.
- Support 360, 390, 768, 1024, and 1440 px without page-level horizontal overflow.
- Respect `prefers-reduced-motion` and provide useful image alternative text.
- Do not merge the feature branch; the user will approve merging separately.

---

## File Map

- `frontend/utils/landingCases.ts` — deterministic API/fallback merge.
- `frontend/utils/caseFallbacks.ts` — localized WELLNESS APP project record.
- `frontend/utils/wellnessCaseContent.ts` — localized longread copy and screen metadata.
- `frontend/utils/interfaces/IProjects.ts` — demonstration-metric flag.
- `frontend/tests/landingCases.test.ts` — merge/order tests.
- `frontend/tests/wellnessCase.test.ts` — anonymity, KPI disclosure, and chapter tests.
- `frontend/components/landing/LandingCases.vue` — merged landing source.
- `frontend/components/cases/WellnessPhoneVisual.vue` — photo and exact screen composition.
- `frontend/components/cases/WellnessCaseChapter.vue` — reusable product chapter.
- `frontend/components/cases/WellnessCaseStudy.vue` — bespoke longread composition.
- `frontend/components/cases/CaseVisual.vue` — WELLNESS visual selection.
- `frontend/components/cases/CaseMetricGrid.vue` — disclosure state.
- `frontend/pages/cases/[slug].vue` — slug-specific composition branch.
- `frontend/assets/css/wellness-case.css` — longread layout and breakpoints.
- `frontend/public/cases/wellness-app/*` — one generated scene and six real UI captures.

---

### Task 1: Add the anonymized content contract and landing selection

**Files:**
- Modify: `frontend/utils/interfaces/IProjects.ts`
- Modify: `frontend/utils/landingCases.ts`
- Modify: `frontend/utils/caseFallbacks.ts`
- Modify: `frontend/components/landing/LandingCases.vue`
- Modify: `frontend/tests/landingCases.test.ts`
- Create: `frontend/tests/wellnessCase.test.ts`

**Interfaces:**
- Consumes: `IProjects`, `IProjectDetail`, `selectFeaturedProjects()`.
- Produces: `mergeFeaturedProjects(apiProjects, fallbackProjects, requiredSlugs, limit)`; `IProjectMetric.is_demo`; localized `wellness-app` fallback.

- [ ] **Step 1: Write failing tests**

Add to `landingCases.test.ts` and import `mergeFeaturedProjects`:

```ts
test("required fallback case is merged beside API cases without duplicates", () => {
  const api = [project("api-case", 1), project("wellness-app", 5)];
  const fallback = [project("wellness-app", 0), project("fallback-only", 2)];
  assert.deepEqual(
    mergeFeaturedProjects(api, fallback, ["wellness-app"]).map((item) => item.slug),
    ["api-case", "wellness-app"],
  );
  assert.equal(mergeFeaturedProjects([], fallback, ["wellness-app"]).length, 2);
});
```

Create `wellnessCase.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getCaseFallbacks } from "../utils/caseFallbacks.ts";

for (const locale of ["ru", "en"] as const) {
  test(`WELLNESS APP is localized and anonymized for ${locale}`, () => {
    const wellness = getCaseFallbacks(locale).find((item) => item.slug === "wellness-app");
    assert.ok(wellness);
    assert.equal(wellness.name, "WELLNESS APP");
    assert.equal(wellness.sort_order, 0);
    assert.equal(wellness.metrics.length, 4);
    assert.ok(wellness.metrics.every((metric) => metric.is_demo));
    assert.doesNotMatch(JSON.stringify(wellness), /Training|artas|recipes-tab/i);
  });
}
```

- [ ] **Step 2: Verify that the tests fail for the missing behavior**

Run from `frontend`:

```powershell
node --experimental-strip-types --test tests/landingCases.test.ts tests/wellnessCase.test.ts
```

Expected: FAIL for missing `mergeFeaturedProjects`, missing `is_demo`, and missing `wellness-app`.

- [ ] **Step 3: Implement the metric flag and merge**

Add `is_demo?: boolean` to `IProjectMetric`. Add to `landingCases.ts`:

```ts
export function mergeFeaturedProjects(
  apiProjects: IProjects[],
  fallbackProjects: IProjects[],
  requiredSlugs: string[] = [],
  limit = 6,
): IProjects[] {
  if (!apiProjects.length) return selectFeaturedProjects(fallbackProjects, limit);
  const merged = new Map(selectFeaturedProjects(apiProjects, Infinity)
    .map((project) => [project.slug, project] as const));
  for (const slug of requiredSlugs) {
    if (merged.has(slug)) continue;
    const fallback = fallbackProjects.find((item) => item.slug === slug && item.is_featured);
    if (fallback) merged.set(slug, fallback);
  }
  return [...merged.values()].sort((a, b) => a.sort_order - b.sort_order).slice(0, limit);
}
```

Use it in `LandingCases.vue`:

```ts
const cases = computed(() => mergeFeaturedProjects(
  props.projects,
  props.fallback,
  ["wellness-app"],
));
```

- [ ] **Step 4: Add the WELLNESS APP fallback record**

Insert it first and shift current concept cases to sort orders 1–3. Exact content:

```ts
{
  id: "wellness-app", slug: "wellness-app", sort_order: 0, is_featured: true,
  type: "PRODUCT / PWA / VUE", name: "WELLNESS APP",
  subtitle: ru ? "От персонального трекера к единой системе тренировок и питания." : "From a personal tracker to one training and nutrition system.",
  industry: "Wellness",
  description: ru ? "Мобильный продукт объединяет тренировки, прогрессию нагрузки, питание, рецепты и КБЖУ." : "A mobile product combining workouts, load progression, nutrition, recipes and macros.",
  image_url: null, cover_image_url: null, project_url: null,
  hero_metric_value: "3,2×", hero_metric_label: ru ? "демо: регулярность" : "demo: consistency",
  year: "2026", timeline: ru ? "PWA → Vue-продукт" : "PWA → Vue product",
  challenge: ru ? "Объединить тренировки, прогресс и питание в одном простом мобильном ритме." : "Unite workouts, progress and nutrition in one simple mobile rhythm.",
  solution: ru ? "Компактная PWA выросла в Vue-приложение с двумя связанными зонами: тренировками и питанием." : "The compact PWA grew into a Vue application with connected workout and food areas.",
  result_summary: ru ? "Набор персональных инструментов стал цельным ежедневным wellness-продуктом." : "A set of personal tools became one coherent daily wellness product.",
  testimonial: null, testimonial_author: null,
  metrics: [
    { value: "78%", label: ru ? "завершённых тренировок" : "workouts completed", context: ru ? "Демонстрационные данные" : "Demonstration data", sort_order: 0, is_demo: true },
    { value: "3,2×", label: ru ? "регулярность занятий" : "training consistency", context: ru ? "Демонстрационные данные" : "Demonstration data", sort_order: 1, is_demo: true },
    { value: "−42%", label: ru ? "времени на планирование" : "planning time", context: ru ? "Демонстрационные данные" : "Demonstration data", sort_order: 2, is_demo: true },
    { value: ru ? "18 дней" : "18 days", label: ru ? "активность в месяц" : "monthly activity", context: ru ? "Демонстрационные данные" : "Demonstration data", sort_order: 3, is_demo: true },
  ],
  gallery: [],
  technologies: [
    { label: "Vue 3 + Vite", category: "CLIENT", sort_order: 0 },
    { label: "PWA / Local-first", category: "CLIENT", sort_order: 1 },
    { label: "Wake Lock", category: "DEVICE", sort_order: 2 },
    { label: "Sound + Vibration", category: "DEVICE", sort_order: 3 },
    { label: "Open Food Facts", category: "DATA", sort_order: 4 },
    { label: "Docker", category: "DELIVERY", sort_order: 5 },
  ],
}
```

- [ ] **Step 5: Run tests and commit**

```powershell
node --experimental-strip-types --test tests/landingCases.test.ts tests/wellnessCase.test.ts
git add frontend/utils frontend/components/landing/LandingCases.vue frontend/tests
git commit -m "feat: add wellness app case content"
```

Expected: tests PASS.

---

### Task 2: Produce exact screens and the dark phone scene

**Files:**
- Create: `frontend/public/cases/wellness-app/hero-hand-device.webp`
- Create: `frontend/public/cases/wellness-app/screen-workout-home.webp`
- Create: `frontend/public/cases/wellness-app/screen-progression.webp`
- Create: `frontend/public/cases/wellness-app/screen-timer.webp`
- Create: `frontend/public/cases/wellness-app/screen-food-home.webp`
- Create: `frontend/public/cases/wellness-app/screen-recipe.webp`
- Create: `frontend/public/cases/wellness-app/screen-daily-menu.webp`

**Interfaces:**
- Consumes: Vue source app and the supplied phone-in-hand reference image.
- Produces: six exact mobile captures and one generated landscape device scene with a clean screen plane.

- [ ] **Step 1: Build and serve the source app**

From the Training worktree:

```powershell
npm run build
npm run dev -- --host 127.0.0.1 --port 4173
```

Expected: build succeeds and `http://127.0.0.1:4173` loads.

- [ ] **Step 2: Capture six real product states**

Use `browser:control-in-app-browser` at 390×844. Save viewport-only captures for workout overview, progression, active timer, food overview, recipe nutrition, and daily menu to the exact paths listed above. No capture may contain browser chrome, personal data, loading overlays, or console error UI.

- [ ] **Step 3: Generate the device photo**

Use the `imagegen` skill after inspecting the user reference. Generate and save `hero-hand-device.webp` with this prompt:

```text
Photorealistic premium editorial product photograph, close-up human hand holding a modern black smartphone, phone dominant and much closer to camera than the reference, near-front angle with slight perspective, clean blank dark screen bounded clearly for later UI compositing, almost black studio background, cold directional rim light, subtle cyan and deep blue reflections, tight crop, minimal surroundings, realistic fingers and device geometry, wide landscape composition with safe dark crop space, no logos, no text, no interface, no watermark.
```

- [ ] **Step 4: Inspect originals and commit**

Open all seven images at original detail. Confirm exact live UI in all captures and one stable phone-screen plane in the photo.

```powershell
git add frontend/public/cases/wellness-app
git commit -m "feat: add wellness app case visuals"
```

---

### Task 3: Build the exact-screen phone composition

**Files:**
- Create: `frontend/components/cases/WellnessPhoneVisual.vue`
- Modify: `frontend/components/cases/CaseVisual.vue`
- Modify: `frontend/assets/css/landing-cases.css`

**Interfaces:**
- Consumes: generated scene, workout screenshot, `variant` and current locale.
- Produces: `WellnessPhoneVisual` props `{ title: string; locale: "ru" | "en"; variant: "default" | "wide" }`.

- [ ] **Step 1: Create the accessible composition**

Use a `<figure>` with a decorative scene `<img>`, an `aria-hidden` screen overlay containing the exact workout screenshot, and an `.sr-only` localized `<figcaption>`. Fit the overlay with custom properties for percentage inset, rotation, skew, and border radius so desktop and mobile crops can be tuned separately.

- [ ] **Step 2: Select it in `CaseVisual.vue`**

Render `WellnessPhoneVisual` first when `project.slug === "wellness-app"`; preserve current image and procedural fallback branches for every other slug. Keep the existing metric overlay outside the phone component.

- [ ] **Step 3: Fit default, wide, and mobile stages**

Make the figure fill `.case-visual`. Use `object-fit: cover` and breakpoint-specific `object-position` without moving the screenshot independently from its phone. At 360–390 px the phone must remain dominant and the metric must not cover the app screen.

- [ ] **Step 4: Build and commit**

```powershell
npm run build
git add frontend/components/cases/WellnessPhoneVisual.vue frontend/components/cases/CaseVisual.vue frontend/assets/css/landing-cases.css
git commit -m "feat: add wellness phone hero composition"
```

Expected: Nuxt build succeeds.

---

### Task 4: Implement the evolution longread

**Files:**
- Create: `frontend/utils/wellnessCaseContent.ts`
- Modify: `frontend/tests/wellnessCase.test.ts`
- Create: `frontend/components/cases/WellnessCaseChapter.vue`
- Create: `frontend/components/cases/WellnessCaseStudy.vue`
- Modify: `frontend/components/cases/CaseMetricGrid.vue`
- Modify: `frontend/pages/cases/[slug].vue`
- Create: `frontend/assets/css/wellness-case.css`

**Interfaces:**
- Consumes: existing metric/technical modules, localized project record, six screenshot URLs.
- Produces: `getWellnessCaseContent(locale): WellnessCaseContent`, reusable product chapters, and dedicated slug rendering.

- [ ] **Step 1: Add a failing editorial structure test**

```ts
import { getWellnessCaseContent } from "../utils/wellnessCaseContent.ts";

for (const locale of ["ru", "en"] as const) {
  test(`WELLNESS APP chapters are complete for ${locale}`, () => {
    const content = getWellnessCaseContent(locale);
    assert.deepEqual(content.chapters.map((item) => item.id), ["workout", "food"]);
    assert.deepEqual(content.chapters.map((item) => item.screens.length), [3, 3]);
    assert.ok(content.evolution.before.points.length >= 3);
    assert.ok(content.evolution.after.points.length >= 3);
    assert.match(content.demoLabel, locale === "ru" ? /демонстрационные/i : /demonstration/i);
    assert.doesNotMatch(JSON.stringify(content), /Training|artas|recipes-tab/i);
  });
}
```

Run and expect failure because `wellnessCaseContent.ts` is absent:

```powershell
node --experimental-strip-types --test tests/wellnessCase.test.ts
```

- [ ] **Step 2: Implement typed RU/EN content**

Define `WellnessScreen`, `WellnessChapter`, and `WellnessCaseContent`. Return an evolution object with before/after lists, two chapters (`workout`, `food`) with three exact screenshot records each, evidence/disclosure copy, and conclusion copy. Cover program flow, exercise guidance, timers, load progression, recipes, portions, macros, menus, and product search. Do not include the source product name.

- [ ] **Step 3: Expose demo state in `CaseMetricGrid.vue`**

Add `data-demo="true"` when `metric.is_demo`; keep the existing context visible and provide the disclosure in the same accessible metric group. Verified metrics retain unchanged markup and appearance.

- [ ] **Step 4: Build `WellnessCaseChapter.vue`**

Accept `{ chapter: WellnessChapter; reverse?: boolean }`. Render a section id, numbered eyebrow, title, lead, bullet list, and a three-figure screen grid with lazy images and captions. `reverse` changes only desktop composition order.

- [ ] **Step 5: Compose `WellnessCaseStudy.vue`**

Accept `{ project: IProjectDetail; locale: "ru" | "en" }` and render in order: evidence/KPI disclosure, evolution comparison, workout chapter, reversed food chapter, `CaseTechnicalModule`, and conclusion. Import `~/assets/css/wellness-case.css`.

- [ ] **Step 6: Branch the existing route**

After the shared hero in `[slug].vue`, render `WellnessCaseStudy` when `project.slug === "wellness-app"`; wrap the current story, gallery, results, and technical modules in the `v-else` branch. Keep shared next-case navigation after both branches. In `applySeo()`, set `robots: "noindex, nofollow"` whenever `project.metrics.some((metric) => metric.is_demo)` so mock KPI values cannot be indexed; omit the robots override once verified metrics replace them.

- [ ] **Step 7: Implement responsive editorial CSS**

Use `var(--case-pad)` everywhere. Render four KPI cells on desktop and 2×2 below 900 px; before/after as two columns then one; each feature chapter as one lead screen plus two supporting screens then a vertical mobile stack. Preserve borders and large typography, keep the existing technical module dark, prevent image overflow, and disable motion under reduced-motion preference.

- [ ] **Step 8: Test, build, and commit**

```powershell
node --experimental-strip-types --test tests/landingCases.test.ts tests/wellnessCase.test.ts
npm run build
git add frontend/utils/wellnessCaseContent.ts frontend/tests/wellnessCase.test.ts frontend/components/cases frontend/pages/cases/[slug].vue frontend/assets/css/wellness-case.css
git commit -m "feat: add wellness app case narrative"
```

Expected: all tests pass and Nuxt builds.

---

### Task 5: Visual QA and localhost handoff

**Files:**
- Modify only when supported by a captured defect: `frontend/components/cases/WellnessPhoneVisual.vue`
- Modify only when supported by a captured defect: `frontend/assets/css/landing-cases.css`
- Modify only when supported by a captured defect: `frontend/assets/css/case-detail.css`
- Modify only when supported by a captured defect: `frontend/assets/css/wellness-case.css`

**Interfaces:**
- Consumes: landing page, `/cases/wellness-app`, and dev server port 3004.
- Produces: verified responsive UI and running local URLs.

- [ ] **Step 1: Start the site on port 3004**

```powershell
npm run dev -- --host 0.0.0.0 --port 3004
```

Expected: `/` and `/cases/wellness-app` return HTTP 200.

- [ ] **Step 2: Inspect with the Browser skill**

At 1440×1000, 1024×900, 768×1024, 390×844, and 360×800 verify: card visibility; exact screen alignment; large mobile phone; KPI disclosure; evolution/workout/food/technical/conclusion order; anonymity; and no horizontal overflow.

- [ ] **Step 3: Verify interactions and accessibility**

Keyboard-select landing tabs, enter the case, follow header anchors, switch RU/EN, and enable reduced motion. Confirm visible focus, valid localized layout, useful alt text, and hidden decorative photo layers.

- [ ] **Step 4: Apply the smallest evidence-driven corrections**

For each observed problem, record viewport and selector, adjust only the responsible rule, then repeat the same viewport check. Do not change unrelated landing sections or admin files.

- [ ] **Step 5: Run final verification**

```powershell
node --experimental-strip-types --test tests/landingCases.test.ts tests/wellnessCase.test.ts
npm run build
git diff --check
git status --short
```

Expected: tests pass, production build completes, whitespace check is clean, and only intentional QA changes remain.

- [ ] **Step 6: Commit and hand off**

```powershell
git add frontend
git commit -m "fix: polish wellness app case responsiveness"
```

Leave the validated server running on port 3004 and provide clickable landing and case URLs. Do not merge the branch.
