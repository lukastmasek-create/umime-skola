import { Composition } from "remotion";
import { Promo } from "./Promo";
import { DURATION, FPS, H, W } from "./theme";

export const Root = () => (
  <Composition
    id="Promo"
    component={Promo}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
