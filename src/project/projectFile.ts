import type { Anchor } from "../annotations/coordinates.ts";
import type { Normalization } from "../model/normalize.ts";

export const FORMAT = "spotcheck";

/** Formats written before the rename; still openable. */
const LEGACY_FORMAT = "r3f-inspection";
export const VERSION = 1;
export const HASH_PREFIX = "sha256:";

export interface ProjectAnnotation {
  id: string;
  ordinal: number;
  anchor: Anchor;
  text: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectModel {
  id: string;
  name: string;
  byteLength: number;
  normalization: Normalization;
}

export interface Project {
  format: string;
  version: number;
  savedAt: string;
  model: ProjectModel;
  annotations: ProjectAnnotation[];
}

export type ParseResult = { ok: true; project: Project } | { ok: false; error: string };

export function modelHash(project: Project): string {
  const { id } = project.model;

  return id.startsWith(HASH_PREFIX) ? id.slice(HASH_PREFIX.length) : id;
}

export function buildProject(input: {
  model: { id: string; name: string; byteLength: number; normalization: Normalization };
  annotations: ProjectAnnotation[];
  savedAt?: string;
}): Project {
  const id = input.model.id.startsWith(HASH_PREFIX)
    ? input.model.id
    : `${HASH_PREFIX}${input.model.id}`;

  return {
    format: FORMAT,
    version: VERSION,
    savedAt: input.savedAt ?? new Date().toISOString(),
    model: { ...input.model, id },
    annotations: input.annotations,
  };
}

export function serializeProject(project: Project): string {
  return `${JSON.stringify(
    {
      format: project.format,
      version: project.version,
      savedAt: project.savedAt,
      model: project.model,
      annotations: project.annotations.map((annotation) => ({
        id: annotation.id,
        ordinal: annotation.ordinal,
        position: annotation.anchor.position,
        normal: annotation.anchor.normal,
        anchor: { meshName: annotation.anchor.meshName },
        text: annotation.text,
        status: annotation.resolved ? "resolved" : "open",
        createdAt: annotation.createdAt,
        updatedAt: annotation.updatedAt,
      })),
    },
    null,
    2,
  )}\n`;
}

function isTuple3(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every((n) => typeof n === "number");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNormalization(value: unknown): Normalization | string {
  if (!isObject(value)) return "model.normalization is missing.";

  const { scale, center, radius, min, max } = value;

  if (typeof scale !== "number") return "model.normalization.scale is missing or not a number.";
  if (!isTuple3(center)) return "model.normalization.center is not a list of three numbers.";
  if (typeof radius !== "number") return "model.normalization.radius is missing or not a number.";
  if (!isTuple3(min)) return "model.normalization.min is not a list of three numbers.";
  if (!isTuple3(max)) return "model.normalization.max is not a list of three numbers.";

  return { scale, center, radius, min, max };
}

function parseAnnotation(value: unknown, index: number): ProjectAnnotation | string {
  if (!isObject(value)) return `Annotation ${index + 1} is not an object.`;

  const { id, ordinal, position, normal, anchor, text, status, createdAt, updatedAt } = value;

  if (typeof id !== "string") return `Annotation ${index + 1} has no id.`;
  if (typeof ordinal !== "number") return `Annotation ${index + 1} has no ordinal.`;
  if (!isTuple3(position)) return `Note ${ordinal} has no position.`;
  if (!isTuple3(normal)) return `Note ${ordinal} has no normal.`;
  if (typeof text !== "string") return `Note ${ordinal} has no text.`;
  if (status !== "open" && status !== "resolved") return `Note ${ordinal} has an unknown status.`;
  if (typeof createdAt !== "string") return `Note ${ordinal} has no createdAt.`;
  if (typeof updatedAt !== "string") return `Note ${ordinal} has no updatedAt.`;

  const meshName = isObject(anchor) && typeof anchor.meshName === "string" ? anchor.meshName : "";

  return {
    id,
    ordinal,
    anchor: { position, normal, meshName },
    text,
    resolved: status === "resolved",
    createdAt,
    updatedAt,
  };
}

export function parseProject(text: string): ParseResult {
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }

  if (!isObject(raw)) return { ok: false, error: "That file is not a Spotcheck project." };

  if (raw.format !== FORMAT && raw.format !== LEGACY_FORMAT) {
    return { ok: false, error: "That file is not a Spotcheck project." };
  }

  if (typeof raw.version !== "number") {
    return { ok: false, error: "That project has no version number." };
  }

  if (raw.version > VERSION) {
    return {
      ok: false,
      error: `That project was saved by a newer version (v${raw.version}). Update the app to open it.`,
    };
  }

  if (raw.version < VERSION) {
    return {
      ok: false,
      error: `That project uses an unknown version (v${raw.version}) and cannot be opened.`,
    };
  }

  if (!isObject(raw.model)) return { ok: false, error: "That project has no model." };

  const { id, name, byteLength } = raw.model;

  if (typeof id !== "string" || !id.startsWith(HASH_PREFIX)) {
    return { ok: false, error: "That project does not reference a model hash." };
  }

  if (typeof name !== "string") return { ok: false, error: "That project's model has no name." };

  if (typeof byteLength !== "number") {
    return { ok: false, error: "That project's model has no byte length." };
  }

  const normalization = parseNormalization(raw.model.normalization);

  if (typeof normalization === "string") return { ok: false, error: normalization };

  if (!Array.isArray(raw.annotations)) {
    return { ok: false, error: "That project has no annotations list." };
  }

  const annotations: ProjectAnnotation[] = [];

  for (const [index, entry] of raw.annotations.entries()) {
    const annotation = parseAnnotation(entry, index);

    if (typeof annotation === "string") return { ok: false, error: annotation };

    annotations.push(annotation);
  }

  return {
    ok: true,
    project: {
      format: FORMAT,
      version: VERSION,
      savedAt: typeof raw.savedAt === "string" ? raw.savedAt : "",
      model: { id, name, byteLength, normalization },
      annotations,
    },
  };
}
