import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

export const TechniqueScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.black}}>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 72,
          width: 870,
          fontSize: 92,
          lineHeight: 0.98,
          fontWeight: 700,
          letterSpacing: '-0.06em',
          opacity: interpolate(frame, [0, 16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Подсказка остаётся
        <br />
        внутри действия.
      </div>

      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 346,
          width: 790,
          height: 444,
          borderRadius: 32,
          overflow: 'hidden',
          border: `1px solid ${COLORS.line}`,
          backgroundColor: COLORS.white,
          opacity: interpolate(frame, [21, 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [21, 45], ['-50px 0px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <Img
          src={staticFile('assets/exercise-pike.png')}
          style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block'}}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 94,
          bottom: 56,
          fontSize: 25,
          color: '#656560',
          letterSpacing: '-0.02em',
          opacity: interpolate(frame, [45, 63], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Схема движения и короткая инструкция — без выхода из тренировки.
      </div>

      <PhoneShot
        src="training-technique.jpg"
        width={327}
        border="1px solid #c8c8c4"
        style={{
          position: 'absolute',
          left: 1132,
          top: 82,
          translate: interpolate(frame, [7, 34], ['0px 180px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
    </AbsoluteFill>
  );
};
