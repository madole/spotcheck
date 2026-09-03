import { create } from "zustand";

export interface ViewerState {
  /** Incremented every time the user asks for the model to be framed. */
  frameAllToken: number;
  requestFrameAll: () => void;
}

export const useViewerStore = create<ViewerState>()((set) => ({
  frameAllToken: 0,
  requestFrameAll: () => set((state) => ({ frameAllToken: state.frameAllToken + 1 })),
}));
