import { Award, SpellCheck, Users, type LucideIcon } from "lucide-react";

export type CertificationItem = {
  id: "graphicDesignDiploma" | "proofreading" | "hrFinance";
  icon: LucideIcon;
};

export const certifications: CertificationItem[] = [
  { id: "graphicDesignDiploma", icon: Award },
  { id: "proofreading", icon: SpellCheck },
  { id: "hrFinance", icon: Users },
];
