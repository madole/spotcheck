import { create } from "zustand";

import type { Anchor } from "./coordinates.ts";

export interface Annotation {
  id: string;
  /** Number shown next to the note. Never reused, even after deletion. */
  ordinal: number;
  anchor: Anchor;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationState {
  annotations: Annotation[];
  add: (anchor: Anchor) => string;
  setText: (id: string, text: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  replaceAll: (annotations: Annotation[]) => void;
}

function nextOrdinal(annotations: Annotation[]): number {
  return annotations.reduce((highest, annotation) => Math.max(highest, annotation.ordinal), 0) + 1;
}

export const useAnnotationStore = create<AnnotationState>()((set) => ({
  annotations: [],

  add(anchor) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    set((state) => ({
      annotations: [
        ...state.annotations,
        {
          id,
          ordinal: nextOrdinal(state.annotations),
          anchor,
          text: "",
          createdAt: now,
          updatedAt: now,
        },
      ],
    }));

    return id;
  },

  setText(id, text) {
    set((state) => ({
      annotations: state.annotations.map((annotation) =>
        annotation.id === id
          ? { ...annotation, text, updatedAt: new Date().toISOString() }
          : annotation,
      ),
    }));
  },

  remove(id) {
    set((state) => ({
      annotations: state.annotations.filter((annotation) => annotation.id !== id),
    }));
  },

  clear() {
    set({ annotations: [] });
  },

  replaceAll(annotations) {
    set({ annotations });
  },
}));
