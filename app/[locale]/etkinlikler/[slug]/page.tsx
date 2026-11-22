import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventView } from "@/components/site/EventView";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getPostBySlug, getPublishedPosts, getRegistrationCounts } from "@/lib/posts";
import { getWorkshop } from "@/lib/workshops";

// Published events are rendered at build time; newer ones on their first visit, then cached.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const events = await getPublishedPosts(params.locale as Locale, "event");
  return events.map((event) => ({ slug: event.slug }));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);
  if (!post || post.kind !== "event") return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: {
      canonical: localePath(locale as Locale, `/etkinlikler/${post.slug}`),
      languages: { tr: `/etkinlikler/${post.slug}`, en: `/en/etkinlikler/${post.slug}` },
    },
    openGraph: {
      type: "website",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const [post, counts] = await Promise.all([getPostBySlug(slug, locale), getRegistrationCounts()]);
  if (!post || post.kind !== "event" || !post.event) notFound();

  const guide = post.event.guide ? getWorkshop(post.event.guide) : null;

  return (
    <>
      <SiteHeader t={t} locale={locale} current="events" />
      <main>
        <EventView
          post={post}
          event={post.event}
          registered={counts.get(post.id) ?? 0}
          guide={guide ? { slug: guide.slug, title: guide.title } : null}
          t={t}
          locale={locale}
        />
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
