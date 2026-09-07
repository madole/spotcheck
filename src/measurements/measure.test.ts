import { describe, expect, it } from "vite-plus/test";

import { distanceBetween, formatDistance, toDisplayUnits } from "./measure.ts";

describe("distanceBetween", () => {
  it("measures a 3-4-5 triangle", () => {
    expect(distanceBetween([0, 0, 0], [3, 4, 0])).toBeCloseTo(5);
  });

  it("is zero for identical points", () => {
    expect(distanceBetween([1, 2, 3], [1, 2, 3])).toBe(0);
  });
});

describe("toDisplayUnits", () => {
  it("undoes the normalization scale before applying the factor", () => {
    expect(toDisplayUnits(0.5, 0.5, 25.4)).toBeCloseTo(25.4);
  });

  it("returns zero for a degenerate scale", () => {
    expect(toDisplayUnits(1, 0, 25.4)).toBe(0);
  });
});

describe("formatDistance", () => {
  it("trims precision for large values and keeps it for small ones", () => {
    expect(formatDistance(123.456, "mm")).toBe("123.5 mm");
    expect(formatDistance(1.23456, "mm")).toBe("1.235 mm");
  });
});
