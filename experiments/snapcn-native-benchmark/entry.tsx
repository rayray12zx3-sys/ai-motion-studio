/** Unmodified upstream snapcn free components; original fictional plates only.
 * Copied into the pinned snapcn repo's src/remotion/ during isolated CI. */
import React from "react";
import { AbsoluteFill, Composition, registerRoot, staticFile } from "remotion";
import { PhoneFrame } from "../../registry/snap-cn/phone-frame/index";
import { HeroLaunch } from "../../registry/snap-cn/hero-launch/index";

const Atlas = () => (
  <AbsoluteFill style={{background:"linear-gradient(155deg,#151B2A 3%,#242F43 58%,#121723 100%)"}}>
    <PhoneFrame
      variant="showcase" entrance="rise" mode="dark" scale={1.65}
      screenSrc={staticFile("ams-benchmark/atlas-planning.svg")}
      floatLoop={true}
    />
  </AbsoluteFill>
);

const Index = () => (
  <AbsoluteFill style={{backgroundColor:"#050708"}}>
    <HeroLaunch
      heading="From source to caption"
      image1={staticFile("ams-benchmark/index-source.svg")}
      image2={staticFile("ams-benchmark/index-result.svg")}
    />
  </AbsoluteFill>
);

function Root() {
  return <>
    <Composition id="AMSAtlasDevice" component={Atlas}
      durationInFrames={240} fps={30} width={1080} height={1920} />
    <Composition id="AMSIndexProductHero" component={Index}
      durationInFrames={170} fps={30} width={1280} height={720} />
  </>;
}
registerRoot(Root);
