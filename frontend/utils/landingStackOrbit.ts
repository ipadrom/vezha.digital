export type StackBaseLayer = "surface" | "core" | "bridge";
export type StackVisualLayer = StackBaseLayer | "mobile";
export type StackLayerTargets = Record<StackBaseLayer, number>;

export const MOBILE_ORBIT_TECH = [
  { angle: 2.5, color: "#61DAFB", label: "React Native", placement: "orbit", radiusScale: 1, slug: "react" },
  { angle: 0.9, color: "#111318", label: "Expo", placement: "orbit", radiusScale: 1, slug: "expo" },
  { angle: -0.2, color: "#5A0FC8", label: "PWA", placement: "intersection", radiusScale: 0.82, slug: "pwa" },
  { angle: -1.72, color: "#54C5F8", label: "Flutter", placement: "orbit", radiusScale: 1, slug: "flutter" },
] as const;

export function resolveStackVisualLayer(title = ""): StackVisualLayer {
  const normalized = title.toLowerCase();
  if (normalized.includes("backend")) return "core";
  if (normalized.includes("devops")) return "bridge";
  if (normalized.includes("mobile")) return "mobile";
  return "surface";
}

export function getStackLayerTargets(layer: StackVisualLayer): StackLayerTargets {
  if (layer === "core") return { bridge: 0.16, core: 1, surface: 0.12 };
  if (layer === "bridge") return { bridge: 1, core: 0.26, surface: 0.26 };
  if (layer === "mobile") return { bridge: 0.52, core: 0.48, surface: 0.58 };
  return { bridge: 0.16, core: 0.1, surface: 1 };
}

export function getMobileOrbitPoint(angle: number, radiusScale = 1) {
  const normalizedX = Math.abs(Math.cos(angle)) < 1e-12 ? 0 : Math.cos(angle);
  const normalizedY = Math.abs(Math.sin(angle)) < 1e-12 ? 0 : Math.sin(angle);
  return {
    x: Number((normalizedX * 2.02 * radiusScale).toFixed(6)),
    y: Number((normalizedY * 1.08 * radiusScale).toFixed(6)),
    z: 0,
  };
}
