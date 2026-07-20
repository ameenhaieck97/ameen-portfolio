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
  updated_at: string;
};
