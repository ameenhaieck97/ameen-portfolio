"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Settings, SocialLinks } from "@/types/admin";
import { TextAreaField, TextField } from "@/components/admin/FormControls";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";

const SOCIAL_KEYS: Array<{ key: keyof SocialLinks; label: string }> = [
  { key: "instagram", label: "Instagram" },
  { key: "behance", label: "Behance" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X (Twitter)" },
  { key: "youtube", label: "YouTube" },
];

type SettingsDraft = {
  site_title: string;
  site_description: string;
  contact_email: string;
  phone: string;
  location: string;
  social_links: Record<keyof SocialLinks, string>;
};

const EMPTY_DRAFT: SettingsDraft = {
  site_title: "",
  site_description: "",
  contact_email: "",
  phone: "",
  location: "",
  social_links: {
    instagram: "",
    behance: "",
    linkedin: "",
    facebook: "",
    x: "",
    youtube: "",
  },
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getSupabaseClient()
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setLoadError(error.message);
          setDraft(EMPTY_DRAFT);
          return;
        }
        const row = data as Settings | null;
        setDraft({
          site_title: row?.site_title ?? "",
          site_description: row?.site_description ?? "",
          contact_email: row?.contact_email ?? "",
          phone: row?.phone ?? "",
          location: row?.location ?? "",
          social_links: {
            ...EMPTY_DRAFT.social_links,
            ...(row?.social_links ?? {}),
          },
        });
      });
  }, []);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await getSupabaseClient()
      .from("settings")
      .upsert({ id: 1, ...draft });
    setSaving(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Settings saved.");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">Settings</h1>
          <p className="mt-1.5 text-sm text-ivory/55">
            Site-wide information and contact details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !draft}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
          Save settings
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
            <h2 className="font-display text-lg text-ivory">Site</h2>
            <div className="mt-5 grid gap-5">
              <TextField
                label="Site title"
                value={draft.site_title}
                onChange={(event) =>
                  setDraft({ ...draft, site_title: event.target.value })
                }
              />
              <TextAreaField
                label="Site description"
                rows={3}
                value={draft.site_description}
                onChange={(event) =>
                  setDraft({ ...draft, site_description: event.target.value })
                }
              />
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg text-ivory">Contact</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                label="Contact email"
                type="email"
                value={draft.contact_email}
                onChange={(event) =>
                  setDraft({ ...draft, contact_email: event.target.value })
                }
              />
              <TextField
                label="Phone"
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
              />
              <TextField
                label="Location"
                className="sm:col-span-2"
                value={draft.location}
                onChange={(event) =>
                  setDraft({ ...draft, location: event.target.value })
                }
              />
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg text-ivory">Social links</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {SOCIAL_KEYS.map(({ key, label }) => (
                <TextField
                  key={key}
                  label={label}
                  type="url"
                  placeholder="https://…"
                  value={draft.social_links[key]}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      social_links: {
                        ...draft.social_links,
                        [key]: event.target.value,
                      },
                    })
                  }
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
