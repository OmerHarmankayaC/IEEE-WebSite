import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, PinIcon } from "@/components/icons";
import { EventDate } from "@/components/site/EventDate";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { COMMITTEE_NAMES, formatEventDay, formatEventHours, registrationStatus } from "@/lib/events";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getEvents, getRegistrationCounts } from "@/lib/posts";
import { registrationLine } from "@/lib/registration-line";
import { getWorkshops } from "@/lib/workshops";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  return {
    title: t.events.title,
    description: t.meta.eventsDescription,
    alternates: { canonical: localePath(locale, "/etkinlikler"), languages: { tr: "/etkinlikler", en: "/en/etkinlikler" } },
  };
}

export default async function EventsPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const [{ upcoming, past }, counts] = await Promise.all([getEvents(locale), getRegistrationCounts()]);
  const guides = getWorkshops();
  const organizer = (committee: keyof typeof COMMITTEE_NAMES | null) => (committee ? COMMITTEE_NAMES[committee] : t.events.branch);

  return (
    <>
      <SiteHeader t={t} locale={locale} current="events" />
      <main>
        <section className="page-head">
          <div className="container page-head__inner">
            <Link href={localePath(locale, "/")} className="back-link">
              <ChevronLeft />
              {t.blogPage.back}
            </Link>
            <h1 className="page-title">{t.events.title}</h1>
            <p className="page-lead">{t.events.lead}</p>
          </div>
        </section>

        <section className="container events-block" aria-labelledby="yaklasan">
          <h2 className="events-block__title" id="yaklasan">
            {t.events.upcoming}
          </h2>
          {upcoming.length > 0 ? (
            <ul className="event-list">
              {upcoming.map((item) => {
                const status = registrationStatus(item.event, counts.get(item.id) ?? 0);
                const line = registrationLine(status, t.events);
                const open = status.kind === "open-site" || status.kind === "open-external";
                return (
                  <li key={item.id}>
                    <Link href={localePath(locale, `/etkinlikler/${item.slug}`)} className="event-item">
                      <EventDate iso={item.event.startsAt} locale={locale} size="list" />
                      <span className="event-item__text">
                        <span className="meta meta--accent">{organizer(item.event.committee)}</span>
                        <span className="event-item__title">{item.title}</span>
                        <span className="meta meta--muted event-item__facts">
                          <span>{formatEventHours(item.event, locale)}</span>
                          {item.event.location && (
                            <span className="event-item__place">
                              <PinIcon />
                              {item.event.location}
                            </span>
                          )}
                        </span>
                        {item.excerpt && <span className="excerpt">{item.excerpt}</span>}
                      </span>
                      {line && <span className={open ? "event-item__status" : "event-item__status event-item__status--off"}>{line}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-state">
              <p>{t.events.noUpcoming}</p>
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section className="container events-block" aria-labelledby="gecmis">
            <h2 className="events-block__title" id="gecmis">
              {t.events.past}
            </h2>
            <ul className="past-list">
              {past.map((item) => (
                <li key={item.id}>
                  <Link href={localePath(locale, `/etkinlikler/${item.slug}`)} className="past-row">
                    <span className="meta meta--muted">{formatEventDay(item.event.startsAt, locale)}</span>
                    <span className="past-row__title">{item.title}</span>
                    <span className="meta meta--accent">{organizer(item.event.committee)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guides.length > 0 && (
          <section className="container events-block" aria-labelledby="rehberler">
            <h2 className="events-block__title" id="rehberler">
              {t.workshops.title}
            </h2>
            <p className="events-block__lead">{t.workshops.lead}</p>
            <ul className="workshop-list">
              {guides.map((workshop) => (
                <li key={workshop.slug}>
                  <Link href={localePath(locale, `/etkinlikler/rehber/${workshop.slug}`)} className="workshop-card">
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
        )}
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
