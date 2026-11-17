import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/site/Article";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getI18n } from "@/lib/i18n/locale";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getI18n();
  const post = await getPostBySlug(slug, locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
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
  const { t, locale } = await getI18n();
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  const more = (await getPublishedPosts(locale)).filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <>
      <SiteHeader t={t} locale={locale} current="blog" />
      <main>
        <Article post={post} more={more} t={t} locale={locale} />
      </main>
      <FooterBand t={t} />
    </>
  );
}
