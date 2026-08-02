# Mobile Services Single-Line Navigation Design

## Goal

Fit all seven mobile Services navigation items into one line while keeping the current service selection behavior.

## Approved Design

- Apply the layout only at `max-width: 900px`.
- Hide service numbers in the mobile navigation.
- Render inactive items as short plain-text controls with no visible border, fill, or shadow.
- Keep the current compact pill shape and solid fill only for the active item.
- Use a dark blue-gray fill matching the section liquid spot instead of black.
- Use the section heading's blue-purple gradient for the active label text.
- Distribute the seven controls across the full available width with `justify-content: space-between`.
- Use `11px` labels so the navigation remains readable while staying on one line.
- Add `24px` of bottom padding below the navigation so the phone or laptop scene does not crowd the controls.
- Keep desktop navigation and service selection logic unchanged.

## Verification

- At 390px, all seven items remain on one line without clipping or horizontal overflow.
- The first and last controls align with the navigation edges, and the controls read as one evenly distributed row.
- The phone or laptop scene starts with a visibly larger gap below the navigation.
- Only the active item has a pill-shaped fill.
- Selecting `Веб-сайты` activates that item and updates the counter to `03 / 07`.
- Desktop continues to show full service labels and the existing vertical navigation.
