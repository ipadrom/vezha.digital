import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getCaseFallbacks } from "../utils/caseFallbacks.ts";
import { getWellnessCaseContent } from "../utils/wellnessCaseContent.ts";

for (const locale of ["ru", "en"] as const) {
  test(`WELLNESS APP is localized and anonymized for ${locale}`, () => {
    const wellness = getCaseFallbacks(locale).find((item) => item.slug === "wellness-app");
    assert.ok(wellness);
    assert.equal(wellness.name, "WELLNESS APP");
    assert.equal(wellness.sort_order, 0);
    assert.equal(wellness.metrics.length, 4);
    assert.ok(wellness.metrics.every((metric) => metric.is_demo));
    assert.notEqual(wellness.name, "Training");
    assert.doesNotMatch(JSON.stringify(wellness), /artas|recipes-tab/i);
  });
}

test("landing wellness visual uses a branded splash while the case hero keeps the product screen", () => {
  const visual = readFileSync("components/cases/WellnessPhoneVisual.vue", "utf8");

  assert.match(visual, /wellness-phone__brand/);
  assert.match(visual, /variant === ['"]default['"]/);
  assert.match(visual, /screen-timer\.png/);
  assert.match(visual, /wellness-phone--default \.wellness-phone__screen/);
  assert.match(visual, /wellness-phone--wide \.wellness-phone__screen/);
});

test("case header follows the landing header structure on desktop and mobile", () => {
  const header = readFileSync("components/cases/CaseDetailHeader.vue", "utf8");
  const css = readFileSync("assets/css/case-detail.css", "utf8");

  assert.match(header, /class="case-header__inner"/);
  assert.match(header, /class="case-header__menu"/);
  assert.match(header, /class="case-header__mobile-nav"/);
  assert.match(css, /\.case-header__inner\s*\{[^}]*max-width:\s*1240px;/s);
  assert.match(css, /\.case-header__menu\s*\{[^}]*display:\s*none;/s);
  assert.match(css, /\.case-header\s*\{[^}]*background:\s*var\(--bg\);/s);
  assert.doesNotMatch(css, /\.case-header\s*\{[^}]*backdrop-filter:/s);
});

for (const locale of ["ru", "en"] as const) {
  test(`WELLNESS APP chapters are complete for ${locale}`, () => {
    const content = getWellnessCaseContent(locale);
    assert.deepEqual(content.chapters.map((item) => item.id), ["workout", "food"]);
    assert.deepEqual(content.chapters.map((item) => item.screens.length), [3, 3]);
    assert.ok(content.evolution.before.points.length >= 3);
    assert.ok(content.evolution.after.points.length >= 3);
    assert.match(content.demoLabel, locale === "ru" ? /демонстрационные/i : /demonstration/i);
    assert.doesNotMatch(JSON.stringify(content), /Training|artas|recipes-tab/i);
  });
}
