import { SITE_URL } from "@/lib/env";
import { eventEnd } from "@/lib/events";
import { localePath } from "@/lib/i18n/locale";
import { getPostBySlug } from "@/lib/posts";

// A calendar file (.ics) for one event, so visitors can add it to Google, Apple or Outlook calendars.

const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** Calendar lines may be at most 75 bytes; longer ones continue on the next line after a space. */
function fold(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = new URL(request.url).searchParams.get("dil") === "en" ? "en" : "tr";
  const post = await getPostBySlug(slug, locale);
  if (!post || post.kind !== "event" || !post.event) return new Response("Not found", { status: 404 });

  const event = post.event;
  const url = `${SITE_URL}${localePath(locale, `/etkinlikler/${post.slug}`)}`;
  const description = [post.excerpt, url].filter(Boolean).join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IEEE TEDU//Etkinlikler//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${post.id}@ieee-tedu`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(Date.parse(event.startsAt))}`,
    `DTEND:${stamp(eventEnd(event))}`,
    `SUMMARY:${escape(post.title)}`,
    `DESCRIPTION:${escape(description)}`,
    ...(event.location ? [`LOCATION:${escape(event.location)}`] : []),
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${post.slug}.ics"`,
      "Cache-Control": "public, max-age=0, s-maxage=600",
    },
  });
}
