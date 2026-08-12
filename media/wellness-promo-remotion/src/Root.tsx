import './index.css';
import {Composition, Folder} from 'remotion';
import {FILM} from './design';
import {WellnessPromo} from './WellnessPromo';
import {NutritionFlow} from './gifs/NutritionFlow';
import {TechniqueFlow} from './gifs/TechniqueFlow';
import {WorkoutFlow} from './gifs/WorkoutFlow';
import {NutritionProcessFlow} from './process-gifs/NutritionProcessFlow';
import {ProgressionFlow} from './process-gifs/ProgressionFlow';
import {RecoveryFlow} from './process-gifs/RecoveryFlow';
import {SequenceFlow} from './process-gifs/SequenceFlow';
import {SystemFlow} from './process-gifs/SystemFlow';
import {ActiveMovementScene} from './scenes/ActiveMovementScene';
import {GatedPlanScene} from './scenes/GatedPlanScene';
import {NutritionScene} from './scenes/NutritionScene';
import {RecoveryScene} from './scenes/RecoveryScene';
import {SystemIntroScene} from './scenes/SystemIntroScene';
import {TechniqueScene} from './scenes/TechniqueScene';

const sceneDefaults = {
  fps: FILM.fps,
  width: FILM.width,
  height: FILM.height,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Training-scenes">
        <Composition id="SceneConnectedDay" component={SystemIntroScene} durationInFrames={96} {...sceneDefaults} />
        <Composition id="SceneGatedPlan" component={GatedPlanScene} durationInFrames={68} {...sceneDefaults} />
        <Composition id="SceneActiveMovement" component={ActiveMovementScene} durationInFrames={82} {...sceneDefaults} />
        <Composition id="SceneTechnique" component={TechniqueScene} durationInFrames={104} {...sceneDefaults} />
        <Composition id="SceneRecovery" component={RecoveryScene} durationInFrames={62} {...sceneDefaults} />
        <Composition id="SceneNutrition" component={NutritionScene} durationInFrames={128} {...sceneDefaults} />
      </Folder>
      <Composition
        id="TrainingProductFilm"
        component={WellnessPromo}
        durationInFrames={FILM.durationInFrames}
        {...sceneDefaults}
      />
      <Folder name="Context-GIFs">
        <Composition id="WorkoutFlow" component={WorkoutFlow} durationInFrames={132} fps={30} width={960} height={720} />
        <Composition id="TechniqueFlow" component={TechniqueFlow} durationInFrames={108} fps={30} width={960} height={720} />
        <Composition id="NutritionFlow" component={NutritionFlow} durationInFrames={144} fps={30} width={960} height={720} />
      </Folder>
      <Folder name="Process-GIFs">
        <Composition id="SystemFlow" component={SystemFlow} durationInFrames={132} fps={30} width={960} height={720} />
        <Composition id="SequenceFlow" component={SequenceFlow} durationInFrames={126} fps={30} width={960} height={720} />
        <Composition id="RecoveryFlow" component={RecoveryFlow} durationInFrames={135} fps={30} width={960} height={720} />
        <Composition id="ProgressionFlow" component={ProgressionFlow} durationInFrames={144} fps={30} width={960} height={720} />
        <Composition id="NutritionProcessFlow" component={NutritionProcessFlow} durationInFrames={150} fps={30} width={960} height={720} />
      </Folder>
    </>
  );
};
