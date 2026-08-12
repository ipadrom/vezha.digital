import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

export const WorkoutFlow: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, color: COLORS.white, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 52, top: 48, fontSize: 16, letterSpacing: '0.16em', color: '#8b8b8b'}}>
        ПЛАН → ДЕЙСТВИЕ
      </div>
      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 142,
          width: 460,
          fontSize: 66,
          lineHeight: 0.96,
          letterSpacing: '-0.06em',
          fontWeight: 700,
          opacity: interpolate(frame, [0, 11, 96, 110], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Только то,
        <br />
        что нужно
        <br />
        сейчас.
      </div>
      <PhoneShot
        src="training-plan.jpg"
        width={276}
        radius={24}
        style={{
          position: 'absolute',
          left: 520,
          top: 44,
          opacity: interpolate(frame, [0, 12, 66, 96], [0, 1, 1, 0.16], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [66, 105], ['0px 0px', '-102px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <PhoneShot
        src="training-active.jpg"
        width={276}
        radius={24}
        style={{
          position: 'absolute',
          left: 664,
          top: 44,
          opacity: interpolate(frame, [66, 99], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [66, 105], ['168px 0px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
    </AbsoluteFill>
  );
};
