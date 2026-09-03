import type { WebGLRenderer } from "three";

/** Filename for a screenshot of `modelName`: `part.glb` becomes `part-view.png`. */
export function screenshotFilename(modelName: string): string {
  const stem = modelName.replace(/\.glb$/i, "");

  return `${stem === "" ? "model" : stem}-view.png`;
}

/** Read the live framebuffer as a PNG data URL. Needs `preserveDrawingBuffer`. */
export function captureFrame(renderer: WebGLRenderer): string {
  return renderer.domElement.toDataURL("image/png");
}
