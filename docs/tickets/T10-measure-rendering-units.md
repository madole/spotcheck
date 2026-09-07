# T10 — Measurement rendering and unit scale

## Why

A number with no visible line is untrustworthy, and a number in fake millimetres
is worse. The 3D line plus label proves what was measured, and an explicit
user-set scale keeps displayed units honest for unitless glTF files.

## Behaviour

- Each completed measurement renders as a drei `<Line>` between its two anchors
  plus a `<Billboard>` + `<Text>` label, as real scene geometry next to `<Notes />`
  in `ModelRoot` — so the T8 PNG export captures it with no extra work.
- While picking point B, a live preview line runs from pick A to the hover point.
- Label sizing follows the `Notes.tsx` pattern: `unitsPerWorld` scaling, troika
  measured bounds for the backing plate, camera-facing billboard.
- Units: the stored distance is converted with `distanceLocal / normalization.scale`
  into source units, then multiplied by a user-set factor ("1 unit = N mm").
- The factor is set per model (keyed by model hash, default 1, labelled `units`
  until the user sets it) via a small toolbar/model-panel control; changing it
  re-renders all labels live without touching stored data.

## Patterns to follow

- Reuse `FONT_URL`, label plate construction, and `FLOOR_DISTANCE` scaling from
  `Notes.tsx`; extract shared bits only if it stays simple.
- Store the factor alongside the model record (same key as the IndexedDB library
  entry), not on each measurement, so one setting applies to all notes on a model.

## Acceptance criteria

- [ ] Line + label render in 3D and appear in the PNG screenshot export
- [ ] Preview line tracks the hover point until the second click
- [ ] Default label reads in `units`; setting "1 unit = 25.4 mm" converts all labels
- [ ] Twenty measurements on screen hold the same 60fps bar as T5
- [ ] Rendering works fully offline (vendored font, no CDN)

## Out of scope

Persistence of measurements and the factor (T11). Angle and radius modes.
