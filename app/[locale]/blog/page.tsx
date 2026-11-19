import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "@/components/icons";
import { BlogList, BlogListView, CategoryChips, CategoryChipsView } from "@/components/site/BlogList";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getPublishedPosts, orderForDisplay } from "@/lib/posts";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  return {
    title: t.meta.blogTitle,
    description: t.meta.blogDescription,
    alternates: { canonical: localePath(locale, "/blog"), languages: { tr: "/blog", en: "/en/blog" } },
  };
}

export default async function BlogPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const posts = orderForDisplay(await getPublishedPosts(locale, "post"));
  const listText = { blog: t.blog, blogPage: t.blogPage };

  return (
    <>
      <SiteHeader t={t} locale={locale} current="blog" />
      <main>
        <section className="page-head">
          <div className="container page-head__inner">
            <Link href={localePath(locale, "/")} className="back-link">
              <ChevronLeft />
              {t.blogPage.back}
            </Link>
            <h1 className="page-title">{t.blogPage.title}</h1>
            <p className="page-lead">{t.blogPage.lead}</p>
            <Suspense fallback={<CategoryChipsView posts={posts} locale={locale} t={listText} active={null} />}>
              <CategoryChips posts={posts} locale={locale} t={listText} />
            </Suspense>
          </div>
        </section>

        <section className="container blog-body" aria-label={t.blogPage.posts}>
          {/* Until the browser reads ?kategori, every post is shown. */}
          <Suspense fallback={<BlogListView posts={posts} locale={locale} t={listText} active={null} />}>
            <BlogList posts={posts} locale={locale} t={listText} />
          </Suspense>
        </section>
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
