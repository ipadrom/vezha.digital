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
- Produces: `MobileOrbitId`, `MobileOrbitMode`, `MOBILE_ORBIT_TRACKS`, revised `MOBILE_ORBIT_TECH`, `getMobileOrbitPoint(angle, orbitId)`, `getMobileOrbitAngle(elapsedMs, orbitId, phase)`, `getMobileTechnologyPoint(spec, elapsedMs, mode)`, `getMobileLabelDepthStyle(worldZ)`, `resolveMobileOrbitMode(layer, viewportWidth)`, `getStackLayerTargets(layer, compactMobile)`, and `getStackGroupScale(layer, visualLayer, compactMobile)`.

- [ ] **Step 1: Replace the old single-orbit assertions with failing two-orbit tests**

Add these imports and assertions in `frontend/tests/landingStackOrbit.test.ts`:

```ts
import {
  MOBILE_ORBIT_TECH,
  MOBILE_ORBIT_TRACKS,
  getMobileLabelDepthStyle,
  getMobileOrbitAngle,
  getMobileOrbitPoint,
  getMobileTechnologyPoint,
  getStackGroupScale,
  getStackLayerTargets,
  resolveMobileOrbitMode,
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

test("resolves compact orbit mode only for Mobile at the 900px boundary", () => {
  assert.equal(resolveMobileOrbitMode("mobile", 900), "compact");
  assert.equal(resolveMobileOrbitMode("mobile", 901), "desktop");
  assert.equal(resolveMobileOrbitMode("surface", 390), "hidden");
});

test("moves only compact Mobile technologies along their assigned tracks", () => {
  const outerAtZero = { orbit: "outer" as const, phase: 0 };
  assert.deepEqual(
    getMobileTechnologyPoint(outerAtZero, 3_500, "compact"),
    { x: 0, y: 1.08, z: 0 },
  );
  assert.deepEqual(
    getMobileTechnologyPoint(outerAtZero, 3_500, "desktop"),
    { x: 2.02, y: 0, z: 0 },
  );
});

test("dims and shrinks labels behind the core without hiding them", () => {
  assert.deepEqual(getMobileLabelDepthStyle(-1.2), {
    opacity: 0.58,
    scale: 0.78,
  });
  assert.deepEqual(getMobileLabelDepthStyle(1.2), {
    opacity: 1,
    scale: 0.96,
  });
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
export type MobileOrbitMode = "hidden" | "desktop" | "compact";

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

export function resolveMobileOrbitMode(
  layer: StackVisualLayer,
  viewportWidth: number,
): MobileOrbitMode {
  if (layer !== "mobile") return "hidden";
  return viewportWidth <= 900 ? "compact" : "desktop";
}

export function getMobileTechnologyPoint(
  spec: { orbit: MobileOrbitId; phase: number },
  elapsedMs: number,
  mode: Exclude<MobileOrbitMode, "hidden">,
) {
  const angle = mode === "compact"
    ? getMobileOrbitAngle(elapsedMs, spec.orbit, spec.phase)
    : spec.phase;
  return getMobileOrbitPoint(angle, mode === "compact" ? spec.orbit : "outer");
}

export function getMobileLabelDepthStyle(worldZ: number) {
  const depth = Math.max(0, Math.min(1, (worldZ + 1.2) / 2.4));
  return {
    opacity: Number((0.58 + depth * 0.42).toFixed(3)),
    scale: Number((0.78 + depth * 0.18).toFixed(3)),
  };
}
```

Delete the previous `readFile` source-text test from
`frontend/tests/landingStackOrbit.test.ts`; the new tests cover observable
orbit behavior directly.

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
- Consumes: the tested Task 1 mode, frame-position, depth-style, layer-target, and group-scale functions.
- Produces: one unchanged desktop orbit group, two compact orbit groups, four independently animated Mobile label anchors, and compact-only sphere targets.

- [ ] **Step 1: Create separate desktop and compact orbit groups**

In `frontend/composables/landing/useLandingStackSphere.ts`:

- Import `MOBILE_ORBIT_TRACKS`, `getMobileLabelDepthStyle`,
  `getMobileTechnologyPoint`, `getStackGroupScale`,
  `resolveMobileOrbitMode`, and `type MobileOrbitId`.
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
const getMobileOrbitMode = () => (
  resolveMobileOrbitMode(activeStackLayer.value, window.innerWidth)
);
const isCompactMobile = () => getMobileOrbitMode() === "compact";
```

The desktop path remains selected when Mobile is active and
`window.innerWidth > 900`.

- [ ] **Step 2: Make Mobile labels switch projection groups and move independently**

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
    const point = getMobileTechnologyPoint(
      item,
      elapsedMs,
      compact ? "compact" : "desktop",
    );
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

- [ ] **Step 3: Add front/back depth without rotating the DOM labels**

In `updateStackLabels`, derive Mobile depth from the projected world `z`:

```ts
const mobileDepthStyle = item.layer === "mobile"
  ? getMobileLabelDepthStyle(world.z)
  : null;
const frontFade = item.layer === "mobile"
  ? mobileDepthStyle!.opacity
  : isSurfaceLabel
    ? fadeRange(world.z, -0.06, 0.08)
    : fadeRange(world.z, -0.12, 0.12);
const scale = item.layer === "mobile"
  ? mobileDepthStyle!.scale
  : 0.78 + frontFade * 0.18;
```

Continue applying only `translate3d(...) translate(-50%, -50%) scale(...)` to
the DOM element. Do not add CSS or Three.js rotation to label text.

- [ ] **Step 4: Apply compact-only shell opacity and core scale**

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

- [ ] **Step 5: Implement reduced-motion and responsive transitions**

- In `renderStaticState()`, call `updateMobileLabelPoints(0)`, show both compact
  tracks when `isCompactMobile()` is true, and show the desktop track otherwise.
- In `tick`, animate labels only while Mobile is active and reduced motion is
  false.
- On resize, recalculate track visibility, group scale, and label projection
  using the current `window.innerWidth`; no scene recreation is required.
- When leaving Mobile, fade both compact orbit materials to `0` and restore the
  existing selected stack layer.

- [ ] **Step 6: Run the unit test and verify it still passes**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 7: Commit the renderer**

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
