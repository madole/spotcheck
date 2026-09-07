export function distanceBetween(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * Convert a root-local distance to source-model units, then apply the
 * user-set factor (e.g. "1 unit = 25.4 mm"). The factor is display-only and
 * never baked into stored geometry.
 */
export function toDisplayUnits(distanceLocal: number, scale: number, factor: number): number {
  if (scale === 0) {
    return 0;
  }

  return (distanceLocal / scale) * factor;
}

export function formatDistance(value: number, unitLabel: string): string {
  const absolute = Math.abs(value);
  const digits = absolute >= 100 ? 1 : absolute >= 10 ? 2 : 3;

  return `${value.toFixed(digits)} ${unitLabel}`;
}
