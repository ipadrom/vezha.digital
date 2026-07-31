# Desktop DevOps Stick-Attached Labels Design

## Goal

Attach the four desktop DevOps labels to their matching 3D bridge sticks so
each label rotates with its stick instead of following an independent latitude
route.

## Scope

- Apply the change only when the viewport is wider than 900px and DevOps is
  active.
- Keep Frontend, Backend, Mobile, and all mobile DevOps behavior unchanged.
- Preserve the existing bridge angles, outer endpoints, rotation speed,
  colors, label contents, and transition between stack sections.

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

### Core connection

The inner endpoint of every desktop DevOps stick lies on the radial line from
the sphere center through its outer endpoint. Its local bridge-group radius is
`0.690654`, which corresponds to a world-space radius just inside the visible
core shell while DevOps is active:

```text
innerRadius = (0.66 * 1.104) / 1.055 = 0.690654
```

Here, `0.66` is slightly inside the core shell radius `0.68`, `1.104` is the
active DevOps core-group scale, and `1.055` is the active bridge-group scale.
The small inward overlap prevents antialiasing or the faceted shell from
showing a gap. The 75% label attachment is recalculated from this extended
inner endpoint, so it stays on the stick.

## Desktop Route Distribution

The four desktop DevOps sticks keep their existing angular phases and receive
four separated vertical levels. From top to bottom, the visible routes are:

1. Docker at `y = 0.72`;
2. CI/CD at `y = 0.24`;
3. Nginx at `y = -0.22`;
4. Linux at `y = -0.68`.

Each value above remains the outer endpoint's `y`; the inner endpoint keeps
the existing `spec.y * 0.72` compression. The label remains at the interpolated
75% attachment point, so its projected route follows the stick continuously.

All four sticks continue rotating as one `bridgeGroup`. Their fixed, separated
heights therefore appear as four horizontal curved routes around the sphere,
matching the supplied sketch without introducing an independent label orbit.
The existing angular values remain unchanged to preserve the current spacing
around the sphere and avoid synchronizing all labels on the same side.

## DevOps Material Balance

Keep the core's solid inner fill completely unchanged. While DevOps is active,
match only its wire and point materials to the Frontend shell:

- Frontend shell lines: base opacity `0.22`;
- Frontend shell points: base opacity `0.80`;
- core inner fill: keep the existing base opacity `0.18`;
- core shell wireframe and internal lines: base opacity `0.22`;
- core points: base opacity `0.80`;
- general bridge network: keep base opacity `0.34`;
- DevOps label sticks: raise base opacity from `0.34` to `0.70`.

The wireframe, internal-line, point, and stick changes are DevOps-only
base-opacity overrides layered over the existing active-layer multipliers.
The core fill stays at `0.18` in every layer. The current material behavior
remains unchanged in Frontend, Backend, and Mobile. Only the label sticks
become stronger in DevOps; the surrounding bridge network stays unchanged.

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
- Confirm the visible labels occupy four distinct vertical bands in the order
  Docker, CI/CD, Nginx, Linux from top to bottom.
- Confirm every visible stick reaches slightly inside the core shell without a
  gap and each label remains at 75% of the extended stick.
- Confirm the core fill is visually unchanged, its wireframe matches the
  Frontend shell transparency, and label sticks are stronger than the bridge
  network.
- Confirm no visible label rectangles overlap.
- Confirm Frontend and Backend still use latitude routes.
- Confirm mobile DevOps positions are unchanged at 390x844.
- Confirm no relevant browser console errors and the Nuxt production build
  succeeds.
