import { describe, expect, it } from "vite-plus/test";

import type { Normalization } from "../model/normalize.ts";
import {
  FORMAT,
  HASH_PREFIX,
  VERSION,
  buildProject,
  modelHash,
  parseProject,
  serializeProject,
  type ProjectAnnotation,
} from "./projectFile.ts";

const normalization: Normalization = {
  scale: 0.42,
  center: [0, 1, 0],
  radius: 2.1,
  min: [-1, 0, -1],
  max: [1, 2, 1],
};

function annotation(overrides: Partial<ProjectAnnotation> = {}): ProjectAnnotation {
  return {
    id: "01J",
    ordinal: 1,
    anchor: { position: [0.1, 0.2, 0.3], normal: [0, 1, 0], meshName: "Bolt_04" },
    text: "Cracked housing",
    resolved: false,
    createdAt: "2026-09-03T00:00:00.000Z",
    updatedAt: "2026-09-03T00:00:00.000Z",
    ...overrides,
  };
}

function project(annotations: ProjectAnnotation[] = [annotation()]) {
  return buildProject({
    model: { id: "ab12", name: "pump.glb", byteLength: 1234567, normalization },
    annotations,
    savedAt: "2026-09-03T00:00:00.000Z",
  });
}

describe("buildProject", () => {
  it("prefixes the model hash and stamps the current version", () => {
    const built = project();

    expect(built.model.id).toBe(`${HASH_PREFIX}ab12`);
    expect(built.format).toBe(FORMAT);
    expect(built.version).toBe(VERSION);
  });

  it("leaves an already prefixed hash alone", () => {
    const built = buildProject({
      model: { id: `${HASH_PREFIX}cd34`, name: "p.glb", byteLength: 1, normalization },
      annotations: [],
    });

    expect(built.model.id).toBe(`${HASH_PREFIX}cd34`);
  });
});

describe("modelHash", () => {
  it("strips the prefix for library lookups", () => {
    expect(modelHash(project())).toBe("ab12");
  });
});

describe("parseProject", () => {
  it("round trips through export and import with identical annotation data", () => {
    const original = project([
      annotation(),
      annotation({ id: "02J", ordinal: 2, text: "Second", resolved: true }),
    ]);
    const serialized = serializeProject(original);
    const parsed = parseProject(serialized);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.project.annotations).toEqual(original.annotations);
    expect(serializeProject(parsed.project)).toBe(serialized);
  });

  it("rejects a file that is not JSON", () => {
    const result = parseProject("not json");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("not valid JSON");
  });

  it("rejects another format", () => {
    const result = parseProject(JSON.stringify({ format: "something-else", version: 1 }));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("not an r3f-inspection project");
  });

  it("rejects a newer version with an actionable message", () => {
    const result = parseProject(
      JSON.stringify({ format: FORMAT, version: VERSION + 1, model: {}, annotations: [] }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain(`v${VERSION + 1}`);
    expect(result.error).toContain("newer version");
  });

  it("rejects an unknown older version", () => {
    const result = parseProject(
      JSON.stringify({ format: FORMAT, version: 0, model: {}, annotations: [] }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("unknown version");
  });

  it("rejects a project with no model hash", () => {
    const result = parseProject(
      JSON.stringify({
        format: FORMAT,
        version: VERSION,
        model: { id: "ab12", name: "p.glb", byteLength: 1, normalization },
        annotations: [],
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("model hash");
  });

  it("rejects a note with an unknown status", () => {
    const raw = JSON.parse(serializeProject(project()));

    raw.annotations[0].status = "archived";

    const result = parseProject(JSON.stringify(raw));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("unknown status");
  });

  it("rejects a note with a missing position", () => {
    const raw = JSON.parse(serializeProject(project()));

    delete raw.annotations[0].position;

    const result = parseProject(JSON.stringify(raw));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("no position");
  });
});
