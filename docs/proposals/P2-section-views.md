# P2 — Section views (clipping planes)

## Value proposition

Surface-only inspection misses internal faults: wall thickness, hidden voids, mating
faces. Reviewers currently guess from the outside or bounce back to CAD. A clipping
plane turns Spotcheck from a surface comment tool into a real inspection tool for
mechanical parts, which is where the willingness to pay lives.

## Solution

- One-axis clip toggle (X / Y / Z) with a drag slider, implemented as a three.js
  clipping plane on the model root so annotations stay in place.
- Cap rendering optional (stencil cap or plain cross-hatch colour); v1 can ship
  with open hollow cut, which is enough for visual checks.
- Clip state saved per project so a shared file reopens in the same section.
- Annotations on clipped-away geometry dim rather than disappear.

## Acceptance

- [x] Slider moves the cut plane live with no reload
- [x] Notes stay anchored when the plane moves
- [x] Clip state round-trips through project save / load

## Status

Shipped as T12 (global plane + floating bottom-center panel), T13 (project v3).
`Section` menu button opens the panel (axis buttons, long slider with readout,
`Clear`, `Done`); closing keeps the cut. `vp check` clean, 43/43 tests pass.
Manual check still open: drag the cut on `fixtures/part.glb` and confirm the
PNG export shows the same section.
