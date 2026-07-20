"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  FolderKanban,
  Images,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/studio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio/projects", label: "Projects", icon: FolderKanban },
  { href: "/studio/categories", label: "Categories", icon: Layers },
  { href: "/studio/services", label: "Services", icon: Wrench },
  { href: "/studio/skills", label: "Skills", icon: Sparkles },
  { href: "/studio/experience", label: "Experience", icon: Award },
  { href: "/studio/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/studio/media", label: "Media", icon: Images },
  { href: "/studio/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/studio" ? pathname === "/studio" : pathname.startsWith(href);
}

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getSupabaseClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const signOut = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.assign("/studio/login");
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
            isActive(pathname, href)
              ? "bg-gold/12 text-gold"
              : "text-ivory/65 hover:bg-white/5 hover:text-ivory",
          )}
        >
          <Icon size={17} aria-hidden />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={signOut}
        className="mt-auto flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-ivory/65 transition-colors hover:bg-white/5 hover:text-red-300"
      >
        <LogOut size={17} aria-hidden />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 flex-none flex-col border-e border-white/8 bg-canvas-soft/40 p-5 lg:flex">
        <Link href="/studio" className="mb-8 block px-2">
          <span className="font-display text-xl text-ivory">Ameen Haieck</span>
          <span className="mt-0.5 block text-[11px] uppercase tracking-[0.25em] text-gold">
            Admin Panel
          </span>
        </Link>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="glass-strong absolute inset-y-0 start-0 flex w-72 flex-col p-5">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="font-display text-lg text-ivory">Admin Panel</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ivory/70 hover:bg-white/5"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 flex-none items-center justify-between gap-4 border-b border-white/8 bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-ivory/80 hover:bg-white/5 lg:hidden"
          >
            <Menu size={19} aria-hidden />
          </button>
          <div className="hidden text-sm text-ivory/50 lg:block">
            Portfolio content management
          </div>
          <div className="flex items-center gap-3">
            <span className="max-w-[220px] truncate text-sm text-ivory/70">{email}</span>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3.5 text-sm text-ivory/80 transition-colors hover:border-red-400/40 hover:text-red-300"
            >
              <LogOut size={15} aria-hidden />
              Logout
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
