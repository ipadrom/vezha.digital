# Mobile DevOps Label Routes Design

## Goal

On viewports up to and including 900px, place the four DevOps labels on four
left-to-right latitude routes across the visible front hemisphere, keeping a
safe gap above the lower visible edge.

## Behavior

- Use four ordered mobile latitudes: `1.35`, `0.99`, `0.63`, and `0.27`.
- Use the outer-sphere geometry scale `1`, matching the visible mobile
  Frontend hemisphere.
- Keep the existing route movement, edge fading, stable pixel jitter, lane
  handoff, and appearance-delay behavior.
- Flatten projected route height so each latitude remains visually horizontal.
- Use label scale `0.92` and jitter scale `0.6`, matching the mobile Frontend
  presentation.
- Keep the lowest latitude at `0.27` to preserve the lower-edge gap.

## Desktop Boundary

Above 900px, DevOps labels remain attached to their matching rotating sticks at
75% from the inner anchor to the outer endpoint. The desktop stick geometry,
route levels, materials, and rotation remain unchanged.

## Verification

- A pure route-profile test verifies exactly four ordered latitudes.
- Route-state checks verify every path lies on the front hemisphere and the
  lowest path retains the `0.27` lower boundary.
- The full stack-orbit suite and Nuxt production build must pass.

