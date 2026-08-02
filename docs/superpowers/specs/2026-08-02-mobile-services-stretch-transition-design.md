# Mobile Services Stretch Transition Design

## Goal

Make the mobile Services navigation feel continuous: keep the counter directly above the chip row and stretch one shared active fill from the previous chip to the next before it contracts into the new selection.

## Scope

- Apply only at `max-width: 900px`.
- Keep the desktop Services navigation, counter placement, and interaction unchanged.
- Keep the existing seven compact mobile labels, `11px` type, full-width distribution, active fill color, and gradient active text.

## Counter Placement

- Keep the counter above the chip row and aligned to the left edge.
- Reduce the mobile Services header-to-navigation gap so the counter reads as the line immediately above the chips.
- Use an `8px` gap between the counter/header block and the chip row.
- Preserve the existing `24px` space between the chip row and the phone or laptop scene.

## Stretch Transition

- Render one shared active-fill element behind the mobile buttons.
- On the first render, place the fill under the active button without animation.
- On selection changes, animate through three geometry states:
  1. The current visible fill bounds.
  2. A bridge spanning the full distance from the current fill edge to the target chip edge.
  3. The target chip bounds.
- Use a `620ms` `cubic-bezier(0.22, 1, 0.36, 1)` transition.
- Update the counter, active gradient label, service panel, and device at the start of the transition.
- Support both manual selection and the existing autoplay.
- If another selection occurs mid-transition, freeze the fill at its current visible bounds before starting the next stretch so it does not jump.

## Responsive and Motion Behavior

- Recalculate button and navigation bounds after resize.
- Keep the fill behind labels and above the Services background.
- Use the existing dark blue-gray active color `#33434b`.
- Under `prefers-reduced-motion: reduce`, move the fill immediately with no stretch animation.

## Verification

- The mobile counter is visually grouped with the chip row and remains above it.
- A transition between non-adjacent chips visibly stretches across the intermediate distance and contracts into the target.
- Rapid repeated selections do not make the fill jump to a stale chip position.
- Manual selection and autoplay update the same shared fill.
- All seven buttons remain usable and retain correct `aria-pressed` state.
- Desktop behavior is unchanged.
