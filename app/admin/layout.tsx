import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";
import { SITE_URL } from "@/lib/env";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Yönetim paneli", template: "%s | IEEE TEDU yönetim" },
  robots: { index: false, follow: false },
};

// The admin panel has its own root layout: it is Turkish only and always rendered per request.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
