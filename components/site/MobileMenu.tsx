"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";
import { LangSwitch } from "./LangSwitch";

type Props = {
  locale: Locale;
  joinHref: string;
  links: { href: string; label: string }[];
  labels: { open: string; close: string; menu: string; language: string; join: string };
};

export function MobileMenu({ locale, joinHref, links, labels }: Props) {
  const [open, setOpen] = useState(false);

  // Lock page scroll and listen for Escape while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="menu-button"
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <nav aria-label={labels.menu}>
            {links.map((link, index) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mobile-menu__bottom">
            <LangSwitch locale={locale} label={labels.language} dark />
            <Link href={joinHref} className="btn btn--light" onClick={() => setOpen(false)}>
              {labels.join}
            </Link>
            <span className="mono mono--muted">@IEEE.TEDU · {site.email.toUpperCase()}</span>
          </div>
        </div>
      )}
    </>
  );
}
