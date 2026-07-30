# Desktop Backend Label Collision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Backend's outer label routes toward the poles and prevent a trailing Backend label from appearing too close to another label on the same route.

**Architecture:** Add a dedicated Backend route profile to the pure route utility, preserving the existing numeric scale API for Frontend parity tests. Replace the desktop label renderer's single pass with a projection pass and a visibility pass so collision decisions use actual projected centers and measured DOM widths.

**Tech Stack:** TypeScript, Vue 3/Nuxt 3, Three.js, Node test runner, esbuild

## Global Constraints

- Backend route radius remains `0.81`.
- Backend lane heights are `[0.58, 0.16, -0.16, -0.58]`.
- A trailing Backend label is hidden below `14px` edge clearance.
- Collision visibility transitions from hidden to visible across the next `24px`.
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

### Task 3: Apply collision gating to rendered Backend labels

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Consumes: `BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE` and `getBackendStackLabelClearanceFactor`.

- [ ] **Step 1: Add a projection pass**

Replace the desktop `forEach` with a `map` that returns the item, route state, projected `x`/`y`, `world.z`, and `item.element.offsetWidth`.

- [ ] **Step 2: Add a visibility pass**

For each Backend layout, call:

```ts
const target = getBackendStackLabelClearanceFactor(layout, backendLayouts);
```

Maintain `Map<HTMLElement, { factor: number; lastX: number }>` state. A blocked target sets `factor` to `0`; an increasing target advances by at most `(x - lastX) / 24` per frame. Multiply route opacity by the resulting factor. Other layers use factor `1`.

- [ ] **Step 3: Verify tests and build**

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
.\node_modules\.bin\nuxt.cmd build
```

Expected: tests and build exit with code `0`.

- [ ] **Step 4: Verify in the browser**

At `http://localhost:3001/#stack` with viewport `1440×900`, activate Backend. Confirm counter `02 / 04`, visible canvas, outer label centers near the upper and lower poles, no intersecting visible label rectangles, and no relevant console errors.

- [ ] **Step 5: Commit**

```powershell
git add frontend/tests/landingStackOrbit.test.ts frontend/utils/landingStackOrbit.ts frontend/composables/landing/useLandingStackSphere.ts
git commit -m "fix: prevent backend label collisions"
```
