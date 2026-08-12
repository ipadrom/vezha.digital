import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS, TYPE} from '../design';

export const RecoveryScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, color: COLORS.white}}>
      <div style={{position: 'absolute', left: 92, top: 82, fontSize: TYPE.label, color: '#8c8c8c', letterSpacing: '0.17em'}}>
        05 / ВОССТАНОВЛЕНИЕ
      </div>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 248,
          width: 710,
          fontSize: 124,
          lineHeight: 0.94,
          letterSpacing: '-0.068em',
          fontWeight: 700,
          opacity: interpolate(frame, [0, 11], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Пауза —
        <br />
        часть
        <br />
        тренировки.
      </div>

      <PhoneShot
        src="training-rest.jpg"
        width={407}
        style={{
          position: 'absolute',
          left: 1052,
          top: 4,
          opacity: interpolate(frame, [4, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          scale: interpolate(frame, [4, 61], [0.97, 1.015], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.2, 0.7, 0.2, 1),
            output: 'perceptual-scale',
          }),
        }}
      />
    </AbsoluteFill>
  );
};
