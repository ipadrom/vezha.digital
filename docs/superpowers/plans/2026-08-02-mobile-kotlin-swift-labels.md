# Mobile Kotlin and Swift Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace React Native in the Stack Mobile state with Kotlin and Swift while preserving current motion and preventing avoidable label crowding.

**Architecture:** Keep `MOBILE_ORBIT_TECH` as the single animated-label data source consumed by `useLandingStackSphere`. Put Kotlin, Swift, and Flutter at equal phases on the longer outer orbit; retain Expo and PWA as an opposite pair on the inner orbit. Keep RU and EN content arrays synchronized with the animated scene.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js, Node test runner, esbuild.

## Global Constraints

- Final Mobile set: `Kotlin`, `Swift`, `Flutter`, `Expo`, and `PWA` on desktop and compact viewports.
- Outer orbit: `Kotlin`, `Swift`, and `Flutter`, spaced by exactly `2 * Math.PI / 3`.
- Inner orbit: `Expo` and `PWA`, spaced by exactly `Math.PI`.
- Do not change orbit geometry, duration, direction, label sizing, anchor styling, core animation, collision detection, or smoothing.
- Use existing Simple Icons loading with slugs `kotlin` and `swift`.

---

### Task 1: Replace and redistribute animated Mobile technologies

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts:150-170`
- Modify: `frontend/utils/landingStackOrbit.ts:203-252`

**Interfaces:**
- Consumes: `MOBILE_ORBIT_TECH`, an immutable array of technology specifications.
- Produces: five specifications consumed unchanged by `useLandingStackSphere`, each with `label`, `slug`, `color`, `orbit`, `phase`, `desktopPhase`, `placement`, and `radiusScale`.

- [ ] **Step 1: Write failing tests for the final set and phase spacing**

Replace the existing assignment assertion and add explicit phase checks:

```ts
test("assigns five native Mobile technologies to balanced tracks", () => {
  assert.deepEqual(
    MOBILE_ORBIT_TECH.map(({ label, orbit, slug }) => [label, orbit, slug]),
    [
      ["Kotlin", "outer", "kotlin"],
      ["Swift", "outer", "swift"],
      ["Flutter", "outer", "flutter"],
      ["Expo", "inner", "expo"],
      ["PWA", "inner", "pwa"],
    ],
  );
});

test("spaces three outer Mobile labels evenly and keeps inner labels opposite", () => {
  const phases = Object.fromEntries(
    MOBILE_ORBIT_TECH.map(({ label, phase }) => [label, phase]),
  );
  assert.ok(Math.abs(phases.Swift - phases.Kotlin - Math.PI * 2 / 3) < 1e-12);
  assert.ok(Math.abs(phases.Flutter - phases.Swift - Math.PI * 2 / 3) < 1e-12);
  assert.ok(Math.abs(phases.PWA - phases.Expo - Math.PI) < 1e-12);
});
```

In the existing desktop phase-lock test, replace the React Native lookup with Kotlin and Swift lookups, remove the old Flutter-opposite-React-Native point assertion, and retain the generic loop that verifies every technology stays on its declared orbit.

- [ ] **Step 2: Run the orbit suite and verify RED**

Run from `frontend`:

```powershell
New-Item -ItemType Directory -Force -Path .codex-test | Out-Null
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-test\landingStackOrbit.test.mjs
node --test .codex-test\landingStackOrbit.test.mjs
```

Expected: FAIL because the array still contains React Native and only four entries.

- [ ] **Step 3: Implement the five-entry data set**

Replace the existing data set with:

```ts
const outerBasePhase = 2.5;
const outerPhaseStep = Math.PI * 2 / 3;
const innerBasePhase = 2.5 + Math.PI / 4;

export const MOBILE_ORBIT_TECH = [
  {
    angle: outerBasePhase,
    color: "#7F52FF",
    desktopPhase: outerBasePhase,
    label: "Kotlin",
    orbit: "outer",
    phase: outerBasePhase,
    placement: "orbit",
    radiusScale: 1,
    slug: "kotlin",
  },
  {
    angle: outerBasePhase + outerPhaseStep,
    color: "#F05138",
    desktopPhase: outerBasePhase + outerPhaseStep,
    label: "Swift",
    orbit: "outer",
    phase: outerBasePhase + outerPhaseStep,
    placement: "orbit",
    radiusScale: 1,
    slug: "swift",
  },
  {
    angle: outerBasePhase + outerPhaseStep * 2,
    color: "#54C5F8",
    desktopPhase: outerBasePhase + outerPhaseStep * 2,
    label: "Flutter",
    orbit: "outer",
    phase: outerBasePhase + outerPhaseStep * 2,
    placement: "orbit",
    radiusScale: 1,
    slug: "flutter",
  },
  {
    angle: innerBasePhase,
    color: "#111318",
    desktopPhase: innerBasePhase,
    label: "Expo",
    orbit: "inner",
    phase: innerBasePhase,
    placement: "orbit",
    radiusScale: 1,
    slug: "expo",
  },
  {
    angle: innerBasePhase + Math.PI,
    color: "#5A0FC8",
    desktopPhase: innerBasePhase + Math.PI,
    label: "PWA",
    orbit: "inner",
    phase: innerBasePhase + Math.PI,
    placement: "intersection",
    radiusScale: 0.82,
    slug: "pwa",
  },
] as const;
```

- [ ] **Step 4: Run the orbit suite and verify GREEN**

Run the commands from Step 2. Expected: all tests pass with zero failures.

- [ ] **Step 5: Remove the generated test bundle and commit**

Delete `frontend/.codex-test/landingStackOrbit.test.mjs`, then run:

```powershell
git add frontend/tests/landingStackOrbit.test.ts frontend/utils/landingStackOrbit.ts
git commit -m "feat: replace React Native with Kotlin and Swift"
```

### Task 2: Synchronize RU and EN technology copy

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/locales/ru.json:223-230`
- Modify: `frontend/locales/en.json:223-230`

**Interfaces:**
- Consumes: `landing.stack.groups[3].items` in both locale JSON files.
- Produces: identical five-item user-facing lists in Russian and English content.

- [ ] **Step 1: Write a failing locale synchronization test**

```ts
test("lists the same five native Mobile technologies in both locales", () => {
  const expected = ["Kotlin", "Swift", "Flutter", "Expo", "PWA"];
  for (const locale of ["ru", "en"]) {
    const messages = JSON.parse(readFileSync(`locales/${locale}.json`, "utf8"));
    assert.deepEqual(messages.landing.stack.groups[3].items, expected);
  }
});
```

- [ ] **Step 2: Run the orbit suite and verify RED**

Run the Task 1 Step 2 commands. Expected: FAIL because both locale arrays still contain React Native.

- [ ] **Step 3: Replace both locale arrays**

Set the Mobile technologies array in `ru.json` and `en.json` to:

```json
["Kotlin", "Swift", "Flutter", "Expo", "PWA"]
```

Do not modify the Mobile descriptions or other locale keys.

- [ ] **Step 4: Run the orbit suite and verify GREEN**

Run the Task 1 Step 2 commands. Expected: all tests pass with zero failures.

- [ ] **Step 5: Remove the generated test bundle and commit**

Delete `frontend/.codex-test/landingStackOrbit.test.mjs`, then run:

```powershell
git add frontend/tests/landingStackOrbit.test.ts frontend/locales/ru.json frontend/locales/en.json
git commit -m "fix: synchronize Mobile technology copy"
```

### Task 3: Production and local-server verification

**Files:**
- Verify only: all files changed in Tasks 1 and 2.

**Interfaces:**
- Consumes: completed implementation commits.
- Produces: passing automated checks and a running review server on port 3001.

- [ ] **Step 1: Run the complete orbit test suite**

Run the Task 1 Step 2 commands. Expected: all tests pass with zero failures.

- [ ] **Step 2: Stop only the process listening on port 3001**

Resolve the exact PID with `Get-NetTCPConnection -LocalPort 3001 -State Listen`, then stop only that PID before building.

- [ ] **Step 3: Run the production build**

```powershell
npm run build
```

Expected: exit code 0 and `Build complete`.

- [ ] **Step 4: Restart the isolated development server**

Start Nuxt from this worktree's `frontend` directory with `node_modules/nuxt/bin/nuxt.mjs dev --port 3001`, hidden, and redirect stdout/stderr to task-specific files under the Windows temp directory.

- [ ] **Step 5: Verify the server and repository state**

```powershell
curl.exe -I --max-time 60 http://localhost:3001/
git status --short --branch
git log -3 --oneline
```

Expected: HTTP 200, branch `codex/desktop-stack-label-routes`, and no uncommitted files.
