import { CameraControls } from "@react-three/drei";
import { useEffect, useRef, type ComponentRef } from "react";
import { Vector3 } from "three";

import { TARGET_RADIUS } from "../model/normalize.ts";
import { useModelStore } from "../model/modelStore.ts";
import { useViewerStore } from "./viewerStore.ts";

type Controls = ComponentRef<typeof CameraControls>;

/** Direction the camera looks from, before the fit distance is applied. */
export const HOME_POSITION = new Vector3(2.6, 1.9, 3.2);

const FIT_RADIUS = TARGET_RADIUS * 1.15;

const NOTE_FIT_RADIUS = TARGET_RADIUS * 0.25;

function frame(controls: Controls, animate: boolean): Promise<void> {
  const position = HOME_POSITION.clone().setLength(controls.getDistanceToFitSphere(FIT_RADIUS));

  return controls.setLookAt(position.x, position.y, position.z, 0, 0, 0, animate);
}

export default function CameraRig() {
  const controls = useRef<Controls>(null);
  const model = useModelStore((state) => state.model);
  const frameAllToken = useViewerStore((state) => state.frameAllToken);
  const focus = useViewerStore((state) => state.focus);

  useEffect(() => {
    const instance = controls.current;

    if (instance) {
      void frame(instance, false);
    }
  }, [model]);

  useEffect(() => {
    const instance = controls.current;

    if (instance && frameAllToken > 0) {
      void frame(instance, true);
    }
  }, [frameAllToken]);

  useEffect(() => {
    const instance = controls.current;

    if (!instance || !focus) {
      return;
    }

    const target = new Vector3(...focus.position);
    const distance = instance.getDistanceToFitSphere(NOTE_FIT_RADIUS);
    const direction = instance.camera.position
      .clone()
      .sub(instance.getTarget(new Vector3()))
      .normalize();
    const position = target.clone().add(direction.multiplyScalar(distance));

    void instance.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true);
  }, [focus]);

  return (
    <CameraControls
      makeDefault
      ref={controls}
      minDistance={TARGET_RADIUS * 0.35}
      maxDistance={TARGET_RADIUS * 12}
    />
  );
}
