import { Info, TriangleAlert } from "lucide-react";
import { useRef } from "react";

import { useAnnotationStore } from "../annotations/annotationStore.ts";
import { useModelStore } from "../model/modelStore.ts";
import { useProjectStore } from "../project/projectStore.ts";
import { useViewerStore } from "../viewer/viewerStore.ts";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    <header className="flex flex-col border-b-2 border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-sm font-bold uppercase tracking-widest text-foreground">
          Spotcheck
        </span>

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

        <Button type="button" variant="outline" onClick={requestFrameAll}>
          Frame all
        </Button>

        <Button
          disabled={!model}
          type="button"
          variant="outline"
          onClick={saveProject}
          title={savedAt ? `Last saved ${savedAt}` : undefined}
        >
          Save notes
        </Button>

        <Button disabled={!model} type="button" variant="outline" onClick={exportScreenshot}>
          Export PNG
        </Button>

        <Button type="button" variant="outline" onClick={() => projectInputRef.current?.click()}>
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
            <Button type="button" variant="outline" onClick={() => modelInputRef.current?.click()}>
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
            <Alert role="status">
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
            <Alert variant="destructive">
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
            <Alert variant="destructive">
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
