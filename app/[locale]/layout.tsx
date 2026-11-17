import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { SITE_URL } from "@/lib/env";
import { fontVariables } from "@/lib/fonts";
import { getDictionary, LOCALES } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locale";

// Both languages are rendered ahead of time and served from Vercel's edge cache.
// Turkish pages are reached without a prefix through the rewrites in next.config.ts.
// (No dynamicParams = false here: it would also apply to blog posts published later.)
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: "%s | IEEE TEDU" },
    description: t.meta.description,
    openGraph: {
      type: "website",
      siteName: "IEEE TEDU",
      locale: locale === "en" ? "en_US" : "tr_TR",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
