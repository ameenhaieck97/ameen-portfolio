"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Laptop, Smartphone, Tablet, X } from "lucide-react";
import { PromoCard, type PromoCardProps } from "@/components/ui/PromoCard";
import { cn } from "@/lib/cn";

const DEVICES = [
  { key: "desktop", label: "Desktop", icon: Laptop, width: 420 },
  { key: "tablet", label: "Tablet", icon: Tablet, width: 340 },
  { key: "mobile", label: "Mobile", icon: Smartphone, width: 300 },
] as const;

/**
 * Shows exactly how a draft offer/package card will render before it's
 * published — reuses the same `PromoCard` component the public popup renders,
 * just at three representative container widths, so there's no drift between
 * what's previewed here and what visitors actually see.
 */
export function PromoPreviewModal({
  open,
  onClose,
  card,
}: {
  open: boolean;
  onClose: () => void;
  card: PromoCardProps;
}) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("desktop");
  const active = DEVICES.find((d) => d.key === device) ?? DEVICES[0];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/8 p-5">
              <h2 className="font-display text-lg text-ivory">Preview</h2>
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-canvas/40 p-1">
                {DEVICES.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDevice(d.key)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                      device === d.key ? "bg-gold text-canvas" : "text-ivory/55 hover:text-ivory",
                    )}
                  >
                    <d.icon size={13} aria-hidden />
                    {d.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Close preview"
                onClick={onClose}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-ivory/70 hover:bg-white/5"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto bg-black/30 p-8">
              <div style={{ width: active.width }} className="max-w-full">
                <PromoCard {...card} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
