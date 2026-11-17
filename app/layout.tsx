import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { SITE_URL } from "@/lib/env";
import { getI18n } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale } = await getI18n();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
