import Link from "next/link";
import { CalendarIcon, ChevronLeft } from "@/components/icons";
import {
  COMMITTEE_NAMES,
  formatEventDay,
  formatEventHours,
  formatShortDateTime,
  registrationStatus,
  type EventInfo,
} from "@/lib/events";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import type { Post } from "@/lib/posts";
import { sanitizePostHtml } from "@/lib/sanitize";
import type { Workshop } from "@/lib/workshops";
import { Cover } from "./Cover";
import { EventDate } from "./EventDate";
import { RegistrationForm } from "./RegistrationForm";

/** An event page: the head, the content and a side panel with the details and registration. */
export function EventView({
  post,
  event,
  registered,
  guide,
  t,
  locale,
  backHref,
}: {
  post: Post;
  event: EventInfo;
  registered: number;
  guide: Pick<Workshop, "slug" | "title"> | null;
  t: Dictionary;
  locale: Locale;
  backHref?: string;
}) {
  const te = t.events;
  const status = registrationStatus(event, registered);
  const organizer = event.committee ? `IEEE TEDU ${COMMITTEE_NAMES[event.committee]}` : te.branch;
  const calendarHref = `/api/takvim/${post.slug}${locale === "en" ? "?dil=en" : ""}`;
  const hasContent = post.contentHtml.replace(/<[^>]*>/g, "").trim().length > 0;
  const year = new Date(event.startsAt).getFullYear() !== new Date().getFullYear();

  return (
    <article>
      <div className="article-head">
        <div className="container sec article-head__inner">
          <Link href={backHref ?? localePath(locale, "/etkinlikler")} className="back-link article-head__back">
            <ChevronLeft />
            {te.back}
          </Link>
          <p className="vt vt--accent">{organizer}</p>
          <div className="article-head__text">
            <h1 className="article__title">{post.title}</h1>
            {post.excerpt && <p className="article__lead">{post.excerpt}</p>}
          </div>
        </div>
      </div>

      {post.coverUrl && (
        <div className="container article__cover">
          <Cover src={post.coverUrl} alt={post.title} sizes="(max-width: 1280px) 100vw, 1152px" priority />
        </div>
      )}

      <div className="container sec article-body">
        <span className="sec__spacer" />
        <div className={hasContent ? "event-layout" : "event-layout event-layout--solo"}>
          <aside className="event-panel" id="kayit" aria-label={te.formTitle}>
            <EventDate iso={event.startsAt} locale={locale} size="panel" showYear={year} />
            <dl className="event-facts">
              <div>
                <dt>{te.date}</dt>
                <dd>{formatEventDay(event.startsAt, locale)}</dd>
              </div>
              <div>
                <dt>{te.time}</dt>
                <dd>{formatEventHours(event, locale)}</dd>
              </div>
              {event.location && (
                <div>
                  <dt>{te.place}</dt>
                  <dd>
                    {event.location}
                    {event.locationUrl && (
                      <>
                        {" "}
                        <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="event-facts__link">
                          {te.map}
                        </a>
                      </>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt>{te.organizer}</dt>
                <dd>{organizer}</dd>
              </div>
              {event.capacity !== null && event.registration === "site" && (
                <div>
                  <dt>{te.capacity}</dt>
                  <dd>{te.capacityValue.replace("{n}", String(event.capacity))}</dd>
                </div>
              )}
            </dl>

            <div className="event-panel__registration">
              {status.kind === "open-site" && (
                <>
                  <h2 className="event-panel__title">{te.formTitle}</h2>
                  {(status.remaining !== null || event.closesAt) && (
                    <p className="event-panel__note">
                      {status.remaining !== null && <strong>{te.spotsLeft.replace("{n}", String(status.remaining))}. </strong>}
                      {event.closesAt && te.closesAt.replace("{date}", formatShortDateTime(event.closesAt, locale))}
                    </p>
                  )}
                  <RegistrationForm slug={post.slug} t={te} calendarHref={calendarHref} />
                </>
              )}
              {status.kind === "open-external" && (
                <>
                  <a href={status.url} className="btn btn--sun" target="_blank" rel="noopener noreferrer">
                    {te.register}
                  </a>
                  <p className="event-panel__note">
                    {te.external}
                    {event.closesAt && ` ${te.closesAt.replace("{date}", formatShortDateTime(event.closesAt, locale))}`}
                  </p>
                </>
              )}
              {status.kind === "closed" && <p className="event-panel__state">{te.closed}</p>}
              {status.kind === "full" && <p className="event-panel__state">{te.full}</p>}
              {status.kind === "ended" && <p className="event-panel__state">{te.ended}</p>}
              {status.kind === "none" && <p className="event-panel__note">{te.noRegistration}</p>}
            </div>

            {status.kind !== "ended" && (
              <a href={calendarHref} className="btn btn--outline btn--small event-panel__calendar">
                <CalendarIcon />
                {te.addToCalendar}
              </a>
            )}

            {guide && (
              <Link href={localePath(locale, `/etkinlikler/rehber/${guide.slug}`)} className="event-panel__guide">
                <span className="meta meta--muted">{te.guide}</span>
                <span className="event-panel__guide-title" lang="tr">
                  {guide.title}
                </span>
                <span className="meta meta--muted">{te.guideLead}</span>
              </Link>
            )}
          </aside>

          {hasContent && <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.contentHtml) }} />}
        </div>
      </div>
    </article>
  );
}
