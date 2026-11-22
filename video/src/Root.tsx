import { Composition } from "remotion";
import { Promo } from "./Promo";
import { DURATION, FPS, H, W } from "./theme";

export const Root = () => (
  <>
  <Composition
    id="Promo"
    component={Promo}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
  <Composition
    id="PromoReel"
    component={Promo}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  </>
);
