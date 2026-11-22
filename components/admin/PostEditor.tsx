"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Editor } from "@tiptap/react";
import { createCategory, deletePost, savePost, type EventInput, type PostInput } from "@/app/admin/actions";
import { publicImageUrl } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { uploadImage } from "@/lib/upload";
import { ConfirmDialog } from "./ConfirmDialog";
import { RichTextEditor } from "./RichTextEditor";

export type EditorPost = Omit<PostInput, "id"> & { id: string | null; updatedAt: string | null };
export type CategoryOption = { id: string; name_tr: string };
export type GuideOption = { slug: string; title: string };

const EXCERPT_MAX = 200;

const lengthOf = (value: string) => value.trim().length;

function formatSaved(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })
    .format(new Date(iso));
}

export function PostEditor({
  post,
  categories: initialCategories,
  guides,
  registrations,
}: {
  post: EditorPost;
  categories: CategoryOption[];
  guides: GuideOption[];
  /** How many people registered through the site, for saved events. */
  registrations: number | null;
}) {
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

  const updateEvent = <K extends keyof EventInput>(key: K, value: EventInput[K]) => {
    setForm((current) => ({ ...current, event: { ...current.event, [key]: value } }));
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
      // Posts and events are edited at different addresses; follow the kind that was saved.
      const target = form.kind === "event" ? `/admin/etkinlikler/${result.data.id}` : `/admin/yazi/${result.data.id}`;
      if (!form.id) setForm((current) => ({ ...current, id: result.data.id }));
      if (window.location.pathname !== target) router.replace(target);
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
      router.replace(isEvent ? "/admin/etkinlikler" : "/admin");
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
  const isEvent = form.kind === "event";
  const noun = isEvent ? "etkinlik" : "yazı";
  const ev = form.event;

  return (
    <div className="admin-page">
      <div className="admin-head admin-head--editor">
        <div className="stack" style={{ gap: 8 }}>
          <span className="mono mono--muted">
            <Link href={isEvent ? "/admin/etkinlikler" : "/admin"} style={{ textDecoration: "none" }}>
              {isEvent ? "Etkinlikler" : "Yazılar"}
            </Link>{" "}
            / {form.id ? "Düzenle" : isEvent ? "Yeni etkinlik" : "Yeni yazı"}
          </span>
          <span className="status-line">
            <span className={published ? "badge badge--published" : "badge badge--draft"}>{published ? "Yayında" : "Taslak"}</span>
            <span className="mono mono--muted">
              {dirty ? "Kaydedilmemiş değişiklikler var" : savedAt ? `Son kayıt: ${formatSaved(savedAt)}` : "Henüz kaydedilmedi"}
            </span>
          </span>
        </div>
        <div className="chip-row">
          {form.id && (
            <a href={`/admin/onizle/${form.id}`} target="_blank" rel="noopener" className="btn btn--outline btn--small" title="Son kaydedilen hali gösterir">
              Önizle
            </a>
          )}
          <button type="button" className="btn btn--sun btn--small" onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor…" : published ? "Kaydet ve yayınla" : "Taslağı kaydet"}
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
          <fieldset className="kind-switch">
            <legend className="field__label">Ne ekliyorsun?</legend>
            <div className="kind-switch__options">
              <label className="kind-switch__option">
                <input type="radio" name="kind" checked={!isEvent} onChange={() => update("kind", "post")} />
                Yazı
              </label>
              <label className="kind-switch__option">
                <input type="radio" name="kind" checked={isEvent} onChange={() => update("kind", "event")} />
                Etkinlik
              </label>
            </div>
            <span className="field__help">
              {isEvent
                ? "Etkinlikler sitenin Etkinlikler sayfasında listelenir. Tarih, yer ve kayıt ayarları sağ taraftadır."
                : "Yazılar blogda listelenir. Bir etkinlik duyuruyorsan Etkinlik'i seç."}
            </span>
          </fieldset>

          <div className="chip-row" role="group" aria-label="Yazının dili">
            <button type="button" className="chip" aria-pressed={lang === "tr"} onClick={() => setLang("tr")}>
              Türkçe
            </button>
            <button type="button" className="chip" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              English (isteğe bağlı)
            </button>
          </div>

          {/* Both languages stay mounted so switching tabs keeps the editors' state. */}
          <div className="stack" style={{ gap: 24 }} hidden={lang !== "tr"}>
            <label className="field">
              <span className="field__label">Başlık</span>
              <input className="input input--title" type="text" value={form.titleTr} onChange={(e) => setTitleTr(e.target.value)} placeholder={isEvent ? "Etkinliğin adı" : "Yazının başlığı"} maxLength={200} required />
            </label>
            <label className="field">
              <span className="field__label">Adres</span>
              <span className="slug-input">
                <span className="slug-input__prefix">{isEvent ? "/etkinlikler/" : "/blog/"}</span>
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
                <span>Kısa özet</span>
                <span className={lengthOf(form.excerptTr) > EXCERPT_MAX ? "counter counter--over" : "counter"}>
                  {lengthOf(form.excerptTr)} / {EXCERPT_MAX}
                </span>
              </span>
              <textarea className="input textarea" rows={3} value={form.excerptTr} onChange={(e) => update("excerptTr", e.target.value)} />
              <span className="field__help">
                {isEvent
                  ? "Ana sayfada, etkinlik listesinde ve paylaşılan bağlantıların önizlemesinde görünür."
                  : "Blog listesinde ve paylaşılan bağlantıların önizlemesinde görünür."}
              </span>
            </label>
            <div className="field">
              <span className="field__label">İçerik</span>
              <RichTextEditor lang="tr" initialHtml={post.contentTr} placeholder="Yazmaya başla…" onChange={(html) => update("contentTr", html)} />
            </div>
          </div>

          <div className="stack" style={{ gap: 24 }} hidden={lang !== "en"} lang="en">
            <p className="info-box mono">İngilizce sürüm boş kalırsa sitenin İngilizce halinde Türkçe metin gösterilir.</p>
            <label className="field">
              <span className="field__label">Title</span>
              <input className="input input--title" type="text" value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} placeholder="Post title" maxLength={200} />
            </label>
            <label className="field">
              <span className="field__label field__label--split">
                <span>Summary</span>
                <span className={lengthOf(form.excerptEn) > EXCERPT_MAX ? "counter counter--over" : "counter"}>
                  {lengthOf(form.excerptEn)} / {EXCERPT_MAX}
                </span>
              </span>
              <textarea className="input textarea" rows={3} value={form.excerptEn} onChange={(e) => update("excerptEn", e.target.value)} placeholder="Short summary for the blog list and link previews" />
            </label>
            <div className="field">
              <span className="field__label field__label--split">
                <span>Content</span>
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
          {isEvent && (
            <section className="panel panel--strong" aria-labelledby="panel-event">
              <h2 className="panel__bar" id="panel-event">
                Etkinlik bilgileri
              </h2>
              <div className="panel__body">
                <div className="field-row">
                  <label className="field">
                    <span className="field__help">Tarih</span>
                    <input className="input" type="date" value={ev.date} onChange={(e) => updateEvent("date", e.target.value)} required />
                  </label>
                </div>
                <div className="field-row field-row--two">
                  <label className="field">
                    <span className="field__help">Başlangıç</span>
                    <input className="input" type="time" value={ev.start} onChange={(e) => updateEvent("start", e.target.value)} required />
                  </label>
                  <label className="field">
                    <span className="field__help">Bitiş (isteğe bağlı)</span>
                    <input className="input" type="time" value={ev.end} onChange={(e) => updateEvent("end", e.target.value)} />
                  </label>
                </div>
                <label className="field">
                  <span className="field__help">Yer</span>
                  <input className="input" type="text" value={ev.location} onChange={(e) => updateEvent("location", e.target.value)} placeholder="Örn. TED Üniversitesi, B-201" maxLength={200} />
                </label>
                <label className="field">
                  <span className="field__help">Harita bağlantısı (isteğe bağlı)</span>
                  <input className="input" type="url" value={ev.locationUrl} onChange={(e) => updateEvent("locationUrl", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
                </label>
                <label className="field">
                  <span className="field__help">Düzenleyen</span>
                  <select className="input" value={ev.committee} onChange={(e) => updateEvent("committee", e.target.value as EventInput["committee"])}>
                    <option value="">IEEE TEDU (genel)</option>
                    <option value="cs">Computer Society</option>
                    <option value="ras">Robotics and Automation Society</option>
                    <option value="wie">Women in Engineering</option>
                  </select>
                </label>
                {guides.length > 0 && (
                  <label className="field">
                    <span className="field__help">Kurulum rehberi (isteğe bağlı)</span>
                    <select className="input" value={ev.guide} onChange={(e) => updateEvent("guide", e.target.value)}>
                      <option value="">Rehber yok</option>
                      {guides.map((guide) => (
                        <option key={guide.slug} value={guide.slug}>
                          {guide.title}
                        </option>
                      ))}
                    </select>
                    <span className="field__help">Etkinlik sayfasında, katılımcıların önceden kurması gerekenler için bağlantı olarak görünür.</span>
                  </label>
                )}
              </div>
            </section>
          )}

          {isEvent && (
            <section className="panel panel--strong" aria-labelledby="panel-registration">
              <h2 className="panel__bar" id="panel-registration">
                Kayıt
              </h2>
              <div className="panel__body">
                <fieldset className="radio-group">
                  <legend className="field__help">Katılımcılar nasıl kayıt olacak?</legend>
                  <label className="check">
                    <input type="radio" name="registration" checked={ev.registration === "none"} onChange={() => updateEvent("registration", "none")} />
                    Kayıt gerekmiyor
                  </label>
                  <label className="check">
                    <input type="radio" name="registration" checked={ev.registration === "site"} onChange={() => updateEvent("registration", "site")} />
                    Sitedeki kayıt formuyla
                  </label>
                  <label className="check">
                    <input type="radio" name="registration" checked={ev.registration === "external"} onChange={() => updateEvent("registration", "external")} />
                    Başka bir bağlantıyla (Google Forms gibi)
                  </label>
                </fieldset>
                {ev.registration === "external" && (
                  <label className="field">
                    <span className="field__help">Kayıt bağlantısı</span>
                    <input className="input" type="url" value={ev.registrationUrl} onChange={(e) => updateEvent("registrationUrl", e.target.value)} placeholder="https://forms.gle/…" required />
                  </label>
                )}
                {ev.registration === "site" && (
                  <label className="field">
                    <span className="field__help">Kontenjan (isteğe bağlı)</span>
                    <input className="input" type="number" min={1} max={10000} inputMode="numeric" value={ev.capacity} onChange={(e) => updateEvent("capacity", e.target.value)} placeholder="Sınır yok" />
                    <span className="field__help">Dolunca form kendiliğinden kapanır. Sitede kalan yer sayısı görünür.</span>
                  </label>
                )}
                {ev.registration !== "none" && (
                  <div className="field">
                    <span className="field__help">Kayıtların kapanacağı zaman (isteğe bağlı)</span>
                    <div className="field-row field-row--datetime">
                      <input className="input" type="date" aria-label="Kapanış tarihi" value={ev.closesDate} onChange={(e) => updateEvent("closesDate", e.target.value)} />
                      <input className="input" type="time" aria-label="Kapanış saati" value={ev.closesTime} onChange={(e) => updateEvent("closesTime", e.target.value)} />
                    </div>
                    <span className="field__help">Boş bırakırsan kayıtlar etkinlik başlayınca kapanır.</span>
                  </div>
                )}
                {form.id && registrations !== null && ev.registration === "site" && (
                  <Link href={`/admin/etkinlikler/${form.id}/kayitlar`} className="btn btn--outline btn--small">
                    Kayıtları gör ({registrations})
                  </Link>
                )}
              </div>
            </section>
          )}

          <section className="panel" aria-labelledby="panel-publish">
            <h2 className="panel__bar" id="panel-publish">
              Yayın
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
              <label className={form.featured ? "check check--featured" : "check"}>
                <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
                Ana sayfada öne çıkar
              </label>
              <span className="field__help">
                Ana sayfanın açılışında bu gösterilir. Aynı anda tek içerik öne çıkar; bunu seçersen öncekinin yerini alır. Hiçbiri seçili değilse tarihi gelmemiş en yakın etkinlik, o da yoksa en son yazı gösterilir.
              </span>
            </div>
          </section>

          <section className="panel" aria-labelledby="panel-category">
            <h2 className="panel__bar" id="panel-category">
              Kategori
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
              Kapak görseli
            </h2>
            <div className="panel__body">
              <div className={coverUrl ? "cover-preview" : "cover-preview hatch"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {coverUrl ? <img src={coverUrl} alt="Kapak görseli önizlemesi" /> : <span className="mono">{coverBusy ? "Yükleniyor…" : "Kapak görseli yok"}</span>}
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
              <span className="field__help">
                {isEvent
                  ? "Etkinlik sayfasının üstünde ve paylaşılan bağlantılarda görünür. Yüklenirken otomatik küçültülür."
                  : "Blog listesinde, ana sayfada ve paylaşılan bağlantılarda görünür. Yüklenirken otomatik küçültülür."}
              </span>
            </div>
          </section>

          {form.id && (
            <button type="button" className="btn btn--danger-outline btn--small" onClick={() => setConfirmDelete(true)}>
              {isEvent ? "Etkinliği sil" : "Yazıyı sil"}
            </button>
          )}
        </aside>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={`Bu ${noun} silinsin mi?`}
          body={`“${form.titleTr || "Başlıksız"}” ${noun}${isEvent ? "i, kayıtları" : "sı"} ve görselleri kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          confirmLabel={deleting ? "Siliniyor…" : "Evet, sil"}
          busy={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
