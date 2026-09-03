import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";

import { useModelStore } from "../model/modelStore.ts";

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

function Scene() {
  const model = useModelStore((state) => state.model);

  return model ? <primitive object={model.scene} /> : <Placeholder />;
}

export default function Viewer() {
  return (
    <Canvas camera={{ position: [3, 2.5, 4], fov: 45 }} dpr={[1, 2]}>
      <RendererBridge />

      <color attach="background" args={["#16171d"]} />

      <hemisphereLight color="#d8d8ff" groundColor="#2a2a30" intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <directionalLight position={[-5, 2, -4]} intensity={0.4} />

      <gridHelper args={[10, 20, "#3a3a44", "#25252c"]} />

      <Scene />
    </Canvas>
  );
}
