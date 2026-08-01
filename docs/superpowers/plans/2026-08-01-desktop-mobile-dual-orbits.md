# Desktop Mobile Dual Orbits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single desktop Mobile orbit with two slow counter-rotating 3D tracks whose labels shrink behind the core and never overlap.

**Architecture:** Keep timing, point generation, depth styling, and rectangle collision checks as pure helpers in `landingStackOrbit.ts`. Maintain separate outer and inner orbit clocks in the Three.js composable; the outer clock advances continuously while the inner clock uses look-ahead collision checks and retains its phase whenever the next safe step is blocked.

**Tech Stack:** Nuxt 3, Vue 3 composables, Three.js, TypeScript, Node test runner, esbuild.

## Global Constraints

- Affect desktop Mobile mode only when viewport width is greater than 900px.
- Preserve compact Mobile, Frontend, Backend, and DevOps behavior.
- Outer orbit duration is 36,000ms; inner orbit duration is 28,000ms in the opposite direction.
- React Native and Flutter share the outer orbit at a half-turn separation.
- Expo and PWA share the inner orbit at a half-turn separation.
- Rear labels remain visible and scale down to 0.84.
- Label cards must not overlap; orbit path lines may cross.
- No label may teleport when collision prevention blocks or releases the inner orbit.

---

### Task 1: Pure desktop Mobile orbit model

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `DESKTOP_MOBILE_ORBIT_TRACKS`, `getDesktopMobileOrbitAngle(elapsedMs, orbit, phase)`, `getDesktopMobileTechnologyPoint(spec, orbitElapsedMs)`, `getDesktopMobileLabelDepthStyle(worldZ)`, and `doMobileLabelBoundsOverlap(first, second, gapPx)`.
- Preserves: `MOBILE_ORBIT_TRACKS` and compact helpers unchanged.

- [ ] **Step 1: Write failing tests for durations, direction, assignments, depth, and collision symmetry**

```ts
assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.outer.durationMs, 36_000);
assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.inner.durationMs, 28_000);
assert.equal(getDesktopMobileOrbitAngle(36_000, "outer", 0), Math.PI * 2);
assert.equal(getDesktopMobileOrbitAngle(28_000, "inner", 0), -Math.PI * 2);
assert.equal(getDesktopMobileLabelDepthStyle(-2).scale, 0.84);
assert.equal(getDesktopMobileLabelDepthStyle(2).scale, 1);
assert.equal(doMobileLabelBoundsOverlap(a, b, 8), true);
assert.equal(doMobileLabelBoundsOverlap(b, a, 8), true);
```

- [ ] **Step 2: Bundle and run the test to observe the missing exports**

```powershell
New-Item -ItemType Directory -Force -Path .codex-test | Out-Null
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: FAIL because the desktop orbit helpers do not exist.

- [ ] **Step 3: Add the desktop-only track configuration and helpers**

```ts
export const DESKTOP_MOBILE_ORBIT_TRACKS = {
  outer: { direction: 1, durationMs: 36_000, radiusX: 2.02, radiusY: 1.08, rotation: [1.02, 0.28, -0.22] },
  inner: { direction: -1, durationMs: 28_000, radiusX: 1.72, radiusY: 0.92, rotation: [0.82, -0.38, 0.62] },
} as const;

export function doMobileLabelBoundsOverlap(first: MobileLabelBounds, second: MobileLabelBounds, gapPx = 8) {
  return Math.abs(first.centerX - second.centerX) < (first.width + second.width) / 2 + gapPx
    && Math.abs(first.centerY - second.centerY) < (first.height + second.height) / 2 + gapPx;
}
```

Use each technology's existing `phase` for desktop positions so same-orbit pairs remain exactly `Math.PI` apart. Clamp desktop depth to opacity `0.42..1` and scale `0.84..1`.

- [ ] **Step 4: Re-run the bundled test**

Expected: all orbit tests pass.

- [ ] **Step 5: Commit the pure model**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: model desktop mobile dual orbits"
```

### Task 2: Render and animate two independent desktop tracks

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: all Task 1 exports.
- Produces: two desktop Three.js orbit groups, desktop outer/inner elapsed clocks, and collision-safe label projection.

- [ ] **Step 1: Add a failing helper-level test for phase retention**

```ts
assert.equal(getCollisionSafeOrbitElapsed(10_000, 16.67, true), 10_000);
assert.equal(getCollisionSafeOrbitElapsed(10_000, 16.67, false), 10_016.67);
```

- [ ] **Step 2: Run the test and observe the missing helper failure**

Use the Task 1 bundle command. Expected: FAIL because `getCollisionSafeOrbitElapsed` is not exported.

- [ ] **Step 3: Implement phase retention and separate Three.js track groups**

```ts
export function getCollisionSafeOrbitElapsed(currentMs: number, deltaMs: number, blocked: boolean) {
  return blocked ? currentMs : currentMs + Math.max(0, deltaMs);
}
```

Create `desktopOrbitGroups.outer` and `desktopOrbitGroups.inner`, apply `DESKTOP_MOBILE_ORBIT_TRACKS[orbit].rotation`, and build one ellipse line per group from the matching radii. Remove the desktop pulse point. Assign every Mobile label to its matching desktop group and calculate its point from that orbit's retained elapsed clock.

- [ ] **Step 4: Add projected look-ahead collision prevention**

Before advancing the inner clock, project all four candidate label points, apply rendered scale to their measured card width and height, and compare every outer/inner pair with `doMobileLabelBoundsOverlap(..., 8)`. Advance the outer clock on every frame. Advance the inner clock only when the look-ahead state is safe; otherwise retain its current elapsed value. Use a 500ms look-ahead so the hold starts before rectangles touch.

- [ ] **Step 5: Apply desktop depth styling without changing compact styling**

Use `getDesktopMobileLabelDepthStyle(world.z)` for desktop Mobile and retain `getMobileLabelDepthStyle(world.z)` for compact Mobile. Keep z-index derived from `world.z` and keep the cards facing the camera through the existing HTML projection layer.

- [ ] **Step 6: Re-run the bundled orbit test**

Expected: all tests pass.

- [ ] **Step 7: Commit the renderer change**

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: animate desktop mobile dual orbits"
```

### Task 3: Verification and local handoff

**Files:**
- Verify: `frontend/composables/landing/useLandingStackSphere.ts`
- Verify: `frontend/utils/landingStackOrbit.ts`
- Verify: `frontend/tests/landingStackOrbit.test.ts`

- [ ] **Step 1: Run the full bundled orbit suite**

Use the Task 1 bundle command and require zero failures.

- [ ] **Step 2: Remove the generated bundle using `apply_patch`**

Delete `frontend/.codex-test/landingStackOrbit.test.mjs` and keep no generated test artifact in Git.

- [ ] **Step 3: Run production verification**

```powershell
npm run build
git diff --check
git status --short
```

Expected: Nuxt build exits 0, diff check reports no errors, and Git status is clean after commits.

- [ ] **Step 4: Restart the isolated dev server**

Start Nuxt from the worktree frontend with `nuxt dev --port 3001`, redirect output to task-specific temp logs, and require `curl.exe` to return `HTTP 200` for `http://localhost:3001/#stack`.

- [ ] **Step 5: Preserve the feature branch for visual review**

Keep `codex/desktop-stack-label-routes` and its worktree unchanged for subsequent user iterations.
