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
- Backend label projection is evaluated in two passes. The first pass calculates the projected position and measured label width; the second pass decides whether an entering label's route clock may advance.
- Before an entering Backend label moves away from the left edge, it checks every label ahead on the same route. Its individual route clock pauses while horizontal edge clearance is at or below `14px`.
- Once clearance exceeds `14px`, the route clock resumes from the same left-edge progress. The existing route fade-in then makes the label appear from the left instead of appearing midway across the sphere.
- Clock pausing affects only the entering label. A label already traveling ahead on the route keeps its normal opacity and motion.

## Implementation Boundary

The route-state utility accepts a desktop route profile or scale. The Three.js label projection supplies the Backend profile for `core` labels and the default profile for other layers. Pure helpers calculate collision clearance and advance, pause, or resume each Backend label's effective route time. No sphere mesh, camera, mobile orbit, or content changes are included.

## Verification

- A unit test proves that Backend uses radius scale `0.5` and the dedicated lane heights while opacity, progress, and lane transitions remain identical.
- Unit tests prove the clearance calculation and prove that a blocked label's effective route time remains fixed, then continues from that same time after the route becomes available.
- Existing desktop route tests continue to pass.
- The production build succeeds.
- Desktop browser QA confirms Backend labels follow the smaller sphere, the outer routes sit near the poles, overlapping labels do not render simultaneously, delayed labels first become visible near the left edge, and labels fade fully before the right edge.
