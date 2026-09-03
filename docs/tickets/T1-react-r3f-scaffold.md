# T1 — React + R3F scaffold

## Why

The repo is a vanilla-TS Vite+ starter (`src/counter.ts`, no React). Every other ticket
depends on a working React/Vite/TS toolchain with react-three-fiber mounted.

## Behaviour

- `vp dev` serves a React app that renders a Three.js canvas filling the viewport.
- The scene has a neutral background, lighting that makes an untextured mesh read
  clearly, and a ground grid for spatial reference.
- `vp check` (format, lint, typecheck) and `vp test` both pass on a clean tree.

## Patterns to follow

- Plugins go in `vite.config.ts` via `defineConfig` from `vite-plus`. Do not add a
  separate `vitest.config.ts`; put test config in the `test` block.
- Test imports come from `vite-plus/test`, not `vitest`.

## Acceptance criteria

- [ ] Empty canvas renders at full viewport size, no console errors or WebGL warnings
- [ ] `vp check` and `vp test` exit 0
- [ ] A placeholder box in the scene is visibly lit and sits on the grid
- [ ] HMR works when editing a `.tsx` file

## Implementation notes

- `tsconfig.json` needs `"jsx": "react-jsx"`.
- `index.html` script src becomes `/src/main.tsx`.
- Delete `src/counter.ts`, `src/main.ts`, and the starter `src/assets/`.
- Pin React to `~19.2` — `@react-three/fiber@9` peers on `>=19 <19.3`.
- Grid comes from three's built-in `gridHelper` for now; drei is introduced in T3.

## Out of scope

Model loading, annotation UI, styling system.
