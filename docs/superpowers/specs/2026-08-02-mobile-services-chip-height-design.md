# Mobile Services Chip Height Design

## Goal

Make the competency chips in the mobile Services view visually thinner without changing their width, wrapping, labels, or interaction behavior.

## Approved Change

- Change the mobile chip padding from `7px 9px` to `4px 9px`.
- Apply the change only inside the existing `@media (max-width: 900px)` Services navigation rule.
- Keep the active-chip styling, compact labels, spacing between chips, and two-row wrapping unchanged.
- Keep the desktop Services navigation unchanged.

## Verification

- At a 390px viewport, all seven chips remain visible without horizontal scrolling.
- The chips are visibly thinner and do not overlap.
- Selecting a chip still updates the active state and service counter.
- The production build and existing test suite continue to pass.
