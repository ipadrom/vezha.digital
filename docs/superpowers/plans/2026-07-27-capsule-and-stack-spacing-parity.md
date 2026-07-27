# Capsule And Stack Spacing Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match desktop service capsules to Stack capsules and increase mobile Stack dot spacing without changing section height.

**Architecture:** Keep both changes in the existing responsive CSS cascade. Desktop capsule parity is handled by the existing service-commercial selector; mobile dot spacing is added to the existing mobile `.vz-stack__timeline` rule so desktop scroll-lock behavior remains untouched.

**Tech Stack:** Nuxt 3, Vue 3, CSS.

## Global Constraints

- Desktop service capsules use `padding: 7px 13px` and `font-size: 12px`.
- Mobile service and Stack capsules remain `padding: 5px 10px` and `font-size: 11px`.
- Mobile Stack timeline uses `row-gap: 12px`.
- `.vz-stack__mobile-layout` remains `min-height: 218px`.
- Do not perform browser visual QA; verify source contracts and the Nuxt production build.

---

### Task 1: Match desktop service capsules

**Files:**
- Modify: `frontend/assets/css/landing-redesign.css`

**Interfaces:**
- Consumes: desktop capsule values from `.vz-stack-item span:not([data-dot], [data-halo])`.
- Produces: identical desktop padding and font size for service inclusion capsules.

- [ ] **Step 1: Run the failing source contract**

Run a PowerShell assertion that expects `.vz-service-panel .vz-service-commercial__included [data-serv-metawrap] span` to contain `padding: 7px 13px` and `font-size: 12px`.

Expected: FAIL because the current rule uses `6px 11px` and `10px`.

- [ ] **Step 2: Apply the minimal CSS change**

Change only the desktop service capsule rule:

```css
.vz-service-panel .vz-service-commercial__included [data-serv-metawrap] span {
  min-height: 29px;
  padding: 7px 13px;
  font-size: 12px;
}
```

- [ ] **Step 3: Re-run the source contract**

Expected: PASS while the mobile override remains `5px 10px` and `11px`.

### Task 2: Increase mobile Stack dot spacing

**Files:**
- Modify: `frontend/pages/index.vue`

**Interfaces:**
- Consumes: existing mobile `.vz-stack__timeline` and `.vz-stack__mobile-layout`.
- Produces: a `12px` vertical gap without changing the mobile layout minimum height.

- [ ] **Step 1: Run the failing source contract**

Run a PowerShell assertion that expects the mobile `.vz-stack__timeline` rule to contain `display: grid` and `row-gap: 12px`, while `.vz-stack__mobile-layout` still contains `min-height: 218px`.

Expected: FAIL because the timeline currently has no explicit grid gap.

- [ ] **Step 2: Apply the minimal CSS change**

Update only the mobile rule:

```css
.vz-stack__timeline {
  grid-column: 1;
  display: grid;
  row-gap: 12px;
  max-width: none;
}
```

- [ ] **Step 3: Re-run the source contract**

Expected: PASS and no desktop timeline selector changes.

### Task 3: Verify and publish

**Files:**
- Verify: `frontend/assets/css/landing-redesign.css`
- Verify: `frontend/pages/index.vue`

**Interfaces:**
- Consumes: the two completed CSS changes.
- Produces: a buildable commit on `main`.

- [ ] **Step 1: Run formatting checks**

Run:

```powershell
git diff --check
```

Expected: exit code `0`.

- [ ] **Step 2: Run the production build**

Run:

```powershell
npm run build
```

from `frontend`.

Expected: Nuxt build exits with code `0`.

- [ ] **Step 3: Restart localhost**

Restart the workspace Nuxt dev process on `http://127.0.0.1:3000/` and confirm port `3000` is listening.

- [ ] **Step 4: Commit and push**

Stage only the two source files and commit:

```powershell
git commit -m "style: align service capsules and stack spacing"
git push origin main
```

- [ ] **Step 5: Verify remote parity**

Confirm `git rev-parse HEAD` matches `git ls-remote origin refs/heads/main`.
