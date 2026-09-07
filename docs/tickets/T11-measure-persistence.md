# T11 — Measurement persistence (project v2)

## Why

A measurement that vanishes on reload is a party trick. It must round-trip
through save, load, and autosave exactly like annotations, including the unit
factor that gives the numbers meaning.

## Behaviour

- A measurement is an annotation with two anchors: extend `ProjectAnnotation`
  with an optional `measurement: { b: Anchor; distanceLocal: number }` block and
  the annotation's own anchor serves as pick A.
- Bump the project format to v2; v1 files still open (no measurement block =
  plain note). Unknown future versions keep the existing hard error.
- The per-model unit factor persists with the model record (IndexedDB library
  entry, keyed by content hash) and travels in the exported JSON so a reopened
  project shows the same displayed numbers.
- Autosave needs no new wiring: it subscribes to the annotation store, which now
  carries measurements; the note panel shows the measurement value with its unit
  label and it is included in the exported JSON.

## Patterns to follow

- Extend `parseAnnotation` / `serializeProject` in `projectFile.ts`; keep the
  strict parser style (named errors per note, e.g. `Note 3 has no measurement`).
- The factor is display-only: never bake it into `distanceLocal`, only apply at
  render/export time, so changing units cannot corrupt stored geometry.

## Acceptance criteria

- [ ] Save → load round-trips measurements with identical local coordinates
- [ ] v1 project files open as before with zero regressions
- [ ] Unit factor survives reload and shows the same displayed values
- [ ] Autosave persists a new measurement within the existing debounce window
- [ ] Unit tests cover v1/v2 parse round-trips and factor application

## Out of scope

Angle and radius measurement modes. Hosted share links (P5).
