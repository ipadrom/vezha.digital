# Mobile orbit satellites refinement

## Goal

Make the `Mobile` visualization clearer and more spatial on viewports up to
`900px`. Mobile should read as a small satellite system around the product
core, while the existing desktop presentation and the Frontend, Backend, and
DevOps states remain unchanged.

## Mobile visual state

The Mobile state uses two intersecting elliptical orbits instead of one shared
track:

- `React Native` and `Flutter` travel on the larger orbit.
- `Expo` and `PWA` travel on a second, slightly smaller orbit.
- The two orbit planes cross at different angles to create visible depth.
- The orbit paths rotate in opposite directions and complete their loops at
  different speeds: approximately `14s` for the larger orbit and `10s` for the
  smaller orbit.

The labels move independently along their assigned paths rather than being
fixed to a rotating group. Their text remains horizontal and readable
throughout the animation.

Depth is communicated through restrained perspective changes. A label becomes
slightly smaller and less opaque while traveling behind the core, then returns
to full emphasis as it comes forward. Labels must not flip, rotate, or become
unreadable.

## Sphere treatment

Only while Mobile is active on a viewport at or below `900px`:

- The outer surface shell fades to `opacity: 0`.
- The inner core becomes approximately `25–30%` smaller than its current Mobile
  presentation.
- Connection geometry may remain faintly visible so the core still belongs to
  the same system.
- Both orbit paths use stronger contrast than the current single orbit and must
  remain clear in light and dark themes.

The invisible outer shell must not be removed from the scene graph because it
is still needed by the other stack states and their transitions.

## State and responsive boundaries

The refinement is limited to the Mobile state at widths up to `900px`.
Desktop Mobile behavior keeps the existing single-orbit presentation. The
Frontend, Backend, and DevOps states keep their current opacity, scale, labels,
and motion at every width.

The existing stack copy, technology lists, counter, selection behavior,
scroll-driven transitions, autoplay, and section layout do not change.

The orbit system must fit inside the existing visualization window without
horizontal overflow or label clipping.

## Motion accessibility

With `prefers-reduced-motion: reduce`, both orbit paths and all four labels
remain visible in representative static positions. Continuous orbital motion,
depth pulsing, and the traveling highlight stop.

## Implementation boundaries

The orbital geometry, label positions, scale, opacity, and animation belong in
`frontend/composables/landing/useLandingStackSphere.ts`.

Reusable orbit definitions and deterministic position calculations belong in
`frontend/utils/landingStackOrbit.ts` so they can be covered by the existing
unit test.

Mobile-only label styling belongs in `frontend/pages/index.vue`. No new image
assets, packages, content fields, or API changes are required.

## Acceptance criteria

- At widths up to `900px`, selecting Mobile shows two clear intersecting
  orbital paths.
- React Native and Flutter continuously travel on the larger path.
- Expo and PWA continuously travel on the smaller path.
- The paths move in opposite directions at visibly different speeds.
- Labels remain horizontal, readable, and separated during normal motion.
- Front/back depth is visible through subtle label scale and opacity changes.
- The Mobile outer surface shell is fully transparent.
- The Mobile inner core is visibly `25–30%` smaller.
- Desktop Mobile and all non-Mobile states remain visually unchanged.
- Light and dark themes retain sufficient orbit contrast.
- Reduced-motion mode presents the same system as a clear static composition.
- The visualization does not clip or create horizontal page overflow.

## Verification

- Extend the orbit model test for two paths, direction, phase, and stable
  position calculations.
- Run the orbit model unit test.
- Run the production build.
- Confirm the local development page still responds.
- Leave final visual approval to the user, as requested.
