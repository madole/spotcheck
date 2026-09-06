<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Spotcheck (r3f-inspection)

R3F model-inspection app: load `.glb` → auto-normalize → click model to anchor notes → export/import notes JSON, autosave session to IndexedDB.

## Commands

- `vp dev` / `vp build` (build = `tsc && vp build`); validate with `vp check` then `vp test`.
- Tests are colocated Vitest files (`src/**/*.test.ts`): `vp test <path>` for one file.
- Package manager is pnpm 11 (`devEngines`); use `vp install`, not npm.
- `vp run vendor:decoders` re-vendors Draco/Basis decoders into `public/decoders/` (also runs on postinstall). Don't hand-edit `public/decoders/`.

## Gotchas

- `src/` uses `@/*` alias + extensioned relative imports: `import type { X } from "../model/y.ts"`. `verbatimModuleSyntax` + `erasableSyntaxOnly` are on — always use `import type` for types, no enums/namespaces.
- `noUnusedLocals`/`noUnusedParameters` on; lint is type-aware (`vite-plus/prefer-vite-plus-imports` is error — import from `vite-plus`, not `vite`).
- Canvas needs `gl={{ preserveDrawingBuffer: true }}` for screenshot export (`src/viewer/screenshot.ts`); don't remove.
- Decoders load from `${BASE_URL}decoders/` (`src/model/gltfLoader.ts`); Draco/KTX2/Meshopt must keep working.
- Model identity is content hash (`src/model/hash.ts`); project `.json` reopens only against the matching `.glb` (`src/project/projectFile.ts`). Fixtures in `fixtures/` (`part.glb`, `part-draco.glb`, `part-meshopt.glb`, `part-huge.glb`) cover loader paths — use them for manual verification.
- State is per-domain Zustand stores (`annotations/`, `model/`, `project/`, `viewer/`); autosave is debounced 800ms via `startAutosave` in `App.tsx`. Cross-store reads use `getState()`, not prop drilling.
- shadcn `base-nova` style; UI primitives in `src/components/ui/`, neo-brutalist helpers in `src/ui/neo.ts`.
