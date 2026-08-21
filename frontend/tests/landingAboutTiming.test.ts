import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("fills the active route point clockwise and advances every 4.5 seconds", () => {
  const about = readFileSync("components/landing/LandingAbout.vue", "utf8");
  const landing = readFileSync("pages/index.vue", "utf8");

  assert.match(landing, /const aboutFlowStepDurationMs = 4500;/);
  assert.match(landing, /const aboutFlowResultDelayMs = aboutSupportStepIndex \* aboutFlowStepDurationMs;/);
  assert.match(about, /class="vz-about__flow-stage-progress"[\s\S]*?<circle cx="10" cy="10" r="8\.5"/);
  assert.match(about, /\.vz-about__flow-stage-progress\s*\{[^}]*inset:\s*-5px;[^}]*transform:\s*rotate\(-90deg\);/s);
  assert.match(about, /\.vz-about__flow-stage-progress circle\s*\{[^}]*stroke:\s*var\(--ink\);[^}]*stroke-width:\s*2\.75;[^}]*stroke-dashoffset:\s*53\.407;/s);
  assert.match(about, /animation:\s*vz-about-stage-progress 4500ms linear forwards;/);
  assert.match(about, /@keyframes vz-about-stage-progress\s*\{[^}]*from\s*\{\s*stroke-dashoffset:\s*53\.407;\s*\}[^}]*to\s*\{\s*stroke-dashoffset:\s*0;\s*\}/s);
  assert.match(about, /@keyframes vz-about-stage-focus\s*\{[\s\S]*?6%, 94%\s*\{[^}]*scale\(1\.22\);[\s\S]*?100%\s*\{[^}]*scale\(1\);/s);
});

test("anchors the about card bottom while animating to the active content height", () => {
  const about = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(about, /ref="introSlotRef" class="vz-about__intro-slot"[\s\S]*?ref="introRef" class="vz-about__intro"/);
  assert.match(about, /function syncIntroHeight\(\)[\s\S]*?--about-intro-current-height[\s\S]*?--about-intro-reserved-height[\s\S]*?--about-step-height/);
  assert.match(about, /\.vz-about__intro-slot\s*\{[^}]*position:\s*relative;[^}]*height:\s*var\(--about-intro-reserved-height\);/s);
  assert.match(about, /\.vz-about__intro\s*\{[^}]*position:\s*absolute;[^}]*bottom:\s*0;[^}]*height:\s*var\(--about-intro-current-height\);[^}]*transition:\s*height 360ms var\(--ease-out/s);
  assert.match(about, /\.vz-about__step-stack\s*\{[^}]*height:\s*var\(--about-step-height\);[^}]*transition:\s*height 360ms var\(--ease-out/s);
  assert.match(about, /\.vz-about__intro-slot\s*\{[^}]*width:\s*clamp\(460px, 46vw, 600px\);/s);
  assert.match(about, /@media \(max-width: 900px\)[\s\S]*?\.vz-about__intro-slot\s*\{[^}]*width:\s*min\(100%, 520px\);/s);
});

test("uses 12px mobile case metadata without shrinking the case title", () => {
  const casesCss = readFileSync("assets/css/landing-cases.css", "utf8");
  const mobileCss = casesCss.slice(casesCss.indexOf("@media (max-width: 620px)"));

  assert.match(mobileCss, /\.vz-cases__fact dd,\s*\.vz-cases__stack-card strong\s*\{[^}]*font-size:\s*12px;/s);
  assert.match(mobileCss, /\.vz-cases__fact dt,\s*\.vz-cases__stack-card > span\s*\{[^}]*display:\s*block;[^}]*top:\s*6px;[^}]*left:\s*8px;/s);
  assert.doesNotMatch(mobileCss, /\.vz-cases__fact dd,\s*\.vz-cases__stack-card strong\s*\{[^}]*transform:/s);
  assert.match(mobileCss, /\.vz-cases__identity h3\s*\{[^}]*font-size:\s*clamp\(18px, 5\.2vw, 21px\);/s);
});

test("renders both mobile header menu lines with the same thin pixel geometry", () => {
  const landing = readFileSync("pages/index.vue", "utf8");

  assert.match(landing, /\.vz-menu-button\s*\{[^}]*flex-direction:\s*column;[^}]*gap:\s*4px;/s);
  assert.match(landing, /\.vz-menu-button span\s*\{[^}]*width:\s*17px;[^}]*height:\s*1px;[^}]*flex:\s*0 0 1px;/s);
});

test("animates the mobile stack card to each content height", () => {
  const stack = readFileSync("components/landing/LandingStack.vue", "utf8");
  const landing = readFileSync("pages/index.vue", "utf8");

  assert.match(stack, /ref="mobileDetailsRef" class="vz-stack__mobile-details"[\s\S]*?name="vz-stack-mobile-card"[\s\S]*?@enter="resizeMobileDetailsForContent"/);
  assert.match(stack, /function syncMobileDetailsHeight[\s\S]*?card\.style\.height = `\$\{targetHeight\}px`/);
  assert.match(stack, /\.vz-stack__mobile-details\s*\{[^}]*overflow:\s*hidden;[^}]*transition:\s*height 360ms var\(--ease-out/s);
  assert.match(stack, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.vz-stack__mobile-details\s*\{[^}]*transition:\s*none;/s);
  assert.match(landing, /\.vz-stack__mobile-details-body > div\s*\{[^}]*display:\s*flex;/s);
});

test("keeps a 22px mobile gap between the case selector and visual", () => {
  const cases = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(cases, /@media \(max-width: 900px\)[\s\S]*?\.vz-cases__active\s*\{[^}]*margin-top:\s*22px;/s);
});
