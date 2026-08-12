import {AbsoluteFill, Series} from 'remotion';
import {ActiveMovementScene} from './scenes/ActiveMovementScene';
import {GatedPlanScene} from './scenes/GatedPlanScene';
import {NutritionScene} from './scenes/NutritionScene';
import {RecoveryScene} from './scenes/RecoveryScene';
import {SystemIntroScene} from './scenes/SystemIntroScene';
import {TechniqueScene} from './scenes/TechniqueScene';

export const WellnessPromo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={96} name="Connected day">
          <SystemIntroScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={68} name="Gated plan">
          <GatedPlanScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={82} name="Active movement">
          <ActiveMovementScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={104} name="Contextual technique">
          <TechniqueScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={62} name="Recovery timer">
          <RecoveryScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={128} name="Nutrition">
          <NutritionScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
