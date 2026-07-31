# Mobile DevOps Stick-Attached Labels Design

## Goal

Attach mobile DevOps labels to the same 3D sticks as desktop DevOps so every
label remains synchronized with its stick throughout rotation.

## Behavior

- Apply stick attachment whenever DevOps is active, including widths at and
  below 900px.
- Place each label at 75% from its inner anchor to its outer endpoint.
- Keep the four approved stick levels and their existing lower-edge spacing.
- Project the attachment through `bridgeGroup`, which also owns the stick
  geometry, so label and stick rotate together.
- Keep primary/mirrored depth selection and edge fading.
- Do not apply independent latitude movement or post-projection collision
  displacement to DevOps labels.

## Boundaries

Frontend and Backend continue using their existing mobile latitude routes.
Mobile-section technologies continue using their orbit system. DevOps sphere
geometry, stick geometry, rotation, label scale, and material opacity remain
unchanged.

## Verification

- A pure policy test verifies that DevOps uses stick attachment at mobile,
  boundary, and desktop widths.
- Existing interpolation tests continue to verify the exact 75% point.
- The full stack-orbit suite and Nuxt production build must pass.

