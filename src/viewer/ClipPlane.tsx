import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Plane, Vector3 } from "three";

import { clipToPlane } from "./clipPlane.ts";
import { useViewerStore } from "./viewerStore.ts";

export default function ClipPlane() {
  const gl = useThree((state) => state.gl);
  const clip = useViewerStore((state) => state.clip);

  useEffect(() => {
    if (!clip) {
      gl.clippingPlanes = [];
      return;
    }

    const { normal, constant } = clipToPlane(clip);

    gl.clippingPlanes = [new Plane(new Vector3(...normal), constant)];
  }, [gl, clip]);

  return null;
}
