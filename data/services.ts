import {
  BookOpen,
  Feather,
  Palette,
  Printer,
  Share2,
  Wand,
  type LucideIcon,
} from "lucide-react";

export type ServiceIconKey =
  | "brand"
  | "editorial"
  | "print"
  | "social"
  | "calligraphy"
  | "restoration";

export const SERVICE_ICONS: Record<ServiceIconKey, LucideIcon> = {
  brand: Palette,
  editorial: BookOpen,
  print: Printer,
  social: Share2,
  calligraphy: Feather,
  restoration: Wand,
};
