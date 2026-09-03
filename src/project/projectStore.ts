import { create } from "zustand";

import type { Annotation } from "../annotations/annotationStore.ts";
import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { hashBytes } from "../model/hash.ts";
import { getModel, getSession, isQuotaError, putSession } from "../model/modelLibrary.ts";
import { useModelStore } from "../model/modelStore.ts";
import { downloadBlob } from "../ui/download.ts";
import {
  buildProject,
  modelHash,
  parseProject,
  serializeProject,
  type Project,
} from "./projectFile.ts";

export interface ProjectState {
  savedAt: string | undefined;
  error: string | undefined;
  notice: string | undefined;
  pending: Project | undefined;
  save: () => void;
  open: (file: File) => Promise<void>;
  locate: (file: File) => Promise<void>;
  restore: () => Promise<void>;
  dismissError: () => void;
  dismissNotice: () => void;
}

function download(json: string, filename: string): void {
  downloadBlob(new Blob([json], { type: "application/json" }), filename);
}

function currentProject(): Project | undefined {
  const model = useModelStore.getState().model;

  if (!model) {
    return undefined;
  }

  return buildProject({
    model: {
      id: model.id,
      name: model.name,
      byteLength: model.byteLength,
      normalization: model.normalization,
    },
    annotations: useAnnotationStore.getState().annotations,
  });
}

async function waitForLoader(timeoutMs = 10000): Promise<void> {
  const started = Date.now();

  while (!useModelStore.getState().loader && Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function loadModelFromLibrary(hash: string): Promise<boolean> {
  const stored = await getModel(hash).catch(() => undefined);

  if (!stored) {
    return false;
  }

  await waitForLoader();

  const file = new File([stored.blob], stored.name, { type: "model/gltf-binary" });

  await useModelStore.getState().open(file);

  return useModelStore.getState().model !== undefined;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  savedAt: undefined,
  error: undefined,
  notice: undefined,
  pending: undefined,

  save() {
    const project = currentProject();

    if (!project) {
      set({ error: "Load a model before exporting notes." });
      return;
    }

    const stem = project.model.name.replace(/\.glb$/i, "");

    download(serializeProject(project), `${stem}-notes.json`);
    set({ savedAt: project.savedAt, error: undefined });
  },

  async open(file) {
    const parsed = parseProject(await file.text());

    if (!parsed.ok) {
      set({ error: parsed.error, pending: undefined });
      return;
    }

    const project = parsed.project;

    if (await loadModelFromLibrary(modelHash(project))) {
      useAnnotationStore.getState().replaceAll(project.annotations);
      set({ savedAt: project.savedAt, error: undefined, pending: undefined, notice: undefined });
      return;
    }

    set({
      pending: project,
      error: undefined,
      notice: `Locate ${project.model.name} to place ${project.annotations.length} note(s).`,
    });
  },

  async locate(file) {
    const pending = get().pending;

    if (!pending) {
      return;
    }

    const hash = await hashBytes(await file.arrayBuffer());

    if (hash !== modelHash(pending)) {
      set({
        error: `${file.name} is not the model these notes were made on. Expected ${pending.model.id}. Notes were not loaded.`,
        pending: undefined,
        notice: undefined,
      });
      return;
    }

    await useModelStore.getState().open(file);
    useAnnotationStore.getState().replaceAll(pending.annotations as Annotation[]);
    set({ savedAt: pending.savedAt, error: undefined, pending: undefined, notice: undefined });
  },

  async restore() {
    const session = await getSession().catch(() => undefined);

    if (!session) {
      return;
    }

    const parsed = parseProject(session.project);

    if (!parsed.ok) {
      return;
    }

    const project = parsed.project;

    if (await loadModelFromLibrary(modelHash(project))) {
      useAnnotationStore.getState().replaceAll(project.annotations);
      set({ savedAt: project.savedAt, pending: undefined });
      return;
    }

    set({
      pending: project,
      notice: `Locate ${project.model.name} to place ${project.annotations.length} note(s).`,
    });
  },

  dismissError() {
    set({ error: undefined });
  },

  dismissNotice() {
    set({ notice: undefined });
  },
}));

let timer: ReturnType<typeof setTimeout> | undefined;

async function persist(): Promise<void> {
  const project = currentProject();

  if (!project) {
    return;
  }

  try {
    await putSession(serializeProject(project));
    useProjectStore.setState({ notice: undefined });
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn("Autosave paused: browser storage is full", error);
      useProjectStore.setState({
        notice:
          "Autosave is paused because browser storage is full. Export your notes to keep them.",
      });
    } else {
      throw error;
    }
  }
}

export function startAutosave(): () => void {
  const schedule = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => void persist(), 800);
  };

  const stopModel = useModelStore.subscribe(schedule);
  const stopAnnotations = useAnnotationStore.subscribe(schedule);

  return () => {
    if (timer) {
      clearTimeout(timer);
    }

    stopModel();
    stopAnnotations();
  };
}
