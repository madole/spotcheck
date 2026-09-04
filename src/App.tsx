import { Box } from "lucide-react";
import { useEffect, useRef } from "react";

import { useModelStore } from "./model/modelStore.ts";
import { startAutosave, useProjectStore } from "./project/projectStore.ts";
import DropZone from "./ui/DropZone.tsx";
import NotePanel from "./ui/NotePanel.tsx";
import Toolbar from "./ui/Toolbar.tsx";
import Viewer from "./viewer/Viewer.tsx";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function EmptyState() {
  const model = useModelStore((state) => state.model);
  const loadingName = useModelStore((state) => state.loadingName);
  const open = useModelStore((state) => state.open);
  const inputRef = useRef<HTMLInputElement>(null);

  if (model || loadingName) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center p-4">
      <Empty className="pointer-events-auto w-auto max-w-sm border bg-card shadow-xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Box />
          </EmptyMedia>
          <EmptyTitle>Inspect a model</EmptyTitle>
          <EmptyDescription>
            Drop a .glb file anywhere, or open one to place inspection notes on it.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            Open model…
          </Button>

          <input
            ref={inputRef}
            accept=".glb,model/gltf-binary"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.item(0);

              if (file) {
                void open(file);
              }

              event.target.value = "";
            }}
            type="file"
          />
        </EmptyContent>
      </Empty>
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
      <div className="flex h-full flex-col bg-background text-foreground">
        <Toolbar />
        <main className="flex min-h-0 flex-1">
          <div className="relative min-w-0 flex-1">
            <Viewer />
            <EmptyState />
          </div>
          <NotePanel />
        </main>
      </div>
    </DropZone>
  );
}
