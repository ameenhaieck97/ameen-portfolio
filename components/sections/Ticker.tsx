import { useTranslations } from "next-intl";
import { Marquee } from "@/components/ui/Marquee";

export default function Ticker() {
  const t = useTranslations("ticker");
  const items = t.raw("items") as string[];

  return (
    <div className="relative border-y border-white/8 py-5">
      <Marquee pauseOnHover={false}>
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-8 font-display text-sm uppercase tracking-[0.2em] text-ivory/45"
          >
            {item}
            <span className="h-1.5 w-1.5 rotate-45 bg-gold/50" aria-hidden />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
