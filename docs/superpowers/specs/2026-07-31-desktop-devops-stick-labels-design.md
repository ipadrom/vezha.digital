# Desktop DevOps Stick-Attached Labels Design

## Goal

Attach the four desktop DevOps labels to their matching 3D bridge sticks so
each label rotates with its stick instead of following an independent latitude
route.

## Scope

- Apply the change only when the viewport is wider than 900px and DevOps is
  active.
- Keep Frontend, Backend, Mobile, and all mobile DevOps behavior unchanged.
- Preserve the existing bridge geometry, rotation speed, colors, label
  contents, and transition between stack sections.

## Attachment Geometry

Each DevOps technology already defines:

- an inner `anchor` near the core;
- an outer `point` near the surface;
- a mirrored anchor and point on the opposite side.

The desktop attachment point is the linear interpolation:

```text
attachment = anchor + (outerPoint - anchor) * 0.75
```

Docker, Nginx, CI/CD, and Linux each use their own stick. The primary label is
attached to the primary stick and its mirrored copy is attached to the
mirrored stick at the same 75% ratio.

The mobile point remains the existing outer point. A separate
`desktopAttachedPoint` is stored for desktop projection so this feature cannot
change mobile DevOps placement.

## Rendering Behavior

- Desktop DevOps bypasses the latitude-route renderer.
- Its label position is projected from `desktopAttachedPoint` through the same
  `bridgeGroup` that owns the stick geometry.
- Because the stick and attachment point share one 3D group, their screen
  positions remain synchronized throughout rotation.
- Label cards remain screen-facing DOM billboards; they do not rotate their
  text or card plane.
- The existing primary/mirrored depth selection and edge/depth fading remain
  active.
- Desktop DevOps does not apply post-projection collision displacement,
  because moving a card after projection would visually detach it from its
  stick. If browser QA reveals an overlap, the bridge angles must be adjusted
  while preserving the 75% attachment ratio.

## Implementation Boundary

Add a pure bridge-point interpolation helper to the stack orbit utility. The
sphere composable consumes it while constructing DevOps label data and selects
the desktop attachment point only in the desktop DevOps projection path.

The shared desktop latitude renderer remains responsible only for Frontend and
Backend.

## Verification

- Unit-test interpolation at 75%, including a mirrored stick.
- At 1440x900, activate DevOps and verify all four visible label centers stay
  on their projected stick segments during multiple animation frames.
- Confirm no visible label rectangles overlap.
- Confirm Frontend and Backend still use latitude routes.
- Confirm mobile DevOps positions are unchanged at 390x844.
- Confirm no relevant browser console errors and the Nuxt production build
  succeeds.

