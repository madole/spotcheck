import { Box3, BoxGeometry, Group, Mesh, Sphere, Vector3 } from "three";

import { describe, expect, it } from "vite-plus/test";

import {
  TARGET_RADIUS,
  applyNormalization,
  computeNormalization,
  measure,
  toWorldPoint,
} from "./normalize.ts";

function boxOf(size: number): Mesh {
  return new Mesh(new BoxGeometry(size, size, size));
}

function wrap(object: Mesh): Group {
  const group = new Group();

  group.add(object);

  return group;
}

describe("computeNormalization", () => {
  it("scales tiny and huge models to the same radius", () => {
    const tiny = computeNormalization(boxOf(0.01));
    const huge = computeNormalization(boxOf(1000));

    expect(tiny.radius).toBeCloseTo(Math.sqrt(3) * 0.005, 6);
    expect(huge.radius).toBeCloseTo(Math.sqrt(3) * 500, 3);
    expect(tiny.radius * tiny.scale).toBeCloseTo(TARGET_RADIUS, 10);
    expect(huge.radius * huge.scale).toBeCloseTo(TARGET_RADIUS, 10);
    expect(tiny.scale).toBeGreaterThan(1);
    expect(huge.scale).toBeLessThan(1);
  });

  it("is identical for identical models", () => {
    expect(computeNormalization(boxOf(3))).toEqual(computeNormalization(boxOf(3)));
  });

  it("reports the source bounding box", () => {
    const offset = boxOf(2);

    offset.position.set(5, 6, 7);

    const { min, max, center } = computeNormalization(offset);

    expect(min).toEqual([4, 5, 6]);
    expect(max).toEqual([6, 7, 8]);
    expect(center).toEqual([5, 6, 7]);
  });

  it("tolerates an empty model", () => {
    expect(computeNormalization(new Group())).toEqual({
      scale: 1,
      center: [0, 0, 0],
      radius: 0,
      min: [0, 0, 0],
      max: [0, 0, 0],
    });
  });
});

describe("applyNormalization", () => {
  it("centres the model on the origin at the target radius", () => {
    const model = boxOf(0.02);

    model.position.set(400, -120, 30);

    const group = wrap(model);

    applyNormalization(group, computeNormalization(model));

    const measured = measure(group);
    const sphere = new Box3().setFromObject(group).getBoundingSphere(new Sphere());

    expect(measured.sphere.radius).toBeCloseTo(TARGET_RADIUS, 10);
    expect(sphere.center.length()).toBeCloseTo(0, 10);
  });

  it("uses a uniform scale", () => {
    const group = wrap(boxOf(7));

    applyNormalization(group, computeNormalization(group));

    expect(group.scale.x).toBe(group.scale.y);
    expect(group.scale.y).toBe(group.scale.z);
  });
});

describe("toWorldPoint", () => {
  it("matches the normalized group's world transform", () => {
    const model = boxOf(4);

    model.position.set(10, -3, 7);

    const normalization = computeNormalization(model);
    const group = wrap(model);

    applyNormalization(group, normalization);

    const local: [number, number, number] = [11, -2, 6];
    const expected = group.localToWorld(new Vector3(...local));
    const [x, y, z] = toWorldPoint(normalization, local);

    expect(x).toBeCloseTo(expected.x, 10);
    expect(y).toBeCloseTo(expected.y, 10);
    expect(z).toBeCloseTo(expected.z, 10);
  });
});
