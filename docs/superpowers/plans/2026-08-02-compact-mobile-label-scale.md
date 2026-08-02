# Compact Mobile Label Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render Mobile technology labels at scale `0.86` only in compact viewports.

**Architecture:** Reuse the existing compact-only `getMobileLabelDepthStyle` boundary. Keep the desktop Mobile helper and every other visual layer unchanged.

**Tech Stack:** TypeScript, Node test runner, Nuxt

## Global Constraints

- Compact Mobile scale is exactly `0.86`.
- Opacity remains `1` at every depth.
- Desktop Mobile and non-Mobile layers are unchanged.

---

### Task 1: Set compact Mobile label scale

**Files:**
- Modify: `frontend/utils/landingStackOrbit.ts`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: `getMobileLabelDepthStyle(worldZ: number)`
- Produces: `{ opacity: 1, scale: 0.86 }` for compact Mobile rendering

- [x] **Step 1: Change the existing compact Mobile depth-style expectation from scale `1` to `0.86`.**
- [x] **Step 2: Run the landing stack suite and confirm the test fails with actual scale `1`.**
- [x] **Step 3: Return scale `0.86` from `getMobileLabelDepthStyle`.**
- [x] **Step 4: Run the full landing stack suite and production build.**
- [x] **Step 5: Restart port 3001 and commit the verified change.**
