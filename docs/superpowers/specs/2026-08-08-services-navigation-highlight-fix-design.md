# Services Navigation Highlight Fix

## Scope

Fix the service navigation in the “Что мы делаем” section without changing its content, ordering, autoplay, or responsive layout.

## Required behavior

- Inactive service buttons have no visible border on desktop or mobile.
- The active service has one black pill background with no duplicate outline or fill.
- The pill stays aligned with the active button while entrance animations run and after they finish.
- Mobile compact labels remain on one line and retain their existing spacing.
- Keyboard focus remains visible even though the decorative button borders are removed.

## Root cause

The moving highlight is positioned from `getBoundingClientRect()`. That value includes the temporary transform applied by the section entrance animation. The highlight records the transformed position, marks itself ready, and skips later renders while the active index is unchanged. This leaves it between buttons and creates the apparent double fill on mobile.

## Design

Measure each button from stable layout coordinates (`offsetLeft`, `offsetTop`, `offsetWidth`, and `offsetHeight`) relative to the positioned navigation container. Keep the existing Web Animations transition between those stable rectangles. Make button borders transparent in every responsive state; use a separate focus-visible outline so keyboard accessibility does not depend on the removed decorative border.

## Verification

- A unit test proves layout coordinates are converted into the expected highlight rectangle without transformed viewport geometry.
- CSS contract tests prove inactive and active button borders are transparent on desktop and mobile, while focus-visible remains distinct.
- The existing landing navigation test suite and frontend build pass.
- A local development server is started for user-led visual review.
