# Desktop Mobile Static Orbits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the Frontend shell, halve the core, lengthen the tracks, and keep desktop Mobile orbit lines stationary while labels continue moving.

**Architecture:** Keep desktop-only layer and scale decisions in pure orbit utilities. Render desktop orbit groups from a scene-level static root while the sphere root continues its existing rotation; compact orbit groups remain children of the sphere root.

**Tech Stack:** Nuxt 3, Vue 3 composables, Three.js, TypeScript, Node test runner, esbuild.

## Global Constraints

- Desktop Mobile only (`> 900px`).
- Mobile surface target is zero.
- Desktop Mobile core scale is exactly `0.596`.
- Outer and inner horizontal radii are `1.70` and `1.38`; vertical radii remain `0.92` and `0.72`.
- Orbit lines are static; labels retain 36-second and 28-second counter-rotation.
- Compact Mobile, Frontend, Backend, and DevOps remain unchanged.

---

### Task 1: Desktop Mobile layer and geometry targets

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

- [ ] **Step 1: Add failing tests**

```ts
assert.deepEqual(getStackLayerTargets("mobile", false), {
  bridge: 0.52,
  core: 0.48,
  surface: 0,
});
assert.equal(getStackGroupScale("core", "mobile", false, false), 0.596);
assert.deepEqual(getDesktopMobileOrbitPoint(0, "outer"), { x: 1.7, y: 0, z: 0 });
assert.deepEqual(getDesktopMobileOrbitPoint(0, "inner"), { x: 1.38, y: 0, z: 0 });
```

- [ ] **Step 2: Run the bundled orbit suite and observe assertion failures**

```powershell
New-Item -ItemType Directory -Force -Path .codex-test | Out-Null
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

- [ ] **Step 3: Implement the exact targets and radii**

Set the desktop Mobile surface target to `0`, return `0.596` for the desktop Mobile core, and update only `DESKTOP_MOBILE_ORBIT_TRACKS.outer.radiusX` and `.inner.radiusX`.

- [ ] **Step 4: Re-run the suite and require all tests to pass**

- [ ] **Step 5: Commit the utility change**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: resize desktop mobile orbit layers"
```

### Task 2: Static desktop orbit root

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

- [ ] **Step 1: Create a scene-level desktop orbit root**

```ts
const desktopOrbitRoot = new THREE.Group();
scene.add(rootGroup, desktopOrbitRoot, desktopLabelRoutesGroup);
desktopOrbitRoot.add(desktopOrbitGroups.outer, desktopOrbitGroups.inner);
```

Keep `compactOrbitGroups.outer` and `.inner` inside `rootGroup`.

- [ ] **Step 2: Update candidate projection matrices**

Call `desktopOrbitRoot.updateMatrixWorld(true)` before projecting desktop Mobile candidates so collision checks and rendered labels use current scene-level matrices.

- [ ] **Step 3: Run the orbit suite and production build**

```powershell
node --test .codex-test\landingStackOrbit.test.mjs
npm run build
```

- [ ] **Step 4: Commit the renderer change**

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts
git commit -m "feat: keep desktop mobile orbit lines static"
```

### Task 3: Local verification

- [ ] **Step 1: Run the full bundled orbit suite after commits**
- [ ] **Step 2: Delete `.codex-test/landingStackOrbit.test.mjs` using `apply_patch`**
- [ ] **Step 3: Require `git diff --check` and a clean `git status --short`**
- [ ] **Step 4: Start Nuxt from this worktree with `nuxt dev --port 3001`**
- [ ] **Step 5: Require `HTTP 200` from `http://localhost:3001/#stack` and leave the branch/worktree preserved**
