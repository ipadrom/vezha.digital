import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Brand} from '../components/Brand';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS, TYPE} from '../design';

export const NutritionScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.black}}>
      <div style={{position: 'absolute', left: 92, top: 74, fontSize: TYPE.label, color: '#6c6c67', letterSpacing: '0.17em'}}>
        06 / ПИТАНИЕ
      </div>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 174,
          width: 560,
          fontSize: 104,
          lineHeight: 0.96,
          letterSpacing: '-0.063em',
          fontWeight: 700,
          opacity: interpolate(frame, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [0, 20], ['0px 34px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Питание
        <br />
        продолжает
        <br />
        тот же день.
      </div>

      <div
        style={{
          position: 'absolute',
          left: 94,
          top: 590,
          width: 510,
          fontSize: TYPE.copy,
          lineHeight: 1.24,
          color: '#555550',
          letterSpacing: '-0.03em',
          opacity: interpolate(frame, [22, 42], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Меню, рецепты и поиск продуктов собраны в одном контексте.
      </div>

      <div
        style={{
          position: 'absolute',
          left: 94,
          bottom: 60,
          opacity: interpolate(frame, [93, 111], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <Brand inverse compact />
      </div>

      <PhoneShot
        src="food-daily-menu.jpg"
        width={304}
        border="1px solid #c8c8c4"
        style={{
          position: 'absolute',
          left: 706,
          top: 140,
          translate: interpolate(frame, [0, 23], ['0px 120px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <PhoneShot
        src="food-recipes.jpg"
        width={276}
        border="1px solid #c8c8c4"
        style={{
          position: 'absolute',
          left: 995,
          top: 218,
          opacity: interpolate(frame, [26, 41], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [26, 51], ['44px 0px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <PhoneShot
        src="food-ingredient-search.jpg"
        width={264}
        border="1px solid #c8c8c4"
        style={{
          position: 'absolute',
          left: 1260,
          top: 112,
          opacity: interpolate(frame, [66, 82], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [66, 91], ['0px -72px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
    </AbsoluteFill>
  );
};
