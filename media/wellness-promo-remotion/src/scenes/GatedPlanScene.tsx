import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS, TYPE} from '../design';

export const GatedPlanScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.black}}>
      <PhoneShot
        src="training-plan.jpg"
        width={365}
        border="1px solid #c8c8c4"
        style={{
          position: 'absolute',
          left: 138,
          top: -28,
          scale: interpolate(frame, [0, 67], [1.035, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.2, 0.8, 0.2, 1),
            output: 'perceptual-scale',
          }),
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 676,
          top: 136,
          width: 760,
          opacity: interpolate(frame, [11, 24], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [11, 29], ['38px 0px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{fontSize: TYPE.label, letterSpacing: '0.17em', color: '#71716d'}}>
          02 / ПЛАН
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 118,
            lineHeight: 0.94,
            letterSpacing: '-0.067em',
            fontWeight: 700,
          }}
        >
          Снача —
          <br />
          следующий шаг.
        </div>
        <div
          style={{
            marginTop: 54,
            maxWidth: 610,
            fontSize: TYPE.copy,
            lineHeight: 1.25,
            letterSpacing: '-0.03em',
            color: '#4e4e4a',
          }}
        >
          Тренировка открывается по этапам и не перегружает выбором.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 676,
          right: 102,
          bottom: 88,
          height: 2,
          backgroundColor: '#171717',
          transform: `scaleX(${interpolate(frame, [27, 53], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })})`,
          transformOrigin: 'left center',
        }}
      />
    </AbsoluteFill>
  );
};
