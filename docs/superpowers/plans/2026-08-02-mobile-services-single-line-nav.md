# Mobile Services Single-Line Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the wrapping mobile Services chip group with a single-line text navigation whose active item retains a colored pill.

**Architecture:** Reuse the existing buttons, compact localized labels, and selection logic. Change only the mobile CSS state model and protect the required responsive declarations with a regression test.

**Tech Stack:** CSS, Node test runner, Nuxt, Browser visual QA

## Global Constraints

- Mobile navigation stays on one line at 390px without horizontal scrolling.
- Inactive items are plain text; only the active item is a filled pill.
- The active fill matches the dark blue-gray section spot and its label uses the heading gradient.
- Desktop navigation remains unchanged.

---

### Task 1: Implement single-line mobile Services navigation

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/assets/css/landing-redesign.css`

- [x] Add a failing static CSS regression test for `nowrap`, hidden numbers, plain inactive controls, and the active color treatment.
- [x] Run the landing stack suite and confirm the new test fails against the wrapping chip layout.
- [x] Apply the minimal mobile-only CSS changes.
- [x] Run the full landing stack suite and production build.
- [x] Restart port 3001 and verify the one-line layout at 390px, including a service selection.
- [x] Commit the verified implementation and documentation.
