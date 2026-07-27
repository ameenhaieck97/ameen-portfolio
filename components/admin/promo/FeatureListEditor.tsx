"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { SortableGrid, type DragHandleProps } from "@/components/admin/SortableGrid";
import { FieldLabel } from "@/components/admin/FormControls";

export type FeatureDraft = { id: string; label: string; label_ar: string };

/** Add/remove/drag-reorder editor for a package's included-features checklist — one row per feature, not a single freeform textarea. */
export function FeatureListEditor({
  features,
  onChange,
}: {
  features: FeatureDraft[];
  onChange: (next: FeatureDraft[]) => void;
}) {
  const addFeature = () => {
    onChange([...features, { id: crypto.randomUUID(), label: "", label_ar: "" }]);
  };

  const updateFeature = (id: string, patch: Partial<FeatureDraft>) => {
    onChange(features.map((feature) => (feature.id === id ? { ...feature, ...patch } : feature)));
  };

  const removeFeature = (id: string) => {
    onChange(features.filter((feature) => feature.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel>Included features</FieldLabel>
        <button
          type="button"
          onClick={addFeature}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
        >
          <Plus size={15} aria-hidden />
          Add feature
        </button>
      </div>

      {features.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-ivory/45">
          No features yet — add the first one above.
        </p>
      ) : (
        <SortableGrid
          items={features}
          onReorder={onChange}
          className="flex flex-col gap-2"
          renderItem={(feature, _index, dragHandleProps: DragHandleProps) => (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-canvas/40 p-2">
              <button
                type="button"
                aria-label="Drag to reorder"
                className="flex h-9 w-9 flex-none cursor-grab items-center justify-center rounded-lg text-ivory/40 hover:text-ivory/70 active:cursor-grabbing"
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
              >
                <GripVertical size={16} aria-hidden />
              </button>
              <input
                value={feature.label}
                onChange={(event) => updateFeature(feature.id, { label: event.target.value })}
                placeholder="Feature (English) — e.g. Logo Design"
                className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-canvas/60 px-3 text-sm text-ivory outline-none placeholder:text-ivory/30 focus:border-gold/50"
              />
              <input
                value={feature.label_ar}
                onChange={(event) => updateFeature(feature.id, { label_ar: event.target.value })}
                placeholder="بالعربية"
                dir="rtl"
                className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-canvas/60 px-3 text-sm text-ivory outline-none placeholder:text-ivory/30 focus:border-gold/50"
              />
              <button
                type="button"
                aria-label="Remove feature"
                onClick={() => removeFeature(feature.id)}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-ivory/50 transition-colors hover:bg-white/5 hover:text-red-300"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
