import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {TitleCard} from './components/TitleCard';

type DemoCompositionProps = {
  title: string;
  subtitle: string;
};

export const DemoComposition: React.FC<DemoCompositionProps> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const backgroundScale = interpolate(frame, [0, 180], [1.15, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glowOpacity = interpolate(
    frame,
    [0, 20, 90, 160, 180],
    [0, 0.35, 0.5, 0.2, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const lineReveal = spring({
    fps,
    frame: frame - 42,
    config: {
      damping: 200,
      stiffness: 130,
      mass: 0.8,
    },
  });

  const lineWidth = `${Math.max(0, Math.min(1, lineReveal)) * 260}px`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050816',
        color: '#f8fafc',
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${backgroundScale})`,
          background:
            'radial-gradient(circle at 20% 20%, rgba(96,165,250,0.20), transparent 28%), radial-gradient(circle at 80% 30%, rgba(129,140,248,0.18), transparent 26%), linear-gradient(135deg, #050816 0%, #0b1120 45%, #111827 100%)',
        }}
      />

      <AbsoluteFill
        style={{
          opacity: glowOpacity,
          background:
            'radial-gradient(circle at center, rgba(59,130,246,0.20), transparent 42%)',
          filter: 'blur(24px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '96px',
        }}
      >
        <TitleCard title={title} subtitle={subtitle} />

        <div
          style={{
            marginTop: 28,
            height: 4,
            width: lineWidth,
            borderRadius: 999,
            background:
              'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
            boxShadow: '0 0 30px rgba(129,140,248,0.35)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
