# Mobile stack hemisphere label arcs

## Goal

At viewport widths up to `900px`, keep four technology labels visibly present
over the stack visualization in every active state: Frontend, Backend, DevOps,
and Mobile.

The labels should read as satellites moving across the front of a hemisphere,
following the four horizontal latitude-like arcs shown in the approved sketch.

## Compact visual model

The compact sphere has four independent front-facing lanes. Each lane follows
a shallow horizontal arc across a different height of the visible hemisphere.

- One technology label occupies each lane.
- The four lanes use staggered starting positions.
- Labels travel slowly from left to right.
- Near the right rim, a label becomes slightly smaller and softer before
  passing behind the sphere.
- The lane then hands off seamlessly to a label entering from the left rim.
- The handoff must never leave fewer than four technologies visibly represented.
- Lane paths are implied by the existing wireframe; no additional bright orbit
  lines are introduced.

The four lanes remain inside a safe inset from the compact sphere window so
badges are not clipped by the viewport or by the bottom crop of the sphere.
Their vertical spacing and arc curvature should keep badges from overlapping
one another.

## Technology rotation

Backend, DevOps, and Mobile each have four technologies. Their labels repeat on
the same four lanes after each full pass.

Frontend has five technologies. Four remain visible at a time, while the fifth
waits in the rotation. When a Frontend lane completes a pass, the queued
technology replaces the departing one during the rim handoff. This lets all
five Frontend technologies appear over time without reducing the visible count
below four.

## Motion

The lanes share the same left-to-right direction but use subtly different
durations and phase offsets. The result should feel like an organized satellite
system rather than synchronized rows.

- A full pass should be slow enough for every badge to remain readable.
- Curvature is strongest near the upper lanes and becomes broader toward the
  base of the hemisphere.
- Scale and opacity communicate depth only near the left and right rims.
- In the central front area, labels remain crisp and at their normal compact
  size.
- The sphere itself retains its current nearly stationary compact motion.

The rim transition uses an overlapping handoff or equivalent technique so the
outgoing and incoming representations behave as one continuous lane. There
must be no visible teleport across the sphere.

## State changes

Switching between Frontend, Backend, DevOps, and Mobile immediately supplies
the selected state's technology rotation to the four lanes. Existing stack
selection, autoplay, copy, counter, and transition timing remain unchanged.

The compact Mobile state's two intersecting orbit paths and reduced core remain
part of its background system. Its four technology badges use the same
hemisphere-lane presentation as the other compact states so all four remain
visible.

## Responsive and accessibility behavior

This presentation applies only at viewport widths up to `900px`.

- Desktop label projection and all desktop state visuals remain unchanged.
- The compact visualization must not create horizontal page overflow.
- Labels must remain inside the visible sphere window at narrow phone widths.
- Light and dark themes keep the existing badge treatment and icon accents.
- With `prefers-reduced-motion: reduce`, animation stops and four labels remain
  statically distributed across the four lanes.

## Implementation boundaries

Add deterministic compact lane geometry and timing helpers to
`frontend/utils/landingStackOrbit.ts`.

In `frontend/composables/landing/useLandingStackSphere.ts`, use the compact lane
projection instead of mirrored front/back label selection when the viewport is
at or below `900px`. Preserve the current desktop projection as the fallback.

Adjust compact sphere-window styling in `frontend/pages/index.vue` only if a
small safe-area correction is required to keep all four lanes visible.

No new packages, image assets, content fields, or API changes are required.

## Acceptance criteria

- Frontend, Backend, DevOps, and Mobile each show at least four readable
  technology labels throughout compact animation.
- Four labels occupy four distinct latitude-like arcs across the visible
  hemisphere.
- Labels move slowly from left to right and pass behind the right rim.
- Each right-rim exit is paired with a seamless left-rim entrance.
- No label is clipped by the sphere window or phone viewport.
- Labels do not collide in the central readable area.
- Frontend rotates all five technologies while keeping four visible.
- Backend, DevOps, and Mobile continuously retain their four technologies.
- Compact Mobile keeps its two intersecting background orbit paths and `0.5`
  core scale.
- Reduced-motion mode shows four stable labels without animation.
- Desktop behavior remains unchanged.
- Focused unit tests and the production build pass before publication.

