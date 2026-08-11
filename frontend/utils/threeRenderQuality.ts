type PixelRatioRenderer = {
  getPixelRatio: () => number;
  setPixelRatio: (value: number) => void;
};

const MAX_3D_PIXEL_RATIO = 3;

export function syncThreeRendererPixelRatio(renderer: PixelRatioRenderer) {
  const nextRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_3D_PIXEL_RATIO);
  if (Math.abs(renderer.getPixelRatio() - nextRatio) < 0.01) return;
  renderer.setPixelRatio(nextRatio);
}
