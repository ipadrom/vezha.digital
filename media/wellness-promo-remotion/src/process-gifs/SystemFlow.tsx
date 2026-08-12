import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Brand} from '../components/Brand';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

export const SystemFlow: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, color: COLORS.white, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 46,
          opacity: interpolate(frame, [0, 12, 112, 131], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <Brand compact />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 158,
          width: 352,
          fontSize: 64,
          lineHeight: 0.97,
          fontWeight: 700,
          letterSpacing: '-0.06em',
          opacity: interpolate(frame, [6, 20, 112, 131], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [6, 26], ['0px 28px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Один день.
        <br />
        Два
        <br />
        контура.
      </div>

      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 425,
          width: 348,
          fontSize: 25,
          lineHeight: 1.25,
          letterSpacing: '-0.025em',
          color: '#9a9a9a',
          opacity: interpolate(frame, [32, 50, 112, 131], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Тренировка и питание работают как одна система, а не как два разных приложения.
      </div>

      <PhoneShot
        src="training-plan.jpg"
        width={246}
        radius={25}
        style={{
          position: 'absolute',
          left: 468,
          top: 70,
          opacity: interpolate(frame, [10, 26, 112, 131], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [10, 31], ['0px 92px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <PhoneShot
        src="food-daily-menu.jpg"
        width={220}
        radius={23}
        style={{
          position: 'absolute',
          left: 718,
          top: 142,
          opacity: interpolate(frame, [34, 51, 112, 131], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [34, 59], ['56px 0px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 664,
          top: 353,
          width: 82,
          height: 2,
          backgroundColor: '#fff',
          transform: `scaleX(${interpolate(frame, [52, 76, 112, 131], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })})`,
          transformOrigin: 'left center',
        }}
      />

      <div style={{position: 'absolute', left: 474, bottom: 36, fontSize: 15, letterSpacing: '0.14em', color: '#8a8a8a'}}>
        ТРЕНИРОВКА
      </div>
      <div style={{position: 'absolute', right: 47, bottom: 36, fontSize: 15, letterSpacing: '0.14em', color: '#8a8a8a'}}>
        ПИТАНИЕ
      </div>
    </AbsoluteFill>
  );
};
