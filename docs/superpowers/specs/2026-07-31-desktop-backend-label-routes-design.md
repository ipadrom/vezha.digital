# Desktop Backend Label Routes

## Goal

Apply the existing desktop Frontend label-route behavior to the smaller Backend sphere without changing the Frontend or mobile animations.

## Design

- Backend uses the same traversal timing, deterministic vertical jitter, and fade curve as Frontend.
- Its route radius is scaled to `0.5` of the Frontend geometry: radius `1.62` becomes `0.81`.
- Backend uses dedicated latitude heights `[0.58, 0.16, -0.16, -0.58]`. The outer routes sit closer to the sphere poles, increasing vertical separation between neighboring routes.
- Backend labels continue moving at a constant horizontal speed while fading. They are fully invisible when they reach the right edge, then move to the next latitude while hidden.
- The fourth latitude wraps to the first latitude.
- The route profile is selected from the active stack layer; Frontend keeps its existing unscaled profile.
- Backend label projection is evaluated in two passes. The first pass calculates the projected position and measured label width; the second pass applies visibility.
- Before an entering Backend label appears, it checks every visible label on the same route. It stays hidden until the horizontal clearance between label edges reaches `14px`, then fades in smoothly over the following `24px`.
- Collision gating affects only an entering label. A label already traveling ahead on the route keeps its normal opacity and motion.

## Implementation Boundary

The route-state utility accepts a desktop route profile or scale. The Three.js label projection supplies the Backend profile for `core` labels and the default profile for other layers. A pure collision-clearance helper calculates the additional opacity multiplier from projected label centers and widths. No sphere mesh, camera, mobile orbit, or content changes are included.

## Verification

- A unit test proves that Backend uses radius scale `0.5` and the dedicated lane heights while opacity, progress, and lane transitions remain identical.
- Unit tests prove that an entering label is hidden below `14px` clearance, fades smoothly through the next `24px`, and becomes fully visible after `38px`.
- Existing desktop route tests continue to pass.
- The production build succeeds.
- Desktop browser QA confirms Backend labels follow the smaller sphere, the outer routes sit near the poles, overlapping labels do not render simultaneously, and labels fade fully before the right edge.
