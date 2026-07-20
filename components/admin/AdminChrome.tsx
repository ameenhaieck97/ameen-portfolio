"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Home,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  PanelBottom,
  Package,
  Percent,
  Settings,
  UserCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type NavLink = { href: string; label: string; icon: LucideIcon };

const WEBSITE_CHILDREN: NavLink[] = [
  { href: "/studio/website/homepage", label: "Homepage", icon: Home },
  { href: "/studio/website/portfolio", label: "Portfolio", icon: LayoutGrid },
  { href: "/studio/website/packages", label: "Packages", icon: Package },
  { href: "/studio/website/offers", label: "Offers", icon: Percent },
  { href: "/studio/website/about", label: "About", icon: UserCircle },
  { href: "/studio/website/contact", label: "Contact", icon: Mail },
  { href: "/studio/website/footer", label: "Footer", icon: PanelBottom },
];

function isActive(pathname: string, href: string) {
  return href === "/studio" ? pathname === "/studio" : pathname.startsWith(href);
}

function NavLinkItem({
  href,
  label,
  icon: Icon,
  active,
  indented,
  onNavigate,
}: NavLink & { active: boolean; indented?: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-300 ease-luxury",
        indented ? "ps-9 pe-4" : "px-4",
        active
          ? "bg-gold/10 text-gold"
          : "text-ivory/60 hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-ivory",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1.5 start-0 w-[3px] rounded-full bg-gold transition-all duration-300 ease-luxury",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon
        size={indented ? 15 : 17}
        aria-hidden
        className={cn(
          "flex-none transition-transform duration-300 ease-luxury",
          active ? "" : "group-hover:scale-110",
        )}
      />
      {label}
    </Link>
  );
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

  const websiteActive = WEBSITE_CHILDREN.some((child) => isActive(pathname, child.href));
  const closeMobile = () => setMobileOpen(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      <NavLinkItem
        href="/studio"
        label="Dashboard"
        icon={LayoutDashboard}
        active={isActive(pathname, "/studio")}
        onNavigate={closeMobile}
      />

      <div className="mt-2">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
            websiteActive ? "text-gold" : "text-ivory/40",
          )}
        >
          <Globe size={14} aria-hidden />
          Website
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {WEBSITE_CHILDREN.map((child) => (
            <NavLinkItem
              key={child.href}
              {...child}
              indented
              active={isActive(pathname, child.href)}
              onNavigate={closeMobile}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <NavLinkItem
          href="/studio/media"
          label="Media Library"
          icon={Images}
          active={isActive(pathname, "/studio/media")}
          onNavigate={closeMobile}
        />
        <NavLinkItem
          href="/studio/clients"
          label="Clients"
          icon={MessageSquareQuote}
          active={isActive(pathname, "/studio/clients")}
          onNavigate={closeMobile}
        />
        <NavLinkItem
          href="/studio/settings"
          label="Settings"
          icon={Settings}
          active={isActive(pathname, "/studio/settings")}
          onNavigate={closeMobile}
        />
      </div>

      <button
        type="button"
        onClick={signOut}
        className="mt-auto flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-ivory/60 transition-colors hover:bg-red-400/8 hover:text-red-300"
      >
        <LogOut size={17} aria-hidden />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 flex-none flex-col border-e border-white/8 bg-gradient-to-b from-canvas-soft/55 via-canvas-soft/35 to-canvas-soft/45 p-5 backdrop-blur-xl lg:flex">
        <Link href="/studio" className="mb-8 block px-2">
          <span className="font-display text-xl text-ivory">Ameen Haieck</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-gold">
            <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
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
          <aside className="glass-strong absolute inset-y-0 start-0 flex w-72 flex-col overflow-y-auto p-5">
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
        <header className="sticky top-0 z-40 flex h-16 flex-none items-center justify-between gap-4 border-b border-white/8 bg-canvas/75 px-4 backdrop-blur-2xl backdrop-saturate-150 sm:px-6">
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
