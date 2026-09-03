import { useEffect, useRef } from "react";

import { useModelStore } from "./model/modelStore.ts";
import { startAutosave, useProjectStore } from "./project/projectStore.ts";
import DropZone from "./ui/DropZone.tsx";
import NotePanel from "./ui/NotePanel.tsx";
import Toolbar from "./ui/Toolbar.tsx";
import Viewer from "./viewer/Viewer.tsx";

function EmptyState() {
  const model = useModelStore((state) => state.model);
  const loadingName = useModelStore((state) => state.loadingName);
  const open = useModelStore((state) => state.open);
  const inputRef = useRef<HTMLInputElement>(null);

  if (model || loadingName) {
    return null;
  }

  return (
    <div className="empty">
      <div className="empty__card">
        <h1 className="empty__title">Inspect a model</h1>

        <p className="empty__hint">
          Drop a .glb file anywhere, or open one to place inspection notes on it.
        </p>

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
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    void useProjectStore.getState().restore();

    return startAutosave();
  }, []);

  return (
    <DropZone>
      <div className="app">
        <Toolbar />
        <main className="app__viewer">
          <div className="app__canvas">
            <Viewer />
            <EmptyState />
          </div>
          <NotePanel />
        </main>
      </div>
    </DropZone>
  );
}
