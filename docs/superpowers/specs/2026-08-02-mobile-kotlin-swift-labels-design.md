# Mobile Kotlin and Swift Labels Design

## Goal

Replace the `React Native` technology in the Stack section's Mobile state with two native-platform technologies: `Kotlin` and `Swift`. The final Mobile set is `Kotlin`, `Swift`, `Flutter`, `Expo`, and `PWA` in both desktop and compact viewport modes.

## Orbit Distribution

- Outer orbit: `Kotlin`, `Swift`, and `Flutter`.
- Inner orbit: `Expo` and `PWA`.
- The three outer labels use phases separated by 120 degrees.
- The two inner labels remain opposite each other.

The outer orbit receives the extra label because its longer path gives three labels more projected clearance. Existing collision correction remains responsible for transient screen-space conflicts caused by perspective.

## Data and Rendering

`MOBILE_ORBIT_TECH` remains the single source for animated Mobile labels. Remove the React Native entry and add Kotlin and Swift entries with Simple Icons slugs and their technology colors. The existing sphere composable continues to create DOM labels, icons, anchor spheres, and motion from this array; no new rendering path is introduced.

The RU and EN Mobile technology lists are updated to the same five-item set so the static content and animated scene cannot disagree.

## Motion and Visual Constraints

- Keep current orbit geometry, animation duration, direction, label sizing, anchor styling, and core animation unchanged.
- Keep the existing collision detection and smoothing behavior unchanged.
- Rephase only the outer-orbit labels to obtain equal spacing.
- Preserve the current inner-orbit phase relationship for Expo and PWA.

## Failure Handling

Icons continue to use the existing Simple Icons CDN path. If an icon request fails, the text label still identifies the technology, matching current behavior.

## Verification

- A unit test asserts the exact five-label set and orbit assignment.
- A unit test asserts equal 120-degree spacing for the three outer labels and opposite placement for the two inner labels.
- Existing orbit, collision, viewport, and rotation tests remain green.
- The Nuxt production build succeeds.
- The local development server on port 3001 returns HTTP 200 for visual review.
