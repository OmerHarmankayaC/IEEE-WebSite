import { publicImageUrl } from "@/lib/env";
import { EVENT_FIELDS, eventPhase, toEventInfo, type EventInfo, type EventRow } from "@/lib/events";
import type { Locale } from "@/lib/i18n/dictionaries";
import { createPublicClient } from "@/lib/supabase/public";

export type CategoryRow = { slug: string; name_tr: string; name_en: string | null };

export type PostKind = "post" | "event";

type PostRow = EventRow & {
  id: string;
  kind: PostKind;
  slug: string;
  featured: boolean;
  published_at: string | null;
  cover_path: string | null;
  title_tr: string;
  title_en: string | null;
  excerpt_tr: string | null;
  excerpt_en: string | null;
  content_tr?: string;
  content_en?: string | null;
  category: CategoryRow | null;
};

export type PostSummary = {
  id: string;
  kind: PostKind;
  /** Set when kind is "event". */
  event: EventInfo | null;
  slug: string;
  featured: boolean;
  publishedAt: string | null;
  coverUrl: string | null;
  title: string;
  excerpt: string | null;
  category: { slug: string; name: string } | null;
};

export type Post = PostSummary & { contentHtml: string };

const SUMMARY_FIELDS = `id, kind, slug, featured, published_at, cover_path, title_tr, title_en, excerpt_tr, excerpt_en, ${EVENT_FIELDS}, category:categories(slug, name_tr, name_en)`;

const pick = (tr: string | null | undefined, en: string | null | undefined, locale: Locale) =>
  locale === "en" && en && en.trim() ? en : (tr ?? null);

export function categoryName(category: CategoryRow, locale: Locale): string {
  return pick(category.name_tr, category.name_en, locale) ?? category.name_tr;
}

export function toSummary(row: PostRow, locale: Locale): PostSummary {
  return {
    id: row.id,
    kind: row.kind ?? "post",
    event: row.kind === "event" ? toEventInfo(row) : null,
    slug: row.slug,
    featured: row.featured,
    publishedAt: row.published_at,
    coverUrl: publicImageUrl(row.cover_path),
    title: pick(row.title_tr, row.title_en, locale) ?? row.title_tr,
    excerpt: pick(row.excerpt_tr, row.excerpt_en, locale),
    category: row.category ? { slug: row.category.slug, name: categoryName(row.category, locale) } : null,
  };
}

export function toPost(row: PostRow, locale: Locale): Post {
  const contentEn = row.content_en && row.content_en.replace(/<[^>]*>/g, "").trim() ? row.content_en : null;
  return {
    ...toSummary(row, locale),
    contentHtml: (locale === "en" && contentEn) || row.content_tr || "",
  };
}

/**
 * Published posts and events, newest first. Row level security hides drafts and future
 * dates, so no status filter is needed here. Pass a kind to get only posts or only events.
 */
export async function getPublishedPosts(locale: Locale, kind?: PostKind): Promise<PostSummary[]> {
  try {
    let query = createPublicClient().from("posts").select(SUMMARY_FIELDS);
    if (kind) query = query.eq("kind", kind);
    const { data, error } = await query.order("published_at", { ascending: false }).returns<PostRow[]>();
    if (error) throw error;
    return (data ?? []).map((row) => toSummary(row, locale));
  } catch (error) {
    console.error("Could not load posts", error);
    return [];
  }
}

export async function getPostBySlug(slug: string, locale: Locale): Promise<Post | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("posts")
      .select(`${SUMMARY_FIELDS}, content_tr, content_en`)
      .eq("slug", slug)
      .maybeSingle<PostRow>();
    if (error) throw error;
    return data ? toPost(data, locale) : null;
  } catch (error) {
    console.error("Could not load post", slug, error);
    return null;
  }
}

export type EventSummary = PostSummary & { event: EventInfo };

const isEvent = (post: PostSummary): post is EventSummary => post.kind === "event" && post.event !== null;

/** Published events split into those still to come (soonest first) and past ones (latest first). */
export async function getEvents(locale: Locale, now = Date.now()): Promise<{ upcoming: EventSummary[]; past: EventSummary[] }> {
  const events = (await getPublishedPosts(locale, "event")).filter(isEvent);
  const upcoming = events
    .filter((item) => eventPhase(item.event, now) !== "past")
    .sort((a, b) => Date.parse(a.event.startsAt) - Date.parse(b.event.startsAt));
  const past = events
    .filter((item) => eventPhase(item.event, now) === "past")
    .sort((a, b) => Date.parse(b.event.startsAt) - Date.parse(a.event.startsAt));
  return { upcoming, past };
}

/** Number of site registrations per event id. */
export async function getRegistrationCounts(): Promise<Map<string, number>> {
  try {
    const { data, error } = await createPublicClient().rpc("event_registration_counts");
    if (error) throw error;
    return new Map((data as { post_id: string; registered: number }[] | null ?? []).map((row) => [row.post_id, row.registered]));
  } catch (error) {
    console.error("Could not load registration counts", error);
    return new Map();
  }
}

export type HeroPick = { item: PostSummary; reason: "featured" | "upcoming" | "latest" };

/**
 * What the home page hero shows: the featured post or event; if nothing is featured
 * (or the featured event is over), the next event; otherwise the latest post.
 */
export function pickHeroItem(all: PostSummary[], now = Date.now()): HeroPick | null {
  const live = (item: PostSummary) => item.kind === "post" || (item.event !== null && eventPhase(item.event, now) !== "past");
  const featured = all.find((item) => item.featured && live(item));
  if (featured) return { item: featured, reason: "featured" };
  const next = all
    .filter(isEvent)
    .filter((item) => eventPhase(item.event, now) !== "past")
    .sort((a, b) => Date.parse(a.event.startsAt) - Date.parse(b.event.startsAt))[0];
  if (next) return { item: next, reason: "upcoming" };
  const latest = all.find((item) => item.kind === "post");
  return latest ? { item: latest, reason: "latest" } : null;
}

/** Featured post first, then the rest by date. */
export function orderForDisplay(posts: PostSummary[]): PostSummary[] {
  const featured = posts.find((post) => post.featured);
  return featured ? [featured, ...posts.filter((post) => post.id !== featured.id)] : posts;
}
