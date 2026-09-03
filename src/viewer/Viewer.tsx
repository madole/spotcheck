import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Group } from "three";

import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { anchorFromIntersection } from "../annotations/coordinates.ts";
import Notes from "../annotations/Notes.tsx";
import type { LoadedModel } from "../model/loadModelFile.ts";
import { applyNormalization } from "../model/normalize.ts";
import { useModelStore } from "../model/modelStore.ts";
import CameraRig, { HOME_POSITION } from "./CameraRig.tsx";

/** Pointer travel that turns a click into an orbit. */
const CLICK_SLOP_PX = 6;
/** Press longer than this is a deliberate gesture, not a click. */
const CLICK_TIMEOUT_MS = 400;

interface Press {
  x: number;
  y: number;
  at: number;
}

function isClick(press: Press, event: ThreeEvent<PointerEvent>): boolean {
  const travelled = Math.hypot(event.clientX - press.x, event.clientY - press.y);

  return travelled <= CLICK_SLOP_PX && event.timeStamp - press.at <= CLICK_TIMEOUT_MS;
}

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
  const add = useAnnotationStore((state) => state.add);
  const press = useRef<Press | undefined>(undefined);

  useLayoutEffect(() => {
    if (group.current) {
      applyNormalization(group.current, model.normalization);
    }
  }, [model.normalization]);

  return (
    <group ref={group}>
      <Notes />

      <primitive
        object={model.scene}
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          press.current = { x: event.clientX, y: event.clientY, at: event.timeStamp };
        }}
        onPointerUp={(event: ThreeEvent<PointerEvent>) => {
          const start = press.current;

          press.current = undefined;

          if (!start || event.button !== 0 || !isClick(start, event) || !group.current) {
            return;
          }

          const anchor = anchorFromIntersection(group.current, event);

          if (anchor) {
            add(anchor);
          }
        }}
      />
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
