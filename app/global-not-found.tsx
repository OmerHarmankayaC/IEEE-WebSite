import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { NotFoundView } from "@/components/site/NotFoundView";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı | IEEE TEDU",
  robots: { index: false },
};

// Shown for addresses that match no page. It has no language of its own, so it
// speaks Turkish and offers the English homepage too.
export default function GlobalNotFound() {
  const t = getDictionary("tr");
  return (
    <html lang="tr" className={fontVariables}>
      <body>
        <SiteHeader t={t} locale="tr" />
        <NotFoundView
          t={t}
          locale="tr"
          extra={
            <Link href="/en" className="text-link" lang="en" hrefLang="en">
              English homepage
            </Link>
          }
        />
        <FooterBand t={t} locale="tr" />
      </body>
    </html>
  );
}
