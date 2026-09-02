import React from "react";
import { Composition } from "remotion";
import { LunvoShowcaseVideo } from "./LunvoShowcaseVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LunvoShowcase"
      component={LunvoShowcaseVideo}
      durationInFrames={85 * 30} // 85 seconds at 30 fps (2550 frames)
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
