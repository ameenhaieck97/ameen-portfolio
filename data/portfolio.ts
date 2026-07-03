export type PortfolioCategory =
  | "brandIdentity"
  | "restoration"
  | "colorization"
  | "logoDesign"
  | "print";

export type PortfolioItem = {
  id: string;
  category: PortfolioCategory;
  title: { en: string; ar: string };
  /** Set once a real export is placed in /public/images/portfolio */
  image?: string;
  /** Set to link out to an external case study instead of opening the lightbox */
  href?: string;
  size: "sm" | "wide" | "lg";
};

export const portfolioItems: PortfolioItem[] = [
  {
    id: "p01",
    category: "restoration",
    title: {
      en: "Restoring Presidents Al-Quwatli & Al-Atassi — \"Hayat\" (LTV)",
      ar: "ترميم صور الرئيسين شكري القوتلي وهاشم الأتاسي — برنامج \"حياة\" (LTV)",
    },
    size: "lg",
  },
  {
    id: "p02",
    category: "colorization",
    title: {
      en: "Colorizing Ghassan Kanafani's Portrait — Abjad App",
      ar: "تلوين صورة الشهيد غسان كنفاني — تطبيق أبجد",
    },
    size: "sm",
  },
  {
    id: "p03",
    category: "logoDesign",
    title: {
      en: "Syrian Doctors & Dentists Syndicate Logos",
      ar: "شعارات نقابة أطباء سوريا ونقابة أطباء الأسنان",
    },
    image: "/images/portfolio/syrian-doctors-syndicate.svg",
    size: "sm",
  },
  {
    id: "p04",
    category: "brandIdentity",
    title: {
      en: "Visual Identity — Syrian Trading Company",
      ar: "الهوية البصرية للشركة السورية للتجارة",
    },
    image: "/images/portfolio/syrian-trading-company.svg",
    size: "wide",
  },
  {
    id: "p05",
    category: "print",
    title: {
      en: "Commercial Catalog — HOM Beauty",
      ar: "كتالوج تجاري — شركة هوم بيوت",
    },
    size: "sm",
  },
];
