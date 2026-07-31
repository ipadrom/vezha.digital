export type StackBaseLayer = "surface" | "core" | "bridge";
export type StackVisualLayer = StackBaseLayer | "mobile";
export type StackLayerTargets = Record<StackBaseLayer, number>;
export type MobileOrbitId = "outer" | "inner";
export type MobileOrbitMode = "hidden" | "desktop" | "compact";
export type StackPoint3 = {
  x: number;
  y: number;
  z: number;
};

export function getStackBridgeAttachmentPoint(
  anchor: StackPoint3,
  outerPoint: StackPoint3,
  ratio = 0.75,
): StackPoint3 {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const interpolate = (start: number, end: number) =>
    Number((start + (end - start) * safeRatio).toFixed(6));

  return {
    x: interpolate(anchor.x, outerPoint.x),
    y: interpolate(anchor.y, outerPoint.y),
    z: interpolate(anchor.z, outerPoint.z),
  };
}

export type DesktopDevOpsBridgeLabel = "Docker" | "CI/CD" | "Nginx" | "Linux";

const DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS = {
  Docker: 0.72,
  "CI/CD": 0.24,
  Nginx: -0.22,
  Linux: -0.68,
} as const satisfies Record<DesktopDevOpsBridgeLabel, number>;

export function getDesktopDevOpsBridgeRoute(
  label: DesktopDevOpsBridgeLabel,
  angle: number,
) {
  const y = DESKTOP_DEVOPS_BRIDGE_ROUTE_LEVELS[label];
  const directionX = Math.cos(angle);
  const directionZ = Math.sin(angle);
  const outerPoint = {
    x: directionX * 1.28,
    y,
    z: directionZ * 1.2,
  };
  const outerRadius = Math.hypot(outerPoint.x, outerPoint.y, outerPoint.z);
  const anchorScale = 0.690654 / outerRadius;

  return {
    anchor: {
      x: outerPoint.x * anchorScale,
      y: outerPoint.y * anchorScale,
      z: outerPoint.z * anchorScale,
    },
    outerPoint,
  };
}

export const DESKTOP_STACK_LABEL_ROUTE_DURATION_MS = 18_000;
export const DESKTOP_STACK_LABEL_LANES = [
  { y: 0.72 },
  { y: 0.26 },
  { y: -0.22 },
  { y: -0.7 },
] as const;

export type DesktopStackLabelRouteProfile = {
  geometryScale: number;
  laneYs: readonly number[];
};

export const BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE = {
  geometryScale: 0.5,
  laneYs: [0.58, 0.16, -0.16, -0.58],
} as const satisfies DesktopStackLabelRouteProfile;

export const MOBILE_FRONTEND_STACK_LABEL_ROUTE_PROFILE = {
  geometryScale: 1,
  laneYs: [1.35, 0.99, 0.63, 0.27],
} as const satisfies DesktopStackLabelRouteProfile;

export const MOBILE_BACKEND_STACK_LABEL_ROUTE_PROFILE = {
  geometryScale: 0.62,
  laneYs: [0.98, 0.72, 0.46, 0.2],
} as const satisfies DesktopStackLabelRouteProfile;

export type BackendStackLabelCollisionBox = {
  centerX: number;
  laneIndex: number;
  width: number;
};

export type BackendStackLabelClockState = {
  delayMs: number;
  lastElapsedMs: number;
  originElapsedMs: number;
};

const BACKEND_STACK_LABEL_MIN_CLEARANCE_PX = 14;
export const BACKEND_STACK_LABEL_REVEAL_DISTANCE_PX = 24;

const DESKTOP_STACK_LABEL_RADIUS = 1.62;
const DESKTOP_STACK_LABEL_MAX_ANGLE = 1.32;
export const DESKTOP_STACK_LABEL_FADE_IN_PORTION = 0.12;
const DESKTOP_STACK_LABEL_FADE_OUT_PORTION = 0.28;

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

export function getBackendStackLabelClearanceFactor(
  candidate: BackendStackLabelCollisionBox,
  peers: readonly BackendStackLabelCollisionBox[],
) {
  let minimumClearance = Number.POSITIVE_INFINITY;

  peers.forEach((peer) => {
    if (
      peer.laneIndex !== candidate.laneIndex
      || peer.centerX <= candidate.centerX
    ) {
      return;
    }

    const clearance = peer.centerX - peer.width / 2
      - (candidate.centerX + candidate.width / 2);
    minimumClearance = Math.min(minimumClearance, clearance);
  });

  if (!Number.isFinite(minimumClearance)) return 1;

  const normalized = Math.min(
    1,
    Math.max(
      0,
      (minimumClearance - BACKEND_STACK_LABEL_MIN_CLEARANCE_PX)
        / BACKEND_STACK_LABEL_REVEAL_DISTANCE_PX,
    ),
  );

  return Number((
    normalized * normalized * (3 - 2 * normalized)
  ).toFixed(6));
}

export function advanceBackendStackLabelClock(
  elapsedMs: number,
  state: BackendStackLabelClockState | null,
  waiting: boolean,
) {
  const safeElapsedMs = Math.max(0, elapsedMs);
  if (!state) {
    const initialState = {
      delayMs: 0,
      lastElapsedMs: safeElapsedMs,
      originElapsedMs: safeElapsedMs,
    };

    return {
      effectiveElapsedMs: 0,
      state: initialState,
    };
  }

  const frameMs = Math.max(0, safeElapsedMs - state.lastElapsedMs);
  const delayMs = state.delayMs + (waiting ? frameMs : 0);
  const nextState = {
    delayMs,
    lastElapsedMs: safeElapsedMs,
    originElapsedMs: state.originElapsedMs,
  };

  return {
    effectiveElapsedMs: Math.max(
      0,
      safeElapsedMs - nextState.originElapsedMs - delayMs,
    ),
    state: nextState,
  };
}

export function getDesktopStackLabelRouteState(
  elapsedMs: number,
  labelIndex: number,
  labelCount: number,
  routeProfileOrScale: DesktopStackLabelRouteProfile | number = 1,
) {
  const safeIndex = Math.max(0, Math.floor(labelIndex));
  const safeCount = Math.max(1, Math.floor(labelCount));
  const routeProfile = typeof routeProfileOrScale === "number"
    ? null
    : routeProfileOrScale;
  const requestedScale = routeProfile
    ? routeProfile.geometryScale
    : routeProfileOrScale;
  const safeScale = Math.max(0, requestedScale);
  const laneYs = routeProfile?.laneYs.length
    ? routeProfile.laneYs
    : DESKTOP_STACK_LABEL_LANES.map((lane) => lane.y);
  const phase = (safeIndex % safeCount) / safeCount;
  const routePosition = Math.max(0, elapsedMs) / DESKTOP_STACK_LABEL_ROUTE_DURATION_MS
    + phase;
  const traversal = Math.floor(routePosition);
  const progress = Number((routePosition - traversal).toFixed(6));
  const laneIndex = (safeIndex + traversal) % laneYs.length;
  const laneY = laneYs[laneIndex];
  const routeRadius = routeProfile
    ? DESKTOP_STACK_LABEL_RADIUS * safeScale
    : DESKTOP_STACK_LABEL_RADIUS;
  const coordinateScale = routeProfile ? 1 : safeScale;
  const latitudeRadius = Math.sqrt(
    Math.max(0, routeRadius ** 2 - laneY ** 2),
  );
  const horizontalLimit = Math.sin(DESKTOP_STACK_LABEL_MAX_ANGLE)
    * latitudeRadius;
  const x = -horizontalLimit + progress * horizontalLimit * 2;
  const edgeVisibility = Math.min(
    1,
    progress / DESKTOP_STACK_LABEL_FADE_IN_PORTION,
    (1 - progress) / DESKTOP_STACK_LABEL_FADE_OUT_PORTION,
  );
  const opacity = edgeVisibility * edgeVisibility * (3 - 2 * edgeVisibility);
  const baseX = Number(x.toFixed(6));
  const baseZ = Number((
    Math.sqrt(Math.max(0, latitudeRadius ** 2 - x ** 2)) * 0.98
  ).toFixed(6));

  return {
    jitterPx: getDesktopStackLabelJitter(safeIndex, traversal),
    laneIndex,
    opacity: Number(opacity.toFixed(6)),
    point: {
      x: Number((baseX * coordinateScale).toFixed(6)),
      y: Number((laneY * coordinateScale).toFixed(6)),
      z: Number((baseZ * coordinateScale).toFixed(6)),
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
  mobileViewport = false,
) {
  if (compactMobile && visualLayer === "mobile" && layer === "core") return 0.5;
  if (mobileViewport && visualLayer === "core" && layer === "core") return 1.52;
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
