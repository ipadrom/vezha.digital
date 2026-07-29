# Mobile Stack Orbit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Mobile “all layers” state with a distinct tilted orbit that presents Mobile as the complete system delivered to a user’s device.

**Architecture:** Add a small pure TypeScript model for stack-state mapping, layer emphasis, and mobile-orbit technology placement. The existing Three.js composable consumes that model to build one orbit group, four DOM labels, and one animated pulse while retaining the current sphere, lifecycle, and label-projection pipeline.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js, Node built-in test runner, esbuild, in-app Browser QA.

## Global Constraints

- Do not add packages, image assets, content fields, or API changes.
- Keep Russian and English Mobile copy and technology lists unchanged.
- Keep Frontend, Backend, DevOps, counter, timeline, scroll, manual selection, and mobile autoplay behavior unchanged.
- Mobile uses a monochrome tilted orbit; brand color remains limited to technology icon accents.
- `React Native`, `Expo`, and `Flutter` belong to the orbit; `PWA` belongs to the orbit/surface intersection.
- The orbit must not create clipping, overlap, or horizontal overflow at widths up to and above `900px`.
- Under `prefers-reduced-motion: reduce`, Mobile remains legible but the orbit and pulse do not animate.

---

### Task 1: Stack visual-state model

**Files:**
- Create: `frontend/utils/landingStackOrbit.ts`
- Create: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/components/landing/LandingStack.vue`

**Interfaces:**
- Produces: `StackVisualLayer`, `StackLayerTargets`, `MOBILE_ORBIT_TECH`, `resolveStackVisualLayer(title)`, `getStackLayerTargets(layer)`, and `getMobileOrbitPoint(angle, radiusScale)`.
- Consumes: stack group titles already provided to `LandingStack.vue`.

- [ ] **Step 1: Write the failing model tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  MOBILE_ORBIT_TECH,
  getMobileOrbitPoint,
  getStackLayerTargets,
  resolveStackVisualLayer,
} from "../utils/landingStackOrbit";

test("maps stack titles to visual states", () => {
  assert.equal(resolveStackVisualLayer("Frontend"), "surface");
  assert.equal(resolveStackVisualLayer("Backend"), "core");
  assert.equal(resolveStackVisualLayer("DevOps"), "bridge");
  assert.equal(resolveStackVisualLayer("Mobile"), "mobile");
});

test("keeps every system layer visible but secondary for Mobile", () => {
  assert.deepEqual(getStackLayerTargets("mobile"), {
    bridge: 0.52,
    core: 0.48,
    surface: 0.58,
  });
});

test("places native technologies on the orbit and PWA at the intersection", () => {
  assert.deepEqual(
    MOBILE_ORBIT_TECH.map(({ label, placement }) => [label, placement]),
    [
      ["React Native", "orbit"],
      ["Expo", "orbit"],
      ["PWA", "intersection"],
      ["Flutter", "orbit"],
    ],
  );
  assert.ok(MOBILE_ORBIT_TECH.find((item) => item.label === "PWA")!.radiusScale < 1);
});

test("returns deterministic points on the orbit ellipse", () => {
  assert.deepEqual(getMobileOrbitPoint(0, 1), { x: 2.02, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, 1), { x: 0, y: 1.08, z: 0 });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: the bundle step fails because `utils/landingStackOrbit.ts` does not exist.

- [ ] **Step 3: Implement the pure model**

Create `frontend/utils/landingStackOrbit.ts` with these exact exports:

```ts
export type StackBaseLayer = "surface" | "core" | "bridge";
export type StackVisualLayer = StackBaseLayer | "mobile";
export type StackLayerTargets = Record<StackBaseLayer, number>;

export const MOBILE_ORBIT_TECH = [
  { angle: 2.5, color: "#61DAFB", label: "React Native", placement: "orbit", radiusScale: 1, slug: "react" },
  { angle: 0.9, color: "#111318", label: "Expo", placement: "orbit", radiusScale: 1, slug: "expo" },
  { angle: -0.2, color: "#5A0FC8", label: "PWA", placement: "intersection", radiusScale: 0.82, slug: "pwa" },
  { angle: -1.72, color: "#54C5F8", label: "Flutter", placement: "orbit", radiusScale: 1, slug: "flutter" },
] as const;

export function resolveStackVisualLayer(title = ""): StackVisualLayer {
  const normalized = title.toLowerCase();
  if (normalized.includes("backend")) return "core";
  if (normalized.includes("devops")) return "bridge";
  if (normalized.includes("mobile")) return "mobile";
  return "surface";
}

export function getStackLayerTargets(layer: StackVisualLayer): StackLayerTargets {
  if (layer === "core") return { bridge: 0.16, core: 1, surface: 0.12 };
  if (layer === "bridge") return { bridge: 1, core: 0.26, surface: 0.26 };
  if (layer === "mobile") return { bridge: 0.52, core: 0.48, surface: 0.58 };
  return { bridge: 0.16, core: 0.1, surface: 1 };
}

export function getMobileOrbitPoint(angle: number, radiusScale = 1) {
  const normalizedX = Math.abs(Math.cos(angle)) < 1e-12 ? 0 : Math.cos(angle);
  const normalizedY = Math.abs(Math.sin(angle)) < 1e-12 ? 0 : Math.sin(angle);
  return {
    x: Number((normalizedX * 2.02 * radiusScale).toFixed(6)),
    y: Number((normalizedY * 1.08 * radiusScale).toFixed(6)),
    z: 0,
  };
}
```

- [ ] **Step 4: Use the model in the component**

Import and replace the inline mapping in `frontend/components/landing/LandingStack.vue`:

```ts
import { resolveStackVisualLayer } from "~/utils/landingStackOrbit";

const activeLayer = computed(() => (
  resolveStackVisualLayer(props.groups[activeIndex.value]?.title)
));
```

- [ ] **Step 5: Run the model tests**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: four tests pass, zero fail.

- [ ] **Step 6: Commit the model**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts frontend/components/landing/LandingStack.vue
git commit -m "feat: define mobile stack orbit state"
```

---

### Task 2: Three.js orbit, labels, and pulse

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`
- Modify: `frontend/pages/index.vue`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: `MOBILE_ORBIT_TECH`, `getMobileOrbitPoint`, `getStackLayerTargets`, and `StackVisualLayer` from Task 1.
- Produces: a Three.js `orbitGroup` with `orbitLine`, `orbitPulse`, and mobile label projection entries tagged with layer `mobile`.

- [ ] **Step 1: Add a failing source-contract test for the rendered orbit**

Append to `frontend/tests/landingStackOrbit.test.ts`:

```ts
import { readFile } from "node:fs/promises";

test("the sphere renderer consumes the dedicated Mobile state", async () => {
  const source = await readFile(
    new URL("../composables/landing/useLandingStackSphere.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /MOBILE_ORBIT_TECH/);
  assert.match(source, /orbitGroup/);
  assert.match(source, /orbitPulse/);
  assert.match(source, /item\.layer === "mobile"/);
});
```

- [ ] **Step 2: Run the tests and verify the new test fails**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: the new contract test fails because the renderer has no orbit implementation.

- [ ] **Step 3: Create the orbit group and geometry**

In `useLandingStackSphere.ts`:

- Import the Task 1 model and type `activeLayer` as `ComputedRef<StackVisualLayer> | Ref<StackVisualLayer>`.
- Add `orbitGroup` to `rootGroup`.
- Give it a fixed tilt of approximately `rotation.set(1.02, 0.28, -0.22)`.
- Build a closed line from 97 points returned by `getMobileOrbitPoint((index / 96) * Math.PI * 2)`.
- Use a transparent `LineBasicMaterial` with a monochrome color and initial opacity `0`.
- Create `orbitPulse` as one `THREE.Points` vertex with a small `PointsMaterial`, also starting at opacity `0`.
- Add the orbit geometries and materials to the existing cleanup collections.

The pulse position must be updated from:

```ts
const pulseAngle = reduceMotion ? -0.2 : (now * 0.00034) % (Math.PI * 2);
const pulsePoint = getMobileOrbitPoint(pulseAngle);
orbitPulse.position.set(pulsePoint.x, pulsePoint.y, pulsePoint.z);
```

- [ ] **Step 4: Create and project the four Mobile labels**

For every `MOBILE_ORBIT_TECH` entry:

- Create the same icon/text DOM structure used by the core and bridge labels.
- Apply `vz-stack__sphere-label vz-stack__sphere-label--mobile`.
- Place the local Three.js point from `getMobileOrbitPoint(spec.angle, spec.radiusScale)`.
- Add the projection entry to `stackLabelPoints` with `layer: "mobile"` and `projectionGroup: orbitGroup`.
- Do not create mirrored duplicates for the orbit labels; all four named points remain unique.

Update label visibility so:

```ts
const layerVisibility = item.layer === "mobile"
  ? Number(activeStackLayer.value === "mobile")
  : Number(activeStackLayer.value === item.layer);
```

- [ ] **Step 5: Integrate Mobile emphasis and animation**

- Replace the local `getLayerTargets` body with `getStackLayerTargets(activeStackLayer.value)`.
- Fade the orbit line and pulse toward their base opacity only when `activeStackLayer.value === "mobile"`.
- Continue showing all three tracked sphere layers using the Mobile targets from Task 1.
- Rotate the orbit group by no more than `0.0012 * frame` per frame only while Mobile is active.
- In `renderStaticState`, show the orbit at its fixed tilt, place the pulse at angle `-0.2`, and render once.
- When reduced motion is enabled, never advance orbit rotation or pulse angle.

- [ ] **Step 6: Add the responsive label style**

Add a narrow modifier beside the existing stack-label styles in `frontend/pages/index.vue`:

```css
.vz-stack__sphere-label--mobile {
  white-space: nowrap;
}

@media (max-width: 900px) {
  .vz-stack__sphere-label--mobile {
    font-size: 0.92em;
  }
}
```

- [ ] **Step 7: Run unit and build verification**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
npm run build
```

Expected: five tests pass, zero fail; Nuxt build exits with code `0`.

- [ ] **Step 8: Commit the renderer**

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts frontend/pages/index.vue frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: render mobile stack orbit"
```

---

### Task 3: Rendered interaction and responsive QA

**Files:**
- Modify only if QA finds a defect: `frontend/composables/landing/useLandingStackSphere.ts`, `frontend/pages/index.vue`, or `frontend/utils/landingStackOrbit.ts`
- Test: rendered app at `http://127.0.0.1:3000/#stack`

**Interfaces:**
- Consumes: completed Mobile orbit state from Tasks 1 and 2.
- Produces: verified desktop, mobile, theme, transition, console, and reduced-motion behavior.

- [ ] **Step 1: Verify the desktop flow**

The flow under test is:

`/#stack → select Mobile → complete sphere softens, orbit and four Mobile labels appear, pulse moves → select Frontend → orbit presentation disappears`.

Use the in-app Browser and verify:

- Page URL and title identify the local VEZHA site.
- The DOM snapshot contains the stack timeline and Mobile item.
- No framework overlay is visible.
- Browser error/warn logs contain no relevant application errors.
- A screenshot shows the orbit, four labels, and readable stack copy without clipping.

- [ ] **Step 2: Verify the mobile viewport**

Set a viewport at or below `900px`, reload, navigate to the stack section, and verify:

- Mobile can be selected manually.
- Orbit and labels remain inside the sphere window.
- The active description does not overlap the visualization.
- The page has no horizontal overflow.

- [ ] **Step 3: Verify themes and reduced motion**

- Switch light/dark theme and confirm sufficient orbit contrast in both.
- Enable reduced motion through the browser capability or test environment, reload, select Mobile, and confirm the orbit is visible while the pulse remains static.
- Reset temporary viewport and motion overrides before finishing.

- [ ] **Step 4: Fix only observed defects and repeat the same failing check**

If a defect is found, make the smallest scoped adjustment, rerun:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
npm run build
```

Then reload the existing browser tab and repeat the exact interaction that failed.

- [ ] **Step 5: Commit QA refinements if any**

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts frontend/pages/index.vue frontend/utils/landingStackOrbit.ts
git commit -m "fix: polish mobile stack orbit"
```

Skip this commit when QA required no source changes.

