import { useEffect } from "react";

import { startAutosave, useProjectStore } from "./project/projectStore.ts";
import DropZone from "./ui/DropZone.tsx";
import NotePanel from "./ui/NotePanel.tsx";
import Toolbar from "./ui/Toolbar.tsx";
import Viewer from "./viewer/Viewer.tsx";

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
          </div>
          <NotePanel />
        </main>
      </div>
    </DropZone>
  );
}
