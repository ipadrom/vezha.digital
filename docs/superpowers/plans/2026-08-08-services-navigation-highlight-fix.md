# Services Navigation Highlight Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the active service pill aligned and remove inactive service button outlines on desktop and mobile.

**Architecture:** Convert stable element layout metrics into the existing highlight bounds type, then use that helper in the landing services composable. Preserve the single animated highlight and update the existing CSS contract tests to protect border and focus behavior.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, CSS, Node test runner.

## Global Constraints

- Do not change service content, order, autoplay, or responsive layout.
- Inactive service buttons have no visible border on desktop or mobile.
- The active service uses one black moving highlight.
- Keyboard focus remains visible.
- Do not add dependencies.

---

### Task 1: Stable highlight geometry

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/utils/landingServicesHighlight.ts`
- Modify: `frontend/composables/landing/useLandingServices.ts`

**Interfaces:**
- Produces: `getServiceHighlightLayoutBounds(element: Pick<HTMLElement, "offsetLeft" | "offsetTop" | "offsetWidth" | "offsetHeight">): ServiceHighlightBounds`
- Consumes: existing `getServiceHighlightTargetBounds` and `getServiceHighlightFrames` functions.

- [ ] **Step 1: Write the failing geometry test**

Add a test that passes literal layout metrics `{ offsetLeft: 24, offsetTop: 56, offsetWidth: 300, offsetHeight: 48 }` and expects `{ x: 24, y: 56, width: 300, height: 48 }`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --import tsx tests/landingStackOrbit.test.ts`

Expected: FAIL because `getServiceHighlightLayoutBounds` is not exported.

- [ ] **Step 3: Implement stable geometry**

Add the typed helper to `landingServicesHighlight.ts`. Replace the composable’s viewport-relative button measurement with this helper. Keep `getBoundingClientRect()` only for measuring the already-rendered highlight during a transition.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test --import tsx tests/landingStackOrbit.test.ts`

Expected: PASS.

### Task 2: Borderless navigation states

**Files:**
- Modify: `frontend/tests/landingStackOrbit.test.ts`
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `.vz-services__nav button`, `[data-active="true"]`, and `:focus-visible` selectors.
- Produces: transparent decorative borders with a visible keyboard focus outline.

- [ ] **Step 1: Write failing CSS contract assertions**

Update desktop and mobile assertions to require `border: 1px solid transparent`, active `border-color: transparent`, and a `focus-visible` outline. Keep the assertion that active button backgrounds remain transparent so only the moving highlight supplies the fill.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --import tsx tests/landingStackOrbit.test.ts`

Expected: FAIL against the current `var(--chipbd)` borders.

- [ ] **Step 3: Implement minimal CSS changes**

Change desktop and mobile decorative borders to transparent, keep active borders transparent, remove the border-color hover behavior, and add an offset focus-visible outline using `var(--ink)`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test --import tsx tests/landingStackOrbit.test.ts`

Expected: PASS.

### Task 3: Verification and local preview

**Files:**
- Verify: `frontend/package.json`
- Verify: changed frontend files.

**Interfaces:**
- Produces: a passing test/build result and a running local preview URL.

- [ ] **Step 1: Run the full relevant test suite**

Run the frontend test script that includes `landingStackOrbit.test.ts` and confirm zero failures.

- [ ] **Step 2: Run the production build**

Run the frontend build script and confirm exit code 0.

- [ ] **Step 3: Run the Impeccable detector once**

Run `node C:\Users\artas\.codex\skills\impeccable\scripts\detect.mjs --json frontend/assets/css/landing-redesign.css frontend/composables/landing/useLandingServices.ts frontend/utils/landingServicesHighlight.ts frontend/tests/landingStackOrbit.test.ts` and address only findings caused by this change.

- [ ] **Step 4: Start the local development server**

Use the repository package manager and the existing development script. Keep it running and report its URL for user-led visual review.
