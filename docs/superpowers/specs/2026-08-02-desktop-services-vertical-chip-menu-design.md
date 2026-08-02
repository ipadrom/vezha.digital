# Desktop Services Vertical Chip Menu

## Goal

Replace the desktop services list with a vertical counterpart of the compact mobile navigation. The selected service is visually larger and sits on a dark animated chip, while the other service names remain compact plain text.

## Scope

- Apply only above the existing `900px` desktop breakpoint.
- Keep the mobile services navigation unchanged.
- Remove service numbers from the desktop navigation. The existing `01 / 07` section counter remains the sole position indicator.
- Do not change service selection, autoplay, device scenes, content panels, or service data.

## Visual Design

- Keep the navigation vertical and left-aligned.
- Remove desktop row dividers and the full-row active background.
- Render inactive labels at approximately `15–16px` in the existing muted text color.
- Render the active label at approximately `18px` with the existing purple-to-cyan gradient.
- Place the active label on a `#33434b` pill with roughly `16px` horizontal breathing room on each side.
- Maintain fixed row positions so the enlarged active state does not push adjacent labels.

## Interaction and Animation

Use one shared highlight element for the desktop list, matching the mobile navigation architecture. On selection, measure the active label and animate the highlight's vertical position, width, and height directly from its current rendered bounds to the new target bounds.

The animation must remain continuous when a user selects another item before the previous transition finishes. It must not introduce an intermediate pinch frame, recreate the highlight, or move the label text horizontally. Reduced-motion users receive immediate placement with no animation.

## Implementation Boundaries

- Reuse the existing `data-serv-nav-highlight` element and services composable.
- Extend highlight geometry to include the vertical axis and height while preserving the existing mobile behavior.
- Isolate desktop and mobile presentation through the current `900px` media boundary.
- Hide `data-serv-nav-num` on desktop rather than removing the number from service data.

## Verification

- Add regression tests for desktop target geometry and direct four-property animation frames.
- Confirm inactive and active desktop styles, hidden numbers, and fixed row geometry.
- Retain the existing mobile navigation tests.
- Run the complete services/stack test suite and a production Nuxt build.
- Verify the desktop interaction locally at `http://localhost:3001/#services`; visual acceptance remains with the user.
