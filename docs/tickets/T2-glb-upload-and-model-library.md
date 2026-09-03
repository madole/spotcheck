# T2 — GLB upload and model library

## Why

Users bring their own models, and saved projects must reopen without re-uploading. This
ticket owns getting bytes into a Three.js scene and keeping them addressable by content
hash so T7 can reference them.

## Behaviour

- User drops a `.glb` onto the window or picks one via a file button.
- Its SHA-256 is computed, the blob is cached in IndexedDB under that hash, and the model
  is parsed and displayed.
- Re-dropping previously seen content (same bytes, any filename) is served from cache.
- Models load with Draco geometry, KTX2 textures, and meshopt extensions decoded.
- Loading shows progress; a corrupt or unsupported file shows a clear error and leaves the
  current view intact.
- Swapping models releases the previous model's GPU resources.

## Patterns to follow

- Use `GLTFLoader.parse` on an `ArrayBuffer` rather than drei's `useGLTF` — we own the
  object lifecycle, and drei's URL-keyed suspense cache fights with ephemeral blob URLs.
- Model bytes live in IndexedDB via `idb`; only the hash travels in the project JSON.

## Acceptance criteria

- [ ] Plain, Draco-compressed, KTX2-textured, and meshopt `.glb` files all render
- [ ] Identical file dropped twice hits the IndexedDB cache the second time (no re-parse)
- [ ] Decoders resolve from `/public` with zero network requests to any CDN (test offline)
- [ ] Memory does not grow across ten model swaps (check `renderer.info.memory`)
- [ ] A truncated `.glb` surfaces an error toast; the previous model stays on screen

## Implementation notes

- Add `scripts/vendor-decoders.mjs` to copy three's `libs/draco/gltf` and `libs/basis`
  into `public/decoders/`, wired to a `package.json` script so a fresh clone works.
- `KTX2Loader` needs `detectSupport(renderer)` before use.

## Out of scope

Multi-file `.gltf` with external `.bin`/textures — reject with a message pointing at
`.glb`. Auto-framing the camera (T3).
