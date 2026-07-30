export type StackBaseLayer = "surface" | "core" | "bridge";
export type StackVisualLayer = StackBaseLayer | "mobile";
export type StackLayerTargets = Record<StackBaseLayer, number>;
export type MobileOrbitId = "outer" | "inner";
export type MobileOrbitMode = "hidden" | "desktop" | "compact";

export const DESKTOP_STACK_LABEL_ROUTE_DURATION_MS = 18_000;
export const DESKTOP_STACK_LABEL_LANES = [
  { y: 0.72 },
  { y: 0.26 },
  { y: -0.22 },
  { y: -0.7 },
] as const;

const DESKTOP_STACK_LABEL_RADIUS = 1.62;
const DESKTOP_STACK_LABEL_MAX_ANGLE = 1.32;
const DESKTOP_STACK_LABEL_FADE_PORTION = 0.12;

export const MOBILE_ORBIT_TRACKS = {
  outer: {
    direction: 1,
    durationMs: 32_000,
    radiusX: 2.02,
    radiusY: 1.08,
    rotation: [1.02, 0.28, -0.22],
  },
  inner: {
    direction: -1,
    durationMs: 24_000,
    radiusX: 1.72,
    radiusY: 0.92,
    rotation: [0.82, -0.38, 0.62],
  },
} as const;

export const MOBILE_ORBIT_TECH = [
  {
    angle: 2.5,
    color: "#61DAFB",
    desktopPhase: 2.5,
    label: "React Native",
    orbit: "outer",
    phase: 2.5,
    placement: "orbit",
    radiusScale: 1,
    slug: "react",
  },
  {
    angle: 0.9,
    color: "#111318",
    desktopPhase: 0.9,
    label: "Expo",
    orbit: "inner",
    phase: 0.9,
    placement: "orbit",
    radiusScale: 1,
    slug: "expo",
  },
  {
    angle: -0.2,
    color: "#5A0FC8",
    desktopPhase: -0.2,
    label: "PWA",
    orbit: "inner",
    phase: 0.9 + Math.PI,
    placement: "intersection",
    radiusScale: 0.82,
    slug: "pwa",
  },
  {
    angle: -1.72,
    color: "#54C5F8",
    desktopPhase: -1.72,
    label: "Flutter",
    orbit: "outer",
    phase: 2.5 + Math.PI,
    placement: "orbit",
    radiusScale: 1,
    slug: "flutter",
  },
] as const;

function getDesktopStackLabelJitter(labelIndex: number, traversal: number) {
  let seed = Math.imul(labelIndex + 1, 0x45d9f3b)
    ^ Math.imul(traversal + 1, 0x27d4eb2d);
  seed ^= seed >>> 16;
  return Math.abs(seed) % 7 - 3;
}

export function getDesktopStackLabelRouteState(
  elapsedMs: number,
  labelIndex: number,
  labelCount: number,
) {
  const safeIndex = Math.max(0, Math.floor(labelIndex));
  const safeCount = Math.max(1, Math.floor(labelCount));
  const phase = (safeIndex % safeCount) / safeCount;
  const routePosition = Math.max(0, elapsedMs) / DESKTOP_STACK_LABEL_ROUTE_DURATION_MS
    + phase;
  const traversal = Math.floor(routePosition);
  const progress = Number((routePosition - traversal).toFixed(6));
  const laneIndex = (safeIndex + traversal) % DESKTOP_STACK_LABEL_LANES.length;
  const lane = DESKTOP_STACK_LABEL_LANES[laneIndex];
  const angle = -DESKTOP_STACK_LABEL_MAX_ANGLE
    + progress * DESKTOP_STACK_LABEL_MAX_ANGLE * 2;
  const latitudeRadius = Math.sqrt(
    Math.max(0, DESKTOP_STACK_LABEL_RADIUS ** 2 - lane.y ** 2),
  );
  const edgeVisibility = Math.min(
    1,
    progress / DESKTOP_STACK_LABEL_FADE_PORTION,
    (1 - progress) / DESKTOP_STACK_LABEL_FADE_PORTION,
  );
  const opacity = edgeVisibility * edgeVisibility * (3 - 2 * edgeVisibility);

  return {
    jitterPx: getDesktopStackLabelJitter(safeIndex, traversal),
    laneIndex,
    opacity: Number(opacity.toFixed(6)),
    point: {
      x: Number((Math.sin(angle) * latitudeRadius).toFixed(6)),
      y: lane.y,
      z: Number((Math.cos(angle) * latitudeRadius * 0.98).toFixed(6)),
    },
    progress,
  };
}

export function resolveStackVisualLayer(title = ""): StackVisualLayer {
  const normalized = title.toLowerCase();
  if (normalized.includes("backend")) return "core";
  if (normalized.includes("devops")) return "bridge";
  if (normalized.includes("mobile")) return "mobile";
  return "surface";
}

export function getStackLayerTargets(
  layer: StackVisualLayer,
  compactMobile = false,
): StackLayerTargets {
  if (layer === "core") return { bridge: 0.16, core: 1, surface: 0.12 };
  if (layer === "bridge") return { bridge: 1, core: 0.26, surface: 0.26 };
  if (layer === "mobile") {
    return {
      bridge: 0.52,
      core: 0.48,
      surface: compactMobile ? 0 : 0.58,
    };
  }
  return { bridge: 0.16, core: 0.1, surface: 1 };
}

export function getStackGroupScale(
  layer: StackBaseLayer,
  visualLayer: StackVisualLayer,
  compactMobile = false,
) {
  if (compactMobile && visualLayer === "mobile" && layer === "core") return 0.5;
  const target = getStackLayerTargets(visualLayer, compactMobile)[layer];
  return layer === "core" ? 1 + target * 0.4 : 1 + target * 0.055;
}

export function getMobileOrbitPoint(
  angle: number,
  orbitOrRadiusScale: MobileOrbitId | number = "outer",
  radiusScale = 1,
) {
  const orbit = typeof orbitOrRadiusScale === "number" ? "outer" : orbitOrRadiusScale;
  const scale = typeof orbitOrRadiusScale === "number" ? orbitOrRadiusScale : radiusScale;
  const track = MOBILE_ORBIT_TRACKS[orbit];
  const normalizedX = Math.abs(Math.cos(angle)) < 1e-12 ? 0 : Math.cos(angle);
  const normalizedY = Math.abs(Math.sin(angle)) < 1e-12 ? 0 : Math.sin(angle);
  return {
    x: Number((normalizedX * track.radiusX * scale).toFixed(6)),
    y: Number((normalizedY * track.radiusY * scale).toFixed(6)),
    z: 0,
  };
}

export function getMobileOrbitAngle(
  elapsedMs: number,
  orbit: MobileOrbitId,
  phase = 0,
) {
  const track = MOBILE_ORBIT_TRACKS[orbit];
  return phase + (elapsedMs / track.durationMs) * Math.PI * 2 * track.direction;
}

export function resolveMobileOrbitMode(
  layer: StackVisualLayer,
  viewportWidth: number,
): MobileOrbitMode {
  if (layer !== "mobile") return "hidden";
  return viewportWidth <= 900 ? "compact" : "desktop";
}

export function getMobileTechnologyPoint(
  spec: {
    desktopPhase?: number;
    orbit: MobileOrbitId;
    phase: number;
    radiusScale?: number;
  },
  elapsedMs: number,
  mode: Exclude<MobileOrbitMode, "hidden">,
) {
  const angle = mode === "compact"
    ? getMobileOrbitAngle(elapsedMs, spec.orbit, spec.phase)
    : (spec.desktopPhase ?? spec.phase);
  return getMobileOrbitPoint(
    angle,
    mode === "compact" ? spec.orbit : "outer",
    mode === "compact" ? 1 : (spec.radiusScale ?? 1),
  );
}

export function getMobileLabelDepthStyle(worldZ: number) {
  const depth = Math.max(0, Math.min(1, (worldZ + 1.2) / 2.4));
  return {
    opacity: Number((0.58 + depth * 0.42).toFixed(3)),
    scale: Number((0.78 + depth * 0.18).toFixed(3)),
  };
}

export function getCompactMobileRootRotation(elapsedMs: number) {
  return {
    x: -0.16 + Math.sin(elapsedMs * 0.00005) * 0.012,
    y: -0.4 + Math.sin(elapsedMs * 0.00004) * 0.01,
    z: 0.08 + Math.sin(elapsedMs * 0.000035) * 0.008,
  };
}
