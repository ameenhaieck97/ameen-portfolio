export type ExperienceItem = {
  id:
    | "mtn"
    | "syrianAirlines"
    | "alJamali"
    | "unknownSports"
    | "homClub"
    | "doaaAlKhair"
    | "darAlDiyaa";
  start: number;
  end: number | "present";
};

// Chronological, oldest to newest.
export const experience: ExperienceItem[] = [
  { id: "mtn", start: 2016, end: 2018 },
  { id: "syrianAirlines", start: 2016, end: 2018 },
  { id: "alJamali", start: 2018, end: 2019 },
  { id: "unknownSports", start: 2018, end: 2020 },
  { id: "homClub", start: 2018, end: "present" },
  { id: "doaaAlKhair", start: 2019, end: 2023 },
  { id: "darAlDiyaa", start: 2023, end: 2025 },
];
