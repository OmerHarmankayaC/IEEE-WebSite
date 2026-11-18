"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deletePost } from "@/app/admin/actions";
import { TrashIcon } from "@/components/icons";
import { ConfirmDialog } from "./ConfirmDialog";

export type AdminPostRow = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  category: string | null;
  date: string | null;
  coverUrl: string | null;
  featured: boolean;
};

type Filter = "all" | "published" | "draft";

export function PostsTable({ posts }: { posts: AdminPostRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<AdminPostRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();

  const counts = {
    all: posts.length,
    published: posts.filter((post) => post.status === "published").length,
    draft: posts.filter((post) => post.status === "draft").length,
  };

  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return posts.filter(
      (post) =>
        (filter === "all" || post.status === filter) &&
        (!q || post.title.toLocaleLowerCase("tr-TR").includes(q) || (post.category ?? "").toLocaleLowerCase("tr-TR").includes(q)),
    );
  }, [posts, filter, query]);

  const confirmDelete = () => {
    if (!target) return;
    startDeleting(async () => {
      const result = await deletePost(target.id);
      setTarget(null);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `Tümü (${counts.all})` },
    { id: "published", label: `Yayında (${counts.published})` },
    { id: "draft", label: `Taslak (${counts.draft})` },
  ];

  return (
    <>
      <div className="toolbar-row">
        <label className="field" style={{ flex: "0 1 360px" }}>
          <span className="field__label">Yazılarda ara</span>
          <input className="input" type="search" placeholder="Başlık ya da kategori" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="chip-row" role="group" aria-label="Duruma göre süz">
          {filters.map((item) => (
            <button key={item.id} type="button" className="chip" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}

      <div className="table-box">
        <div className="posts-table">
          <div className="posts-table__row posts-table__head" aria-hidden="true">
            <span>Başlık</span>
            <span>Kategori</span>
            <span>Durum</span>
            <span>Tarih</span>
            <span style={{ textAlign: "right" }}>İşlemler</span>
          </div>
          {shown.length === 0 ? (
            <p className="posts-table__empty">{posts.length === 0 ? "Henüz yazı yok. İlk yazını eklemek için Yeni yazı'ya bas." : "Bu aramaya uyan yazı yok."}</p>
          ) : (
            <ul className="posts-table__list">
              {shown.map((post) => (
                <li key={post.id} className="posts-table__row">
                  <span className="posts-table__title">
                    {post.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="thumb" src={post.coverUrl} alt="" />
                    ) : (
                      <span className="thumb hatch" aria-hidden="true" />
                    )}
                    <span className="stack" style={{ gap: 4, minWidth: 0 }}>
                      <Link href={`/admin/yazi/${post.id}`} className="posts-table__name">
                        {post.title}
                        {post.featured && <span className="badge badge--featured">Öne çıkan</span>}
                      </Link>
                      <span className="mono mono--muted posts-table__slug">/blog/{post.slug}</span>
                    </span>
                  </span>
                  <span className="posts-table__cell">{post.category ?? <span className="mono mono--muted">Yok</span>}</span>
                  <span className="posts-table__cell">
                    <span className={post.status === "published" ? "badge badge--published" : "badge badge--draft"}>
                      {post.status === "published" ? "Yayında" : "Taslak"}
                    </span>
                  </span>
                  <span className="posts-table__cell mono mono--muted">{post.date ?? "Yayınlanmadı"}</span>
                  <span className="posts-table__actions">
                    <Link href={`/admin/yazi/${post.id}`} className="btn btn--outline btn--small">
                      Düzenle
                    </Link>
                    <button type="button" className="icon-button icon-button--danger" aria-label={`${post.title} yazısını sil`} onClick={() => setTarget(post)}>
                      <TrashIcon />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="posts-table__foot mono mono--muted">
            <span>
              {posts.length} yazıdan {shown.length} tanesi gösteriliyor
            </span>
            <span>Görseller yüklenirken otomatik küçültülür.</span>
          </div>
        </div>
      </div>

      {target && (
        <ConfirmDialog
          title="Bu yazı silinsin mi?"
          body={`“${target.title}” yazısı ve görselleri kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          confirmLabel={deleting ? "Siliniyor…" : "Evet, sil"}
          busy={deleting}
          onCancel={() => setTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
