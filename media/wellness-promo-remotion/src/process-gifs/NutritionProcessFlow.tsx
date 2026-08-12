import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

const nutritionSteps = ['МЕНЮ', 'РЕЦЕПТЫ', 'КБЖУ', 'ИНГРЕДИЕНТЫ'] as const;

const screenOpacity = (frame: number, start: number, hold: number, end: number) =>
  interpolate(frame, [start, start + 10, hold, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const NutritionProcessFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const activeStep = frame < 36 ? 0 : frame < 73 ? 1 : frame < 108 ? 2 : 3;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, color: COLORS.white, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 52, top: 46, fontSize: 16, letterSpacing: '0.16em', color: '#888'}}>
        ПИТАНИЕ БЕЗ ПОТЕРИ КОНТЕКСТА
      </div>

      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 134,
          width: 430,
          fontSize: 66,
          lineHeight: 0.97,
          fontWeight: 700,
          letterSpacing: '-0.06em',
          opacity: interpolate(frame, [0, 15, 132, 149], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        От меню
        <br />
        до точного
        <br />
        продукта.
      </div>

      <div style={{position: 'absolute', left: 54, top: 400, width: 410}}>
        {nutritionSteps.map((step, index) => (
          <div
            key={step}
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr',
              gap: 18,
              alignItems: 'center',
              height: 55,
              color: activeStep === index ? '#fff' : '#4d4d4d',
              borderBottom: '1px solid #252525',
              opacity: interpolate(frame, [8 + index * 6, 21 + index * 6, 132, 149], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div style={{width: 9, height: 9, borderRadius: '50%', backgroundColor: activeStep === index ? '#fff' : '#303030'}} />
            <div style={{fontSize: 17, letterSpacing: '0.13em'}}>{step}</div>
          </div>
        ))}
      </div>

      <PhoneShot
        src="food-daily-menu.jpg"
        width={292}
        radius={28}
        style={{position: 'absolute', left: 600, top: 37, opacity: screenOpacity(frame, 0, 31, 43)}}
      />
      <PhoneShot
        src="food-recipes.jpg"
        width={292}
        radius={28}
        style={{position: 'absolute', left: 600, top: 37, opacity: screenOpacity(frame, 31, 66, 78)}}
      />
      <PhoneShot
        src="food-recipe-detail.jpg"
        width={292}
        radius={28}
        style={{position: 'absolute', left: 600, top: 37, opacity: screenOpacity(frame, 66, 101, 113)}}
      />
      <PhoneShot
        src="food-ingredient-search.jpg"
        width={292}
        radius={28}
        style={{position: 'absolute', left: 600, top: 37, opacity: screenOpacity(frame, 101, 132, 149)}}
      />
    </AbsoluteFill>
  );
};
