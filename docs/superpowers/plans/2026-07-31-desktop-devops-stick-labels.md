# Desktop DevOps Stick-Attached Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix each desktop DevOps technology label at 75% of its matching 3D bridge stick and keep both rotating synchronously.

**Architecture:** Add a pure point-interpolation helper to the existing stack orbit utility, then store a desktop-only attachment point beside each bridge label’s existing mobile point. The desktop DevOps renderer will project that attachment through the same `bridgeGroup` as the stick and will skip screen-space collision displacement so the card cannot detach from its 3D anchor.

**Tech Stack:** Vue 3, Nuxt 3, TypeScript, Three.js, Node test runner, esbuild

## Global Constraints

- Apply the change only when the viewport is wider than 900px and DevOps is active.
- Keep Frontend, Backend, Mobile, and all mobile DevOps behavior unchanged.
- Preserve the existing bridge geometry, rotation speed, colors, label contents, and stack-section transitions.
- Use `attachment = anchor + (outerPoint - anchor) * 0.75` for both primary and mirrored sticks.
- Keep label cards screen-facing while their 3D positions rotate with `bridgeGroup`.
- Preserve primary/mirrored depth selection and side/depth fades.
- Do not apply post-projection collision displacement to desktop DevOps labels.
- Keep the development server on port 3001.

---

### Task 1: Pure bridge attachment geometry

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: two `StackPoint3` values representing the inner anchor and outer stick endpoint.
- Produces: `getStackBridgeAttachmentPoint(anchor: StackPoint3, outerPoint: StackPoint3, ratio?: number): StackPoint3`, defaulting to a ratio of `0.75`.

- [ ] **Step 1: Write the failing interpolation tests**

Add the helper import and these tests to `frontend/tests/landingStackOrbit.test.ts`:

```ts
import {
  getStackBridgeAttachmentPoint,
} from "../utils/landingStackOrbit";

test("places a desktop DevOps label at 75% of its bridge stick", () => {
  assert.deepEqual(
    getStackBridgeAttachmentPoint(
      { x: 0.82, y: 0.36, z: 0.78 },
      { x: 1.28, y: 0.5, z: 1.2 },
    ),
    { x: 1.165, y: 0.465, z: 1.095 },
  );
});

test("uses the same 75% attachment on a mirrored bridge stick", () => {
  assert.deepEqual(
    getStackBridgeAttachmentPoint(
      { x: -0.82, y: 0.36, z: -0.78 },
      { x: -1.28, y: 0.5, z: -1.2 },
    ),
    { x: -1.165, y: 0.465, z: -1.095 },
  );
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: bundling or test execution fails because `getStackBridgeAttachmentPoint` is not exported.

- [ ] **Step 3: Implement the minimal pure helper**

Add near the point-related utilities in `frontend/utils/landingStackOrbit.ts`:

```ts
export type StackPoint3 = {
  x: number;
  y: number;
  z: number;
};

export function getStackBridgeAttachmentPoint(
  anchor: StackPoint3,
  outerPoint: StackPoint3,
  ratio = 0.75,
): StackPoint3 {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const interpolate = (start: number, end: number) =>
    Number((start + (end - start) * safeRatio).toFixed(6));

  return {
    x: interpolate(anchor.x, outerPoint.x),
    y: interpolate(anchor.y, outerPoint.y),
    z: interpolate(anchor.z, outerPoint.z),
  };
}
```

- [ ] **Step 4: Run the focused tests to verify GREEN**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: all stack orbit tests pass, including both new interpolation tests.

- [ ] **Step 5: Commit the geometry helper**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "test: define devops bridge attachment geometry"
```

### Task 2: Desktop DevOps 3D attachment rendering

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Consumes: `getStackBridgeAttachmentPoint(...)` from Task 1 and each bridge item’s existing `anchor`, `point`, mirrored anchor, and mirrored point.
- Produces: optional `desktopAttachedPoint: THREE.Vector3` on every bridge label item; desktop DevOps projection selects it while mobile projection continues using `point`.

- [ ] **Step 1: Import the geometry helper**

Add the helper to the existing import from `~/utils/landingStackOrbit`:

```ts
import {
  getStackBridgeAttachmentPoint,
} from "~/utils/landingStackOrbit";
```

- [ ] **Step 2: Compute primary and mirrored attachment points**

Replace the bridge point setup with explicit mirrored geometry and attachment interpolation:

```ts
const point = new THREE.Vector3(directionX * 1.28, spec.y, directionZ * 1.2);
const anchor = new THREE.Vector3(directionX * 0.82, spec.y * 0.72, directionZ * 0.78);
const mirroredPoint = new THREE.Vector3(-point.x, point.y, -point.z);
const mirroredAnchor = new THREE.Vector3(-anchor.x, anchor.y, -anchor.z);
const attachedPoint = getStackBridgeAttachmentPoint(anchor, point);
const mirroredAttachedPoint = getStackBridgeAttachmentPoint(mirroredAnchor, mirroredPoint);

bridgeStickPositions.push(anchor.x, anchor.y, anchor.z, point.x, point.y, point.z);
bridgeStickPositions.push(
  mirroredAnchor.x,
  mirroredAnchor.y,
  mirroredAnchor.z,
  mirroredPoint.x,
  mirroredPoint.y,
  mirroredPoint.z,
);
```

Store the desktop points on their matching label items:

```ts
desktopAttachedPoint: new THREE.Vector3(
  attachedPoint.x,
  attachedPoint.y,
  attachedPoint.z,
),
```

and:

```ts
desktopAttachedPoint: new THREE.Vector3(
  mirroredAttachedPoint.x,
  mirroredAttachedPoint.y,
  mirroredAttachedPoint.z,
),
```

Keep the primary item’s `point` unchanged and set the mirrored item’s `point` to `mirroredPoint`.

- [ ] **Step 3: Route only desktop DevOps through direct 3D projection**

Change the desktop latitude early return so all existing desktop layers except DevOps remain unchanged:

```ts
const desktopBridge = window.innerWidth > 900
  && activeStackLayer.value === "bridge";

if (window.innerWidth > 900 && !desktopBridge) {
  renderLatitudeLabels(
    activeStackLayer.value === "core"
      ? BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE
      : 1,
    0.96,
    activeStackLayer.value === "core",
  );
  return;
}
```

This preserves the current desktop Mobile latitude behavior while allowing only desktop DevOps to reach the projection renderer.

- [ ] **Step 4: Project each desktop DevOps label from its attachment point**

At the start of the projected label map, select the desktop-only point without changing the mobile point:

```ts
const getProjectionPoint = (label: typeof item) => (
  desktopBridge
  && "desktopAttachedPoint" in label
  && label.desktopAttachedPoint
    ? label.desktopAttachedPoint
    : label.point
);

const world = getProjectionPoint(item).clone();
item.projectionGroup.localToWorld(world);
```

Use the same selector for `counterpartWorld` before comparing primary and mirrored depth:

```ts
const counterpartWorld = counterpart
  ? getProjectionPoint(counterpart).clone()
  : null;
```

- [ ] **Step 5: Disable screen-space displacement only for desktop DevOps**

Wrap the existing label-gap, overlap, overflow, and underflow adjustment in:

```ts
if (!desktopBridge) {
  // Existing collision and edge displacement logic remains unchanged here.
}
```

Keep `layoutY` initialized to `y`, so desktop DevOps renders exactly at the projected 3D attachment.

- [ ] **Step 6: Run unit tests and production build**

Run from `frontend`:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
.\node_modules\.bin\nuxt.cmd build
```

Expected: all tests pass and Nuxt reports a successful production build.

- [ ] **Step 7: Restart the isolated development server**

Start the worktree frontend on port 3001:

```powershell
Start-Process -FilePath '.\node_modules\.bin\nuxt.cmd' -ArgumentList 'dev','--port','3001' -WorkingDirectory 'C:\Users\artas\OneDrive\Рабочий стол\vezha.digital redisgn\vezha.digital\.worktrees\desktop-stack-label-routes\frontend' -WindowStyle Hidden
```

Expected: `http://localhost:3001/#stack` responds successfully.

- [ ] **Step 8: Perform desktop and mobile browser QA**

At 1440x900:

- Activate DevOps.
- Capture several animation frames and confirm every visible label stays centered at the 75% point of its rotating stick.
- Confirm no visible label rectangles overlap and cards remain horizontal.
- Activate Frontend and Backend and confirm their latitude motion is unchanged.
- Check browser warnings/errors.

At 390x844:

- Activate DevOps and confirm its existing mobile placement is unchanged.

- [ ] **Step 9: Remove the generated test bundle and commit**

Delete only `.codex-test/landingStackOrbit.test.mjs`, then run:

```powershell
git add frontend/composables/landing/useLandingStackSphere.ts
git commit -m "feat: attach desktop devops labels to sticks"
```

