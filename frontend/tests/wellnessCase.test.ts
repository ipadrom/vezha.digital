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
    assert.equal(wellness.blocks.length, 18);
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
    const processes = wellness.blocks.filter((block) => block.type === "process");
    assert.equal(processes.length, 3);
    assert.ok(processes.every((block) => block.settings.surface === "plain"));
    assert.ok(processes.every((block) => block.settings.layout === "chapter"));
    assert.ok(processes.every((block) => block.settings.desktop_span === 12));
    assert.ok(processes.every((block) => block.settings.open_first === false));
    assert.ok(processes.every((block) => block.content.summary));
    assert.deepEqual(processes.map((block) => block.content.items.length), [2, 2, 1]);
    assert.ok(processes.flatMap((block) => block.content.items).every((item: any) => item.image_url && item.tags.length >= 3));
    const systemVisual = wellness.blocks.find((block) => block.id === "wellness-insight");
    const processMedia = [systemVisual?.content.image_url, ...processes.flatMap((block) => block.content.items.map((item: any) => item.image_url))];
    assert.deepEqual(processMedia, [
      "/cases/wellness-app/system-flow.gif",
      "/cases/wellness-app/sequence-flow.gif",
      "/cases/wellness-app/technique-flow.gif",
      "/cases/wellness-app/recovery-flow.gif",
      "/cases/wellness-app/progression-flow.gif",
      "/cases/wellness-app/nutrition-process-flow.gif",
    ]);
    assert.ok(processes.flatMap((block) => block.content.items).every((item: any) => item.media_size === "full"));
    assert.equal(new Set(processMedia.map((url: string) => createHash("sha256").update(readFileSync(`public${url}`)).digest("hex"))).size, 6);
    const processIntro = wellness.blocks.find((block) => block.id === "wellness-workout-copy");
    assert.equal(processIntro?.type, "text");
    assert.equal(processIntro?.settings.layout, "editorial");
    assert.equal(processIntro?.settings.desktop_span, 12);
    assert.deepEqual(processIntro?.content.tags, []);
    const context = wellness.blocks.find((block) => block.id === "wellness-context");
    assert.equal(context?.settings.desktop_span, 12);
    assert.equal(context?.settings.layout, "overview");
    assert.ok(context?.content.tags.length >= 4);
    const facts = wellness.blocks.find((block) => block.id === "wellness-facts");
    assert.equal(facts?.settings.desktop_span, 12);
    assert.equal(facts?.settings.surface, "plain");
    assert.equal(facts?.settings.layout, "cards");
    assert.equal(facts?.settings.show_intro, false);
    const challenge = wellness.blocks.find((block) => block.id === "wellness-challenge");
    assert.equal(challenge?.type, "text");
    assert.equal(challenge?.settings.surface, "plain");
    assert.equal(challenge?.settings.layout, "editorial");
    assert.ok(challenge?.content.body);
    assert.equal(wellness.blocks.filter((block) => block.type === "insight").length, 0);
    assert.equal(systemVisual?.type, "image");
    assert.equal(systemVisual?.content.image_url, "/cases/wellness-app/system-flow.gif");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-copy")?.settings.desktop_span, 12);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-visual")?.settings.desktop_span, 12);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-visual")?.settings.image_bleed, false);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-visual")?.content.image_url, "/cases/wellness-app/workout-flow.gif");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-workout-visual")?.content.caption, "");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-copy")?.type, "process");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-copy")?.settings.desktop_span, 12);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-visual")?.settings.desktop_span, 12);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-visual")?.settings.image_bleed, false);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-visual")?.content.image_url, "/cases/wellness-app/nutrition-flow.gif");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-nutrition-visual")?.content.caption, "");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-progression")?.type, "process");
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-technologies")?.settings.desktop_span, 12);
    const result = wellness.blocks.find((block) => block.id === "wellness-result");
    assert.equal(result?.settings.desktop_span, 12);
    assert.equal(result?.content.items.length, 4);
    assert.equal(wellness.blocks.find((block) => block.id === "wellness-approach")?.settings.layout, "editorial");
    const serialized = JSON.stringify(wellness.blocks);
    for (const mediaUrl of [
      "/cases/wellness-app/training-mark.svg",
      "/cases/wellness-app/wellness-promo-poster.jpg",
      "/cases/wellness-app/wellness-promo.mp4",
      "/cases/wellness-app/system-flow.gif",
      "/cases/wellness-app/sequence-flow.gif",
      "/cases/wellness-app/technique-flow.gif",
      "/cases/wellness-app/recovery-flow.gif",
      "/cases/wellness-app/progression-flow.gif",
      "/cases/wellness-app/nutrition-process-flow.gif",
      "/cases/wellness-app/workout-flow.gif",
      "/cases/wellness-app/training-plan.jpg",
      "/cases/wellness-app/training-active.jpg",
      "/cases/wellness-app/training-rest.jpg",
      "/cases/wellness-app/nutrition-flow.gif",
      "/cases/wellness-app/food-daily-menu.jpg",
      "/cases/wellness-app/food-recipes.jpg",
      "/cases/wellness-app/food-recipe-detail.jpg",
    ]) {
      assert.match(serialized, new RegExp(mediaUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.ok(readFileSync(`public${mediaUrl}`).byteLength > 0);
    }
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
  const page = readFileSync("pages/cases/[slug].vue", "utf8");

  assert.match(header, /class="case-header__inner"/);
  assert.match(header, /class="case-header__menu"/);
  assert.match(header, /class="case-header__mobile-nav"/);
  assert.match(header, /:data-nav-visible="isHeaderShown \? 'true' : 'false'"/);
  assert.match(header, /class="case-header-hover-zone"/);
  assert.match(header, /function queueHeaderHide\(delay = 820\)/);
  assert.match(header, /queueHeaderHide\(220\)/);
  assert.match(header, /Math\.abs\(delta\) < 6/);
  assert.match(header, /isHeaderVisible\.value = delta < 0/);
  assert.match(header, /window\.addEventListener\("scroll", handleHeaderScroll, \{ passive: true \}\)/);
  assert.match(header, /window\.addEventListener\("resize", handleHeaderResize, \{ passive: true \}\)/);
  assert.doesNotMatch(header, /toggle-locale|case-header__locale|English version/);
  assert.match(header, /theme === "dark" \? "☀" : "☾"/);
  assert.match(css, /\.case-header__inner\s*\{[^}]*max-width:\s*1240px;/s);
  assert.match(css, /\.case-header\s*\{[^}]*padding:\s*12px max\(40px, calc\(\(100% - 1240px\) \/ 2\)\) 0;/s);
  assert.match(css, /\.case-header__inner\s*\{[^}]*backdrop-filter:\s*saturate\(1\.18\) blur\(18px\);[^}]*opacity:\s*1;[^}]*transform:\s*translate3d\(0, 0, 0\);[^}]*opacity 180ms var\(--ease-out[^}]*transform 220ms var\(--ease-out/s);
  assert.match(css, /\.case-header\[data-nav-visible="false"\] \.case-header__inner\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translate3d\(0, calc\(-100% - 24px\), 0\);[^}]*visibility:\s*hidden;/s);
  assert.match(css, /\.case-header-hover-zone\s*\{[^}]*height:\s*96px;[^}]*background:\s*transparent;/s);
  assert.match(css, /\.case-header__inner\s*\{[^}]*height:\s*64px;[^}]*padding:\s*0 12px 0 20px;/s);
  assert.match(css, /\.case-header__icon, \.case-header__cta, \.case-header__menu\s*\{[^}]*height:\s*44px;/s);
  assert.match(css, /\.case-header__menu\s*\{[^}]*display:\s*none;/s);
  assert.match(css, /\.case-header__inner\s*\{[^}]*border-radius:\s*999px;/s);
  assert.match(css, /\.case-header__inner\s*\{[^}]*backdrop-filter:\s*saturate\(1\.18\) blur\(18px\)/s);
  assert.match(css, /\.case-menu-enter-active, \.case-menu-leave-active\s*\{[^}]*opacity 400ms ease[^}]*transform 400ms cubic-bezier\(\.77, 0, \.175, 1\);/s);
  assert.match(css, /\.case-menu-enter-from, \.case-menu-leave-to\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY\(-100%\);/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.case-menu-enter-active, \.case-menu-leave-active\s*\{[^}]*opacity 100ms ease;/s);
  assert.match(page, /localStorage\.setItem\("vz_theme", theme\.value\)/);
  assert.match(page, /localStorage\.getItem\("vz_theme"\) === "dark"/);
});

test("case header hides an open mobile menu outside the mobile breakpoint", () => {
  const css = readFileSync("assets/css/case-detail.css", "utf8");

  assert.match(css, /\.case-header__mobile-nav\s*\{[^}]*display:\s*none;/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*\.case-header__mobile-nav\s*\{[^}]*display:\s*flex;/s);
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
  const v2Css = readFileSync("assets/css/case-builder-v2.css", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const preview = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");
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
  assert.match(v2Css, /\.builder-block--layout-phones \.builder-heading,[\s\S]*width:\s*min\(100%,\s*77\.5rem\);/s);
  assert.match(v2Css, /\.builder-block--layout-phones \.builder-gallery--phones\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*14rem\)\);/s);
  assert.match(v2Css, /\.builder-block--layout-phones \.builder-gallery--phones img\s*\{[^}]*aspect-ratio:\s*1179\s*\/\s*2556;/s);
  assert.match(v2Css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.builder-block--layout-phones \.builder-gallery--phones\s*\{[^}]*grid-auto-columns:\s*clamp\(13\.125rem,\s*72%,\s*15\.625rem\);/s);
  assert.match(preview, /preview-grid--\$\{block\.settings\.layout/);
  assert.match(preview, /\.preview-grid\.preview-grid--phones[^}]*grid-template-columns:\s*repeat\(3,/s);
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

test("all pages and landing controls use native scrolling", () => {
  const landing = readFileSync("pages/index.vue", "utf8");
  const casePage = readFileSync("pages/cases/[slug].vue", "utf8");
  const mainCss = readFileSync("assets/css/main.css", "utf8");
  const stackScroll = readFileSync("composables/landing/useLandingStackScroll.ts", "utf8");
  const services = readFileSync("components/landing/LandingServices.vue", "utf8");
  const cases = readFileSync("components/landing/LandingCases.vue", "utf8");

  assert.doesNotMatch(landing, /useDesktopSmoothScroll\(\)/);
  assert.doesNotMatch(casePage, /useDesktopSmoothScroll\(\)/);
  assert.match(mainCss, /html\s*\{[^}]*scroll-behavior:\s*auto;/s);
  assert.doesNotMatch(mainCss, /\.lenis|scroll-behavior:\s*smooth/);
  assert.match(stackScroll, /window\.scrollTo\(\{[^}]*behavior:\s*"auto"/s);
  assert.match(services, /nav\.scrollTo\(\{[^}]*behavior:\s*"auto"/s);
  assert.match(cases, /tabList\.scrollTo\(\{[^}]*behavior:\s*"auto"/s);
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

test("case system v2 shares typography, insight and editorial process across public and admin", () => {
  const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");
  const preview = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const library = readFileSync("utils/caseBuilder.ts", "utf8");
  const css = readFileSync("assets/css/case-builder-v2.css", "utf8");

  assert.match(inspector, /setSetting\('surface'/);
  assert.match(inspector, /key: 'image_url'.*media: true/s);
  assert.match(inspector, /key: 'video_url'.*accept: 'video\/mp4,video\/webm'/s);
  assert.match(inspector, /key: 'poster_url'.*media: true/s);
  assert.match(inspector, /key: 'tags'.*kind: 'tags'/s);
  assert.match(inspector, /insight:\s*\[/);
  assert.match(inspector, /value: 'media-right'.*Медиа справа/s);
  assert.match(inspector, /setSetting\('disclosure_mode'/);
  assert.match(inspector, /setSetting\('open_first'/);
  assert.match(inspector, /value: 'chapter'.*Глава кейса с раскрытиями/s);
  assert.match(inspector, /results: \[\{ key: 'text'/);
  assert.match(inspector, /value: 'overview'.*Обзор проекта/s);
  assert.match(inspector, /value: 'cards'.*Карточки показателей/s);
  assert.match(inspector, /setSetting\('show_intro'/);
  assert.match(preview, /block\.type === 'insight'/);
  assert.match(preview, /preview-insight__facts/);
  assert.match(preview, /preview-overview__copy/);
  assert.match(preview, /process-toggle-mark/);
  assert.match(library, /type:\s*'insight'.*Ключевое решение/s);
  assert.match(library, /disclosure_mode:\s*'multiple'/);
  assert.match(library, /open_first:\s*false/);
  assert.match(renderer, /block\.type === 'insight'/);
  assert.match(renderer, /builder-insight__statement/);
  assert.match(renderer, /builder-process__trigger/);
  assert.match(renderer, /builder-process-chapter/);
  assert.match(renderer, /builder-results-list/);
  assert.match(renderer, /class="builder-editorial"/);
  assert.match(renderer, /class="builder-tags"/);
  assert.match(renderer, /reactive<Record<string, number\[\]>>/);
  assert.match(renderer, /processDisclosureMode/);
  assert.match(renderer, /isProcessActive/);
  assert.match(renderer, /aria-expanded/);
  assert.match(renderer, /block\.settings\.surface === 'plain'/);
  assert.match(css, /--case-type-section:\s*var\(--type-editorial-section\);/);
  assert.match(css, /--case-type-body:\s*var\(--type-editorial-body\);/);
  assert.match(css, /\.builder-block:not\(\.builder-block--hero, \.builder-block--media_hero\) \.builder-eyebrow/);
  assert.doesNotMatch(css, /^\.builder-eyebrow\s*\{/m);
  assert.match(css, /\.builder-block--insight > \.builder-block__inner/);
  assert.match(css, /\.builder-process__trigger,[\s\S]*border-radius:\s*0;[\s\S]*background:\s*transparent;/s);
  assert.doesNotMatch(css, /--stage-angle|--tile-angle/);
  assert.match(css, /@container\s*\(max-width:\s*760px\)/);
  assert.match(css, /\.builder-process__trigger:focus-visible/);
  assert.match(css, /grid-template-rows 480ms cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.match(css, /\.builder-process li\.is-active/);
  assert.match(css, /\.builder-process-chapter > h3/);
  assert.match(css, /\.builder-results-list li/);
  assert.match(css, /--case-editorial-grid:/);
  assert.match(css, /\.builder-editorial\s*\{[^}]*grid-template-columns:\s*var\(--case-editorial-grid\)/s);
  assert.doesNotMatch(css, /gradient\(/);
});

test("case metrics render as a responsive card row", () => {
  const css = readFileSync("assets/css/case-builder-v2.css", "utf8");

  assert.match(css, /\.builder-metrics\s*\{[^}]*grid-template-columns:\s*repeat\(4,[^}]*gap:\s*clamp\(/s);
  assert.match(css, /\.builder-metrics article,[\s\S]*border-radius:\s*var\(--case-card-radius\);[\s\S]*background:\s*var\(--case-v2-surface-soft\);/s);
  assert.match(css, /\.builder-metrics b\s*\{[^}]*margin-top:\s*auto;/s);
  assert.match(css, /@container\s*\(max-width:\s*760px\)[\s\S]*\.builder-metrics,[\s\S]*repeat\(2,/s);
});

test("case sections use a compact shared rhythm and the last open disclosure has no trailing rule", () => {
  const baseCss = readFileSync("assets/css/case-builder-public.css", "utf8");
  const v2Css = readFileSync("assets/css/case-builder-v2.css", "utf8");

  assert.match(baseCss, /\.builder-block--space-normal \.builder-block__inner\s*\{[^}]*padding:\s*clamp\(36px, 3cqw, 44px\) clamp\(28px, 5cqw, 76px\);/s);
  assert.match(baseCss, /\.builder-block--space-large \.builder-block__inner\s*\{[^}]*padding:\s*clamp\(44px, 3\.5cqw, 52px\) clamp\(40px, 7cqw, 104px\);/s);
  assert.match(v2Css, /\.builder-block:not\([^}]+margin-block:\s*clamp\(0\.375rem, 0\.4vw, 0\.5rem\);/s);
  assert.match(v2Css, /\.builder-process > li:last-child\.is-open\s*\{[^}]*border-bottom-color:\s*transparent;/s);
});

test("case process controls animate their fill and balance the edge controls", () => {
  const css = readFileSync("assets/css/case-builder-v2.css", "utf8");

  assert.match(css, /\.builder-process__trigger\s*>\s*i,[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;/s);
  assert.match(css, /\.builder-process__trigger::before\s*\{[^}]*clip-path:\s*inset\(100% 0 0\);[^}]*transition:\s*clip-path 400ms cubic-bezier\(0\.77, 0, 0\.175, 1\);/s);
  assert.match(css, /\.builder-process__trigger\s*>\s*i::before\s*\{[^}]*clip-path:\s*circle\(0 at 50% 50%\);[^}]*transition:\s*clip-path 400ms cubic-bezier\(0\.77, 0, 0\.175, 1\);/s);
  assert.match(css, /\.builder-process__trigger\s*>\s*i,[\s\S]*?transform:\s*translateX\(-0\.5rem\);/s);
  assert.match(css, /\.builder-process__trigger\s*>\s*span\s*\{[^}]*transform:\s*translateX\(0\.5rem\);/s);
  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)[\s\S]*?\.builder-block--process\s+\.builder-process__trigger:hover\s*>\s*i::before\s*\{[^}]*clip-path:\s*circle\(50% at 50% 50%\);/s);
  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)[\s\S]*?\.builder-block--process\s+\.builder-process__trigger:hover::before\s*\{[^}]*clip-path:\s*inset\(0\);/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.builder-process__trigger:active\s*\{[^}]*transform:\s*none;/s);
});

test("plain case content aligns with the header gutter", () => {
  const css = readFileSync("assets/css/case-builder-v2.css", "utf8");

  assert.match(css, /--case-content-gutter:\s*1\.25rem;/);
  assert.match(css, /\.builder-block--plain\.builder-block--wide\.builder-block--space-normal[^}]*\.builder-block--plain\.builder-block--wide\.builder-block--space-large[^}]*padding-inline:\s*var\(--case-content-gutter\);/s);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*--case-content-gutter:\s*1rem;/s);
  assert.match(css, /\.builder-block--process \.builder-heading,[\s\S]*\.builder-process__copy\s*\{[^}]*padding-inline:\s*var\(--case-content-gutter\);/s);
  assert.match(css, /\.builder-process__tags\s*\{[^}]*padding-inline:\s*var\(--case-content-gutter\);/s);
});

test("challenge blocks keep the reference-led left heading and right narrative", () => {
  const renderer = readFileSync("components/case-builder/PublicCaseBuilder.vue", "utf8");
  const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");
  const preview = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");
  const css = readFileSync("assets/css/case-builder-v2.css", "utf8");

  assert.match(renderer, /block\.content\.impact/);
  assert.match(renderer, /class="builder-challenge"/);
  assert.match(renderer, /builder-challenge__heading[\s\S]*builder-challenge__copy/);
  assert.match(inspector, /key: 'impact_label'.*key: 'impact'/s);
  assert.match(inspector, /value: 'narrative'.*Заголовок слева, текст справа/s);
  assert.match(preview, /preview-challenge__heading[\s\S]*preview-challenge__copy/);
  assert.match(css, /\.builder-challenge\s*\{[^}]*grid-template-columns:\s*var\(--case-editorial-grid\)/s);
  assert.match(css, /\.builder-challenge__problem,[\s\S]*grid-template-columns:\s*minmax\(8rem, 0\.42fr\) minmax\(0, 1\.58fr\)/s);
  assert.match(css, /\.builder-challenge__details\s*\{[^}]*border-top:\s*var\(--case-rule\)/s);
  assert.doesNotMatch(css, /builder-duo/);
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

test("landing and case pages share one global typography source", () => {
  const globalCss = readFileSync("assets/css/main.css", "utf8");
  const landing = readFileSync("pages/index.vue", "utf8");
  const caseCss = readFileSync("assets/css/case-builder-v2.css", "utf8");

  assert.match(globalCss, /--type-display:\s*clamp\(/);
  assert.match(globalCss, /--type-section:\s*clamp\(/);
  assert.match(globalCss, /--type-body:\s*clamp\(/);
  assert.match(globalCss, /--type-caption:\s*clamp\(/);
  assert.match(globalCss, /--type-label:\s*clamp\(/);
  assert.match(globalCss, /--type-editorial-section:\s*clamp\(/);
  assert.match(globalCss, /--type-editorial-body:\s*clamp\(/);
  assert.doesNotMatch(landing, /--type-display:\s*clamp\(/);
  assert.doesNotMatch(landing, /--type-body:\s*clamp\(/);
  assert.match(caseCss, /--case-type-section:\s*var\(--type-editorial-section\);/);
  assert.match(caseCss, /--case-type-body:\s*var\(--type-editorial-body\);/);
  assert.match(caseCss, /--case-type-caption:\s*var\(--type-caption\);/);
  assert.match(caseCss, /--case-type-label:\s*var\(--type-label\);/);
  assert.doesNotMatch(caseCss, /--case-type-(?:section|subhead|disclosure|lead|body):\s*clamp\(/);
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
