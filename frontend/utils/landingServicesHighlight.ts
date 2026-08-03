export type ServiceHighlightBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getServiceHighlightTargetBounds(
  bounds: ServiceHighlightBounds,
  horizontalPadding = 7,
  verticalPadding = 0,
): ServiceHighlightBounds {
  return {
    x: bounds.x - horizontalPadding,
    y: bounds.y - verticalPadding,
    width: bounds.width + horizontalPadding * 2,
    height: bounds.height + verticalPadding * 2,
  };
}

export function getServiceHighlightFrames(
  from: ServiceHighlightBounds,
  to: ServiceHighlightBounds,
): [ServiceHighlightBounds, ServiceHighlightBounds] {
  return [from, to];
}
