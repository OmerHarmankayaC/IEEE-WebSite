import type { Metadata } from "next";
import Link from "next/link";
import { Cover } from "@/components/site/Cover";
import { PostMeta } from "@/components/site/PostMeta";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getI18n, upper } from "@/lib/i18n/locale";
import { getPublishedPosts, orderForDisplay } from "@/lib/posts";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.blogTitle, description: t.meta.blogDescription, alternates: { canonical: "/blog" } };
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { t, locale } = await getI18n();
  const { kategori } = await searchParams;
  const allPosts = orderForDisplay(await getPublishedPosts(locale));

  // Only categories that have at least one published post get a filter chip.
  const categories = [...new Map(allPosts.filter((p) => p.category).map((p) => [p.category!.slug, p.category!])).values()];
  const active = categories.some((c) => c.slug === kategori) ? kategori : undefined;
  const posts = active ? allPosts.filter((post) => post.category?.slug === active) : allPosts;
  const [featured, ...rest] = posts;

  return (
    <>
      <SiteHeader t={t} locale={locale} current="blog" />
      <main>
        <section className="page-head">
          <div className="container page-head__inner">
            <div className="section-head">
              <span>{t.blogPage.head}</span>
              <Link href="/" className="section-head__side">
                {t.blogPage.back}
              </Link>
            </div>
            <div className="title-row">
              <h1 className="page-title">{t.blogPage.title}</h1>
              <p className="page-lead">{t.blogPage.lead}</p>
            </div>
            {categories.length > 1 && (
              <nav className="chip-row" aria-label={t.blogPage.filter} style={{ paddingTop: 12 }}>
                <Link href="/blog" className="chip" aria-current={!active ? "page" : undefined} scroll={false}>
                  {t.blogPage.allCategories}
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/blog?kategori=${category.slug}`}
                    className="chip"
                    aria-current={active === category.slug ? "page" : undefined}
                    scroll={false}
                  >
                    {upper(category.name, locale)}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </section>

        <section className="section" aria-label={t.blogPage.posts} style={{ paddingTop: 56 }}>
          <div className="container stack" style={{ gap: 64 }}>
            {!featured && (
              <div className="empty-state">
                <p>{active ? t.blogPage.empty : t.blog.empty}</p>
              </div>
            )}

            {featured && (
              <Link href={`/blog/${featured.slug}`} className="featured-card">
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
            )}

            {rest.length > 0 && (
              <ul className="post-grid">
                {rest.map((post, index) => (
                  <li key={post.id}>
                    <Link href={`/blog/${post.slug}`} className="post-card">
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
          </div>
        </section>
      </main>
      <FooterBand t={t} />
    </>
  );
}
