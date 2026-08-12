import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

const steps = [
  {number: '01', title: 'Пресс'},
  {number: '02', title: 'Силовая'},
  {number: '03', title: 'Следующее упражнение'},
] as const;

export const SequenceFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const activeStep = frame < 42 ? 0 : frame < 79 ? 1 : 2;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.black, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 52, top: 46, fontSize: 16, letterSpacing: '0.16em', color: '#73736f'}}>
        ПОСЛЕДОВАТЕЛЬНОЕ ОТКРЫТИЕ
      </div>

      <PhoneShot
        src="training-plan.jpg"
        width={280}
        radius={27}
        border="1px solid #c8c8c4"
        style={{
          position: 'absolute',
          left: 70,
          top: 86,
          opacity: interpolate(frame, [0, 14, 107, 125], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          scale: interpolate(frame, [0, 105], [0.975, 1.012], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.2, 0.7, 0.2, 1),
            output: 'perceptual-scale',
          }),
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 452,
          top: 128,
          width: 438,
          opacity: interpolate(frame, [7, 21, 107, 125], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div style={{fontSize: 58, fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.055em', marginBottom: 52}}>
          Один шаг
          <br />
          за другим.
        </div>

        {steps.map((step, index) => (
          <div
            key={step.number}
            style={{
              minHeight: 90,
              display: 'grid',
              gridTemplateColumns: '56px 1fr',
              alignItems: 'center',
              gap: 12,
              padding: '0 22px',
              marginBottom: 12,
              borderRadius: 18,
              border: '1px solid #cfcfca',
              backgroundColor: activeStep === index ? COLORS.black : 'transparent',
              color: activeStep === index ? COLORS.white : '#71716d',
              opacity: interpolate(frame, [13 + index * 9, 27 + index * 9], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div style={{fontSize: 15, letterSpacing: '0.12em'}}>{step.number}</div>
            <div style={{fontSize: 24, fontWeight: activeStep === index ? 700 : 500, letterSpacing: '-0.025em'}}>{step.title}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
