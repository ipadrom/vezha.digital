import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getMetricGridClass, getNextProject, mergeFeaturedProjects, moveCaseIndex, selectFeaturedProjects, selectPublishedProjects } from "../utils/landingCases.ts";
import type { IProjects } from "../utils/interfaces/IProjects.ts";

const project = (slug: string | null, sort_order: number, is_featured = true): IProjects => ({
  id: String(sort_order), slug, sort_order, is_featured,
  type: "Web", name: slug || "No slug", metrics: [],
});

test("featured cases are deterministic and capped", () => {
  const result = selectFeaturedProjects([
    project("third", 3), project("first", 1), project(null, 0), project("hidden", 2, false), project("second", 2),
  ], 2);
  assert.deepEqual(result.map((item) => item.slug), ["first", "second"]);
});

test("case navigation wraps in both directions", () => {
  assert.equal(moveCaseIndex(0, -1, 3), 2);
  assert.equal(moveCaseIndex(2, 1, 3), 0);
});

test("next project wraps and metric layouts stay explicit", () => {
  const projects = [project("one", 1), project("two", 2)];
  assert.equal(getNextProject(projects, "two")?.slug, "one");
  assert.equal(getMetricGridClass(1), "is-single");
  assert.equal(getMetricGridClass(2), "is-pair");
  assert.equal(getMetricGridClass(4), "is-grid");
});

test("published API cases replace fallbacks and featured cases stay first", () => {
  const api = [project("api-case", 1, false), project("wellness-app", 5)];
  const fallback = [project("wellness-app", 0), project("fallback-only", 2)];
  assert.deepEqual(
    mergeFeaturedProjects(api, fallback).map((item) => item.slug),
    ["wellness-app", "api-case"],
  );
  assert.equal(mergeFeaturedProjects([], fallback).length, 2);
  assert.deepEqual(selectPublishedProjects(api).map((item) => item.slug), ["wellness-app", "api-case"]);
});

test("mobile case flow keeps the visual before the responsive summary", () => {
  const component = readFileSync("components/landing/LandingCases.vue", "utf8");
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.ok(component.indexOf("<CaseArtifactVisual") < component.indexOf("<footer class=\"vz-cases__caption\""));
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.vz-cases__active\s*\{[^}]*grid-column:\s*1 \/ -1;[^}]*grid-row:\s*2;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__caption\s*\{[^}]*grid-template-columns:\s*minmax\(0, 0\.95fr\) minmax\(0, 1\.05fr\);/s);
});

test("landing case metadata wrapper stays unframed", () => {
  const component = readFileSync("components/landing/LandingCases.vue", "utf8");
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.doesNotMatch(component, /class="case-metrics"/);
  assert.match(css, /\.vz-cases__caption > \.vz-cases__meta-layout\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/s);
});

test("landing cases use an accessible project tab treatment", () => {
  const component = readFileSync("components/landing/LandingCases.vue", "utf8");
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(css, /\.vz-cases__tabs button\s*\{[^}]*min-height:\s*82px;[^}]*border:\s*0;[^}]*border-bottom:\s*1px solid var\(--border-2\);/s);
  assert.match(css, /\.vz-cases__tabs button\[aria-selected="true"\]::after\s*\{[^}]*transform:\s*scaleX\(1\);/s);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.vz-cases__tabs\s*\{[^}]*overflow-x:\s*auto;/s);
  assert.match(component, /role="tablist"/);
  assert.match(component, /role="tab"/);
  assert.match(component, /@keydown="onTabsKeydown"/);
  assert.match(component, /event\.key === "ArrowRight"/);
  assert.match(component, /event\.key === "ArrowLeft"/);
});

test("mobile case tabs scroll smoothly when changed with the controls", () => {
  const component = readFileSync("components/landing/LandingCases.vue", "utf8");

  assert.match(component, /const reduceMotion = window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches;/);
  assert.match(component, /tabList\.style\.setProperty\("--vz-tabs-trailing-space", `\$\{trailingSpace\}px`\);[\s\S]*?behavior:\s*animate && !reduceMotion \? "smooth" : "auto",/s);
  assert.match(component, /@click="move\(-1, false, true\)"/);
  assert.match(component, /@click="move\(1, false, true\)"/);
});

test("landing case selector keeps the open stage and capsule arrow controls", () => {
  const component = readFileSync("components/landing/LandingCases.vue", "utf8");
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(component, /class="vz-cases__mobile-controls"/);
  assert.match(css, /\.vz-cases__shell\s*\{[^}]*display:\s*grid;[^}]*align-items:\s*start;/s);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.vz-cases__mobile-controls\s*\{[^}]*display:\s*inline-grid;[^}]*border-radius:\s*999px;/s);
  assert.match(css, /@media \(min-width: 901px\)[\s\S]*?\.vz-cases__active > \.case-artifact\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*1;/s);
});

test("case action mirrors the dark service CTA treatment", () => {
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(
    css,
    /\.vz-cases__caption > \.vz-cases__link\s*\{[^}]*min-height:\s*54px;[^}]*padding:\s*10px 14px;[^}]*border-radius:\s*14px;[^}]*background:\s*var\(--ink\);[^}]*color:\s*var\(--bg\);[^}]*font-weight:\s*600;/s,
  );
  assert.match(
    css,
    /\.vz-cases__caption > \.vz-cases__link svg\s*\{[^}]*width:\s*22px;[^}]*height:\s*22px;[^}]*stroke-width:\s*1\.6;/s,
  );
});

test("case summary follows the title, facts, logo and action composition", () => {
  const component = readFileSync("components/landing/LandingCases.vue", "utf8");
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(component, /class="vz-cases__meta-layout"/);
  assert.match(component, /class="vz-cases__facts"/);
  assert.equal(component.match(/class="vz-cases__fact"/g)?.length, 3);
  assert.equal(component.match(/class="vz-cases__meta-value"/g)?.length, 4);
  assert.equal(component.match(/class="vz-cases__meta-detail"/g)?.length, 4);
  assert.match(component, /type CaseMetaField = "format" \| "product" \| "client" \| "stack";/);
  assert.match(component, /function caseMetaDetail\(project: IProjects, field: CaseMetaField\)/);
  assert.match(component, /PWA — сайт, который устанавливается как приложение\./);
  assert.match(component, /Wellness App — приложение для тренировок и здоровья\./);
  assert.match(component, /Заказчик — специалист по фитнесу и питанию\./);
  assert.match(component, /Vue 3 — интерфейс, Vite — сборка приложения\./);
  assert.match(component, /class="vz-cases__brand"/);
  assert.match(component, /class="vz-cases__stack-card"/);
  assert.match(component, /wellness-mark\.svg/);
  assert.match(css, /\.vz-cases__caption > \.vz-cases__meta-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 0\.92fr\) minmax\(0, 1\.08fr\);/s);
  assert.match(css, /\.vz-cases__brand\s*\{[^}]*aspect-ratio:\s*1;[^}]*padding:\s*0;[^}]*overflow:\s*hidden;/s);
  assert.match(css, /\.vz-cases__brand\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/s);
  assert.match(css, /\.vz-cases__brand img\s*\{[^}]*object-fit:\s*cover;/s);
  assert.match(css, /\.vz-cases__fact dd\s*\{[^}]*font-size:\s*var\(--type-body\);/s);
  assert.match(css, /\.vz-cases__stack-card strong\s*\{[^}]*font-size:\s*var\(--type-body\);/s);
  assert.match(css, /\.vz-cases__fact dt,[\s\S]*?\.vz-cases__stack-card > span\s*\{[^}]*position:\s*absolute;[^}]*top:\s*10px;[^}]*left:\s*12px;[^}]*text-align:\s*left;/s);
  assert.match(css, /\.vz-cases__caption > \*::before\s*\{[^}]*display:\s*none !important;/s);
  assert.match(css, /\.vz-cases__fact dt,[\s\S]*?\.vz-cases__stack-card > span\s*\{[^}]*z-index:\s*2;/s);
  assert.match(css, /\.vz-cases__meta-value,[\s\S]*?\.vz-cases__meta-detail\s*\{[^}]*grid-area:\s*1 \/ 1;[^}]*backface-visibility:\s*hidden;[^}]*transform 200ms var\(--ease-in-out,/s);
  assert.match(css, /\.vz-cases__meta-detail\s*\{[^}]*width:\s*100%;[^}]*justify-self:\s*stretch;[^}]*text-align:\s*left;/s);
  assert.match(css, /\.vz-cases__meta-detail\s*\{[^}]*display:\s*block;[^}]*overflow:\s*visible;/s);
  assert.doesNotMatch(css, /\.vz-cases__meta-detail\s*\{[^}]*-webkit-line-clamp:/s);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.vz-cases__fact:hover \.vz-cases__meta-value,[\s\S]*?transform:\s*rotateY\(82deg\);[\s\S]*?\.vz-cases__fact:hover \.vz-cases__meta-detail,[\s\S]*?opacity:\s*1;[^}]*transform:\s*rotateY\(0deg\);/s);
  assert.doesNotMatch(css, /\.vz-cases__fact:hover,[\s\S]*?\.vz-cases__stack-card:hover\s*\{[^}]*transform:\s*translateY/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.vz-cases__meta-value,[\s\S]*?\.vz-cases__meta-detail\s*\{[^}]*transform:\s*none;[^}]*transition:\s*opacity 125ms/s);
  assert.match(css, /@media \(min-width: 901px\)[\s\S]*\.vz-cases__caption\s*\{[^}]*grid-template-rows:\s*96px minmax\(0, 1fr\) minmax\(64px, 74px\);/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__caption\s*\{[^}]*grid-template-columns:\s*minmax\(0, 0\.95fr\) minmax\(0, 1\.05fr\);/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__caption > \.vz-cases__identity\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*1;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__caption > \.vz-cases__meta-layout\s*\{[^}]*display:\s*contents;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__facts\s*\{[^}]*display:\s*contents;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__brand\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*1 \/ 4;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__stack-card\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*4;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__fact dt,[\s\S]*?\.vz-cases__stack-card > span\s*\{[^}]*display:\s*block;[^}]*top:\s*6px;[^}]*left:\s*8px;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__meta-detail\s*\{[^}]*position:\s*relative;[^}]*top:\s*4px;/s);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.vz-cases__caption > \.vz-cases__link\s*\{[^}]*height:\s*auto;[^}]*grid-column:\s*1 \/ -1;[^}]*grid-row:\s*5;[^}]*margin-top:\s*14px;/s);
});
