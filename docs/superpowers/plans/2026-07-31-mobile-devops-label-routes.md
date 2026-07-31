# Mobile DevOps Two-Lane Stick Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Arrange mobile DevOps stick-attached labels on two upper-hemisphere routes and delay appearance until same-route clearance is safe.

**Architecture:** A pure mobile bridge-route helper produces two route levels while retaining the existing angles and 75% attachment math. The Three.js composable owns separate desktop and mobile stick geometries, switches their visibility at 900px, projects the matching attachment point, and applies a stateful reveal gate backed by a pure clearance helper.

**Tech Stack:** Vue 3, Nuxt 3, TypeScript, Three.js, Node test runner, esbuild

## Global Constraints

- Mobile means viewport width less than or equal to 900px.
- Docker and Nginx use `y = 0.72`; CI/CD and Linux use `y = 0.16`.
- Keep all attachment ratios at `0.75` and inner radii at `0.690654`.
- Use 14px minimum card gap plus 24px reveal distance.
- Do not change desktop DevOps geometry, opacity, rotation, or other stack sections.
- Keep the development server on port 3001.

---

### Task 1: Mobile two-lane route geometry

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `getMobileDevOpsBridgeRoute(label, angle)` returning `{ anchor, laneIndex, outerPoint }`.
- Consumes: `getStackBridgeAttachmentPoint(anchor, outerPoint, 0.75)`.

- [ ] **Step 1: Write a failing route test**

Assert route levels `[0.72, 0.72, 0.16, 0.16]`, lane indices `[0, 0, 1, 1]`,
inner radii `0.690654`, and positive attached-point heights.

- [ ] **Step 2: Verify RED**

Bundle `tests/landingStackOrbit.test.ts` with esbuild and run `node --test`;
expect failure because `getMobileDevOpsBridgeRoute` is missing.

- [ ] **Step 3: Implement the pure mobile route helper**

Use the existing angles and radial normalization with the two exact mobile
levels and lane indices.

- [ ] **Step 4: Verify GREEN**

Run the complete stack-orbit suite and require zero failures.

### Task 2: Same-route appearance clearance

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `getMobileDevOpsLabelClearanceFactor(candidate, peers)` using the existing collision-box shape.

- [ ] **Step 1: Write a failing clearance test**

Assert that a close peer on the same lane returns `0`, a safely distant peer
returns `1`, and an equally close peer on a different lane returns `1`.

- [ ] **Step 2: Verify RED**

Run the focused suite and expect failure because the clearance helper is
missing.

- [ ] **Step 3: Implement symmetric edge clearance**

Measure absolute horizontal card-edge distance and apply the existing smooth
14px plus 24px reveal window.

- [ ] **Step 4: Verify GREEN**

Run the complete stack-orbit suite and require zero failures.

### Task 3: Responsive sticks, attachments, and reveal state

**Files:**
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: mobile route points, lane indices, and clearance factor from Tasks 1-2.
- Produces: separate visible desktop/mobile stick line objects and mobile reveal state per label element.

- [ ] **Step 1: Build both stick geometries and attachment sets**

Store `desktopAttachedPoint`, `mobileAttachedPoint`, and `mobileBridgeLaneIndex`
on bridge label records. Toggle desktop/mobile stick object visibility in the
resize path at the 900px boundary.

- [ ] **Step 2: Select the viewport-matching attachment point**

For DevOps, project `mobileAttachedPoint` at widths up to 900px and
`desktopAttachedPoint` above 900px, including mirrored counterparts.

- [ ] **Step 3: Gate first appearance on mobile**

Keep a label hidden until its same-lane clearance factor reaches `1`. Preserve
revealed labels until their normal edge/depth opacity returns below `0.02`, then
reset their reveal state for the next appearance.

- [ ] **Step 4: Verify and commit**

Run the full suite, run `npm run build`, verify HTTP 200 on port 3001, and
commit the utility, composable, tests, specification, and plan.

