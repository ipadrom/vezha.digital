# Desktop Mobile Static Orbits Design

## Scope

This change affects only the desktop (`> 900px`) `Mobile` stack state. Compact Mobile and the Frontend, Backend, and DevOps states retain their current behavior.

## Layers

- Hide the outer Frontend sphere while desktop Mobile is active by setting the Mobile surface target to zero.
- Reduce the desktop Mobile core from its current rendered scale of `1.192` to exactly half, `0.596`.
- Preserve the current core materials, opacity treatment, and internal animation.

## Orbit geometry

- Increase the outer desktop orbit horizontal radius from `1.48` to `1.70`.
- Increase the inner desktop orbit horizontal radius from `1.14` to `1.38`.
- Keep the current vertical radii (`0.92` outer and `0.72` inner) so both paths remain inside the `430×430` WebGL canvas.
- Continue using `getDesktopMobileOrbitPoint` for both line vertices and label positions.

## Motion

- Orbit lines remain stationary in scene space and no longer inherit the rotating sphere root transform.
- Labels continue their existing slow counter-rotating motion along the stationary orbit lines.
- The outer label cycle remains 36 seconds; the inner cycle remains 28 seconds in the opposite direction.
- Existing collision prevention, depth opacity, and rear-label scale remain active.

## Verification

Automated tests cover the desktop-only surface target, exact half-size core scale, longer fitted orbit geometry, and separation between the static orbit root and rotating sphere root. The orbit suite and production build must pass before the local server is restarted on port `3001`.
