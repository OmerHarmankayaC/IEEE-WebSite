import { publicImageUrl } from "@/lib/env";
import type { Locale } from "@/lib/i18n/dictionaries";
import { createPublicClient } from "@/lib/supabase/public";

export type CategoryRow = { slug: string; name_tr: string; name_en: string | null };

type PostRow = {
  id: string;
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
  slug: string;
  featured: boolean;
  publishedAt: string | null;
  coverUrl: string | null;
  title: string;
  excerpt: string | null;
  category: { slug: string; name: string } | null;
};

export type Post = PostSummary & { contentHtml: string };

const SUMMARY_FIELDS =
  "id, slug, featured, published_at, cover_path, title_tr, title_en, excerpt_tr, excerpt_en, category:categories(slug, name_tr, name_en)";

const pick = (tr: string | null | undefined, en: string | null | undefined, locale: Locale) =>
  locale === "en" && en && en.trim() ? en : (tr ?? null);

export function categoryName(category: CategoryRow, locale: Locale): string {
  return pick(category.name_tr, category.name_en, locale) ?? category.name_tr;
}

export function toSummary(row: PostRow, locale: Locale): PostSummary {
  return {
    id: row.id,
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
 * Published posts, newest first. Row level security hides drafts and future dates,
 * so no status filter is needed here.
 */
export async function getPublishedPosts(locale: Locale): Promise<PostSummary[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("posts")
      .select(SUMMARY_FIELDS)
      .order("published_at", { ascending: false })
      .returns<PostRow[]>();
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

/** Featured post first, then the rest by date. */
export function orderForDisplay(posts: PostSummary[]): PostSummary[] {
  const featured = posts.find((post) => post.featured);
  return featured ? [featured, ...posts.filter((post) => post.id !== featured.id)] : posts;
}
