import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

export const TechniqueFlow: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.black, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 46,
          fontSize: 16,
          letterSpacing: '0.16em',
          color: '#747470',
          opacity: interpolate(frame, [0, 12, 91, 107], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        ТЕХНИКА В КОНТЕКСТЕ
      </div>
      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 116,
          width: 438,
          fontSize: 60,
          lineHeight: 0.98,
          fontWeight: 700,
          letterSpacing: '-0.055em',
          opacity: interpolate(frame, [0, 13], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Подсказка
        <br />
        поверх текущего
        <br />
        контекста.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 53,
          top: 468,
          width: 421,
          height: 136,
          backgroundColor: '#fff',
          border: '1px solid #d5d5d0',
          borderRadius: 20,
          overflow: 'hidden',
          opacity: interpolate(frame, [14, 29], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <Img src={staticFile('assets/exercise-pike.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <PhoneShot
        src="training-technique.jpg"
        width={278}
        radius={24}
        border="1px solid #c9c9c5"
        style={{
          position: 'absolute',
          left: 654,
          top: 61,
          translate: interpolate(frame, [26, 69], ['0px 300px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [26, 43], [0.35, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.paper,
          pointerEvents: 'none',
          opacity: interpolate(frame, [94, 107], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </AbsoluteFill>
  );
};
