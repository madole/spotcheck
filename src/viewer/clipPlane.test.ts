import { describe, expect, it } from "vite-plus/test";

import { clipToPlane } from "./clipPlane.ts";

describe("clipToPlane", () => {
  it("points the normal down the clipped axis", () => {
    expect(clipToPlane({ axis: "x", offset: 0.2 }).normal).toEqual([-1, 0, 0]);
    expect(clipToPlane({ axis: "y", offset: 0.2 }).normal).toEqual([0, -1, 0]);
    expect(clipToPlane({ axis: "z", offset: 0.2 }).normal).toEqual([0, 0, -1]);
  });

  it("passes the offset through as the plane constant", () => {
    expect(clipToPlane({ axis: "x", offset: -0.4 }).constant).toBe(-0.4);
  });
});
