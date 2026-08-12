import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadOnest } from "@remotion/google-fonts/Onest";

export const { fontFamily: uiFont } = loadOnest("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["cyrillic", "latin"],
});

export const { fontFamily: monoFont } = loadJetBrainsMono("normal", {
  weights: ["500", "600"],
  subsets: ["cyrillic", "latin"],
});
