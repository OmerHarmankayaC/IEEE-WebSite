import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "@/components/icons";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getWorkshops } from "@/lib/workshops";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  return {
    title: t.workshops.title,
    description: t.meta.workshopsDescription,
    alternates: { canonical: localePath(locale, "/atolyeler"), languages: { tr: "/atolyeler", en: "/en/atolyeler" } },
  };
}

export default async function WorkshopsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const workshops = getWorkshops();

  return (
    <>
      <SiteHeader t={t} locale={locale} current="workshops" />
      <main>
        <section className="page-head">
          <div className="sun" aria-hidden="true" />
          <div className="container page-head__inner">
            <Link href={localePath(locale, "/")} className="back-link">
              <ChevronLeft />
              {t.blogPage.back}
            </Link>
            <h1 className="page-title">{t.workshops.title}</h1>
            <p className="page-lead">{t.workshops.lead}</p>
          </div>
        </section>

        <section className="container blog-body" aria-label={t.workshops.title}>
          <ul className="workshop-list">
            {workshops.map((workshop) => (
              <li key={workshop.slug}>
                <Link href={localePath(locale, `/atolyeler/${workshop.slug}`)} className="workshop-card">
                  <span className="meta meta--accent">{workshop.organizer}</span>
                  <span className="workshop-card__title" lang="tr">
                    {workshop.title}
                  </span>
                  <span className="excerpt" lang="tr">
                    {workshop.summary}
                  </span>
                  {workshop.duration && (
                    <span className="meta meta--muted">
                      <span>{t.workshops.duration}</span>
                      <span lang="tr">{workshop.duration}</span>
                    </span>
                  )}
                  <span className="workshop-card__open">{t.workshops.open}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
