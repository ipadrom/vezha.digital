# Compact Mobile Fixed Orbit Y Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent Mobile stack labels from changing vertical position to resolve collisions.

**Architecture:** Put the layer decision in the existing pure landing-stack orbit utility, then use it to bypass the shared vertical collision solver. Remove the obsolete Mobile-only smoothing state and helper.

**Tech Stack:** TypeScript, Vue composables, Node test runner, Nuxt build

## Global Constraints

- Preserve orbit-projected Y for Mobile on compact and desktop viewports.
- Do not change Frontend, Backend, or DevOps vertical layout behavior.
- Do not add a replacement vertical collision response.

---

### Task 1: Preserve Mobile orbit Y

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Modify: `frontend/composables/landing/useLandingStackSphere.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `shouldPreserveStackLabelVerticalPosition(visualLayer: StackVisualLayer): boolean`
- Consumes: the current `activeStackLayer` value in the label layout pass

- [x] **Step 1: Write the failing test**

Add a table-driven test proving that only `mobile` preserves its projected vertical position.

- [x] **Step 2: Run test to verify it fails**

Bundle `tests/landingStackOrbit.test.ts` with esbuild and run it with `node --test`; expect the new assertion to fail against the temporary unimplemented helper.

- [x] **Step 3: Write minimal implementation**

Return `visualLayer === "mobile"`, use the result to bypass the vertical solver, and delete `mobileLabelCollisionOffsets` plus `getSmoothedMobileLabelCollisionOffset`.

- [x] **Step 4: Run test to verify it passes**

Bundle and run the full landing-stack suite; expect zero failures.

- [x] **Step 5: Verify and commit**

Run `npm run build`, confirm port 3001 responds, inspect the diff, and commit the implementation.
