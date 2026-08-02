export type ServiceHighlightBounds = {
  x: number;
  width: number;
};

export function getServiceHighlightFrames(
  from: ServiceHighlightBounds,
  to: ServiceHighlightBounds,
): [ServiceHighlightBounds, ServiceHighlightBounds, ServiceHighlightBounds] {
  const bridgeX = Math.min(from.x, to.x);
  const bridgeRight = Math.max(from.x + from.width, to.x + to.width);

  return [from, { x: bridgeX, width: bridgeRight - bridgeX }, to];
}
