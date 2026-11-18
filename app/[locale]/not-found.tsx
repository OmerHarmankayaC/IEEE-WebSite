"use client";

import { usePathname } from "next/navigation";
import { NotFoundView } from "@/components/site/NotFoundView";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDictionary } from "@/lib/i18n/dictionaries";

// not-found files receive no params, so the language is read from the address.
export default function NotFound() {
  const pathname = usePathname() ?? "/";
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";
  const t = getDictionary(locale);

  return (
    <>
      <SiteHeader t={t} locale={locale} />
      <NotFoundView t={t} locale={locale} />
      <FooterBand t={t} locale={locale} />
    </>
  );
}
