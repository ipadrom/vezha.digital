import { getLandingPresentationScale } from "~/utils/threeRenderQuality";

export function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getLandingLayoutRect(element: Element) {
  const rect = element.getBoundingClientRect();
  const presentationScale = getLandingPresentationScale(element);
  return DOMRect.fromRect({
    x: rect.x / presentationScale,
    y: rect.y / presentationScale,
    width: rect.width / presentationScale,
    height: rect.height / presentationScale,
  });
}

export function getLandingLayoutViewport(element: Element | null) {
  const presentationScale = getLandingPresentationScale(element);
  return {
    height: window.innerHeight / presentationScale,
    scale: presentationScale,
    width: window.innerWidth / presentationScale,
  };
}

export function formatStablePx(value: number) {
  return `${Number(value.toFixed(3))}px`;
}
