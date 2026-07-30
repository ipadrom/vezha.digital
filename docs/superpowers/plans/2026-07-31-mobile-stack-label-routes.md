# Mobile Stack Label Routes Implementation Plan

**Goal:** Fit four animated latitude routes into the visible mobile Frontend
and Backend spheres and slightly enlarge the mobile Backend core.

## Task 1: Model mobile geometry

- Add failing tests for both mobile route profiles and the mobile-only Backend
  core scale.
- Extend route profiles with optional per-lane radius factors.
- Add the Frontend and Backend mobile profiles.
- Add a mobile viewport override for the active Backend core scale.

## Task 2: Render mobile latitude routes

- Extract the shared latitude projection/render pass from the desktop branch.
- Use the mobile Frontend profile when the active mobile layer is Frontend.
- Use the mobile Backend profile when the active mobile layer is Backend.
- Apply paused-entry collision handling to both mobile route sets.
- Preserve the existing renderer for DevOps and Mobile.

## Task 3: Verify

- Run the route utility tests and Nuxt production build.
- At 390x844, verify four route bands fit inside the visible sphere window for
  both Frontend and Backend, the Backend core is slightly larger, labels enter
  from the left without intersections, and the console remains clean.

