import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { EndScene } from "./scenes/EndScene";
import { NutritionScene } from "./scenes/NutritionScene";
import { RunScene } from "./scenes/RunScene";
import { TrainingScene } from "./scenes/TrainingScene";

export type WellnessPromoProps = {
  useVideo: boolean;
};

export const WellnessPromo: React.FC<WellnessPromoProps> = ({ useVideo }) => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={105} name="Movement">
        <RunScene useVideo={useVideo} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={105} name="Workout">
        <TrainingScene useVideo={useVideo} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={105} name="Nutrition">
        <NutritionScene useVideo={useVideo} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={90} name="Finale">
        <EndScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
