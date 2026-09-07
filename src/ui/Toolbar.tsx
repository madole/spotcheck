import { Info, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { useModelStore } from "../model/modelStore.ts";
import { useProjectStore } from "../project/projectStore.ts";
import { useViewerStore } from "../viewer/viewerStore.ts";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { NEO_BUTTON } from "./neo.ts";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UnitFactorInput({
  modelId,
  unitFactor,
  unitLabel,
  setUnits,
}: {
  modelId: string;
  unitFactor: number;
  unitLabel: string;
  setUnits: (factor: number, label: string) => void;
}) {
  const [text, setText] = useState(String(unitFactor));

  useEffect(() => {
    setText(String(unitFactor));
  }, [modelId, unitFactor]);

  return (
    <label
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      title="How many of these units make one model unit"
    >
      1 unit =
      <input
        className="w-16 rounded-md border-2 border-border bg-background px-1 py-0.5 text-foreground tabular-nums"
        min={0}
        onBlur={() => {
          const factor = Number(text);

          if (Number.isFinite(factor) && factor > 0) {
            setUnits(factor, unitLabel);
          } else {
            setText(String(unitFactor));
          }
        }}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        step="any"
        type="number"
        value={text}
      />
      <input
        aria-label="Unit name"
        className="w-14 rounded-md border-2 border-border bg-background px-1 py-0.5 text-foreground"
        onChange={(event) => setUnits(unitFactor, event.target.value)}
        type="text"
        value={unitLabel}
      />
    </label>
  );
}

export default function Toolbar() {
  const model = useModelStore((state) => state.model);
  const loadingName = useModelStore((state) => state.loadingName);
  const error = useModelStore((state) => state.error);
  const open = useModelStore((state) => state.open);
  const exportScreenshot = useModelStore((state) => state.exportScreenshot);
  const dismissError = useModelStore((state) => state.dismissError);
  const noteCount = useAnnotationStore((state) => state.annotations.length);
  const tool = useViewerStore((state) => state.tool);
  const setTool = useViewerStore((state) => state.setTool);
  const clip = useViewerStore((state) => state.clip);
  const clipOpen = useViewerStore((state) => state.clipOpen);
  const setClipOpen = useViewerStore((state) => state.setClipOpen);
  const requestFrameAll = useViewerStore((state) => state.requestFrameAll);
  const savedAt = useProjectStore((state) => state.savedAt);
  const projectError = useProjectStore((state) => state.error);
  const notice = useProjectStore((state) => state.notice);
  const pending = useProjectStore((state) => state.pending);
  const unitFactor = useModelStore((state) => state.unitFactor);
  const unitLabel = useModelStore((state) => state.unitLabel);
  const setUnits = useModelStore((state) => state.setUnits);
  const saveProject = useProjectStore((state) => state.save);
  const openProject = useProjectStore((state) => state.open);
  const locate = useProjectStore((state) => state.locate);
  const dismissProjectError = useProjectStore((state) => state.dismissError);
  const dismissNotice = useProjectStore((state) => state.dismissNotice);
  const inputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="flex flex-col border-b-4 border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="font-display text-lg tracking-wide text-foreground">Spotcheck</span>

        <Button
          className={NEO_BUTTON}
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
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

        <Button className={NEO_BUTTON} type="button" variant="outline" onClick={requestFrameAll}>
          Frame all
        </Button>

        <Button
          className={NEO_BUTTON}
          disabled={!model}
          type="button"
          variant={tool === "annotate" ? "default" : "outline"}
          onClick={() => setTool("annotate")}
        >
          Annotate
        </Button>

        <Button
          className={NEO_BUTTON}
          disabled={!model}
          type="button"
          variant={tool === "measure" ? "default" : "outline"}
          onClick={() => setTool("measure")}
        >
          Measure
        </Button>

        <Button
          className={NEO_BUTTON}
          disabled={!model}
          type="button"
          variant={clipOpen || clip ? "default" : "outline"}
          onClick={() => setClipOpen(!clipOpen)}
          title="Cut the model with a section plane"
        >
          Section
        </Button>

        <Button
          className={NEO_BUTTON}
          disabled={!model}
          type="button"
          variant="outline"
          onClick={saveProject}
          title={savedAt ? `Last saved ${savedAt}` : undefined}
        >
          Save notes
        </Button>

        <Button
          className={NEO_BUTTON}
          disabled={!model}
          type="button"
          variant="outline"
          onClick={exportScreenshot}
        >
          Export PNG
        </Button>

        <Button
          className={NEO_BUTTON}
          type="button"
          variant="outline"
          onClick={() => projectInputRef.current?.click()}
        >
          Open project…
        </Button>

        <input
          ref={projectInputRef}
          accept=".json,application/json"
          className="hidden"
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
            <Button
              className={NEO_BUTTON}
              type="button"
              variant="outline"
              onClick={() => modelInputRef.current?.click()}
            >
              Locate {pending.model.name}…
            </Button>

            <input
              ref={modelInputRef}
              accept=".glb,model/gltf-binary"
              className="hidden"
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

        {model && (
          <UnitFactorInput
            modelId={model.id}
            setUnits={setUnits}
            unitFactor={unitFactor}
            unitLabel={unitLabel}
          />
        )}

        <span className="ml-auto text-sm font-medium text-muted-foreground tabular-nums">
          {loadingName
            ? `Loading ${loadingName}…`
            : model
              ? `${model.name} · ${formatBytes(model.byteLength)}${model.fromLibrary ? " · from library" : ""} · ${noteCount} note${noteCount === 1 ? "" : "s"}`
              : "No model loaded"}
        </span>
      </div>

      {(notice ?? projectError ?? error) && (
        <div className="flex flex-col gap-2 px-4 pb-2">
          {notice && (
            <Alert className="border-2 shadow-[4px_4px_0_0_var(--foreground)]" role="status">
              <Info />
              <AlertDescription>{notice}</AlertDescription>
              <AlertAction>
                <Button size="xs" type="button" variant="ghost" onClick={dismissNotice}>
                  Dismiss
                </Button>
              </AlertAction>
            </Alert>
          )}

          {projectError && (
            <Alert
              className="border-2 shadow-[4px_4px_0_0_var(--foreground)]"
              variant="destructive"
            >
              <TriangleAlert />
              <AlertDescription>{projectError}</AlertDescription>
              <AlertAction>
                <Button size="xs" type="button" variant="ghost" onClick={dismissProjectError}>
                  Dismiss
                </Button>
              </AlertAction>
            </Alert>
          )}

          {error && (
            <Alert
              className="border-2 shadow-[4px_4px_0_0_var(--foreground)]"
              variant="destructive"
            >
              <TriangleAlert />
              <AlertDescription>{error}</AlertDescription>
              <AlertAction>
                <Button size="xs" type="button" variant="ghost" onClick={dismissError}>
                  Dismiss
                </Button>
              </AlertAction>
            </Alert>
          )}
        </div>
      )}
    </header>
  );
}
