import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS, TYPE} from '../design';

export const ActiveMovementScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, color: COLORS.white}}>
      <div style={{position: 'absolute', left: 92, top: 88, fontSize: TYPE.label, letterSpacing: '0.17em', color: '#888'}}>
        03 / АКТИВНАЯ ТРЕНИРОВКА
      </div>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 246,
          width: 700,
          fontSize: 122,
          lineHeight: 0.93,
          letterSpacing: '-0.068em',
          fontWeight: 700,
          opacity: interpolate(frame, [4, 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [4, 24], ['0px 44px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        В фокусе —
        <br />
        одно
        <br />
        действие.
      </div>

      <PhoneShot
        src="training-active.jpg"
        width={516}
        style={{
          position: 'absolute',
          left: 928,
          top: -115,
          translate: interpolate(frame, [0, 81], ['0px 0px', '0px -78px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.3, 0, 0.3, 1),
          }),
          opacity: interpolate(frame, [0, 9], [0.7, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </AbsoluteFill>
  );
};
