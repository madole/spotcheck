# P5 — Share links (read-only review URLs)

## Value proposition

Today sharing means sending a `.glb` plus a `-notes.json` and hoping the other
person opens both correctly. That friction kills collaboration. A single link that
opens the exact model + camera + notes lets a supplier or teammate see the problem
in one click — the feature that turns a solo tool into a team workflow.

## Solution

- Serialize project (model hash + annotations + camera) into a compact URL hash or
  a small hosted blob; recipient opens link, app fetches model from IndexedDB or
  prompts for the `.glb` with auto-verify against the hash.
- Read-only mode: notes visible, editing disabled, prominent "duplicate to edit".
- No backend required for v1 — encoded URL works for small annotation sets; add
  hosted storage only when URLs get too long.

## Acceptance

- [ ] Link opens the same camera position and visible notes
- [ ] Hash mismatch shows the existing "locate the model" flow, not a crash
- [ ] Read-only mode blocks edits but allows screenshot export
