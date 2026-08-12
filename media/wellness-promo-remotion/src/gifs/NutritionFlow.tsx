import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

export const NutritionFlow: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.black, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 52, top: 48, fontSize: 16, letterSpacing: '0.16em', color: '#747470'}}>
        МЕНЮ → РЕЦЕПТ
      </div>
      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 135,
          width: 410,
          fontSize: 68,
          lineHeight: 0.96,
          letterSpacing: '-0.06em',
          fontWeight: 700,
          opacity: interpolate(frame, [0, 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        От плана
        <br />
        к деталям.
      </div>
      <div style={{position: 'absolute', left: 53, top: 330, width: 370, fontSize: 26, lineHeight: 1.22, color: '#5a5a56', letterSpacing: '-0.03em'}}>
        Дневной рацион ведёт к рецепту без потери контекста.
      </div>
      <PhoneShot
        src="food-daily-menu.jpg"
        width={268}
        radius={24}
        border="1px solid #c9c9c5"
        style={{
          position: 'absolute',
          left: 510,
          top: 65,
          opacity: interpolate(frame, [0, 13, 69, 94], [0, 1, 1, 0.24], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [69, 101], ['0px 0px', '-74px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <PhoneShot
        src="food-recipe-detail.jpg"
        width={268}
        radius={24}
        border="1px solid #c9c9c5"
        style={{
          position: 'absolute',
          left: 660,
          top: 65,
          opacity: interpolate(frame, [69, 101], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [69, 106], ['150px 0px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
    </AbsoluteFill>
  );
};
