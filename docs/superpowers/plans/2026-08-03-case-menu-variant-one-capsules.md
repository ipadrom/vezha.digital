# Case Menu Variant One Capsules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace variant 1's rectangular case rail with an interactive capsule selector on desktop and mobile.

**Architecture:** Keep the existing preview component and route model. Add local active-project state to the preview component, then restyle only `.menu-demo--v1 .menu-rail` and its descendants with capsule geometry and a horizontal mobile adaptation.

**Tech Stack:** Nuxt 3, Vue 3 Composition API, CSS, Node test runner.

## Global Constraints

- Modify only variant 1 navigation behavior and presentation.
- Keep variants 2–5, URL query state, and the desktop/mobile toolbar unchanged.
- Add no dependencies or raster assets.

---

### Task 1: Capsule selector behavior and presentation

**Files:**
- Modify: `frontend/components/cases/CaseMenuVariantsPreview.vue`
- Modify: `frontend/assets/css/case-menu-variants.css`
- Create: `frontend/tests/caseMenuVariantOne.test.mjs`

**Interfaces:**
- Consumes: the existing `projects` array and `CaseMenuVariantId`/`CaseMenuView` props.
- Produces: local `activeProjectId`, computed `activeProject`, and `.menu-rail__item` capsule markup.

- [ ] **Step 1: Write the failing source-contract test**

Create a Node test that reads the component and CSS and asserts:

```js
assert.match(component, /@click="activeProjectId = project\.id"/);
assert.match(css, /\.menu-rail button[\s\S]*border-radius:\s*999px/);
assert.match(css, /\.case-menu-preview--mobile \.menu-rail[\s\S]*overflow-x:\s*auto/);
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/caseMenuVariantOne.test.mjs`

Expected: FAIL because variant 1 is still a rectangular static rail.

- [ ] **Step 3: Implement interactive capsule navigation**

Update the rail buttons with `@click="activeProjectId = project.id"`, bind the active state to `activeProjectId`, and derive the demo title, metadata, and monogram from `activeProject`. Preserve the existing markup for variants 2–5.

In CSS, remove the rail divider and button separators, add spacing and padding around the rail, use `border-radius: 999px`, and give the active capsule a dark fill plus a circular violet marker. On mobile use a horizontal scroll row with intrinsic-width capsules.

- [ ] **Step 4: Run focused and full tests**

Run:

```powershell
node --test tests/caseMenuVariantOne.test.mjs tests/caseMenuVariantsRoute.test.mjs
```

Then run the full test suite through the cached `tsx` runner. Expected: all 73 tests pass.

- [ ] **Step 5: Build, restart port 3004, and verify all route states**

Run the Nuxt production build, restart `.output/server/index.mjs` with `PORT=3004`, and request variants 1–5 in desktop and mobile modes. Expected: ten HTTP 200 responses containing the selected variant and view classes.

- [ ] **Step 6: Commit**

```powershell
git add frontend/components/cases/CaseMenuVariantsPreview.vue frontend/assets/css/case-menu-variants.css frontend/tests/caseMenuVariantOne.test.mjs docs/superpowers/specs/2026-08-03-case-menu-variant-one-capsules-design.md docs/superpowers/plans/2026-08-03-case-menu-variant-one-capsules.md
git commit -m "feat: develop capsule case selector"
```
