"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

/** Generic right-side sliding panel with a blurred backdrop — the Studio's one drawer primitive, reused by any feature that needs a "peek without navigating away" view. */
export function GlassDrawer({
  open,
  onClose,
  title,
  headerExtra,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional controls rendered next to the title (e.g. prev/next receipt buttons). */
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  useBodyScrollLock(open);

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
        <>
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong fixed inset-y-0 end-0 z-[161] flex w-full max-w-xl flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/8 p-6">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl text-ivory">{title}</h2>
                {headerExtra}
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
            <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
