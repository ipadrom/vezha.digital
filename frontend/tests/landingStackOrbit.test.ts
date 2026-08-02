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
} from "../utils/landingStackOrbit";
import { getServiceHighlightFrames } from "../utils/landingServicesHighlight";

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
  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*gap:\s*5px;/);
  assert.match(mobileCss, /\.vz-services__nav\s*\{[^}]*padding:\s*2px 0 24px;/);
  assert.match(servicesComponent, /data-serv-nav-highlight/);
  assert.match(mobileCss, /\.vz-services \[data-sec-head\]\s*\{[^}]*margin-bottom:\s*8px;/);
  assert.match(mobileCss, /\.vz-services__nav-highlight\s*\{[^}]*background:\s*#33434b;/);
  assert.match(mobileCss, /\.vz-services__nav button\s*\{[^}]*border:\s*1px solid transparent;/);
  assert.match(mobileCss, /\.vz-services__nav button\s*\{[^}]*min-height:\s*0;/);
  assert.match(mobileCss, /\.vz-services__nav button\s*\{[^}]*transition:\s*none;/);
  assert.match(mobileCss, /\.vz-services__nav button span:first-child\s*\{[^}]*display:\s*none;/);
  assert.match(mobileCss, /button \[data-serv-nav-label\]\s*\{[^}]*font-size:\s*11px;/);
  assert.doesNotMatch(mobileCss, /button \[data-serv-nav-label\]\s*\{[^}]*top:/);
  assert.match(mobileCss, /button\[data-active="true"\]\s*\{[^}]*padding:\s*4px 0;/);
  assert.match(mobileCss, /button\[data-active="true"\]\s*\{[^}]*background:\s*transparent;/);
  assert.match(mobileCss, /button\[data-active="true"\] \[data-serv-nav-label\]\s*\{[^}]*linear-gradient\(104deg, #ad9cff 0%, #51d8ff 100%\)/);
  assert.match(mobileCss, /button\[data-active="true"\] \[data-serv-nav-label\]\s*\{[^}]*font-weight:\s*400;/);
  assert.doesNotMatch(
    css,
    /\.vz-services__nav button\[data-active="true"\]\s*\{\s*background:\s*var\(--ink\);/,
  );
});

test("keeps service text fixed while expanding only the highlight background", () => {
  const highlightSource = readFileSync("utils/landingServicesHighlight.ts", "utf8");

  assert.match(highlightSource, /export function getServiceHighlightTargetBounds/);
  assert.match(highlightSource, /x:\s*bounds\.x - horizontalPadding/);
  assert.match(highlightSource, /width:\s*bounds\.width \+ horizontalPadding \* 2/);
});

test("narrows the mobile service fill while moving forward", () => {
  assert.deepEqual(
    getServiceHighlightFrames({ x: 10, width: 30 }, { x: 100, width: 50 }),
    [
      { x: 10, width: 30 },
      { x: 64.2, width: 21.6 },
      { x: 100, width: 50 },
    ],
  );
});

test("narrows the mobile service fill while moving backward", () => {
  assert.deepEqual(
    getServiceHighlightFrames({ x: 100, width: 50 }, { x: 10, width: 30 }),
    [
      { x: 100, width: 50 },
      { x: 64.2, width: 21.6 },
      { x: 10, width: 30 },
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
  assert.match(servicesComposable, /const targetTop = target\.offsetTop;/);
  assert.match(servicesComposable, /placeHighlight\(highlight, targetBounds, targetTop, target\.offsetHeight\)/);
  assert.doesNotMatch(servicesComposable, /targetRect\.top - navRect\.top/);
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
