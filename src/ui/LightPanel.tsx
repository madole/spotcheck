import { useViewerStore } from "../viewer/viewerStore.ts";
import { Button } from "@/components/ui/button";

import { NEO_BUTTON } from "./neo.ts";

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <span className="w-14 shrink-0 text-foreground">{label}</span>
      <input
        aria-label={label}
        className="w-44 accent-foreground md:w-56"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <span className="w-12 shrink-0 text-right tabular-nums">{format(value)}</span>
    </label>
  );
}

export default function LightPanel() {
  const lights = useViewerStore((state) => state.lights);
  const setLights = useViewerStore((state) => state.setLights);
  const resetLights = useViewerStore((state) => state.resetLights);
  const lightsOpen = useViewerStore((state) => state.lightsOpen);
  const setLightsOpen = useViewerStore((state) => state.setLightsOpen);

  if (!lightsOpen) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex flex-col gap-2 rounded-xl border-[3px] border-border bg-card px-4 py-3 shadow-[6px_6px_0_0_var(--foreground)]">
        <div className="flex items-center justify-between gap-6">
          <span className="font-display text-sm tracking-wide text-foreground">Lights</span>

          <div className="flex gap-2">
            <Button className={NEO_BUTTON} type="button" variant="outline" onClick={resetLights}>
              Reset
            </Button>

            <Button
              className={NEO_BUTTON}
              type="button"
              variant="outline"
              onClick={() => setLightsOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>

        <Slider
          format={(value) => value.toFixed(1)}
          label="Hemi"
          max={2}
          min={0}
          onChange={(hemi) => setLights({ hemi })}
          step={0.1}
          value={lights.hemi}
        />

        <Slider
          format={(value) => value.toFixed(1)}
          label="Key"
          max={3}
          min={0}
          onChange={(key) => setLights({ key })}
          step={0.1}
          value={lights.key}
        />

        <Slider
          format={(value) => value.toFixed(1)}
          label="Fill"
          max={2}
          min={0}
          onChange={(fill) => setLights({ fill })}
          step={0.1}
          value={lights.fill}
        />

        <Slider
          format={(value) => `${Math.round(value)}°`}
          label="Angle"
          max={360}
          min={0}
          onChange={(keyAngle) => setLights({ keyAngle })}
          step={1}
          value={lights.keyAngle}
        />
      </div>
    </div>
  );
}
