export type Partner = {
  id: string;
  name: { en: string; ar: string };
  logo?: string;
};

export const partners: Partner[] = [
  {
    id: "pa01",
    name: { en: "Al-Hay'a Al-Ilmiyya", ar: "الهيئة العلمائية" },
    logo: "/images/partners/al-hayaa-al-ilmiyya.svg",
  },
  {
    id: "pa02",
    name: { en: "LTV Channel", ar: "قناة LTV" },
    logo: "/images/partners/ltv-channel.svg",
  },
  {
    id: "pa03",
    name: { en: "Sham TV", ar: "قناة شام تي في" },
    logo: "/images/partners/sham-tv.svg",
  },
  {
    id: "pa04",
    name: { en: "Hawiya Foundation", ar: "مؤسسة هوية" },
    logo: "/images/partners/hawiya-foundation.svg",
  },
  {
    id: "pa05",
    name: { en: "Syrian Ministry of Health", ar: "وزارة الصحة السورية" },
    logo: "/images/partners/syria-ministry-of-health.svg",
  },
];
