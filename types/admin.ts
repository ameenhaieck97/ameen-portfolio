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

export type Settings = {
  id: number;
  site_title: string;
  site_description: string;
  contact_email: string;
  phone: string;
  location: string;
  social_links: Partial<SocialLinks>;
  about_photo_url: string;
  /** Whether the featured offer/package popup shows on the public site. */
  promo_enabled: boolean;
  promo_kind: "offers" | "packages";
  /** Row id within whichever table promo_kind points at — no FK since it's polymorphic across two tables. */
  promo_item_id: string | null;
  updated_at: string;
};

/** Shared shape for both offers and packages — same fields, two tables, managed via the same EntityManager UI. */
export type PromoEntity = {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  price: string;
  price_ar: string;
  image_url: string;
  link_url: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
