# Task 1 Report: Capsule selector behavior and presentation

## Delivered

- Added `activeProjectId` and computed `activeProject` to variant 1.
- Made each variant-1 rail capsule selectable and updated the demonstration title, description, metadata, monogram, and preview label from the active project.
- Replaced the desktop rail's table-like dividers with spaced rounded capsules, including an active dark fill and violet round marker.
- Made the mobile rail a horizontally scrollable row with intrinsic-width capsules.
- Left the markup of variants 2–5 unchanged.

## TDD evidence

1. Added `frontend/tests/caseMenuVariantOne.test.mjs` first.
2. Ran `node --test tests/caseMenuVariantOne.test.mjs`; it failed as expected because the selection click handler was absent.
3. Implemented the smallest component and CSS changes needed for the contract, then reran the focused tests successfully.

## Verification

- `node --test tests/caseMenuVariantOne.test.mjs tests/caseMenuVariantsRoute.test.mjs`: 2 passed, 0 failed.
- Cached `tsx --test` over all test files: 73 passed, 0 failed.
- `git diff --check`: clean.

## Deferred by controlling task

The production build, server restart, and ten route checks were intentionally not run: the controlling task explicitly requires that port 3004 not be stopped and will perform the rebuild/restart after review.
