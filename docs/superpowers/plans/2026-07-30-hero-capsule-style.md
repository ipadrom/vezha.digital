# Hero Capsule Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the four landing-page hero statistic capsules use the same compact visual and text tokens as the technology capsules in the stack section.

**Architecture:** Keep the existing Vue markup and layout selectors. Consolidate only the shared capsule presentation into one grouped CSS selector in `pages/index.vue`, while retaining hero-only flex alignment and responsive grid rules.

**Tech Stack:** Nuxt 3, Vue 3, CSS, Node.js built-in test runner, Browser plugin.

## Global Constraints

- Keep the existing hero content, order, grid, reveal animation, and responsive breakpoints.
- Do not change the larger interactive client-segment capsules.
- Do not add dependencies or create a reusable Vue component.
- Run the isolated app on port 3002.

---

### Task 1: Share compact capsule style tokens

**Files:**
- Create: `frontend/tests/landingHeroCapsules.test.mjs`
- Modify: `frontend/pages/index.vue:3827-3854`
- Modify: `frontend/pages/index.vue:4475-4486`
- Modify: `frontend/pages/index.vue:5084-5092`

**Interfaces:**
- Consumes: Existing selectors `.vz-hero__stats span` and `.vz-stack-item span:not([data-dot], [data-halo])`.
- Produces: One grouped CSS rule that is the source of truth for compact capsule padding, border, radius, text color, font family, font size, letter spacing, and casing.

- [ ] **Step 1: Write the failing style-contract test**

Create `frontend/tests/landingHeroCapsules.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const landingPage = readFileSync(
  new URL("../pages/index.vue", import.meta.url),
  "utf8",
);

const sharedRule = landingPage.match(
  /\.vz-stack-item span:not\(\[data-dot\], \[data-halo\]\),\s*\.vz-hero__stats span\s*\{([^}]*)\}/,
)?.[1] ?? "";

test("shares compact capsule styling between stack and hero", () => {
  assert.ok(sharedRule, "shared compact capsule rule is missing");

  for (const declaration of [
    "padding: 7px 13px;",
    "border: 1px solid var(--chipbd);",
    "border-radius: 999px;",
    "color: var(--chipink);",
    'font-family: "JetBrains Mono", monospace;',
    "font-size: 12px;",
    "letter-spacing: 0.03em;",
    "text-transform: none;",
  ]) {
    assert.ok(
      sharedRule.includes(declaration),
      `shared compact capsule rule is missing: ${declaration}`,
    );
  }
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --test tests/landingHeroCapsules.test.mjs
```

Expected: FAIL with `shared compact capsule rule is missing`.

- [ ] **Step 3: Consolidate the CSS**

Keep the hero-only alignment rule:

```css
.vz-hero__stats span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

Replace the current stack capsule rule with:

```css
.vz-stack-item span:not([data-dot], [data-halo]),
.vz-hero__stats span {
  padding: 7px 13px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  color: var(--chipink);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: none;
}
```

Remove the mobile-only `.vz-hero__stats span { padding: 0 12px; }` override so the shared compact token remains authoritative at every viewport.

- [ ] **Step 4: Run the style-contract test and verify GREEN**

Run:

```powershell
node --test tests/landingHeroCapsules.test.mjs
```

Expected: PASS, 1 test and 0 failures.

- [ ] **Step 5: Run the production build**

Run:

```powershell
$env:COREPACK_ENABLE_PROJECT_SPEC='0'
$env:NODE_OPTIONS='--max-old-space-size=4096'
corepack yarn build
```

Expected: exit code 0 and `Build complete!`.

- [ ] **Step 6: Start the isolated dev server**

Run:

```powershell
$env:COREPACK_ENABLE_PROJECT_SPEC='0'
corepack yarn dev --port 3002
```

Expected: Nuxt listens on `http://localhost:3002`.

- [ ] **Step 7: Verify the rendered result**

Use the Browser plugin at desktop `1440x900` and mobile `390x844`:

- Confirm the URL and title identify the landing page.
- Confirm meaningful hero content renders with no framework overlay.
- Confirm there are four `.vz-hero__stats span` elements.
- Compare computed `padding`, `borderRadius`, `color`, `fontFamily`, `fontSize`, `letterSpacing`, and `textTransform` with a `.vz-stack-item span:not([data-dot], [data-halo])`.
- Confirm the hero capsules remain centered and unclipped in both viewports.
- Capture desktop and mobile screenshots.
- Check console warnings and errors for relevant application failures.

- [ ] **Step 8: Review and commit**

Run:

```powershell
git diff --check
git status --short
git diff -- frontend/pages/index.vue frontend/tests/landingHeroCapsules.test.mjs
git add -- frontend/pages/index.vue frontend/tests/landingHeroCapsules.test.mjs
git commit -m "style: unify hero statistic capsules"
```

Expected: only the planned stylesheet and test are included in the implementation commit.
