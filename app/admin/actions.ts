"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { IMAGE_BUCKET, SUPABASE_URL } from "@/lib/env";
import { isEmptyHtml, sanitizePostHtml } from "@/lib/sanitize";
import { SLUG_PATTERN, slugify } from "@/lib/slug";
import { CONTENT_TAG } from "@/lib/supabase/public";

export type PostInput = {
  id: string | null;
  slug: string;
  status: "draft" | "published";
  categoryId: string | null;
  coverPath: string | null;
  featured: boolean;
  publishedDate: string | null; // YYYY-MM-DD, Istanbul time
  titleTr: string;
  excerptTr: string;
  contentTr: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
};

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });

/** Storage paths of every image of ours that appears in the given HTML. */
function imagePaths(...htmls: (string | null | undefined)[]): string[] {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${prefix}([^"'\\s?#]+)`, "g");
  const paths = new Set<string>();
  for (const html of htmls) {
    for (const match of (html ?? "").matchAll(pattern)) paths.add(decodeURIComponent(match[1]));
  }
  return [...paths];
}

function publishedAt(date: string | null): string {
  const now = new Date();
  if (!date) return now.toISOString();
  const chosen = new Date(`${date}T09:00:00+03:00`);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(now);
  // Publishing today means right now, not at 09:00.
  if (date === today) return now.toISOString();
  return chosen.toISOString();
}

const clean = (value: string) => value.trim();
const orNull = (value: string) => (value.trim() ? value.trim() : null);

export async function savePost(input: PostInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();

  const titleTr = clean(input.titleTr);
  const slug = clean(input.slug) || slugify(titleTr);
  if (!titleTr) return fail("Başlık boş olamaz.");
  if (titleTr.length > 200) return fail("Başlık en fazla 200 karakter olabilir.");
  if (!SLUG_PATTERN.test(slug)) return fail("Adres yalnızca küçük harf, rakam ve kısa çizgiden oluşabilir.");
  if (input.excerptTr.trim().length > 200 || input.excerptEn.trim().length > 200) {
    return fail("Kısa özet en fazla 200 karakter olabilir.");
  }

  const contentTr = sanitizePostHtml(input.contentTr);
  const contentEn = isEmptyHtml(input.contentEn) ? null : sanitizePostHtml(input.contentEn);

  let previous: { cover_path: string | null; content_tr: string; content_en: string | null; published_at: string | null } | null = null;
  if (input.id) {
    const { data } = await supabase
      .from("posts")
      .select("cover_path, content_tr, content_en, published_at")
      .eq("id", input.id)
      .maybeSingle();
    if (!data) return fail("Yazı bulunamadı. Silinmiş olabilir.");
    previous = data;
  }

  const row = {
    slug,
    status: input.status,
    category_id: input.categoryId,
    cover_path: input.coverPath,
    featured: input.featured,
    published_at:
      input.status === "published"
        ? input.publishedDate
          ? publishedAt(input.publishedDate)
          : (previous?.published_at ?? publishedAt(null))
        : input.publishedDate
          ? publishedAt(input.publishedDate)
          : null,
    title_tr: titleTr,
    excerpt_tr: orNull(input.excerptTr),
    content_tr: contentTr,
    title_en: orNull(input.titleEn),
    excerpt_en: orNull(input.excerptEn),
    content_en: contentEn,
  };

  const result = input.id
    ? await supabase.from("posts").update(row).eq("id", input.id).select("id").single()
    : await supabase.from("posts").insert(row).select("id").single();

  if (result.error) {
    if (result.error.code === "23505") return fail("Bu adres başka bir yazıda kullanılıyor. Farklı bir adres yaz.");
    console.error("savePost failed", result.error);
    return fail("Kaydedilemedi. Biraz sonra yeniden dene.");
  }
  const id = result.data.id as string;

  // Only one post can be featured at a time.
  if (input.featured) await supabase.from("posts").update({ featured: false }).neq("id", id).eq("featured", true);

  // Remove images that are no longer used by this post.
  if (previous) {
    const before = new Set([...(previous.cover_path ? [previous.cover_path] : []), ...imagePaths(previous.content_tr, previous.content_en)]);
    const after = new Set([...(input.coverPath ? [input.coverPath] : []), ...imagePaths(contentTr, contentEn)]);
    const unused = [...before].filter((path) => !after.has(path));
    if (unused.length) await supabase.storage.from(IMAGE_BUCKET).remove(unused);
  }

  updateTag(CONTENT_TAG);
  return { ok: true, data: { id } };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: post } = await supabase.from("posts").select("cover_path, content_tr, content_en").eq("id", id).maybeSingle();
  if (!post) return fail("Yazı bulunamadı. Daha önce silinmiş olabilir.");

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("deletePost failed", error);
    return fail("Silinemedi. Biraz sonra yeniden dene.");
  }

  const paths = [...(post.cover_path ? [post.cover_path] : []), ...imagePaths(post.content_tr, post.content_en)];
  if (paths.length) await supabase.storage.from(IMAGE_BUCKET).remove(paths);

  updateTag(CONTENT_TAG);
  return { ok: true, data: undefined };
}

export async function createCategory(name: string): Promise<ActionResult<{ id: string; name_tr: string }>> {
  const { supabase } = await requireAdmin();
  const nameTr = name.trim();
  const slug = slugify(nameTr);
  if (!nameTr || !slug) return fail("Kategori adı boş olamaz.");

  const { data, error } = await supabase.from("categories").insert({ slug, name_tr: nameTr }).select("id, name_tr").single();
  if (error) {
    if (error.code === "23505") return fail("Bu kategori zaten var.");
    console.error("createCategory failed", error);
    return fail("Kategori eklenemedi.");
  }
  updateTag(CONTENT_TAG);
  return { ok: true, data };
}

export async function signOut() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/giris");
}
