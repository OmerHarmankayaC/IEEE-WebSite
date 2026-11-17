import type { Locale } from "@/lib/i18n/dictionaries";
import { formatDate, upper } from "@/lib/i18n/locale";
import type { PostSummary } from "@/lib/posts";

/** "ATÖLYE · 17 KASIM 2026" style label. */
export function PostMeta({
  post,
  locale,
  prefix,
  accent = false,
}: {
  post: PostSummary;
  locale: Locale;
  prefix?: string;
  accent?: boolean;
}) {
  const parts = [prefix, post.category?.name, formatDate(post.publishedAt, locale)].filter(Boolean) as string[];
  return <span className={accent ? "mono mono--accent" : "mono mono--muted"}>{upper(parts.join(" · "), locale)}</span>;
}
