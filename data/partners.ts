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
  {
    id: "pa06",
    name: { en: "La Luna", ar: "La Luna" },
    logo: "/images/partners/la-luna.svg",
  },
  {
    id: "pa07",
    name: { en: "Lali", ar: "Lali" },
    logo: "/images/partners/lali.svg",
  },
  {
    id: "pa08",
    name: { en: "Ragu", ar: "Ragu" },
    logo: "/images/partners/ragu.svg",
  },
  {
    id: "pa09",
    name: { en: "Rammal", ar: "رمّال" },
    logo: "/images/partners/rammal.svg",
  },
  {
    id: "pa10",
    name: { en: "Fly Sham", ar: "فلاي شام" },
    logo: "/images/partners/fly-sham.svg",
  },
  {
    id: "pa11",
    name: { en: "Sultan Saray", ar: "Sultan Saray" },
    logo: "/images/partners/ss.svg",
  },
  {
    id: "pa12",
    name: { en: "Ushqimi i Nxehtë", ar: "Ushqimi i Nxehtë" },
    logo: "/images/partners/un.svg",
  },
];
