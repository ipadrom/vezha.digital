type PixelRatioRenderer = {
  getPixelRatio: () => number;
  setPixelRatio: (value: number) => void;
};

const MAX_3D_PIXEL_RATIO = 3;
const LANDING_PRESENTATION_SCALE = "--landing-presentation-scale";

export function getLandingPresentationScale(element?: Element | null) {
  if (!element) return 1;

  const scale = Number.parseFloat(
    window.getComputedStyle(element).getPropertyValue(LANDING_PRESENTATION_SCALE),
  );
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

export function syncThreeRendererPixelRatio(renderer: PixelRatioRenderer, element?: Element | null) {
  const presentationScale = getLandingPresentationScale(element);
  const nextRatio = Math.min(
    Math.max((window.devicePixelRatio || 1) * presentationScale, 1),
    MAX_3D_PIXEL_RATIO,
  );
  if (Math.abs(renderer.getPixelRatio() - nextRatio) < 0.01) return;
  renderer.setPixelRatio(nextRatio);
}
