# Mobile Services Stretch Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place the mobile Services counter directly above the chip row and animate one shared active fill by stretching it from the current chip to the target chip.

**Architecture:** Add a pure geometry helper that returns the start, bridge, and target bounds for the fill. Add one highlight element to the existing navigation and let `useLandingServices` measure its current visible bounds, cancel any in-flight animation, and start a new Web Animations transition without changing the existing service state model.

**Tech Stack:** Vue 3, TypeScript, CSS, Web Animations API, Node test runner, Nuxt

## Global Constraints

- Apply the counter spacing and shared fill only at `max-width: 900px`.
- Use an `8px` gap between the counter/header block and the chip row.
- Preserve `11px` mobile labels, the existing `24px` chip-to-device space, `#33434b` fill, and gradient active text.
- Use a `620ms` `cubic-bezier(0.22, 1, 0.36, 1)` stretch transition.
- Freeze the current visible fill bounds before restarting an interrupted transition.
- Disable the stretch under `prefers-reduced-motion: reduce`.
- Keep desktop Services behavior unchanged.

---

### Task 1: Define stretch geometry

**Files:**
- Create: `frontend/utils/landingServicesHighlight.ts`
- Modify: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `ServiceHighlightBounds = { x: number; width: number }`.
- Produces: `getServiceHighlightFrames(from: ServiceHighlightBounds, to: ServiceHighlightBounds): [ServiceHighlightBounds, ServiceHighlightBounds, ServiceHighlightBounds]`.

- [x] **Step 1: Add failing geometry tests**

Import `getServiceHighlightFrames` and assert both directions:

```ts
assert.deepEqual(
  getServiceHighlightFrames({ x: 10, width: 30 }, { x: 100, width: 50 }),
  [
    { x: 10, width: 30 },
    { x: 10, width: 140 },
    { x: 100, width: 50 },
  ],
);

assert.deepEqual(
  getServiceHighlightFrames({ x: 100, width: 50 }, { x: 10, width: 30 }),
  [
    { x: 100, width: 50 },
    { x: 10, width: 140 },
    { x: 10, width: 30 },
  ],
);
```

- [x] **Step 2: Run the landing test and verify RED**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs\landingStackOrbit.services-stretch-red.mjs
node --test .codex-logs\landingStackOrbit.services-stretch-red.mjs
```

Expected: FAIL because `frontend/utils/landingServicesHighlight.ts` does not exist.

- [x] **Step 3: Implement the minimal pure helper**

Create:

```ts
export type ServiceHighlightBounds = {
  x: number;
  width: number;
};

export function getServiceHighlightFrames(
  from: ServiceHighlightBounds,
  to: ServiceHighlightBounds,
): [ServiceHighlightBounds, ServiceHighlightBounds, ServiceHighlightBounds] {
  const bridgeX = Math.min(from.x, to.x);
  const bridgeRight = Math.max(from.x + from.width, to.x + to.width);

  return [from, { x: bridgeX, width: bridgeRight - bridgeX }, to];
}
```

- [x] **Step 4: Run the landing test and verify GREEN**

Run the commands from Step 2. Expected: all tests pass.

---

### Task 2: Add the shared mobile fill and close counter gap

**Files:**
- Modify: `frontend/components/landing/LandingServices.vue`
- Modify: `frontend/assets/css/landing-redesign.css`
- Modify: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: one decorative `<span data-serv-nav-highlight aria-hidden="true"></span>` inside `[data-serv-list]`.
- Consumes: existing `[data-serv-nav]`, `[data-serv-counter]`, and mobile breakpoint.

- [x] **Step 1: Add failing markup and CSS assertions**

Extend the mobile navigation regression test to require:

```ts
const servicesComponent = readFileSync("components/landing/LandingServices.vue", "utf8");

assert.match(servicesComponent, /data-serv-nav-highlight/);
assert.match(mobileCss, /\.vz-services \[data-sec-head\]\s*\{[^}]*margin-bottom:\s*8px;/);
assert.match(mobileCss, /\.vz-services__nav-highlight\s*\{[^}]*background:\s*#33434b;/);
assert.match(mobileCss, /button\[data-active="true"\]\s*\{[^}]*background:\s*transparent;/);
```

- [x] **Step 2: Run the landing test and verify RED**

Run the Task 1 test commands. Expected: FAIL because the shared highlight and spacing rules are absent.

- [x] **Step 3: Add the highlight markup and mobile styles**

Inside `[data-serv-list]`, place the highlight before the buttons:

```vue
<span class="vz-services__nav-highlight" data-serv-nav-highlight aria-hidden="true"></span>
```

Keep it hidden by default. In the mobile media query, make the nav positioned, place the highlight absolutely behind the buttons, and give buttons a higher stacking level. Set both mobile active-background declarations to `transparent`, and set:

```css
.vz-services [data-sec-head] {
  margin-bottom: 8px;
}
```

The composable will provide the highlight's `top`, `width`, `height`, and `transform` inline.

- [x] **Step 4: Run the landing test and verify GREEN**

Run the Task 1 test commands. Expected: all tests pass.

---

### Task 3: Drive the stretch from live button geometry

**Files:**
- Modify: `frontend/composables/landing/useLandingServices.ts`
- Modify: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: `getServiceHighlightFrames` from Task 1.
- Consumes: `[data-serv-list]`, `[data-serv-nav-highlight]`, and `[data-serv-nav]` from Task 2.
- Produces: a `620ms` three-frame Web Animations transition that can restart from current visible bounds.

- [x] **Step 1: Add failing runtime-source assertions**

Add:

```ts
const servicesComposable = readFileSync("composables/landing/useLandingServices.ts", "utf8");

assert.match(servicesComposable, /getServiceHighlightFrames/);
assert.match(servicesComposable, /querySelector<HTMLElement>\("\[data-serv-nav-highlight\]"\)/);
assert.match(servicesComposable, /highlight\.animate\(/);
assert.match(servicesComposable, /duration:\s*620/);
assert.match(servicesComposable, /prefers-reduced-motion:\s*reduce/);
assert.match(servicesComposable, /function handleResize\(\)/);
```

- [x] **Step 2: Run the landing test and verify RED**

Run the Task 1 test commands. Expected: FAIL because runtime highlight synchronization is absent.

- [x] **Step 3: Implement highlight synchronization**

Add module state for the current highlight animation and target index. During `render()`:

1. Measure the target button relative to `[data-serv-list]`.
2. On first render or after resize, place the highlight immediately.
3. On active-index changes, capture the highlight's current visible rectangle before cancelling its old animation.
4. Convert the three numeric frames from `getServiceHighlightFrames` into keyframes containing `translate3d(x, 0, 0)` and `width`.
5. Set the final inline geometry before calling `highlight.animate(keyframes, { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)" })`.
6. Skip animation when reduced motion is requested.

Use a named resize handler that marks the highlight uninitialized and schedules the existing render. Notify `onActiveChange` only after the selected state and final highlight geometry have been written so the negative-world clone captures the target fill.

- [x] **Step 4: Run the landing test and verify GREEN**

Run the Task 1 test commands. Expected: all landing tests pass.

---

### Task 4: Verify, build, serve, and commit

**Files:**
- Modify: `docs/superpowers/plans/2026-08-02-mobile-services-stretch-transition.md`

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: a tested production build and refreshed port `3001` preview for user visual QA.

- [x] **Step 1: Run every frontend test**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs\landingStackOrbit.services-stretch-final.mjs
node --test .codex-logs\landingStackOrbit.services-stretch-final.mjs
Get-ChildItem tests -Filter *.test.mjs | ForEach-Object {
  node --test $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: zero failures from the bundled landing test and every existing `.mjs` test.

- [x] **Step 2: Run the production build**

Run `npm run build`. Expected: exit code `0` and `Build complete!`.

- [x] **Step 3: Restart the verified preview**

Verify the current port `3001` listener command, stop only that exact Node preview process, start `.output/server/index.mjs` with `NITRO_PORT=3001`, and confirm HTTP `200`.

- [x] **Step 4: Preserve user-owned files and commit only target files**

Do not stage `.superpowers/` or `frontend/.codex-logs/`. Commit the helper, tests, component, composable, CSS, spec, and completed plan with:

```powershell
git commit -m "feat: animate mobile service chip flow"
```
