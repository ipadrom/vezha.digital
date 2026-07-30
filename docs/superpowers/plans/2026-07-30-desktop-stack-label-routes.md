# Desktop Stack Label Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move desktop Stack technology labels through four approved latitude routes and change routes only while fully invisible.

**Architecture:** Add a pure deterministic desktop route model to the existing Stack orbit utility, then consume it inside the existing DOM label projector. Preserve the current compact/mobile projection branch and all WebGL geometry.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js, Node test runner, esbuild.

## Global Constraints

- Apply only when the viewport is wider than `900px`.
- Keep compact/mobile Stack label behavior unchanged.
- Use exactly four routes in the cycle `1 → 2 → 3 → 4 → 1`.
- Reset to the next route only at opacity `0`.
- Keep per-traversal vertical offset within `-3px` to `3px`.
- Run the isolated development server on port `3001`.

---

## File Structure

- `frontend/utils/landingStackOrbit.ts`: pure desktop route state, constants,
  opacity envelope, and deterministic vertical offset.
- `frontend/tests/landingStackOrbit.test.ts`: behavior-level regression tests
  for the route cycle.
- `frontend/composables/landing/useLandingStackSphere.ts`: desktop-only
  projection integration; existing compact/mobile behavior remains intact.

### Task 1: Model the four-route desktop cycle

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces:
  `getDesktopStackLabelRouteState(elapsedMs: number, labelIndex: number, labelCount: number): { laneIndex: number; progress: number; opacity: number; point: { x: number; y: number; z: number }; jitterPx: number }`
- Produces: `DESKTOP_STACK_LABEL_ROUTE_DURATION_MS`
- Produces: `DESKTOP_STACK_LABEL_LANES`

- [ ] **Step 1: Write failing route behavior tests**

Add tests with hand-derived assertions:

```ts
test("moves desktop labels left to right on four latitude routes", () => {
  const start = getDesktopStackLabelRouteState(0, 0, 4);
  const middle = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS / 2,
    0,
    4,
  );
  const end = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS - 1,
    0,
    4,
  );

  assert.equal(start.laneIndex, 0);
  assert.ok(start.point.x < middle.point.x);
  assert.ok(middle.point.x < end.point.x);
  assert.equal(start.opacity, 0);
  assert.equal(end.opacity, 0);
});

test("hands off invisibly to the next lane and wraps after lane four", () => {
  const secondLane = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS,
    0,
    4,
  );
  const firstLaneAgain = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * 4,
    0,
    4,
  );

  assert.equal(secondLane.laneIndex, 1);
  assert.equal(secondLane.opacity, 0);
  assert.equal(firstLaneAgain.laneIndex, 0);
  assert.equal(firstLaneAgain.opacity, 0);
});

test("keeps traversal jitter deterministic and within three pixels", () => {
  for (let traversal = 0; traversal < 12; traversal += 1) {
    const elapsed = traversal * DESKTOP_STACK_LABEL_ROUTE_DURATION_MS;
    const first = getDesktopStackLabelRouteState(elapsed, 2, 5);
    const repeated = getDesktopStackLabelRouteState(elapsed, 2, 5);
    assert.equal(first.jitterPx, repeated.jitterPx);
    assert.ok(first.jitterPx >= -3 && first.jitterPx <= 3);
  }
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
$out=Join-Path $env:TEMP 'vezha-landingStackOrbit-red.mjs'
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=$out
node --test $out
```

Expected: FAIL because `getDesktopStackLabelRouteState`,
`DESKTOP_STACK_LABEL_ROUTE_DURATION_MS`, and
`DESKTOP_STACK_LABEL_LANES` are not exported.

- [ ] **Step 3: Implement the minimal pure route model**

Add four lane heights, an `18_000ms` traversal duration, a front-hemisphere
angle range smaller than `Math.PI / 2`, a smooth `12%` fade envelope, and a
stable integer hash that maps each traversal to `-3..3`.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Step 2 commands. Expected: all existing and new tests pass.

### Task 2: Integrate the model into desktop label projection

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Consumes: `getDesktopStackLabelRouteState`
- Consumes: `DESKTOP_STACK_LABEL_ROUTE_DURATION_MS`

- [ ] **Step 1: Add desktop route metadata**

Give each logical label a `desktopRouteIndex`, `desktopRouteCount`, and
`desktopRoutePrimary` value. Existing mirrored label elements are primary only
on the first point and remain available for compact/mobile projection.

- [ ] **Step 2: Add a fixed desktop route projection group**

Create a non-animated Three.js group with the accepted Stack orientation
`(-0.16, -0.4, 0.08)`. Use it only to project the pure route points into the
DOM label layer.

- [ ] **Step 3: Route desktop labels before legacy projection**

When `window.innerWidth > 900`, compute every active primary label from
`getDesktopStackLabelRouteState(now, index, count)`. Apply the returned point,
opacity, and `jitterPx`. Force mirrored elements and inactive layers to
opacity `0`. Do not run collision relayout for desktop route labels.

When `window.innerWidth <= 900`, execute the current paired projection,
front/back visibility, mobile depth styling, and collision relayout unchanged.

- [ ] **Step 4: Verify type and production builds**

Run:

```powershell
corepack yarn build
```

Expected: Nuxt build exits `0`.

### Task 3: Start isolated visual review server

**Files:**
- No repository files changed.

- [ ] **Step 1: Start Nuxt on port 3001**

Run:

```powershell
corepack yarn dev --port 3001
```

Expected: Nuxt reports a local URL using port `3001`.

- [ ] **Step 2: Confirm the server responds**

Run:

```powershell
Invoke-WebRequest http://localhost:3001 -UseBasicParsing
```

Expected: HTTP status `200`.

