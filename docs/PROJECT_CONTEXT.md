# VEZHA Digital project context

Last updated: 2026-07-12

## Product

VEZHA Digital is a Russian-language web studio landing page. The current branch of work is a highly interactive redesign with a restrained monochrome editorial layout, technical typography, thin grid lines, and a small purple/cyan accent system. The page should feel precise and engineered rather than like a generic agency template.

The current focus is the public frontend. A FastAPI-oriented backend exists in `backend/`, but frontend redesign work should not modify it unless the user explicitly requests backend or API changes.

## Main technology

- Nuxt 3.12 and Vue 3
- TypeScript
- Tailwind module plus page-local CSS
- Three.js for the Stack sphere and Clients cube assembly
- `@nuxtjs/color-mode` for light/dark modes
- `@nuxtjs/i18n`, default locale `ru`
- API data through `frontend/composables/useApi.ts`, with static fallback data inside the landing page

## Important files

- `frontend/pages/index.vue`: landing-page orchestration, content fallbacks, shared scroll state, and lifecycle integration.
- `frontend/components/landing/`: the eight active landing sections.
- `frontend/composables/landing/`: liquid compositor, Stack sphere, Clients cube, and footer runner mechanics.
- `frontend/assets/css/landing-redesign.css`: landing layout, responsive rules, and animation styling.
- `frontend/assets/css/main.css`: shared frontend styles.
- `frontend/nuxt.config.ts`: Nuxt modules, runtime API URL, metadata, locale, and color-mode settings.
- `frontend/composables/useApi.ts`: public content API access.
- `frontend/utils/interfaces/`: API-facing TypeScript interfaces.
- `restart-frontend.cmd`: one-command Windows frontend restart.
- `scripts/restart-frontend.ps1`: restart implementation and health check.

Keep small visual requests inside the owning landing component or stylesheet. Do not move behavior back into `index.vue`; the active liquid, Three.js, and footer-game lifecycles belong to their focused composables.

## Page order and interactions

1. Hero
   - Large three-line value proposition.
   - Hero-local liquid negative shape with pointer physics and autonomous movement.
   - CTA, stack link, metadata capsules, and a marquee directly below the hero.

2. About (`#about`)
   - VEZHA identity, compact team positioning, metrics, and principles.
   - Animated horizontal flow: changing business -> VEZHA Digital -> UX/UI, Coding, Support, Design -> changing product.
   - The flow runs as a staged signal cycle; avoid creating multiple simultaneous pulses.

3. Stack (`#stack`)
   - Frontend, Backend, DevOps, and Mobile categories.
   - A local wheel lock advances categories only when the section is aligned enough to be intentionally engaged.
   - Rotating layered Three.js sphere: outer shell, core, bridges, and technology labels.
   - Technology labels on the frontend shell include React, Vue, Next.js, TypeScript, and Tailwind logos.

4. Services (`#services`)
   - Seven service categories with a left navigation and changing stage content.
   - Uses API data when available and local fallback content otherwise.

5. Clients (`#clients`)
   - Three capsules: private clients, small/medium business, and corporations.
   - Only the eyebrow/title/body content should change; the section height and surrounding layout must remain stable.
   - The isometric cube assembly adds cubes one by one and represents increasing business scale.

6. Stages (`#stages`)
   - Work stages and durations, backed by API data with local fallback content.

7. Contacts (`#contacts`)
   - Large centered project CTA and contact actions.

8. Footer
   - VEZHA sign-off and repository/business metadata.
   - Click-controlled runner game inspired by Chrome Dino, with letters from VEZHA as obstacles.

## Liquid negative system

There are two related layers:

- A hero-local negative plane, driven by `heroFxState`.
- A page-level traveling liquid shape, driven by `sectionLiquidState` and section targets.

The visual is produced by cloning page content into a negative world and revealing the clone through a liquid mask. It must preserve alignment with the original content while scrolling. A black blob with no inverted content is a regression, as is duplicated or vertically drifting text.

When debugging this system:

- Confirm whether a selector hit the real element or the negative clone.
- Keep scroll coordinates and viewport coordinates in one coordinate system.
- Check both themes because ancestor filters can alter the liquid colors.
- Avoid forcing the shape to recenter every frame; that has caused visible snapping in previous iterations.
- The shape should choose an appropriate nearby section target instead of hanging between sections.

## Scrolling rules

- The overall site uses ordinary scrolling.
- Do not add CSS scroll snap to the full document.
- The Stack category interaction is the only intentional local scroll interception.
- It must start late enough that the section is visibly aligned, consume only the wheel movement needed for category changes, and release at both ends so the user can continue through the page.
- Scroll listeners share animation-frame scheduling. Avoid adding independent heavy handlers when the existing scheduler can be extended.

## Development commands

From the repository root:

```powershell
.\restart-frontend.cmd
```

Use this only if `http://127.0.0.1:3009/` is not already healthy. Nuxt HMR should handle normal source edits without a restart.

Direct frontend commands, when specifically needed:

```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 3009
npm run build
```

Do not run the direct dev command if the root restart command already has a listener on `3009`. Do not run `npm run build` concurrently with the live dev server because both use `.nuxt`.

Temporary dev logs from the restart command:

```text
%TEMP%\vezha-digital\frontend-3009.out.log
%TEMP%\vezha-digital\frontend-3009.err.log
```

## Working agreement

- Keep edits limited to the user-visible request.
- Inspect the existing implementation before changing motion or layout; several effects depend on shared DOM clones and requestAnimationFrame state.
- Preserve the user's dirty worktree and never reset unrelated changes.
- Do not use Docker for frontend iteration.
- Do not create extra local servers or change ports just to test.
- Do not commit or push unless explicitly asked.
- Use the existing icon and visual language instead of introducing unrelated decoration.
- Prefer proven Three.js primitives and cleanup all scenes/listeners on unmount.
- Visual QA belongs to the user unless they explicitly request agent-side inspection. Use source checks, TypeScript, builds, HTTP/SSR, and dev logs for technical verification.

## Git snapshot note

At the time this context was written, the active branch was `redesign_ceo`. Branch state is not a permanent rule: always run `git branch --show-current` and `git status --short --branch` before any requested Git action.
