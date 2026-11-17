import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { site } from "@/lib/site";

export function SiteFooter({ t, locale, band = false }: { t: Dictionary; locale: Locale; band?: boolean }) {
  return (
    <footer className={band ? "site-footer site-footer--band" : "site-footer"}>
      <span>
        © {new Date().getFullYear()} {t.footer.rights}
      </span>
      <nav aria-label={t.nav.footerMenu}>
        <Link href={localePath(locale, "/blog")}>{t.nav.blog.toUpperCase()}</Link>
        <a href={`mailto:${site.email}`}>{site.email.toUpperCase()}</a>
        <Link href="/admin" prefetch={false}>
          {t.nav.adminLogin}
        </Link>
      </nav>
    </footer>
  );
}

/** Footer on its own navy band, for pages other than the homepage. */
export function FooterBand({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <div className="dark">
      <div className="container">
        <SiteFooter t={t} locale={locale} band />
      </div>
    </div>
  );
}
