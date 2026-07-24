"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Centered glass modal shell — mirrors MediaLibrary's MediaPicker dialog so every Studio modal looks and behaves the same. */
export function Modal({
  open,
  onClose,
  title,
  description,
  maxWidth = "max-w-lg",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  maxWidth?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

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
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "glass-strong relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-3xl p-6",
              maxWidth,
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-ivory">{title}</h2>
                {description ? (
                  <p className="mt-0.5 text-xs text-ivory/50">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-ivory/70 hover:bg-white/5"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
