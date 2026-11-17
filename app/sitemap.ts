import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts("tr");
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
