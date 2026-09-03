import { Billboard, Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Quaternion, Vector3, type Group } from "three";

import { useModelStore } from "../model/modelStore.ts";
import { useAnnotationStore, type Annotation } from "./annotationStore.ts";

const FONT_URL = `${import.meta.env.BASE_URL}fonts/inter-latin-400-normal.woff`;

/** Local +Z of a note points off the surface, along the stalk. */
const FORWARD = new Vector3(0, 0, 1);

/** World up, which a note's stalk leans towards. */
const UP = new Vector3(0, 1, 0);

/**
 * Camera distance past which a note stops shrinking: beyond it a note grows
 * with distance to hold its on-screen size. Closer than it, notes keep a fixed
 * size in model space and so grow on screen as you zoom in.
 */
const FLOOR_DISTANCE = 1.5;

/** Stalk length in world units, long enough to lift the label clear of the model. */
const STALK_LENGTH = 0.12;

/** How far a stalk leans from the surface normal towards world up. Below 1 keeps it anchored. */
const UP_BIAS = 0.6;

const FONT_SIZE = 0.025;
/** Labels wrap onto further lines past this width, in world units. */
const MAX_LABEL_WIDTH = 0.22;
const MARKER_RADIUS = 0.003;
const PADDING = 0.45;

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

interface NoteProps {
  annotation: Annotation;
  selected: boolean;
  /** Model-root units per world unit, so notes read the same on any source scale. */
  unitsPerWorld: number;
}

function Note({ annotation, selected, unitsPerWorld }: NoteProps) {
  const group = useRef<Group>(null);
  const label = useRef<Group>(null);
  const [size, setSize] = useState<[number, number]>([FONT_SIZE * 2, FONT_SIZE]);
  const anchor = annotation.anchor;
  const draft = annotation.text.trim() === "";
  const color = annotation.resolved ? RESOLVED_COLOR : draft ? DRAFT_COLOR : SAVED_COLOR;

  const quaternion = useMemo(() => {
    const direction = new Vector3(...anchor.normal).addScaledVector(UP, UP_BIAS).normalize();

    return new Quaternion().setFromUnitVectors(FORWARD, direction);
  }, [anchor.normal]);

  const worldPosition = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    // Measured to the label, not the surface point, so a note holds its size
    // on screen even when the camera is nearly on top of it.
    if (group.current && label.current) {
      label.current.getWorldPosition(worldPosition);

      const distance = camera.position.distanceTo(worldPosition);

      group.current.scale.setScalar(Math.max(1, distance / FLOOR_DISTANCE) * unitsPerWorld);
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
        lineWidth={2}
        opacity={0.85}
        points={[
          [0, 0, 0],
          [0, 0, STALK_LENGTH],
        ]}
        transparent
      />

      <group position={[0, 0, STALK_LENGTH]} ref={label}>
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
            maxWidth={MAX_LABEL_WIDTH}
            textAlign="center"
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
  const modelScale = useModelStore((state) => state.model?.normalization.scale ?? 1);
  const unitsPerWorld = 1 / modelScale;

  return annotations.map((annotation) => (
    <Note
      annotation={annotation}
      key={annotation.id}
      selected={annotation.id === selectedId}
      unitsPerWorld={unitsPerWorld}
    />
  ));
}
