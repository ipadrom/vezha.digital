# Desktop DevOps Route Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Distribute the four desktop DevOps stick-attached labels across four separated horizontal routes in the order Docker, CI/CD, Nginx, Linux from top to bottom.

**Architecture:** Add a pure utility that converts a DevOps technology and angle into the inner and outer points of its approved bridge route, then consume those points from the sphere composable. The current stick angles, 75% attachment interpolation, shared `bridgeGroup` rotation, mirrored pairs, and mobile behavior remain unchanged.

**Tech Stack:** Vue 3, Nuxt 3, TypeScript, Three.js, Node test runner, esbuild

## Global Constraints

- Apply only to desktop DevOps bridge geometry.
- Keep the 75% label-to-stick attachment unchanged.
- Keep existing bridge angles and shared rotation unchanged.
- Keep mobile DevOps unchanged.
- Use exact outer endpoint levels: Docker `0.72`, CI/CD `0.24`, Nginx `-0.22`, Linux `-0.68`.
- Keep the development server on port 3001.

---

### Task 1: Tested DevOps bridge route geometry

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Produces: `getDesktopDevOpsBridgeRoute(label: DesktopDevOpsBridgeLabel, angle: number): { anchor: StackPoint3; outerPoint: StackPoint3 }`.
- Consumes: bridge label specifications in `useLandingStackSphere.ts` pass their existing label and angle to the helper.

- [ ] **Step 1: Write the failing route-geometry test**

Import `getDesktopDevOpsBridgeRoute` and add a test that exercises the actual bridge points and their existing 75% attachment behavior:

```ts
test("separates desktop DevOps labels into four ordered bridge routes", () => {
  const labels = ["Docker", "CI/CD", "Nginx", "Linux"] as const;
  const routes = labels.map((label) => getDesktopDevOpsBridgeRoute(label, 0));

  assert.deepEqual(routes.map(({ outerPoint }) => outerPoint.y), [
    0.72,
    0.24,
    -0.22,
    -0.68,
  ]);
  assert.deepEqual(routes.map(({ anchor, outerPoint }) => (
    getStackBridgeAttachmentPoint(anchor, outerPoint).y
  )), [0.6696, 0.2232, -0.2046, -0.6324]);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run from `frontend`:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: bundling fails because `getDesktopDevOpsBridgeRoute` is not exported.

- [ ] **Step 3: Add the minimal pure bridge-route helper**

Add to `frontend/utils/landingStackOrbit.ts`:

```ts
export type DesktopDevOpsBridgeLabel = "Docker" | "CI/CD" | "Nginx" | "Linux";

const DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS = {
  Docker: 0.72,
  "CI/CD": 0.24,
  Nginx: -0.22,
  Linux: -0.68,
} as const;

export function getDesktopDevOpsBridgeRoute(
  label: DesktopDevOpsBridgeLabel,
  angle: number,
) {
  const y = DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS[label];
  const directionX = Math.cos(angle);
  const directionZ = Math.sin(angle);

  return {
    anchor: {
      x: directionX * 0.82,
      y: y * 0.72,
      z: directionZ * 0.78,
    },
    outerPoint: {
      x: directionX * 1.28,
      y,
      z: directionZ * 1.2,
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify GREEN**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: all stack orbit tests pass.

- [ ] **Step 5: Connect each bridge specification to its approved geometry**

Keep the existing specification colors, slugs, labels, and angles, removing only the inline `y` values:

```ts
const bridgeLabelSpecs = [
  {
    color: "#2496ED",
    slug: "docker",
    label: "Docker",
    angle: 2.8,
  },
  {
    color: "#009639",
    slug: "nginx",
    label: "Nginx",
    angle: 1.25,
  },
  {
    color: "#7C3AED",
    slug: "githubactions",
    label: "CI/CD",
    angle: -0.2,
  },
  {
    color: "#F5B800",
    slug: "linux",
    label: "Linux",
    angle: -1.7,
  },
] as const;
```

Use the helper while constructing each stick:

```ts
const route = getDesktopDevOpsBridgeRoute(spec.label, spec.angle);
const point = new THREE.Vector3(
  route.outerPoint.x,
  route.outerPoint.y,
  route.outerPoint.z,
);
const anchor = new THREE.Vector3(
  route.anchor.x,
  route.anchor.y,
  route.anchor.z,
);
```

- [ ] **Step 6: Verify build and local server**

Run from `frontend`:

```powershell
.\node_modules\.bin\nuxt.cmd build
```

Restart the isolated Nuxt dev server on port 3001 and verify `http://localhost:3001/#stack` returns HTTP 200. Visual approval remains with the user.

- [ ] **Step 7: Remove the generated test bundle and commit**

Delete only `frontend/.codex-test/landingStackOrbit.test.mjs`, then run:

```powershell
git add frontend/utils/landingStackOrbit.ts frontend/tests/landingStackOrbit.test.ts frontend/composables/landing/useLandingStackSphere.ts
git commit -m "feat: distribute desktop devops routes"
```
