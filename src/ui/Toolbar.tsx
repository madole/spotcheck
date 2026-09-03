import { useRef } from "react";

import { useModelStore } from "../model/modelStore.ts";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Toolbar() {
  const model = useModelStore((state) => state.model);
  const loadingName = useModelStore((state) => state.loadingName);
  const error = useModelStore((state) => state.error);
  const open = useModelStore((state) => state.open);
  const dismissError = useModelStore((state) => state.dismissError);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="toolbar">
      <span className="toolbar__title">r3f-inspection</span>

      <button className="toolbar__action" type="button" onClick={() => inputRef.current?.click()}>
        Open model…
      </button>

      <input
        ref={inputRef}
        accept=".glb,model/gltf-binary"
        className="toolbar__file"
        onChange={(event) => {
          const file = event.target.files?.item(0);

          if (file) {
            void open(file);
          }

          event.target.value = "";
        }}
        type="file"
      />

      <span className="toolbar__status">
        {loadingName
          ? `Loading ${loadingName}…`
          : model
            ? `${model.name} · ${formatBytes(model.byteLength)}${model.fromLibrary ? " · from library" : ""}`
            : "No model loaded"}
      </span>

      {error && (
        <div className="toolbar__error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={dismissError}>
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
}
