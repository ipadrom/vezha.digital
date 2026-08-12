import "./index.css";
import { Composition } from "remotion";
import { WellnessPromo } from "./WellnessPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WellnessPromoStoryboard"
        component={WellnessPromo}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ useVideo: false }}
      />
      <Composition
        id="WellnessPromoFinal"
        component={WellnessPromo}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ useVideo: true }}
      />
    </>
  );
};
