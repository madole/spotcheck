import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { useModelStore } from "../model/modelStore.ts";

interface DropZoneProps {
  children: ReactNode;
}

function carriesFiles(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes("Files") ?? false;
}

export default function DropZone({ children }: DropZoneProps) {
  const open = useModelStore((state) => state.open);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    let depth = 0;

    const onDragEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;

      depth += 1;
      setIsOver(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (carriesFiles(event)) {
        event.preventDefault();
      }
    };

    const onDragLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) return;

      depth = Math.max(0, depth - 1);

      if (depth === 0) {
        setIsOver(false);
      }
    };

    const onDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return;

      event.preventDefault();
      depth = 0;
      setIsOver(false);

      const file = event.dataTransfer?.files.item(0);

      if (file) {
        void open(file);
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [open]);

  return (
    <>
      {children}
      {isOver && (
        <div className="pointer-events-none fixed inset-0 z-10 grid place-items-center border-4 border-dashed border-primary/60 bg-background/80 text-xl font-semibold text-foreground">
          Drop a .glb file to inspect it
        </div>
      )}
    </>
  );
}
