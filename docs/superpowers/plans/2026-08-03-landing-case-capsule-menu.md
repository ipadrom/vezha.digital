# Landing Case Capsule Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the approved variant-1 capsule styling into the real landing cases menu and remove the temporary variants preview feature.

**Architecture:** Preserve `LandingCases.vue` tab behavior and content flow. Replace only the tab rail presentation in `landing-cases.css`, then delete the isolated route, component, model, tests, styles, and documentation that existed solely to compare variants.

**Tech Stack:** Nuxt 3, Vue 3, CSS, Node test runner.

## Global Constraints

- The real landing cases component remains the only user-facing case selector.
- Existing click, keyboard, ARIA, content, metric, link, and visual behavior stays unchanged.
- Desktop uses independent rounded capsules; mobile uses a horizontally scrolling capsule row.
- `/case-menu-variants` and all feature-specific support files are removed.
- No dependencies or raster assets are added.

---

### Task 1: Migrate capsule styling and remove the preview feature

**Files:**
- Modify: `frontend/assets/css/landing-cases.css`
- Modify: `frontend/tests/landingCases.test.ts`
- Delete: `frontend/assets/css/case-menu-variants.css`
- Delete: `frontend/components/cases/CaseMenuVariantsPreview.vue`
- Delete: `frontend/pages/case-menu-variants.vue`
- Delete: `frontend/tests/caseMenuVariantOne.test.mjs`
- Delete: `frontend/tests/caseMenuVariants.test.ts`
- Delete: `frontend/tests/caseMenuVariantsRoute.test.mjs`
- Delete: `frontend/utils/caseMenuVariants.ts`
- Delete: `docs/superpowers/plans/2026-08-03-case-menu-variant-one-capsules.md`
- Delete: `docs/superpowers/plans/2026-08-03-case-menu-variants.md`
- Delete: `docs/superpowers/specs/2026-08-03-case-menu-variant-one-capsules-design.md`
- Delete: `docs/superpowers/specs/2026-08-03-case-menu-variants-design.md`
- Delete: `.superpowers/sdd/2026-08-03-case-menu-variant-one-capsules/task-1-report.md`

**Interfaces:**
- Consumes: existing `.vz-cases__tabs` markup, `aria-selected`, and responsive breakpoint at 900px.
- Produces: capsule appearance through existing selectors without changing Vue data flow.

- [ ] **Step 1: Write a failing landing capsule contract test**

Extend `frontend/tests/landingCases.test.ts` with assertions that require:

```ts
assert.match(css, /\.vz-cases__tabs\s*\{[^}]*gap:\s*10px;[^}]*padding:/s);
assert.match(css, /\.vz-cases__tabs button\s*\{[^}]*border-radius:\s*999px;/s);
assert.match(css, /button\[aria-selected="true"\]::after[^}]*border-radius:\s*50%/s);
assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.vz-cases__tabs\s*\{[^}]*overflow-x:\s*auto;/s);
```

Also assert that `LandingCases.vue` still contains `role="tablist"`, `role="tab"`, and the existing left/right keyboard handlers.

- [ ] **Step 2: Run the focused test and verify it fails**

Run the cached `tsx` runner against `frontend/tests/landingCases.test.ts`.

Expected: the new capsule assertions fail against the rectangular tab rail.

- [ ] **Step 3: Implement the real capsule menu**

Update `.vz-cases__shell` to keep its content boundary while removing the table-like left separator. Give `.vz-cases__tabs` spacing and inset padding. Give each button a `999px` radius, neutral background, borderless state, and hover shift. Use the existing dark active fill and replace the vertical active bar with an 8px circular violet `::after` marker. At `max-width: 900px`, keep horizontal scrolling, use intrinsic button widths, hide inactive names and all type labels, and show the active name.

- [ ] **Step 4: Remove the preview-only feature**

Delete every file listed above. Confirm `git grep -n "case-menu-variants\|CaseMenuVariants\|caseMenuVariants"` returns no matches outside historical git metadata.

- [ ] **Step 5: Verify and commit**

Run the focused test, full test suite, `npm run build`, and `git diff --check`. Expected: all remaining tests pass, the build succeeds, and no preview route is emitted.

Commit:

```powershell
git add -A
git commit -m "feat: move capsule menu into landing cases"
```

### Task 2: Merge the reviewed branch into main

**Files:**
- No source file changes expected.

**Interfaces:**
- Consumes: clean `feat/cases-experience` and clean primary `main` worktree.
- Produces: local `main` containing the case experience and the real capsule menu, without the preview route.

- [ ] **Step 1: Verify both worktrees are clean**

Run `git status --short` in the feature and primary worktrees. Expected: no output.

- [ ] **Step 2: Merge locally**

In the primary worktree, update `main` with `git pull --ff-only` when an upstream exists, then run `git merge feat/cases-experience`.

- [ ] **Step 3: Verify the merged result**

Run the full test suite and production build from `main`. Request `/`, `/cases/wellness-app/`, and `/case-menu-variants`; expect 200, 200, and 404 respectively.

- [ ] **Step 4: Restart the local server**

Restart the verified Nuxt production process on port 3004 from the merged `main` output.
