import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";

export function SiteFooter({ t, band = false }: { t: Dictionary; band?: boolean }) {
  return (
    <footer className={band ? "site-footer site-footer--band" : "site-footer"}>
      <span>
        © {new Date().getFullYear()} {t.footer.rights}
      </span>
      <nav aria-label={t.nav.footerMenu}>
        <Link href="/blog">{t.nav.blog.toUpperCase()}</Link>
        <a href={`mailto:${site.email}`}>{site.email.toUpperCase()}</a>
        <Link href="/admin">{t.nav.adminLogin}</Link>
      </nav>
    </footer>
  );
}

/** Footer on its own navy band, for pages other than the homepage. */
export function FooterBand({ t }: { t: Dictionary }) {
  return (
    <div className="dark">
      <div className="container">
        <SiteFooter t={t} band />
      </div>
    </div>
  );
}
