import React from 'react';
import {Composition} from 'remotion';
import {DemoComposition} from './DemoComposition';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MotionDemo"
        component={DemoComposition}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'AI Motion Studio',
          subtitle: 'Remotion starter demo',
        }}
      />
    </>
  );
};
