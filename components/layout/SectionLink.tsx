"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * A link to a same-page section (e.g. #about). On the homepage this is a
 * plain anchor — the only behavior confirmed to reliably scroll on this
 * single-page site. On any other route (e.g. /packages), a plain anchor
 * would just append the hash to the current URL instead of leaving the
 * page, so this navigates to "/#hash" instead, landing on the homepage
 * already scrolled to the right section.
 */
export function SectionLink({
  hash,
  className,
  onClick,
  children,
}: {
  hash: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <a href={`#${hash}`} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={`/#${hash}`} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
