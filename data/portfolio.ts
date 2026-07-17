export type PortfolioCategory =
  | "brandIdentity"
  | "restoration"
  | "colorization"
  | "logoDesign"
  | "print";

export type PortfolioGroup = "brandIdentity" | "graphicDesign" | "other";

export type PortfolioItem = {
  id: string;
  category: PortfolioCategory;
  /** Which of the three portfolio tabs this item belongs to */
  group: PortfolioGroup;
  title: { en: string; ar: string };
  /** Set once a real export is placed in /public/images/portfolio */
  image?: string;
  /** Set to link out to an external case study instead of opening the lightbox */
  href?: string;
  /**
   * Renders the SVG logo in its own original colors instead of the usual
   * gold mono-mask treatment. Needed for marks whose overlapping shapes
   * have no transparent gap between them — mono-masking such a file makes
   * the whole thing collapse into one indistinguishable solid silhouette.
   */
  preserveColor?: boolean;
};

export const portfolioItems: PortfolioItem[] = [
  // Brand Identity — first three are the ones shown in the slider by
  // default; the rest sit behind "View all".
  {
    id: "doctorsSyndicate",
    category: "logoDesign",
    group: "brandIdentity",
    title: {
      en: "Syrian Doctors Syndicate — Logo",
      ar: "شعار نقابة أطباء سوريا",
    },
    image: "/images/portfolio/syrian-doctors-syndicate.svg",
  },
  {
    id: "ashjanAlTalaqani",
    category: "brandIdentity",
    group: "brandIdentity",
    title: {
      en: "Ashjan Al-Talaqani — Brand Identity",
      ar: "الهوية البصرية لأشجان الطالقاني",
    },
    image: "/images/portfolio/ashjan-al-talaqani.svg",
  },
  {
    id: "arkan",
    category: "brandIdentity",
    group: "brandIdentity",
    title: {
      en: "Arkan — Brand Identity",
      ar: "الهوية البصرية لأركان",
    },
    image: "/images/portfolio/arkan.svg",
  },
  {
    id: "syrianTrading",
    category: "brandIdentity",
    group: "brandIdentity",
    title: {
      en: "Visual Identity — Syrian Trading Company",
      ar: "الهوية البصرية للشركة السورية للتجارة",
    },
    image: "/images/portfolio/syrian-trading-company.svg",
  },
  {
    id: "dentistsSyndicate",
    category: "logoDesign",
    group: "brandIdentity",
    title: {
      en: "Syrian Dentists Syndicate — Logo",
      ar: "شعار نقابة أطباء الأسنان السورية",
    },
    image: "/images/portfolio/syrian-dentists-syndicate.svg",
  },

  // Graphic Design — placeholder set until new work is uploaded.
  {
    id: "p05",
    category: "print",
    group: "graphicDesign",
    title: {
      en: "Commercial Catalog — HOM Beauty",
      ar: "كتالوج تجاري — شركة هوم بيوت",
    },
  },

  // Other — pieces awaiting their final images.
  {
    id: "p01",
    category: "restoration",
    group: "other",
    title: {
      en: "Restoring Presidents Al-Quwatli & Al-Atassi — \"Hayat\" (LTV)",
      ar: "ترميم صور الرئيسين شكري القوتلي وهاشم الأتاسي — برنامج \"حياة\" (LTV)",
    },
  },
  {
    id: "p02",
    category: "colorization",
    group: "other",
    title: {
      en: "Colorizing Ghassan Kanafani's Portrait — Abjad App",
      ar: "تلوين صورة الشهيد غسان كنفاني — تطبيق أبجد",
    },
  },
];
