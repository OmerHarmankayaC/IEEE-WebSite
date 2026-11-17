"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { PlusIcon } from "@/components/icons";

export function Sidebar({ email, postCount }: { email: string | null; postCount: number }) {
  const pathname = usePathname();
  const isNew = pathname === "/admin/yazi/yeni";

  return (
    <aside className="admin-side">
      <div className="admin-side__brand">
        <span>IEEE TEDU</span>
        <span className="mono">YÖNETİM PANELİ</span>
      </div>
      <nav className="admin-side__nav" aria-label="Panel menüsü">
        <Link href="/admin" aria-current={!isNew ? "page" : undefined}>
          <span>Yazılar</span>
          <span className="mono">{postCount}</span>
        </Link>
        <Link href="/admin/yazi/yeni" aria-current={isNew ? "page" : undefined}>
          <span>Yeni yazı</span>
          <PlusIcon />
        </Link>
      </nav>
      <div className="admin-side__bottom">
        <a href="/" target="_blank" rel="noopener">
          <span>Siteyi görüntüle</span>
          <span aria-hidden="true">↗</span>
        </a>
        <div className="admin-side__session">
          <span className="mono">OTURUM</span>
          <span>{email ?? "Yönetici"}</span>
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
