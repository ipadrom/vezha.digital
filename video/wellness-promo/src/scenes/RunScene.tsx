import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PhoneFrame } from "../components/PhoneFrame";
import { monoFont, uiFont } from "../design";

export const RunScene: React.FC<{ useVideo: boolean }> = ({ useVideo }) => {
  const frame = useCurrentFrame();
  const backgroundOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#05070a", color: "#f7f8f9", fontFamily: uiFont }}>
      {useVideo ? (
        <Video name="Morning run video" src={staticFile("clips/run.mp4")} muted trimBefore={6} objectFit="cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectPosition: "center", opacity: backgroundOpacity, scale: 1.01 }} />
      ) : (
        <Img name="Morning run storyboard" src={staticFile("assets/lifestyle-run.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: backgroundOpacity, scale: interpolate(frame, [0, 104], [1.03, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), translate: interpolate(frame, [0, 104], ["-10px 0px", "18px -5px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      )}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,7,10,0.08) 0%, rgba(4,7,10,0.2) 43%, rgba(4,7,10,0.93) 78%, #05070a 100%)" }} />
      <div aria-hidden style={{ position: "absolute", right: -8, bottom: -8, width: 300, height: 135, background: "radial-gradient(ellipse at 100% 100%, #05070a 0 72%, rgba(5,7,10,0.98) 84%, rgba(5,7,10,0.55) 92%, transparent 100%)" }} />
      <Interactive.Div name="Run scene eyebrow" style={{ position: "absolute", top: 78, left: 704, color: "#52d9ff", fontFamily: monoFont, fontSize: 18, fontWeight: 600, letterSpacing: 3, opacity: interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>01 / ДВИЖЕНИЕ</Interactive.Div>
      <Interactive.Div name="Run scene title" style={{ position: "absolute", top: 142, left: 698, width: 300, whiteSpace: "pre-line", fontSize: 92, fontWeight: 500, lineHeight: 0.88, letterSpacing: -7, opacity: interpolate(frame, [12, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }), translate: interpolate(frame, [12, 30], ["0px 34px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>{"ТВОЙ\nПЛАН"}</Interactive.Div>
      <Interactive.Div name="Run scene support" style={{ position: "absolute", top: 350, left: 704, width: 250, color: "rgba(247,248,249,0.72)", fontSize: 25, lineHeight: 1.32, opacity: interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>Тренировка начинается с ясного следующего шага.</Interactive.Div>
      <Interactive.Div name="Workout chip" style={{ position: "absolute", left: 704, bottom: 86, minWidth: 250, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, backgroundColor: "rgba(5,8,12,0.54)", backdropFilter: "blur(12px)", fontFamily: monoFont, fontSize: 15, letterSpacing: 1.5, opacity: interpolate(frame, [32, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>СИЛОВАЯ / НЕДЕЛЯ 01</Interactive.Div>
      <PhoneFrame name="Workout plan screen" screen="screen-workout-home.png" left={1000} top={82} width={248} rotate={1.2} delay={18} />
    </AbsoluteFill>
  );
};
