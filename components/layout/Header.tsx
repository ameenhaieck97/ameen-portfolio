"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/cn";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navKeys = ["about", "skills", "portfolio", "experience", "partners"] as const;

export default function Header() {
  const t = useTranslations("nav");
  const tMeta = useTranslations("meta");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled ? "glass-strong" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <MonoLogo
            src={siteConfig.logo}
            label={tMeta("titleShort")}
            className="h-8 w-8"
          />
          <span className="font-display text-lg font-medium tracking-tight text-ivory">
            {tMeta("titleShort")}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navKeys.map((key) => (
            <a
              key={key}
              href={`#${key}`}
              className="text-sm font-medium text-ivory/75 transition-colors hover:text-gold"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LanguageSwitcher />
          <a
            href="#contact"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-canvas transition-all duration-300 hover:bg-gold-soft hover:shadow-[0_0_28px_rgba(238,223,122,0.3)]"
          >
            {t("contact")}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("close") : t("menu")}
          aria-expanded={open}
          className="glass flex h-11 w-11 items-center justify-center rounded-full text-ivory lg:hidden"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong overflow-hidden lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 pb-8 pt-2">
              {navKeys.map((key) => (
                <a
                  key={key}
                  href={`#${key}`}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-ivory/85 transition-colors hover:bg-white/5 hover:text-gold"
                >
                  {t(key)}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-gold"
              >
                {t("contact")}
              </a>
              <div className="mt-3 px-3">
                <LanguageSwitcher />
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
