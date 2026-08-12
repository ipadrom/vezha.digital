import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PhoneShot} from '../components/PhoneShot';
import {COLORS} from '../design';

const recoverySteps = ['ДЕЙСТВИЕ', 'ПАУЗА', 'ВОЗВРАТ'] as const;

export const RecoveryFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const activeStep = frame < 38 ? 0 : frame < 108 ? 1 : 2;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, color: COLORS.white, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 52, top: 46, fontSize: 16, letterSpacing: '0.16em', color: '#888'}}>
        ПАУЗА ПО ЧАСАМ
      </div>

      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 142,
          width: 420,
          fontSize: 64,
          lineHeight: 0.97,
          fontWeight: 700,
          letterSpacing: '-0.06em',
          opacity: interpolate(frame, [0, 14, 117, 134], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Отдых не
        <br />
        выбивает
        <br />
        из ритма.
      </div>

      <div style={{position: 'absolute', left: 54, top: 425, width: 365}}>
        {recoverySteps.map((step, index) => (
          <div
            key={step}
            style={{
              display: 'grid',
              gridTemplateColumns: '26px 1fr',
              gap: 18,
              alignItems: 'center',
              height: 58,
              borderBottom: '1px solid #252525',
              color: activeStep === index ? '#fff' : '#555',
              opacity: interpolate(frame, [9 + index * 7, 22 + index * 7, 117, 134], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: activeStep === index ? '#fff' : '#2f2f2f',
              }}
            />
            <div style={{fontSize: 17, letterSpacing: '0.13em'}}>{step}</div>
          </div>
        ))}
      </div>

      <PhoneShot
        src="training-active.jpg"
        width={284}
        radius={28}
        style={{
          position: 'absolute',
          left: 602,
          top: 53,
          opacity: interpolate(frame, [0, 13, 29, 43, 101, 116, 128, 134], [0, 1, 1, 0, 0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [0, 24, 108, 126], ['44px 0px', '0px 0px', '0px 0px', '-28px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.16, 1, 0.3, 1)],
          }),
        }}
      />
      <PhoneShot
        src="training-rest.jpg"
        width={284}
        radius={28}
        style={{
          position: 'absolute',
          left: 602,
          top: 53,
          opacity: interpolate(frame, [29, 45, 93, 109], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          scale: interpolate(frame, [36, 101], [0.99, 1.018], {
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
