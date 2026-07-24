export type ExperienceItem = {
  id:
    | "mtnSyria"
    | "syrianAirlines"
    | "sportsAwareness"
    | "doaaAlKhair"
    | "hudaBeautyCatalog"
    | "hopeThroughWork"
    | "darAlDiya"
    | "almustafa";
  start: number;
  end: number | "present";
};

// Career milestones — chronological, oldest to newest.
export const experience: ExperienceItem[] = [
  { id: "mtnSyria", start: 2016, end: 2016 },
  { id: "syrianAirlines", start: 2016, end: 2016 },
  { id: "sportsAwareness", start: 2018, end: 2018 },
  { id: "doaaAlKhair", start: 2019, end: 2019 },
  { id: "hudaBeautyCatalog", start: 2020, end: 2020 },
  { id: "hopeThroughWork", start: 2021, end: 2021 },
  { id: "darAlDiya", start: 2023, end: 2023 },
  { id: "almustafa", start: 2025, end: "present" },
];
