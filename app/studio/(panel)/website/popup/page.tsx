"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { safeRevalidate } from "@/lib/revalidate";
import type { PopupFrequency, PopupPriority, PopupType, Settings } from "@/types/admin";
import {
  SelectField,
  TextAreaField,
  TextField,
  Toggle,
} from "@/components/admin/FormControls";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";

type PopupDraft = Pick<
  Settings,
  | "promo_enabled"
  | "popup_type"
  | "popup_frequency"
  | "popup_delay_seconds"
  | "popup_priority"
  | "popup_hide_after_cta"
  | "popup_custom_title"
  | "popup_custom_title_ar"
  | "popup_custom_description"
  | "popup_custom_description_ar"
  | "popup_custom_image_url"
  | "popup_custom_link_url"
  | "popup_custom_cta_text"
  | "popup_custom_cta_text_ar"
>;

const EMPTY_DRAFT: PopupDraft = {
  promo_enabled: false,
  popup_type: "offer",
  popup_frequency: "once_per_visitor",
  popup_delay_seconds: 3,
  popup_priority: "normal",
  popup_hide_after_cta: true,
  popup_custom_title: "",
  popup_custom_title_ar: "",
  popup_custom_description: "",
  popup_custom_description_ar: "",
  popup_custom_image_url: "",
  popup_custom_link_url: "",
  popup_custom_cta_text: "",
  popup_custom_cta_text_ar: "",
};

type FeaturedItem = { kind: "offers" | "packages"; name: string } | null;

export default function PopupManagerPage() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<PopupDraft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [featured, setFeatured] = useState<FeaturedItem>(null);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);

  useEffect(() => {
    void getSupabaseClient()
      .from("settings")
      .select(
        "promo_enabled, popup_type, popup_frequency, popup_delay_seconds, popup_priority, popup_hide_after_cta, popup_custom_title, popup_custom_title_ar, popup_custom_description, popup_custom_description_ar, popup_custom_image_url, popup_custom_link_url, popup_custom_cta_text, popup_custom_cta_text_ar",
      )
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setLoadError(error.message);
          setDraft(EMPTY_DRAFT);
          return;
        }
        setDraft({ ...EMPTY_DRAFT, ...(data as Partial<PopupDraft> | null) });
      });
  }, []);

  useEffect(() => {
    void (async () => {
      const supabase = getSupabaseClient();
      const [offerRes, packageRes] = await Promise.all([
        supabase.from("offers").select("name").eq("show_as_popup", true).maybeSingle(),
        supabase.from("packages").select("name").eq("show_as_popup", true).maybeSingle(),
      ]);
      if (offerRes.data) setFeatured({ kind: "offers", name: (offerRes.data as { name: string }).name });
      else if (packageRes.data)
        setFeatured({ kind: "packages", name: (packageRes.data as { name: string }).name });
      else setFeatured(null);
      setFeaturedLoaded(true);
    })();
  }, []);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await getSupabaseClient().from("settings").upsert({ id: 1, ...draft });
    setSaving(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Popup settings saved.");
    void safeRevalidate(toast);
  };

  const showsItemContent = draft?.popup_type === "offer" || draft?.popup_type === "package";
  const showsCustomFields =
    draft?.popup_type === "custom" ||
    draft?.popup_type === "image_only" ||
    draft?.popup_type === "announcement";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">Popup Manager</h1>
          <p className="mt-1.5 text-sm text-ivory/55">
            Controls the announcement popup shown to visitors on the homepage — separate from
            publishing an offer or package, so publishing one never makes it pop up on its own.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !draft}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
          Save
        </button>
      </div>

      {loadError ? (
        <div className="glass mt-6 rounded-3xl border border-red-400/20 p-6 text-sm text-red-300">
          {loadError}
        </div>
      ) : null}

      {!draft ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="glass rounded-3xl p-6">
            <Toggle
              label="Show popup"
              description="Master switch — turns the popup off everywhere regardless of the settings below."
              checked={draft.promo_enabled}
              onChange={(next) => setDraft({ ...draft, promo_enabled: next })}
            />
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg text-ivory">Content</h2>
            <div className="mt-5 space-y-5">
              <SelectField
                label="Popup type"
                value={draft.popup_type}
                onChange={(event) =>
                  setDraft({ ...draft, popup_type: event.target.value as PopupType })
                }
              >
                <option value="offer">Offer</option>
                <option value="package">Package</option>
                <option value="custom">Custom</option>
                <option value="image_only">Image only</option>
                <option value="announcement">Announcement</option>
              </SelectField>

              {showsItemContent ? (
                <div className="rounded-xl border border-white/10 bg-canvas/40 px-4 py-3 text-sm text-ivory/70">
                  {!featuredLoaded ? (
                    "Checking which item is featured…"
                  ) : featured && featured.kind === (draft.popup_type === "offer" ? "offers" : "packages") ? (
                    <>
                      Currently featuring <span className="font-medium text-gold">{featured.name}</span>.
                      Change it from{" "}
                      <Link href="/studio/website/offers" className="text-gold underline">
                        Offers &amp; Packages
                      </Link>{" "}
                      — toggle &quot;Show as popup&quot; on the item you want instead.
                    </>
                  ) : (
                    <>
                      No {draft.popup_type} is currently flagged &quot;Show as popup&quot;. Go to{" "}
                      <Link href="/studio/website/offers" className="text-gold underline">
                        Offers &amp; Packages
                      </Link>{" "}
                      and enable it on one.
                    </>
                  )}
                </div>
              ) : null}

              {showsCustomFields ? (
                <div className="space-y-5 border-t border-white/8 pt-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="Title"
                      value={draft.popup_custom_title}
                      onChange={(event) =>
                        setDraft({ ...draft, popup_custom_title: event.target.value })
                      }
                    />
                    <TextField
                      label="Title (Arabic)"
                      dir="rtl"
                      value={draft.popup_custom_title_ar}
                      onChange={(event) =>
                        setDraft({ ...draft, popup_custom_title_ar: event.target.value })
                      }
                    />
                  </div>
                  {draft.popup_type !== "image_only" ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextAreaField
                        label="Description"
                        rows={3}
                        value={draft.popup_custom_description}
                        onChange={(event) =>
                          setDraft({ ...draft, popup_custom_description: event.target.value })
                        }
                      />
                      <TextAreaField
                        label="Description (Arabic)"
                        rows={3}
                        dir="rtl"
                        value={draft.popup_custom_description_ar}
                        onChange={(event) =>
                          setDraft({ ...draft, popup_custom_description_ar: event.target.value })
                        }
                      />
                    </div>
                  ) : null}
                  <ImageUploader
                    label="Image"
                    folder="settings"
                    value={draft.popup_custom_image_url ? [draft.popup_custom_image_url] : []}
                    onChange={([url]) =>
                      setDraft({ ...draft, popup_custom_image_url: url ?? "" })
                    }
                  />
                  {draft.popup_type !== "image_only" ? (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                          label="CTA button text"
                          value={draft.popup_custom_cta_text}
                          onChange={(event) =>
                            setDraft({ ...draft, popup_custom_cta_text: event.target.value })
                          }
                        />
                        <TextField
                          label="CTA button text (Arabic)"
                          dir="rtl"
                          value={draft.popup_custom_cta_text_ar}
                          onChange={(event) =>
                            setDraft({ ...draft, popup_custom_cta_text_ar: event.target.value })
                          }
                        />
                      </div>
                      <TextField
                        label="CTA link"
                        value={draft.popup_custom_link_url}
                        onChange={(event) =>
                          setDraft({ ...draft, popup_custom_link_url: event.target.value })
                        }
                      />
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg text-ivory">Behavior</h2>
            <div className="mt-5 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Frequency"
                  value={draft.popup_frequency}
                  onChange={(event) =>
                    setDraft({ ...draft, popup_frequency: event.target.value as PopupFrequency })
                  }
                >
                  <option value="once_per_visitor">Show once per visitor</option>
                  <option value="every_visit">Show every visit</option>
                  <option value="until_dismissed">Show until dismissed</option>
                </SelectField>
                <TextField
                  label="Delay before appearing (seconds)"
                  type="number"
                  min={0}
                  value={String(draft.popup_delay_seconds)}
                  onChange={(event) =>
                    setDraft({ ...draft, popup_delay_seconds: Number(event.target.value) || 0 })
                  }
                />
              </div>
              <SelectField
                label="Priority"
                value={draft.popup_priority}
                onChange={(event) =>
                  setDraft({ ...draft, popup_priority: event.target.value as PopupPriority })
                }
              >
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </SelectField>
              <Toggle
                label="Don't show again after CTA click"
                description="Once a visitor clicks the popup's CTA, stop showing it to them again."
                checked={draft.popup_hide_after_cta}
                onChange={(next) => setDraft({ ...draft, popup_hide_after_cta: next })}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
