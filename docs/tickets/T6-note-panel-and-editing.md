# T6 — Note panel and editing

## Why

Clicking and immediately typing is what makes this feel like an inspection tool rather
than a demo.

## Behaviour

- Clicking the model creates a draft note with the editor focused, so the user types with
  no further clicks.
- A side panel lists all notes by ordinal with a text preview.
- Selecting a note flies the camera to it and highlights it in 3D.
- Notes can be edited, marked resolved, and deleted.
- Resolved notes are visually distinct on the model.

## Patterns to follow

- The panel is the single editing surface — one place text is typed, rather than a
  floating 3D input plus a panel.
- Fly-to reuses `CameraControls.setLookAt` from T3.

## Acceptance criteria

- [ ] Click model → type → commit produces a note without touching the mouse again
- [ ] `Esc` discards a draft; a draft is never persisted
- [ ] Clicking a panel entry animates the camera to frame that note's anchor
- [ ] Deleting a note removes it from the 3D scene and the panel immediately
- [ ] Keyboard-only navigation works through the list and editor

## Out of scope

Collaboration, assigning notes to users, threaded replies.
