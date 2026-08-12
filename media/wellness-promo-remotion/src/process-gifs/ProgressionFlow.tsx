import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

const progressionSteps = [
  {number: '01', label: 'Повторы'},
  {number: '02', label: 'Вес'},
  {number: '03', label: 'Следующий цикл'},
] as const;

export const ProgressionFlow: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.black, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 52, top: 46, fontSize: 16, letterSpacing: '0.16em', color: '#73736f'}}>
        ДВОЙНАЯ ПРОГРЕССИЯ
      </div>

      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 130,
          width: 458,
          fontSize: 70,
          lineHeight: 0.96,
          fontWeight: 700,
          letterSpacing: '-0.06em',
          opacity: interpolate(frame, [0, 15, 124, 143], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Фиксируем
        <br />
        результат.
        <br />
        Двигаемся
        <br />
        дальше.
      </div>

      <div style={{position: 'absolute', left: 54, top: 456, width: 430}}>
        {progressionSteps.map((step, index) => (
          <div
            key={step.number}
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr',
              alignItems: 'center',
              gap: 12,
              height: 62,
              borderTop: index === 0 ? '1px solid #cfcfca' : undefined,
              borderBottom: '1px solid #cfcfca',
              opacity: interpolate(frame, [24 + index * 18, 41 + index * 18, 124, 143], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              translate: interpolate(frame, [24 + index * 18, 46 + index * 18], ['-24px 0px', '0px 0px'], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            <div style={{fontSize: 14, letterSpacing: '0.12em', color: '#777772'}}>{step.number}</div>
            <div style={{fontSize: 25, fontWeight: 600, letterSpacing: '-0.025em'}}>{step.label}</div>
          </div>
        ))}
      </div>

      <PhoneShot
        src="training-progression.jpg"
        width={300}
        radius={29}
        border="1px solid #c8c8c4"
        style={{
          position: 'absolute',
          left: 596,
          top: 36,
          opacity: interpolate(frame, [8, 24, 124, 143], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [8, 31], ['52px 0px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [25, 117], [1, 1.02], {
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
