import { Line } from "@react-three/drei";

import { useAnnotationStore, type Annotation } from "../annotations/annotationStore.ts";

const COLOR = "#22d3ee";
const ENDPOINT_RADIUS = 0.0025;

function MeasurementLine({ annotation }: { annotation: Annotation }) {
  const measurement = annotation.measurement;

  if (!measurement) {
    return null;
  }

  const a = annotation.anchor.position;
  const b = measurement.b.position;

  return (
    <group>
      <Line color={COLOR} lineWidth={2} points={[a, b]} transparent opacity={0.95} />

      {[a, b].map((point) => (
        <mesh key={point.join(",")} position={point}>
          <sphereGeometry args={[ENDPOINT_RADIUS, 12, 12]} />
          <meshBasicMaterial color={COLOR} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function Measurements({ hover }: { hover: [number, number, number] | null }) {
  const annotations = useAnnotationStore((state) => state.annotations);
  const measureDraft = useAnnotationStore((state) => state.measureDraft);

  const measurements = annotations.filter((annotation) => annotation.measurement !== undefined);

  return (
    <group>
      {measurements.map((annotation) => (
        <MeasurementLine annotation={annotation} key={annotation.id} />
      ))}

      {measureDraft && (
        <mesh position={measureDraft.position}>
          <sphereGeometry args={[ENDPOINT_RADIUS, 12, 12]} />
          <meshBasicMaterial color={COLOR} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      )}

      {measureDraft && hover && (
        <Line
          color={COLOR}
          lineWidth={2}
          points={[measureDraft.position, hover]}
          transparent
          opacity={0.5}
          dashed
          dashSize={0.02}
          gapSize={0.01}
        />
      )}
    </group>
  );
}
