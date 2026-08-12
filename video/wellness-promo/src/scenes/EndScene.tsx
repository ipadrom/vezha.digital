import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhoneFrame } from "../components/PhoneFrame";
import { monoFont, uiFont } from "../design";

export const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "radial-gradient(circle at 50% 34%, #15232d 0%, #080c10 42%, #040608 78%)", color: "#f7f8f9", fontFamily: uiFont }}>
      <Interactive.Div name="Wellness mark" style={{ position: "absolute", top: 52, left: 80, display: "flex", alignItems: "center", gap: 16, opacity: interpolate(frame, [2, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <Img src={staticFile("assets/wellness-mark.svg")} style={{ width: 54, height: 54, borderRadius: 15 }} />
        <span style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 600, letterSpacing: 4 }}>WELLNESS APP</span>
      </Interactive.Div>
      <Interactive.Div name="End scene title" style={{ position: "absolute", top: 146, left: 80, width: 440, whiteSpace: "pre-line", fontSize: 78, fontWeight: 500, lineHeight: 0.92, letterSpacing: -5, opacity: interpolate(frame, [8, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }), translate: interpolate(frame, [8, 26], ["0px 34px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>{"ОДИН РИТМ\nНА КАЖДЫЙ ДЕНЬ"}</Interactive.Div>
      <Interactive.Div name="End scene journey" style={{ position: "absolute", left: 80, bottom: 112, display: "flex", alignItems: "center", gap: 15, color: "rgba(247,248,249,.7)", fontFamily: monoFont, fontSize: 14, letterSpacing: 1.8, opacity: interpolate(frame, [24, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}><span>ПЛАН</span><b style={{ color: "#52d9ff" }}>→</b><span>ЗАНЯТИЕ</span><b style={{ color: "#52d9ff" }}>→</b><span>ПИТАНИЕ</span></Interactive.Div>
      <PhoneFrame name="Final workout screen" screen="screen-workout-home.png" left={668} top={98} width={248} rotate={-4} delay={12} />
      <PhoneFrame name="Final nutrition screen" screen="screen-food-home.png" left={920} top={76} width={260} rotate={4} delay={20} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), background: "#040608" }} />
    </AbsoluteFill>
  );
};
