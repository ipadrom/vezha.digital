# Footer Top Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the footer tagline and inner divider, then place the back-to-top link above the footer boundary.

**Architecture:** Keep the existing footer component and top-link hook, but remove the tagline data path. Convert `.vz-footer__top` from an in-flow row into a right-aligned absolute element above the footer's existing top border.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, CSS, JSON localization.

## Global Constraints

- Remove `footer.tagline` from component, page type, and RU/EN locales.
- Keep `footer.topLink` and its `#hero` destination.
- Remove the `.vz-footer__top` bottom border.
- Position the link above the footer boundary on desktop and mobile.
- Do not alter footer columns, sign, legal text, or game.
- Do not perform browser visual QA.

---

### Task 1: Remove tagline data and markup

**Files:**
- Modify: `frontend/components/landing/LandingFooter.vue`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`

**Interfaces:**
- Consumes: existing `copy.topLink`.
- Produces: a top-link-only `.vz-footer__top` element.

- [ ] **Step 1: Run the failing source contract**

Assert that the four files contain no `tagline` reference and that `.vz-footer__top` contains only the `#hero` anchor.

Expected: FAIL because tagline markup, type, and locale values still exist.

- [ ] **Step 2: Apply the minimal markup/data change**

Remove the tagline span and the `tagline: string` fields while preserving `topLink`.

- [ ] **Step 3: Re-run the source contract**

Expected: PASS with `topLink` still present in RU/EN.

### Task 2: Move the link above the footer boundary

**Files:**
- Modify: `frontend/pages/index.vue`

**Interfaces:**
- Consumes: `.vz-footer` and `.vz-footer__top`.
- Produces: an absolute right-aligned link above the existing footer top border.

- [ ] **Step 1: Run the failing CSS contract**

Assert that `.vz-footer` is positioned relatively, `.vz-footer__top` is absolute with no bottom border, and desktop/mobile rules place it above the footer.

Expected: FAIL because the current top row is in flow and has `border-bottom`.

- [ ] **Step 2: Apply the minimal CSS change**

Use `position: relative` on the footer and absolute positioning with `bottom: calc(100% + 18px)` on desktop. Keep a `20px` right offset and `bottom: calc(100% + 14px)` on mobile.

- [ ] **Step 3: Re-run the CSS contract**

Expected: PASS with footer column padding unchanged.

### Task 3: Verify and publish with the hero CTA

**Files:**
- Verify: all hero CTA and footer files changed in this release.

**Interfaces:**
- Consumes: both completed UI adjustments.
- Produces: a buildable and published `main`.

- [ ] **Step 1: Parse RU/EN localization JSON**

Expected: both files parse successfully.

- [ ] **Step 2: Run all source contracts and `git diff --check`**

Expected: all checks pass.

- [ ] **Step 3: Run `npm run build` from `frontend`**

Expected: Nuxt production build exits with code `0`.

- [ ] **Step 4: Restart localhost and confirm port `3000`**

Expected: `http://127.0.0.1:3000/` is listening.

- [ ] **Step 5: Commit and push**

Commit the source changes with:

```powershell
git commit -m "feat: refine hero and footer navigation"
git push origin main
```

- [ ] **Step 6: Verify remote parity**

Confirm local `HEAD` equals `origin/main`.
