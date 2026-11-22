import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "@/components/icons";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WorkshopGuide } from "@/components/site/WorkshopGuide";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getWorkshop, getWorkshops } from "@/lib/workshops";

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorkshops().map((workshop) => ({ slug: workshop.slug }));
}

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const workshop = getWorkshop(slug);
  if (!workshop) return {};
  return {
    title: workshop.title,
    description: workshop.summary,
    alternates: {
      canonical: localePath(locale as Locale, `/etkinlikler/rehber/${slug}`),
      languages: { tr: `/etkinlikler/rehber/${slug}`, en: `/en/etkinlikler/rehber/${slug}` },
    },
  };
}

export default async function WorkshopPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const workshop = getWorkshop(slug);
  if (!workshop) notFound();

  return (
    <>
      <SiteHeader t={t} locale={locale} current="events" />
      <main>
        <div className="article-head">
          <div className="container sec article-head__inner">
            <Link href={localePath(locale, "/etkinlikler")} className="back-link article-head__back">
              <ChevronLeft />
              {t.events.back}
            </Link>
            <p className="vt vt--accent">{workshop.organizer.replace("IEEE TEDU ", "")}</p>
            <div className="article-head__text" lang="tr">
              <h1 className="article__title">{workshop.title}</h1>
              <p className="article__lead">{workshop.summary}</p>
              {t.workshops.contentNote && (
                <p className="meta meta--muted" lang={locale} style={{ margin: 0 }}>
                  {t.workshops.contentNote}
                </p>
              )}
              <dl className="facts" lang={locale}>
                <div>
                  <dt>{t.workshops.organizer}</dt>
                  <dd lang="tr">{workshop.organizer}</dd>
                </div>
                {workshop.duration && (
                  <div>
                    <dt>{t.workshops.duration}</dt>
                    <dd lang="tr">{workshop.duration}</dd>
                  </div>
                )}
                {workshop.audience && (
                  <div>
                    <dt>{t.workshops.audience}</dt>
                    <dd lang="tr">{workshop.audience}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <section className="container sec article-body" aria-label={t.workshops.install}>
          <span className="sec__spacer" />
          <WorkshopGuide workshop={workshop} t={t.workshops} />
        </section>
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
