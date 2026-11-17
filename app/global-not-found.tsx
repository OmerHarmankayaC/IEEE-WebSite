import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı | IEEE TEDU",
  robots: { index: false },
};

// Shown for addresses that match no page. It has no language of its own, so it
// speaks Turkish and offers the English homepage too.
export default function GlobalNotFound() {
  const t = getDictionary("tr");
  return (
    <html lang="tr" className={fontVariables}>
      <body>
        <SiteHeader t={t} locale="tr" />
        <main className="section">
          <div className="container stack" style={{ maxWidth: 820 }}>
            <div className="section-head">
              <span>404</span>
              <Link href="/" className="section-head__side">
                {t.blogPage.back}
              </Link>
            </div>
            <h1 className="page-title">Sayfa bulunamadı.</h1>
            <p className="page-lead">Sayfa taşınmış ya da kaldırılmış olabilir. Ana sayfaya dönebilir ya da bloga göz atabilirsin.</p>
            <div className="chip-row">
              <Link href="/" className="btn btn--primary btn--small">
                Ana sayfa
              </Link>
              <Link href="/blog" className="btn btn--outline btn--small">
                Blog
              </Link>
              <Link href="/en" className="btn btn--outline btn--small" lang="en" hrefLang="en">
                English homepage
              </Link>
            </div>
          </div>
        </main>
        <FooterBand t={t} locale="tr" />
      </body>
    </html>
  );
}
