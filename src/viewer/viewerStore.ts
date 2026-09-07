import { create } from "zustand";

import type { Clip } from "./clipPlane.ts";

export type Tool = "annotate" | "measure";

export interface Lights {
  /** Hemisphere fill from above. */
  hemi: number;
  /** Key directional light strength. */
  key: number;
  /** Fill directional light strength. */
  fill: number;
  /** Key light orbit around the model, in degrees. */
  keyAngle: number;
}

export const DEFAULT_LIGHTS: Lights = {
  hemi: 0.6,
  key: 1.6,
  fill: 0.4,
  keyAngle: 37,
};

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
  lights: Lights;
  setLights: (lights: Partial<Lights>) => void;
  resetLights: () => void;
  /** Whether the floating lighting panel is open. */
  lightsOpen: boolean;
  setLightsOpen: (open: boolean) => void;
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
  lights: { ...DEFAULT_LIGHTS },
  setLights: (lights) => set((state) => ({ lights: { ...state.lights, ...lights } })),
  resetLights: () => set({ lights: { ...DEFAULT_LIGHTS } }),
  lightsOpen: false,
  setLightsOpen: (open) => set({ lightsOpen: open }),
  frameAllToken: 0,
  requestFrameAll: () => set((state) => ({ frameAllToken: state.frameAllToken + 1 })),
  focus: null,
  requestFocus: (position) =>
    set((state) => ({ focus: { position, token: (state.focus?.token ?? 0) + 1 } })),
}));
