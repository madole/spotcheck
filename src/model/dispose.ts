import type { Material, Mesh, Object3D, Texture } from "three";

function isTexture(value: unknown): value is Texture {
  return typeof value === "object" && value !== null && (value as Texture).isTexture === true;
}

function disposeMaterial(material: Material): void {
  for (const value of Object.values(material as unknown as Record<string, unknown>)) {
    if (isTexture(value)) {
      value.dispose();
    }
  }

  material.dispose();
}

export function disposeObject3D(root: Object3D): void {
  root.traverse((object) => {
    const withGeometry = object as Partial<Mesh>;

    withGeometry.geometry?.dispose();

    const { material } = withGeometry;

    if (Array.isArray(material)) {
      material.forEach(disposeMaterial);
    } else if (material) {
      disposeMaterial(material);
    }
  });
}
