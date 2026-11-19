import Image from "next/image";
import Link from "next/link";
import { PinIcon } from "@/components/icons";
import { eventPhase, registrationStatus } from "@/lib/events";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import type { HeroPick } from "@/lib/posts";
import { registrationLine } from "@/lib/registration-line";
import { EventDate } from "./EventDate";
import { PostMeta } from "./PostMeta";

/** The card beside the home page headline: the featured event or post. */
export function FeaturedCard({ pick, registered, t, locale }: { pick: HeroPick; registered: number; t: Dictionary; locale: Locale }) {
  const { item, reason } = pick;

  if (item.kind === "event" && item.event) {
    const event = item.event;
    const href = localePath(locale, `/etkinlikler/${item.slug}`);
    const status = registrationStatus(event, registered);
    const label = eventPhase(event) === "ongoing" ? t.events.ongoing : reason === "featured" ? t.events.featured : t.events.next;
    const line = registrationLine(status, t.events);

    return (
      <article className="feature-card" aria-labelledby="feature-title">
        <div className="feature-card__date">
          <span className="label-chip">{label}</span>
          <EventDate iso={event.startsAt} locale={locale} size="card" />
        </div>
        <div className="feature-card__body">
          <h2 className="feature-card__title" id="feature-title">
            <Link href={href}>{item.title}</Link>
          </h2>
          {event.location && (
            <p className="feature-card__place">
              <PinIcon />
              {event.location}
            </p>
          )}
          {item.excerpt && <p className="feature-card__excerpt">{item.excerpt}</p>}
          <div className="feature-card__actions">
            {status.kind === "open-site" && (
              <Link href={`${href}#kayit`} className="btn btn--sun">
                {t.events.register}
              </Link>
            )}
            {status.kind === "open-external" && (
              <a href={status.url} className="btn btn--sun" target="_blank" rel="noopener noreferrer">
                {t.events.register}
              </a>
            )}
            <Link href={href} className="text-link">
              {t.events.details}
            </Link>
          </div>
          {line && <p className="meta meta--muted feature-card__line">{line}</p>}
        </div>
      </article>
    );
  }

  const href = localePath(locale, `/blog/${item.slug}`);
  const label = reason === "featured" ? t.feature.featuredPost : t.feature.latestPost;

  return (
    <article className="feature-card" aria-labelledby="feature-title">
      {item.coverUrl ? (
        <div className="feature-card__cover">
          <Image src={item.coverUrl} alt={item.title} fill sizes="(max-width: 960px) 100vw, 460px" priority />
          <span className="label-chip feature-card__chip">{label}</span>
        </div>
      ) : null}
      <div className="feature-card__body">
        {!item.coverUrl && <span className="label-chip">{label}</span>}
        <PostMeta post={item} locale={locale} accent />
        <h2 className="feature-card__title" id="feature-title">
          <Link href={href}>{item.title}</Link>
        </h2>
        {item.excerpt && <p className="feature-card__excerpt">{item.excerpt}</p>}
        <div className="feature-card__actions">
          <Link href={href} className="text-link">
            {t.feature.readPost}
          </Link>
        </div>
      </div>
    </article>
  );
}
