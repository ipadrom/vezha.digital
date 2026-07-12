# VEZHA Digital repository guidance

## Start here

- Read `docs/PROJECT_CONTEXT.md` before changing the landing page layout, animation, scroll behavior, Three.js scenes, or liquid negative effect.
- The landing redesign is split between `frontend/pages/index.vue`, `frontend/components/landing/`, `frontend/composables/landing/`, and `frontend/assets/css/landing-redesign.css`. Keep edits inside the owning module and avoid unrelated refactors.
- Treat the working tree as user-owned. Preserve existing uncommitted changes and never revert files you did not change.
- Do not commit, create branches, or push unless the user explicitly asks for that Git action.

## Frontend workflow

- The frontend is Nuxt 3 / Vue 3 / TypeScript in `frontend/`.
- The expected local URL is `http://127.0.0.1:3009/`.
- Before starting or restarting anything, check whether port `3009` already serves the app. If it does, keep that process and rely on Nuxt HMR for ordinary edits.
- Restart only when the server is absent, stale, or broken:

  ```powershell
  .\restart-frontend.cmd
  ```

- The restart command keeps exactly one listener on port `3009`, waits for HTTP readiness, and stores logs in `%TEMP%\vezha-digital\`.
- Do not launch extra dev servers on new ports. Do not use Docker for frontend-only work.
- Do not delete `.nuxt` during routine development. Avoid `npm run build` while the dev server is using the same `.nuxt` directory; stop the dev server first if a production build is genuinely required.
- Visual QA is user-owned. Do not open the site in a browser, take screenshots, or perform visual inspection unless the user explicitly asks for it. Validate source, TypeScript, builds, HTTP/SSR, and dev logs instead.

## Landing behavior that must be preserved

- The site uses normal document scrolling. Do not reintroduce global snap scrolling.
- The Stack section has a local wheel interaction that advances its categories only near the intended aligned position. It must remain escapable in both scroll directions.
- The moving liquid shape is a composited negative effect, not a plain dark overlay. It uses purple, cyan, black, and white inversion and travels between section targets.
- The negative compositor clones page content. Broad DOM queries may see both the real page and a negative-world clone; scope selectors to the original section when counting or interacting with elements.
- The About section contains the animated business-to-product signal flow.
- The Stack section contains a rotating layered Three.js sphere and technology labels/logos.
- The Clients section contains an isometric Three.js cube assembly tied to the selected client segment.
- The footer contains a click-controlled VEZHA runner game.
- Light and dark themes must both be checked after changes involving filters, blend modes, opacity, canvas, or cloned content.

## Verification

- Prefer HMR and confirm the existing page at `http://127.0.0.1:3009/` still returns a healthy response.
- Check TypeScript, production builds when proportional, dev-server logs, and framework errors without opening the rendered page.
- Leave desktop and mobile visual review to the user unless they explicitly delegate it.
- Run `git diff --check` before handing off changes.
- Preserve UTF-8 Russian copy. Do not perform bulk encoding rewrites.
