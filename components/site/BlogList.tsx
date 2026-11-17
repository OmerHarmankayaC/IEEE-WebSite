"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath, upper } from "@/lib/i18n/locale";
import type { PostSummary } from "@/lib/posts";
import { Cover } from "./Cover";
import { PostMeta } from "./PostMeta";

type Props = { posts: PostSummary[]; locale: Locale; t: Pick<Dictionary, "blog" | "blogPage"> };
type ViewProps = Props & { active: string | null };

// Filtering happens in the browser so the page itself stays cached at the edge.
// The *View components render without reading the URL and are used as the
// pre-rendered fallback; the hook versions take over once the browser loads.

export function CategoryChips(props: Props) {
  return <CategoryChipsView {...props} active={useSearchParams().get("kategori")} />;
}

export function BlogList(props: Props) {
  return <BlogListView {...props} active={useSearchParams().get("kategori")} />;
}

export function CategoryChipsView({ posts, locale, t, active }: ViewProps) {
  const categories = [...new Map(posts.filter((p) => p.category).map((p) => [p.category!.slug, p.category!])).values()];
  if (categories.length < 2) return null;
  const base = localePath(locale, "/blog");

  return (
    <nav className="chip-row" aria-label={t.blogPage.filter} style={{ paddingTop: 12 }}>
      <Link href={base} className="chip" aria-current={!active ? "page" : undefined} scroll={false}>
        {t.blogPage.allCategories}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`${base}?kategori=${category.slug}`}
          className="chip"
          aria-current={active === category.slug ? "page" : undefined}
          scroll={false}
        >
          {upper(category.name, locale)}
        </Link>
      ))}
    </nav>
  );
}

export function BlogListView({ posts: allPosts, locale, t, active }: ViewProps) {
  const posts = active ? allPosts.filter((post) => post.category?.slug === active) : allPosts;
  const [featured, ...rest] = posts;

  if (!featured) {
    return (
      <div className="empty-state">
        <p>{active ? t.blogPage.empty : t.blog.empty}</p>
      </div>
    );
  }

  return (
    <>
      <Link href={localePath(locale, `/blog/${featured.slug}`)} className="featured-card">
        <Cover src={featured.coverUrl} alt={featured.title} sizes="(max-width: 960px) 100vw, 760px" priority />
        <span className="featured-card__text">
          <PostMeta post={{ ...featured, publishedAt: null }} locale={locale} prefix={t.blogPage.featured} accent />
          <span className="post-title">{featured.title}</span>
          {featured.excerpt && <span className="excerpt">{featured.excerpt}</span>}
          <span className="featured-card__foot mono mono--muted">
            <PostMeta post={{ ...featured, category: null }} locale={locale} />
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>{t.blog.read}</span>
          </span>
        </span>
      </Link>

      {rest.length > 0 && (
        <ul className="post-grid">
          {rest.map((post, index) => (
            <li key={post.id}>
              <Link href={localePath(locale, `/blog/${post.slug}`)} className="post-card">
                <span className="mono mono--muted">{String(index + 1).padStart(2, "0")}</span>
                <Cover src={post.coverUrl} alt="" sizes="(max-width: 720px) 100vw, 300px" />
                {post.category && <span className="mono mono--accent">{upper(post.category.name, locale)}</span>}
                <span className="post-title">{post.title}</span>
                {post.excerpt && <span className="post-card__excerpt">{post.excerpt}</span>}
                <PostMeta post={{ ...post, category: null }} locale={locale} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
