import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { useViewerStore } from "../viewer/viewerStore.ts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NotePanel() {
  const annotations = useAnnotationStore((state) => state.annotations);
  const selectedId = useAnnotationStore((state) => state.selectedId);
  const select = useAnnotationStore((state) => state.select);
  const setText = useAnnotationStore((state) => state.setText);
  const setResolved = useAnnotationStore((state) => state.setResolved);
  const discardDraft = useAnnotationStore((state) => state.discardDraft);
  const remove = useAnnotationStore((state) => state.remove);
  const requestFocus = useViewerStore((state) => state.requestFocus);
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
    <aside className="flex min-h-0 w-70 shrink-0 flex-col border-l border-border bg-card">
      <h2 className="border-b border-border px-4 py-3 text-[13px] font-semibold text-foreground">
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
              className="w-full justify-start gap-2"
              type="button"
              variant={annotation.id === selectedId ? "secondary" : "ghost"}
              onClick={() => open(annotation.id, annotation.anchor.position)}
            >
              <Badge variant="outline">{annotation.ordinal}</Badge>

              <span className="flex-1 truncate text-left">
                {annotation.text.trim() === "" ? "Draft" : annotation.text.trim()}
              </span>

              {annotation.resolved && (
                <Badge variant="secondary">
                  <Check data-icon="inline-start" />
                  resolved
                </Badge>
              )}
            </Button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="flex flex-col gap-2 border-t border-border p-3">
          <Textarea
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
              className="flex-1"
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setResolved(selected.id, !selected.resolved)}
            >
              {selected.resolved ? "Reopen" : "Resolve"}
            </Button>

            <Button
              className="flex-1"
              size="sm"
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
