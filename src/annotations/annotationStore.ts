import { create } from "zustand";

import type { Anchor } from "./coordinates.ts";

export interface Annotation {
  id: string;
  /** Number shown next to the note. Never reused, even after deletion. */
  ordinal: number;
  anchor: Anchor;
  text: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationState {
  annotations: Annotation[];
  selectedId: string | null;
  add: (anchor: Anchor) => string;
  setText: (id: string, text: string) => void;
  setResolved: (id: string, resolved: boolean) => void;
  select: (id: string | null) => void;
  discardDraft: () => void;
  remove: (id: string) => void;
  clear: () => void;
  replaceAll: (annotations: Annotation[]) => void;
}

function nextOrdinal(annotations: Annotation[]): number {
  return annotations.reduce((highest, annotation) => Math.max(highest, annotation.ordinal), 0) + 1;
}

function withoutEmptyDrafts(annotations: Annotation[]): Annotation[] {
  return annotations.filter((annotation) => annotation.text !== "");
}

export const useAnnotationStore = create<AnnotationState>()((set) => ({
  annotations: [],
  selectedId: null,

  add(anchor) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    set((state) => ({
      annotations: [
        ...withoutEmptyDrafts(state.annotations),
        {
          id,
          ordinal: nextOrdinal(state.annotations),
          anchor,
          text: "",
          resolved: false,
          createdAt: now,
          updatedAt: now,
        },
      ],
      selectedId: id,
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

  setResolved(id, resolved) {
    set((state) => ({
      annotations: state.annotations.map((annotation) =>
        annotation.id === id
          ? { ...annotation, resolved, updatedAt: new Date().toISOString() }
          : annotation,
      ),
    }));
  },

  select(id) {
    set((state) => {
      const previous = state.annotations.find((annotation) => annotation.id === state.selectedId);
      const annotations =
        previous && previous.text === ""
          ? state.annotations.filter((annotation) => annotation.id !== previous.id)
          : state.annotations;

      return { annotations, selectedId: id };
    });
  },

  discardDraft() {
    set((state) => {
      const selected = state.annotations.find((annotation) => annotation.id === state.selectedId);

      if (!selected || selected.text !== "") return { selectedId: null };

      return {
        annotations: state.annotations.filter((annotation) => annotation.id !== selected.id),
        selectedId: null,
      };
    });
  },

  remove(id) {
    set((state) => ({
      annotations: state.annotations.filter((annotation) => annotation.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  clear() {
    set({ annotations: [], selectedId: null });
  },

  replaceAll(annotations) {
    set({ annotations, selectedId: null });
  },
}));
