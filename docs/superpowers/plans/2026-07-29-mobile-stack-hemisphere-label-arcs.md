# Mobile Stack Hemisphere Label Arcs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep four technology labels visible in every compact stack state and move them slowly from left to right along four latitude-like arcs across the front hemisphere.

**Architecture:** Add a pure compact-lane motion model to the existing stack orbit utility and cover it with deterministic tests. The Three.js composable will keep its current desktop projection, but at viewport widths up to `900px` it will position the existing badge elements in four DOM lanes bounded by the visible cropped sphere window; duplicated badge elements provide the right-rim/left-rim handoff.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js, DOM/CSS transforms, Node built-in test runner, esbuild.

## Global Constraints

- Apply the four-lane presentation only at viewport widths up to `900px`.
- Keep four technology labels visibly represented in Frontend, Backend, DevOps, and Mobile.
- Use four distinct shallow horizontal arcs across the front hemisphere.
- Move every lane slowly from left to right.
- Pair every right-rim exit with a left-rim entrance without a visible teleport.
- Do not draw additional bright orbit lines; use the existing wireframe as the path cue.
- Keep badges inside the compact sphere window and prevent horizontal overflow.
- Keep the central part of every badge crisp; soften and shrink badges only near the rims.
- Rotate all five Frontend technologies over time while keeping four visible.
- Keep Backend, DevOps, and Mobile on their existing four technologies.
- Preserve compact Mobile's intersecting orbit paths, transparent outer shell, `0.5` core scale, and nearly stationary root motion.
- Keep desktop label projection and desktop visual behavior unchanged.
- Keep reduced-motion mode static with four visible labels.
- Add no packages, image assets, content fields, or API changes.
- After local verification, integrate the feature into `main` and push it to
  `origin/main` as explicitly authorized by the user.

---

### Task 1: Tested compact hemisphere lane model

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/utils/landingStackOrbit.ts`

**Interfaces:**
- Consumes: elapsed milliseconds, a lane index from `0` through `3`, and the reduced-motion flag.
- Produces: `COMPACT_STACK_LANES`, `getCompactStackLaneState(laneIndex, elapsedMs, reduceMotion)`, and `rotateCompactFrontendLane(state, laneIndex)`.

- [ ] **Step 1: Add failing lane geometry and timing tests**

Import the new interfaces in `frontend/tests/landingStackOrbit.test.ts`:

```ts
import {
  COMPACT_STACK_LANES,
  getCompactStackLaneState,
  rotateCompactFrontendLane,
  // keep the existing imports
} from "../utils/landingStackOrbit";
```

Append these tests:

```ts
test("defines four slow compact hemisphere lanes", () => {
  assert.equal(COMPACT_STACK_LANES.length, 4);
  assert.deepEqual(
    COMPACT_STACK_LANES.map(({ durationMs }) => durationMs),
    [38_000, 42_000, 46_000, 50_000],
  );
  assert.deepEqual(
    COMPACT_STACK_LANES.map(({ baseline }) => baseline),
    [0.14, 0.39, 0.64, 0.88],
  );
});

test("moves compact lane labels from left to right on shallow arcs", () => {
  COMPACT_STACK_LANES.forEach((lane, laneIndex) => {
    const elapsedAtQuarter = ((0.25 - lane.phase + 1) % 1) * lane.durationMs;
    const elapsedAtHalf = ((0.5 - lane.phase + 1) % 1) * lane.durationMs;
    const quarter = getCompactStackLaneState(laneIndex, elapsedAtQuarter, false);
    const half = getCompactStackLaneState(laneIndex, elapsedAtHalf, false);

    assert.ok(half.main.x > quarter.main.x);
    assert.ok(half.main.y < lane.baseline);
    assert.ok(half.main.opacity > quarter.main.opacity);
    assert.ok(half.main.scale > quarter.main.scale);
  });
});

test("hands a lane from the right rim back to the left rim", () => {
  const lane = COMPACT_STACK_LANES[0];
  const elapsed = ((0.94 - lane.phase + 1) % 1) * lane.durationMs;
  const state = getCompactStackLaneState(0, elapsed, false);

  assert.ok(state.main.x > 0.9);
  assert.ok(state.main.opacity < 0.5);
  assert.ok(state.handoff);
  assert.ok(state.handoff.x < 0.08);
  assert.ok(state.handoff.opacity > 0.3);
});

test("keeps compact lane geometry inside its normalized safe region", () => {
  for (let elapsedMs = 0; elapsedMs <= 200_000; elapsedMs += 1_000) {
    COMPACT_STACK_LANES.forEach((_, laneIndex) => {
      const state = getCompactStackLaneState(laneIndex, elapsedMs, false);
      assert.ok(state.main.x >= 0 && state.main.x <= 1);
      assert.ok(state.main.y >= 0.08 && state.main.y <= 0.9);
      assert.ok(state.main.opacity >= 0 && state.main.opacity <= 1);
      assert.ok(state.main.scale >= 0.82 && state.main.scale <= 0.98);
    });
  }
});

test("freezes four readable lane positions for reduced motion", () => {
  const atStart = COMPACT_STACK_LANES.map((_, laneIndex) => (
    getCompactStackLaneState(laneIndex, 0, true)
  ));
  const muchLater = COMPACT_STACK_LANES.map((_, laneIndex) => (
    getCompactStackLaneState(laneIndex, 180_000, true)
  ));

  assert.deepEqual(muchLater, atStart);
  assert.equal(atStart.every(({ handoff }) => handoff === null), true);
  assert.equal(atStart.every(({ main }) => main.opacity >= 0.8), true);
});

test("rotates the queued Frontend technology into one lane without duplicates", () => {
  const initial = { queued: 4, visible: [0, 1, 2, 3] };
  const rotated = rotateCompactFrontendLane(initial, 2);

  assert.deepEqual(rotated, {
    queued: 2,
    visible: [0, 1, 4, 3],
  });
  assert.equal(new Set(rotated.visible).size, 4);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run from `frontend`:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: the bundle fails because the compact lane exports do not exist.

- [ ] **Step 3: Implement the compact lane types and constants**

Add these definitions to `frontend/utils/landingStackOrbit.ts` after the
existing orbit types:

```ts
export type CompactStackLanePlacement = {
  x: number;
  y: number;
  opacity: number;
  scale: number;
};

export type CompactStackLaneState = {
  cycle: number;
  handoff: CompactStackLanePlacement | null;
  main: CompactStackLanePlacement;
  progress: number;
};

export type CompactFrontendRotation = {
  queued: number;
  visible: number[];
};

export const COMPACT_STACK_LANES = [
  { arcLift: 0.06, baseline: 0.14, durationMs: 38_000, phase: 0.34, staticProgress: 0.34 },
  { arcLift: 0.05, baseline: 0.39, durationMs: 42_000, phase: 0.68, staticProgress: 0.68 },
  { arcLift: 0.04, baseline: 0.64, durationMs: 46_000, phase: 0.48, staticProgress: 0.48 },
  { arcLift: 0.03, baseline: 0.88, durationMs: 50_000, phase: 0.2, staticProgress: 0.2 },
] as const;
```

- [ ] **Step 4: Implement deterministic lane projection and Frontend rotation**

Add these functions to `frontend/utils/landingStackOrbit.ts`:

```ts
function compactLanePlacement(
  lane: (typeof COMPACT_STACK_LANES)[number],
  progress: number,
  opacityMultiplier = 1,
): CompactStackLanePlacement {
  const depth = Math.sin(Math.PI * Math.max(0, Math.min(1, progress)));
  return {
    x: Number(progress.toFixed(6)),
    y: Number((lane.baseline - lane.arcLift * depth).toFixed(6)),
    opacity: Number(((0.62 + depth * 0.38) * opacityMultiplier).toFixed(3)),
    scale: Number((0.82 + depth * 0.16).toFixed(3)),
  };
}

export function getCompactStackLaneState(
  laneIndex: number,
  elapsedMs: number,
  reduceMotion = false,
): CompactStackLaneState {
  const lane = COMPACT_STACK_LANES[laneIndex];
  if (!lane) throw new RangeError(`Unknown compact stack lane: ${laneIndex}`);

  const totalProgress = reduceMotion
    ? lane.staticProgress
    : elapsedMs / lane.durationMs + lane.phase;
  const cycle = Math.floor(totalProgress);
  const progress = totalProgress - cycle;
  const handoffStart = 0.86;
  const handoffMix = Math.max(0, Math.min(1, (progress - handoffStart) / (1 - handoffStart)));
  const main = compactLanePlacement(
    lane,
    progress,
    reduceMotion ? 1 : 1 - handoffMix,
  );
  const handoff = !reduceMotion && handoffMix > 0
    ? compactLanePlacement(lane, handoffMix * 0.08, handoffMix)
    : null;

  return { cycle, handoff, main, progress };
}

export function rotateCompactFrontendLane(
  state: CompactFrontendRotation,
  laneIndex: number,
): CompactFrontendRotation {
  if (laneIndex < 0 || laneIndex >= state.visible.length) {
    throw new RangeError(`Unknown compact Frontend lane: ${laneIndex}`);
  }
  const visible = [...state.visible];
  const queued = visible[laneIndex];
  visible[laneIndex] = state.queued;
  return { queued, visible };
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all existing and new orbit tests pass with zero failures.

- [ ] **Step 6: Commit the compact lane model**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: model compact hemisphere label lanes"
```

---

### Task 2: Compact four-lane label renderer

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts:1-14`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts:261-420`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts:533-671`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: `COMPACT_STACK_LANES`, `getCompactStackLaneState(...)`, `rotateCompactFrontendLane(...)`, the existing active visual layer, and existing badge DOM elements.
- Produces: compact-only four-lane badge positioning with desktop projection preserved.

- [ ] **Step 1: Import the tested compact lane model**

Extend the utility import in `useLandingStackSphere.ts`:

```ts
import {
  COMPACT_STACK_LANES,
  getCompactStackLaneState,
  rotateCompactFrontendLane,
  // keep the existing imports
  type CompactFrontendRotation,
} from "~/utils/landingStackOrbit";
```

- [ ] **Step 2: Give every technology a primary and handoff element**

Keep the existing paired Frontend, Backend, and DevOps elements. For Mobile,
create and append a cloned handoff element immediately after the primary:

```ts
const loopElement = element.cloneNode(true) as HTMLSpanElement;
labelLayer.appendChild(loopElement);

return {
  element,
  loopElement,
  point: new THREE.Vector3(orbitPoint.x, orbitPoint.y, orbitPoint.z),
  layer: "mobile" as const,
  orbit: spec.orbit,
  phase: spec.phase,
  desktopPhase: spec.desktopPhase,
  radiusScale: spec.radiusScale,
  projectionGroup: desktopOrbitGroup,
};
```

Do not add the Mobile `loopElement` to `stackLabelPoints`; it belongs only to
the compact DOM-lane renderer so the desktop Mobile projection stays unchanged.

- [ ] **Step 3: Build compact technology pools from the existing elements**

After `stackLabelPoints`, add:

```ts
type CompactLabelPair = {
  element: HTMLSpanElement;
  loopElement: HTMLSpanElement;
};

const pairLabelPoints = (
  points: Array<{ element: HTMLSpanElement }>,
): CompactLabelPair[] => (
  Array.from({ length: points.length / 2 }, (_, index) => ({
    element: points[index * 2].element,
    loopElement: points[index * 2 + 1].element,
  }))
);

const compactLabelPools: Record<StackVisualLayer, CompactLabelPair[]> = {
  surface: pairLabelPoints(frontendLabelPoints),
  core: pairLabelPoints(coreLabelPoints),
  bridge: pairLabelPoints(bridgeLabelPoints),
  mobile: mobileLabelPoints.map(({ element, loopElement }) => ({
    element,
    loopElement,
  })),
};
```

- [ ] **Step 4: Add compact-mode state and safe-window positioning**

Near the animation state at line 533, add:

```ts
let compactFrontendRotation: CompactFrontendRotation = {
  queued: 4,
  visible: [0, 1, 2, 3],
};
let compactLaneCycles = COMPACT_STACK_LANES.map((_, laneIndex) => (
  getCompactStackLaneState(laneIndex, 0, reduceMotion).cycle
));
let previousCompactLayer: StackVisualLayer | null = null;

const isCompactStack = () => window.innerWidth <= 900;
```

When the active compact layer changes, reset the cycle baseline without
advancing the Frontend queue:

```ts
const syncCompactLayer = (elapsedMs: number) => {
  if (previousCompactLayer === activeStackLayer.value) return;
  previousCompactLayer = activeStackLayer.value;
  compactLaneCycles = COMPACT_STACK_LANES.map((_, laneIndex) => (
    getCompactStackLaneState(laneIndex, elapsedMs, reduceMotion).cycle
  ));
};
```

- [ ] **Step 5: Add compact label placement helpers**

Before the existing `updateStackLabels`, add:

```ts
const hideLabel = (element: HTMLSpanElement) => {
  element.style.opacity = "0";
  element.style.pointerEvents = "none";
};

const placeCompactLabel = (
  element: HTMLSpanElement,
  placement: { x: number; y: number; opacity: number; scale: number },
  width: number,
  visibleHeight: number,
  zIndex: number,
) => {
  const horizontalInset = Math.min(64, width * 0.2);
  const verticalInset = 18;
  const x = horizontalInset + placement.x * (width - horizontalInset * 2);
  const y = verticalInset + placement.y * Math.max(1, visibleHeight - verticalInset * 2);
  element.style.opacity = placement.opacity.toFixed(3);
  element.style.zIndex = String(zIndex);
  element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${placement.scale.toFixed(3)})`;
};

const updateCompactStackLabels = (
  elapsedMs: number,
  width: number,
  height: number,
) => {
  syncCompactLayer(elapsedMs);
  Object.values(compactLabelPools).flat().forEach(({ element, loopElement }) => {
    hideLabel(element);
    hideLabel(loopElement);
  });

  const sphereWindow = host.closest<HTMLElement>(".vz-stack__sphere-window");
  const visibleHeight = Math.min(height, sphereWindow?.clientHeight || height);
  const pool = compactLabelPools[activeStackLayer.value];
  const laneStates = COMPACT_STACK_LANES.map((_, laneIndex) => (
    getCompactStackLaneState(laneIndex, elapsedMs, reduceMotion)
  ));

  if (activeStackLayer.value === "surface" && !reduceMotion) {
    laneStates.forEach((state, laneIndex) => {
      if (state.cycle === compactLaneCycles[laneIndex]) return;
      compactFrontendRotation = rotateCompactFrontendLane(compactFrontendRotation, laneIndex);
      compactLaneCycles[laneIndex] = state.cycle;
    });
  }

  laneStates.forEach((state, laneIndex) => {
    const technologyIndex = activeStackLayer.value === "surface"
      ? compactFrontendRotation.visible[laneIndex]
      : laneIndex;
    const pair = pool[technologyIndex];
    placeCompactLabel(pair.element, state.main, width, visibleHeight, 120 + laneIndex);
    if (state.handoff) {
      placeCompactLabel(pair.loopElement, state.handoff, width, visibleHeight, 116 + laneIndex);
    }
  });
};
```

- [ ] **Step 6: Route compact updates through the lane renderer**

Change the existing function signature and add an early compact branch:

```ts
const updateStackLabels = (elapsedMs = 0) => {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);

  if (isCompactStack()) {
    updateCompactStackLabels(elapsedMs, width, height);
    return;
  }

  Object.values(compactLabelPools.mobile).forEach(({ loopElement }) => {
    hideLabel(loopElement);
  });

  const compactMobile = isCompactMobile();
  // retain the complete existing desktop projection below
};
```

Pass the current animation time from `tick`:

```ts
renderer.render(scene, camera);
updateStackLabels(now);
```

Keep static and resize calls at the default `0`; reduced-motion lane states do
not depend on elapsed time.

- [ ] **Step 7: Run the focused unit test**

Run from `frontend`:

```powershell
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 8: Run the production build**

Run:

```powershell
npm run build
```

Expected: Nuxt exits with code `0` and reports no TypeScript or Vue compilation
errors.

- [ ] **Step 9: Commit the compact renderer**

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts
git commit -m "feat: render four compact hemisphere labels"
```

---

### Task 3: Fresh verification and publication

**Files:**
- Verify: `frontend/utils/landingStackOrbit.ts`
- Verify: `frontend/composables/landing/useLandingStackSphere.ts`
- Verify: `frontend/tests/landingStackOrbit.test.ts`
- Verify: `docs/superpowers/specs/2026-07-29-mobile-stack-hemisphere-label-arcs-design.md`

**Interfaces:**
- Consumes: the completed compact lane model and renderer from Tasks 1 and 2.
- Produces: a clean local build, a running local site, and the verified feature
  published to `origin/main`.

- [ ] **Step 1: Confirm only intended tracked files changed**

Run from the repository root:

```powershell
git status --short
git diff --check
git log -3 --oneline
```

Expected: no whitespace errors; only the known untracked `.superpowers/` and
`frontend/.codex-logs/` directories remain outside the feature commits.

- [ ] **Step 2: Run fresh focused tests**

Run:

```powershell
Set-Location frontend
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 3: Run a fresh production build**

Run:

```powershell
npm run build
```

Expected: Nuxt exits with code `0`.

- [ ] **Step 4: Ensure the local review server is available**

Check port `3000`. If the existing Nuxt process is healthy, keep it. Otherwise
start the existing project in the background from `frontend`:

```powershell
Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev","--","--host","127.0.0.1","--port","3000" -WorkingDirectory (Get-Location) -WindowStyle Hidden
```

Verify:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/ | Select-Object -ExpandProperty StatusCode
```

Expected: `200`.

- [ ] **Step 5: Synchronize the feature branch with remote main**

Run from the feature worktree:

```powershell
git fetch origin main
git rev-list --left-right --count origin/main...HEAD
```

Expected: the left count is `0`. If the remote moved, rebase the feature branch
onto `origin/main`, then rerun the focused tests and production build.

- [ ] **Step 6: Fast-forward main and run final verification**

Run from the primary repository checkout:

```powershell
git merge --ff-only codex/mobile-stack-hemisphere-label-arcs
Set-Location frontend
npx esbuild tests/landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs/landingStackOrbit.test.mjs
node --test .codex-logs/landingStackOrbit.test.mjs
npm run build
Set-Location ..
```

Expected: the fast-forward succeeds, all focused tests pass, and Nuxt exits
with code `0`.

- [ ] **Step 7: Push and verify origin/main**

Run:

```powershell
git push origin main
git fetch origin main
git rev-parse HEAD
git rev-parse origin/main
```

Expected: local and remote hashes are identical. Report the published commit,
test count, build result, and local review URL.
