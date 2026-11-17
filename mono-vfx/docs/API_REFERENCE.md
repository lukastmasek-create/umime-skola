# API
- `sampleCamera(keys, t, shakes)` / `<CameraRig keys time shakes/>`: keys `{t,pos,target,fov,roll}`.
- `ConvexSolid.roundedCube(half, radius, grid)`, `.clip({n,d}, capTag) -> {inside, outside}`, `.toGeometry()` (groups: 0 skin, 1 cap; attr `aEdge` for heat glow).
- `springStep(t, omega, zeta)`, `impulse`, `seg`, `smoothstep`, `smootherstep`, `easeOutCubic`.
- `makeRng(seed)`, `QUALITY[preview|high|ultra]`, `makeMaterial(name)`, `buildStudioEnvironment(gl, name, size)`.
- Effect props: `{quality, orientation: 'portrait'|'landscape'}`.
