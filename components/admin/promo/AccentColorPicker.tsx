"use client";

import { FieldLabel } from "@/components/admin/FormControls";
import { cn } from "@/lib/cn";

const PRESETS = [
  { label: "Gold", value: "#EEDF7A" },
  { label: "Green", value: "#34D399" },
  { label: "Blue", value: "#60A5FA" },
  { label: "Red", value: "#F87171" },
  { label: "Purple", value: "#C084FC" },
];

/** Accent color picker for offer/package cards — the popup and homepage card both read this value directly, so it's the single control for an item's brand color. */
export function AccentColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <FieldLabel>Card accent color</FieldLabel>
      <div className="flex flex-wrap items-center gap-2.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            aria-label={preset.label}
            title={preset.label}
            onClick={() => onChange(preset.value)}
            style={{ backgroundColor: preset.value }}
            className={cn(
              "h-9 w-9 flex-none rounded-full border-2 transition-transform hover:scale-110",
              value.toLowerCase() === preset.value.toLowerCase()
                ? "border-ivory"
                : "border-transparent",
            )}
          />
        ))}
        <label
          className={cn(
            "relative flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 transition-transform hover:scale-110",
            PRESETS.some((p) => p.value.toLowerCase() === value.toLowerCase())
              ? "border-transparent"
              : "border-ivory",
          )}
          style={{ backgroundColor: value }}
          title="Custom color"
        >
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#EEDF7A"}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}
