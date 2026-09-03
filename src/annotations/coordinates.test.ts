import { BoxGeometry, Matrix4, Mesh, Object3D, Vector3 } from "three";

import { describe, expect, it } from "vite-plus/test";

import type { Intersection } from "three";

import { anchorFromIntersection, toLocalNormal, toLocalPoint } from "./coordinates.ts";

/** Root group: uniform scale plus an offset, like a normalized model. */
function buildRoot(): { root: Object3D; mesh: Mesh } {
  const root = new Object3D();

  root.position.set(10, -2, 4);
  root.scale.setScalar(2);

  const mesh = new Mesh(new BoxGeometry(1, 1, 1));

  mesh.name = "Bolt";
  mesh.position.set(0, 3, 0);
  mesh.rotation.set(0, Math.PI / 3, 0);
  mesh.scale.setScalar(3);
  root.add(mesh);
  root.updateMatrixWorld(true);

  return { root, mesh };
}

function hitOn(mesh: Mesh, localPoint: Vector3, localNormal: Vector3): Intersection {
  return {
    distance: 1,
    object: mesh,
    point: mesh.localToWorld(localPoint.clone()),
    normal: localNormal.clone(),
  };
}

describe("toLocalPoint", () => {
  it("round trips through world space", () => {
    const { root, mesh } = buildRoot();
    const world = mesh.localToWorld(new Vector3(0.5, 0.25, -0.5));

    const local = toLocalPoint(root, world);

    expect(root.localToWorld(local.clone()).distanceTo(world)).toBeCloseTo(0, 10);
    expect(local.length()).toBeGreaterThan(0);
  });

  it("ignores the root's own transform", () => {
    const { root } = buildRoot();
    const atRootOrigin = toLocalPoint(root, root.getWorldPosition(new Vector3()));

    expect(atRootOrigin.x).toBeCloseTo(0, 10);
    expect(atRootOrigin.y).toBeCloseTo(0, 10);
    expect(atRootOrigin.z).toBeCloseTo(0, 10);
  });
});

describe("toLocalNormal", () => {
  it("stays unit length under uniform scale", () => {
    const { root, mesh } = buildRoot();
    const normal = toLocalNormal(root, mesh, new Vector3(0.2, 1, -0.4));

    expect(normal.length()).toBeCloseTo(1, 10);
  });

  it("keeps normals perpendicular to their surface under scale and rotation", () => {
    const { root, mesh } = buildRoot();
    const toRoot = new Matrix4().copy(root.matrixWorld).invert().multiply(mesh.matrixWorld);

    const surfaceNormal = new Vector3(0, 1, 0);
    const surfaceTangent = new Vector3(1, 0, 0);

    const normal = toLocalNormal(root, mesh, surfaceNormal);
    const tangent = surfaceTangent.clone().transformDirection(toRoot);

    expect(normal.dot(tangent)).toBeCloseTo(surfaceNormal.dot(surfaceTangent), 10);
  });

  it("is unaffected by where the model sits in the world", () => {
    const a = buildRoot();
    const b = buildRoot();

    b.root.position.set(-500, 20, 900);
    b.root.updateMatrixWorld(true);

    const normal = new Vector3(0.3, 0.8, -0.5);
    const fromA = toLocalNormal(a.root, a.mesh, normal);
    const fromB = toLocalNormal(b.root, b.mesh, normal);

    expect(fromA.x).toBeCloseTo(fromB.x, 10);
    expect(fromA.y).toBeCloseTo(fromB.y, 10);
    expect(fromA.z).toBeCloseTo(fromB.z, 10);
  });
});

describe("anchorFromIntersection", () => {
  it("stores the point and normal in root space with the mesh name", () => {
    const { root, mesh } = buildRoot();
    const anchor = anchorFromIntersection(
      root,
      hitOn(mesh, new Vector3(0.5, 0.5, 0), new Vector3(1, 0, 0)),
    );

    expect(anchor?.meshName).toBe("Bolt");
    expect(anchor?.normal).toEqual(toLocalNormal(root, mesh, new Vector3(1, 0, 0)).toArray());
    expect(
      root
        .localToWorld(new Vector3(...(anchor?.position ?? [0, 0, 0])))
        .distanceTo(mesh.localToWorld(new Vector3(0.5, 0.5, 0))),
    ).toBeCloseTo(0, 10);
  });

  it("is identical for identical hits", () => {
    const { root, mesh } = buildRoot();
    const hit = hitOn(mesh, new Vector3(0.5, 0.5, 0), new Vector3(0, 1, 0));

    expect(anchorFromIntersection(root, hit)).toEqual(anchorFromIntersection(root, hit));
  });

  it("skips hits without a normal", () => {
    const { root, mesh } = buildRoot();

    expect(
      anchorFromIntersection(root, { distance: 1, object: mesh, point: new Vector3() }),
    ).toBeUndefined();
  });
});
