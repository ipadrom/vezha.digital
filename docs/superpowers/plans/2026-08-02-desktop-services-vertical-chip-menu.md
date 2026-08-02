# Desktop Services Vertical Chip Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the desktop numbered services list with a stable vertical text menu whose active item uses a larger animated dark chip.

**Architecture:** Extend the existing shared service-highlight geometry from horizontal bounds to a full rectangle, then reuse the same highlight element for desktop and mobile. Desktop CSS owns the vertical visual treatment behind the existing `900px` breakpoint; selection state and service content remain unchanged.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, CSS, Web Animations API, Node test runner, esbuild.

## Global Constraints

- Apply only above the existing `900px` desktop breakpoint; keep mobile navigation behavior unchanged.
- Remove service numbers only from the desktop presentation; keep service data and the `01 / 07` counter intact.
- Keep row positions fixed while enlarging the active label.
- Use one shared `data-serv-nav-highlight` element and direct start-to-target animation with reduced-motion support.
- Do not change autoplay, service panels, device scenes, content, or locale data.

---

### Task 1: Full highlight geometry

**Files:**
- Modify: `frontend/utils/landingServicesHighlight.ts`
- Modify: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: measured navigation element rectangles relative to the navigation list.
- Produces: `ServiceHighlightBounds` with `x`, `y`, `width`, and `height`; `getServiceHighlightTargetBounds(bounds, horizontalPadding, verticalPadding)`; `getServiceHighlightFrames(from, to)` returning direct rectangle endpoints.

- [ ] **Step 1: Write failing geometry tests**

Add literal expectations for vertical padding and direct four-property frames:

```ts
assert.deepEqual(
  getServiceHighlightTargetBounds({ x: 20, y: 30, width: 80, height: 18 }, 16, 7),
  { x: 4, y: 23, width: 112, height: 32 },
);

assert.deepEqual(
  getServiceHighlightFrames(
    { x: 4, y: 23, width: 112, height: 32 },
    { x: 4, y: 71, width: 96, height: 32 },
  ),
  [
    { x: 4, y: 23, width: 112, height: 32 },
    { x: 4, y: 71, width: 96, height: 32 },
  ],
);
```

- [ ] **Step 2: Run the focused tests and verify RED**

Bundle and run:

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs\landingStackOrbit.test.mjs
node --test --test-name-pattern="service highlight rectangle" .codex-logs\landingStackOrbit.test.mjs
```

Expected: FAIL because the current type and helpers contain only `x` and `width`.

- [ ] **Step 3: Implement rectangle geometry**

Extend the bounds type and helpers:

```ts
export type ServiceHighlightBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getServiceHighlightTargetBounds(
  bounds: ServiceHighlightBounds,
  horizontalPadding = 7,
  verticalPadding = 0,
): ServiceHighlightBounds {
  return {
    x: bounds.x - horizontalPadding,
    y: bounds.y - verticalPadding,
    width: bounds.width + horizontalPadding * 2,
    height: bounds.height + verticalPadding * 2,
  };
}
```

Keep `getServiceHighlightFrames` as `[from, to]` with the extended rectangles.

- [ ] **Step 4: Rebundle and verify GREEN**

Run the same focused commands. Expected: the rectangle tests pass.

- [ ] **Step 5: Commit the geometry change**

```powershell
git add -- frontend/utils/landingServicesHighlight.ts frontend/tests/landingStackOrbit.test.ts
git commit -m "refactor: extend service highlight geometry"
```

### Task 2: Desktop vertical chip behavior and styling

**Files:**
- Modify: `frontend/composables/landing/useLandingServices.ts`
- Modify: `frontend/assets/css/landing-redesign.css`
- Modify: `frontend/tests/landingStackOrbit.test.ts`

**Interfaces:**
- Consumes: the rectangle geometry from Task 1 and existing `data-serv-nav`, `data-serv-nav-label`, and `data-serv-nav-highlight` elements.
- Produces: a desktop highlight measured from `.vz-services__nav-label-full`, plus unchanged mobile highlighting measured from the existing compact buttons.

- [ ] **Step 1: Write failing desktop behavior and CSS tests**

Add assertions that require desktop label targeting, four animated properties, hidden desktop numbers, visible shared highlight, fixed rows, and active gradient text:

```ts
assert.match(servicesComposable, /querySelector<HTMLElement>\("\.vz-services__nav-label-full"\)/);
assert.match(servicesComposable, /verticalPadding/);
assert.match(servicesComposable, /height:\s*`\$\{frame\.height\}px`/);
assert.match(servicesComposable, /translate3d\(\$\{frame\.x\}px, \$\{frame\.y\}px, 0\)/);
assert.match(desktopCss, /\[data-serv-nav-num\]\s*\{[^}]*display:\s*none/);
assert.match(desktopCss, /grid-auto-rows:\s*48px/);
assert.match(desktopCss, /\.vz-services__nav-highlight\s*\{[^}]*background:\s*#33434b/);
assert.match(desktopCss, /button\[data-active="true"\] \[data-serv-nav-label\]\s*\{[^}]*font-size:\s*18px/);
```

The test must also retain the existing mobile single-line and gradient assertions.

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
.\node_modules\.bin\esbuild.cmd tests\landingStackOrbit.test.ts --bundle --platform=node --format=esm --outfile=.codex-logs\landingStackOrbit.test.mjs
node --test --test-name-pattern="desktop service chip" .codex-logs\landingStackOrbit.test.mjs
```

Expected: FAIL because desktop currently disables the shared highlight and shows numbered divided rows.

- [ ] **Step 3: Enable full-rectangle placement and animation**

Change relative measurement and placement to include both axes:

```ts
return {
  x: elementRect.left - navRect.left,
  y: elementRect.top - navRect.top,
  width: elementRect.width,
  height: elementRect.height,
};
```

For desktop, measure `.vz-services__nav-label-full` and call `getServiceHighlightTargetBounds(bounds, 16, 7)`. For mobile, retain the button target and call `getServiceHighlightTargetBounds(bounds, 7, 0)`. Animate `transform`, `width`, and `height` directly between the current and target rectangles. Keep immediate placement for first render and reduced motion.

- [ ] **Step 4: Implement isolated desktop CSS**

Use fixed `48px` rows, hide `[data-serv-nav-num]`, remove dividers, position buttons and the highlight in stable layers, set inactive labels to `16px`, and set the active label to `18px` with the existing gradient. Keep the dark chip at `#33434b`. Preserve the existing `@media (max-width: 900px)` mobile declarations as the final mobile override.

- [ ] **Step 5: Rebundle and verify focused GREEN**

Run the focused commands from Step 2. Expected: the desktop chip test passes and the existing mobile assertions remain green.

- [ ] **Step 6: Run complete automated verification**

```powershell
node --test .codex-logs\landingStackOrbit.test.mjs
node --test tests\landingHeroCapsules.test.mjs
npm run build
```

Expected: 55 stack/services tests pass, 3 hero tests pass, and the Nuxt production build exits `0`.

- [ ] **Step 7: Verify rendered desktop behavior**

Restart the verified Nitro server on port `3001`, open `http://localhost:3001/#services` at a desktop viewport, and confirm:

- numbers are absent from the vertical menu;
- inactive labels do not move when selection changes;
- the active chip moves vertically and resizes without a pinch or flash;
- the active gradient text remains centered inside the chip;
- the mobile viewport retains the existing one-line navigation.

- [ ] **Step 8: Commit the desktop menu**

```powershell
git add -- frontend/composables/landing/useLandingServices.ts frontend/assets/css/landing-redesign.css frontend/tests/landingStackOrbit.test.ts
git commit -m "feat: add desktop services chip menu"
```
