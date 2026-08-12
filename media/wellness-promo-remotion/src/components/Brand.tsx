import {Img, staticFile} from 'remotion';

export const Brand: React.FC<{
  inverse?: boolean;
  compact?: boolean;
}> = ({inverse = false, compact = false}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 14 : 18,
        color: inverse ? '#050505' : '#ffffff',
      }}
    >
      <div
        style={{
          width: compact ? 44 : 58,
          height: compact ? 44 : 58,
          borderRadius: compact ? 11 : 15,
          overflow: 'hidden',
          border: inverse ? '1px solid #d4d4d0' : '1px solid #303030',
        }}
      >
        <Img
          src={staticFile('assets/training-mark.svg')}
          style={{width: '100%', height: '100%', display: 'block'}}
        />
      </div>
      <div
        style={{
          fontSize: compact ? 23 : 30,
          fontWeight: 700,
          letterSpacing: '-0.03em',
        }}
      >
        TRAINING
      </div>
    </div>
  );
};
