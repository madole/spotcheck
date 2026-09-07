export type ClipAxis = "x" | "y" | "z";

export interface Clip {
  axis: ClipAxis;
  /** World-space cut position. Geometry past this point on `axis` is cut away. */
  offset: number;
}

/**
 * Map a clip to three.js plane parts. The plane normal points down the axis
 * so the slider reveals more of the model as `offset` grows.
 */
export function clipToPlane(clip: Clip): {
  normal: [number, number, number];
  constant: number;
} {
  const normal: [number, number, number] =
    clip.axis === "x" ? [-1, 0, 0] : clip.axis === "y" ? [0, -1, 0] : [0, 0, -1];

  return { normal, constant: clip.offset };
}
