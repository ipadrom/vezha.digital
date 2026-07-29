# Mobile Orbit Satellites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the compact Mobile stack visualization into two clear intersecting orbital tracks with independently moving labels, a transparent outer shell, and a smaller core.

**Architecture:** Extend the pure orbit model with two named tracks, deterministic animation timing, and compact-Mobile layer/scale targets. The existing Three.js composable will keep its desktop single-orbit path and add two compact-only orbit groups that update the four DOM label anchors on every frame while reusing the current projection and cleanup lifecycle.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js, Node built-in test runner, esbuild.

## Global Constraints

- Apply the refinement only while Mobile is active at viewport widths up to `900px`.
- Keep the existing desktop Mobile presentation unchanged.
- Keep Frontend, Backend, and DevOps opacity, scale, labels, and motion unchanged at every width.
- Put `React Native` and `Flutter` on the larger orbit.
- Put `Expo` and `PWA` on the smaller orbit.
- Use opposite directions and loop durations of approximately `14s` and `10s`.
- Keep label text horizontal and readable; use only subtle scale and opacity changes for depth.
- Set the compact Mobile outer surface opacity to `0`.
- Make the compact Mobile core `25–30%` smaller than its current Mobile presentation.
- Add no packages, image assets, content fields, or API changes.
- Under `prefers-reduced-motion: reduce`, render both tracks and all four labels statically.
- Run technical checks locally, but leave final visual approval to the user.

---

### Task 1: Deterministic two-orbit model

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/utils/landingStackOrbit.ts`

**Interfaces:**
- Consumes: existing `StackVisualLayer`, `StackBaseLayer`, and Mobile technology metadata.
- Produces: `MobileOrbitId`, `MOBILE_ORBIT_TRACKS`, revised `MOBILE_ORBIT_TECH`, `getMobileOrbitPoint(angle, orbitId)`, `getMobileOrbitAngle(elapsedMs, orbitId, phase)`, `getStackLayerTargets(layer, compactMobile)`, and `getStackGroupScale(layer, visualLayer, compactMobile)`.

- [ ] **Step 1: Replace the old single-orbit assertions with failing two-orbit tests**

Add these imports and assertions in `frontend/tests/landingStackOrbit.test.ts`:

```ts
import {
  MOBILE_ORBIT_TECH,
  MOBILE_ORBIT_TRACKS,
  getMobileOrbitAngle,
  getMobileOrbitPoint,
  getStackGroupScale,
  getStackLayerTargets,
  resolveStackVisualLayer,
} from "../utils/landingStackOrbit";

test("assigns technologies to two compact Mobile tracks", () => {
  assert.deepEqual(
    MOBILE_ORBIT_TECH.map(({ label, orbit }) => [label, orbit]),
    [
      ["React Native", "outer"],
      ["Expo", "inner"],
      ["PWA", "inner"],
      ["Flutter", "outer"],
    ],
  );
  assert.equal(MOBILE_ORBIT_TRACKS.outer.durationMs, 14_000);
  assert.equal(MOBILE_ORBIT_TRACKS.inner.durationMs, 10_000);
  assert.equal(MOBILE_ORBIT_TRACKS.outer.direction, 1);
  assert.equal(MOBILE_ORBIT_TRACKS.inner.direction, -1);
});

test("returns deterministic points for both orbit ellipses", () => {
  assert.deepEqual(getMobileOrbitPoint(0, "outer"), { x: 2.02, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, "outer"), { x: 0, y: 1.08, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(0, "inner"), { x: 1.72, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, "inner"), { x: 0, y: 0.92, z: 0 });
});

test("advances the tracks in opposite directions at different speeds", () => {
  assert.equal(getMobileOrbitAngle(3_500, "outer", 0), Math.PI / 2);
  assert.equal(getMobileOrbitAngle(2_500, "inner", 0), -Math.PI / 2);
  assert.equal(getMobileOrbitAngle(0, "outer", Math.PI), Math.PI);
});

test("uses compact-only Mobile shell opacity and core scale", () => {
  assert.deepEqual(getStackLayerTargets("mobile", true), {
    bridge: 0.52,
    core: 0.48,
    surface: 0,
  });
  assert.deepEqual(getStackLayerTargets("mobile", false), {
    bridge: 0.52,
    core: 0.48,
    surface: 0.58,
  });
  assert.equal(getStackGroupScale("core", "mobile", true), 0.86);
  assert.equal(getStackGroupScale("core", "mobile", false), 1.192);
});
```

- [ ] **Step 2: Run the unit test and verify the new contract fails**

Run from `frontend`:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: FAIL because the two-track exports and compact parameters do not exist.

- [ ] **Step 3: Implement the two-track data and deterministic helpers**

Replace the single-orbit metadata in `frontend/utils/landingStackOrbit.ts` with:

```ts
export type MobileOrbitId = "outer" | "inner";

export const MOBILE_ORBIT_TRACKS = {
  outer: {
    direction: 1,
    durationMs: 14_000,
    radiusX: 2.02,
    radiusY: 1.08,
    rotation: [1.02, 0.28, -0.22],
  },
  inner: {
    direction: -1,
    durationMs: 10_000,
    radiusX: 1.72,
    radiusY: 0.92,
    rotation: [0.82, -0.38, 0.62],
  },
} as const;

export const MOBILE_ORBIT_TECH = [
  { color: "#61DAFB", label: "React Native", orbit: "outer", phase: 2.5, slug: "react" },
  { color: "#111318", label: "Expo", orbit: "inner", phase: 0.9, slug: "expo" },
  { color: "#5A0FC8", label: "PWA", orbit: "inner", phase: 0.9 + Math.PI, slug: "pwa" },
  { color: "#54C5F8", label: "Flutter", orbit: "outer", phase: 2.5 + Math.PI, slug: "flutter" },
] as const;

export function getMobileOrbitPoint(angle: number, orbit: MobileOrbitId = "outer") {
  const track = MOBILE_ORBIT_TRACKS[orbit];
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const normalizedX = Math.abs(cosine) < 1e-12 ? 0 : cosine;
  const normalizedY = Math.abs(sine) < 1e-12 ? 0 : sine;
  return {
    x: Number((normalizedX * track.radiusX).toFixed(6)),
    y: Number((normalizedY * track.radiusY).toFixed(6)),
    z: 0,
  };
}

export function getMobileOrbitAngle(
  elapsedMs: number,
  orbit: MobileOrbitId,
  phase = 0,
) {
  const track = MOBILE_ORBIT_TRACKS[orbit];
  return phase + (elapsedMs / track.durationMs) * Math.PI * 2 * track.direction;
}
```

Update the layer and group helpers:

```ts
export function getStackLayerTargets(
  layer: StackVisualLayer,
  compactMobile = false,
): StackLayerTargets {
  if (layer === "core") return { bridge: 0.16, core: 1, surface: 0.12 };
  if (layer === "bridge") return { bridge: 1, core: 0.26, surface: 0.26 };
  if (layer === "mobile") {
    return {
      bridge: 0.52,
      core: 0.48,
      surface: compactMobile ? 0 : 0.58,
    };
  }
  return { bridge: 0.16, core: 0.1, surface: 1 };
}

export function getStackGroupScale(
  layer: StackBaseLayer,
  visualLayer: StackVisualLayer,
  compactMobile = false,
) {
  if (compactMobile && visualLayer === "mobile" && layer === "core") return 0.86;
  const target = getStackLayerTargets(visualLayer, compactMobile)[layer];
  return layer === "core" ? 1 + target * 0.4 : 1 + target * 0.055;
}
```

- [ ] **Step 4: Run the unit test and verify it passes**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all model tests pass with zero failures.

- [ ] **Step 5: Commit the model**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: model compact mobile satellite tracks"
```

---

### Task 2: Compact satellite renderer

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Consumes: all Task 1 exports.
- Produces: one unchanged desktop orbit group, two compact orbit groups, four independently animated Mobile label anchors, and compact-only sphere targets.

- [ ] **Step 1: Add a failing source contract for compact rendering**

Extend the existing renderer source test:

```ts
test("the sphere renderer supports two compact satellite tracks", async () => {
  const source = await readFile(
    new URL("../composables/landing/useLandingStackSphere.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /MOBILE_ORBIT_TRACKS/);
  assert.match(source, /getMobileOrbitAngle/);
  assert.match(source, /compactOrbitGroups/);
  assert.match(source, /isCompactMobile/);
  assert.match(source, /getStackGroupScale/);
});
```

- [ ] **Step 2: Run the test and verify the renderer contract fails**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: the new source-contract test fails because the compact renderer names are absent.

- [ ] **Step 3: Create separate desktop and compact orbit groups**

In `frontend/composables/landing/useLandingStackSphere.ts`:

- Import `MOBILE_ORBIT_TRACKS`, `getMobileOrbitAngle`, `getStackGroupScale`, and
  `type MobileOrbitId`.
- Rename the existing `orbitGroup` to `desktopOrbitGroup` without changing its
  rotation, line opacity, pulse, or desktop label positions.
- Create `compactOrbitGroups: Record<MobileOrbitId, THREE.Group>` and set their
  rotations from `MOBILE_ORBIT_TRACKS[orbit].rotation`.
- Build each compact line with 97 points from
  `getMobileOrbitPoint((index / 96) * Math.PI * 2, orbit)`.
- Use separate transparent `LineBasicMaterial` instances with active opacity
  targets `0.74` for `outer` and `0.62` for `inner`.
- Add all new geometries and materials to the existing disposal collections.

The compact paths are selected by:

```ts
const isCompactMobile = () => (
  activeStackLayer.value === "mobile" && window.innerWidth <= 900
);
```

The desktop path remains selected when Mobile is active and
`window.innerWidth > 900`.

- [ ] **Step 4: Make Mobile labels switch projection groups and move independently**

Store each Mobile label with `orbit`, `phase`, and a mutable local `point`:

```ts
return {
  element,
  layer: "mobile" as const,
  orbit: spec.orbit,
  phase: spec.phase,
  point: new THREE.Vector3(),
  projectionGroup: desktopOrbitGroup,
};
```

Before every render, update compact label anchors:

```ts
const updateMobileLabelPoints = (elapsedMs: number) => {
  const compact = isCompactMobile();
  mobileLabelPoints.forEach((item) => {
    const angle = compact
      ? getMobileOrbitAngle(elapsedMs, item.orbit, item.phase)
      : item.phase;
    const point = getMobileOrbitPoint(angle, compact ? item.orbit : "outer");
    item.point.set(point.x, point.y, point.z);
    item.projectionGroup = compact
      ? compactOrbitGroups[item.orbit]
      : desktopOrbitGroup;
  });
};
```

Call it with `0` from `renderStaticState()` and with `now` during active Mobile
animation. Do not rotate the compact groups: label motion must come from their
changing orbital angle. Keep the existing slow `desktopOrbitGroup.rotation.z`
animation only for desktop Mobile.

- [ ] **Step 5: Add front/back depth without rotating the DOM labels**

In `updateStackLabels`, derive Mobile depth from the projected world `z`:

```ts
const mobileDepth = item.layer === "mobile"
  ? fadeRange(world.z, -1.2, 1.2)
  : 1;
const frontFade = item.layer === "mobile"
  ? 0.58 + mobileDepth * 0.42
  : isSurfaceLabel
    ? fadeRange(world.z, -0.06, 0.08)
    : fadeRange(world.z, -0.12, 0.12);
const scale = item.layer === "mobile"
  ? 0.78 + mobileDepth * 0.18
  : 0.78 + frontFade * 0.18;
```

Continue applying only `translate3d(...) translate(-50%, -50%) scale(...)` to
the DOM element. Do not add CSS or Three.js rotation to label text.

- [ ] **Step 6: Apply compact-only shell opacity and core scale**

Replace the local target and scale calculations with:

```ts
const getLayerTargets = () => (
  getStackLayerTargets(activeStackLayer.value, isCompactMobile())
);

const getGroupScale = (layer: "surface" | "core" | "bridge") => (
  getStackGroupScale(layer, activeStackLayer.value, isCompactMobile())
);
```

Use `getGroupScale(item.layer)` in both `renderStaticState` and `tick`.
This makes the compact Mobile surface fully transparent and sets the core
scale to `0.86`, while preserving every pre-existing scale outside that exact
state.

- [ ] **Step 7: Implement reduced-motion and responsive transitions**

- In `renderStaticState()`, call `updateMobileLabelPoints(0)`, show both compact
  tracks when `isCompactMobile()` is true, and show the desktop track otherwise.
- In `tick`, animate labels only while Mobile is active and reduced motion is
  false.
- On resize, recalculate track visibility, group scale, and label projection
  using the current `window.innerWidth`; no scene recreation is required.
- When leaving Mobile, fade both compact orbit materials to `0` and restore the
  existing selected stack layer.

- [ ] **Step 8: Run the unit test and verify it passes**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 9: Commit the renderer**

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: animate compact mobile satellite tracks"
```

---

### Task 3: Mobile clarity and technical verification

**Files:**
- Modify: `frontend/pages/index.vue`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: compact orbit renderer from Task 2.
- Produces: readable compact labels and a technically verified local build ready for user visual review.

- [ ] **Step 1: Tighten only the compact Mobile labels**

Inside the existing `@media (max-width: 900px)` block in
`frontend/pages/index.vue`, replace the current Mobile modifier with:

```css
.vz-stack__sphere-label--mobile {
  min-width: 78px;
  height: 30px;
  padding-inline: 7px 9px;
  font-size: 0.86em;
  box-shadow: 0 8px 24px rgb(12 18 28 / 10%);
}
```

Do not change desktop label styles or the sphere window dimensions.

- [ ] **Step 2: Run formatting and source checks**

Run from the repository root:

```powershell
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 3: Run the complete unit test**

Run from `frontend`:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 4: Run the production build**

Run from `frontend`:

```powershell
npm run build
```

Expected: Nuxt exits with code `0`. If the already-running Windows dev server
temporarily locks `.nuxt`, confirm whether the build itself completed and then
confirm the local server recovered before treating it as a source failure.

- [ ] **Step 5: Confirm the local page responds**

Run:

```powershell
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/).StatusCode
```

Expected: `200`.

- [ ] **Step 6: Commit the compact styling**

```powershell
git add frontend/pages/index.vue
git commit -m "style: sharpen compact mobile satellites"
```

- [ ] **Step 7: Hand off visual review without pushing**

Report the local URL `http://127.0.0.1:3000/`, summarize the two paths, label
motion, shell opacity, and core scale, and explicitly state that no push was
performed. The user performs the final visual check.
