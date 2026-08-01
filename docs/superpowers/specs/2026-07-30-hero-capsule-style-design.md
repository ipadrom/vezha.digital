# Hero capsule style design

## Goal

Bring the four non-interactive statistic capsules in the landing-page hero into the same visual system as the compact technology capsules in the stack section.

## Scope

- Keep the existing hero content, order, layout grid, reveal animation, and responsive breakpoints.
- Share the compact capsule presentation between `.vz-hero__stats span` and the existing stack capsule selector.
- Align capsule padding, border, radius, background, text color, font family, font size, letter spacing, line height, and text casing.
- Preserve hero-specific sizing only where its grid needs a consistent minimum height.
- Leave the larger interactive client-segment capsules unchanged.

## Implementation approach

Move the common visual declarations into a grouped selector containing the stack capsules and hero statistic spans. Retain separate selectors for layout-specific rules such as the hero grid and mobile horizontal padding.

This keeps a single CSS source of truth for the compact capsule appearance without introducing a new Vue component or changing unrelated markup.

## Responsive behavior

The hero retains four columns on desktop and two columns below 900px. Capsule text must remain centered, readable, and unclipped in Russian and English at desktop and mobile widths.

## Verification

- Run the existing frontend test suite and production build.
- Start the isolated frontend on port 3002.
- Verify the landing hero at desktop and mobile widths.
- Confirm the page renders without framework overlays or relevant console errors.
- Compare the hero statistic capsules with the compact stack capsules for matching visual tokens.
