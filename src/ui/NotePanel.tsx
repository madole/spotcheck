import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { formatDistance, toDisplayUnits } from "../measurements/measure.ts";
import { useModelStore } from "../model/modelStore.ts";
import { useViewerStore } from "../viewer/viewerStore.ts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { NEO_BUTTON } from "./neo.ts";
import { cn } from "@/lib/utils";

export default function NotePanel() {
  const annotations = useAnnotationStore((state) => state.annotations);
  const selectedId = useAnnotationStore((state) => state.selectedId);
  const select = useAnnotationStore((state) => state.select);
  const setText = useAnnotationStore((state) => state.setText);
  const setResolved = useAnnotationStore((state) => state.setResolved);
  const discardDraft = useAnnotationStore((state) => state.discardDraft);
  const remove = useAnnotationStore((state) => state.remove);
  const requestFocus = useViewerStore((state) => state.requestFocus);
  const modelScale = useModelStore((state) => state.model?.normalization.scale ?? 1);
  const unitFactor = useModelStore((state) => state.unitFactor);
  const unitLabel = useModelStore((state) => state.unitLabel);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const selected = annotations.find((annotation) => annotation.id === selectedId);
  const draft = selected !== undefined && selected.text.trim() === "";

  useEffect(() => {
    if (selectedId) {
      editorRef.current?.focus();
    }
  }, [selectedId]);

  const open = (id: string, position: [number, number, number]) => {
    select(id);
    requestFocus(position);
  };

  return (
    <aside className="flex min-h-0 w-70 shrink-0 flex-col border-l-4 border-border bg-card">
      <h2 className="border-b-4 border-border px-4 py-3 font-display text-base tracking-wide text-foreground">
        Notes ({annotations.length})
      </h2>

      <ul
        className="min-h-0 flex-1 overflow-y-auto p-2"
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            return;
          }

          const index = annotations.findIndex((annotation) => annotation.id === selectedId);

          if (index === -1) {
            return;
          }

          event.preventDefault();

          const next = event.key === "ArrowDown" ? index + 1 : index - 1;
          const target = annotations[Math.min(Math.max(next, 0), annotations.length - 1)];

          if (target) {
            open(target.id, target.anchor.position);
          }
        }}
      >
        {annotations.map((annotation) => (
          <li key={annotation.id}>
            <Button
              className={cn(
                "w-full justify-start gap-2 border-2 border-transparent",
                annotation.id === selectedId &&
                  "border-border shadow-[3px_3px_0_0_var(--foreground)]",
              )}
              type="button"
              variant={annotation.id === selectedId ? "secondary" : "ghost"}
              onClick={() => open(annotation.id, annotation.anchor.position)}
            >
              <Badge>{annotation.ordinal}</Badge>

              <span className="flex-1 truncate text-left">
                {annotation.text.trim() === ""
                  ? annotation.measurement === undefined
                    ? "Draft"
                    : "Measurement"
                  : annotation.text.trim()}
              </span>

              {annotation.measurement !== undefined && (
                <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                  {formatDistance(
                    toDisplayUnits(annotation.measurement.distanceLocal, modelScale, unitFactor),
                    unitLabel,
                  )}
                </span>
              )}

              {annotation.resolved && (
                <Badge variant="success">
                  <Check data-icon="inline-start" />
                  resolved
                </Badge>
              )}
            </Button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="flex flex-col gap-3 border-t-4 border-border p-3">
          {selected.measurement !== undefined && (
            <p className="text-sm font-semibold text-foreground tabular-nums">
              Distance:{" "}
              {formatDistance(
                toDisplayUnits(selected.measurement.distanceLocal, modelScale, unitFactor),
                unitLabel,
              )}
            </p>
          )}

          <Textarea
            className="border-2 shadow-[3px_3px_0_0_var(--foreground)]"
            onChange={(event) => setText(selected.id, event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Escape") {
                return;
              }

              event.preventDefault();

              if (draft) {
                discardDraft();
              } else {
                select(null);
              }
            }}
            placeholder="Describe the finding…"
            ref={editorRef}
            rows={4}
            value={selected.text}
          />

          <div className="flex gap-2">
            <Button
              className={cn("flex-1", NEO_BUTTON)}
              type="button"
              variant="outline"
              onClick={() => setResolved(selected.id, !selected.resolved)}
            >
              {selected.resolved ? "Reopen" : "Resolve"}
            </Button>

            <Button
              className={cn("flex-1 border-border", NEO_BUTTON)}
              type="button"
              variant="destructive"
              onClick={() => remove(selected.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
