import Link from "next/link";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getI18n } from "@/lib/i18n/locale";

export default async function NotFound() {
  const { t, locale } = await getI18n();
  return (
    <>
      <SiteHeader t={t} locale={locale} />
      <main className="section">
        <div className="container stack" style={{ maxWidth: 820 }}>
          <div className="section-head">
            <span>404</span>
            <Link href="/" className="section-head__side">
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
            <Link href="/" className="btn btn--primary btn--small">
              {t.nav.home}
            </Link>
            <Link href="/blog" className="btn btn--outline btn--small">
              {t.nav.blog}
            </Link>
          </div>
        </div>
      </main>
      <FooterBand t={t} />
    </>
  );
}
