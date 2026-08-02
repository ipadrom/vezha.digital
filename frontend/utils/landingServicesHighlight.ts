export type ServiceHighlightBounds = {
  x: number;
  width: number;
};

export function getServiceHighlightTargetBounds(
  bounds: ServiceHighlightBounds,
  horizontalPadding = 7,
): ServiceHighlightBounds {
  return {
    x: bounds.x - horizontalPadding,
    width: bounds.width + horizontalPadding * 2,
  };
}

export function getServiceHighlightFrames(
  from: ServiceHighlightBounds,
  to: ServiceHighlightBounds,
): [ServiceHighlightBounds, ServiceHighlightBounds, ServiceHighlightBounds] {
  const fromCenter = from.x + from.width / 2;
  const toCenter = to.x + to.width / 2;
  const midpointCenter = (fromCenter + toCenter) / 2;
  const pinchWidth = Number((Math.min(from.width, to.width) * 0.72).toFixed(3));
  const pinchX = Number((midpointCenter - pinchWidth / 2).toFixed(3));

  return [from, { x: pinchX, width: pinchWidth }, to];
}
