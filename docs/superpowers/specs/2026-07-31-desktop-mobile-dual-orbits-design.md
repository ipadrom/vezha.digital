# Desktop Mobile Dual Orbits Design

## Scope

This change affects only the desktop (`> 900px`) visual state for the `Mobile` stack item. Frontend, Backend, DevOps, and the compact mobile viewport keep their current behavior.

## Visual structure

The Mobile state uses two thin elliptical 3D orbit paths around the existing core. The paths are rotated onto different planes so the composition reads as an atomic system while remaining part of the current wireframe-sphere language.

- Outer orbit: React Native and Flutter, separated by half a turn.
- Inner orbit: Expo and PWA, separated by half a turn.
- Outer orbit duration: 36 seconds per turn.
- Inner orbit duration: 28 seconds per turn in the opposite direction.
- Motion is linear and continuous. It never jumps to resolve a conflict.
- Labels remain billboarded toward the camera; their cards never rotate away from the viewer.

The two orbit lines may cross as paths, but the technology cards must not overlap at those crossings.

## Depth treatment

Each label derives its visual depth from its projected 3D position.

- On the front half, the label uses full opacity and scale.
- As it moves behind the core, opacity eases toward a dimmed state and scale eases toward approximately `0.84`.
- Both properties change continuously around the sides of the core.
- A rear label remains readable and never disappears solely because of depth.
- Z-index follows projected depth so a front label always renders over a rear label.

The core and the existing sphere layers retain their current Mobile-state emphasis.

## Collision prevention

At every animation update, the projected card bounds are checked before applying the next inner-orbit phase. A conflict exists when two visible card rectangles would violate a small screen-space safety gap.

The outer orbit is the timing reference. When the next inner-orbit step would create a conflict, the inner orbit smoothly reduces its phase advance until the required gap is restored, then eases back to its normal 28-second speed. The phase is retained while constrained, so no label teleports or restarts. Labels on the same orbit remain half a turn apart by construction.

Depth shrinking is included in the projected bounds check, so a smaller rear card is measured at its rendered size. Collision prevention applies only while Mobile is active on desktop and resets cleanly when leaving that state.

## Reduced motion

With `prefers-reduced-motion`, both orbits render in a deterministic static composition. All four labels use non-overlapping positions and retain the same front/back depth styling.

## Verification

Automated tests cover:

- technology-to-orbit assignment;
- desktop orbit durations and opposite directions;
- half-turn separation of labels sharing an orbit;
- front/back opacity and scale interpolation;
- projected collision detection from both horizontal directions;
- phase retention while blocked and resumption without a jump;
- isolation of the change to desktop Mobile mode.

Production build verification is required after the tests. Visual acceptance remains with the user on the existing local server at port `3001`.
