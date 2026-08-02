# Mobile Services Chip Menu Design

## Goal

Show all seven service competencies immediately in the mobile Services section while preserving the existing device scene and commercial card.

## Selected design

- Place a wrapping chip menu directly below the service counter and above the device scene.
- Show every service without horizontal scrolling.
- Use compact localized labels: `Mini Apps`, `Боты`, `Веб-сайты`, `Магазины`, `AI`, `Системы`, `Mobile` in Russian and their English equivalents.
- Keep the current active chip dark and keep existing click/autoplay behavior.
- Keep full service titles in the detail panel and desktop navigation.
- Apply the layout only at viewport widths up to 900px.

## Verification

- Both locales contain exactly seven compact navigation labels.
- Mobile browser QA confirms all seven chips render, wrap, and switch the active service.
- Desktop navigation, tests, and production build remain valid.
