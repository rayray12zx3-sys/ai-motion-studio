import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type TitleCardProps = {
  title: string;
  subtitle: string;
};

export const TitleCard: React.FC<TitleCardProps> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleProgress = spring({
    fps,
    frame: frame - 8,
    config: {
      damping: 18,
      stiffness: 120,
      mass: 1,
    },
  });

  const subtitleProgress = spring({
    fps,
    frame: frame - 28,
    config: {
      damping: 18,
      stiffness: 110,
      mass: 1,
    },
  });

  const titleOpacity = interpolate(
    frame,
    [0, 12, 155, 180],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const subtitleOpacity = interpolate(
    frame,
    [18, 35, 155, 180],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const titleTranslateY = interpolate(titleProgress, [0, 1], [48, 0]);
  const titleScale = interpolate(titleProgress, [0, 1], [0.96, 1]);
  const subtitleTranslateY = interpolate(subtitleProgress, [0, 1], [24, 0]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 116,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
          textShadow: '0 10px 40px rgba(15, 23, 42, 0.45)',
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 22,
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'rgba(226,232,240,0.82)',
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleTranslateY}px)`,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
