# Desktop Backend Label Collision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Backend's outer label routes toward the poles and delay a trailing Backend label at the left edge until the same route has enough space.

**Architecture:** Add a dedicated Backend route profile to the pure route utility, preserving the existing numeric scale API for Frontend parity tests. Replace the desktop label renderer's single pass with a projection pass and a clock-control pass so collision decisions use actual projected centers and measured DOM widths, while blocked labels pause their effective route time at the left edge.

**Tech Stack:** TypeScript, Vue 3/Nuxt 3, Three.js, Node test runner, esbuild

## Global Constraints

- Backend route radius remains `0.81`.
- Backend lane heights are `[0.58, 0.16, -0.16, -0.58]`.
- A trailing Backend label is hidden below `14px` edge clearance.
- A blocked label's route clock does not advance; once unblocked, the existing route fade-in starts from the left edge.
- Frontend, DevOps, Mobile, traversal timing, endpoint fading, and lane wrapping remain unchanged.

---

### Task 1: Model Backend polar routes

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/utils/landingStackOrbit.ts`

**Interfaces:**
- Produces: `BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE`.
- Extends: `getDesktopStackLabelRouteState(elapsedMs, labelIndex, labelCount, routeProfileOrScale)`.

- [ ] **Step 1: Add the failing route-profile test**

```ts
test("moves backend outer routes toward the poles", () => {
  const laneYs = Array.from({ length: 4 }, (_, traversal) => (
    getDesktopStackLabelRouteState(
      DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * traversal,
      0,
      4,
      BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE,
    ).point.y
  ));

  assert.deepEqual(laneYs, [0.58, 0.16, -0.16, -0.58]);
});
```

- [ ] **Step 2: Verify RED**

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: bundling fails because `BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE` does not exist.

- [ ] **Step 3: Add the Backend profile and profile-aware geometry**

```ts
export const BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE = {
  geometryScale: 0.5,
  laneYs: [0.58, 0.16, -0.16, -0.58],
} as const;
```

When a profile is supplied, use `DESKTOP_STACK_LABEL_RADIUS * geometryScale` as the radius and the profile's lane height as the final `y`. When a number is supplied, retain the existing coordinate scaling path exactly.

- [ ] **Step 4: Verify GREEN**

Run the Step 2 commands. Expected: all tests pass.

### Task 2: Model collision-safe appearance

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/utils/landingStackOrbit.ts`

**Interfaces:**
- Produces: `getBackendStackLabelClearanceFactor(candidate, peers)`.
- Candidate and peers expose `centerX`, `laneIndex`, and `width`.

- [ ] **Step 1: Add failing collision tests**

```ts
const candidate = { centerX: 100, laneIndex: 0, width: 84 };

assert.equal(getBackendStackLabelClearanceFactor(candidate, [
  { centerX: 198, laneIndex: 0, width: 84 },
]), 0);
assert.equal(getBackendStackLabelClearanceFactor(candidate, [
  { centerX: 210, laneIndex: 0, width: 84 },
]), 0.5);
assert.equal(getBackendStackLabelClearanceFactor(candidate, [
  { centerX: 222, laneIndex: 0, width: 84 },
]), 1);
assert.equal(getBackendStackLabelClearanceFactor(candidate, [
  { centerX: 198, laneIndex: 1, width: 84 },
]), 1);
```

- [ ] **Step 2: Verify RED**

Run the Task 1 test command. Expected: bundling fails because the clearance helper does not exist.

- [ ] **Step 3: Implement the pure helper**

```ts
const clearance = peer.centerX - peer.width / 2
  - (candidate.centerX + candidate.width / 2);
const normalized = Math.min(1, Math.max(0, (clearance - 14) / 24));
return normalized * normalized * (3 - 2 * normalized);
```

Use the minimum clearance among peers ahead on the same lane. Return `1` when no such peer exists.

- [ ] **Step 4: Verify GREEN**

Run the Task 1 test command. Expected: all tests pass.

### Task 3: Pause conflicting Backend route clocks

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Consumes: `BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE`, `getBackendStackLabelClearanceFactor`, and `advanceBackendStackLabelClock`.

- [ ] **Step 1: Add the failing clock test**

```ts
const initial = advanceBackendStackLabelClock(1_000, null, false);
const moving = advanceBackendStackLabelClock(1_200, initial.state, false);
const paused = advanceBackendStackLabelClock(1_500, moving.state, true);
const stillPaused = advanceBackendStackLabelClock(1_800, paused.state, true);
const resumed = advanceBackendStackLabelClock(2_000, stillPaused.state, false);

assert.equal(initial.effectiveElapsedMs, 0);
assert.equal(moving.effectiveElapsedMs, 200);
assert.equal(paused.effectiveElapsedMs, 200);
assert.equal(stillPaused.effectiveElapsedMs, 200);
assert.equal(resumed.effectiveElapsedMs, 400);
```

- [ ] **Step 2: Implement the clock helper**

```ts
type BackendStackLabelClockState = {
  delayMs: number;
  lastElapsedMs: number;
  originElapsedMs: number;
};
```

On every blocked frame, add the frame delta to `delayMs`; effective route time is `elapsedMs - originElapsedMs - delayMs`.

- [ ] **Step 3: Add projection and clock-control passes**

Project tentative Backend layouts from their individual effective times. If a label is still in its route fade-in and clearance is blocked, advance its clock with `waiting: true`, recompute the frozen layout, and render its ordinary route opacity. Do not multiply opacity by a separate collision factor.

- [ ] **Step 4: Verify tests and build**

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
.\node_modules\.bin\nuxt.cmd build
```

Expected: tests and build exit with code `0`.

- [ ] **Step 5: Verify in the browser**

At `http://localhost:3001/#stack` with viewport `1440×900`, activate Backend. Confirm counter `02 / 04`, visible canvas, outer label centers near the upper and lower poles, no intersecting visible label rectangles, delayed appearance near the left edge, and no relevant console errors.

- [ ] **Step 6: Commit**

```powershell
git add frontend/tests/landingStackOrbit.test.ts frontend/utils/landingStackOrbit.ts frontend/composables/landing/useLandingStackSphere.ts
git commit -m "fix: prevent backend label collisions"
```
