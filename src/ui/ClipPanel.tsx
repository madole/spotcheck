import { useViewerStore } from "../viewer/viewerStore.ts";
import type { ClipAxis } from "../viewer/clipPlane.ts";
import { Button } from "@/components/ui/button";

import { NEO_BUTTON } from "./neo.ts";
import { cn } from "@/lib/utils";

const AXES: ClipAxis[] = ["x", "y", "z"];

export default function ClipPanel() {
  const clip = useViewerStore((state) => state.clip);
  const clipOpen = useViewerStore((state) => state.clipOpen);
  const setClip = useViewerStore((state) => state.setClip);
  const clearClip = useViewerStore((state) => state.clearClip);
  const setClipOpen = useViewerStore((state) => state.setClipOpen);

  if (!clipOpen) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border-[3px] border-border bg-card px-4 py-3 shadow-[6px_6px_0_0_var(--foreground)]">
        <span className="font-display text-sm tracking-wide text-foreground">Cut</span>

        <div className="flex gap-1">
          {AXES.map((axis) => (
            <Button
              className={cn(NEO_BUTTON, "px-3")}
              key={axis}
              type="button"
              variant={clip?.axis === axis ? "default" : "outline"}
              onClick={() =>
                setClip({ axis, offset: clip?.axis === axis ? (clip?.offset ?? 0) : 0 })
              }
              title={`Cut across ${axis.toUpperCase()}`}
            >
              {axis.toUpperCase()}
            </Button>
          ))}
        </div>

        <input
          aria-label="Section cut position"
          className="w-80 accent-foreground md:w-96"
          disabled={!clip}
          max={1.2}
          min={-1.2}
          onChange={(event) => {
            if (clip) {
              setClip({ axis: clip.axis, offset: Number(event.target.value) });
            }
          }}
          step={0.01}
          type="range"
          value={clip?.offset ?? 0}
        />

        <span className="w-12 text-right text-sm font-medium text-muted-foreground tabular-nums">
          {clip ? clip.offset.toFixed(2) : "—"}
        </span>

        <Button
          className={NEO_BUTTON}
          disabled={!clip}
          type="button"
          variant="outline"
          onClick={clearClip}
        >
          Clear
        </Button>

        <Button
          className={NEO_BUTTON}
          type="button"
          variant="outline"
          onClick={() => setClipOpen(false)}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
