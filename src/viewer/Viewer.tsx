import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Group } from "three";

import type { LoadedModel } from "../model/loadModelFile.ts";
import { applyNormalization } from "../model/normalize.ts";
import { useModelStore } from "../model/modelStore.ts";
import CameraRig, { HOME_POSITION } from "./CameraRig.tsx";

function RendererBridge() {
  const gl = useThree((state) => state.gl);
  const setRenderer = useModelStore((state) => state.setRenderer);

  useEffect(() => {
    setRenderer(gl);

    return () => setRenderer(undefined);
  }, [gl, setRenderer]);

  return null;
}

function Placeholder() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#c084fc" metalness={0.1} roughness={0.35} />
    </mesh>
  );
}

/**
 * Root group every model — and later every annotation — lives in. Kept free of
 * the model's own transform so normalization can be applied here.
 */
function ModelRoot({ model }: { model: LoadedModel }) {
  const group = useRef<Group>(null);

  useLayoutEffect(() => {
    if (group.current) {
      applyNormalization(group.current, model.normalization);
    }
  }, [model.normalization]);

  return (
    <group ref={group}>
      <primitive object={model.scene} />
    </group>
  );
}

function Scene() {
  const model = useModelStore((state) => state.model);

  if (!model) {
    return (
      <>
        <gridHelper args={[4, 8, "#3a3a44", "#25252c"]} />
        <Placeholder />
      </>
    );
  }

  const { scale, center, min } = model.normalization;
  const groundY = (min[1] - center[1]) * scale;

  return (
    <>
      <gridHelper args={[4, 8, "#3a3a44", "#25252c"]} position={[0, groundY, 0]} />
      <ModelRoot model={model} />
    </>
  );
}

export default function Viewer() {
  return (
    <Canvas camera={{ position: HOME_POSITION.toArray(), fov: 45 }} dpr={[1, 2]}>
      <RendererBridge />

      <color attach="background" args={["#16171d"]} />

      <hemisphereLight color="#d8d8ff" groundColor="#2a2a30" intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <directionalLight position={[-5, 2, -4]} intensity={0.4} />

      <CameraRig />

      <Scene />
    </Canvas>
  );
}
