# Main Production Visual Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the correct About composition, Stack sphere technology icons, and centered Contacts content on the latest `main` without reverting the developer's merged features.

**Architecture:** Patch the current `main` at `4e68cd9` rather than merging the older redesign branch. Componentize About with localized props, extend the existing Stack sphere renderer with the missing DOM label layer, and make Contacts centering resistant to later shared CSS rules.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js, `@nuxtjs/i18n`, CSS, GitHub Actions.

## Global Constraints

- Preserve the current services, Development Anatomy, RU/EN localization, Stack scroll composable, Go stack data, and later production fixes already in `main`.
- Do not reset, force-push, replace `frontend/pages/index.vue` wholesale, or merge `redesign_ceo` into `main`.
- Keep the global liquid-negative compositor and negative-world clone.
- Do not add new runtime dependencies.
- Validate desktop/mobile and light/dark themes.
- Push only after source checks, browser QA, and the production build pass.

---

### Task 1: Capture failing production-main evidence

**Files:**
- Read: `frontend/pages/index.vue`
- Read: `frontend/components/landing/LandingStack.vue`
- Read: `frontend/assets/css/landing-redesign.css`
- QA artifacts: `%TEMP%\vezha-main-visual-fixes\`

**Interfaces:**
- Consumes: current `main` at `4e68cd9`
- Produces: reproducible failing browser assertions and before screenshots

- [ ] **Step 1: Start the current `main` locally on the expected host**

Stop the existing redesign server on port `3009`, then run the current `main` frontend at:

```text
http://127.0.0.1:3009/
```

Install dependencies only if `frontend/node_modules` is absent. Do not modify package versions.

- [ ] **Step 2: Connect the in-app Browser and record the target flow**

```text
The flow under test is: main landing loads -> scroll through About, Stack, and Contacts -> the redesign composition stays aligned, Stack shows technology icons, and Contacts content remains centered.
```

Use a desktop viewport near `1440x900` and a mobile viewport near `390x844`.

- [ ] **Step 3: Verify the About regression fails**

At the initial, middle, and exit positions of `#about`, collect screenshots and evaluate:

```js
const about = document.querySelector("#about");
const flow = about?.querySelector(".vz-about__flow");
const mark = about?.querySelector(".vz-about__mark");
const digital = about?.querySelector(".vz-about__mark i");
const pageWidth = document.documentElement.clientWidth;
({
  hasFlow: Boolean(flow),
  markRight: mark?.getBoundingClientRect().right,
  digitalRight: digital?.getBoundingClientRect().right,
  pageWidth,
  horizontalOverflow: document.documentElement.scrollWidth > pageWidth,
});
```

Expected RED evidence:

- `hasFlow === false`;
- the middle-scroll screenshot reproduces the shifted/clipped `VEZHA / digital` composition;
- `digitalRight` approaches or exceeds the visible section edge.

- [ ] **Step 4: Verify the Stack regression fails**

Evaluate:

```js
({
  labelLayer: Boolean(document.querySelector("#stack .vz-stack__sphere-labels")),
  labelCount: document.querySelectorAll("#stack .vz-stack__sphere-label").length,
});
```

Expected RED evidence: `labelLayer === false` and `labelCount === 0`.

- [ ] **Step 5: Verify the Contacts regression fails**

At `#contacts`, evaluate:

```js
const viewportCenter = document.documentElement.clientWidth / 2;
const selectors = [
  "#contacts .vz-section-label",
  "#contacts h2",
  "#contacts .vz-contacts__buttons",
];
selectors.map((selector) => {
  const rect = document.querySelector(selector)?.getBoundingClientRect();
  return {
    selector,
    centerDelta: rect ? (rect.left + rect.width / 2) - viewportCenter : null,
  };
});
```

Expected RED evidence: at least the heading/content group differs visibly from the viewport center because the later `.vz-contacts h2 { margin: 0; }` wins in the cascade.

---

### Task 2: Restore the localized About composition and stable scroll geometry

**Files:**
- Create: `frontend/components/landing/LandingAbout.vue`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/assets/css/landing-redesign.css`
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`

**Interfaces:**
- Consumes: `LandingCopy["about"]`, global liquid-negative synchronization in `frontend/pages/index.vue`
- Produces: `LandingAbout.vue` with `flow-ready` and `replay` events

- [ ] **Step 1: Define the localized About interface**

Extend `LandingCopy["about"]` with:

```ts
type AboutFlowItem = {
  label: string;
  iconPaths: string[];
};

type AboutCopy = {
  label: string;
  paragraphs: [string, string];
  note: string;
  eyebrow: [string, string];
  teamLead: string;
  metrics: [string, string, string];
  flowAria: string;
  replay: string;
  zones: [string, string, string];
  stages: [string, string, string, string];
  businessItems: AboutFlowItem[];
  productItems: AboutFlowItem[];
};
```

Add matching Russian and English values. Keep brand names and technical stage names consistent across locales.

- [ ] **Step 2: Create the component using the accepted local redesign structure**

`LandingAbout.vue` must accept:

```ts
defineProps<{
  copy: AboutCopy;
  flowPhase: "signal" | "result";
  flowCycleKey: number;
  snakeSegments: Array<{ key: string; path: string; begin: string }>;
  activeBusiness: AboutFlowItem;
  activeProduct: AboutFlowItem | null;
}>();

defineEmits<{
  replay: [];
  "flow-ready": [element: HTMLElement | null];
}>();
```

Use `copy` for every visible string and accessibility label. Preserve the local redesign metrics, signal paths, product/business nodes, and replay behavior.

- [ ] **Step 3: Replace the inline About template**

In `frontend/pages/index.vue`, replace the existing `<section id="about">...</section>` with:

```vue
<LandingAbout
  :copy="copy.about"
  :flow-phase="aboutFlowPhase"
  :flow-cycle-key="aboutFlowCycleKey"
  :snake-segments="aboutFlowSnakeSegments"
  :active-business="activeAboutBusiness"
  :active-product="activeAboutProduct"
  @replay="replayAboutFlow"
  @flow-ready="setAboutFlowHost"
/>
```

Import `LandingAbout` and port the accepted local flow state/timers/observer. Clear timers and disconnect the observer during unmount.

- [ ] **Step 4: Remove the obsolete About-only liquid scene**

Delete:

- `aboutLiquidRef`;
- `aboutLiquidCleanup`;
- `createAboutLiquidEnvironment`;
- `createAboutLiquidGeometry`;
- `setupAboutLiquidScene`;
- its mount and cleanup calls;
- `.vz-about__liquid` CSS.

Do not remove the global section liquid-negative compositor.

- [ ] **Step 5: Port only the current About/flow CSS**

Copy the relevant `.vz-about*` and `.vz-flow-*` rules from the accepted local redesign stylesheet. Keep selectors scoped under `.vz-about` where practical. Ensure:

```css
.vz-about {
  position: relative;
  overflow: clip;
}

.vz-about__brand,
.vz-about__copy,
.vz-about__flow {
  min-width: 0;
}
```

The layout must not rely on viewport-relative horizontal offsets that move `digital` outside its column.

- [ ] **Step 6: Run the About browser assertions**

Repeat Task 1 Step 3 at the same three scroll positions.

Expected GREEN evidence:

- `.vz-about__flow` exists;
- `digitalRight` remains within its section/column;
- no horizontal overflow;
- the composition stays aligned throughout scroll;
- RU and EN both render.

- [ ] **Step 7: Commit the About fix**

```bash
git add frontend/components/landing/LandingAbout.vue frontend/pages/index.vue frontend/assets/css/landing-redesign.css frontend/locales/ru.json frontend/locales/en.json
git commit -m "fix: restore redesign about composition"
```

---

### Task 3: Restore technology icons on the current Stack sphere

**Files:**
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: current `displayStackGroups`, current `data-layer` values from `LandingStack.vue`
- Produces: `.vz-stack__sphere-labels` and `.vz-stack__sphere-label` DOM overlays

- [ ] **Step 1: Define label specs matching current `main` data**

Inside the current Stack sphere setup, define label specs for the visible stack groups:

```ts
type StackSphereLayer = "surface" | "core" | "bridge" | "all";

type StackSphereLabelSpec = {
  color: string;
  label: string;
  slug?: string;
  path?: string;
  angle: number;
  y: number;
  layer: Exclude<StackSphereLayer, "all">;
};
```

Frontend must include React, Vue 3, Next.js, TypeScript, and Tailwind. Backend must use Go, Gin, PostgreSQL, and Redis. DevOps and Mobile must match the current locale group items.

- [ ] **Step 2: Add the label layer before implementation verification**

Create:

```ts
const labelLayer = document.createElement("div");
labelLayer.className = "vz-stack__sphere-labels";
labelLayer.setAttribute("aria-hidden", "true");
host.replaceChildren(renderer.domElement, labelLayer);
```

For each spec, create a `.vz-stack__sphere-label` with an icon element and text. Use inline SVG paths where available; any image URL must be a production-safe public URL and have an empty alt because the layer is decorative.

- [ ] **Step 3: Project Three.js anchors into the DOM**

On each animation frame:

```ts
const projected = point.clone().applyMatrix4(group.matrixWorld).project(camera);
const x = (projected.x * 0.5 + 0.5) * host.clientWidth;
const y = (-projected.y * 0.5 + 0.5) * host.clientHeight;
element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
```

Visibility must depend on the active `host.dataset.layer`, the projected depth, and the point's front/back orientation. Mobile may show fewer labels to avoid collisions.

- [ ] **Step 4: Add label CSS**

Add the accepted `.vz-stack__sphere-labels`, `.vz-stack__sphere-label`, icon, and text rules from `16b812b`. The label layer is absolute, fills the host, and has `pointer-events: none`.

- [ ] **Step 5: Complete cleanup**

The existing `stackSphereCleanup` must also:

```ts
labelLayer.remove();
```

Dispose any additional line geometry/materials created for label connectors.

- [ ] **Step 6: Run the Stack browser assertions**

Repeat Task 1 Step 4, then scroll/click through all Stack groups.

Expected GREEN evidence:

- one `.vz-stack__sphere-labels` layer;
- visible label count is greater than zero;
- Frontend shows frontend technologies;
- Backend includes Go and Gin rather than Python/FastAPI;
- labels track sphere rotation and do not remain after component/page cleanup.

- [ ] **Step 7: Commit the Stack fix**

```bash
git add frontend/pages/index.vue frontend/assets/css/landing-redesign.css
git commit -m "fix: restore stack sphere technology icons"
```

---

### Task 4: Center Contacts as one content block

**Files:**
- Modify: `frontend/pages/index.vue`

**Interfaces:**
- Consumes: existing Contacts template and shared heading rules
- Produces: centered label, heading, and buttons on desktop/mobile

- [ ] **Step 1: Add cascade-resistant centering**

Update the final Contacts rules so they win over later shared heading declarations:

```css
.vz-contacts__inner {
  display: flex;
  width: 100%;
  max-width: 1240px;
  margin-inline: auto;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.vz-contacts__inner > h2 {
  width: min(100%, 18ch);
  margin-inline: auto;
}

.vz-contacts__buttons {
  width: fit-content;
  margin-inline: auto;
}
```

In the mobile media query:

```css
.vz-contacts__buttons {
  width: 100%;
  max-width: 520px;
}
```

- [ ] **Step 2: Run the Contacts browser assertion**

Repeat Task 1 Step 5 at desktop and mobile widths.

Expected GREEN evidence:

- label, heading, and button row centers differ from viewport center by no more than `2px` on desktop;
- mobile content has equal side padding and no horizontal overflow.

- [ ] **Step 3: Commit the Contacts fix**

```bash
git add frontend/pages/index.vue
git commit -m "fix: center contacts content block"
```

---

### Task 5: Full verification

**Files:**
- Verify all changed frontend files
- QA artifacts: `%TEMP%\vezha-main-visual-fixes\`

**Interfaces:**
- Consumes: Tasks 2–4
- Produces: build and visual QA evidence suitable for deployment

- [ ] **Step 1: Run source checks**

```powershell
git diff origin/main...HEAD --check
rg -n "aboutLiquidRef|setupAboutLiquidScene|vz-about__liquid" frontend
```

Expected: clean diff check and no obsolete About-only liquid symbols.

- [ ] **Step 2: Run Nuxt preparation/type generation**

```powershell
cd frontend
npm run postinstall
```

Expected: exit code `0`.

- [ ] **Step 3: Run the production build**

Stop the dev server before building because Nuxt shares `.nuxt`.

```powershell
cd frontend
npm run build
```

Expected: exit code `0`, no TypeScript/Nuxt build errors.

- [ ] **Step 4: Restart the local `main` server and run Browser QA**

Required checks:

- correct URL/title and non-blank DOM;
- no Nuxt error overlay;
- no relevant console errors/warnings;
- About initial/middle/exit screenshots;
- Stack Frontend and Backend screenshots;
- Contacts desktop and mobile screenshots;
- light and dark theme;
- RU and EN;
- no horizontal overflow;
- one interaction proof: replay About flow or select a Stack category and verify state change.

- [ ] **Step 5: Review the final diff**

```powershell
git status --short
git diff origin/main...HEAD --stat
git diff origin/main...HEAD -- frontend/pages/index.vue frontend/components/landing/LandingAbout.vue frontend/assets/css/landing-redesign.css frontend/locales/ru.json frontend/locales/en.json
```

Expected: only the specification, plan, targeted About/Stack/Contacts fixes, and no unrelated deletions.

---

### Task 6: Commit plan, push main, and monitor deployment

**Files:**
- Add: `docs/superpowers/plans/2026-07-27-main-visual-production-fixes.md`
- Use: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: verified `main`
- Produces: deployed production commit

- [ ] **Step 1: Commit this implementation plan**

```bash
git add docs/superpowers/plans/2026-07-27-main-visual-production-fixes.md
git commit -m "docs: plan production visual fixes"
```

- [ ] **Step 2: Confirm local main is based on current origin/main**

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD
git status --short --branch
```

Expected: origin/main is an ancestor and the working tree is clean.

- [ ] **Step 3: Push without force**

```bash
git push origin main
```

Expected: normal fast-forward push.

- [ ] **Step 4: Monitor GitHub Actions**

Use the authenticated GitHub CLI or GitHub UI to inspect the workflow run for the pushed SHA. Wait until the `Deploy to Production` workflow reaches a terminal state.

Expected: workflow conclusion `success`.

- [ ] **Step 5: Verify production**

Open the deployed public URL and repeat the three desktop checks:

- About stays aligned during scroll;
- Stack sphere shows technology icons;
- Contacts content including buttons is centered.

Check the production console for relevant errors and record the deployed SHA.
