# T13 — Section cut persistence (project v3)

## Why

A cut that vanishes on reload forces the reviewer to re-find the exact plane
every session. The cut is part of the inspection, so it round-trips like
everything else.

## Behaviour

- The project format bumps to v3 with an optional `clip` block
  (`{ axis, offset } | null`); v1/v2 files open with no cut.
- `currentProject()` reads the cut from `viewerStore`; open / locate / restore
  apply it after the model loads (model open clears the cut first).
- Autosave subscribes to `viewerStore` filtered to `clip` changes only, so
  camera tokens and tool switches never trigger a persist.
- The strict parser style holds: a present-but-invalid cut fails with
  `That project has a bad section cut.`

## Patterns to follow

- Same migration pattern as v1→v2: default the missing block, keep
  `MIN_VERSION = 1`.
- The factor rule from T11 applies here too: the cut is stored as data, applied
  at render time, never baked into geometry.

## Acceptance criteria

- [ ] Save → load restores the same axis and offset
- [ ] v1 and v2 files open with no cut and zero regressions
- [ ] Moving the slider persists within the existing debounce window
- [ ] Unit tests cover v3 round-trip, v2 compat, and bad-cut rejection

## Out of scope

Hosted share links (P5). Multi-plane clips.
