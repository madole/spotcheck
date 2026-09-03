# T7 — Project save, load, and autosave

## Why

Without this, notes die with the tab, which defeats the purpose.

## Behaviour

- Notes export to a `.json` file referencing the model by content hash.
- Reopening that file restores the model from the local library and reapplies every note
  with no re-upload.
- If the model isn't in the library, the user is asked to locate it, and the file is
  verified against the recorded hash before being accepted.
- Work in progress autosaves so a refresh or crash doesn't lose it.
- Files carrying a future or unknown version fail with an actionable message instead of
  loading half-correctly.

## Patterns to follow

- One pure module owns the schema, validation, and migration seam so the format is
  testable without a browser and version handling has a single home.

## Schema (v1)

```json
{
  "format": "r3f-inspection",
  "version": 1,
  "savedAt": "2026-09-03T00:00:00.000Z",
  "model": {
    "id": "sha256:ab12…",
    "name": "pump.glb",
    "byteLength": 1234567,
    "normalization": { "scale": 0.42, "center": [0, 1, 0], "radius": 2.1 }
  },
  "annotations": [
    {
      "id": "01J…",
      "ordinal": 1,
      "position": [0.1, 0.2, 0.3],
      "normal": [0, 1, 0],
      "anchor": { "meshName": "Bolt_04" },
      "text": "Cracked housing",
      "status": "open",
      "createdAt": "…",
      "updatedAt": "…"
    }
  ]
}
```

`normalization` is persisted so coordinates stay reproducible even if the fit algorithm
changes later.

## Acceptance criteria

- [ ] Save → close tab → reopen → load restores model and all notes in place
- [ ] Loading a project whose model is cached needs zero user interaction
- [ ] A mismatched model file is rejected with a clear message; notes are not corrupted
- [ ] A v1 file round-trips through export/import with byte-identical annotation data
- [ ] Refreshing mid-edit restores the unsaved working state
- [ ] IndexedDB quota errors degrade gracefully — the user can still export notes alone

## Out of scope

Cloud sync. Sharing a project with someone who doesn't have the model. Exporting the
model itself.
