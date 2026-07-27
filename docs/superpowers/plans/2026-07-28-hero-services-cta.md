# Hero Services CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero secondary CTA link to the services section with matching RU/EN copy.

**Architecture:** Keep the CTA in `LandingHero.vue`, but rename its copy field to reflect the new destination. Update the shared page copy type and both locale JSON files so runtime data and TypeScript stay aligned.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, JSON localization.

## Global Constraints

- Hero link target is `#services`.
- RU label is `Смотреть услуги`.
- EN label is `View services`.
- The primary contacts CTA, button appearance, and arrow remain unchanged.
- Do not perform browser visual QA; verify source contracts, JSON parsing, and the Nuxt production build.

---

### Task 1: Redirect and rename the hero CTA

**Files:**
- Modify: `frontend/components/landing/LandingHero.vue`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/locales/ru.json`
- Modify: `frontend/locales/en.json`

**Interfaces:**
- Consumes: `copy.hero` from the existing localized page-copy object.
- Produces: `copy.servicesLink: string` rendered as an anchor to `#services`.

- [ ] **Step 1: Run the failing source contract**

Assert that `LandingHero.vue` uses `href="#services"` and `copy.servicesLink`, both locale files contain `servicesLink`, and no source file contains the old `stackLink` key.

Expected: FAIL because the component still uses `href="#stack"` and `stackLink`.

- [ ] **Step 2: Apply the minimal implementation**

Update the component:

```vue
<a class="vz-button-link" href="#services">{{ copy.servicesLink }} <span aria-hidden="true">↓</span></a>
```

Update the component and page-copy TypeScript fields to:

```ts
servicesLink: string;
```

Update the locale values:

```json
"servicesLink": "Смотреть услуги"
```

and:

```json
"servicesLink": "View services"
```

- [ ] **Step 3: Re-run the source contract**

Expected: PASS with no remaining `stackLink` references.

- [ ] **Step 4: Parse localization JSON**

Run `JSON.parse` against `frontend/locales/ru.json` and `frontend/locales/en.json`.

Expected: both files parse successfully.

### Task 2: Verify and publish

**Files:**
- Verify: all four modified frontend files.

**Interfaces:**
- Consumes: completed CTA implementation.
- Produces: buildable and published `main`.

- [ ] **Step 1: Run `git diff --check`**

Expected: exit code `0`.

- [ ] **Step 2: Run `npm run build` from `frontend`**

Expected: Nuxt production build exits with code `0`.

- [ ] **Step 3: Restart localhost**

Restart the workspace Nuxt dev server at `http://127.0.0.1:3000/` and confirm port `3000` is listening.

- [ ] **Step 4: Commit and push**

Commit only the four source files with:

```powershell
git commit -m "feat: link hero CTA to services"
git push origin main
```

- [ ] **Step 5: Verify remote parity**

Confirm `git rev-parse HEAD` matches `git ls-remote origin refs/heads/main`.
