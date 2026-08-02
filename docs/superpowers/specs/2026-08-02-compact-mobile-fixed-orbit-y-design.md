# Compact Mobile Fixed Orbit Y Design

## Goal

Keep every technology label in the Mobile stack state on the vertical position projected from its orbit, including the compact viewport.

## Current problem

The shared label collision solver changes `layoutY` when compact Mobile labels approach each other. A smoothing pass then animates that correction, which appears as labels jumping up and down.

## Approved behavior

- Mobile labels bypass the shared vertical collision solver at every viewport width.
- Their rendered Y coordinate always remains the orbit-projected Y coordinate.
- Remove Mobile-specific collision-offset state and smoothing because it is no longer used.
- Keep Frontend, Backend, and DevOps vertical layout behavior unchanged.
- Do not replace the removed vertical correction with another collision response.

## Verification

- A unit test covers which visual layer preserves its projected Y position.
- The landing stack test suite passes.
- The production build succeeds and the local preview responds on port 3001.
