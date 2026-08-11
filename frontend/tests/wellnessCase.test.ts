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
    assert.ok(wellness.metrics.every((metric) => !metric.is_demo));
    assert.equal(wellness.blocks.length, 13);
    assert.equal(wellness.blocks[0].content.logo_url, "/cases/wellness-app/wellness-mark.svg");
    assert.equal(wellness.blocks.filter((block) => block.type === "gallery").length, 2);
    assert.equal(wellness.blocks.filter((block) => block.type === "video").length, 1);
    assert.notEqual(wellness.name, "Training");
    assert.doesNotMatch(JSON.stringify(wellness), /artas|recipes-tab/i);
  });
}

test("landing wellness visual uses a branded splash while the case hero keeps the product screen", () => {
  const visual = readFileSync("components/cases/WellnessPhoneVisual.vue", "utf8");

  assert.match(visual, /wellness-phone__brand/);
  assert.match(visual, /wellness-mark\.svg/);
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
  assert.match(css, /\.case-header__inner\s*\{[^}]*border-radius:\s*999px;/s);
  assert.match(css, /\.case-header__inner\s*\{[^}]*backdrop-filter:\s*blur\(18px\)/s);
});

test("case header hides an open mobile menu outside the mobile breakpoint", () => {
  const css = readFileSync("assets/css/case-detail.css", "utf8");

  assert.match(css, /\.case-header__mobile-nav\s*\{[^}]*display:\s*none;/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*\.case-header__mobile-nav\s*\{[^}]*display:\s*grid;/s);
});

test("wellness evidence disclosure follows the metric demo state", () => {
  const study = readFileSync("components/cases/WellnessCaseStudy.vue", "utf8");

  assert.match(study, /v-if="hasDemoMetrics"/);
  assert.match(study, /props\.project\.metrics\.some\(\(metric\) => metric\.is_demo\)/);
  assert.match(study, /hasDemoMetrics\.value \? content\.value\.evidenceLead : content\.value\.verifiedEvidenceLead/);
});

test("reversed wellness chapters change desktop composition only", () => {
  const css = readFileSync("assets/css/wellness-case.css", "utf8");

  assert.match(css, /@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*\.wellness-chapter--reverse\s+\.wellness-chapter__copy\s*\{/s);
  assert.match(css, /\.wellness-chapter--reverse\s+\.wellness-chapter__screens\s*\{[^}]*direction:\s*rtl;/s);
});

test("builder headings use the same UI typography as the standard case pages", () => {
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");
  const canvas = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");
  const globalCss = readFileSync("assets/css/main.css", "utf8");

  assert.match(css, /\.builder-hero__copy h1\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(css, /\.builder-hero__copy h1\s*\{[^}]*clamp\(58px,\s*7cqw,\s*96px\)/s);
  assert.match(css, /\.builder-heading h2\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(css, /\.builder-image-text__copy h2\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(css, /\.builder-block--next_case h2\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(canvas, /\.preview-hero-copy h3\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(canvas, /class="preview-hero-facts"/);
  assert.match(canvas, /class="preview-media preview-hero-media"/);
  assert.match(canvas, /class="preview-hero-brand"/);
  assert.match(canvas, /content\.items\?\.slice\(0, 5\)/);
  assert.match(canvas, /\.canvas-block__preview--hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*\.92fr\)\s+minmax\(280px,\s*1\.08fr\)/s);
  assert.match(canvas, /linear-gradient\(135deg,\s*#c4b6ff,\s*#8dc8ff 55%,\s*#73dfd8\)/);
  assert.match(css, /\.builder-block__inner\s*\{[^}]*border-radius:\s*28px;/s);
  assert.doesNotMatch(css, /\.builder-(?:hero__copy h1|heading h2|image-text__copy h2|block--next_case h2)\s*\{[^}]*var\(--font-epilepsy\)/s);
  assert.doesNotMatch(globalCss, /Epilepsy Sans|--font-epilepsy/);
});

test("publishing always saves the current hero state and protects the last cover", () => {
  const editor = readFileSync("pages/admin/cases/[id]/index.vue", "utf8");

  assert.match(editor, /async function saveNow\(force = false\)/);
  assert.match(editor, /if \(!dirty\.value && !force\) return true/);
  assert.match(editor, /if \(!await saveNow\(true\)\)/);
  assert.match(editor, /if \(!heroBlocks\.some\(block => block\.is_visible\)\)/);
  assert.match(editor, /Обложку нельзя скрыть: она обязательна для публикации/);
  assert.match(editor, /В кейсе должна остаться хотя бы одна обложка/);
});

test("freeform case blocks support direct responsive element manipulation", () => {
  const editor = readFileSync("pages/admin/cases/[id]/index.vue", "utf8");
  const card = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");
  const canvas = readFileSync("components/admin/cases/CaseFreeformCanvas.vue", "utf8");
  const renderer = readFileSync("components/case-builder/CaseFreeformBlock.vue", "utf8");
  const publicBuilder = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");

  assert.match(editor, /convertBlockToFreeform/);
  assert.match(editor, /changeElementGeometry/);
  assert.match(card, /Разобрать в свободную композицию/);
  assert.match(canvas, /startPointer\(\$event, index, 'move'\)/);
  assert.match(canvas, /startPointer\(\$event, index, 'resize'\)/);
  assert.match(renderer, /--freeform-height-mobile/);
  assert.match(publicBuilder, /v-if="block\.settings\.layout === 'freeform'"/);
  assert.match(publicBuilder, /v-if="heroHasMedia\(block\)"/);
});

for (const locale of ["ru", "en"] as const) {
  test(`WELLNESS APP chapters are complete for ${locale}`, () => {
    const content = getWellnessCaseContent(locale);
    assert.deepEqual(content.chapters.map((item) => item.id), ["workout", "food"]);
    assert.deepEqual(content.chapters.map((item) => item.screens.length), [3, 3]);
    assert.ok(content.evolution.before.points.length >= 3);
    assert.ok(content.evolution.after.points.length >= 3);
    assert.match(content.demoLabel, locale === "ru" ? /демонстрационные/i : /demonstration/i);
    assert.ok(content.verifiedEvidenceLead.length > 0);
    assert.doesNotMatch(JSON.stringify(content), /Training|artas|recipes-tab/i);
  });
}
