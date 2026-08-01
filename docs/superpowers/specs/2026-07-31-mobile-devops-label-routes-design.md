# Mobile DevOps Two-Lane Stick Labels Design

## Goal

Keep every mobile DevOps label attached to its rotating stick while arranging
the four technologies on only two routes inside the visible upper hemisphere.

## Mobile Geometry

- Apply at viewport widths up to and including 900px.
- Use an upper stick level at `y = 0.72` for Docker and Nginx.
- Use a lower stick level at `y = 0.16` for CI/CD and Linux.
- Preserve each technology's existing angle so the two labels on a route begin
  about a quarter-turn apart.
- Normalize every inner endpoint to radius `0.690654`, matching the desktop
  core connection.
- Place each label at 75% from the mobile inner endpoint to the mobile outer
  endpoint.
- Render only the mobile stick geometry on mobile and only the existing
  four-level desktop geometry above 900px.

## Appearance Clearance

When a hidden mobile label is about to appear, compare its projected card box
with already visible cards on the same mobile route. Keep it at opacity zero
until the card edges have the existing 14px minimum gap plus the 24px reveal
distance. The stick continues rotating during the delay; once clearance is
available, the label appears at its current 75% attachment point without a
position jump. Labels on different routes do not block each other.

## Boundaries

Desktop DevOps keeps its four approved stick levels. Frontend and Backend keep
their mobile latitude routes. Mobile-section technologies keep their orbit
system. DevOps sphere geometry, rotation, label scale, and material opacity do
not change.

## Verification

- Test the exact two mobile levels and label-to-route assignments.
- Test the mobile anchor radius and 75% attachment.
- Test same-route clearance blocking and different-route independence.
- Run the full stack-orbit suite and Nuxt production build.

