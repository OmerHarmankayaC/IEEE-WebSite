"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n/dictionaries";
import { LangSwitch } from "./LangSwitch";

type Props = {
  locale: Locale;
  joinHref: string;
  links: { href: string; label: string }[];
  labels: { open: string; close: string; menu: string; language: string; join: string; menuButton: string; closeButton: string };
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
        <span aria-hidden="true">{open ? labels.closeButton : labels.menuButton}</span>
      </button>
      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <div className="sun" aria-hidden="true" />
          <nav aria-label={labels.menu}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu__bottom">
            <LangSwitch locale={locale} label={labels.language} />
            <Link href={joinHref} className="btn btn--primary" onClick={() => setOpen(false)}>
              {labels.join}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
