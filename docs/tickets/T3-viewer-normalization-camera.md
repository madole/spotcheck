# T3 — Viewer, model normalization, and camera

## Why

Models arrive at wildly different scales and origins. Without deterministic
normalization, annotation coordinates aren't comparable between sessions and the camera
starts inside the model or a mile away from it.

## Behaviour

- Every loaded model is wrapped in a root group, scaled by a **uniform** factor to a
  standard bounding-sphere radius and re-centred on the origin.
- The user orbits in all axes, zooms, and pans with the mouse.
- A "frame all" control re-fits the model.
- The scale/center/radius actually applied are exposed so T7 can persist them.

## Patterns to follow

- Use drei's `CameraControls` over `OrbitControls` — identical orbit feel, but
  `setLookAt` with transitions gives T6's fly-to for free.
- Normalization is a pure function of a `Box3`, unit tested with no WebGL.

## Acceptance criteria

- [ ] A 0.01-unit and a 1000-unit model both load filling roughly the same screen area
- [ ] Orbit has no gimbal lock or flipping at the poles; zoom clamps at sane near/far limits
- [ ] The same file always produces identical scale/center values
- [ ] "Frame all" returns to the initial framing from any camera state

## Implementation notes

Uniform scale is a hard requirement: T4 transforms normals with `transformDirection`,
which is only exact under uniform scale.

## Out of scope

Rotating the model itself (the camera orbits instead). Orthographic mode.
