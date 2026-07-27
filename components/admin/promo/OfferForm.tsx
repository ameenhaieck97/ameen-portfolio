"use client";

import {
  SelectField,
  TextAreaField,
  TextField,
  Toggle,
} from "@/components/admin/FormControls";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AccentColorPicker } from "@/components/admin/promo/AccentColorPicker";
import { getEffectiveOfferStatus } from "@/lib/promo-status";
import type { Offer } from "@/types/promo";

export type OfferDraft = Omit<Offer, "id" | "created_at" | "updated_at">;

const OFFER_TYPES: Array<{ value: Offer["offer_type"]; label: string }> = [
  { value: "percentage", label: "Percentage discount" },
  { value: "fixed", label: "Fixed discount" },
  { value: "free_service", label: "Free service" },
  { value: "limited", label: "Limited offer" },
  { value: "announcement", label: "Announcement" },
];

const EXPIRATION_ACTIONS: Array<{ value: Offer["expiration_action"]; label: string }> = [
  { value: "hide", label: "Hide when expired" },
  { value: "archive", label: "Archive when expired" },
  { value: "keep_visible", label: "Keep visible when expired" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled — will go live on the start date",
  active: "Active now",
  expired: "Expired",
};

export function OfferForm({
  draft,
  onChange,
}: {
  draft: OfferDraft;
  onChange: (next: OfferDraft) => void;
}) {
  const set = <K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) =>
    onChange({ ...draft, [key]: value });

  const effective = getEffectiveOfferStatus(draft);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-2.5 text-sm text-gold">
        {STATUS_BADGE[effective]}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Offer name"
          required
          value={draft.name}
          onChange={(event) => set("name", event.target.value)}
        />
        <TextField
          label="Offer name (Arabic)"
          dir="rtl"
          value={draft.name_ar}
          onChange={(event) => set("name_ar", event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Offer type"
          value={draft.offer_type}
          onChange={(event) => set("offer_type", event.target.value as Offer["offer_type"])}
        >
          {OFFER_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Offer value"
          placeholder="e.g. 20%, $100, Free Brand Guidelines"
          value={draft.offer_value}
          onChange={(event) => set("offer_value", event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextAreaField
          label="Description"
          rows={3}
          value={draft.description}
          onChange={(event) => set("description", event.target.value)}
        />
        <TextAreaField
          label="Description (Arabic)"
          rows={3}
          dir="rtl"
          value={draft.description_ar}
          onChange={(event) => set("description_ar", event.target.value)}
        />
      </div>

      <ImageUploader
        label="Image"
        folder="offers"
        value={draft.image_url ? [draft.image_url] : []}
        onChange={([url]) => set("image_url", url ?? "")}
      />

      <AccentColorPicker value={draft.accent_color} onChange={(value) => set("accent_color", value)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="CTA button text"
          placeholder="e.g. Book Now, Claim Offer"
          value={draft.cta_text}
          onChange={(event) => set("cta_text", event.target.value)}
        />
        <TextField
          label="CTA button text (Arabic)"
          dir="rtl"
          value={draft.cta_text_ar}
          onChange={(event) => set("cta_text_ar", event.target.value)}
        />
      </div>
      <TextField
        label="CTA link"
        placeholder="https:// or wa.me/…"
        value={draft.cta_link}
        onChange={(event) => set("cta_link", event.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Start date"
          type="date"
          value={draft.start_date ?? ""}
          onChange={(event) => set("start_date", event.target.value || null)}
        />
        <TextField
          label="End date"
          type="date"
          value={draft.end_date ?? ""}
          onChange={(event) => set("end_date", event.target.value || null)}
        />
      </div>

      <SelectField
        label="Action when the offer expires"
        value={draft.expiration_action}
        onChange={(event) => set("expiration_action", event.target.value as Offer["expiration_action"])}
      >
        {EXPIRATION_ACTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <Toggle
        label="Published"
        description="Draft offers are never shown publicly, even if start/end dates have passed."
        checked={draft.status === "published"}
        onChange={(next) => set("status", next ? "published" : "draft")}
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
