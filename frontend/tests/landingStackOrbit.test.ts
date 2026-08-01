import assert from "node:assert/strict";
import test from "node:test";
import {
  BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE,
  DESKTOP_MOBILE_ORBIT_TRACKS,
  DESKTOP_STACK_LABEL_LANES,
  DESKTOP_STACK_LABEL_ROUTE_DURATION_MS,
  MOBILE_BACKEND_STACK_LABEL_ROUTE_PROFILE,
  MOBILE_FRONTEND_STACK_LABEL_ROUTE_PROFILE,
  MOBILE_ORBIT_TECH,
  advanceBackendStackLabelClock,
  doMobileLabelBoundsOverlap,
  getCollisionSafeOrbitElapsed,
  getCompactMobileRootRotation,
  getBackendStackLabelClearanceFactor,
  getDesktopDevOpsBridgeRoute,
  getDesktopMobileLabelDepthStyle,
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
  getStackGroupScale,
  getStackLayerTargets,
  getStackMaterialBaseOpacity,
  resolveMobileOrbitMode,
  resolveStackVisualLayer,
  shouldUseStackBridgeAttachment,
} from "../utils/landingStackOrbit";

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

test("keeps the desktop Mobile layers at their existing emphasis", () => {
  assert.deepEqual(getStackLayerTargets("mobile"), {
    bridge: 0.52,
    core: 0.48,
    surface: 0.58,
  });
});

test("assigns technologies to two compact Mobile tracks", () => {
  assert.deepEqual(
    MOBILE_ORBIT_TECH.map(({ label, orbit }) => [label, orbit]),
    [
      ["React Native", "outer"],
      ["Expo", "inner"],
      ["PWA", "inner"],
      ["Flutter", "outer"],
    ],
  );
});

test("returns deterministic points for both orbit ellipses", () => {
  assert.deepEqual(getMobileOrbitPoint(0, "outer"), { x: 2.02, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, "outer"), { x: 0, y: 1.08, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(0, "inner"), { x: 1.72, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, "inner"), { x: 0, y: 0.92, z: 0 });
});

test("advances the slower tracks in opposite directions", () => {
  assert.equal(getMobileOrbitAngle(8_000, "outer", 0), Math.PI / 2);
  assert.equal(getMobileOrbitAngle(6_000, "inner", 0), -Math.PI / 2);
  assert.equal(getMobileOrbitAngle(0, "outer", Math.PI), Math.PI);
});

test("uses compact-only Mobile shell opacity and core scale", () => {
  assert.deepEqual(getStackLayerTargets("mobile", true), {
    bridge: 0.52,
    core: 0.48,
    surface: 0,
  });
  assert.deepEqual(getStackLayerTargets("mobile", false), {
    bridge: 0.52,
    core: 0.48,
    surface: 0.58,
  });
  assert.equal(getStackGroupScale("core", "mobile", true), 0.5);
  assert.equal(getStackGroupScale("core", "mobile", false), 1.192);
});

test("moves desktop Mobile pairs on two slow counter-rotating orbits", () => {
  assert.equal(getDesktopMobileOrbitAngle(9_000, "outer", 0), Math.PI / 2);
  assert.equal(getDesktopMobileOrbitAngle(7_000, "inner", 0), -Math.PI / 2);

  const reactNative = MOBILE_ORBIT_TECH.find(({ label }) => label === "React Native")!;
  const flutter = MOBILE_ORBIT_TECH.find(({ label }) => label === "Flutter")!;
  const expo = MOBILE_ORBIT_TECH.find(({ label }) => label === "Expo")!;
  const pwa = MOBILE_ORBIT_TECH.find(({ label }) => label === "PWA")!;

  const reactPoint = getDesktopMobileTechnologyPoint(reactNative, 0);
  const flutterPoint = getDesktopMobileTechnologyPoint(flutter, 0);
  const expoPoint = getDesktopMobileTechnologyPoint(expo, 0);
  const pwaPoint = getDesktopMobileTechnologyPoint(pwa, 0);

  assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.outer.durationMs, 36_000);
  assert.equal(DESKTOP_MOBILE_ORBIT_TRACKS.inner.durationMs, 28_000);
  assert.deepEqual(flutterPoint, {
    x: -reactPoint.x,
    y: -reactPoint.y,
    z: 0,
  });
  assert.deepEqual(pwaPoint, {
    x: -expoPoint.x,
    y: -expoPoint.y,
    z: 0,
  });
});

test("keeps desktop Mobile labels on orbit paths that fit the sphere viewport", () => {
  assert.deepEqual(getDesktopMobileOrbitPoint(0, "outer"), {
    x: 1.48,
    y: 0,
    z: 0,
  });
  assert.deepEqual(getDesktopMobileOrbitPoint(Math.PI / 2, "outer"), {
    x: 0,
    y: 0.92,
    z: 0,
  });
  assert.deepEqual(getDesktopMobileOrbitPoint(0, "inner"), {
    x: 1.14,
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
      spec.phase,
    );
    assert.deepEqual(
      getDesktopMobileTechnologyPoint(spec, elapsedMs),
      getDesktopMobileOrbitPoint(angle, spec.orbit),
    );
  }
});

test("shrinks desktop Mobile labels only while they move behind the core", () => {
  assert.deepEqual(getDesktopMobileLabelDepthStyle(-1.6), {
    opacity: 0.42,
    scale: 0.84,
  });
  assert.deepEqual(getDesktopMobileLabelDepthStyle(1.6), {
    opacity: 1,
    scale: 1,
  });
});

test("detects projected Mobile label conflicts symmetrically", () => {
  const first = { centerX: 100, centerY: 100, height: 30, width: 90 };
  const overlapping = { centerX: 150, centerY: 105, height: 30, width: 90 };
  const separated = { centerX: 210, centerY: 105, height: 30, width: 90 };

  assert.equal(doMobileLabelBoundsOverlap(first, overlapping, 8), true);
  assert.equal(doMobileLabelBoundsOverlap(overlapping, first, 8), true);
  assert.equal(doMobileLabelBoundsOverlap(first, separated, 8), false);
});

test("retains the inner orbit phase while a projected conflict is blocked", () => {
  assert.equal(getCollisionSafeOrbitElapsed(10_000, 16.67, true), 10_000);
  assert.equal(getCollisionSafeOrbitElapsed(10_000, 16.67, false), 10_016.67);
});

test("slightly enlarges only the mobile viewport Backend core", () => {
  assert.equal(getStackGroupScale("core", "core", false, true), 1.52);
  assert.equal(getStackGroupScale("core", "core", false, false), 1.4);
});

test("keeps compact Mobile root drift slow and tightly bounded", () => {
  assert.deepEqual(getCompactMobileRootRotation(0), {
    x: -0.16,
    y: -0.4,
    z: 0.08,
  });

  for (let elapsedMs = 0; elapsedMs <= 360_000; elapsedMs += 10_000) {
    const rotation = getCompactMobileRootRotation(elapsedMs);
    assert.ok(rotation.x >= -0.172 && rotation.x <= -0.148);
    assert.ok(rotation.y >= -0.41 && rotation.y <= -0.39);
    assert.ok(rotation.z >= 0.072 && rotation.z <= 0.088);
  }
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
    { x: 2.02, y: 0, z: 0 },
  );
});

test("dims and shrinks labels behind the core without hiding them", () => {
  assert.deepEqual(getMobileLabelDepthStyle(-1.2), {
    opacity: 0.58,
    scale: 0.78,
  });
  assert.deepEqual(getMobileLabelDepthStyle(1.2), {
    opacity: 1,
    scale: 0.96,
  });
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
