import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        this.onloadend();
      });
    }
  };
}

const outDir = resolve(import.meta.dirname, "..", "fixtures");

function part(geometry, color, position, name) {
  const mesh = new Mesh(
    geometry,
    new MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.5 }),
  );

  mesh.name = name;
  mesh.position.set(...position);

  return mesh;
}

function buildScene() {
  const scene = new Scene();

  scene.add(part(new BoxGeometry(2, 0.2, 2), 0x6b7280, [0, 0.1, 0], "BasePlate"));
  scene.add(part(new CylinderGeometry(0.3, 0.3, 1.5, 24), 0xf97316, [0, 0.95, 0], "Column"));
  scene.add(part(new SphereGeometry(0.45, 24, 16), 0x14b8a6, [0, 1.9, 0], "Cap"));
  scene.add(part(new TorusGeometry(0.5, 0.08, 12, 32), 0xeab308, [0.9, 0.2, 0.9], "Ring"));
  scene.add(part(new BoxGeometry(0.3, 0.3, 0.3), 0xe11d48, [-0.7, 0.25, 0.7], "Bolt"));

  return scene;
}

function exportGlb(scene) {
  return new Promise((resolvePromise, rejectPromise) => {
    new GLTFExporter().parse(
      scene,
      (result) => resolvePromise(Buffer.from(result)),
      (error) => rejectPromise(error),
      { binary: true },
    );
  });
}

const glb = await exportGlb(buildScene());

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "part.glb"), glb);

console.log(`wrote ${join(outDir, "part.glb")} (${glb.byteLength} bytes)`);
