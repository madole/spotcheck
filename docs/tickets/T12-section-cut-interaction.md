# T12 — Section cut interaction (single-axis clip)

## Why

Surface-only inspection misses wall thickness, hidden voids, and mating faces.
A clipping plane turns Spotcheck into a real inspection tool for mechanical
parts, without leaving the fast review loop.

## Behaviour

- A `Section` button in the menu bar opens a floating panel pinned to the
  bottom middle of the viewport; the button stays highlighted while the panel
  is open or a cut is active.
- The panel holds X / Y / Z buttons (arming that axis at offset 0, keeping the
  offset when re-clicking the active axis), a long slider (−1.2…1.2 world
  units, step 0.01) with a numeric readout, `Clear`, and `Done`.
- Closing the panel with `Done` keeps the cut active; reopening shows the
  current axis and offset.
- The cut is a global `renderer.clippingPlanes` plane applied by a small
  `<ClipPlane />` component inside the canvas — one array assignment, no
  per-material bookkeeping, so nothing leaks when models swap.
- Plane math lives in a pure module (`clipPlane.ts`): the normal points down
  the axis so a growing offset reveals more of the model.
- Opening a new model clears the cut; cut state lives in `viewerStore`.
- v1 renders the open hollow cut with no caps; notes on clipped-away geometry
  are cut like everything else.

## Patterns to follow

- Keep the axis→normal mapping in a headless pure module with unit tests,
  same pattern as `coordinates.ts`.
- Branch nothing in the annotation pipeline; clipping happens entirely in GL.

## Acceptance criteria

- [ ] Slider drags the cut live with no reload on `fixtures/part.glb`
- [ ] Switching axes keeps the interaction smooth; reset restores the full model
- [ ] Exported PNG shows the same cut as the live view
- [ ] Unit tests cover the axis→plane mapping for all three axes

## Out of scope

Capped solid rendering. Multi-plane or box clips. Per-note dimming.
