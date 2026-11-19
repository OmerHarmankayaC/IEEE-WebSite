import { dateParts } from "@/lib/events";
import type { Locale } from "@/lib/i18n/dictionaries";

/** The navy date block: a large day, the month and the weekday with the start time. */
export function EventDate({
  iso,
  locale,
  size = "card",
  showYear = false,
}: {
  iso: string;
  locale: Locale;
  size?: "card" | "list" | "panel";
  showYear?: boolean;
}) {
  const parts = dateParts(iso, locale);
  return (
    <p className={`event-date event-date--${size}`}>
      <span className="event-date__day">{parts.day}</span>
      <span className="event-date__rest">
        <span className="event-date__month">
          {parts.month}
          {showYear && ` ${parts.year}`}
        </span>
        <span className="event-date__when">
          {parts.weekday}, {parts.time}
        </span>
      </span>
    </p>
  );
}
