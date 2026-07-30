# Desktop Backend Label Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Backend labels follow the same desktop latitude animation as Frontend at exactly half the route size.

**Architecture:** Extend the pure desktop route-state utility with an optional geometry scale that defaults to `1`. The Three.js projection layer passes `0.5` only for `core` labels, preserving every existing caller and all timing, fade, jitter, and lane-transition behavior.

**Tech Stack:** TypeScript, Vue 3/Nuxt 3, Three.js, Node test runner, esbuild

## Global Constraints

- Backend route geometry is exactly `0.5` of Frontend geometry: radius `1.62` becomes `0.81`, and lane heights are halved.
- Traversal duration, deterministic jitter, fade curve, label phasing, and lane wrap remain unchanged.
- Frontend and mobile behavior must not change.
- Desktop-only behavior remains gated by the existing `window.innerWidth > 900` condition.

---

### Task 1: Add a scaled Backend route profile

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/utils/landingStackOrbit.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Consumes: `getDesktopStackLabelRouteState(elapsedMs, labelIndex, labelCount)` and each label item's `layer`.
- Produces: `getDesktopStackLabelRouteState(elapsedMs, labelIndex, labelCount, geometryScale = 1)`.

- [ ] **Step 1: Write the failing unit test**

Add a test that samples Frontend and Backend at the same time:

```ts
test("scales backend desktop routes to half the frontend sphere", () => {
  const elapsed = DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * 0.43;
  const frontend = getDesktopStackLabelRouteState(elapsed, 0, 4);
  const backend = getDesktopStackLabelRouteState(elapsed, 0, 4, 0.5);

  assert.equal(backend.point.x, Number((frontend.point.x * 0.5).toFixed(6)));
  assert.equal(backend.point.y, Number((frontend.point.y * 0.5).toFixed(6)));
  assert.equal(backend.point.z, Number((frontend.point.z * 0.5).toFixed(6)));
  assert.equal(backend.opacity, frontend.opacity);
  assert.equal(backend.progress, frontend.progress);
  assert.equal(backend.laneIndex, frontend.laneIndex);
  assert.equal(backend.jitterPx, frontend.jitterPx);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: TypeScript bundling fails because `getDesktopStackLabelRouteState` accepts only three arguments, or the new test fails because Backend coordinates are not scaled.

- [ ] **Step 3: Implement the geometry scale**

Change the route utility signature and apply the normalized scale only to geometry:

```ts
export function getDesktopStackLabelRouteState(
  elapsedMs: number,
  labelIndex: number,
  labelCount: number,
  geometryScale = 1,
) {
  const safeScale = Math.max(0, geometryScale);
  const laneY = lane.y * safeScale;
  const routeRadius = DESKTOP_STACK_LABEL_RADIUS * safeScale;
  const latitudeRadius = Math.sqrt(
    Math.max(0, routeRadius ** 2 - laneY ** 2),
  );
```

Return `laneY` as `point.y`. Do not scale opacity, progress, jitter, timing, or lane selection.

In the desktop projection call, select the scale from the label layer:

```ts
const route = getDesktopStackLabelRouteState(
  elapsedMs,
  item.desktopRouteIndex,
  item.desktopRouteCount,
  item.layer === "core" ? 0.5 : 1,
);
```

- [ ] **Step 4: Run all route tests and verify GREEN**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: all tests pass, including the new Backend scale test.

- [ ] **Step 5: Build and visually verify**

Run:

```powershell
.\node_modules\.bin\nuxt.cmd build
```

Expected: exit code `0`.

On `http://localhost:3001/#stack` at a desktop viewport, activate Backend and confirm its four labels travel across the smaller core sphere, fade completely before the right edge, and change latitude only while invisible.

- [ ] **Step 6: Commit**

```powershell
git add frontend/tests/landingStackOrbit.test.ts frontend/utils/landingStackOrbit.ts frontend/composables/landing/useLandingStackSphere.ts
git commit -m "feat: scale backend label routes"
```
