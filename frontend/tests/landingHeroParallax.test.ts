import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("drives the monolith scroll parallax from the scroll timeline, not scroll events", () => {
  const heroCss = readFileSync("assets/css/landing-hero.css", "utf8");
  const hero = readFileSync("components/landing/LandingHero.vue", "utf8");
  // Scroll events eased through the 1.2s pointer transition lagged, then jumped on iPhone.
  assert.doesNotMatch(hero, /addEventListener\("scroll"/);
  assert.doesNotMatch(heroCss, /--hero-scroll/);
  assert.match(heroCss, /@supports \(animation-timeline: view\(\)\) and \(animation-range: exit-crossing\)[\s\S]*?@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(heroCss, /\.vz-hero\s*\{\s*view-timeline-name: --vz-hero;/);
  assert.match(heroCss, /\.vz-monolith__body\s*\{\s*animation: vz-monolith-drift linear both;\s*animation-timeline: --vz-hero;\s*animation-range: exit-crossing;/);
  assert.match(heroCss, /@keyframes vz-monolith-drift\s*\{\s*to\s*\{\s*translate: 0 90px;/);
});
