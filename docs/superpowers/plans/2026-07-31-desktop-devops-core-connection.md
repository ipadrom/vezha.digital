# Desktop DevOps Core Connection and Material Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend every desktop DevOps label stick into the core shell, match only the DevOps core wire/point materials to the Frontend shell, and strengthen the sticks without changing the core fill.

**Architecture:** The pure DevOps bridge-route helper will normalize each inner anchor onto a shared radius just inside the active core shell. A second pure helper will resolve DevOps-only material base-opacity overrides by semantic role; the renderer will use it for static and animated opacity targets while preserving all defaults outside DevOps.

**Tech Stack:** Vue 3, Nuxt 3, TypeScript, Three.js, Node test runner, esbuild

## Global Constraints

- Keep the four approved route levels and bridge angles unchanged.
- Keep every label at 75% of its newly extended stick.
- Use local bridge-group inner radius `0.690654`.
- Keep core fill base opacity `0.18` in every visual layer.
- In DevOps only, use `0.22` for core shell/internal lines and `0.80` for core points.
- In DevOps only, use `0.70` for label sticks and keep the general bridge network at `0.34`.
- Keep Frontend, Backend, Mobile, and mobile DevOps behavior unchanged.
- Keep the development server on port 3001.

---

### Task 1: Radial stick-to-core connection

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: existing `getDesktopDevOpsBridgeRoute(label, angle)` calls.
- Produces: the same `{ anchor, outerPoint }` shape, with every `anchor` normalized to radius `0.690654`.

- [ ] **Step 1: Update the route test to require core contact**

Extend `separates desktop DevOps labels into four ordered bridge routes` with hand-checked radius and attachment expectations:

```ts
assert.deepEqual(routes.map(({ anchor }) => Number(Math.hypot(
  anchor.x,
  anchor.y,
  anchor.z,
).toFixed(6))), [0.690654, 0.690654, 0.690654, 0.690654]);

assert.deepEqual(routes.map(({ anchor, outerPoint }) => (
  getStackBridgeAttachmentPoint(anchor, outerPoint).y
)), [0.62465, 0.21182, -0.194248, -0.591006]);
```

Replace the previous attachment-y expectations `[0.6696, 0.2232, -0.2046, -0.6324]`.

- [ ] **Step 2: Run the focused suite to verify RED**

Run from `frontend`:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: the route test fails because the old anchors have different radii and attachment heights.

- [ ] **Step 3: Normalize the inner anchor onto the core connection radius**

Replace the old anchor calculation in `getDesktopDevOpsBridgeRoute`:

```ts
const outerPoint = {
  x: directionX * 1.28,
  y,
  z: directionZ * 1.2,
};
const outerRadius = Math.hypot(outerPoint.x, outerPoint.y, outerPoint.z);
const anchorScale = 0.690654 / outerRadius;

return {
  anchor: {
    x: outerPoint.x * anchorScale,
    y: outerPoint.y * anchorScale,
    z: outerPoint.z * anchorScale,
  },
  outerPoint,
};
```

- [ ] **Step 4: Run the focused suite to verify GREEN**

Run the same esbuild and `node --test` commands. Expected: all stack orbit tests pass.

- [ ] **Step 5: Commit the core connection geometry**

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "fix: extend devops sticks into core"
```

### Task 2: DevOps-only material balance

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Produces: `StackMaterialRole` and `getStackMaterialBaseOpacity(defaultOpacity, role, visualLayer)`.
- Consumes: `trackMaterial` stores a role for each material; both static and animated opacity loops resolve the active base opacity through the helper.

- [ ] **Step 1: Write the failing DevOps material test**

Import `getStackMaterialBaseOpacity` and add:

```ts
test("balances only DevOps core framing and label sticks", () => {
  assert.equal(getStackMaterialBaseOpacity(0.18, "default", "bridge"), 0.18);
  assert.equal(getStackMaterialBaseOpacity(0.28, "core-shell", "bridge"), 0.22);
  assert.equal(getStackMaterialBaseOpacity(0.46, "core-lines", "bridge"), 0.22);
  assert.equal(getStackMaterialBaseOpacity(0.96, "core-points", "bridge"), 0.8);
  assert.equal(getStackMaterialBaseOpacity(0.34, "bridge-stick", "bridge"), 0.7);
  assert.equal(getStackMaterialBaseOpacity(0.34, "default", "bridge"), 0.34);

  assert.equal(getStackMaterialBaseOpacity(0.28, "core-shell", "core"), 0.28);
  assert.equal(getStackMaterialBaseOpacity(0.34, "bridge-stick", "surface"), 0.34);
});
```

- [ ] **Step 2: Run the focused suite to verify RED**

Run the same esbuild and `node --test` commands. Expected: bundling fails because `getStackMaterialBaseOpacity` is not exported.

- [ ] **Step 3: Add the minimal opacity resolver**

Add to `frontend/utils/landingStackOrbit.ts`:

```ts
export type StackMaterialRole =
  | "default"
  | "core-shell"
  | "core-lines"
  | "core-points"
  | "bridge-stick";

export function getStackMaterialBaseOpacity(
  defaultOpacity: number,
  role: StackMaterialRole,
  visualLayer: StackVisualLayer,
) {
  if (visualLayer !== "bridge") return defaultOpacity;
  if (role === "core-shell" || role === "core-lines") return 0.22;
  if (role === "core-points") return 0.8;
  if (role === "bridge-stick") return 0.7;
  return defaultOpacity;
}
```

- [ ] **Step 4: Run the focused suite to verify GREEN**

Run the same esbuild and `node --test` commands. Expected: all stack orbit tests pass.

- [ ] **Step 5: Tag materials and resolve dynamic base opacity**

Import `getStackMaterialBaseOpacity` and `type StackMaterialRole`. Add `role: StackMaterialRole` to tracked material records and add a defaulted role argument:

```ts
const trackMaterial = <T extends import("three").Material & { opacity: number }>(
  material: T,
  layer: "surface" | "core" | "bridge",
  baseOpacity: number,
  role: StackMaterialRole = "default",
) => {
  material.transparent = true;
  material.depthWrite = false;
  material.opacity = getStackMaterialBaseOpacity(
    baseOpacity,
    role,
    activeStackLayer.value,
  ) * 0.16;
  trackedMaterials.push({ baseOpacity, layer, material, role });
  return material;
};
```

Tag only these material calls, keeping their existing material constructors:

```ts
trackMaterial(
  new THREE.MeshBasicMaterial({ color: 0x111318, wireframe: true }),
  "core",
  0.28,
  "core-shell",
);
trackMaterial(
  new THREE.LineBasicMaterial({ color: 0x111318 }),
  "core",
  0.46,
  "core-lines",
);
trackMaterial(
  new THREE.PointsMaterial({ color: 0x111318, size: 0.058, sizeAttenuation: true }),
  "core",
  0.96,
  "core-points",
);
trackMaterial(
  new THREE.LineBasicMaterial({ color: 0x5d6470 }),
  "bridge",
  0.34,
  "bridge-stick",
);
```

Leave the core inner fill and general bridge network on the default role.

In both material update loops, resolve the target with:

```ts
const resolvedBaseOpacity = getStackMaterialBaseOpacity(
  baseOpacity,
  role,
  activeStackLayer.value,
);
const targetOpacity = resolvedBaseOpacity * targets[layer];
```

- [ ] **Step 6: Run tests and production build**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
.\node_modules\.bin\nuxt.cmd build
```

Expected: all tests pass and Nuxt completes successfully. Stop the isolated dev server before the build to avoid concurrent `.nuxt` writes.

- [ ] **Step 7: Restart port 3001 and commit**

Delete only `.codex-test/landingStackOrbit.test.mjs`, restart the worktree dev server on port 3001, verify HTTP 200, and commit:

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts frontend/composables/landing/useLandingStackSphere.ts
git commit -m "fix: connect devops sticks to core"
```
