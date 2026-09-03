# T5 — Notes rendered as part of the model

## Why

The whole product promise is that notes feel attached to the model rather than pasted on
the screen.

## Behaviour

- Each annotation renders as a numbered 3D marker just off the surface, a leader line,
  and a billboarded text label with a readable background — all real scene geometry.
- Labels face the camera and are hidden behind the model when it rotates away.
- Labels keep a fixed size in model space up close, so they grow as you zoom in, and hold a
  legible on-screen size once the camera pulls back past a floor distance.
- A newly created note shows as a clearly unsaved draft until committed.

## Patterns to follow

- drei `<Text>` (troika) wrapped in `<Billboard>`; size the backing plane from troika's
  measured text bounds rather than guessing.
- Depth-test the marker so occlusion is automatic, not raycast-based.

## Acceptance criteria

- [ ] Text stays legible whether the model is framed whole or zoomed to a bolt head
- [ ] Rotating a note to the far side hides its label and marker
- [ ] Labels stay upright and camera-facing from every orbit angle, including below
- [ ] Twenty notes on screen hold 60fps on a mid-range laptop
- [ ] Rendering works with the network fully offline

## Implementation notes

A `.woff`/`.ttf` must be vendored into `public/fonts/` and passed explicitly — troika's
default font is CDN-hosted and it cannot read `.woff2`.

## Out of scope

Editing note text (T6). Rich text and markdown; text wraps at a max width.
