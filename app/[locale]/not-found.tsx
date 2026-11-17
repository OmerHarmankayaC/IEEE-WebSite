"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";

// not-found files receive no params, so the language is read from the address.
export default function NotFound() {
  const pathname = usePathname() ?? "/";
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";
  const t = getDictionary(locale);

  return (
    <>
    <SiteHeader t={t} locale={locale} />
    <main className="section">
      <div className="container stack" style={{ maxWidth: 820 }}>
        <div className="section-head">
          <span>404</span>
          <Link href={localePath(locale, "/")} className="section-head__side">
            {t.blogPage.back}
          </Link>
        </div>
        <h1 className="page-title">{locale === "en" ? "Page not found." : "Sayfa bulunamadı."}</h1>
        <p className="page-lead">
          {locale === "en"
            ? "The page may have moved or been removed. You can go back to the homepage or browse the blog."
            : "Sayfa taşınmış ya da kaldırılmış olabilir. Ana sayfaya dönebilir ya da bloga göz atabilirsin."}
        </p>
        <div className="chip-row">
          <Link href={localePath(locale, "/")} className="btn btn--primary btn--small">
            {t.nav.home}
          </Link>
          <Link href={localePath(locale, "/blog")} className="btn btn--outline btn--small">
            {t.nav.blog}
          </Link>
        </div>
      </div>
    </main>
    <FooterBand t={t} locale={locale} />
    </>
  );
}
