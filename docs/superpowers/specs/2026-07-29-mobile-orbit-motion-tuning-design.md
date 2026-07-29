# Mobile orbit motion tuning

## Goal

Calm the compact Mobile visualization after production review. The orbit
system feels nearly stationary, while its technology labels move slowly enough
to remain easy to follow.

## Compact Mobile behavior

This refinement applies only while Mobile is active at viewport widths up to
`900px`.

- Set the inner core group scale to exactly `0.5`.
- Keep the outer surface shell fully transparent.
- Keep the two intersecting orbit paths and their current geometry.
- Keep `React Native` and `Flutter` on the larger path.
- Keep `Expo` and `PWA` on the smaller path.
- Increase the larger path duration from `14s` to `32s`.
- Increase the smaller path duration from `10s` to `24s`.
- Preserve the existing opposite travel directions.

## System motion

Remove continuous accumulated rotation from the compact Mobile system. The
root system may retain only a very small, slow tilt drift:

- X tilt amplitude: `0.012`, with a cycle of approximately `126s`.
- Y tilt amplitude: `0.01`, with a cycle of approximately `157s`.
- Z tilt amplitude: `0.008`, with a cycle of approximately `180s`.

The orbit paths therefore remain almost stationary on screen. Motion is
communicated primarily by the labels traveling along their paths.

## Protected behavior

- Desktop Mobile keeps its current single orbit, speed, pulse, core scale, and
  system rotation.
- Frontend, Backend, and DevOps remain unchanged at every viewport width.
- Label depth scaling and opacity remain unchanged.
- Orbit contrast, layout, copy, autoplay, and stack interactions remain
  unchanged.
- With `prefers-reduced-motion: reduce`, the compact Mobile system stays fully
  static.

## Implementation boundaries

Update the deterministic duration and compact core-scale values in
`frontend/utils/landingStackOrbit.ts`.

Apply the compact-only root drift in
`frontend/composables/landing/useLandingStackSphere.ts`. The existing desktop
root animation remains the fallback for every state outside compact Mobile.

Update the existing model tests before implementation. No new packages,
assets, content fields, CSS rules, or API changes are required.

## Acceptance criteria

- Compact Mobile core scale equals `0.5`.
- The larger label path completes one loop in `32s`.
- The smaller label path completes one loop in `24s`.
- The labels continue traveling in opposite directions.
- The compact orbit planes do not continuously rotate.
- The compact system has only barely visible slow tilt drift.
- Desktop Mobile and all non-Mobile states retain their current behavior.
- Reduced-motion mode remains static.
- Unit tests and the production build pass before pushing.
- After verification, push the change directly to `origin/main` as authorized
  by the user.
