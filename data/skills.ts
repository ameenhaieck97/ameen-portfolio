import { Lightbulb, PenTool, Share2, Sparkles, Wand, type LucideIcon } from "lucide-react";

export type SkillKey =
  | "identitySystems"
  | "socialMedia"
  | "archivalRestoration"
  | "aiAssisted"
  | "clarity";

export const skills: { key: SkillKey; icon: LucideIcon }[] = [
  { key: "identitySystems", icon: PenTool },
  { key: "socialMedia", icon: Share2 },
  { key: "archivalRestoration", icon: Wand },
  { key: "aiAssisted", icon: Sparkles },
  { key: "clarity", icon: Lightbulb },
];
