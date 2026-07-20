-- ============================================================
-- Bilingual columns + seed of all existing portfolio content.
-- Run AFTER 20260718000000_admin_schema.sql. Idempotent & re-runnable.
-- ============================================================

-- ---------- bilingual + portfolio-specific columns ----------
alter table public.categories
  add column if not exists name_ar text not null default '';

alter table public.projects
  add column if not exists title_ar text not null default '',
  add column if not exists short_description_ar text not null default '',
  add column if not exists full_description_ar text not null default '',
  -- Public grouping ("brandIdentity" | "graphicDesign" | "other" | "currentWork")
  add column if not exists group_key text not null default 'other',
  -- Public category label key ("brandIdentity" | "restoration" | ...)
  add column if not exists category_key text not null default '',
  -- Render the SVG logo in its own colors instead of the gold mono-mask
  add column if not exists preserve_color boolean not null default false;

-- ---------- seed categories (the CMS-facing taxonomy) ----------
insert into public.categories (name, name_ar, slug, sort_order) values
  ('Branding',         'العلامات التجارية', 'branding',        1),
  ('Visual Identity',  'الهوية البصرية',     'visual-identity', 2),
  ('Graphic Design',   'تصميم جرافيك',        'graphic-design',  3),
  ('Editorial Design', 'التصميم التحريري',   'editorial-design',4),
  ('Social Media',     'سوشال ميديا',         'social-media',    5),
  ('Print Design',     'التصميم الطباعي',     'print-design',    6)
on conflict (slug) do nothing;

-- ---------- seed projects (every item currently on the site) ----------
-- category_id resolves by slug so re-running stays consistent.
insert into public.projects
  (slug, title, title_ar, group_key, category_key, category_id,
   cover_image, preserve_color, featured, published, sort_order)
select v.slug, v.title, v.title_ar, v.group_key, v.category_key,
       c.id, v.cover_image, v.preserve_color, v.featured, true, v.sort_order
from (values
  ('syrian-doctors-syndicate', 'Syrian Doctors Syndicate — Logo', 'شعار نقابة أطباء سوريا',
   'brandIdentity', 'logoDesign', 'visual-identity',
   '/images/portfolio/syrian-doctors-syndicate.svg', false, true, 1),
  ('ashjan-al-talaqani', 'Ashjan Al-Talaqani — Brand Identity', 'الهوية البصرية لأشجان الطالقاني',
   'brandIdentity', 'brandIdentity', 'branding',
   '/images/portfolio/ashjan-al-talaqani.svg', false, true, 2),
  ('arkan', 'Arkan — Brand Identity', 'الهوية البصرية لأركان',
   'brandIdentity', 'brandIdentity', 'branding',
   '/images/portfolio/arkan.svg', false, false, 3),
  ('syrian-trading-company', 'Visual Identity — Syrian Trading Company', 'الهوية البصرية للشركة السورية للتجارة',
   'brandIdentity', 'brandIdentity', 'visual-identity',
   '/images/portfolio/syrian-trading-company.svg', false, false, 4),
  ('syrian-dentists-syndicate', 'Syrian Dentists Syndicate — Logo', 'شعار نقابة أطباء الأسنان السورية',
   'brandIdentity', 'logoDesign', 'visual-identity',
   '/images/portfolio/syrian-dentists-syndicate.svg', false, false, 5),
  ('hom-beauty-catalog', 'Commercial Catalog — HOM Beauty', 'كتالوج تجاري — شركة هوم بيوت',
   'graphicDesign', 'print', 'print-design',
   '', false, false, 6),
  ('quwatli-atassi-restoration', 'Restoring Presidents Al-Quwatli & Al-Atassi — "Hayat" (LTV)', 'ترميم صور الرئيسين شكري القوتلي وهاشم الأتاسي — برنامج "حياة" (LTV)',
   'other', 'restoration', 'graphic-design',
   '', false, false, 7),
  ('ghassan-kanafani-colorization', 'Colorizing Ghassan Kanafani''s Portrait — Abjad App', 'تلوين صورة الشهيد غسان كنفاني — تطبيق أبجد',
   'other', 'colorization', 'graphic-design',
   '', false, false, 8),
  -- Organizations / current work (kept in the CMS; rendered in the
  -- Experience section, so group_key "currentWork" keeps them out of the
  -- public Portfolio grid without any regression).
  ('al-mustafa-institute', 'Al-Mustafa Institute for Religious Guidance', 'مؤسسة المصطفى للإرشاد والتوعية الدينية',
   'currentWork', 'brandIdentity', 'branding',
   '/images/current-work/al-mustafa-institute.svg', false, true, 10),
  ('al-mujeeb-center', 'Al-Mujeeb Center for Religious Knowledge', 'مركز المجيب للمعارف الدينية',
   'currentWork', 'brandIdentity', 'branding',
   '/images/current-work/al-mujeeb-center.svg', false, true, 11),
  ('najaf-time-podcast', 'Najaf Time Podcast', 'بودكاست بتوقيت النجف',
   'currentWork', 'brandIdentity', 'branding',
   '/images/current-work/najaf-time-podcast.svg', false, true, 12),
  ('ilia-app', 'Ilia App', 'تطبيق إيليا',
   'currentWork', 'brandIdentity', 'branding',
   '/images/current-work/ilia-app.svg', false, true, 13)
) as v(slug, title, title_ar, group_key, category_key, category_slug,
       cover_image, preserve_color, featured, sort_order)
left join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;
