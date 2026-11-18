import type { Locale } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/locale";
import type { PostSummary } from "@/lib/posts";

/** Category and date, side by side. */
export function PostMeta({ post, locale, accent = false }: { post: PostSummary; locale: Locale; accent?: boolean }) {
  const date = formatDate(post.publishedAt, locale);
  if (!post.category && !date) return null;
  return (
    <span className={accent ? "meta meta--accent" : "meta meta--muted"}>
      {post.category && <span>{post.category.name}</span>}
      {date && <span>{date}</span>}
    </span>
  );
}
