# MONO — Architecture
Remotion + three.js (R3F via `@remotion/three`). All motion = pure function of `frame/60`. No live physics.

- `src/core/` Timeline (easing, closed-form springs, impulses), CameraRig (Hermite path + look-at quaternion + roll quat + deterministic shake), QualityPresets, DeterministicRandom (mulberry32).
- `src/geometry/ConvexSolid.ts` exact half-space clipping: real split geometry with planar cap polygons, smooth-shaded bevels. Reusable for fracture/slice families.
- `src/materials/presets.ts` PBR presets + procedural obsidian interior texture.
- `src/lighting/StudioEnvironment.ts` procedural softbox HDRI -> PMREM (dark cinematic, high-contrast, soft product, glass showcase, rim-lit).
- `src/effects/<family>/` one file per animation. `src/registry.ts` lists implemented effects only; `Root.tsx` registers each in 9:16 and `-16x9`.
- `scripts/render.mjs`, `scripts/still.mjs`, `scripts/registry.json` (keep in sync with registry.ts).
- Rendering uses `--gl=swangle` (SwiftShader) in this headless container.
