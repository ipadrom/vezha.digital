import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
    assert.equal(wellness.blocks.length, 15);
    assert.equal(wellness.blocks[0].content.logo_url, "/cases/wellness-app/training-mark.svg");
    const phoneGalleries = wellness.blocks.filter((block) => block.type === "gallery");
    assert.equal(phoneGalleries.length, 2);
    assert.ok(phoneGalleries.every((block) => block.settings.layout === "phones"));
    assert.ok(phoneGalleries.every((block) => block.content.items.length === 3));
    assert.equal(wellness.blocks.filter((block) => block.type === "media_hero").length, 1);
    assert.equal(wellness.blocks.filter((block) => block.type === "video").length, 0);
    const mediaHero = wellness.blocks.find((block) => block.type === "media_hero");
    assert.equal(mediaHero?.content.video_url, "/cases/wellness-app/wellness-promo.mp4");
    assert.equal(mediaHero?.content.autoplay, true);
    assert.equal(mediaHero?.content.loop, true);
    assert.equal(mediaHero?.content.muted, true);
    assert.equal(mediaHero?.settings.layout, "media-16x9");
    const process = wellness.blocks.find((block) => block.type === "process");
    assert.equal(process?.settings.surface, "plain");
    assert.equal(process?.settings.desktop_span, 12);
    assert.equal(process?.content.items.length, 6);
    assert.ok(process?.content.items.every((item: any) => item.image_url && item.tags.length >= 3));
    assert.ok(process?.content.items.every((item: any) => ["compact", "medium", "full"].includes(item.media_size)));
    const processMedia = process?.content.items.map((item: any) => item.image_url) || [];
    assert.deepEqual(processMedia, [
      "/cases/wellness-app/system-flow.gif",
      "/cases/wellness-app/sequence-flow.gif",
      "/cases/wellness-app/technique-flow.gif",
      "/cases/wellness-app/recovery-flow.gif",
      "/cases/wellness-app/progression-flow.gif",
      "/cases/wellness-app/nutrition-process-flow.gif",
    ]);
    assert.ok(process?.content.items.every((item: any) => item.media_size === "full"));
    assert.equal(new Set(processMedia.map((url: string) => createHash("sha256").update(readFileSync(`public${url}`)).digest("hex"))).size, 6);
    assert.equal(wellness.blocks.some((block) => block.id === "wellness-process-intro"), false);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-context")?.settings.desktop_span, 6);
    const facts = wellness.blocks.find((block) => block.id === "wellness-facts");
    assert.equal(facts?.settings.desktop_span, 6);
    assert.equal(facts?.settings.surface, "plain");
    const challenge = wellness.blocks.find((block) => block.id === "wellness-challenge");
    assert.equal(challenge?.settings.surface, "plain");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-copy")?.settings.desktop_span, 6);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-visual")?.settings.desktop_span, 6);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-visual")?.content.image_url, "/cases/wellness-app/workout-flow.gif");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-visual")?.content.caption, "");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-copy")?.settings.desktop_span, 6);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-visual")?.settings.desktop_span, 6);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-visual")?.content.image_url, "/cases/wellness-app/nutrition-flow.gif");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-visual")?.content.caption, "");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-technologies")?.settings.desktop_span, 7);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-result")?.settings.desktop_span, 5);
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

test("case sections and the compact landing header share the 1240px container", () => {
  const builderCss = readFileSync("assets/css/case-builder-public.css", "utf8");
  const landing = readFileSync("pages/index.vue", "utf8");

  assert.match(builderCss, /\.builder-block--wide\s+\.builder-block__inner\s*\{[^}]*width:\s*min\(100%,\s*1240px\);/s);
  assert.match(builderCss, /\.builder-block--full\s+\.builder-block__inner\s*\{[^}]*width:\s*100%;/s);
  assert.match(landing, /calc\(\(100% - 1240px\)\s*\/\s*2\)/);
  assert.match(landing, /border-radius:\s*999px/);
});

test("wellness phone galleries use a compact native scroll-snap rail on mobile", () => {
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const mobileStart = css.indexOf("@media (max-width: 760px)");
  const mobileEnd = css.indexOf("@media (max-width: 640px)", mobileStart);
  const mobileCss = css.slice(mobileStart, mobileEnd);

  assert.ok(mobileStart >= 0 && mobileEnd > mobileStart);
  assert.match(css, /\.builder-gallery--phones\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(mobileCss, /\.builder-gallery--phones\s*\{[^}]*grid-template-columns:\s*none;[^}]*grid-auto-flow:\s*column;[^}]*grid-auto-columns:\s*clamp\(236px,\s*82%,\s*330px\);/s);
  assert.match(mobileCss, /\.builder-gallery--phones\s*\{[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/s);
  assert.match(mobileCss, /\.builder-gallery--phones\s*\{[^}]*scroll-snap-type:\s*x mandatory;[^}]*-webkit-overflow-scrolling:\s*touch;/s);
  assert.match(mobileCss, /\.builder-gallery--phones figure\s*\{[^}]*scroll-snap-align:\s*start;/s);
  assert.match(mobileCss, /\.builder-gallery--phones img\s*\{[^}]*box-sizing:\s*border-box;/s);
  assert.match(renderer, /class="builder-gallery"\s+:class="`builder-gallery--\$\{block\.settings\.layout\}`"/s);
  assert.match(renderer, /<figure v-for=[\s\S]*<figcaption v-if="item\.caption"/s);
});

test("service inclusions stay in a two-column grid", () => {
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");

  assert.match(css, /\.vz-service-panel \.vz-service-commercial__included \[data-serv-metawrap\]\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(css, /\.vz-service-panel \.vz-service-commercial__included \[data-serv-metawrap\] span\s*\{[^}]*min-width:\s*0;[^}]*white-space:\s*nowrap;/s);
});

test("desktop case preview stays inside its stage above the navigation", () => {
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(css, /@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*\.vz-cases__active\s*\{[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\);/s);
  assert.match(css, /\.vz-cases__active\s*>\s*\.case-artifact\s*\{[^}]*height:\s*100%;[^}]*min-height:\s*0;[^}]*align-self:\s*stretch;/s);
});

test("desktop pages use Lenis while mobile keeps native scrolling", () => {
  const composable = readFileSync("composables/useDesktopSmoothScroll.ts", "utf8");
  const landing = readFileSync("pages/index.vue", "utf8");
  const casePage = readFileSync("pages/cases/[slug].vue", "utf8");

  assert.match(composable, /min-width:\s*901px/);
  assert.match(composable, /pointer:\s*fine/);
  assert.match(composable, /prefers-reduced-motion:\s*reduce/);
  assert.match(composable, /import\(["']lenis["']\)/);
  assert.match(landing, /useDesktopSmoothScroll\(\)/);
  assert.match(casePage, /useDesktopSmoothScroll\(\)/);
});

test("media hero is editable and rendered with reduced-motion controls", () => {
  const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const library = readFileSync("utils/caseBuilder.ts", "utf8");
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");

  assert.match(library, /type:\s*["']media_hero["']/);
  assert.match(inspector, /media_hero:\s*\[/);
  assert.match(inspector, /key:\s*'video_url'/);
  assert.match(renderer, /block\.type === 'media_hero'/);
  assert.match(renderer, /allowAutoplay/);
  assert.match(renderer, /video\.play\(\)/);
  assert.match(renderer, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.builder-block--media_hero\.builder-block--full \.builder-media-hero\s*\{[^}]*border-radius:\s*0;/s);
  assert.match(css, /height:\s*min\(56\.25vw,\s*calc\(100svh - 96px\)\)/);
  assert.match(css, /\.builder-block--media_hero\.builder-block--full \.builder-media-hero > img,[\s\S]*object-fit:\s*contain;/s);
});

test("builder blocks support plain surfaces and Halo-style process disclosures", () => {
  const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");

  assert.match(inspector, /setSetting\('surface'/);
  assert.match(inspector, /key: 'image_url'.*media: true/s);
  assert.match(inspector, /key: 'video_url'.*accept: 'video\/mp4,video\/webm'/s);
  assert.match(inspector, /key: 'poster_url'.*media: true/s);
  assert.match(inspector, /key: 'tags'.*kind: 'tags'/s);
  assert.match(renderer, /builder-process__trigger/);
  assert.match(renderer, /aria-expanded/);
  assert.match(renderer, /block\.settings\.surface === 'plain'/);
  assert.match(css, /\.builder-process__trigger\s*\{[^}]*border-radius:\s*999px;[^}]*background:\s*var\(--case-signal\)/s);
  assert.match(css, /\.builder-block--process\.builder-block--plain \.builder-process__trigger\s*\{[^}]*border:\s*1px solid[^}]*radial-gradient\(circle at var\(--stage-a-x\)[^}]*linear-gradient\(var\(--stage-angle\)/s);
  assert.match(css, /\.builder-block--process\.builder-block--plain \.builder-process li:nth-child\(6\)\s*\{[^}]*--stage-angle:\s*278deg;/s);
  assert.match(css, /@container\s*\(max-width:\s*760px\)/);
  assert.match(css, /\.builder-heading h2\s*\{[^}]*3\.8cqw/s);
});

test("plain metric blocks render their figures as separate two-column cards", () => {
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");

  assert.match(css, /\.builder-block--metrics\.builder-block--plain \.builder-metrics\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);[^}]*gap:\s*14px;[^}]*background:\s*transparent;/s);
  assert.match(css, /\.builder-block--metrics\.builder-block--plain \.builder-metrics article\s*\{[^}]*border:\s*1px solid[^}]*border-radius:\s*16px;[^}]*radial-gradient\(circle at var\(--tile-a-x\)[^}]*linear-gradient\(var\(--tile-angle\)/s);
  assert.match(css, /\.builder-block--metrics\.builder-block--plain \.builder-metrics article:nth-child\(4\)\s*\{[^}]*--tile-angle:\s*304deg;/s);
});

test("plain challenge blocks render two independent cards", () => {
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");

  assert.match(css, /\.builder-block--challenge_solution\.builder-block--plain \.builder-duo\s*\{[^}]*gap:\s*14px;[^}]*background:\s*transparent;/s);
  assert.match(css, /\.builder-block--challenge_solution\.builder-block--plain \.builder-duo article\s*\{[^}]*border:\s*1px solid[^}]*border-radius:\s*18px;[^}]*background:\s*var\(--case-paper\);/s);
});

test("process media keeps natural proportions and places tags after photo, GIF or video", () => {
  const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");
  const mediaInput = readFileSync("components/admin/cases/AdminMediaInput.vue", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");
  const library = readFileSync("utils/caseBuilder.ts", "utf8");

  assert.match(inspector, /key: 'media_size'.*label: 'Размер медиа'.*kind: 'select'.*defaultValue: 'medium'/s);
  assert.match(inspector, /media_size: 'medium'/);
  assert.match(mediaInput, /\.media-input__preview\s*\{[^}]*max-height:\s*220px;/s);
  assert.match(mediaInput, /\.media-input__preview img,[\s\S]*object-fit:\s*contain;/s);
  assert.doesNotMatch(mediaInput, /aspect-ratio:\s*16\s*\/\s*7|object-fit:\s*cover/);
  assert.match(renderer, /class="builder-process__media"[\s\S]*<img[\s\S]*<video[\s\S]*class="builder-process__tags"/s);
  assert.match(renderer, /:data-size="processMediaSize\(item\)"/);
  assert.match(renderer, /:poster="item\.poster_url \|\| undefined"/);
  assert.match(css, /\.builder-process__media > img,[\s\S]*\.builder-process__media > video\s*\{[^}]*width:\s*100%;[^}]*height:\s*auto;/s);
  assert.match(css, /\.builder-process__content\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s);
  assert.match(css, /\.builder-process__media\s*\{[^}]*width:\s*100%;[^}]*justify-items:\s*start;/s);
  assert.match(css, /data-size="compact"[\s\S]*width:\s*min\(100%,\s*340px\)/s);
  assert.match(css, /@container \(max-width:\s*760px\)[\s\S]*data-size="compact"[\s\S]*width:\s*min\(78%,\s*240px\)/s);
  assert.match(css, /data-size="medium"[\s\S]*width:\s*min\(100%,\s*480px\)/s);
  assert.match(css, /data-size="full"[\s\S]*width:\s*100%/s);
  assert.match(css, /@container\s*\(max-width:\s*760px\)[\s\S]*\.builder-process__media\s*\{[^}]*justify-items:\s*center/s);
  assert.match(library, /process:[\s\S]*video_url:\s*''[\s\S]*poster_url:\s*''[\s\S]*media_size:\s*'medium'/s);
});

test("mandatory case header is full-width, color-configurable and top-aligns copy with a square logo", () => {
  const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const canvas = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");
  const editor = readFileSync("pages/admin/cases/[id]/index.vue", "utf8");
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");

  assert.match(inspector, /hero_background/);
  assert.match(inspector, /hero_text/);
  assert.match(renderer, /builder-hero__layout/);
  assert.match(renderer, /builder-hero__logo-stage/);
  assert.match(renderer, /--case-hero-background/);
  assert.match(css, /\.builder-hero__layout\s*\{[^}]*align-items:\s*start;/s);
  assert.match(css, /\.builder-hero__logo-stage\s*\{[^}]*width:\s*90%;[^}]*aspect-ratio:\s*1\s*\/\s*1;/s);
  assert.match(canvas, /preview-hero-logo-stage/);
  assert.match(canvas, /\.preview-hero-logo-stage\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1;/s);
  assert.match(editor, /function enforceMandatoryHero\(\)/);
  assert.match(editor, /block\.type !== 'hero'/);
});

test("single images can bleed across the full equal-height card", () => {
  const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");

  assert.match(inspector, /setSetting\('image_bleed'/);
  assert.match(renderer, /builder-block--image-bleed/);
  assert.match(css, /\.builder-block--image-bleed \.builder-block__inner\s*\{[^}]*height:\s*100%;[^}]*padding:\s*0;/s);
  assert.match(css, /\.builder-block--image-bleed \.builder-single-image img,[\s\S]*object-fit:\s*cover;/s);
});

test("technology map uses the product gradient language instead of the terminal grid", () => {
  const publicMap = readFileSync("components/case-builder/CaseTechnologyMap.vue", "utf8");
  const adminMap = readFileSync("components/admin/cases/CaseTechnologyMapEditor.vue", "utf8");
  const library = readFileSync("utils/caseBuilder.ts", "utf8");
  const css = readFileSync("assets/css/case-builder-public.css", "utf8");

  assert.match(publicMap, /case-technology-map__node-mark|case-technology-map__node > i/);
  assert.match(publicMap, /border-radius:\s*999px/);
  assert.match(publicMap, /width:\s*clamp\(154px,\s*27cqw,\s*216px\)/);
  assert.match(css, /\.builder-block--results \.builder-block__inner\s*\{[^}]*align-content:\s*start;/s);
  assert.match(publicMap, /linear-gradient\(145deg,[^;]*var\(--tech-map-accent-rgb\)/s);
  assert.doesNotMatch(publicMap, /background-size:\s*43px 43px/);
  assert.match(adminMap, /technology-map-editor__node-mark/);
  assert.match(library, /background:\s*'#f5f6fb'/);
  assert.match(library, /text:\s*'#17191f'/);
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
  assert.match(css, /\.builder-hero__copy h1\s*\{[^}]*clamp\(44px,\s*5\.2cqw,\s*72px\)/s);
  assert.match(css, /\.builder-heading h2\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(css, /\.builder-image-text__copy h2\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(css, /\.builder-block--next_case h2\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(canvas, /\.preview-hero-copy h3\s*\{[^}]*font:\s*500[^}]*var\(--font-ui\)/s);
  assert.match(canvas, /class="preview-hero-layout"/);
  assert.match(canvas, /class="preview-hero-identity"/);
  assert.match(canvas, /class="preview-hero-logo-stage"/);
  assert.match(canvas, /class="preview-hero-meta"/);
  assert.match(canvas, /content\.items\?\.slice\(0, 5\)/);
  assert.match(canvas, /\.preview-hero-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.3fr\)\s+minmax\(150px,\s*\.7fr\)/s);
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
  assert.match(publicBuilder, /v-if="block\.settings\.layout === 'freeform' && block\.type !== 'hero'"/);
  assert.doesNotMatch(publicBuilder, /heroHasMedia/);
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
