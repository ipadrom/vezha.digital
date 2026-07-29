import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  MOBILE_ORBIT_TECH,
  getMobileOrbitPoint,
  getStackLayerTargets,
  resolveStackVisualLayer,
} from "../utils/landingStackOrbit";

test("maps stack titles to visual states", () => {
  assert.equal(resolveStackVisualLayer("Frontend"), "surface");
  assert.equal(resolveStackVisualLayer("Backend"), "core");
  assert.equal(resolveStackVisualLayer("DevOps"), "bridge");
  assert.equal(resolveStackVisualLayer("Mobile"), "mobile");
});

test("keeps every system layer visible but secondary for Mobile", () => {
  assert.deepEqual(getStackLayerTargets("mobile"), {
    bridge: 0.52,
    core: 0.48,
    surface: 0.58,
  });
});

test("places native technologies on the orbit and PWA at the intersection", () => {
  assert.deepEqual(
    MOBILE_ORBIT_TECH.map(({ label, placement }) => [label, placement]),
    [
      ["React Native", "orbit"],
      ["Expo", "orbit"],
      ["PWA", "intersection"],
      ["Flutter", "orbit"],
    ],
  );
  assert.ok(MOBILE_ORBIT_TECH.find((item) => item.label === "PWA")!.radiusScale < 1);
});

test("returns deterministic points on the orbit ellipse", () => {
  assert.deepEqual(getMobileOrbitPoint(0, 1), { x: 2.02, y: 0, z: 0 });
  assert.deepEqual(getMobileOrbitPoint(Math.PI / 2, 1), { x: 0, y: 1.08, z: 0 });
});

test("the sphere renderer consumes the dedicated Mobile state", async () => {
  const source = await readFile(
    new URL("../composables/landing/useLandingStackSphere.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /MOBILE_ORBIT_TECH/);
  assert.match(source, /orbitGroup/);
  assert.match(source, /orbitPulse/);
  assert.match(source, /item\.layer === "mobile"/);
});
