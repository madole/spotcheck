import { useRef } from "react";

import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { useProjectStore } from "../project/projectStore.ts";
import { useModelStore } from "../model/modelStore.ts";
import { useViewerStore } from "../viewer/viewerStore.ts";

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
  const exportScreenshot = useModelStore((state) => state.exportScreenshot);
  const dismissError = useModelStore((state) => state.dismissError);
  const noteCount = useAnnotationStore((state) => state.annotations.length);
  const requestFrameAll = useViewerStore((state) => state.requestFrameAll);
  const savedAt = useProjectStore((state) => state.savedAt);
  const projectError = useProjectStore((state) => state.error);
  const notice = useProjectStore((state) => state.notice);
  const pending = useProjectStore((state) => state.pending);
  const saveProject = useProjectStore((state) => state.save);
  const openProject = useProjectStore((state) => state.open);
  const locate = useProjectStore((state) => state.locate);
  const dismissProjectError = useProjectStore((state) => state.dismissError);
  const dismissNotice = useProjectStore((state) => state.dismissNotice);
  const inputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="toolbar">
      <span className="toolbar__title">Spotcheck</span>

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

      <button className="toolbar__action" type="button" onClick={requestFrameAll}>
        Frame all
      </button>

      <button
        className="toolbar__action"
        disabled={!model}
        onClick={saveProject}
        title={savedAt ? `Last saved ${savedAt}` : undefined}
        type="button"
      >
        Save notes
      </button>

      <button
        className="toolbar__action"
        disabled={!model}
        onClick={exportScreenshot}
        type="button"
      >
        Export PNG
      </button>

      <button
        className="toolbar__action"
        type="button"
        onClick={() => projectInputRef.current?.click()}
      >
        Open project…
      </button>

      <input
        ref={projectInputRef}
        accept=".json,application/json"
        className="toolbar__file"
        onChange={(event) => {
          const file = event.target.files?.item(0);

          if (file) {
            void openProject(file);
          }

          event.target.value = "";
        }}
        type="file"
      />

      {pending && (
        <>
          <button
            className="toolbar__action"
            type="button"
            onClick={() => modelInputRef.current?.click()}
          >
            Locate {pending.model.name}…
          </button>

          <input
            ref={modelInputRef}
            accept=".glb,model/gltf-binary"
            className="toolbar__file"
            onChange={(event) => {
              const file = event.target.files?.item(0);

              if (file) {
                void locate(file);
              }

              event.target.value = "";
            }}
            type="file"
          />
        </>
      )}

      <span className="toolbar__status">
        {loadingName
          ? `Loading ${loadingName}…`
          : model
            ? `${model.name} · ${formatBytes(model.byteLength)}${model.fromLibrary ? " · from library" : ""} · ${noteCount} note${noteCount === 1 ? "" : "s"}`
            : "No model loaded"}
      </span>

      {notice && (
        <div className="toolbar__notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={dismissNotice}>
            Dismiss
          </button>
        </div>
      )}

      {projectError && (
        <div className="toolbar__error" role="alert">
          <span>{projectError}</span>
          <button type="button" onClick={dismissProjectError}>
            Dismiss
          </button>
        </div>
      )}

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
