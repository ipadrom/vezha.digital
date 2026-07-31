# Mobile DevOps Label Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move mobile DevOps labels across four latitude routes on the visible hemisphere while preserving the desktop stick attachment.

**Architecture:** Add a dedicated pure mobile DevOps route profile beside the existing Frontend and Backend profiles. The sphere composable selects it only for DevOps at viewport widths up to 900px and continues using the existing latitude renderer.

**Tech Stack:** Vue 3, Nuxt 3, TypeScript, Three.js, Node test runner, esbuild

## Global Constraints

- Mobile means viewport width less than or equal to 900px.
- Use lane heights `1.35`, `0.99`, `0.63`, and `0.27` with geometry scale `1`.
- Keep desktop DevOps labels attached at 75% of their sticks.
- Do not change DevOps material opacity or sphere geometry.
- Keep the development server on port 3001.

---

### Task 1: Mobile DevOps route profile and renderer selection

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `MOBILE_DEVOPS_STACK_LABEL_ROUTE_PROFILE` as a `DesktopStackLabelRouteProfile`.
- Consumes: existing `renderLatitudeLabels(profile, scale, delayConflicts, flattenRouteY, jitterScale)`.

- [ ] **Step 1: Write the failing profile test**

Import `MOBILE_DEVOPS_STACK_LABEL_ROUTE_PROFILE`, generate four consecutive
route states, and assert literal `y` values `[1.35, 0.99, 0.63, 0.27]` plus
positive front-hemisphere `z` values.

- [ ] **Step 2: Run the focused suite to verify RED**

Run the esbuild bundle command and `node --test`; expect failure because the
profile export does not exist.

- [ ] **Step 3: Add the profile and mobile-only renderer branch**

Add the profile with geometry scale `1`. For active DevOps at widths up to
900px, call `renderLatitudeLabels` with the profile, label scale `0.92`, conflict
delay enabled, flattened route height enabled, and jitter scale `0.6`.

- [ ] **Step 4: Verify GREEN and build**

Run the complete stack-orbit suite and `npm run build`; expect all tests and the
Nuxt build to complete successfully.

- [ ] **Step 5: Commit and confirm port 3001**

Commit the utility, composable, and test changes, then verify HTTP 200 at
`http://localhost:3001/#stack`.

