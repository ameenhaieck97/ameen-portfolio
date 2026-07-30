export type Category = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioGroupKey =
  | "brandIdentity"
  | "graphicDesign"
  | "other"
  | "currentWork";

export type Service = {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  start_year: string;
  end_year: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  quote: string;
  avatar_url: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  title: string;
  title_ar: string;
  slug: string;
  short_description: string;
  short_description_ar: string;
  full_description: string;
  full_description_ar: string;
  client: string;
  year: number | null;
  category_id: string | null;
  group_key: PortfolioGroupKey;
  category_key: string;
  preserve_color: boolean;
  is_logo: boolean;
  technologies: string[];
  featured: boolean;
  published: boolean;
  cover_image: string;
  gallery_images: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectWithCategory = Project & {
  categories: Pick<Category, "id" | "name"> | null;
};

export type SocialLinks = {
  instagram: string;
  behance: string;
  linkedin: string;
  facebook: string;
  x: string;
  youtube: string;
};

export type PopupType = "offer" | "package" | "custom" | "image_only" | "announcement";
export type PopupFrequency = "once_per_visitor" | "every_visit" | "until_dismissed";
export type PopupPriority = "high" | "normal" | "low";
export type PageVisibility = "public" | "hidden";

/** One entry per homepage section that supports independent text-size scaling. */
export const SECTION_KEYS = [
  "hero",
  "about",
  "services",
  "portfolio",
  "experience",
  "education",
  "clients",
  "contact",
  "footer",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];
/** Multiplier applied to that section's font sizes — 1 = default, missing = 1. */
export type SectionTextScales = Partial<Record<SectionKey, number>>;

export type Settings = {
  id: number;
  site_title: string;
  site_description: string;
  contact_email: string;
  phone: string;
  location: string;
  social_links: Partial<SocialLinks>;
  about_photo_url: string;
  /** Whether the popup shows on the public site at all. */
  promo_enabled: boolean;
  popup_type: PopupType;
  popup_frequency: PopupFrequency;
  popup_delay_seconds: number;
  popup_priority: PopupPriority;
  popup_hide_after_cta: boolean;
  /** Only used when popup_type is "custom" | "image_only" | "announcement" — there's no offer/package row to read content from. */
  popup_custom_title: string;
  popup_custom_title_ar: string;
  popup_custom_description: string;
  popup_custom_description_ar: string;
  popup_custom_image_url: string;
  popup_custom_link_url: string;
  popup_custom_cta_text: string;
  popup_custom_cta_text_ar: string;
  /** Controls the public Packages page: "hidden" keeps it out of nav/internal links and noindexes it, but the direct URL still works. */
  packages_page_visibility: PageVisibility;
  section_text_scale: SectionTextScales;
  updated_at: string;
};
