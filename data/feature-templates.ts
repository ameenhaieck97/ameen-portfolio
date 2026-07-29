/**
 * Starting-point feature checklists for common package types — selecting one
 * in Studio → Offers & Packages seeds the "Included features" list, which
 * stays fully editable (add/remove/edit/reorder) afterward. Add a new
 * template by adding a key here; the Studio dropdown is generated from this
 * object, so nothing else needs to change.
 */

export type FeatureTemplateItem = { label: string; label_ar: string };

export type FeatureTemplateKey =
  | "brand_identity"
  | "logo_design"
  | "social_media_design"
  | "book_cover_design"
  | "book_layout_design"
  | "print_design"
  | "packaging_design"
  | "photo_restoration";

export const FEATURE_TEMPLATES: Record<
  FeatureTemplateKey,
  { label: string; features: FeatureTemplateItem[] }
> = {
  brand_identity: {
    label: "Brand Identity",
    features: [
      { label: "Logo Design", label_ar: "تصميم الشعار" },
      { label: "Color Palette", label_ar: "لوحة الألوان" },
      { label: "Typography System", label_ar: "نظام الخطوط" },
      { label: "Brand Guidelines", label_ar: "دليل الهوية البصرية" },
      { label: "Business Card Design", label_ar: "تصميم بطاقة العمل" },
      { label: "Social Media Profile Image", label_ar: "صورة البروفايل لمنصات التواصل" },
      { label: "Social Media Cover", label_ar: "صورة الغلاف لمنصات التواصل" },
      { label: "Source Files", label_ar: "الملفات المصدرية" },
      { label: "Print Ready Files", label_ar: "ملفات جاهزة للطباعة" },
    ],
  },
  logo_design: {
    label: "Logo Design",
    features: [
      { label: "Primary Logo Design", label_ar: "تصميم الشعار الأساسي" },
      { label: "Alternative Logo Versions", label_ar: "نسخ بديلة للشعار" },
      { label: "Favicon / App Icon", label_ar: "أيقونة الموقع / التطبيق" },
      { label: "Black & White Version", label_ar: "نسخة بالأبيض والأسود" },
      { label: "Source Files", label_ar: "الملفات المصدرية" },
      { label: "Print Ready Files", label_ar: "ملفات جاهزة للطباعة" },
    ],
  },
  social_media_design: {
    label: "Social Media Design",
    features: [
      { label: "Custom Post Designs", label_ar: "تصاميم منشورات مخصصة" },
      { label: "Story Designs", label_ar: "تصاميم ستوري" },
      { label: "Carousel Designs", label_ar: "تصاميم كاروسيل" },
      { label: "Editable Source Files", label_ar: "ملفات مصدرية قابلة للتعديل" },
      { label: "High Resolution Export", label_ar: "تصدير بدقة عالية" },
      { label: "Brand Consistency", label_ar: "اتساق الهوية البصرية" },
      { label: "Platform Optimization", label_ar: "تحسين متوافق مع كل منصة" },
    ],
  },
  book_cover_design: {
    label: "Book Cover Design",
    features: [
      { label: "Front Cover Design", label_ar: "تصميم الغلاف الأمامي" },
      { label: "Back Cover Design", label_ar: "تصميم الغلاف الخلفي" },
      { label: "Spine Design", label_ar: "تصميم كعب الكتاب" },
      { label: "Print Ready PDF", label_ar: "ملف PDF جاهز للطباعة" },
      { label: "Source Files", label_ar: "الملفات المصدرية" },
      { label: "Mockup Presentation", label_ar: "عرض تصوري (موكاب)" },
    ],
  },
  book_layout_design: {
    label: "Book Layout Design",
    features: [
      { label: "Interior Layout", label_ar: "تنسيق المحتوى الداخلي" },
      { label: "Typography Formatting", label_ar: "تنسيق الخطوط" },
      { label: "Table of Contents", label_ar: "فهرس المحتويات" },
      { label: "Print Ready PDF", label_ar: "ملف PDF جاهز للطباعة" },
      { label: "Press-ready Files", label_ar: "ملفات جاهزة للمطبعة" },
      { label: "Source Files", label_ar: "الملفات المصدرية" },
    ],
  },
  print_design: {
    label: "Print Design",
    features: [
      { label: "Print-ready Files", label_ar: "ملفات جاهزة للطباعة" },
      { label: "CMYK Colors", label_ar: "ألوان CMYK" },
      { label: "Bleed Included", label_ar: "هامش قص (بليد)" },
      { label: "Source Files", label_ar: "الملفات المصدرية" },
      { label: "High Resolution PDF", label_ar: "ملف PDF بدقة عالية" },
    ],
  },
  packaging_design: {
    label: "Packaging Design",
    features: [
      { label: "Packaging Mockup", label_ar: "عرض تصوري للتغليف (موكاب)" },
      { label: "Print-ready Dieline", label_ar: "مخطط قص جاهز للطباعة (داي لاين)" },
      { label: "Source Files", label_ar: "الملفات المصدرية" },
      { label: "3D Preview", label_ar: "معاينة ثلاثية الأبعاد" },
      { label: "Production-ready Files", label_ar: "ملفات جاهزة للإنتاج" },
    ],
  },
  photo_restoration: {
    label: "Photo Restoration",
    features: [
      { label: "Scratch Removal", label_ar: "إزالة الخدوش" },
      { label: "Color Restoration", label_ar: "استعادة الألوان" },
      { label: "Damage Repair", label_ar: "إصلاح التلف" },
      { label: "High Resolution Export", label_ar: "تصدير بدقة عالية" },
      { label: "AI Enhancement", label_ar: "تحسين بالذكاء الاصطناعي" },
      { label: "Before & After Preview", label_ar: "معاينة قبل وبعد" },
    ],
  },
};

export const FEATURE_TEMPLATE_OPTIONS: Array<{ value: FeatureTemplateKey | "custom"; label: string }> = [
  ...Object.entries(FEATURE_TEMPLATES).map(([value, template]) => ({
    value: value as FeatureTemplateKey,
    label: template.label,
  })),
  { value: "custom", label: "Custom" },
];
