# T4 — Annotation anchoring and store

## Why

This is the foundation of the killer feature and the part most likely to rot. Get the
coordinate contract wrong and notes drift or vanish after reload.

## Behaviour

- Clicking the model in annotate mode creates an annotation anchored to that exact
  surface point.
- Anchors are stored in the **model root's local space** alongside the surface normal at
  the click point, so notes hold position under any camera move or re-normalization.
- A drag that orbits the camera never creates a note.
- Annotations live in a zustand store as the single source of truth, each with a stable
  id, a display ordinal, and timestamps.
- The hit mesh's name is recorded for context but never used for placement.

## Patterns to follow

- Keep the math in a pure module (`coordinates.ts`) with no React or WebGL dependency so
  it is unit tested in Node — three's math classes work headlessly.
- Never persist `event.point` (world space); convert to root-local first.

## Acceptance criteria

- [ ] Click a point, orbit 180°, return — the pin sits on the same surface point
- [ ] A click following a >6px drag, or lasting >400ms, creates nothing
- [ ] The same click position always yields identical stored coordinates
- [ ] Unit tests cover world→local round trip and normal transformation under scale
- [ ] Coordinates survive a full save/load cycle (cross-check T7)

## Out of scope

How notes are drawn (T5) or edited (T6). The persistence format (T7).
