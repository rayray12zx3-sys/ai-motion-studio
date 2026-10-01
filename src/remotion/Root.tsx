import React from 'react';
import {Composition} from 'remotion';
import {DemoComposition} from './DemoComposition';
import {DELIVERY_PROFILES} from '../shared/deliveryProfiles';

export const Root: React.FC = () => {
  const landscape = DELIVERY_PROFILES.landscapeDemo;
  const vertical = DELIVERY_PROFILES.verticalSocial;

  return (
    <>
      <Composition
        id="MotionDemo"
        component={DemoComposition}
        durationInFrames={180}
        fps={landscape.fps}
        width={landscape.width}
        height={landscape.height}
        defaultProps={{
          title: 'AI Motion Studio',
          subtitle: 'Remotion starter demo',
        }}
      />
      <Composition
        id="MotionDemoVertical"
        component={DemoComposition}
        durationInFrames={180}
        fps={vertical.fps}
        width={vertical.width}
        height={vertical.height}
        defaultProps={{
          title: 'AI Motion Studio',
          subtitle: 'Vertical social delivery profile',
        }}
      />
    </>
  );
};
