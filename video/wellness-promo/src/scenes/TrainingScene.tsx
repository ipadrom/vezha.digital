import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PhoneFrame } from "../components/PhoneFrame";
import { monoFont, uiFont } from "../design";

export const TrainingScene: React.FC<{ useVideo: boolean }> = ({ useVideo }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#05070a", color: "#f7f8f9", fontFamily: uiFont }}>
      {useVideo ? (
        <Video name="Strength training video" src={staticFile("clips/train.mp4")} muted trimBefore={6} objectFit="cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectPosition: "center", scale: 1.01 }} />
      ) : (
        <Img name="Strength training storyboard" src={staticFile("assets/lifestyle-train.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", scale: interpolate(frame, [0, 104], [1.04, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), translate: interpolate(frame, [0, 104], ["14px 0px", "-18px -4px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      )}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #05070a 0%, rgba(5,7,10,0.92) 25%, rgba(5,7,10,0.38) 58%, rgba(5,7,10,0.08) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", right: -8, bottom: -8, width: 300, height: 135, background: "radial-gradient(ellipse at 100% 100%, #05070a 0 72%, rgba(5,7,10,0.98) 84%, rgba(5,7,10,0.55) 92%, transparent 100%)" }} />
      <PhoneFrame name="Workout timer screen" screen="screen-timer.png" left={84} top={82} width={248} rotate={-1.2} delay={10} />
      <Interactive.Div name="Training scene eyebrow" style={{ position: "absolute", top: 92, left: 390, color: "#52d9ff", fontFamily: monoFont, fontSize: 18, fontWeight: 600, letterSpacing: 3, opacity: interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>02 / ЗАНЯТИЕ</Interactive.Div>
      <Interactive.Div name="Training scene title" style={{ position: "absolute", top: 160, left: 382, width: 390, whiteSpace: "pre-line", fontSize: 88, fontWeight: 500, lineHeight: 0.9, letterSpacing: -6, opacity: interpolate(frame, [14, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }), translate: interpolate(frame, [14, 32], ["0px 34px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>{"РИТМ\nЗАНЯТИЯ"}</Interactive.Div>
      <Interactive.Div name="Training scene support" style={{ position: "absolute", top: 362, left: 390, width: 330, color: "rgba(247,248,249,0.7)", fontSize: 25, lineHeight: 1.35, opacity: interpolate(frame, [24, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>Подход, отдых и прогресс остаются в одном контексте.</Interactive.Div>
      <Interactive.Div name="Timer metric" style={{ position: "absolute", left: 390, bottom: 84, display: "flex", alignItems: "baseline", gap: 16, opacity: interpolate(frame, [32, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}><strong style={{ fontSize: 58, fontWeight: 400, letterSpacing: -3 }}>42</strong><span style={{ color: "#52d9ff", fontFamily: monoFont, fontSize: 16, letterSpacing: 2 }}>СЕК / ОТДЫХ</span></Interactive.Div>
    </AbsoluteFill>
  );
};
