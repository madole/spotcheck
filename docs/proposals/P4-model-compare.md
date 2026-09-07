# P4 — Model compare (rev A vs rev B)

## Value proposition

The most expensive inspections are revision checks: "what changed between rev 3
and rev 4, and did it break anything?" Today that is eyeballing two files. A side-by-side
or overlay diff turns Spotcheck into the tool teams open at every design review,
which drives retention far more than single-model viewing.

## Solution

- Load two `.glb` files; reuse the existing normalize pipeline so both sit on the
  same ground plane at the same scale.
- Modes: side-by-side (linked cameras) and overlay (ghost opacity on rev A).
- Annotations attach to a specific revision id; switching revisions filters notes.
- Hash-based identity (`src/model/hash.ts`) already exists — extend project file to
  hold two model ids.

## Acceptance

- [ ] Both revisions load and normalize to the same scale
- [ ] Camera moves stay in sync in side-by-side mode
- [ ] Notes are tagged per revision and survive save / load
