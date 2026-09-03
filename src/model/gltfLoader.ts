import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { WebGLRenderer } from "three";

const decoderBase = `${import.meta.env.BASE_URL}decoders/`;

export interface GltfLoader {
  parse(data: ArrayBuffer): Promise<GLTF>;
  dispose(): void;
}

export function createGltfLoader(renderer: WebGLRenderer): GltfLoader {
  const dracoLoader = new DRACOLoader().setDecoderPath(`${decoderBase}draco/`);
  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath(`${decoderBase}basis/`)
    .detectSupport(renderer);

  const loader = new GLTFLoader()
    .setDRACOLoader(dracoLoader)
    .setKTX2Loader(ktx2Loader)
    .setMeshoptDecoder(MeshoptDecoder);

  return {
    parse: (data) => loader.parseAsync(data, ""),
    dispose: () => {
      dracoLoader.dispose();
      ktx2Loader.dispose();
    },
  };
}
