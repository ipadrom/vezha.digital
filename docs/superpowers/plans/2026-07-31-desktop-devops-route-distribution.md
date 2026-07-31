# Desktop DevOps Route Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Distribute the four desktop DevOps stick-attached labels across four separated horizontal routes in the order Docker, CI/CD, Nginx, Linux from top to bottom.

**Architecture:** Export the approved vertical route levels from the existing pure stack orbit utility and consume them from the bridge label specifications. The current stick angles, 75% attachment interpolation, shared `bridgeGroup` rotation, mirrored pairs, and mobile behavior remain unchanged.

**Tech Stack:** Vue 3, Nuxt 3, TypeScript, Three.js, Node test runner, esbuild

## Global Constraints

- Apply only to desktop DevOps bridge geometry.
- Keep the 75% label-to-stick attachment unchanged.
- Keep existing bridge angles and shared rotation unchanged.
- Keep mobile DevOps unchanged.
- Use exact outer endpoint levels: Docker `0.72`, CI/CD `0.24`, Nginx `-0.22`, Linux `-0.68`.
- Keep the development server on port 3001.

---

### Task 1: Tested DevOps route levels

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`

**Interfaces:**
- Produces: `DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS`, a readonly map from `Docker | CI/CD | Nginx | Linux` to the approved outer endpoint `y` value.
- Consumes: bridge label specifications in `useLandingStackSphere.ts` read the map while retaining their existing colors, slugs, labels, and angles.

- [ ] **Step 1: Write the failing route-level test**

Import `DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS` and add:

```ts
test("separates desktop DevOps labels into four ordered bridge routes", () => {
  assert.deepEqual(DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS, {
    Docker: 0.72,
    "CI/CD": 0.24,
    Nginx: -0.22,
    Linux: -0.68,
  });

  assert.deepEqual(
    ["Docker", "CI/CD", "Nginx", "Linux"]
      .map((label) => DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS[
        label as keyof typeof DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS
      ]),
    [0.72, 0.24, -0.22, -0.68],
  );
});
```

- [ ] **Step 2: Run the test to verify RED**

Run from `frontend`:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: bundling fails because `DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS` is not exported.

- [ ] **Step 3: Add the minimal route-level configuration**

Add to `frontend/utils/landingStackOrbit.ts`:

```ts
export const DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS = {
  Docker: 0.72,
  "CI/CD": 0.24,
  Nginx: -0.22,
  Linux: -0.68,
} as const;
```

- [ ] **Step 4: Run the tests to verify GREEN**

Run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: all stack orbit tests pass.

- [ ] **Step 5: Connect each bridge specification to its approved level**

Import the map in `useLandingStackSphere.ts` and change only `y` values:

```ts
const bridgeLabelSpecs = [
  {
    color: "#2496ED",
    slug: "docker",
    label: "Docker",
    angle: 2.8,
    y: DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS.Docker,
  },
  {
    color: "#009639",
    slug: "nginx",
    label: "Nginx",
    angle: 1.25,
    y: DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS.Nginx,
  },
  {
    color: "#7C3AED",
    slug: "githubactions",
    label: "CI/CD",
    angle: -0.2,
    y: DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS["CI/CD"],
  },
  {
    color: "#F5B800",
    slug: "linux",
    label: "Linux",
    angle: -1.7,
    y: DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS.Linux,
  },
];
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

