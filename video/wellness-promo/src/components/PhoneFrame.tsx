import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

type PhoneFrameProps = {
  delay?: number;
  left: number;
  name: string;
  rotate?: number;
  screen: string;
  top: number;
  width: number;
};

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ delay = 0, left, name, rotate = 0, screen, top, width }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        aspectRatio: "390 / 844",
        padding: 8,
        overflow: "hidden",
        borderRadius: 42,
        backgroundColor: "#11151a",
        boxShadow: "0 40px 90px rgba(0, 0, 0, 0.58), inset 0 0 0 1px rgba(255, 255, 255, 0.16)",
        opacity: interpolate(frame, [delay, delay + 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(frame, [delay, delay + 24], ["0px 72px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        rotate: `${rotate}deg`,
        scale: interpolate(frame, [delay, delay + 24], [0.94, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          output: "perceptual-scale",
        }),
      }}
    >
      <div style={{ position: "absolute", top: 12, left: "50%", zIndex: 2, width: "24%", height: 5, borderRadius: 999, translate: "-50% 0px", backgroundColor: "#242a31" }} />
      <Img name={name} src={staticFile(`assets/${screen}`)} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: 34 }} />
    </div>
  );
};
