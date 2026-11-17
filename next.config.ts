import type { NextConfig } from "next";

// Old static pages from the first version of the site, kept alive as permanent redirects.
const legacyPosts: Record<string, string> = {
  "blog-otonom-arac.html": "otonom-arac-projesi-finallerde",
  "blog-silikon-vadisi.html": "silikon-vadisinde-bir-turk-muhendis",
  "blog-savunma-sanayii.html": "savunma-sanayii-ziyareti",
  "blog-akademi.html": "akademi-bulusmalari-devam-ediyor",
  "blog-gomulu-sistemler.html": "gomulu-sistemler-ve-iot-temelleri",
};

// Paths that must never be treated as Turkish pages.
const NOT_PAGES = [
  "en(?:/|$)",
  "tr(?:/|$)",
  "admin(?:/|$)",
  "api/",
  "_next/",
  "_vercel/",
  "images/",
  "icon\\.png",
  "apple-icon\\.png",
  "sitemap\\.xml",
  "robots\\.txt",
  "favicon\\.ico",
].join("|");

const nextConfig: NextConfig = {
  experimental: {
    // The site has two root layouts ([locale] and admin), so unmatched addresses need a
    // 404 page of their own: app/global-not-found.tsx.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/blog.html", destination: "/blog", permanent: true },
      { source: "/blog-post.html", destination: "/blog", permanent: true },
      { source: "/contact.html", destination: "/#katil", permanent: true },
      ...Object.entries(legacyPosts).map(([file, slug]) => ({
        source: `/${file}`,
        destination: `/blog/${slug}`,
        permanent: true,
      })),
      // Turkish pages live at the root; the internal /tr prefix is never shown.
      { source: "/tr", destination: "/", permanent: true },
      { source: "/tr/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // Turkish pages are rendered under app/[locale] with locale "tr". These rewrites
      // run in Vercel's routing layer, so the cached pages are still served from the edge.
      beforeFiles: [
        { source: "/", destination: "/tr" },
        { source: `/:path((?!${NOT_PAGES}).+)`, destination: "/tr/:path" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
