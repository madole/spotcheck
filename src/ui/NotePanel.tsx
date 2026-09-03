import { useEffect, useRef } from "react";

import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { useViewerStore } from "../viewer/viewerStore.ts";

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
    <aside className="panel">
      <h2 className="panel__title">Notes ({annotations.length})</h2>

      <ul
        className="panel__list"
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
            <button
              className={`panel__entry${annotation.id === selectedId ? " panel__entry--selected" : ""}`}
              onClick={() => open(annotation.id, annotation.anchor.position)}
              type="button"
            >
              <span className="panel__ordinal">{annotation.ordinal}</span>

              <span className="panel__preview">
                {annotation.text.trim() === "" ? "Draft" : annotation.text.trim()}
              </span>

              {annotation.resolved && <span className="panel__resolved">resolved</span>}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="panel__editor">
          <textarea
            className="panel__text"
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

          <div className="panel__actions">
            <button onClick={() => setResolved(selected.id, !selected.resolved)} type="button">
              {selected.resolved ? "Reopen" : "Resolve"}
            </button>

            <button onClick={() => remove(selected.id)} type="button">
              Delete
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
