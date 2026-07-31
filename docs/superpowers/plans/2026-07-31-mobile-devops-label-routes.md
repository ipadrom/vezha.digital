# Mobile DevOps Stick Attachment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Attach DevOps labels to their 3D sticks on mobile while preserving the existing desktop behavior.

**Architecture:** Add a pure viewport policy helper that selects stick attachment for DevOps at every viewport width. The sphere composable uses this policy for point selection, mirrored-depth selection, and collision handling, and removes the independent mobile DevOps latitude route.

**Tech Stack:** Vue 3, Nuxt 3, TypeScript, Three.js, Node test runner, esbuild

## Global Constraints

- Use the existing 75% bridge attachment points.
- Preserve the four approved stick levels and bridge rotation.
- Do not change opacity, geometry, Frontend, Backend, or Mobile-section behavior.
- Keep the development server on port 3001.

---

### Task 1: Viewport-independent DevOps stick attachment

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `shouldUseStackBridgeAttachment(layer, viewportWidth): boolean`.
- Consumes: existing `desktopAttachedPoint` values and bridge-group projection.

- [ ] **Step 1: Write the failing policy test**

Assert that DevOps uses stick attachment at widths `390`, `900`, and `1440`,
while Frontend does not.

- [ ] **Step 2: Run the focused suite to verify RED**

Bundle the stack-orbit test with esbuild and run `node --test`; expect failure
because the policy helper is not exported.

- [ ] **Step 3: Implement and consume the policy**

Add the helper, remove the obsolete mobile DevOps latitude profile and branch,
and use the resolved policy wherever the composable selects attachment points
or skips collision displacement.

- [ ] **Step 4: Verify GREEN and build**

Run the complete stack-orbit suite and `npm run build`; expect all checks to
complete successfully.

- [ ] **Step 5: Commit and confirm port 3001**

Commit the utility, composable, tests, and updated design documents, then
verify HTTP 200 at `http://localhost:3001/#stack`.

