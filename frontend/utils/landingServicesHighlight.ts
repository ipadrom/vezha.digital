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
): [ServiceHighlightBounds, ServiceHighlightBounds] {
  return [from, to];
}
