import type { NextConfig } from "next";

// Old static pages from the first version of the site, kept alive as permanent redirects.
const legacyPosts: Record<string, string> = {
  "blog-otonom-arac.html": "otonom-arac-projesi-finallerde",
  "blog-silikon-vadisi.html": "silikon-vadisinde-bir-turk-muhendis",
  "blog-savunma-sanayii.html": "savunma-sanayii-ziyareti",
  "blog-akademi.html": "akademi-bulusmalari-devam-ediyor",
  "blog-gomulu-sistemler.html": "gomulu-sistemler-ve-iot-temelleri",
};

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
