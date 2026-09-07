import { create } from "zustand";

import type { Clip } from "./clipPlane.ts";

export type Tool = "annotate" | "measure";

export interface ViewerState {
  tool: Tool;
  setTool: (tool: Tool) => void;
  /** Active section cut, if any. World space, post-normalization. */
  clip: Clip | null;
  setClip: (clip: Clip) => void;
  clearClip: () => void;
  /** Whether the floating section-cut panel is open. */
  clipOpen: boolean;
  setClipOpen: (open: boolean) => void;
  /** Incremented every time the user asks for the model to be framed. */
  frameAllToken: number;
  requestFrameAll: () => void;
  /** Surface anchor in the model root's local space; the rig converts it to world. */
  focus: { position: [number, number, number]; token: number } | null;
  requestFocus: (position: [number, number, number]) => void;
}

export const useViewerStore = create<ViewerState>()((set) => ({
  tool: "annotate",
  setTool: (tool) => set({ tool }),
  clip: null,
  setClip: (clip) => set({ clip }),
  clearClip: () => set({ clip: null }),
  clipOpen: false,
  setClipOpen: (open) => set({ clipOpen: open }),
  frameAllToken: 0,
  requestFrameAll: () => set((state) => ({ frameAllToken: state.frameAllToken + 1 })),
  focus: null,
  requestFocus: (position) =>
    set((state) => ({ focus: { position, token: (state.focus?.token ?? 0) + 1 } })),
}));
