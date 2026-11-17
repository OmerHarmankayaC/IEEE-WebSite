import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 3600;

const both = (path: string) => ({
  url: `${SITE_URL}${path}`,
  alternates: { languages: { tr: `${SITE_URL}${path}`, en: `${SITE_URL}/en${path === "/" ? "" : path}` } },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts("tr");
  return [
    { ...both("/"), changeFrequency: "monthly", priority: 1 },
    { ...both("/blog"), changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      ...both(`/blog/${post.slug}`),
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
