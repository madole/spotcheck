# P1 — Measurement tools (distance / angle / radius)

## Value proposition

Inspection notes say "this gap is too wide" but never say how wide. Engineers then
open the model in CAD to get a number, which defeats the purpose of a fast review
tool. Native measurement keeps the whole "spot a problem → quantify it → note it"
loop inside Spotcheck and makes exported notes actionable for manufacturing.

## Solution

- Click-to-click distance mode: two anchored picks, live line + label in 3D, value
  stored on the annotation.
- Angle mode (three picks) and radius mode (fit to curved face normal sample) follow
  the same anchor pipeline as notes (`anchorFromIntersection` in local model space).
- Measurements respect normalization scale so displayed units match real model units.
- Export includes measurement values in the notes JSON and PNG screenshot.

## Acceptance

- [x] Distance between two picks matches known fixture dimension within tolerance
- [x] Measurement label renders in 3D and survives screenshot export
- [x] Measurement persists through save / load / autosave like any annotation

## Status

Shipped as T9 (tool + draft), T10 (render + per-model units), T11 (project v2).
`vp check` clean, 38/38 tests pass. Manual check still open: measure a known edge
of `fixtures/part.glb` in the running app and confirm the displayed value.
