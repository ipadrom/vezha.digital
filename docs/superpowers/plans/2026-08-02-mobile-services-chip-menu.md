# Mobile Services Chip Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the selected wrapping competency-chip menu to the mobile Services section.

**Architecture:** Reuse the existing service navigation buttons and selection logic. Render a full desktop label plus a localized compact label, then switch labels and wrapping behavior through the existing 900px media query.

**Tech Stack:** Vue 3, TypeScript, scoped responsive CSS, Node test runner, Nuxt

## Global Constraints

- All seven competencies are visible without horizontal scrolling at widths up to 900px.
- Desktop labels and service detail headings remain full length.
- Existing click and autoplay behavior remains unchanged.

---

### Task 1: Add compact localized service labels

**Files:**
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/components/landing/LandingServices.vue`
- Test: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Produces: `services.navLabels: [string, string, string, string, string, string, string]`
- Consumes: `copy.navLabels[index]` in each existing service navigation button

- [x] **Step 1: Add a failing locale-data test for the seven approved labels.**
- [x] **Step 2: Run the suite and confirm both locale assertions fail.**
- [x] **Step 3: Add `navLabels` to both locale files and copy types.**
- [x] **Step 4: Render full and compact label spans inside each existing button.**

### Task 2: Apply the selected wrapping chip layout

**Files:**
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `.vz-services__nav-label-full` and `.vz-services__nav-label-compact`
- Produces: a fully wrapping mobile chip group with no horizontal overflow

- [x] **Step 1: Keep the full label visible and compact label hidden by default.**
- [x] **Step 2: At max-width 900px, swap labels and enable `flex-wrap: wrap` with visible overflow.**
- [x] **Step 3: Verify all seven buttons are visible and clicking `Веб-сайты` activates service `03 / 07`.**
- [x] **Step 4: Run tests, production build, restart port 3001, and commit.**
