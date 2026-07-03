export type Stat = {
  id: string;
  value: number;
  suffix: string;
  labelKey: string;
};

export const stats: Stat[] = [
  { id: "years", value: 10, suffix: "+", labelKey: "years" },
  { id: "projects", value: 150, suffix: "+", labelKey: "projects" },
  { id: "clients", value: 30, suffix: "+", labelKey: "clients" },
  { id: "satisfaction", value: 100, suffix: "%", labelKey: "satisfaction" },
];
