import { describe, expect, it } from "vite-plus/test";

import { screenshotFilename } from "./screenshot.ts";

describe("screenshotFilename", () => {
  it("keeps the model stem", () => {
    expect(screenshotFilename("part.glb")).toBe("part-view.png");
  });

  it("ignores the extension's case", () => {
    expect(screenshotFilename("Part.GLB")).toBe("Part-view.png");
  });

  it("falls back when the name is only an extension", () => {
    expect(screenshotFilename(".glb")).toBe("model-view.png");
  });
});
