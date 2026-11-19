import Link from "next/link";
import { ChevronLeft } from "@/components/icons";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { formatDate, localePath } from "@/lib/i18n/locale";
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
  const date = formatDate(post.publishedAt, locale);

  return (
    <>
      <article>
        <div className="article-head">
          <div className="container sec article-head__inner">
            <Link href={backHref ?? localePath(locale, "/blog")} className="back-link article-head__back">
              <ChevronLeft />
              {t.post.back}
            </Link>
            {post.category ? <p className="vt vt--accent">{post.category.name}</p> : <span className="sec__spacer" />}
            <div className="article-head__text">
              <h1 className="article__title">{post.title}</h1>
              {post.excerpt && <p className="article__lead">{post.excerpt}</p>}
              {date && <p className="meta meta--muted" style={{ margin: 0 }}>{date}</p>}
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
          <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.contentHtml) }} />
        </div>
      </article>

      {more.length > 0 && (
        <section className="section ruled tinted more-posts" aria-labelledby="more-posts">
          <div className="container sec">
            <h2 className="vt" id="more-posts">
              {t.post.more}
            </h2>
            <div className="stack" style={{ gap: 28 }}>
              <ul className="post-grid">
                {more.map((item) => (
                  <li key={item.id}>
                    <Link href={localePath(locale, `/blog/${item.slug}`)} className="post-card">
                      <PostMeta post={item} locale={locale} accent />
                      <span className="post-title">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={localePath(locale, "/blog")} className="text-link">
                {t.blog.all}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
