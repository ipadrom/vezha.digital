# Mobile Stack Label Routes Design

## Goal

Bring the approved left-to-right latitude animation to mobile Frontend and
Backend while fitting all four routes inside the visible upper half of the
sphere.

## Geometry

- Keep the mobile Frontend sphere at its current size.
- Frontend route heights are `[1.35, 0.99, 0.63, 0.27]`.
- Frontend route chords are derived from the sphere radius at each height, so
  the upper routes naturally become shorter.
- Increase only the mobile Backend core scale from `1.4` to `1.52`.
- Backend route heights are `[0.98, 0.72, 0.46, 0.20]`.
- Backend route chords are derived from a route radius of `1.0044`.

At a 390px viewport this places Frontend label centers at approximately
53/95/137/179px and Backend centers at approximately 96/126/157/187px inside
the 421px sphere host. The visible window ends around 211px, leaving a small
bottom margin after label height and jitter.

## Motion

- Reuse the existing 18-second route traversal, lane wrapping, deterministic
  vertical jitter, and endpoint fades.
- Render only the primary copy while Frontend or Backend mobile routes are
  active.
- Use the existing projected-width clearance check and per-label paused clock
  on mobile too, so a blocked label waits at the left edge and never appears
  midway through a route.
- Leave desktop geometry, DevOps mobile behavior, and Mobile-technology orbit
  behavior unchanged.
