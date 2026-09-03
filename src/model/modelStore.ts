import type { WebGLRenderer } from "three";
import { create } from "zustand";

import { disposeObject3D } from "./dispose.ts";
import { createGltfLoader, type GltfLoader } from "./gltfLoader.ts";
import { loadModelFile, type LoadedModel } from "./loadModelFile.ts";

export interface ModelState {
  renderer: WebGLRenderer | undefined;
  loader: GltfLoader | undefined;
  model: LoadedModel | undefined;
  loadingName: string | undefined;
  error: string | undefined;
  setRenderer: (renderer: WebGLRenderer | undefined) => void;
  open: (file: File) => Promise<void>;
  dismissError: () => void;
}

let sequence = 0;

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useModelStore = create<ModelState>()((set, get) => ({
  renderer: undefined,
  loader: undefined,
  model: undefined,
  loadingName: undefined,
  error: undefined,

  setRenderer(renderer) {
    get().loader?.dispose();

    set({
      renderer,
      loader: renderer ? createGltfLoader(renderer) : undefined,
    });
  },

  async open(file) {
    const { loader, model } = get();

    if (!loader) {
      set({ error: "The viewer has not started yet. Try again in a moment." });
      return;
    }

    const request = ++sequence;

    set({ error: undefined, loadingName: file.name });

    let loaded: LoadedModel;

    try {
      loaded = await loadModelFile(file, loader);
    } catch (error) {
      if (request === sequence) {
        set({ error: messageFor(error), loadingName: undefined });
      }

      return;
    }

    if (request !== sequence) {
      disposeObject3D(loaded.scene);
      return;
    }

    if (model) {
      disposeObject3D(model.scene);
    }

    set({ model: loaded, loadingName: undefined });
  },

  dismissError() {
    set({ error: undefined });
  },
}));
