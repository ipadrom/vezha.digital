import './index.css';
import {Composition} from 'remotion';
import {CrewRelationshipGraph} from './CrewRelationshipGraph';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CrewRelationshipGraph"
      component={CrewRelationshipGraph}
      durationInFrames={360}
      fps={30}
      width={1600}
      height={900}
    />
  );
};
