import type { Locale } from "@/lib/i18n/dictionaries";

export type CommitteeCode = "cs" | "ras" | "wie";
export type RegistrationMode = "none" | "site" | "external";

/** Event details of a post whose kind is "event". */
export type EventInfo = {
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  locationUrl: string | null;
  committee: CommitteeCode | null;
  registration: RegistrationMode;
  registrationUrl: string | null;
  closesAt: string | null;
  capacity: number | null;
  guide: string | null;
};

export type EventRow = {
  event_starts_at: string | null;
  event_ends_at: string | null;
  event_location: string | null;
  event_location_url: string | null;
  event_committee: string | null;
  event_registration: RegistrationMode | null;
  event_registration_url: string | null;
  event_registration_closes_at: string | null;
  event_capacity: number | null;
  event_guide: string | null;
};

export const EVENT_FIELDS =
  "event_starts_at, event_ends_at, event_location, event_location_url, event_committee, event_registration, event_registration_url, event_registration_closes_at, event_capacity, event_guide";

export const COMMITTEE_NAMES: Record<CommitteeCode, string> = {
  cs: "Computer Society",
  ras: "Robotics and Automation Society",
  wie: "Women in Engineering",
};

const isCommittee = (value: string | null): value is CommitteeCode => value === "cs" || value === "ras" || value === "wie";

export function toEventInfo(row: EventRow): EventInfo | null {
  if (!row.event_starts_at) return null;
  return {
    startsAt: row.event_starts_at,
    endsAt: row.event_ends_at,
    location: row.event_location,
    locationUrl: row.event_location_url,
    committee: isCommittee(row.event_committee) ? row.event_committee : null,
    registration: row.event_registration ?? "none",
    registrationUrl: row.event_registration_url,
    closesAt: row.event_registration_closes_at,
    capacity: row.event_capacity,
    guide: row.event_guide,
  };
}

/** Events without an end time are treated as lasting three hours. */
const DEFAULT_LENGTH_MS = 3 * 60 * 60 * 1000;

export function eventEnd(event: EventInfo): number {
  return event.endsAt ? Date.parse(event.endsAt) : Date.parse(event.startsAt) + DEFAULT_LENGTH_MS;
}

export type EventPhase = "upcoming" | "ongoing" | "past";

export function eventPhase(event: EventInfo, now = Date.now()): EventPhase {
  if (now < Date.parse(event.startsAt)) return "upcoming";
  if (now < eventEnd(event)) return "ongoing";
  return "past";
}

export type RegistrationStatus =
  | { kind: "none" }
  | { kind: "open-site"; remaining: number | null }
  | { kind: "open-external"; url: string }
  | { kind: "closed" }
  | { kind: "full" }
  | { kind: "ended" };

/** What the registration part of an event should show right now. */
export function registrationStatus(event: EventInfo, registered: number, now = Date.now()): RegistrationStatus {
  if (eventPhase(event, now) === "past") return { kind: "ended" };
  if (event.registration === "none") return { kind: "none" };
  const closes = Date.parse(event.closesAt ?? event.startsAt);
  if (now >= closes) return { kind: "closed" };
  if (event.registration === "external") {
    return event.registrationUrl ? { kind: "open-external", url: event.registrationUrl } : { kind: "none" };
  }
  if (event.capacity !== null && registered >= event.capacity) return { kind: "full" };
  return { kind: "open-site", remaining: event.capacity === null ? null : event.capacity - registered };
}

const TZ = "Europe/Istanbul";
const tag = (locale: Locale) => (locale === "en" ? "en-US" : "tr-TR");

/** Parts of the start date, for the large date block. */
export function dateParts(iso: string, locale: Locale) {
  const date = new Date(iso);
  const part = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(tag(locale), { ...options, timeZone: TZ }).format(date);
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "long" }),
    year: part({ year: "numeric" }),
    weekday: part({ weekday: "long" }),
    time: formatTime(iso, locale),
  };
}

export function formatTime(iso: string, locale: Locale): string {
  const hour = locale === "en" ? "numeric" : "2-digit";
  return new Intl.DateTimeFormat(tag(locale), { hour, minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

/** "26 Kasım 2026, Perşembe" */
export function formatEventDay(iso: string, locale: Locale): string {
  const p = dateParts(iso, locale);
  return locale === "en" ? `${p.weekday}, ${p.month} ${p.day}, ${p.year}` : `${p.day} ${p.month} ${p.year}, ${p.weekday}`;
}

/** "18:00 ile 20:00 arası", or just the start time. */
export function formatEventHours(event: EventInfo, locale: Locale): string {
  const start = formatTime(event.startsAt, locale);
  if (!event.endsAt) return start;
  const end = formatTime(event.endsAt, locale);
  return locale === "en" ? `${start} to ${end}` : `${start} ile ${end} arası`;
}

/** "26 Kasım, 18:00": short form for deadlines. */
export function formatShortDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

/** Converts a date and a time typed in Istanbul into an ISO timestamp. Turkey stays on UTC+3 all year. */
export function istanbulToIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const parsed = new Date(`${date}T${time}:00+03:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** The date and time inputs for an ISO timestamp, in Istanbul time. */
export function isoToIstanbulInputs(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const date = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date),
    time: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ }).format(date),
  };
}
