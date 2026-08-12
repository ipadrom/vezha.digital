import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PhoneFrame } from "../components/PhoneFrame";
import { monoFont, uiFont } from "../design";

export const NutritionScene: React.FC<{ useVideo: boolean }> = ({ useVideo }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#05070a", color: "#f7f8f9", fontFamily: uiFont }}>
      {useVideo ? (
        <Video name="Healthy cooking video" src={staticFile("clips/nutrition.mp4")} muted trimBefore={6} objectFit="cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectPosition: "center", scale: 1.01 }} />
      ) : (
        <Img name="Healthy cooking storyboard" src={staticFile("assets/lifestyle-nutrition.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", scale: interpolate(frame, [0, 104], [1.03, 1.09], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), translate: interpolate(frame, [0, 104], ["-8px 0px", "16px -3px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      )}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,7,10,0.06) 0%, rgba(4,7,10,0.14) 48%, rgba(4,7,10,0.92) 79%, #05070a 100%), linear-gradient(0deg, rgba(4,7,10,0.7) 0%, transparent 44%)" }} />
      <div aria-hidden style={{ position: "absolute", right: -8, bottom: -8, width: 300, height: 135, background: "radial-gradient(ellipse at 100% 100%, #05070a 0 72%, rgba(5,7,10,0.98) 84%, rgba(5,7,10,0.55) 92%, transparent 100%)" }} />
      <Interactive.Div name="Nutrition scene eyebrow" style={{ position: "absolute", top: 82, left: 744, color: "#52d9ff", fontFamily: monoFont, fontSize: 18, fontWeight: 600, letterSpacing: 3, opacity: interpolate(frame, [8, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>03 / ПИТАНИЕ</Interactive.Div>
      <Interactive.Div name="Nutrition scene title" style={{ position: "absolute", top: 150, left: 736, width: 280, whiteSpace: "pre-line", fontSize: 62, fontWeight: 500, lineHeight: 0.92, letterSpacing: -5, opacity: interpolate(frame, [14, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }), translate: interpolate(frame, [14, 32], ["0px 32px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>{"ПИТАНИЕ\nВ ТВОЁМ\nРИТМЕ"}</Interactive.Div>
      <Interactive.Div name="Nutrition scene support" style={{ position: "absolute", left: 744, bottom: 104, display: "flex", gap: 10, opacity: interpolate(frame, [28, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        {[["Б", "138"], ["Ж", "76"], ["У", "214"]].map(([label, value]) => <div key={label} style={{ minWidth: 82, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, backgroundColor: "rgba(5,8,12,0.58)" }}><span style={{ display: "block", color: "#52d9ff", fontFamily: monoFont, fontSize: 13 }}>{label}</span><strong style={{ display: "block", marginTop: 5, fontSize: 26, fontWeight: 500 }}>{value}</strong></div>)}
      </Interactive.Div>
      <PhoneFrame name="Nutrition screen" screen="screen-food-home.png" left={1010} top={88} width={238} rotate={1} delay={18} />
    </AbsoluteFill>
  );
};
