# Desktop stack label routes

## Goal

Replace the irregular desktop Stack label motion with four deterministic
latitude-like routes matching the approved sketch.

## Scope

- Apply only above the existing `900px` desktop breakpoint.
- Keep compact/mobile Stack label behavior unchanged.
- Keep the existing Stack category visuals, copy, scrolling, WebGL geometry,
  label styling, and reduced-motion support.
- Run the isolated development server on port `3001`.

## Motion

The visible hemisphere contains four fixed front-facing latitude routes. Each
active technology label travels left to right along its current route.

- Route endpoints stop short of a full hemisphere.
- A label fades in after entering at the left endpoint.
- A label fades completely out before leaving at the right endpoint.
- Only while opacity is exactly zero does the label reset to the left endpoint
  of the next route below.
- The route sequence is `1 → 2 → 3 → 4 → 1`.
- Each new traversal receives a deterministic vertical offset from `-3px` to
  `3px`. The offset is fixed for that traversal, so the path does not jitter.
- Labels receive evenly distributed phases so they do not all switch routes at
  the same moment.

Frontend may contain five labels while the other states contain four. The
fifth label shares a route at a different phase rather than adding a fifth
route.

## Architecture

Pure route state belongs in `frontend/utils/landingStackOrbit.ts`. A helper
returns the current route, point, opacity, and vertical offset from elapsed
time, label index, and label count.

`frontend/composables/landing/useLandingStackSphere.ts` consumes that state for
desktop label projection. Existing paired front/back points and collision
relayout remain available only to the compact/mobile path.

## Verification

- Unit tests prove route order, left-to-right travel, zero-opacity handoff,
  four-to-one wrapping, deterministic bounded vertical offsets, and evenly
  phased labels.
- The existing orbit tests remain green.
- `nuxt build` succeeds.
- Visual acceptance is performed by the user on the local server at port
  `3001`.

