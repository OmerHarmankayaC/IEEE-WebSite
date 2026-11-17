import type { Metadata } from "next";
import Link from "next/link";
import { PostsTable, type AdminPostRow } from "@/components/admin/PostsTable";
import { PlusIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { publicImageUrl } from "@/lib/env";

export const metadata: Metadata = { title: "Yazılar" };

type Row = {
  id: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
  cover_path: string | null;
  title_tr: string;
  category: { name_tr: string } | null;
};

export default async function PostsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, status, featured, published_at, cover_path, title_tr, category:categories(name_tr)")
    .order("updated_at", { ascending: false })
    .returns<Row[]>();

  const formatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
  const posts: AdminPostRow[] = (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title_tr,
    status: row.status,
    featured: row.featured,
    category: row.category?.name_tr ?? null,
    date: row.published_at ? formatter.format(new Date(row.published_at)).toLocaleUpperCase("tr-TR") : null,
    coverUrl: publicImageUrl(row.cover_path),
  }));

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="stack" style={{ gap: 10 }}>
          <span className="mono mono--muted">BLOG / YAZILAR</span>
          <h1 className="admin-title">Yazılar</h1>
        </div>
        <Link href="/admin/yazi/yeni" className="btn btn--primary btn--small">
          <PlusIcon />
          Yeni yazı
        </Link>
      </div>
      <PostsTable posts={posts} />
    </div>
  );
}
