import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Yönetim paneli", template: "%s | IEEE TEDU yönetim" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
