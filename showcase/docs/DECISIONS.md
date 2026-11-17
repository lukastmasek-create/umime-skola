# DECISIONS
- Remotion 4.0.290 + three 0.171 + r3f 9 + @remotion/three. TypeScript pinned 5.7.3 (TS 7 breaks Remotion bundler).
- Screen content = real Playwright captures 3840x2160 on a basic (unlit, untonemapped) material for sharpness.
- Textures loaded with TextureLoader + delayRender (drei useTexture/Suspense rendered blank in Remotion).
- Env lighting via procedural Lightformers (no network HDRI); floor = alpha-faded disc; fake blob contact shadow.
- Render with `--gl=angle` (software WebGL in this container; slow).
- Backdrop is a CSS gradient behind a transparent canvas.
