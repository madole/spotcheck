import { Billboard, Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Quaternion, Vector3, type Group } from "three";

import { useAnnotationStore, type Annotation } from "./annotationStore.ts";

const FONT_URL = `${import.meta.env.BASE_URL}fonts/inter-latin-400-normal.woff`;

/** Local +Z of a note points along the surface normal. */
const FORWARD = new Vector3(0, 0, 1);

/**
 * Camera distance the note is designed for. Notes scale with distance from
 * there, which keeps them the same size on screen at any zoom.
 */
const REFERENCE_DISTANCE = 3;

const FONT_SIZE = 0.075;
const LEADER_LENGTH = 0.09;
const MARKER_RADIUS = 0.016;
const PADDING = 0.5;

const DRAFT_COLOR = "#fbbf24";

const SAVED_COLOR = "#38bdf8";

const RESOLVED_COLOR = "#4ade80";

/** The slice of troika's text instance we need to size the label backing. */
interface TroikaText {
  textRenderInfo?: { blockBounds?: [number, number, number, number] };
}

function labelFor(annotation: Annotation): string {
  return annotation.text.trim() === ""
    ? String(annotation.ordinal)
    : `${annotation.ordinal} · ${annotation.text.trim()}`;
}

function Note({ annotation, selected }: { annotation: Annotation; selected: boolean }) {
  const group = useRef<Group>(null);
  const label = useRef<Group>(null);
  const [size, setSize] = useState<[number, number]>([FONT_SIZE * 2, FONT_SIZE]);
  const anchor = annotation.anchor;
  const draft = annotation.text.trim() === "";
  const color = annotation.resolved ? RESOLVED_COLOR : draft ? DRAFT_COLOR : SAVED_COLOR;

  const quaternion = useMemo(
    () => new Quaternion().setFromUnitVectors(FORWARD, new Vector3(...anchor.normal)),
    [anchor.normal],
  );

  const worldPosition = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    // Measured to the label, not the surface point, so a note stays the same
    // size on screen even when the camera is nearly on top of it.
    if (group.current && label.current) {
      label.current.getWorldPosition(worldPosition);
      group.current.scale.setScalar(camera.position.distanceTo(worldPosition) / REFERENCE_DISTANCE);
    }
  });

  return (
    <group position={anchor.position} quaternion={quaternion} ref={group}>
      {selected && (
        <mesh>
          <sphereGeometry args={[MARKER_RADIUS * 2.2, 12, 12]} />
          <meshBasicMaterial color={color} opacity={0.35} toneMapped={false} transparent />
        </mesh>
      )}

      <mesh>
        <sphereGeometry args={[MARKER_RADIUS, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      <Line
        color={color}
        lineWidth={1}
        opacity={0.7}
        points={[
          [0, 0, 0],
          [0, 0, LEADER_LENGTH],
        ]}
        transparent
      />

      <group position={[0, 0, LEADER_LENGTH]} ref={label}>
        <Billboard>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[size[0] + PADDING * FONT_SIZE, size[1] + PADDING * FONT_SIZE]} />
            <meshBasicMaterial color="#0d0e13" opacity={0.82} toneMapped={false} transparent />
          </mesh>

          <Text
            anchorX="center"
            anchorY="middle"
            color={color}
            font={FONT_URL}
            fontSize={FONT_SIZE}
            onSync={(text: TroikaText) => {
              const bounds = text.textRenderInfo?.blockBounds;

              if (bounds) {
                setSize([Math.max(bounds[2] - bounds[0], 0), Math.max(bounds[3] - bounds[1], 0)]);
              }
            }}
          >
            {labelFor(annotation)}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

export default function Notes() {
  const annotations = useAnnotationStore((state) => state.annotations);
  const selectedId = useAnnotationStore((state) => state.selectedId);

  return annotations.map((annotation) => (
    <Note annotation={annotation} key={annotation.id} selected={annotation.id === selectedId} />
  ));
}
