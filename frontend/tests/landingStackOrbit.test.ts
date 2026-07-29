import assert from "node:assert/strict";
import test from "node:test";
import {
  MOBILE_ORBIT_TECH,
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

test("advances the tracks in opposite directions at different speeds", () => {
  assert.equal(getMobileOrbitAngle(3_500, "outer", 0), Math.PI / 2);
  assert.equal(getMobileOrbitAngle(2_500, "inner", 0), -Math.PI / 2);
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
  assert.equal(getStackGroupScale("core", "mobile", true), 0.86);
  assert.equal(getStackGroupScale("core", "mobile", false), 1.192);
});

test("resolves compact orbit mode only for Mobile at the 900px boundary", () => {
  assert.equal(resolveMobileOrbitMode("mobile", 900), "compact");
  assert.equal(resolveMobileOrbitMode("mobile", 901), "desktop");
  assert.equal(resolveMobileOrbitMode("surface", 390), "hidden");
});

test("moves only compact Mobile technologies along their assigned tracks", () => {
  const outerAtZero = { orbit: "outer" as const, phase: 0 };
  assert.deepEqual(
    getMobileTechnologyPoint(outerAtZero, 3_500, "compact"),
    { x: 0, y: 1.08, z: 0 },
  );
  assert.deepEqual(
    getMobileTechnologyPoint(outerAtZero, 3_500, "desktop"),
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
