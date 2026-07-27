# Services Device Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the “Что мы делаем” scene around a refined laptop/phone pair with meaningful service-specific interfaces and a tighter composition.

**Architecture:** Keep `LandingServices.vue` as the owner of scene markup and keep `useLandingServices.ts` as the only controller for the active index. Add explicit device metadata to each screen, let the controller switch both the active screen and active shell, and implement all visual changes inside the existing section stylesheet without changing the section’s autoplay lifecycle.

**Tech Stack:** Nuxt 3.12, Vue 3.4, TypeScript, CSS.

## Global Constraints

- Preserve the existing seven-service order, autoplay timing, and manual selection behavior.
- Use a phone for Telegram Mini Apps, Telegram bots, and mobile applications.
- Use a laptop for websites, ecommerce, AI/automation, and corporate systems.
- Keep the scene container at a stable height while switching devices.
- Keep the scene at the laptop-state height for every service; center the phone inside that fixed area.
- Animate only `transform` and `opacity`; honor `prefers-reduced-motion`.
- Keep the black-and-white visual system with restrained violet/cyan accents.
- Store every visible screen label, message, button, column title, and status in both RU and EN locale files.
- Do not change the global liquid/blob implementation or other landing sections.
- Do not perform browser visual verification; the user will inspect all states on the running localhost.

---

### Task 1: Add explicit service-to-device scene structure

**Files:**
- Modify: `frontend/components/landing/LandingServices.vue`
- Modify: `frontend/composables/landing/useLandingServices.ts`

**Interfaces:**
- Consumes: `services: LandingService[]`, the existing service order, and `select(index)`.
- Produces: `data-service-device="laptop|phone"`, `data-screen-device="laptop|phone"`, and stable numeric `data-si` values used by the controller.

- [ ] **Step 1: Define the scene metadata in service order**

Replace the string-only screen list with:

```ts
const serviceScenes = [
  { screen: "miniapp", device: "phone" },
  { screen: "bot", device: "phone" },
  { screen: "site", device: "laptop" },
  { screen: "shop", device: "laptop" },
  { screen: "ai", device: "laptop" },
  { screen: "corp", device: "laptop" },
  { screen: "mobile", device: "phone" },
] as const;
```

- [ ] **Step 2: Split the device stage into two stable shells**

Inside `.vz-services__devices`, keep one laptop shell and add one phone shell:

```vue
<div class="vz-service-device vz-service-device--laptop" data-service-device="laptop">
  <div class="vz-macbook" data-macbook>
    <!-- existing lid, screen wrap, base and shadow -->
  </div>
</div>

<div class="vz-service-device vz-service-device--phone" data-service-device="phone">
  <div class="vz-service-phone">
    <div class="vz-service-phone__frame">
      <div class="vz-service-phone__speaker"></div>
      <div class="vz-service-phone__screen">
        <!-- phone scene screens -->
      </div>
    </div>
    <div class="vz-service-phone__shadow"></div>
  </div>
</div>
```

Render laptop scenes only in the laptop screen wrapper and phone scenes only in the phone screen wrapper. Preserve original service indices:

```vue
<div
  v-for="({ screen, device }, index) in serviceScenes"
  v-show="device === 'laptop'"
  :key="`laptop-${screen}`"
  data-screen
  :data-si="index"
  :data-screen-device="device"
  :class="['vz-screen', `vz-screen--${screen}`]"
>
```

Use the equivalent `v-show="device === 'phone'"` loop inside the phone.

- [ ] **Step 3: Switch screens by `data-si`, not DOM order**

Update the screen loop in `render()`:

```ts
screens.forEach((screen) => {
  const index = Number(screen.dataset.si);
  const isActive = index === active;
  screen.style.transform = `translateY(${isActive ? "0" : index < active ? "-12px" : "12px"}) scale(${isActive ? "1" : "0.985"})`;
  screen.style.opacity = isActive ? "1" : "0";
  screen.style.zIndex = isActive ? "3" : "2";
  screen.style.pointerEvents = isActive ? "auto" : "none";
});
```

- [ ] **Step 4: Switch device shells using the same active index**

Add the exact device map and update each shell:

```ts
const deviceByIndex = ["phone", "phone", "laptop", "laptop", "laptop", "laptop", "phone"] as const;
const activeDevice = deviceByIndex[active] ?? "laptop";
const devices = root.querySelectorAll<HTMLElement>("[data-service-device]");

root.dataset.activeServiceDevice = activeDevice;
devices.forEach((device) => {
  const isActive = device.dataset.serviceDevice === activeDevice;
  device.dataset.active = isActive ? "true" : "false";
  device.style.opacity = isActive ? "1" : "0";
  device.style.transform = isActive
    ? "translateY(0) scale(1)"
    : `translateY(${device.dataset.serviceDevice === "phone" ? "18px" : "-12px"}) scale(0.94)`;
  device.style.pointerEvents = isActive ? "auto" : "none";
});
```

- [ ] **Step 5: Preserve the laptop opening animation only for laptop states**

Keep the current lid calculation but apply the visible opacity only when `activeDevice === "laptop"`:

```ts
if (screenWrap) {
  const openOpacity = Math.max(0, Math.min(1, (easedOpen - 0.22) / 0.48));
  screenWrap.style.opacity = activeDevice === "laptop" ? openOpacity.toFixed(3) : "0";
}
```

- [ ] **Step 6: Review the DOM contract without running the browser**

Confirm by source inspection that:

- every service index from `0` through `6` appears exactly once as an active-capable screen;
- the phone indices are `0`, `1`, and `6`;
- the laptop indices are `2`, `3`, `4`, and `5`;
- `data-serv-nav`, `data-serv-panel`, and `data-serv-counter` remain unchanged.

- [ ] **Step 7: Commit the structural change**

```bash
git add frontend/components/landing/LandingServices.vue frontend/composables/landing/useLandingServices.ts
git commit -m "feat: add responsive service device scenes"
```

---

### Task 2: Build meaningful interfaces for all seven services

**Files:**
- Modify: `frontend/components/landing/LandingServices.vue`
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `serviceScenes` and the `.vz-screen--<screen>` class contract from Task 1.
- Produces: complete screen compositions for `miniapp`, `bot`, `site`, `shop`, `ai`, `corp`, and `mobile`.

- [ ] **Step 1: Refine the phone Mini App screen**

Use a compact header, two product cards, price rows, and a dark call-to-action. Keep the selectors under `.vz-screen-miniapp` so they cannot affect other scenes.

- [ ] **Step 2: Refine the phone bot screen**

Use an avatar/header row, alternating message bubbles, two outlined quick-action buttons, and a fixed input row.

- [ ] **Step 3: Rebuild the website screen**

Use a desktop browser bar, oversized editorial heading, accent word, side media block, and two lower content cards. Avoid generic empty rectangles.

- [ ] **Step 4: Rebuild the ecommerce screen**

Use a navigation row, filter chip, three product cards with thumbnail/name/price hierarchy, and a visible cart count.

- [ ] **Step 5: Rebuild the AI screen**

Use a left-to-right processing flow:

```text
ЗАЯВКА → AI АНАЛИЗ → CRM
```

Add a compact status panel with violet/cyan nodes and a dark completed state.

- [ ] **Step 6: Rebuild the corporate systems screen**

Use a narrow sidebar, top status row, three KPI cards, and a table with state pills. The table must be visually more important than the existing decorative bar chart.

- [ ] **Step 7: Rebuild the mobile application screen**

Replace the current code/editor split with a native-looking phone dashboard: greeting, balance/stat card, two action cards, and bottom navigation.

- [ ] **Step 8: Add restrained internal motion**

Apply staggered entrance only to the active screen’s direct content:

```css
.vz-screen[data-active="true"] .vz-ui-enter {
  animation: vz-service-ui-enter 420ms cubic-bezier(.22, 1, .36, 1) both;
}

@keyframes vz-service-ui-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .vz-screen,
  .vz-screen .vz-ui-enter {
    transition: none !important;
    animation: none !important;
  }
}
```

Set `screen.dataset.active` in `render()` alongside its inline opacity so the animation selector has a reliable state.

- [ ] **Step 9: Review all scene markup without browser verification**

Inspect the seven conditional branches and ensure each has:

- a unique visual hierarchy;
- at least one service-specific signal;
- no external product logos;
- no hard-coded copy that conflicts with the selected service.

- [ ] **Step 10: Commit the interface set**

```bash
git add frontend/components/landing/LandingServices.vue frontend/assets/css/landing-redesign.css frontend/composables/landing/useLandingServices.ts
git commit -m "feat: create service-specific device interfaces"
```

---

### Task 3: Tighten the full section composition

**Files:**
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `.vz-service-device`, `.vz-services__devices`, `.vz-service-caption`, and existing navigation selectors.
- Produces: stable desktop/mobile layouts with a fixed device stage and closer caption grouping.

- [ ] **Step 1: Stabilize and enlarge the device area**

Set a single stable stage:

```css
.vz-services__devices {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 370px;
  place-items: center;
  overflow: visible;
}

.vz-service-device {
  grid-area: 1 / 1;
  transition: opacity .38s ease, transform .5s cubic-bezier(.22, 1, .36, 1);
  will-change: opacity, transform;
}

.vz-macbook {
  --sw: clamp(340px, 42vw, 570px);
}

.vz-service-phone {
  width: clamp(190px, 19vw, 264px);
}
```

- [ ] **Step 2: Create the refined phone shell**

Style a thin dark frame, softly rounded screen, small speaker instead of a large notch, and a restrained elliptical shadow. Keep the phone visually equivalent to the laptop’s screen area rather than its physical width.

- [ ] **Step 3: Reduce empty space and tie caption to the scene**

Use:

```css
.vz-services__grid {
  grid-template-columns: minmax(270px, 320px) minmax(0, 1fr);
  gap: clamp(48px, 6vw, 92px);
}

.vz-services__stage {
  gap: 8px;
  min-height: 0;
}

.vz-service-caption {
  max-width: 680px;
  min-height: 220px;
}

.vz-service-panel [data-serv-metawrap] {
  margin-top: 12px;
  padding-top: 18px;
  min-height: 82px;
}
```

- [ ] **Step 4: Improve navigation emphasis**

Keep inactive rows quiet and make the active row deliberate:

```css
.vz-services__nav button[data-active="true"] {
  padding-left: 12px;
  border-bottom-color: var(--ink);
  background: linear-gradient(90deg, rgb(25 26 31 / 4%), transparent 72%);
}
```

Do not change row height, so the list remains stable.

- [ ] **Step 5: Tune the counter placement**

Align the counter with the right scene edge on desktop while keeping it inside `.vz-sec-head`. Do not absolutely position it outside the section container.

- [ ] **Step 6: Add the mobile layout**

At `max-width: 900px`:

- keep the existing horizontally scrollable navigation;
- use a `300px` stable device area;
- cap laptop width at `min(112vw, 430px)`;
- cap phone width at `210px`;
- place caption immediately below the device;
- keep capsules wrapping without horizontal overflow.

- [ ] **Step 7: Source-level regression review**

Without opening the browser, inspect the final diff and confirm:

- no styles outside `.vz-services`, `.vz-service-*`, `.vz-screen-*`, or device selectors changed;
- no autoplay interval or manual pause timing changed;
- the removed hint remains absent;
- no section height depends on which device is active.

- [ ] **Step 8: Hand off visual verification**

Ask the user to inspect on localhost:

1. all seven service states;
2. laptop → phone and phone → laptop transitions;
3. rapid manual switching;
4. desktop and mobile composition;
5. automatic switching while the section is visible.

- [ ] **Step 9: Commit the composition**

```bash
git add frontend/assets/css/landing-redesign.css
git commit -m "style: refine services section composition"
```

---

### Task 4: Localize and deepen the product interfaces

**Files:**
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/components/landing/LandingServices.vue`
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `copy.services.screens` from the active locale.
- Produces: localized screen labels for all seven service scenes and a fixed laptop-height device area.

- [ ] **Step 1: Add the `screens` locale object**

Add matching RU/EN objects for `miniapp`, `bot`, `site`, `shop`, `ai`, `corp`, and `mobile`. Each object contains the exact strings rendered by its navigation, content, controls, and statuses.

- [ ] **Step 2: Extend the landing copy types**

Add `screens: Record<string, Record<string, string>>` to `LandingCopy["services"]` and to `LandingServicesCopy`.

- [ ] **Step 3: Replace hard-coded interface strings**

Read each value from `copy.screens.<screen>.<key>` in `LandingServices.vue`; keep numbers and decorative symbols hard-coded only when they carry no language.

- [ ] **Step 4: Add the second detail layer**

Give every screen visible navigation, primary content, and actions/statuses. Use small but legible controls, table rows, prices, filters, message metadata, and state pills rather than decorative blocks.

- [ ] **Step 5: Lock scene height to the laptop state**

Set `.vz-services__devices` to the laptop-derived fixed height on desktop and mobile. In phone mode, absolutely center the narrow device inside that area; do not let its tall aspect ratio contribute to layout height.

- [ ] **Step 6: Source-level review**

Confirm every visible word inside `.vz-service-ui` comes from `copy.screens`, both locale objects have matching keys, and no active device selector changes `.vz-services__devices` height.

---

### Task 5: Add localized commercial details

**Files:**
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/components/landing/LandingServices.vue`
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `copy.services.commercial[index]`.
- Produces: `price`, `timeline`, and exactly four `included` capsule strings for each service.

- [ ] **Step 1: Add matching RU/EN commercial data**

Add `commercialLabels: { price, timeline, included }` and a seven-entry `commercial` array under `landing.services` in both locale files. Each entry uses:

```ts
type ServiceCommercial = {
  price: string;
  timeline: string;
  included: [string, string, string, string];
};
```

- [ ] **Step 2: Extend copy types**

Add `commercialLabels` and `commercial` to `LandingCopy["services"]` and `LandingServicesCopy`.

- [ ] **Step 3: Render the selected service data**

Inside each `data-serv-panel`, render two equal metric cells after the description, followed by the localized included label and the four included capsules. Replace the existing `service.meta` capsule loop so one capsule group remains.

- [ ] **Step 4: Stabilize the panel**

Give the commercial area a consistent grid, fixed minimum metric height, and a four-capsule wrapping region. Apply the same structure on mobile with smaller type and padding; do not vary panel height by active service.

- [ ] **Step 5: Source-level validation**

Parse both locale JSON files, compare commercial object keys and array lengths, then confirm each `included` tuple has exactly four strings.

---

### Task 6: Fill the desktop menu column with a CTA

**Files:**
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/components/landing/LandingServices.vue`
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `copy.services.asideCta`.
- Produces: a desktop-only link to `#contacts` below the service navigation.

- [ ] **Step 1: Add matching localized CTA copy**

Add `asideCta: { eyebrow, link, note }` under `landing.services` in RU and EN.

- [ ] **Step 2: Extend copy types**

Add the exact `asideCta` object to `LandingCopy["services"]` and `LandingServicesCopy`.

- [ ] **Step 3: Add the CTA after the service navigation**

Render an anchor to `#contacts` with eyebrow, link text, arrow, and note. Keep it independent from the active service.

- [ ] **Step 4: Lock the grid placement**

Place navigation and CTA in desktop column one. Make the stage occupy column two across both grid rows. Hide the CTA at `max-width: 900px`.

- [ ] **Step 5: Validate locale structure**

Parse RU/EN JSON and confirm the `asideCta` keys match.

---

### Task 7: Refine mobile device geometry and screen scaling

**Files:**
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: `data-active-service-device="laptop|phone"`, `.vz-macbook__lid`, `.vz-macbook__screen-wrap`, `.vz-macbook__base`, and `.vz-service-ui`.
- Produces: thinner mobile shells and a compensated inner UI scale that keeps all seven service screens inside the visible display.

- [ ] **Step 1: Run a failing source contract**

Read `landing-redesign.css` and assert that the mobile block contains `--mobile-ui-scale`, a compensated `.vz-service-ui` canvas, and thinner laptop/phone shell overrides. The check must fail before implementation because these rules do not exist.

- [ ] **Step 2: Thin the mobile laptop shell**

Inside `@media (max-width: 900px)`, reduce the lid padding, screen radius, base width/height, and shadow size without changing `--sw` or `.vz-services__devices`.

- [ ] **Step 3: Thin the mobile phone shell**

Inside the same media query, reduce the phone lid padding, screen radius, and speaker dimensions without changing `--phone-w`.

- [ ] **Step 4: Scale the screen UI independently**

Set a mobile `--mobile-ui-scale` for laptop and phone states. Apply it to `.vz-service-ui` with a top-left transform origin and reciprocal width/height so every interface keeps its design proportions while fitting inside the visible screen.

- [ ] **Step 5: Re-run the source contract**

Confirm the new mobile rules exist, remain inside the mobile media query, and do not modify the desktop device dimensions or fixed stage height.

- [ ] **Step 6: Hand off visual verification**

Do not open the browser. Ask the user to inspect laptop and phone states on the existing localhost.
