# Desktop Backend Label Routes

## Goal

Apply the existing desktop Frontend label-route behavior to the smaller Backend sphere without changing the Frontend or mobile animations.

## Design

- Backend uses the same four latitude routes, traversal timing, deterministic vertical jitter, and fade curve as Frontend.
- Its route geometry is scaled to `0.5` of the Frontend geometry: radius `1.62` becomes `0.81`, and every lane height is halved.
- Backend labels continue moving at a constant horizontal speed while fading. They are fully invisible when they reach the right edge, then move to the next latitude while hidden.
- The fourth latitude wraps to the first latitude.
- The route profile is selected from the active stack layer; Frontend keeps its existing unscaled profile.

## Implementation Boundary

The route-state utility accepts a desktop route profile or scale. The Three.js label projection supplies the Backend profile for `core` labels and the default profile for other layers. No sphere mesh, camera, mobile orbit, or content changes are included.

## Verification

- A unit test proves that Backend coordinates and lane heights are exactly half the Frontend coordinates while opacity, progress, and lane transitions remain identical.
- Existing desktop route tests continue to pass.
- The production build succeeds.
- Desktop browser QA confirms Backend labels follow the smaller sphere and fade fully before the right edge.
