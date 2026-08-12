import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Brand} from '../components/Brand';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS, TYPE} from '../design';

export const SystemIntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, color: COLORS.white}}>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 72,
          opacity: interpolate(frame, [0, 13], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <Brand />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 94,
          top: 230,
          width: 650,
          translate: interpolate(frame, [5, 24], ['0px 34px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [5, 21], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div style={{fontSize: TYPE.label, letterSpacing: '0.17em', color: '#a0a0a0'}}>
          01 / ЕДИНЫЙ СЦЕНАРИЙ
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: TYPE.display,
            fontWeight: 700,
            lineHeight: 0.94,
            letterSpacing: '-0.065em',
          }}
        >
          Тренировка
          <br />
          и питание
          <br />
          в одном дне.
        </div>
      </div>

      <PhoneShot
        src="training-plan.jpg"
        width={314}
        style={{
          position: 'absolute',
          left: 918,
          top: 106,
          translate: interpolate(frame, [9, 31], ['0px 92px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [9, 24], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <PhoneShot
        src="food-daily-menu.jpg"
        width={276}
        style={{
          position: 'absolute',
          left: 1252,
          top: 205,
          translate: interpolate(frame, [24, 47], ['0px 110px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [24, 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </AbsoluteFill>
  );
};
