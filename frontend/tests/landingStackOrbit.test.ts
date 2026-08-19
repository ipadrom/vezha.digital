import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE,
  DESKTOP_MOBILE_CORE_BELT_TEXT,
  DESKTOP_MOBILE_CORE_BELT_DURATION_MS,
  DESKTOP_MOBILE_CORE_BELT_Z_INDEX,
  DESKTOP_MOBILE_LABEL_ANCHOR_RADIUS,
  DESKTOP_MOBILE_ORBIT_TRACKS,
  DESKTOP_STACK_LABEL_LANES,
  DESKTOP_STACK_LABEL_ROUTE_DURATION_MS,
  MOBILE_BACKEND_STACK_LABEL_ROUTE_PROFILE,
  MOBILE_FRONTEND_STACK_LABEL_ROUTE_PROFILE,
  MOBILE_ORBIT_TECH,
  MOBILE_ORBIT_TRACKS,
  advanceBackendStackLabelClock,
  doMobileLabelBoundsOverlap,
  getContinuousOrbitElapsed,
  getCompactMobileRootRotation,
  getCompactMobileCoreRotation,
  getBackendStackLabelClearanceFactor,
  getDesktopDevOpsBridgeRoute,
  getDesktopMobileLabelDepthStyle,
  getDesktopMobileLabelLiftPx,
  getDesktopMobileCoreBeltPoint,
  getDesktopMobileOrbitAngle,
  getDesktopMobileOrbitPoint,
  getDesktopMobileTechnologyPoint,
  getDesktopStackLabelRouteState,
  getMobileDevOpsBridgeRoute,
  getMobileDevOpsLabelClearanceFactor,
  getMobileLabelDepthStyle,
  getMobileOrbitAngle,
  getMobileOrbitPoint,
  getMobileTechnologyPoint,
  getStackBridgeAttachmentPoint,
  getStackCameraFov,
  getStackGroupScale,
  getStackLayerTargets,
  getStackLabelHorizontalOpacity,
  getStackMaterialBaseOpacity,
  getStackRootRotationDelta,
  resolveMobileOrbitMode,
  resolveStackVisualLayer,
  shouldUseStackBridgeAttachment,
  shouldUseDesktopStackLatitudeRoutes,
  shouldPreserveStackLabelVerticalPosition,
} from "../utils/landingStackOrbit.ts";
import {
  getServiceHighlightFrames,
  getServiceHighlightLayoutBounds,
  getServiceHighlightTargetBounds,
} from "../utils/landingServicesHighlight.ts";
import {
  balanceServiceCapsuleRows,
  balanceServiceCapsules,
  estimateServiceCapsuleWidth,
} from "../utils/landingServiceCapsules.ts";

test("places a desktop DevOps label at 75% of its bridge stick", () => {
  assert.deepEqual(
    getStackBridgeAttachmentPoint(
      { x: 0.82, y: 0.36, z: 0.78 },
      { x: 1.28, y: 0.5, z: 1.2 },
    ),
    { x: 1.165, y: 0.465, z: 1.095 },
  );
});

test("uses the same 75% attachment on a mirrored bridge stick", () => {
  assert.deepEqual(
    getStackBridgeAttachmentPoint(
      { x: -0.82, y: 0.36, z: -0.78 },
      { x: -1.28, y: 0.5, z: -1.2 },
    ),
    { x: -1.165, y: 0.465, z: -1.095 },
  );
});

test("separates desktop DevOps labels into four ordered bridge routes", () => {
  const labels = ["Docker", "CI/CD", "Nginx", "Linux"] as const;
  const routes = labels.map((label) => getDesktopDevOpsBridgeRoute(label, 0));

  assert.deepEqual(routes.map(({ outerPoint }) => outerPoint.y), [
    0.72,
    0.24,
    -0.22,
    -0.68,
  ]);
  assert.deepEqual(routes.map(({ anchor }) => Number(Math.hypot(
    anchor.x,
    anchor.y,
    anchor.z,
  ).toFixed(6))), [0.690654, 0.690654, 0.690654, 0.690654]);
  assert.deepEqual(routes.map(({ anchor, outerPoint }) => (
    getStackBridgeAttachmentPoint(anchor, outerPoint).y
  )), [0.62465, 0.21182, -0.194248, -0.591006]);
});

test("groups mobile DevOps sticks onto two upper-hemisphere routes", () => {
  const routes = [
    getMobileDevOpsBridgeRoute("Docker", 2.8),
    getMobileDevOpsBridgeRoute("Nginx", 1.25),
    getMobileDevOpsBridgeRoute("CI/CD", -0.2),
    getMobileDevOpsBridgeRoute("Linux", -1.7),
  ];

  assert.deepEqual(routes.map(({ outerPoint }) => outerPoint.y), [
    0.72,
    0.72,
    0.16,
    0.16,
  ]);
  assert.deepEqual(routes.map(({ laneIndex }) => laneIndex), [0, 0, 1, 1]);
  assert.deepEqual(routes.map(({ anchor }) => Number(Math.hypot(
    anchor.x,
    anchor.y,
    anchor.z,
  ).toFixed(6))), [0.690654, 0.690654, 0.690654, 0.690654]);
  assert.ok(routes.every(({ anchor, outerPoint }) => (
    getStackBridgeAttachmentPoint(anchor, outerPoint).y > 0
  )));
});

test("balances only DevOps core framing and label sticks", () => {
  assert.equal(getStackMaterialBaseOpacity(0.18, "default", "bridge"), 0.18);
  assert.equal(getStackMaterialBaseOpacity(0.28, "core-shell", "bridge"), 0.22);
  assert.equal(getStackMaterialBaseOpacity(0.46, "core-lines", "bridge"), 0.22);
  assert.equal(getStackMaterialBaseOpacity(0.96, "core-points", "bridge"), 0.8);
  assert.equal(getStackMaterialBaseOpacity(0.34, "bridge-network", "bridge"), 0.65);
  assert.equal(getStackMaterialBaseOpacity(0.34, "bridge-stick", "bridge"), 0.65);
  assert.equal(getStackMaterialBaseOpacity(0.34, "default", "bridge"), 0.34);

  assert.equal(getStackMaterialBaseOpacity(0.28, "core-shell", "core"), 0.28);
  assert.equal(getStackMaterialBaseOpacity(0.34, "bridge-stick", "surface"), 0.34);
});

test("maps stack titles to visual states", () => {
  assert.equal(resolveStackVisualLayer("Frontend"), "surface");
  assert.equal(resolveStackVisualLayer("Backend"), "core");
  assert.equal(resolveStackVisualLayer("DevOps"), "bridge");
  assert.equal(resolveStackVisualLayer("Mobile"), "mobile");
});

test("dims the DevOps core to the same layer target used by Frontend", () => {
  assert.deepEqual(getStackLayerTargets("bridge"), {
    bridge: 1,
    core: 0.1,
    surface: 0.26,
  });
});

test("hides the Frontend shell in desktop Mobile", () => {
  assert.deepEqual(getStackLayerTargets("mobile"), {
    bridge: 0.52,
    core: 0.48,
    surface: 0,
  });
});

test("assigns five native Mobile technologies to balanced tracks", () => {
  assert.deepEqual(
    MOBILE_ORBIT_TECH.map(({ label, orbit, slug }) => [label, orbit, slug]),
    [
      ["Kotlin", "outer", "kotlin"],
      ["Swift", "outer", "swift"],
      ["Flutter", "outer", "flutter"],
      ["Expo", "inner", "expo"],
      ["PWA", "inner", "pwa"],
    ],
  );
});

test("spaces three outer Mobile labels evenly and keeps inner labels opposite", () => {
  const phases = Object.fromEntries(
    MOBILE_ORBIT_TECH.map(({ label, phase }) => [label, phase]),
  );

  assert.ok(Math.abs(phases.Swift - phases.Kotlin - Math.PI * 2 / 3) < 1e-12);
  assert.ok(Math.abs(phases.Flutter - phases.Swift - Math.PI * 2 / 3) < 1e-12);
  assert.ok(Math.abs(phases.PWA - phases.Expo - Math.PI) < 1e-12);
});

test("lists the same five native Mobile technologies in both locales", () => {
  const expected = ["Kotlin", "Swift", "Flutter", "Expo", "PWA"];

  for (const locale of ["ru", "en"]) {
    const messages = JSON.parse(
      readFileSync(`locales/${locale}.json`, "utf8"),
    );
    assert.deepEqual(messages.landing.stack.groups[3].items, expected);
  }
});

test("provides seven compact service navigation labels in both locales", () => {
  const expectedByLocale = {
    ru: ["Mini Apps", "Боты", "Веб-сайты", "Магазины", "AI", "Системы", "Mobile"],
    en: ["Mini Apps", "Bots", "Websites", "Stores", "AI", "Systems", "Mobile"],
  };

  for (const locale of ["ru", "en"] as const) {
    const messages = JSON.parse(
      readFileSync(`locales/${locale}.json`, "utf8"),
    );
    assert.deepEqual(messages.landing.services.navLabels, expectedByLocale[locale]);
  }
});

test("renders desktop service navigation as full-width client-style capsules", () => {
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");
  const servicesComposable = readFileSync("composables/landing/useLandingServices.ts", "utf8");
  const desktopStart = css.indexOf(".vz-services__nav {");
  const desktopEnd = css.indexOf("@media (max-width: 900px)", desktopStart);
  const desktopCss = css.slice(desktopStart, desktopEnd);

  assert.match(desktopCss, /\.vz-services__nav\s*\{[^}]*position:\s*relative;/);
  assert.match(desktopCss, /\.vz-services__nav\s*\{[^}]*grid-auto-rows:\s*48px;[^}]*gap:\s*8px;/s);
  assert.match(desktopCss, /\[data-serv-nav-num\]\s*\{[^}]*display:\s*none;/);
  assert.match(desktopCss, /\.vz-services__nav-highlight\s*\{[^}]*display:\s*block;/);
  assert.match(desktopCss, /\.vz-services__nav-highlight\s*\{[^}]*background:\s*var\(--ink\);/s);
  assert.match(desktopCss, /\.vz-services__nav button\s*\{[^}]*border:\s*1px solid transparent;[^}]*border-radius:\s*999px;[^}]*background:\s*var\(--bg\);/s);
  assert.match(desktopCss, /button\[data-active="true"\]\s*\{[^}]*border-color:\s*transparent;/s);
  assert.match(desktopCss, /button\[data-active="true"\] \[data-serv-nav-label\]\s*\{[^}]*color:\s*var\(--bg\);[^}]*font-size:\s*16px;/s);
  assert.doesNotMatch(desktopCss, /button\[data-active="true"\] \[data-serv-nav-label\][^}]*linear-gradient/s);
  assert.match(desktopCss, /\.vz-services__nav button:focus\s*\{[^}]*outline:\s*none;/);
  assert.match(desktopCss, /\.vz-services__nav button:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--ink\);[^}]*outline-offset:\s*2px;/s);
  assert.match(servicesComposable, /const targetElement = target;/);
  assert.match(servicesComposable, /const horizontalPadding = 0;/);
  assert.match(servicesComposable, /const verticalPadding = 0;/);
  assert.match(servicesComposable, /height:\s*`\$\{frame\.height\}px`/);
  assert.match(servicesComposable, /translate3d\(\$\{frame\.x\}px, \$\{frame\.y\}px, 0\)/);
});

test("keeps mobile service navigation on one line with only the active item filled", () => {
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");
  const servicesComponent = readFileSync("components/landing/LandingServices.vue", "utf8");
  const mobileStart = css.indexOf("@media (max-width: 900px)");
  const compactHeightStart = css.indexOf(
    "@media (max-width: 900px) and (max-height: 700px)",
    mobileStart,
  );
  const mobileCss = css.slice(mobileStart, compactHeightStart);

  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*flex-wrap:\s*nowrap;/);
  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*justify-content:\s*space-between;/);
  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*max-width:\s*100%;/);
  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*overflow-x:\s*clip;/);
  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*gap:\s*0;/);
  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*padding:\s*2px 0 24px;/);
  assert.match(servicesComponent, /data-serv-nav-highlight/);
  assert.match(mobileCss, /\.vz-services \[data-sec-head\]\s*\{[^}]*margin-bottom:\s*8px;/);
  assert.match(mobileCss, /\.vz-services__nav-highlight\s*\{[^}]*display:\s*none;/s);
  assert.match(mobileCss, /\.vz-services__nav button\s*\{[^}]*border:\s*1px solid transparent;/s);
  assert.match(mobileCss, /\.vz-services__nav button\s*\{[^}]*min-width:\s*max-content;[^}]*flex:\s*0 0 auto;/s);
  assert.match(mobileCss, /\.vz-services__nav button\s*\{[^}]*min-height:\s*0;/);
  assert.match(mobileCss, /\.vz-services__nav button\s*\{[^}]*transition:\s*none;/);
  assert.match(mobileCss, /\.vz-services__nav button span:first-child\s*\{[^}]*display:\s*none;/);
  assert.match(mobileCss, /button \[data-serv-nav-label\]\s*\{[^}]*font-size:\s*clamp\(9px, 2\.6vw, 10px\);/);
  assert.doesNotMatch(mobileCss, /button \[data-serv-nav-label\]\s*\{[^}]*top:/);
  assert.match(mobileCss, /button\[data-active="true"\]\s*\{[^}]*padding:\s*4px clamp\(4px, 1\.25vw, 5px\);/);
  assert.match(mobileCss, /button\[data-active="true"\]\s*\{[^}]*border-color:\s*transparent;/s);
  assert.match(mobileCss, /button\[data-active="true"\]\s*\{[^}]*background:\s*var\(--ink\);/);
  assert.match(mobileCss, /button\[data-active="true"\] \[data-serv-nav-label\]\s*\{[^}]*color:\s*var\(--bg\);/s);
  assert.match(mobileCss, /button\[data-active="true"\] \[data-serv-nav-label\]\s*\{[^}]*font-size:\s*clamp\(12px, 4vw, 16px\);/s);
  assert.doesNotMatch(mobileCss, /button\[data-active="true"\] \[data-serv-nav-label\][^}]*linear-gradient/s);
  assert.match(mobileCss, /button\[data-active="true"\] \[data-serv-nav-label\]\s*\{[^}]*font-weight:\s*400;/);
});

test("keeps service text fixed while expanding only the highlight background", () => {
  const highlightSource = readFileSync("utils/landingServicesHighlight.ts", "utf8");

  assert.match(highlightSource, /export function getServiceHighlightTargetBounds/);
  assert.match(highlightSource, /x:\s*bounds\.x - horizontalPadding/);
  assert.match(highlightSource, /width:\s*bounds\.width \+ horizontalPadding \* 2/);
});

test("positions the service highlight from stable layout geometry", () => {
  assert.deepEqual(
    getServiceHighlightLayoutBounds({
      offsetLeft: 24,
      offsetTop: 56,
      offsetWidth: 300,
      offsetHeight: 48,
    }),
    { x: 24, y: 56, width: 300, height: 48 },
  );
});

test("keeps the mobile about flow connected and the design label clear of its point", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");
  const mobileStart = aboutComponent.indexOf("@media (max-width: 720px)");
  const compactStart = aboutComponent.indexOf("@media (max-width: 390px)", mobileStart);
  const mobileCss = aboutComponent.slice(mobileStart, compactStart);

  assert.match(mobileCss, /\.vz-about__head\s*\{[^}]*margin-bottom:\s*0;/);
  assert.match(mobileCss, /\.vz-about__intro\s*\{[^}]*height:\s*clamp\(138px, 35vw, 144px\);/);
  assert.match(mobileCss, /\.vz-about__flow-stage--design \.vz-about__flow-stage-label\s*\{[^}]*right:\s*calc\(50% \+ 15px\);/s);
  assert.match(mobileCss, /\.vz-about__flow-stage--design\.is-active \.vz-about__flow-stage-label\s*\{[^}]*translateX\(-3px\)/s);
});

test("keeps the about section on the shared 1240px page grid", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /\.vz-about__inner\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*1240px;[^}]*margin:\s*0 auto;/s);
  assert.doesNotMatch(aboutComponent, /\.vz-about__inner\s*\{[^}]*max-width:\s*1320px;/s);
});

test("centres the desktop about heading group in the space above the flow", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /\.vz-about__head\s*\{[^}]*--about-head-flow-gap:\s*clamp\(32px, 4vw, 48px\);[^}]*margin-bottom:\s*var\(--about-head-flow-gap\);/s);
  assert.match(aboutComponent, /@media \(min-width: 901px\)[\s\S]*?\.vz-about__head\s*\{[^}]*transform:\s*translateY\(calc\(\(var\(--about-head-flow-gap\) - var\(--section-space\)\) \/ 2\)\);/s);
});

test("keeps the about heading on three balanced lines across desktop and mobile", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /\.vz-about__head\s*\{[^}]*gap:\s*clamp\(36px, 4vw, 64px\);/s);
  assert.match(aboutComponent, /\.vz-about__title\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*520px;[^}]*flex:\s*1 1 520px;/s);
  assert.match(aboutComponent, /\.vz-about__head h2\s*\{[^}]*max-width:\s*520px;[^}]*text-wrap:\s*balance;/s);
  assert.match(aboutComponent, /\.vz-about__intro\s*\{[^}]*width:\s*clamp\(420px, 42vw, 540px\);/s);
  assert.match(aboutComponent, /@media \(min-width: 901px\) and \(max-width: 1023px\)[\s\S]*?\.vz-about__head h2\s*\{[^}]*font-size:\s*clamp\(36px, 4vw, 42px\);/s);
  assert.match(aboutComponent, /@media \(max-width: 900px\)[\s\S]*?\.vz-about__title\s*\{[^}]*flex:\s*none;/s);
  assert.match(aboutComponent, /@media \(max-width: 900px\)[\s\S]*?\.vz-about__title,[\s\S]*?\.vz-about__head h2\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;/s);
});

test("keeps about-stage durations readable at the shared label size", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /\.vz-about__step-meta small\s*\{[^}]*font:\s*500 var\(--type-label\)\/1\.3 "JetBrains Mono", monospace;/s);
  assert.match(aboutComponent, /@media \(max-width: 720px\)[\s\S]*?\.vz-about__step-meta small\s*\{[^}]*font-size:\s*var\(--type-label\);/s);
  assert.doesNotMatch(aboutComponent, /\.vz-about__step-meta small\s*\{[^}]*var\(--type-micro\)/s);
});

test("keeps the two visible mobile about capsules on one line", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /@media \(max-width: 720px\)[\s\S]*?\.vz-about__step-deliverables\s*\{[^}]*flex-wrap:\s*nowrap;[^}]*gap:\s*5px;/s);
  assert.match(aboutComponent, /@media \(max-width: 390px\)[\s\S]*?\.vz-about__step-copy\s*\{[^}]*grid-template-columns:\s*80px minmax\(0, 1fr\);[^}]*gap:\s*10px;/s);
  assert.match(aboutComponent, /@media \(max-width: 370px\)[\s\S]*?\.vz-about__step-detail\s*\{[^}]*display:\s*contents;[^}]*\}[\s\S]*?\.vz-about__step-deliverables\s*\{[^}]*grid-column:\s*1 \/ -1;/s);
});

test("keeps mobile about cards compact at the tallest content height", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /@media \(max-width: 720px\)[\s\S]*?\.vz-about__intro\s*\{[^}]*padding:\s*12px 16px 10px;/s);
  assert.match(aboutComponent, /@media \(max-width: 720px\)[\s\S]*?\.vz-about__step-stack\s*\{[^}]*grid-template-rows:\s*max-content;/s);
  assert.match(aboutComponent, /@media \(max-width: 720px\)[\s\S]*?\.vz-about__step-deliverables li\s*\{[^}]*min-height:\s*28px;[^}]*padding:\s*4px 6px;/s);
});

test("uses the full testing label on desktop and the short label on mobile", () => {
  const messages = JSON.parse(readFileSync("locales/ru.json", "utf8"));
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.equal(messages.landing.about.stages[3], "Тестирование");
  assert.match(aboutComponent, /stageKeys\[index\] === "testing" && stage === "Тестирование" \? "Тест" : stage/);
  assert.match(aboutComponent, /@media \(max-width: 720px\)[\s\S]*?\.vz-about__stage-title--desktop\s*\{\s*display:\s*none;\s*\}[\s\S]*?\.vz-about__stage-title--mobile\s*\{\s*display:\s*inline;/s);
});

test("stacks larger desktop about controls with continue below replay", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /class="vz-about__flow-control vz-about__flow-continue"[\s\S]*?class="vz-about__flow-control vz-about__flow-replay"/s);
  assert.match(aboutComponent, /@media \(min-width: 901px\)[\s\S]*?\.vz-about__flow-controls\s*\{[^}]*flex-direction:\s*column-reverse;[^}]*align-items:\s*flex-end;[^}]*gap:\s*8px;/s);
  assert.match(aboutComponent, /@media \(min-width: 901px\)[\s\S]*?\.vz-about__flow-control\s*\{[^}]*min-height:\s*52px;[^}]*font:\s*500 var\(--type-label\)\/1 "JetBrains Mono", monospace;/s);
  assert.match(aboutComponent, /@media \(min-width: 901px\)[\s\S]*?\.vz-about__flow-control span\s*\{[^}]*width:\s*38px;[^}]*height:\s*38px;[^}]*font-size:\s*16px;/s);
  assert.match(aboutComponent, /@media \(min-width: 901px\)[\s\S]*?\.vz-about__flow-continue svg\s*\{[^}]*width:\s*16px;[^}]*height:\s*16px;/s);
});

test("anchors the mobile client card at the top while keeping the cube fixed", () => {
  const landingPage = readFileSync("pages/index.vue", "utf8");

  assert.match(landingPage, /@media \(max-width: 900px\)[\s\S]*?\.vz-client-card-track > p\s*\{[^}]*grid-area:\s*1 \/ 1;[^}]*align-self:\s*start;/s);
  assert.match(landingPage, /@media \(max-width: 900px\)[\s\S]*?\.vz-client-copy h3\s*\{[^}]*height:\s*3\.15em;[^}]*min-height:\s*3\.15em;[^}]*max-height:\s*3\.15em;[^}]*font-size:\s*25px;[^}]*line-height:\s*1\.05;[^}]*text-wrap:\s*balance;/s);
  assert.match(landingPage, /@media \(max-width: 900px\)[\s\S]*?\.vz-client-cube-field\s*\{[^}]*position:\s*relative;[^}]*top:\s*auto;[^}]*order:\s*5;[^}]*transform:\s*none;[^}]*justify-self:\s*end;/s);
  assert.doesNotMatch(landingPage, /\.vz-client-cube-field\[data-client-cube-stage=/);
});

test("uses native scrolling across landing interactions", () => {
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

test("keeps the desktop service CTA eyebrow on one line", () => {
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");

  assert.match(css, /@media \(min-width: 901px\)[\s\S]*?\.vz-service-panel__cta > span\s*\{[^}]*flex:\s*1;[^}]*min-width:\s*0;/s);
  assert.match(css, /@media \(min-width: 901px\)[\s\S]*?\.vz-service-panel__cta small\s*\{[^}]*font-size:\s*clamp\(0\.5rem, 0\.4rem \+ 0\.18vw, 0\.625rem\);[^}]*white-space:\s*nowrap;/s);
  assert.match(css, /@media \(min-width: 901px\)[\s\S]*?\.vz-service-panel__cta svg\s*\{[^}]*flex:\s*0 0 auto;/s);
});

test("lowers only the desktop client text card beneath the cube composition", () => {
  const landingPage = readFileSync("pages/index.vue", "utf8");
  const clients = readFileSync("components/landing/LandingClients.vue", "utf8");

  assert.match(clients, /class="vz-client-card-slot"[\s\S]*?class="vz-client-card-track"[\s\S]*?<p>\{\{ activeClient\.text \}\}<\/p>/s);
  assert.match(landingPage, /@media \(min-width: 901px\)\s*\{\s*\.vz-client-card-track\s*\{[^}]*display:\s*flow-root;[^}]*transform:\s*translateY\(clamp\(104px, 10vw, 120px\)\);/s);
  assert.match(landingPage, /@media \(max-width: 900px\)[\s\S]*?\.vz-client-card-slot\s*\{[^}]*display:\s*grid;[^}]*order:\s*6;[^}]*margin-top:\s*16px;/s);
});

test("aligns the desktop client heading and cube to the active-copy gap", () => {
  const landingPage = readFileSync("pages/index.vue", "utf8");

  assert.match(landingPage, /const targetViewportY = titleRect && cardRect\s*\? \(titleRect\.bottom \+ cardRect\.top\) \/ 2\s*:\s*headingRect\.top \+ headingRect\.height \/ 2;/s);
  assert.match(landingPage, /const currentHeadingCenter = headingRect\.top \+ headingRect\.height \/ 2;/);
  assert.match(landingPage, /renderedHeadOffset \+ targetViewportY - currentHeadingCenter/);
  assert.match(landingPage, /headingGroup\.style\.setProperty\("--client-head-y", nextHeadOffset\)/);
  assert.doesNotMatch(landingPage, /copy\.style\.setProperty\("--client-copy-y"/);
  assert.match(landingPage, /clientLayoutResizeObserver = new ResizeObserver\(updateClientCubePosition\);/);
  assert.match(landingPage, /document\.fonts\?\.ready\.then\(updateClientCubePosition\)/);
  assert.match(landingPage, /@media \(min-width: 901px\)[\s\S]*?\.vz-clients__head\s*\{[^}]*transform:\s*translateY\(var\(--client-head-y\)\);/s);
  assert.match(landingPage, /@media \(min-width: 901px\)[\s\S]*?\.vz-client-copy\s*\{[^}]*--client-copy-y:\s*24px;[^}]*transform:\s*translateY\(var\(--client-copy-y\)\);/s);
  assert.match(landingPage, /const nextTop = `\$\{Math\.round\(targetViewportY - gridRect\.top - cubeHeight \* cubeVisualCenterRatio\)\}px`;/);
  assert.match(landingPage, /@media \(min-width: 901px\)[\s\S]*?\.vz-clients\s*\{[^}]*--client-menu-reserve:\s*clamp\(40px, 4vw, 56px\);[^}]*margin-top:\s*calc\(-1 \* var\(--client-menu-reserve\)\);[^}]*padding-top:\s*calc\(var\(--section-space\) \+ var\(--client-menu-reserve\)\);/s);
  assert.match(landingPage, /@media \(min-width: 901px\)[\s\S]*?--client-menu-lift:\s*calc\(clamp\(48px, 4\.3vw, 56px\) \+ var\(--client-menu-reserve\)\);[\s\S]*?\.vz-client-capsules\s*\{[^}]*transform:\s*translateY\(calc\(-1 \* var\(--client-menu-lift\)\)\);[\s\S]*?\.vz-client-connector\s*\{[^}]*height:\s*calc\(48px \+ var\(--client-menu-lift\) \+ var\(--client-line-adjust\)\);[^}]*margin-top:\s*calc\(-1 \* var\(--client-menu-lift\)\);/s);
});

test("keeps equal desktop gaps around the client eyebrow without moving the copy", () => {
  const landingPage = readFileSync("pages/index.vue", "utf8");

  assert.match(landingPage, /const upperGap = eyebrowRect\.top - connectorRect\.bottom;/);
  assert.match(landingPage, /const lowerGap = currentTitleRect\.top - eyebrowRect\.bottom;/);
  assert.match(landingPage, /currentAdjust \+ upperGap - lowerGap/);
  assert.match(landingPage, /connector\.style\.setProperty\("--client-line-adjust", nextLineAdjust\)/);
  assert.match(landingPage, /height:\s*calc\(48px \+ var\(--client-menu-lift\) \+ var\(--client-line-adjust\)\);/);
  assert.match(landingPage, /margin-bottom:\s*calc\(-1 \* var\(--client-line-adjust\)\);/);
});

test("matches mobile hero capsules to the service capsule grid", () => {
  const landingPage = readFileSync("pages/index.vue", "utf8");

  assert.match(landingPage, /@media \(max-width: 900px\)[\s\S]*?\.vz-hero__stats\s*\{[^}]*width:\s*100%;[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[^}]*justify-items:\s*stretch;[^}]*gap:\s*6px;/s);
  assert.match(landingPage, /@media \(max-width: 900px\)[\s\S]*?\.vz-hero__stats span\s*\{[^}]*width:\s*100%;[^}]*min-height:\s*42px;[^}]*padding:\s*6px 8px;[^}]*background:\s*var\(--bg\);[^}]*font-size:\s*clamp\(0\.625rem, 0\.6rem \+ 0\.1vw, 0\.6875rem\);[^}]*line-height:\s*1\.25;[^}]*text-align:\s*center;[^}]*white-space:\s*normal;/s);
});

test("matches the mobile about label offset to the stack section divider", () => {
  const landingPage = readFileSync("pages/index.vue", "utf8");
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");
  const stackComponent = readFileSync("components/landing/LandingStack.vue", "utf8");

  assert.match(landingPage, /@media \(max-width: 900px\)[\s\S]*?\.vz-hero\s*\{[^}]*padding:\s*112px 20px 0;/);
  assert.match(aboutComponent, /@media \(max-width: 900px\)[\s\S]*?\.vz-about\s*\{[^}]*padding:\s*var\(--section-space\) 20px 0;/);
  assert.match(stackComponent, /@media \(max-width: 900px\)[\s\S]*?\.vz-stack\s*\{[^}]*padding:\s*var\(--section-space\) 0;/);
});

test("crossfades the about flow label fill instead of snapping the black state", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");

  assert.match(aboutComponent, /\.vz-about__flow-stage-label::before\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*scale\(0\.97\);[^}]*opacity 400ms ease/s);
  assert.match(aboutComponent, /\.vz-about__flow-stage\.is-active \.vz-about__flow-stage-label::before\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*scale\(1\);/s);
  assert.match(aboutComponent, /\.vz-about__flow-stage-label\s*\{[^}]*color 400ms ease,[^}]*transform 400ms var\(--ease-in-out/s);
  assert.doesNotMatch(aboutComponent, /\.vz-about__flow-stage\.is-active \.vz-about__flow-stage-label\s*\{[^}]*transition-delay/s);
});

test("exposes the final about endpoint as the localized support step", () => {
  const aboutComponent = readFileSync("components/landing/LandingAbout.vue", "utf8");
  const aboutGoo = readFileSync("components/landing/LandingAboutGoo.vue", "utf8");
  const landingPage = readFileSync("pages/index.vue", "utf8");

  for (const [locale, title, duration] of [
    ["ru", "Поддержка", "2 месяца"],
    ["en", "Support", "2 months"],
  ] as const) {
    const messages = JSON.parse(readFileSync(`locales/${locale}.json`, "utf8"));
    assert.equal(messages.landing.about.support, title);
    assert.equal(messages.landing.about.stepDetails.length, 7);
    assert.equal(messages.landing.about.stepDetails[6].duration, duration);
  }

  assert.match(aboutComponent, /class="vz-about__flow-node vz-about__flow-node--product"[\s\S]*?<button[\s\S]*?class="vz-about__endpoint-frame"/);
  assert.match(aboutComponent, /@click="\$emit\('select-step', supportStepIndex\)"/);
  assert.match(aboutComponent, /activeStepIndex === supportStepIndex/);
  assert.match(aboutComponent, /\.vz-about__flow-node--product \.vz-about__endpoint-frame:focus-visible/);
  assert.match(landingPage, /const aboutSupportStepIndex = 6;/);
  assert.match(landingPage, /Math\.min\(aboutSupportStepIndex, index\)/);
  assert.match(aboutGoo, /const LAST_STEP_INDEX = LEG_COUNT - 1;/);
  assert.match(aboutGoo, /Math\.min\(LAST_STEP_INDEX, stepIndex\)/);
});

test("keeps click navigation near 1.5 seconds and activates only the selected stage", () => {
  const aboutGoo = readFileSync("components/landing/LandingAboutGoo.vue", "utf8");
  const landingPage = readFileSync("pages/index.vue", "utf8");

  assert.match(aboutGoo, /const CLICK_NAVIGATION_TOTAL_MS = 1500;/);
  assert.match(aboutGoo, /const navigationMotionMs = CLICK_NAVIGATION_TOTAL_MS - CLICK_NAVIGATION_SETTLE_MS;/);
  assert.doesNotMatch(aboutGoo, /function emitCrossedStages/);
  assert.doesNotMatch(aboutGoo, /emitCrossedStages\(/);
  assert.match(landingPage, /function selectAboutFlowStep[\s\S]*?aboutFlowStepIndex\.value = target;[\s\S]*?aboutFlowTargetStepIndex\.value = target;/);
});

test("expands services into a three-column scene only on wide desktop", () => {
  const services = readFileSync("components/landing/LandingServices.vue", "utf8");
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");

  assert.match(services, /class="vz-services__rail"[\s\S]*?<\/div>\s*<div class="vz-service-caption"/);
  assert.match(services, /class="vz-services__callouts"[\s\S]*?activeServiceCallouts/);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?grid-template-columns:\s*minmax\(220px, 0\.75fr\) minmax\(420px, 1\.55fr\) minmax\(280px, 0\.9fr\);/);
  assert.match(css, /@media \(min-width: 901px\) and \(max-width: 1199px\)[\s\S]*?\.vz-service-caption\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2;/);
});

test("fits and animates the desktop service card around the Internet shops center", () => {
  const composable = readFileSync("composables/landing/useLandingServices.ts", "utf8");
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");

  assert.match(composable, /const ctaTop = contentCtaTop;[\s\S]*?requiredCaptionHeight[\s\S]*?caption\.style\.height = targetCaptionHeight;[\s\S]*?caption\.style\.transform = "";/);
  assert.doesNotMatch(composable, /bottomAnchoredCtaTop/);
  assert.doesNotMatch(composable, /centerOffset/);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-services__rail\s*\{[^}]*align-self:\s*center;/);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-services__nav\s*\{[^}]*grid-auto-rows:\s*46px;[^}]*gap:\s*5px;/s);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-service-caption\s*\{[^}]*align-self:\s*center;/);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-service-panel\s*\{[^}]*padding:\s*clamp\(34px, 3vw, 44px\) clamp\(8px, 1\.4vw, 20px\) 80px;/);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-service-caption > \.vz-service-panel__cta--shared\s*\{[^}]*right:\s*clamp\(8px, 1\.4vw, 20px\);[^}]*left:\s*clamp\(8px, 1\.4vw, 20px\);/s);
  assert.match(composable, /const ctaOuterInsets = readCssPixels\(ctaStyle\.left\) \+ readCssPixels\(ctaStyle\.right\);[\s\S]*?ctaWidth \+ ctaOuterInsets \+ 12/);
  assert.match(composable, /const cardBottomSpace = isWideDesktop\s*\? 24/);
  assert.match(css, /\.vz-service-caption\[data-positioned="true"\]\s*\{[^}]*height 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\),[^}]*min-height 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\);/s);
  assert.match(css, /\.vz-service-caption > \.vz-service-panel__cta--shared\[data-positioned="true"\]\s*\{[^}]*transform 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\);/s);
});

test("recalculates the service card while its dynamic width settles", () => {
  const composable = readFileSync("composables/landing/useLandingServices.ts", "utf8");

  assert.match(composable, /let layoutSettleTimer: ReturnType<typeof setTimeout> \| null = null;/);
  assert.match(composable, /function scheduleSettledRender\(\)[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?scheduleRender\(\);[\s\S]*?\}, 460\);/s);
  assert.match(composable, /function select\(index: number\)[\s\S]*?nextTick\(\(\) => \{[\s\S]*?scheduleRender\(\);[\s\S]*?scheduleSettledRender\(\);/s);
  assert.match(composable, /layoutResizeObserver\.observe\(rootRef\.value\);[\s\S]*?if \(caption\) layoutResizeObserver\.observe\(caption\);[\s\S]*?if \(sharedCta\) layoutResizeObserver\.observe\(sharedCta\);/s);
  assert.match(composable, /if \(layoutSettleTimer\) clearTimeout\(layoutSettleTimer\);[\s\S]*?layoutResizeObserver\?\.disconnect\(\);/s);
});

test("keeps the services menu visible and reveals only the global header while scrolling or approaching it", () => {
  const services = readFileSync("components/landing/LandingServices.vue", "utf8");
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");
  const landing = readFileSync("pages/index.vue", "utf8");

  assert.doesNotMatch(services, /isDesktopMenuVisible|handleDesktopMenuScroll|data-menu-visible|desktopServiceRows/);
  assert.doesNotMatch(css, /\.vz-services__nav--desktop\s*\{[^}]*opacity:\s*0;/s);
  assert.match(services, /v-for="\(service, index\) in services"/);
  assert.match(landing, /const isHeaderVisible = ref\(false\)/);
  assert.match(landing, /window\.addEventListener\("scroll", handleHeaderScroll/);
  assert.match(landing, /class="vz-nav-hover-zone"/);
  assert.match(landing, /function queueHeaderHide\(delay = 820\)/);
  assert.match(landing, /\.vz-nav\[data-nav-visible="false"\]\s*\{[^}]*opacity:\s*0;[^}]*pointer-events:\s*none;[^}]*transform:\s*translate3d\(0,\s*calc\(-100% - 24px\),\s*0\);[^}]*visibility:\s*hidden;/s);
  assert.doesNotMatch(landing, /\.vz-nav\[data-nav-visible="false"\]\s*\{[^}]*filter:\s*blur/s);
  assert.match(landing, /\.vz-nav-hover-zone\s*\{[^}]*height:\s*96px;/s);
});

test("balances service capsules into fitted rows without changing the card width", () => {
  const services = readFileSync("components/landing/LandingServices.vue", "utf8");
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");
  const labels = ["Каталог и UX", "Дизайн магазина", "Оплата и CRM", "Запуск и аналитика"];
  const balanced = balanceServiceCapsules(labels);
  const rows = balanceServiceCapsuleRows(labels);

  assert.equal(balanced.length, labels.length);
  assert.deepEqual([...balanced].sort(), [...labels].sort());
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.length), [2, 2]);
  assert.deepEqual(rows.flat(), balanced);
  assert.ok(estimateServiceCapsuleWidth("Запуск и аналитика") > estimateServiceCapsuleWidth("Оплата и CRM"));
  assert.match(services, /const balancedCommercialCapsuleRows = computed/);
  assert.match(services, /balanceServiceCapsuleRows\(included\)/);
  assert.match(services, /class="vz-service-commercial__chips-row"/);
  assert.match(css, /Each balanced row sizes independently[\s\S]*?row-gap:\s*8px;[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);[\s\S]*?grid-template-rows:\s*repeat\(2, auto\);/);
  assert.match(css, /\.vz-service-commercial__chips-row\s*\{[^}]*display:\s*flex;[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*min-width:\s*0;[^}]*flex-wrap:\s*wrap;/s);
  assert.doesNotMatch(css, /--service-card-left-expansion/);
});

test("gives desktop service cards extra vertical capacity around a fixed center", () => {
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");

  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-services__grid\s*\{[^}]*grid-template-rows:\s*clamp\(500px, 37vw, 560px\);/s);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-service-caption\s*\{[^}]*height:\s*clamp\(528px, 37vw, 560px\);[^}]*align-self:\s*center;/s);
});

test("sizes desktop service cards from their content while keeping the left edge fixed", () => {
  const services = readFileSync("composables/landing/useLandingServices.ts", "utf8");
  const css = readFileSync("assets/css/landing-redesign.css", "utf8");

  assert.match(services, /function getDesktopCaptionWidth\(/);
  assert.match(services, /const captionWidthCache = new WeakMap/);
  assert.match(services, /descriptionWidth = Math\.min\(248, measureBalancedTwoLineText\(description\)\)/);
  assert.match(services, /ctaWidth = Math\.max\(measureBalancedTwoLineText\(ctaSmall\), measureText\(ctaStrong\)\)/);
  assert.match(services, /preferredContentWidth = Math\.max\(titleWidth, descriptionWidth, metricsWidth, chipWidth\)/);
  assert.match(services, /Math\.min\(availableWidth, 420, Math\.max\(292, naturalWidth\)\)/);
  assert.match(services, /caption\.style\.width !== targetCaptionWidth/);
  assert.match(css, /@media \(min-width: 1200px\)[\s\S]*?\.vz-service-caption\s*\{[^}]*min-width:\s*0;[^}]*justify-self:\s*start;/s);
  assert.match(css, /\.vz-service-caption\[data-positioned="true"\]\s*\{[^}]*width 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\)/s);
});

test("matches desktop service-label typography to the case tabs", () => {
  const caseCss = readFileSync("assets/css/landing-cases.css", "utf8");
  const serviceCss = readFileSync("assets/css/landing-redesign.css", "utf8");

  assert.match(caseCss, /\.vz-cases__tabs button b\s*\{[^}]*font-family:\s*var\(--font-ui[^}]*font-size:\s*13px;[^}]*font-weight:\s*500;[^}]*line-height:\s*1\.25;[^}]*letter-spacing:\s*\.01em;[^}]*text-transform:\s*uppercase;/s);
  assert.match(serviceCss, /@media \(min-width: 901px\)\s*\{[^}]*\.vz-services__nav button \[data-serv-nav-label\],[^}]*font-family:\s*var\(--font-ui[^}]*font-size:\s*12px;[^}]*font-weight:\s*500;[^}]*line-height:\s*1\.25;[^}]*letter-spacing:\s*\.01em;[^}]*text-transform:\s*uppercase;/s);
});

test("expands a service highlight rectangle on both axes without a midpoint", () => {
  assert.deepEqual(
    getServiceHighlightTargetBounds({ x: 20, y: 30, width: 80, height: 18 }, 16, 7),
    { x: 4, y: 23, width: 112, height: 32 },
  );

  assert.deepEqual(
    getServiceHighlightFrames(
      { x: 4, y: 23, width: 112, height: 32 },
      { x: 4, y: 71, width: 96, height: 32 },
    ),
    [
      { x: 4, y: 23, width: 112, height: 32 },
      { x: 4, y: 71, width: 96, height: 32 },
    ],
  );
});

test("moves the mobile service fill forward without a midpoint reversal", () => {
  assert.deepEqual(
    getServiceHighlightFrames(
      { x: 10, y: 0, width: 30, height: 19 },
      { x: 100, y: 0, width: 50, height: 19 },
    ),
    [
      { x: 10, y: 0, width: 30, height: 19 },
      { x: 100, y: 0, width: 50, height: 19 },
    ],
  );
});

test("moves the mobile service fill backward without a midpoint reversal", () => {
  assert.deepEqual(
    getServiceHighlightFrames(
      { x: 100, y: 0, width: 50, height: 19 },
      { x: 10, y: 0, width: 30, height: 19 },
    ),
    [
      { x: 100, y: 0, width: 50, height: 19 },
      { x: 10, y: 0, width: 30, height: 19 },
    ],
  );
});

test("drives the shared mobile service fill from live navigation geometry", () => {
  const servicesComposable = readFileSync("composables/landing/useLandingServices.ts", "utf8");

  assert.match(servicesComposable, /getServiceHighlightFrames/);
  assert.match(servicesComposable, /getServiceHighlightTargetBounds/);
  assert.match(servicesComposable, /querySelector<HTMLElement>\("\[data-serv-nav-highlight\]"\)/);
  assert.match(servicesComposable, /highlight\.animate\(/);
  assert.match(servicesComposable, /duration:\s*380/);
  assert.match(servicesComposable, /prefers-reduced-motion:\s*reduce/);
  assert.match(servicesComposable, /function handleResize\(\)/);
  assert.match(servicesComposable, /if \(isReady && !activeChanged\) return;/);
  assert.match(servicesComposable, /y:\s*elementRect\.top - navRect\.top/);
  assert.match(servicesComposable, /height:\s*elementRect\.height/);
  assert.match(servicesComposable, /placeHighlight\(highlight, targetBounds\)/);
});

test("returns deterministic points for both orbit ellipses", () => {
  assert.deepEqual(getMobileOrbitPoint(0, "outer"), { x: 1.88, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, "outer"), { x: 0, y: 1.08, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(0, "inner"), { x: 1.6, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, "inner"), { x: 0, y: 0.92, z: 0 });
});

test("phase-locks compact Mobile tracks so their spacing cannot drift", () => {
  assert.equal(getMobileOrbitAngle(8_000, "outer", 0), Math.PI / 2);
  assert.equal(getMobileOrbitAngle(8_000, "inner", 0), Math.PI / 2);
  assert.equal(getMobileOrbitAngle(0, "outer", Math.PI), Math.PI);
  assert.equal(MOBILE_ORBIT_TRACKS.outer.durationMs, 32_000);
  assert.equal(MOBILE_ORBIT_TRACKS.inner.durationMs, 32_000);
  assert.equal(MOBILE_ORBIT_TRACKS.outer.direction, 1);
  assert.equal(MOBILE_ORBIT_TRACKS.inner.direction, 1);
});

test("uses the hidden shell at both Mobile viewport sizes", () => {
  assert.deepEqual(getStackLayerTargets("mobile", true), {
    bridge: 0.52,
    core: 0.48,
    surface: 0,
  });
  assert.deepEqual(getStackLayerTargets("mobile", false), {
    bridge: 0.52,
    core: 0.48,
    surface: 0,
  });
  assert.equal(getStackGroupScale("core", "mobile", true), 0.5);
  assert.equal(getStackGroupScale("core", "mobile", false), 0.596);
});

test("keeps compact Mobile orbit lines outside the shared sphere fade mask", () => {
  const pageSource = readFileSync("pages/index.vue", "utf8");

  assert.match(
    pageSource,
    /\.vz-stack__sphere\[data-layer="mobile"\] canvas\s*\{[^}]*mask-image:\s*none;/s,
  );
});

test("gives compact Mobile a wider canvas without enlarging its scene", () => {
  const pageSource = readFileSync("pages/index.vue", "utf8");

  assert.match(
    pageSource,
    /\.vz-stack__sphere\[data-layer="mobile"\]\s*\{[^}]*--stack-sphere-size:\s*min\(92vw,\s*390px\);/s,
  );
  assert.match(
    pageSource,
    /\.vz-stack__sphere\[data-layer="mobile"\]\s*\{[^}]*top:\s*calc\(clamp\(-30px,\s*-7vw,\s*-20px\)\s*-\s*min\(7vw,\s*30px\)\);/s,
  );
  assert.equal(getStackCameraFov("mobile", 900), 41);
  assert.equal(getStackCameraFov("mobile", 901), 35);
  assert.equal(getStackCameraFov("surface", 390), 35);
});

test("phase-locks desktop Mobile tracks so their spacing cannot drift", () => {
  assert.equal(getDesktopMobileOrbitAngle(9_000, "outer", 0), Math.PI / 2);
  assert.equal(getDesktopMobileOrbitAngle(9_000, "inner", 0), Math.PI / 2);

  const expo = MOBILE_ORBIT_TECH.find(({ label }) => label === "Expo")!;
  const pwa = MOBILE_ORBIT_TECH.find(({ label }) => label === "PWA")!;

  const expoPoint = getDesktopMobileTechnologyPoint(expo, 0);
  const pwaPoint = getDesktopMobileTechnologyPoint(pwa, 0);

  assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.outer.durationMs, 36_000);
  assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.inner.durationMs, 36_000);
  assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.outer.direction, 1);
  assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.inner.direction, 1);
  assert.deepEqual(pwaPoint, {
    x: -expoPoint.x,
    y: -expoPoint.y,
    z: 0,
  });
});

test("keeps desktop Mobile labels on orbit paths that fit the sphere viewport", () => {
  assert.deepEqual(getDesktopMobileOrbitPoint(0, "outer"), {
    x: 1.7,
    y: 0,
    z: 0,
  });
  assert.deepEqual(getDesktopMobileOrbitPoint(Math.PI / 2, "outer"), {
    x: 0,
    y: 0.92,
    z: 0,
  });
  assert.deepEqual(getDesktopMobileOrbitPoint(0, "inner"), {
    x: 1.38,
    y: 0,
    z: 0,
  });
  assert.deepEqual(getDesktopMobileOrbitPoint(Math.PI / 2, "inner"), {
    x: 0,
    y: 0.72,
    z: 0,
  });

  for (const spec of MOBILE_ORBIT_TECH) {
    const elapsedMs = 7_500;
    const angle = getDesktopMobileOrbitAngle(
      elapsedMs,
      spec.orbit,
      spec.desktopPhase ?? spec.phase,
    );
    assert.deepEqual(
      getDesktopMobileTechnologyPoint(spec, elapsedMs),
      getDesktopMobileOrbitPoint(angle, spec.orbit),
    );
  }
});

test("keeps desktop Mobile labels fully visible at every depth", () => {
  assert.deepEqual(getDesktopMobileLabelDepthStyle(-1.6), {
    opacity: 1,
    scale: 1,
  });
  assert.deepEqual(getDesktopMobileLabelDepthStyle(1.6), {
    opacity: 1,
    scale: 1,
  });
});

test("lifts desktop Mobile labels above a small monochrome orbit anchor", () => {
  assert.equal(getDesktopMobileLabelLiftPx("mobile", false), 28);
  assert.equal(getDesktopMobileLabelLiftPx("mobile", true), 28);
  assert.equal(getDesktopMobileLabelLiftPx("surface", false), 0);
  assert.equal(DESKTOP_MOBILE_LABEL_ANCHOR_RADIUS, 0.055);
});

test("wraps the Vezha Digital belt evenly around the desktop Mobile core", () => {
  const glyphCount = Array.from(DESKTOP_MOBILE_CORE_BELT_TEXT).length;

  assert.deepEqual(getDesktopMobileCoreBeltPoint(0, glyphCount, 0), {
    x: 0.84,
    y: -0.07,
    z: 0,
  });
  assert.deepEqual(
    getDesktopMobileCoreBeltPoint(glyphCount / 4, glyphCount, 0),
    { x: 0, y: -0.07, z: -0.84 },
  );
  assert.deepEqual(
    getDesktopMobileCoreBeltPoint(0, glyphCount, 11_000),
    { x: 0, y: -0.07, z: 0.84 },
  );
  assert.equal(DESKTOP_MOBILE_CORE_BELT_DURATION_MS, 44_000);
  assert.equal(DESKTOP_MOBILE_CORE_BELT_Z_INDEX, 40);
});

test("detects projected Mobile label conflicts symmetrically", () => {
  const first = { centerX: 100, centerY: 100, height: 30, width: 90 };
  const overlapping = { centerX: 150, centerY: 105, height: 30, width: 90 };
  const separated = { centerX: 210, centerY: 105, height: 30, width: 90 };

  assert.equal(doMobileLabelBoundsOverlap(first, overlapping, 8), true);
  assert.equal(doMobileLabelBoundsOverlap(overlapping, first, 8), true);
  assert.equal(doMobileLabelBoundsOverlap(first, separated, 8), false);
});

test("keeps both desktop Mobile orbit clocks moving continuously", () => {
  assert.equal(getContinuousOrbitElapsed(10_000, 16.67), 10_016.67);
  assert.equal(getContinuousOrbitElapsed(10_000, -16.67), 10_000);
});

test("keeps Mobile labels visible at both viewport boundaries", () => {
  assert.equal(getStackLabelHorizontalOpacity("mobile", -1.2), 1);
  assert.equal(getStackLabelHorizontalOpacity("mobile", 0), 1);
  assert.equal(getStackLabelHorizontalOpacity("mobile", 1.2), 1);
  assert.equal(getStackLabelHorizontalOpacity("surface", 0.9), 0);
});

test("slightly enlarges only the mobile viewport Backend core", () => {
  assert.equal(getStackGroupScale("core", "core", false, true), 1.52);
  assert.equal(getStackGroupScale("core", "core", false, false), 1.4);
});

test("rotates compact Mobile sticks through a desktop-style full turn", () => {
  const start = getCompactMobileRootRotation(0);
  const quarterTurn = getCompactMobileRootRotation(11_000);
  const fullTurn = getCompactMobileRootRotation(44_000);

  assert.equal(start.y, -0.4);
  assert.equal(quarterTurn.y, -0.4 - Math.PI / 2);
  assert.equal(fullTurn.y, -0.4 - Math.PI * 2);

  for (let elapsedMs = 0; elapsedMs <= 44_000; elapsedMs += 2_000) {
    const rotation = getCompactMobileRootRotation(elapsedMs);
    assert.ok(rotation.x >= -0.24 && rotation.x <= -0.08);
    assert.ok(rotation.z >= 0.035 && rotation.z <= 0.125);
  }
});

test("reverses only the desktop Mobile planet rotation", () => {
  assert.equal(getStackRootRotationDelta("desktop", 1), -0.0022);
  assert.equal(getStackRootRotationDelta("hidden", 1), 0.0022);
  assert.equal(getStackRootRotationDelta("desktop", -1), 0);
});

test("keeps compact Mobile orbit tracks outside the rotating stick group", () => {
  const sphereSource = readFileSync(
    "composables/landing/useLandingStackSphere.ts",
    "utf8",
  );

  assert.match(
    sphereSource,
    /scene\.add\(rootGroup,\s*desktopOrbitRoot,\s*compactOrbitRoot,\s*desktopLabelRoutesGroup\);/s,
  );
  assert.match(
    sphereSource,
    /compactOrbitRoot\.add\(\s*compactOrbitGroups\.outer,\s*compactOrbitGroups\.inner,\s*\);/s,
  );
});

test("resolves compact orbit mode only for Mobile at the 900px boundary", () => {
  assert.equal(resolveMobileOrbitMode("mobile", 900), "compact");
  assert.equal(resolveMobileOrbitMode("mobile", 901), "desktop");
  assert.equal(resolveMobileOrbitMode("surface", 390), "hidden");
});

test("moves only compact Mobile technologies along their assigned tracks", () => {
  const outerAtZero = { orbit: "outer" as const, phase: 0 };
  assert.deepEqual(
    getMobileTechnologyPoint(outerAtZero, 8_000, "compact"),
    { x: 0, y: 1.08, z: 0 },
  );
  assert.deepEqual(
    getMobileTechnologyPoint(outerAtZero, 8_000, "desktop"),
    { x: 1.88, y: 0, z: 0 },
  );
});

test("keeps compact Mobile labels fully visible at every depth", () => {
  assert.deepEqual(getMobileLabelDepthStyle(-1.2), {
    opacity: 1,
    scale: 0.86,
  });
  assert.deepEqual(getMobileLabelDepthStyle(1.2), {
    opacity: 1,
    scale: 0.86,
  });
});

test("rotates the compact Mobile core continuously", () => {
  assert.equal(getCompactMobileCoreRotation(0), 0);
  assert.equal(getCompactMobileCoreRotation(11_000), Math.PI / 2);
  assert.equal(getCompactMobileCoreRotation(44_000), Math.PI * 2);
});

test("preserves projected label height only for the Mobile visual layer", () => {
  assert.equal(shouldPreserveStackLabelVerticalPosition("mobile"), true);
  assert.equal(shouldPreserveStackLabelVerticalPosition("surface"), false);
  assert.equal(shouldPreserveStackLabelVerticalPosition("core"), false);
  assert.equal(shouldPreserveStackLabelVerticalPosition("bridge"), false);
});

test("keeps desktop Mobile labels out of Frontend latitude rendering", () => {
  assert.equal(shouldUseDesktopStackLatitudeRoutes("surface", 1440), true);
  assert.equal(shouldUseDesktopStackLatitudeRoutes("core", 1440), true);
  assert.equal(shouldUseDesktopStackLatitudeRoutes("bridge", 1440), false);
  assert.equal(shouldUseDesktopStackLatitudeRoutes("mobile", 1440), false);
  assert.equal(shouldUseDesktopStackLatitudeRoutes("surface", 900), false);
});

test("moves desktop labels left to right on four latitude routes", () => {
  const start = getDesktopStackLabelRouteState(0, 0, 4);
  const middle = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS / 2,
    0,
    4,
  );
  const end = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS - 1,
    0,
    4,
  );

  assert.equal(DESKTOP_STACK_LABEL_LANES.length, 4);
  assert.equal(start.laneIndex, 0);
  assert.ok(start.point.x < middle.point.x);
  assert.ok(middle.point.x < end.point.x);
  assert.equal(start.opacity, 0);
  assert.equal(middle.opacity, 1);
  assert.ok(end.opacity < 0.001);
});

test("keeps moving at the right edge while fading out before arrival", () => {
  const atProgress = (progress: number) => getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * progress,
    0,
    1,
  );
  const at70 = atProgress(0.7);
  const at80 = atProgress(0.8);
  const at90 = atProgress(0.9);
  const atEdge = atProgress(0.999);
  const firstStep = at80.point.x - at70.point.x;
  const secondStep = at90.point.x - at80.point.x;

  assert.ok(Math.abs(firstStep - secondStep) < 0.001);
  assert.equal(at70.opacity, 1);
  assert.ok(at80.opacity < at70.opacity);
  assert.ok(at90.opacity < at80.opacity);
  assert.ok(atEdge.opacity < 0.001);
  assert.ok(atEdge.point.x > at90.point.x);
});

test("scales backend desktop routes to half the frontend sphere", () => {
  const elapsed = DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * 0.43;
  const frontend = getDesktopStackLabelRouteState(elapsed, 0, 4);
  const backend = getDesktopStackLabelRouteState(elapsed, 0, 4, 0.5);

  assert.equal(backend.point.x, Number((frontend.point.x * 0.5).toFixed(6)));
  assert.equal(backend.point.y, Number((frontend.point.y * 0.5).toFixed(6)));
  assert.equal(backend.point.z, Number((frontend.point.z * 0.5).toFixed(6)));
  assert.equal(backend.opacity, frontend.opacity);
  assert.equal(backend.progress, frontend.progress);
  assert.equal(backend.laneIndex, frontend.laneIndex);
  assert.equal(backend.jitterPx, frontend.jitterPx);
});

test("moves backend outer routes toward the poles", () => {
  const laneYs = Array.from({ length: 4 }, (_, traversal) => (
    getDesktopStackLabelRouteState(
      DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * traversal,
      0,
      4,
      BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE,
    ).point.y
  ));

  assert.deepEqual(laneYs, [0.58, 0.16, -0.16, -0.58]);
});

test("fits four frontend latitude chords into the visible mobile sphere", () => {
  const routes = Array.from({ length: 4 }, (_, traversal) => (
    getDesktopStackLabelRouteState(
      DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * traversal,
      0,
      4,
      MOBILE_FRONTEND_STACK_LABEL_ROUTE_PROFILE,
    )
  ));

  assert.deepEqual(routes.map(({ point }) => point.y), [
    1.35,
    0.99,
    0.63,
    0.27,
  ]);
  assert.deepEqual(routes.map(({ point }) => Number(
    Math.hypot(point.x, point.z).toFixed(4),
  )), [
    0.8944,
    1.2807,
    1.4907,
    1.5954,
  ]);
});

test("fits four backend latitude chords into its enlarged mobile core", () => {
  const routes = Array.from({ length: 4 }, (_, traversal) => (
    getDesktopStackLabelRouteState(
      DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * traversal,
      0,
      4,
      MOBILE_BACKEND_STACK_LABEL_ROUTE_PROFILE,
    )
  ));

  assert.deepEqual(routes.map(({ point }) => point.y), [
    0.98,
    0.72,
    0.46,
    0.2,
  ]);
  assert.deepEqual(routes.map(({ point }) => Number(
    Math.hypot(point.x, point.z).toFixed(4),
  )), [
    0.2198,
    0.6994,
    0.8918,
    0.9831,
  ]);
});

test("attaches DevOps labels to their sticks at every viewport width", () => {
  assert.equal(shouldUseStackBridgeAttachment("bridge", 390), true);
  assert.equal(shouldUseStackBridgeAttachment("bridge", 900), true);
  assert.equal(shouldUseStackBridgeAttachment("bridge", 1440), true);
  assert.equal(shouldUseStackBridgeAttachment("surface", 390), false);
});

test("gates backend label appearance by same-lane edge clearance", () => {
  const candidate = { centerX: 100, laneIndex: 0, width: 84 };

  assert.equal(getBackendStackLabelClearanceFactor(candidate, [
    { centerX: 198, laneIndex: 0, width: 84 },
  ]), 0);
  assert.equal(getBackendStackLabelClearanceFactor(candidate, [
    { centerX: 210, laneIndex: 0, width: 84 },
  ]), 0.5);
  assert.equal(getBackendStackLabelClearanceFactor(candidate, [
    { centerX: 222, laneIndex: 0, width: 84 },
  ]), 1);
  assert.equal(getBackendStackLabelClearanceFactor(candidate, [
    { centerX: 198, laneIndex: 1, width: 84 },
  ]), 1);
});

test("delays mobile DevOps appearance only for close labels on the same route", () => {
  const candidate = { centerX: 100, laneIndex: 0, width: 84 };

  assert.equal(getMobileDevOpsLabelClearanceFactor(candidate, [
    { centerX: 198, laneIndex: 0, width: 84 },
  ]), 0);
  assert.equal(getMobileDevOpsLabelClearanceFactor(candidate, [
    { centerX: 2, laneIndex: 0, width: 84 },
  ]), 0);
  assert.equal(getMobileDevOpsLabelClearanceFactor(candidate, [
    { centerX: 222, laneIndex: 0, width: 84 },
  ]), 1);
  assert.equal(getMobileDevOpsLabelClearanceFactor(candidate, [
    { centerX: 100, laneIndex: 1, width: 84 },
  ]), 1);
});

test("pauses a blocked backend label route and resumes from the same point", () => {
  const initial = advanceBackendStackLabelClock(1_000, null, false);
  const moving = advanceBackendStackLabelClock(1_200, initial.state, false);
  const paused = advanceBackendStackLabelClock(1_500, moving.state, true);
  const stillPaused = advanceBackendStackLabelClock(
    1_800,
    paused.state,
    true,
  );
  const resumed = advanceBackendStackLabelClock(
    2_000,
    stillPaused.state,
    false,
  );

  assert.equal(initial.effectiveElapsedMs, 0);
  assert.equal(moving.effectiveElapsedMs, 200);
  assert.equal(paused.effectiveElapsedMs, 200);
  assert.equal(stillPaused.effectiveElapsedMs, 200);
  assert.equal(resumed.effectiveElapsedMs, 400);
});

test("hands desktop labels off invisibly and wraps lane four to lane one", () => {
  const secondLane = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS,
    0,
    4,
  );
  const firstLaneAgain = getDesktopStackLabelRouteState(
    DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * 4,
    0,
    4,
  );

  assert.equal(secondLane.laneIndex, 1);
  assert.equal(secondLane.progress, 0);
  assert.equal(secondLane.opacity, 0);
  assert.equal(firstLaneAgain.laneIndex, 0);
  assert.equal(firstLaneAgain.progress, 0);
  assert.equal(firstLaneAgain.opacity, 0);
});

test("phases desktop labels evenly instead of switching them together", () => {
  assert.deepEqual(
    Array.from({ length: 4 }, (_, index) => (
      getDesktopStackLabelRouteState(0, index, 4).progress
    )),
    [0, 0.25, 0.5, 0.75],
  );
});

test("keeps desktop traversal jitter stable and within three pixels", () => {
  for (let traversal = 0; traversal < 12; traversal += 1) {
    const elapsed = traversal * DESKTOP_STACK_LABEL_ROUTE_DURATION_MS + 1_234;
    const first = getDesktopStackLabelRouteState(elapsed, 2, 5);
    const repeated = getDesktopStackLabelRouteState(elapsed, 2, 5);
    const laterOnSameRoute = getDesktopStackLabelRouteState(
      elapsed + 500,
      2,
      5,
    );

    assert.equal(first.jitterPx, repeated.jitterPx);
    assert.equal(first.jitterPx, laterOnSameRoute.jitterPx);
    assert.ok(first.jitterPx >= -3 && first.jitterPx <= 3);
  }
});
