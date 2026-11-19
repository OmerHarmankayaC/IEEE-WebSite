import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getPublishedPosts } from "@/lib/posts";
import { getWorkshops } from "@/lib/workshops";

export const revalidate = 3600;

const both = (path: string) => ({
  url: `${SITE_URL}${path}`,
  alternates: { languages: { tr: `${SITE_URL}${path}`, en: `${SITE_URL}/en${path === "/" ? "" : path}` } },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getPublishedPosts("tr");
  const posts = all.filter((item) => item.kind === "post");
  const events = all.filter((item) => item.kind === "event");
  return [
    { ...both("/"), changeFrequency: "monthly", priority: 1 },
    { ...both("/blog"), changeFrequency: "weekly", priority: 0.8 },
    { ...both("/etkinlikler"), changeFrequency: "weekly", priority: 0.8 },
    ...events.map((event) => ({
      ...both(`/etkinlikler/${event.slug}`),
      lastModified: event.publishedAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...getWorkshops().map((workshop) => ({ ...both(`/etkinlikler/rehber/${workshop.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    { ...both("/iletisim"), changeFrequency: "yearly", priority: 0.5 },
    ...posts.map((post) => ({
      ...both(`/blog/${post.slug}`),
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
