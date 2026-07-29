# Mobile Orbit Motion Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slow the compact Mobile satellites, shrink the compact core to `0.5`, and make the compact orbit system almost stationary.

**Architecture:** Keep timing, scale, and compact root-rotation calculations in the existing pure TypeScript orbit model. The Three.js composable consumes the tested root-rotation function only in compact Mobile mode and preserves the current animation branch everywhere else.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js, Node built-in test runner, esbuild.

## Global Constraints

- Apply the refinement only while Mobile is active at viewport widths up to `900px`.
- Set the compact Mobile core group scale to exactly `0.5`.
- Set the larger orbit duration to `32s`.
- Set the smaller orbit duration to `24s`.
- Preserve opposite label travel directions.
- Remove continuous accumulated root rotation from compact Mobile.
- Use compact drift amplitudes of `0.012` on X, `0.01` on Y, and `0.008` on Z.
- Use drift cycles of approximately `126s`, `157s`, and `180s`.
- Keep desktop Mobile and Frontend, Backend, and DevOps unchanged.
- Keep reduced-motion mode static.
- Add no packages, assets, content fields, CSS, or API changes.
- Push directly to `origin/main` after fresh tests and a production build.

---

### Task 1: Tested compact timing, scale, and drift model

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/utils/landingStackOrbit.ts`

**Interfaces:**
- Consumes: existing `MobileOrbitId`, `StackBaseLayer`, and `StackVisualLayer`.
- Produces: updated `MOBILE_ORBIT_TRACKS`, updated `getStackGroupScale(...)`, and `getCompactMobileRootRotation(elapsedMs): { x: number; y: number; z: number }`.

- [ ] **Step 1: Write failing timing and scale assertions**

Update the existing tests:

```ts
test("advances the slower tracks in opposite directions", () => {
  assert.equal(getMobileOrbitAngle(8_000, "outer", 0), Math.PI / 2);
  assert.equal(getMobileOrbitAngle(6_000, "inner", 0), -Math.PI / 2);
  assert.equal(getMobileOrbitAngle(0, "outer", Math.PI), Math.PI);
});

test("uses compact-only Mobile shell opacity and core scale", () => {
  assert.deepEqual(getStackLayerTargets("mobile", true), {
    bridge: 0.52,
    core: 0.48,
    surface: 0,
  });
  assert.equal(getStackGroupScale("core", "mobile", true), 0.5);
  assert.equal(getStackGroupScale("core", "mobile", false), 1.192);
});
```

- [ ] **Step 2: Add a failing compact drift test**

Import `getCompactMobileRootRotation` and add:

```ts
test("keeps compact Mobile root drift slow and tightly bounded", () => {
  assert.deepEqual(getCompactMobileRootRotation(0), {
    x: -0.16,
    y: -0.4,
    z: 0.08,
  });

  for (let elapsedMs = 0; elapsedMs <= 360_000; elapsedMs += 10_000) {
    const rotation = getCompactMobileRootRotation(elapsedMs);
    assert.ok(rotation.x >= -0.172 && rotation.x <= -0.148);
    assert.ok(rotation.y >= -0.41 && rotation.y <= -0.39);
    assert.ok(rotation.z >= 0.072 && rotation.z <= 0.088);
  }
});
```

- [ ] **Step 3: Run the test and verify RED**

Run from `frontend`:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: FAIL because the old durations produce different quarter-turn angles,
the compact core scale is `0.86`, and the drift function does not exist.

- [ ] **Step 4: Implement the minimal model changes**

In `frontend/utils/landingStackOrbit.ts`, set:

```ts
export const MOBILE_ORBIT_TRACKS = {
  outer: {
    direction: 1,
    durationMs: 32_000,
    radiusX: 2.02,
    radiusY: 1.08,
    rotation: [1.02, 0.28, -0.22],
  },
  inner: {
    direction: -1,
    durationMs: 24_000,
    radiusX: 1.72,
    radiusY: 0.92,
    rotation: [0.82, -0.38, 0.62],
  },
} as const;
```

Change the compact core branch:

```ts
if (compactMobile && visualLayer === "mobile" && layer === "core") return 0.5;
```

Add the pure drift function:

```ts
export function getCompactMobileRootRotation(elapsedMs: number) {
  return {
    x: -0.16 + Math.sin(elapsedMs * 0.00005) * 0.012,
    y: -0.4 + Math.sin(elapsedMs * 0.00004) * 0.01,
    z: 0.08 + Math.sin(elapsedMs * 0.000035) * 0.008,
  };
}
```

- [ ] **Step 5: Run the test and verify GREEN**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 6: Commit the model**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: calm compact mobile orbit timing"
```

---

### Task 2: Compact-only root drift and production delivery

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Consumes: `getCompactMobileRootRotation(elapsedMs)` from Task 1 and the existing `orbitMode`.
- Produces: compact Mobile root motion without accumulated rotation; all other render states keep their existing animation.

- [ ] **Step 1: Import and apply the tested compact rotation**

Import:

```ts
import {
  getCompactMobileRootRotation,
  // existing imports remain
} from "~/utils/landingStackOrbit";
```

Replace the unconditional root animation inside `tick` with:

```ts
if (orbitMode === "compact") {
  const targetRotation = getCompactMobileRootRotation(now);
  const driftEase = 0.035 * frame;
  rootGroup.rotation.x += (targetRotation.x - rootGroup.rotation.x) * driftEase;
  rootGroup.rotation.y += (targetRotation.y - rootGroup.rotation.y) * driftEase;
  rootGroup.rotation.z += (targetRotation.z - rootGroup.rotation.z) * driftEase;
} else {
  rootGroup.rotation.y += 0.0022 * frame;
  rootGroup.rotation.x = -0.16 + Math.sin(now * 0.00022) * 0.08;
  rootGroup.rotation.z = 0.08 + Math.sin(now * 0.00018 + 1.2) * 0.045;
}
```

This branch must remain after label/orbit updates and before
`renderer.render(scene, camera)`.

- [ ] **Step 2: Run the orbit unit test**

Run from `frontend`:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 3: Run the production build**

Run:

```powershell
npm run build
```

Expected: Nuxt exits with code `0`.

- [ ] **Step 4: Commit the renderer**

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts
git commit -m "feat: steady compact mobile orbit system"
```

- [ ] **Step 5: Synchronize with the remote main branch**

Run from the repository root:

```powershell
git fetch origin main
git rev-list --left-right --count origin/main...HEAD
```

Expected: the left count is `0`. If the remote moved, rebase onto
`origin/main`, rerun the unit test and production build, and stop on any
conflict or failure.

- [ ] **Step 6: Run fresh pre-push verification**

Run:

```powershell
git diff --check
Set-Location frontend
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
npm run build
Set-Location ..
```

Expected: no whitespace errors, all tests pass, and the build exits with
code `0`.

- [ ] **Step 7: Push and verify the remote commit**

Run:

```powershell
git push origin main
git fetch origin main
git rev-parse HEAD
git rev-parse origin/main
```

Expected: local and remote hashes are identical.
