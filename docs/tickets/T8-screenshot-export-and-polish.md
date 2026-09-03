# T8 — Screenshot export and polish

## Why

Inspection notes exist to be shared in reports, and the 3D-text decision in T5 pays off
here: notes are real geometry, so they appear in the capture.

## Behaviour

- A toolbar action downloads the current view as a PNG including all visible notes at the
  current resolution.
- The app handles its edge states: a first-run empty state inviting an upload, a
  drag-over affordance, loading and error states, and a model/notes count summary.

## Patterns to follow

- `preserveDrawingBuffer: true` on the canvas plus `toDataURL`, capturing straight from
  the GL canvas — no compositing pass needed.

## Acceptance criteria

- [ ] Exported PNG matches the on-screen view including note text and markers
- [ ] Export works repeatedly without degrading the live view
- [ ] Empty state is self-explanatory with no model loaded
- [ ] Rapid error-inducing actions (dropping a `.txt`, dropping during load) never leave
      the UI stuck

## Out of scope

Annotating on top of a screenshot. Video or turntable capture. 2× supersampled export.
