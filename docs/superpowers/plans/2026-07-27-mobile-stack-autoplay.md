# Mobile Stack Autoplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visibility-aware mobile stack autoplay that stops permanently after manual selection and make every inactive mobile item visually identical.

**Architecture:** Keep desktop scroll ownership and mobile state ownership inside `useLandingStackScroll.ts`. Add one interval with an explicit manual-stop flag and reuse a single mobile state setter for timer and user input. Neutralize desktop `is-past` colors only inside the existing mobile media query in `index.vue`.

**Tech Stack:** Nuxt 3.12, Vue 3.4, TypeScript, CSS.

## Global Constraints

- Autoplay runs only at viewport widths up to `900px`.
- Interval is exactly `3200ms` and advances cyclically.
- Autoplay advances only while the document and stack section are visible.
- Manual mobile selection stops autoplay until page reload.
- `prefers-reduced-motion: reduce` disables autoplay.
- Desktop scroll-lock behavior and desktop `is-past` styling remain unchanged.
- Browser visual verification is left to the user.

---

### Task 1: Add mobile stack autoplay

**Files:**
- Modify: `frontend/composables/landing/useLandingStackScroll.ts`

**Interfaces:**
- Consumes: `rootRef`, `itemCount`, and `onIndexChange(index, progress)`.
- Produces: unchanged `{ activeIndex, progress, scrollToIndex, scheduleUpdate }` API with mobile autoplay as an internal lifecycle behavior.

- [ ] **Step 1: Run a failing source contract**

Assert that the composable contains a `3200ms` interval, a mobile-only tick, a visibility check, a reduced-motion guard, and a manual stop flag. Expected result before implementation: FAIL because these symbols are absent.

- [ ] **Step 2: Add one shared mobile state setter**

Add `setMobileIndex(index)` that clamps and wraps the index, updates `activeIndex` and `progress`, and invokes `onIndexChange`.

- [ ] **Step 3: Add lifecycle-managed autoplay**

Create `startMobileAutoplay()` and `stopMobileAutoplay()`. Start on mount unless reduced motion is active. Each tick must return unless:

```ts
window.innerWidth <= 900
document.hidden === false
manualMobileSelection === false
section.getBoundingClientRect().top < window.innerHeight * 0.82
section.getBoundingClientRect().bottom > window.innerHeight * 0.18
```

Advance with `setMobileIndex(activeIndex.value + 1)`.

- [ ] **Step 4: Stop after manual mobile selection**

Inside the mobile branch of `scrollToIndex`, set `manualMobileSelection = true`, clear the interval, and call `setMobileIndex(nextIndex)`.

- [ ] **Step 5: Clean up**

Clear the interval in `onBeforeUnmount`. Preserve all existing scroll and resize listeners.

- [ ] **Step 6: Re-run the source contract**

Expected result: PASS for interval, visibility, reduced motion, manual stop, cleanup, and the unchanged public API.

---

### Task 2: Normalize inactive mobile colors

**Files:**
- Modify: `frontend/pages/index.vue`

**Interfaces:**
- Consumes: existing `.is-active` and `.is-past` classes rendered by `LandingStack.vue`.
- Produces: active black state and one shared inactive gray state below `900px`.

- [ ] **Step 1: Run a failing CSS source contract**

Assert that the main mobile media block contains an explicit `.vz-stack-item:not(.is-active) > div:first-child` color and a complete inactive dot override. Expected result before implementation: FAIL because the label override is absent.

- [ ] **Step 2: Add the inactive label rule**

Inside `@media (max-width: 900px)`, set every non-active label to `var(--muted2)` so `.is-past` cannot darken previously selected entries.

- [ ] **Step 3: Keep inactive dots gray**

Keep the existing non-active dot override and explicitly use `var(--dotbd)` border, `var(--bg)` fill, and no scale.

- [ ] **Step 4: Re-run CSS and diff checks**

Expected result: PASS for the inactive label/dot contract and `git diff --check`.

---

### Task 3: Verify, commit, and deploy

**Files:**
- Modify: `frontend/assets/css/landing-redesign.css`
- Modify: `frontend/composables/landing/useLandingStackScroll.ts`
- Modify: `frontend/pages/index.vue`

**Interfaces:**
- Consumes: completed Tasks 1–2 plus the pending mobile services grid alignment fix.
- Produces: a production-buildable `main` commit pushed to `origin/main`.

- [ ] **Step 1: Run source contracts**

Re-run stack autoplay, inactive-color, services-grid alignment, and `git diff --check` contracts.

- [ ] **Step 2: Stop the local dev server before building**

Stop only this workspace’s Nuxt dev process to prevent `.nuxt` build contention.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm run build
```

Expected result: exit code `0` and `Build complete`.

- [ ] **Step 4: Restart localhost**

Start `npm run dev -- --host 127.0.0.1` in a hidden process and confirm port `3000` is listening.

- [ ] **Step 5: Commit source changes**

Stage only the three source files listed above and commit:

```text
feat: add mobile stack autoplay
```

- [ ] **Step 6: Push production branch**

Push `main` to `origin/main` without force and confirm local HEAD equals remote `main`.
