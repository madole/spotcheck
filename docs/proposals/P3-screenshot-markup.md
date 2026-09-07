# P3 — Screenshot markup export (2D overlay on PNG)

## Value proposition

The PNG export (T8) captures what is on screen, but reviewers still paste it into
another tool to draw arrows and circles before sending it to a supplier. Every hop
loses context. In-app 2D markup closes the loop: inspect → mark → send, one file.

## Solution

- After capture, open a lightweight 2D editor (arrow, circle, freehand, text) over
  the PNG; no WebGL compositing needed since T8 already gives us the pixels.
- Markup layer stored separately from 3D annotations so the model stays clean.
- Export final PNG + optional sidecar JSON of markup strokes for re-editing.

## Acceptance

- [ ] Arrow / circle / text draw on the captured PNG and export correctly
- [ ] 3D annotations remain untouched by 2D markup
- [ ] Re-export without markup still works (markup is opt-in, not forced)
