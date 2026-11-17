import React from "react";
import { Composition } from "remotion";
import { SpotifyShowcase } from "./SpotifyShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SpotifyShowcase"
      component={SpotifyShowcase}
      durationInFrames={1500}
      fps={60}
      width={1080}
      height={1920}
    />
  );
};
