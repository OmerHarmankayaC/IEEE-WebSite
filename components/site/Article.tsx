import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath, upper } from "@/lib/i18n/locale";
import type { Post, PostSummary } from "@/lib/posts";
import { sanitizePostHtml } from "@/lib/sanitize";
import { Cover } from "./Cover";
import { PostMeta } from "./PostMeta";

export function Article({
  post,
  more,
  t,
  locale,
  backHref,
}: {
  post: Post;
  more: PostSummary[];
  t: Dictionary;
  locale: Locale;
  backHref?: string;
}) {
  return (
    <>
      <article className="article">
        <div className="container">
          <div className="article__inner">
            <div className="section-head">
              <Link href={backHref ?? localePath(locale, "/blog")} className="section-head__side" style={{ color: "var(--ink)", fontWeight: 500 }}>
                {t.post.back}
              </Link>
              <PostMeta post={post} locale={locale} />
            </div>
            <h1 className="article__title">{post.title}</h1>
            {post.excerpt && <p className="article__lead">{post.excerpt}</p>}
            {post.coverUrl && <Cover src={post.coverUrl} alt={post.title} sizes="(max-width: 860px) 100vw, 820px" priority />}
            <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.contentHtml) }} />
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="section more-posts" style={{ paddingTop: 56 }}>
          <div className="container stack">
            <div className="section-head">
              <span>{upper(t.post.more, locale)}</span>
              <Link href={localePath(locale, "/blog")} className="section-head__side">
                {upper(t.blog.all, locale)} →
              </Link>
            </div>
            <ul className="post-grid">
              {more.map((item) => (
                <li key={item.id}>
                  <Link href={localePath(locale, `/blog/${item.slug}`)} className="post-card">
                    <Cover src={item.coverUrl} alt="" sizes="(max-width: 720px) 100vw, 300px" />
                    {item.category && <span className="mono mono--accent">{upper(item.category.name, locale)}</span>}
                    <span className="post-title">{item.title}</span>
                    <PostMeta post={{ ...item, category: null }} locale={locale} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
