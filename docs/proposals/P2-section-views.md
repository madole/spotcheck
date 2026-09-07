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

- [ ] Slider moves the cut plane live with no reload
- [ ] Notes stay anchored when the plane moves
- [ ] Clip state round-trips through project save / load
