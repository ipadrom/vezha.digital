import assert from "node:assert/strict";
import test from "node:test";
import {
  DESKTOP_STACK_LABEL_LANES,
  DESKTOP_STACK_LABEL_ROUTE_DURATION_MS,
  MOBILE_ORBIT_TECH,
  getCompactMobileRootRotation,
  getDesktopStackLabelRouteState,
  getMobileLabelDepthStyle,
  getMobileOrbitAngle,
  getMobileOrbitPoint,
  getMobileTechnologyPoint,
  getStackGroupScale,
  getStackLayerTargets,
  resolveMobileOrbitMode,
  resolveStackVisualLayer,
} from "../utils/landingStackOrbit";

test("maps stack titles to visual states", () => {
  assert.equal(resolveStackVisualLayer("Frontend"), "surface");
  assert.equal(resolveStackVisualLayer("Backend"), "core");
  assert.equal(resolveStackVisualLayer("DevOps"), "bridge");
  assert.equal(resolveStackVisualLayer("Mobile"), "mobile");
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
