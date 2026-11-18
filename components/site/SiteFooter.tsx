import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { site } from "@/lib/site";

export function SiteFooter({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <footer className="site-footer">
      <span>
        © {new Date().getFullYear()} {t.footer.rights}
      </span>
      <nav aria-label={t.nav.footerMenu}>
        <Link href={localePath(locale, "/blog")}>{t.nav.blog}</Link>
        <a href={`mailto:${site.email}`}>{site.email}</a>
        <Link href="/admin" prefetch={false}>
          {t.nav.adminLogin}
        </Link>
      </nav>
    </footer>
  );
}

/** The navy footer band at the bottom of every public page. */
export function FooterBand({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <div className="footer-band">
      <div className="container">
        <SiteFooter t={t} locale={locale} />
      </div>
    </div>
  );
}
