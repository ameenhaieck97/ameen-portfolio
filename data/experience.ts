export type ExperienceItem = {
  id: "start" | "hudaBeauty" | "printEditorial" | "almustafa";
  start: number;
  end: number | "present";
};

// A curated set of milestones, not a full job history — chronological,
// oldest to newest.
export const experience: ExperienceItem[] = [
  { id: "start", start: 2015, end: 2015 },
  { id: "hudaBeauty", start: 2020, end: 2020 },
  { id: "printEditorial", start: 2023, end: 2023 },
  { id: "almustafa", start: 2025, end: "present" },
];
