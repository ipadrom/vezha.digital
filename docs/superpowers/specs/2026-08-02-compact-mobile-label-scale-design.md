# Compact Mobile Label Scale Design

## Goal

Reduce only the technology labels in the Mobile stack state at viewport widths up to 900px.

## Approved behavior

- Compact Mobile labels render at a uniform scale of `0.86`.
- Desktop Mobile labels keep their current scale.
- Backend, Frontend, and DevOps label sizing remains unchanged.
- Label opacity, orbit position, and collision behavior remain unchanged.

## Verification

- The compact Mobile depth-style test expects scale `0.86` at front and back depths.
- The landing stack test suite and production build pass.
