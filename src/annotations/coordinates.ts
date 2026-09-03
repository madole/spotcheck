import { Matrix4, Vector3 } from "three";
import type { Intersection, Object3D } from "three";

export interface Anchor {
  /** Surface point, in the model root's local space. */
  position: [number, number, number];
  /** Outward surface normal, in the model root's local space and unit length. */
  normal: [number, number, number];
  /** Name of the mesh that was hit. Recorded for context, never for placement. */
  meshName: string;
}

function tuple(vector: Vector3): [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

/** Matrix mapping `object`'s local space to `root`'s local space. */
function objectToRoot(root: Object3D, object: Object3D): Matrix4 {
  return new Matrix4().copy(root.matrixWorld).invert().multiply(object.matrixWorld);
}

export function toLocalPoint(root: Object3D, worldPoint: Vector3): Vector3 {
  return root.worldToLocal(worldPoint.clone());
}

/**
 * Express `objectNormal` in `root`'s local space. Exact because models are
 * normalized with a uniform scale.
 */
export function toLocalNormal(root: Object3D, object: Object3D, objectNormal: Vector3): Vector3 {
  return objectNormal.clone().transformDirection(objectToRoot(root, object));
}

/**
 * Anchor a hit on the model's surface. Returns `undefined` for hits that carry
 * no normal, which cannot be anchored reliably.
 */
export function anchorFromIntersection(root: Object3D, hit: Intersection): Anchor | undefined {
  const objectNormal = hit.normal ?? hit.face?.normal;

  if (!objectNormal) {
    return undefined;
  }

  return {
    position: tuple(toLocalPoint(root, hit.point)),
    normal: tuple(toLocalNormal(root, hit.object, objectNormal)),
    meshName: hit.object.name,
  };
}
