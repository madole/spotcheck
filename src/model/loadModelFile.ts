import type { Group } from "three";

import type { GltfLoader } from "./gltfLoader.ts";
import { hashBytes } from "./hash.ts";
import { getModel, isQuotaError, putModel } from "./modelLibrary.ts";

export interface LoadedModel {
  id: string;
  name: string;
  byteLength: number;
  scene: Group;
  fromLibrary: boolean;
}

export class ModelLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelLoadError";
  }
}

function accept(file: File): void {
  if (!file.name.toLowerCase().endsWith(".glb")) {
    throw new ModelLoadError(
      `${file.name} is not a .glb file. Export the model as a single .glb file.`,
    );
  }

  if (file.size === 0) {
    throw new ModelLoadError(`${file.name} is empty.`);
  }
}

export async function loadModelFile(file: File, loader: GltfLoader): Promise<LoadedModel> {
  accept(file);

  const buffer = await file.arrayBuffer();
  const id = await hashBytes(buffer);
  const cached = await getModel(id).catch(() => undefined);
  const blob = cached?.blob ?? new Blob([buffer], { type: "model/gltf-binary" });

  if (!cached) {
    try {
      await putModel({
        id,
        name: file.name,
        byteLength: buffer.byteLength,
        blob,
        addedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn("Model library is full; continuing without caching", error);
      } else {
        throw error;
      }
    }
  }

  let scene: Group;

  try {
    const gltf = await loader.parse(await blob.arrayBuffer());
    scene = gltf.scene;
  } catch (error) {
    throw new ModelLoadError(`Could not read ${file.name}: ${describe(error)}`);
  }

  return {
    id,
    name: file.name,
    byteLength: buffer.byteLength,
    scene,
    fromLibrary: cached !== undefined,
  };
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
