# VEZHA main production visual fixes

## Goal

Fix four visual regressions in the current production `main` branch without reverting the developer's merged work:

1. Restore the current local `redesign_ceo` About composition.
2. Prevent the `VEZHA / digital` composition from shifting or clipping during scroll.
3. Restore technology labels and icons on the Stack sphere.
4. Center the complete Contacts content block, including its buttons.

The existing services section, Development Anatomy section, localization, Stack scroll implementation, CI/CD workflow, and later production fixes in `main` must remain intact.

## Repository state and root cause

The developer merged the redesign from commit `9e48952`. Two later redesign commits were not included:

- `d457f77` — componentized landing structure and later layout/animation corrections.
- `16b812b` — enhanced Stack sphere technology labels and icons.

The current remote `main` continues from the developer's merge and contains additional work through `4e68cd9`. Replacing `main` with `redesign_ceo` or cherry-picking both missing commits wholesale would overwrite or conflict with this newer work.

The Contacts displacement has an additional CSS cascade cause: an earlier rule centers `.vz-contacts h2` with `margin: 0 auto`, but a later rule with the same specificity resets it to `margin: 0`.

## Chosen approach

Apply a targeted patch directly on top of the latest `origin/main`.

Do not reset, force-push, replace the landing page wholesale, or merge the old redesign branch into `main`. Reuse only the missing visual behavior from the local redesign implementation.

## About section

Replace the outdated inline About layout in `main` with the current local redesign composition:

- VEZHA brand block and metrics on the left;
- localized heading and explanatory content on the right;
- animated business-to-product signal flow;
- replay control and the current product/business states.

The implementation must remain compatible with the existing RU/EN copy system in `main`. User-visible strings must come from the existing locale data or new locale keys, not become Russian-only hardcoded text.

Remove the obsolete About-specific liquid WebGL implementation and its cleanup code if it is no longer used after the replacement. Keep the global liquid-negative compositor.

The About section must preserve stable geometry throughout scroll:

- `VEZHA`, the moving liquid-negative shape, and `digital` stay aligned;
- no element is clipped at the right edge;
- no horizontal overflow is introduced;
- the original DOM and negative-world clone use section-scoped selectors;
- resizing and locale changes do not leave stale measurements.

## Stack sphere labels and icons

Keep the current `LandingStack.vue`, `useLandingStackScroll`, localized copy, current stack groups, Go-related changes, and production scroll behavior.

Extend the existing Stack sphere renderer with the label overlay behavior from `16b812b`:

- create a label layer next to the WebGL canvas;
- project label anchor points from Three.js coordinates into the DOM;
- show the labels belonging to the active sphere layer;
- update label positions and visibility during rotation, resize, scroll, and category changes;
- dispose label elements, observers, animation frames, and materials on cleanup.

The technology mapping must match the current `main` stack data. In particular, Backend labels must reflect the current Go/Gin stack rather than restoring the older Python/FastAPI fallback. Frontend, DevOps, and Mobile labels must likewise remain consistent with the visible category chips.

Icons may reuse the inline/local mappings from the reference implementation. The production result must not depend on a missing development-only filesystem path.

## Contacts centering

Treat `.vz-contacts__inner` as one centered content column containing:

- section label;
- heading;
- button row.

Use layout rules that remain centered even if later shared heading rules set margins. The desktop button row should stay centered as a group. On mobile it may expand to the available width while preserving centered content and equal side padding.

The background liquid art remains decorative and must not participate in content alignment.

## Testing and verification

Before changing code, capture failing evidence on the current local `main`:

- About DOM/layout at its initial, middle-scroll, and exit positions;
- missing Stack sphere label elements;
- Contacts content center compared with the viewport center.

After the patch, verify:

- desktop and mobile viewports;
- light and dark themes;
- About at multiple scroll positions;
- RU and EN locale states;
- Stack categories and corresponding sphere labels/icons;
- Contacts label, heading, and buttons centered as one block;
- no framework overlay or relevant console errors;
- no horizontal page overflow;
- TypeScript/Nuxt checks and a production build.

Browser validation uses the in-app Browser against the local `main` server. Screenshots are QA artifacts outside committed source.

## Deployment

After all checks pass:

1. Review the final diff to ensure only the targeted fixes and their tests/specification are present.
2. Commit the implementation on `main`.
3. Push `main` to `origin`.
4. Let the existing `.github/workflows/deploy.yml` workflow deploy the commit.
5. Confirm the GitHub Actions run completes successfully and verify the production page after deployment.

No force-push or manual server mutation is part of this design.
