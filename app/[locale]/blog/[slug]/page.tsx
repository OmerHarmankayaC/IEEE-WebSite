import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Article } from "@/components/site/Article";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";

// Published posts are rendered at build time; newer ones on their first visit, then cached.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const posts = await getPublishedPosts(params.locale as Locale, "post");
  return posts.map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);
  if (!post || post.kind !== "post") return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: {
      canonical: localePath(locale as Locale, `/blog/${post.slug}`),
      languages: { tr: `/blog/${post.slug}`, en: `/en/blog/${post.slug}` },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();
  // Events have their own pages.
  if (post.kind === "event") permanentRedirect(localePath(locale, `/etkinlikler/${post.slug}`));

  const more = (await getPublishedPosts(locale, "post")).filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <>
      <SiteHeader t={t} locale={locale} current="blog" />
      <main>
        <Article post={post} more={more} t={t} locale={locale} />
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
