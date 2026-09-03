import { Box3, Sphere, Vector3 } from "three";
import type { Object3D } from "three";

/**
 * Radius every normalized model is scaled to, in world units.
 */
export const TARGET_RADIUS = 1;

export interface Normalization {
  /** Uniform factor that maps the source model to `TARGET_RADIUS`. */
  scale: number;
  /** Centre of the source bounding sphere, in source units. */
  center: [number, number, number];
  /** Radius of the source bounding sphere, in source units. */
  radius: number;
  /** Minimum corner of the source bounding box, in source units. */
  min: [number, number, number];
  /** Maximum corner of the source bounding box, in source units. */
  max: [number, number, number];
}

function tuple(vector: Vector3): [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

/**
 * Bounding sphere and box of `object` in its own coordinate space.
 */
export function measure(object: Object3D): { sphere: Sphere; box: Box3 } {
  object.updateWorldMatrix(true, true);

  const box = new Box3().setFromObject(object);

  return { sphere: box.getBoundingSphere(new Sphere()), box };
}

export function computeNormalization(object: Object3D): Normalization {
  const { sphere, box } = measure(object);

  if (box.isEmpty()) {
    return {
      scale: 1,
      center: [0, 0, 0],
      radius: 0,
      min: [0, 0, 0],
      max: [0, 0, 0],
    };
  }

  return {
    scale: sphere.radius > 0 ? TARGET_RADIUS / sphere.radius : 1,
    center: tuple(sphere.center),
    radius: sphere.radius,
    min: tuple(box.min),
    max: tuple(box.max),
  };
}

/**
 * Scale and offset `object` so its bounding sphere sits at the origin with
 * `TARGET_RADIUS`. Apply to a wrapper group, never to the loaded scene itself.
 */
export function applyNormalization(object: Object3D, normalization: Normalization): void {
  const { scale, center } = normalization;

  object.scale.setScalar(scale);
  object.position.set(-center[0] * scale, -center[1] * scale, -center[2] * scale);
  object.updateMatrixWorld(true);
}
