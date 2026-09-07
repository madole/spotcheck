# T9 — Measure tool interaction (click-click draft)

## Why

Distance is the smallest useful measurement and the foundation for angle/radius
later. A click-click draft reuses the proven T4 anchor pipeline, so picks are as
reliable as notes.

## Behaviour

- A toolbar toggle switches between `annotate` and `measure` modes (new `tool`
  field in `viewerStore`, default `annotate`).
- In measure mode, the first left-click anchors pick A and shows a pending marker;
  the second left-click anchors pick B and completes the measurement.
- The existing click filter applies: non-left buttons, travel >6px, or press
  > 400ms create nothing.
- Esc, right-click, or switching modes discards an incomplete draft.
- Both picks go through `anchorFromIntersection` and are stored in model-root
  local space, never world space.

## Patterns to follow

- Branch the existing `onPointerUp` handler in `Viewer.tsx` on the tool mode;
  do not duplicate the click-detection logic.
- Keep pick math in a pure module next to `coordinates.ts` so it is unit tested
  in Node with no React or WebGL dependency.

## Acceptance criteria

- [ ] First click shows a pending marker, second click completes a measurement
- [ ] Orbit drags (>6px or >400ms) create nothing in measure mode
- [ ] Esc / right-click / mode switch clears the draft without a trace
- [ ] Unit tests cover draft state transitions (empty → one pick → complete → clear)

## Out of scope

Rendering the line and label (T10). Persistence (T11). Angle and radius modes.
