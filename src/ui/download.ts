/** Download `url` — an object or data URL — as `filename` via a one-shot anchor. */
export function downloadUrl(url: string, filename: string): void {
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
}

/** Download in-memory bytes as a file. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);

  downloadUrl(url, filename);
  URL.revokeObjectURL(url);
}
