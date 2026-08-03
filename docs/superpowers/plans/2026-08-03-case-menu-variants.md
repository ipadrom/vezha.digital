# Case Menu Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать маршрут `/case-menu-variants` с пятью переключаемыми вариантами меню кейсов и раздельными режимами десктопного и мобильного предпросмотра.

**Architecture:** Типизированный utility-модуль нормализует query-параметры и отдаёт данные выбранного варианта. Страница управляет URL и контролами, а preview-компонент рендерит только одну выбранную композицию.

**Tech Stack:** Nuxt 3, Vue 3 Composition API, TypeScript, CSS, Node test runner.

## Global Constraints

- Рабочий адрес: `http://localhost:3004/case-menu-variants`.
- Одновременно рендерится только один вариант `1–5`.
- Режимы `desktop` и `mobile` не показываются рядом.
- Выбор сохраняется в `variant` и `view` query-параметрах.
- Используются существующие токены и типографика VEZHA без новых зависимостей.
- Основная страница и существующие страницы кейсов не изменяются.

---

### Task 1: Модель вариантов и query-состояние

**Files:**
- Create: `frontend/utils/caseMenuVariants.ts`
- Create: `frontend/tests/caseMenuVariants.test.ts`

**Interfaces:**
- Produces: `CaseMenuVariantId`, `CaseMenuView`, `caseMenuVariants`, `normalizeCaseMenuVariant(value)`, `normalizeCaseMenuView(value)`, `getCaseMenuVariant(value)`.

- [ ] **Step 1: Write failing behavior tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  caseMenuVariants,
  getCaseMenuVariant,
  normalizeCaseMenuVariant,
  normalizeCaseMenuView,
} from "../utils/caseMenuVariants.ts";

test("invalid menu query values resolve to the recommended desktop variant", () => {
  assert.equal(normalizeCaseMenuVariant("99"), "1");
  assert.equal(normalizeCaseMenuVariant(undefined), "1");
  assert.equal(normalizeCaseMenuView("tablet"), "desktop");
});

test("valid menu query values preserve the requested state", () => {
  assert.equal(normalizeCaseMenuVariant("4"), "4");
  assert.equal(normalizeCaseMenuView("mobile"), "mobile");
});

test("the selected variant resolves to one complete composition", () => {
  assert.deepEqual(caseMenuVariants.map((item) => item.id), ["1", "2", "3", "4", "5"]);
  assert.deepEqual(getCaseMenuVariant("3"), {
    id: "3",
    name: "Один селектор",
    note: "Список появляется только по запросу.",
  });
});
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `node --experimental-strip-types --test tests/caseMenuVariants.test.ts`

Expected: FAIL because `utils/caseMenuVariants.ts` does not exist.

- [ ] **Step 3: Implement the typed model**

```ts
export type CaseMenuVariantId = "1" | "2" | "3" | "4" | "5";
export type CaseMenuView = "desktop" | "mobile";

export const caseMenuVariants = [
  { id: "1", name: "Редакторский rail", note: "Активный кейс раскрыт, остальные собраны в индекс." },
  { id: "2", name: "Верхний индекс", note: "Выбор проекта вынесен в горизонтальную строку." },
  { id: "3", name: "Один селектор", note: "Список появляется только по запросу." },
  { id: "4", name: "Стопка кейсов", note: "Проекты читаются как последовательность обложек." },
  { id: "5", name: "Числовой трек", note: "Навигация превращена в тонкую ось 01–04." },
] as const;

export function normalizeCaseMenuVariant(value: unknown): CaseMenuVariantId {
  return typeof value === "string" && ["1", "2", "3", "4", "5"].includes(value)
    ? value as CaseMenuVariantId
    : "1";
}

export function normalizeCaseMenuView(value: unknown): CaseMenuView {
  return value === "mobile" ? "mobile" : "desktop";
}

export function getCaseMenuVariant(value: unknown) {
  const id = normalizeCaseMenuVariant(value);
  return caseMenuVariants.find((item) => item.id === id)!;
}
```

- [ ] **Step 4: Run the test and verify 3 passing tests**

Run: `node --experimental-strip-types --test tests/caseMenuVariants.test.ts`

- [ ] **Step 5: Commit the model**

```powershell
git add frontend/utils/caseMenuVariants.ts frontend/tests/caseMenuVariants.test.ts
git commit -m "test: define case menu variant state"
```

### Task 2: Preview component and shareable route

**Files:**
- Create: `frontend/components/cases/CaseMenuVariantsPreview.vue`
- Create: `frontend/assets/css/case-menu-variants.css`
- Create: `frontend/pages/case-menu-variants.vue`
- Create: `frontend/tests/caseMenuVariantsRoute.test.mjs`

**Interfaces:**
- Consumes: `CaseMenuVariantId`, `CaseMenuView`, `caseMenuVariants`, normalization helpers.
- Produces: route `/case-menu-variants?variant=1&view=desktop` and `<CaseMenuVariantsPreview :variant="variant" :view="view" />`.

- [ ] **Step 1: Write a failing HTTP route test**

```js
import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.CASE_VARIANTS_BASE_URL || "http://127.0.0.1:3004";

test("case menu variants route renders a single selected preview", async () => {
  const response = await fetch(`${baseUrl}/case-menu-variants?variant=3&view=mobile`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ВАРИАНТЫ МЕНЮ КЕЙСОВ/);
  assert.match(html, /Один селектор/);
  assert.match(html, /case-menu-preview--mobile/);
});
```

- [ ] **Step 2: Run the route test against the current server and verify 404**

Run: `node --test tests/caseMenuVariantsRoute.test.mjs`

Expected: FAIL because `/case-menu-variants` is not implemented.

- [ ] **Step 3: Implement the preview component**

Create one `case-menu-canvas` with mutually exclusive `v-if / v-else-if / v-else` branches. Each branch uses the same four records — `WELLNESS APP`, `МЕНЮ ДЛЯ ЗАКАЗА`, `AI-ПОДДЕРЖКА`, `CRM-СИСТЕМА` — and the same case content. Only navigation placement changes: left rail, top index, selector, stacked covers, or numeric track.

The component contract is:

```vue
<script setup lang="ts">
import type { CaseMenuVariantId, CaseMenuView } from "~/utils/caseMenuVariants";
defineProps<{ variant: CaseMenuVariantId; view: CaseMenuView }>();
</script>
```

- [ ] **Step 4: Implement stable preview CSS**

```css
.case-menu-preview { min-width: 0; overflow: auto; padding: 24px; background: var(--bg-secondary); }
.case-menu-canvas { width: min(100%, 1280px); min-height: 720px; margin: 0 auto; overflow: hidden; background: var(--bg); color: var(--text); }
.case-menu-preview--mobile .case-menu-canvas { width: min(390px, 100%); min-height: 760px; }
.case-menu-preview--desktop .menu-demo { min-width: 920px; }
@media (max-width: 700px) { .case-menu-preview { padding: 12px; } }
```

All variant layouts use grid or flex inside the canvas. No preview column uses `position: fixed`, and mobile/desktop markup is never rendered simultaneously.

- [ ] **Step 5: Implement route controls and query updates**

The page reads normalized computed values from `route.query`, calls `router.replace` when buttons change, and renders one preview instance. The visible toolbar contains buttons `1–5`, `Десктоп`, and `Мобилка`, plus the selected variant name and note.

- [ ] **Step 6: Build the application and restart port 3004**

Run: `npm run build`, then run `.output/server/index.mjs` with `PORT=3004` and `HOST=0.0.0.0`.

Expected: build exit code 0 and server listening on 3004.

- [ ] **Step 7: Run focused and regression tests**

Run: `node --experimental-strip-types --test tests/caseMenuVariants.test.ts tests/landingCases.test.ts tests/wellnessCase.test.ts`

Run: `node --test tests/caseMenuVariantsRoute.test.mjs`

Expected: all tests pass and both route states return HTTP 200.

- [ ] **Step 8: Commit the route**

```powershell
git add frontend/components/cases/CaseMenuVariantsPreview.vue frontend/assets/css/case-menu-variants.css frontend/pages/case-menu-variants.vue frontend/tests/caseMenuVariantsRoute.test.mjs
git commit -m "feat: add case menu variants route"
```
