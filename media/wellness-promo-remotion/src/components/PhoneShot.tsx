import type {CSSProperties} from 'react';
import {Img, staticFile} from 'remotion';

export const PhoneShot: React.FC<{
  src: string;
  width: number;
  style?: CSSProperties;
  radius?: number;
  border?: string;
}> = ({src, width, style, radius = 38, border = '1px solid #242424'}) => {
  return (
    <div
      style={{
        width,
        aspectRatio: '1179 / 2556',
        overflow: 'hidden',
        borderRadius: radius,
        border,
        backgroundColor: '#000000',
        ...style,
      }}
    >
      <Img
        src={staticFile(`assets/${src}`)}
        style={{width: '100%', height: '100%', display: 'block', objectFit: 'cover'}}
      />
    </div>
  );
};
