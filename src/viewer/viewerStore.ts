import { create } from "zustand";

export interface ViewerState {
  /** Incremented every time the user asks for the model to be framed. */
  frameAllToken: number;
  requestFrameAll: () => void;
  /** Surface anchor in the model root's local space; the rig converts it to world. */
  focus: { position: [number, number, number]; token: number } | null;
  requestFocus: (position: [number, number, number]) => void;
}

export const useViewerStore = create<ViewerState>()((set) => ({
  frameAllToken: 0,
  requestFrameAll: () => set((state) => ({ frameAllToken: state.frameAllToken + 1 })),
  focus: null,
  requestFocus: (position) =>
    set((state) => ({ focus: { position, token: (state.focus?.token ?? 0) + 1 } })),
}));
