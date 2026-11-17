"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Editor } from "@tiptap/react";
import { createCategory, deletePost, savePost, type PostInput } from "@/app/admin/actions";
import { ArrowRight } from "@/components/icons";
import { publicImageUrl } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { uploadImage } from "@/lib/upload";
import { ConfirmDialog } from "./ConfirmDialog";
import { RichTextEditor } from "./RichTextEditor";

export type EditorPost = Omit<PostInput, "id"> & { id: string | null; updatedAt: string | null };
export type CategoryOption = { id: string; name_tr: string };

const EXCERPT_MAX = 200;

const lengthOf = (value: string) => value.trim().length;

function formatSaved(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })
    .format(new Date(iso))
    .toLocaleUpperCase("tr-TR");
}

export function PostEditor({ post, categories: initialCategories }: { post: EditorPost; categories: CategoryOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState(post);
  const [slugTouched, setSlugTouched] = useState(Boolean(post.id));
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [enEditor, setEnEditor] = useState<Editor | null>(null);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [savedAt, setSavedAt] = useState(post.updatedAt);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = <K extends keyof EditorPost>(key: K, value: EditorPost[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const setTitleTr = (value: string) => {
    setForm((current) => ({ ...current, titleTr: value, slug: slugTouched ? current.slug : slugify(value) }));
    setDirty(true);
  };

  const save = () => {
    setMessage(null);
    startSaving(async () => {
      const result = await savePost(form);
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      setDirty(false);
      setSavedAt(new Date().toISOString());
      setMessage({ kind: "success", text: form.status === "published" ? "Kaydedildi ve yayında." : "Taslak kaydedildi." });
      if (!form.id) {
        setForm((current) => ({ ...current, id: result.data.id }));
        router.replace(`/admin/yazi/${result.data.id}`);
      }
      router.refresh();
    });
  };

  const remove = () => {
    if (!form.id) return;
    startDeleting(async () => {
      const result = await deletePost(form.id!);
      if (!result.ok) {
        setConfirmDelete(false);
        setMessage({ kind: "error", text: result.error });
        return;
      }
      setDirty(false);
      router.replace("/admin");
      router.refresh();
    });
  };

  const addCategory = async () => {
    if (!newCategory?.trim()) return;
    const result = await createCategory(newCategory);
    if (!result.ok) {
      setMessage({ kind: "error", text: result.error });
      return;
    }
    setCategories((list) => [...list, result.data].sort((a, b) => a.name_tr.localeCompare(b.name_tr, "tr")));
    update("categoryId", result.data.id);
    setNewCategory(null);
  };

  const chooseCover = async (file: File | undefined) => {
    if (!file) return;
    setCoverBusy(true);
    setMessage(null);
    try {
      const { path } = await uploadImage(file, "covers");
      update("coverPath", path);
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Kapak görseli yüklenemedi." });
    } finally {
      setCoverBusy(false);
    }
  };

  const coverUrl = publicImageUrl(form.coverPath);
  const published = form.status === "published";

  return (
    <div className="admin-page">
      <div className="admin-head admin-head--editor">
        <div className="stack" style={{ gap: 8 }}>
          <span className="mono mono--muted">
            <Link href="/admin" style={{ textDecoration: "none" }}>
              YAZILAR
            </Link>{" "}
            / {form.id ? "DÜZENLE" : "YENİ YAZI"}
          </span>
          <span className="status-line">
            <span className={published ? "badge badge--published" : "badge badge--draft"}>{published ? "YAYINDA" : "TASLAK"}</span>
            <span className="mono mono--muted">
              {dirty ? "KAYDEDİLMEMİŞ DEĞİŞİKLİKLER VAR" : savedAt ? `SON KAYIT: ${formatSaved(savedAt)}` : "HENÜZ KAYDEDİLMEDİ"}
            </span>
          </span>
        </div>
        <div className="chip-row">
          {form.id && (
            <a href={`/admin/onizle/${form.id}`} target="_blank" rel="noopener" className="btn btn--outline btn--small" title="Son kaydedilen hali gösterir">
              Önizle
            </a>
          )}
          <button type="button" className="btn btn--primary btn--small" onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor…" : published ? "Kaydet ve yayınla" : "Taslağı kaydet"}
            {!saving && <ArrowRight />}
          </button>
        </div>
      </div>

      {message && (
        <p className={`notice notice--${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      )}

      <div className="editor-layout">
        <div className="editor-main">
          <div className="chip-row" role="group" aria-label="Yazının dili">
            <button type="button" className="chip" aria-pressed={lang === "tr"} onClick={() => setLang("tr")}>
              TÜRKÇE
            </button>
            <button type="button" className="chip" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              ENGLISH · İSTEĞE BAĞLI
            </button>
          </div>

          {/* Both languages stay mounted so switching tabs keeps the editors' state. */}
          <div className="stack" style={{ gap: 24 }} hidden={lang !== "tr"}>
            <label className="field">
              <span className="field__label">BAŞLIK</span>
              <input className="input input--title" type="text" value={form.titleTr} onChange={(e) => setTitleTr(e.target.value)} placeholder="Yazının başlığı" maxLength={200} required />
            </label>
            <label className="field">
              <span className="field__label">ADRES</span>
              <span className="slug-input">
                <span className="slug-input__prefix">/blog/</span>
                <input
                  className="input"
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  onBlur={() => update("slug", slugify(form.slug) || slugify(form.titleTr))}
                />
              </span>
            </label>
            <label className="field">
              <span className="field__label field__label--split">
                <span>KISA ÖZET</span>
                <span className={lengthOf(form.excerptTr) > EXCERPT_MAX ? "counter counter--over" : "counter"}>
                  {lengthOf(form.excerptTr)} / {EXCERPT_MAX}
                </span>
              </span>
              <textarea className="input textarea" rows={3} value={form.excerptTr} onChange={(e) => update("excerptTr", e.target.value)} />
              <span className="field__help">Blog listesinde ve paylaşılan bağlantıların önizlemesinde görünür.</span>
            </label>
            <div className="field">
              <span className="field__label">İÇERİK</span>
              <RichTextEditor lang="tr" initialHtml={post.contentTr} placeholder="Yazmaya başla…" onChange={(html) => update("contentTr", html)} />
            </div>
          </div>

          <div className="stack" style={{ gap: 24 }} hidden={lang !== "en"} lang="en">
            <p className="info-box mono">İNGİLİZCE SÜRÜM BOŞ KALIRSA SİTENİN İNGİLİZCE HALİNDE TÜRKÇE METİN GÖSTERİLİR.</p>
            <label className="field">
              <span className="field__label">TITLE</span>
              <input className="input input--title" type="text" value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} placeholder="Post title" maxLength={200} />
            </label>
            <label className="field">
              <span className="field__label field__label--split">
                <span>SUMMARY</span>
                <span className={lengthOf(form.excerptEn) > EXCERPT_MAX ? "counter counter--over" : "counter"}>
                  {lengthOf(form.excerptEn)} / {EXCERPT_MAX}
                </span>
              </span>
              <textarea className="input textarea" rows={3} value={form.excerptEn} onChange={(e) => update("excerptEn", e.target.value)} placeholder="Short summary for the blog list and link previews" />
            </label>
            <div className="field">
              <span className="field__label field__label--split">
                <span>CONTENT</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    enEditor?.commands.setContent(form.contentTr);
                    update("contentEn", form.contentTr);
                  }}
                >
                  Türkçe metni kopyala
                </button>
              </span>
              <RichTextEditor lang="en" initialHtml={post.contentEn} placeholder="Start writing the English version…" onChange={(html) => update("contentEn", html)} onReady={setEnEditor} />
            </div>
          </div>
        </div>

        <aside className="editor-side">
          <section className="panel" aria-labelledby="panel-publish">
            <h2 className="panel__bar" id="panel-publish">
              YAYIN
            </h2>
            <div className="panel__body">
              <fieldset className="radio-group">
                <legend className="field__help">Durum</legend>
                <label className="check">
                  <input type="radio" name="status" checked={!published} onChange={() => update("status", "draft")} />
                  Taslak
                </label>
                <label className="check">
                  <input type="radio" name="status" checked={published} onChange={() => update("status", "published")} />
                  Yayında
                </label>
              </fieldset>
              <label className="field">
                <span className="field__help">Yayın tarihi</span>
                <input className="input" type="date" value={form.publishedDate ?? ""} onChange={(e) => update("publishedDate", e.target.value || null)} />
                <span className="field__help">Boş bırakırsan yayınladığın an kullanılır. İleri bir tarih seçersen yazı o gün görünür.</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
                Ana sayfada öne çıkar
              </label>
            </div>
          </section>

          <section className="panel" aria-labelledby="panel-category">
            <h2 className="panel__bar" id="panel-category">
              KATEGORİ
            </h2>
            <div className="panel__body">
              <label className="field">
                <span className="field__help">Yazının kategorisi</span>
                <select className="input" value={form.categoryId ?? ""} onChange={(e) => update("categoryId", e.target.value || null)}>
                  <option value="">Kategori yok</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_tr}
                    </option>
                  ))}
                </select>
              </label>
              {newCategory === null ? (
                <button type="button" className="link-button" onClick={() => setNewCategory("")}>
                  Yeni kategori ekle
                </button>
              ) : (
                <div className="inline-form">
                  <label className="visually-hidden" htmlFor="new-category">
                    Yeni kategori adı
                  </label>
                  <input
                    id="new-category"
                    className="input"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Örn. Yarışma"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory();
                      }
                    }}
                  />
                  <button type="button" className="btn btn--outline btn--small" onClick={addCategory}>
                    Ekle
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="panel" aria-labelledby="panel-cover">
            <h2 className="panel__bar" id="panel-cover">
              KAPAK GÖRSELİ
            </h2>
            <div className="panel__body">
              <div className={coverUrl ? "cover-preview" : "cover-preview hatch"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {coverUrl ? <img src={coverUrl} alt="Kapak görseli önizlemesi" /> : <span className="mono">{coverBusy ? "YÜKLENİYOR…" : "[KAPAK GÖRSELİ YOK]"}</span>}
              </div>
              <label className="btn btn--outline btn--small file-button">
                {coverUrl ? "Görseli değiştir" : "Görsel yükle"}
                <input type="file" accept="image/*" hidden onChange={(e) => chooseCover(e.target.files?.[0])} />
              </label>
              {coverUrl && (
                <button type="button" className="link-button" onClick={() => update("coverPath", null)}>
                  Kapağı kaldır
                </button>
              )}
              <span className="field__help">Blog listesinde, ana sayfada ve paylaşılan bağlantılarda görünür. Yüklenirken otomatik küçültülür.</span>
            </div>
          </section>

          {form.id && (
            <button type="button" className="btn btn--danger-outline btn--small" onClick={() => setConfirmDelete(true)}>
              Yazıyı sil
            </button>
          )}
        </aside>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Bu yazı silinsin mi?"
          body={`“${form.titleTr || "Başlıksız yazı"}” yazısı ve görselleri kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          confirmLabel={deleting ? "Siliniyor…" : "Evet, sil"}
          busy={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
