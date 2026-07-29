"use client";

import { useState } from "react";
import {
  SelectField,
  TextAreaField,
  TextField,
  Toggle,
} from "@/components/admin/FormControls";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AccentColorPicker } from "@/components/admin/promo/AccentColorPicker";
import { FeatureListEditor, type FeatureDraft } from "@/components/admin/promo/FeatureListEditor";
import { FEATURE_TEMPLATES, FEATURE_TEMPLATE_OPTIONS } from "@/data/feature-templates";
import type { Package } from "@/types/promo";

export type PackageDraft = Omit<Package, "id" | "created_at" | "updated_at" | "features"> & {
  features: FeatureDraft[];
};

const BADGE_SUGGESTIONS = ["Most Popular", "Recommended", "Best Value", "Starter", "Premium"];

export function PackageForm({
  draft,
  onChange,
}: {
  draft: PackageDraft;
  onChange: (next: PackageDraft) => void;
}) {
  const set = <K extends keyof PackageDraft>(key: K, value: PackageDraft[K]) =>
    onChange({ ...draft, [key]: value });

  const [template, setTemplate] = useState<(typeof FEATURE_TEMPLATE_OPTIONS)[number]["value"]>("custom");

  const applyTemplate = (value: (typeof FEATURE_TEMPLATE_OPTIONS)[number]["value"]) => {
    setTemplate(value);
    if (value === "custom") {
      set("features", []);
      return;
    }
    set(
      "features",
      FEATURE_TEMPLATES[value].features.map((feature) => ({
        id: crypto.randomUUID(),
        label: feature.label,
        label_ar: feature.label_ar,
      })),
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <SelectField
          label="Service template"
          value={template}
          onChange={(event) =>
            applyTemplate(event.target.value as (typeof FEATURE_TEMPLATE_OPTIONS)[number]["value"])
          }
        >
          {FEATURE_TEMPLATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <p className="mt-1.5 text-xs text-ivory/45">
          Fills in the included-features list below with a starting point for this service — still
          fully editable afterward. Choose &quot;Custom&quot; to start from an empty list.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Package name"
          required
          value={draft.name}
          onChange={(event) => set("name", event.target.value)}
        />
        <TextField
          label="Package name (Arabic)"
          dir="rtl"
          value={draft.name_ar}
          onChange={(event) => set("name_ar", event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextAreaField
          label="Short description"
          rows={2}
          value={draft.short_description}
          onChange={(event) => set("short_description", event.target.value)}
        />
        <TextAreaField
          label="Short description (Arabic)"
          rows={2}
          dir="rtl"
          value={draft.short_description_ar}
          onChange={(event) => set("short_description_ar", event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextAreaField
          label="Full description (shown after expanding)"
          rows={4}
          value={draft.full_description}
          onChange={(event) => set("full_description", event.target.value)}
        />
        <TextAreaField
          label="Full description (Arabic)"
          rows={4}
          dir="rtl"
          value={draft.full_description_ar}
          onChange={(event) => set("full_description_ar", event.target.value)}
        />
      </div>

      <ImageUploader
        label="Image or icon"
        folder="packages"
        value={draft.image_url ? [draft.image_url] : []}
        onChange={([url]) => set("image_url", url ?? "")}
      />

      <AccentColorPicker value={draft.accent_color} onChange={(value) => set("accent_color", value)} />

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          label="Price"
          type="number"
          step="0.01"
          value={String(draft.price)}
          onChange={(event) => set("price", Number(event.target.value) || 0)}
        />
        <SelectField
          label="Currency"
          value={draft.currency}
          onChange={(event) => set("currency", event.target.value as Package["currency"])}
        >
          <option value="USD">USD</option>
          <option value="IQD">IQD</option>
        </SelectField>
        <SelectField
          label="Billing period"
          value={draft.billing_period}
          onChange={(event) => set("billing_period", event.target.value as Package["billing_period"])}
        >
          <option value="one_time">One-time</option>
          <option value="monthly">Monthly</option>
        </SelectField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Execution time"
          placeholder="e.g. 5–7 Business Days"
          value={draft.execution_time}
          onChange={(event) => set("execution_time", event.target.value)}
        />
        <TextField
          label="Revisions"
          placeholder="e.g. 2 Revisions"
          value={draft.revisions}
          onChange={(event) => set("revisions", event.target.value)}
        />
      </div>

      <div>
        <TextField
          label="Badge (optional)"
          list="package-badge-suggestions"
          placeholder="e.g. Most Popular"
          value={draft.badge}
          onChange={(event) => set("badge", event.target.value)}
        />
        <datalist id="package-badge-suggestions">
          {BADGE_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <FeatureListEditor features={draft.features} onChange={(next) => set("features", next)} />

      <Toggle
        label="Published"
        checked={draft.status === "published"}
        onChange={(next) => set("status", next ? "published" : "draft")}
      />

      <Toggle
        label="Primary recommendation"
        description="Highlights this package as the one you recommend — only one package should carry this at a time."
        checked={draft.is_primary}
        onChange={(next) => set("is_primary", next)}
      />

      <Toggle
        label="Show as popup"
        description="Only one offer or package can be the active popup at a time — enabling this turns it off everywhere else."
        checked={draft.show_as_popup}
        onChange={(next) => set("show_as_popup", next)}
      />
    </div>
  );
}
