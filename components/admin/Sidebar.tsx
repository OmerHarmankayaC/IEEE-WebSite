"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { ExternalIcon, PlusIcon } from "@/components/icons";

export function Sidebar({ email, postCount, unread }: { email: string | null; postCount: number; unread: number }) {
  const pathname = usePathname();
  const isNew = pathname === "/admin/yazi/yeni";
  const isPosts = !isNew && (pathname === "/admin" || pathname.startsWith("/admin/yazi"));
  const current = (path: string) => (pathname.startsWith(path) ? "page" : undefined);

  return (
    <aside className="admin-side">
      <div className="admin-side__brand">
        <Image src="/images/brand/ieee-tedu-logo.png" alt="IEEE TED University Student Branch" width={1278} height={150} unoptimized />
        <span className="mono mono--muted">Yönetim paneli</span>
      </div>
      <nav className="admin-side__nav" aria-label="Panel menüsü">
        <Link href="/admin" aria-current={isPosts ? "page" : undefined}>
          <span>Yazılar</span>
          <span className="mono">{postCount}</span>
        </Link>
        <Link href="/admin/yazi/yeni" aria-current={isNew ? "page" : undefined}>
          <span>Yeni yazı</span>
          <PlusIcon />
        </Link>
        <Link href="/admin/ekip" aria-current={current("/admin/ekip")}>
          <span>Ekip</span>
        </Link>
        <Link href="/admin/mesajlar" aria-current={current("/admin/mesajlar")}>
          <span>Mesajlar</span>
          {unread > 0 && (
            <span className="badge badge--featured" aria-label={`${unread} okunmamış`}>
              {unread}
            </span>
          )}
        </Link>
        <Link href="/admin/yoneticiler" aria-current={current("/admin/yoneticiler")}>
          <span>Yöneticiler</span>
        </Link>
      </nav>
      <div className="admin-side__bottom">
        <a href="/" target="_blank" rel="noopener">
          <span>Siteyi görüntüle</span>
          <ExternalIcon />
        </a>
        <div className="admin-side__session">
          <span className="mono">Oturum</span>
          <span className="admin-side__email" title={email ?? undefined}>
            {email ?? "Yönetici"}
          </span>
        </div>
        <form action={signOut}>
          <button type="submit" className="admin-side__signout">
            Çıkış yap
          </button>
        </form>
      </div>
    </aside>
  );
}
