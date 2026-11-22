"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { IMAGE_BUCKET, SUPABASE_URL } from "@/lib/env";
import { istanbulToIso } from "@/lib/events";
import { isEmptyHtml, sanitizePostHtml } from "@/lib/sanitize";
import { SLUG_PATTERN, slugify } from "@/lib/slug";
import { CONTENT_TAG } from "@/lib/supabase/public";
import { getWorkshops } from "@/lib/workshops";

/** Event fields as the editor holds them: plain strings from the inputs. */
export type EventInput = {
  date: string; // YYYY-MM-DD, Istanbul
  start: string; // HH:MM
  end: string; // HH:MM or empty
  location: string;
  locationUrl: string;
  committee: "" | "cs" | "ras" | "wie";
  registration: "none" | "site" | "external";
  registrationUrl: string;
  capacity: string;
  closesDate: string;
  closesTime: string;
  guide: string;
};

export type PostInput = {
  id: string | null;
  kind: "post" | "event";
  event: EventInput;
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

/** Bundled images (paths starting with "/") ship with the site, so storage cleanup skips them. */
function storedOnly(paths: string[]): string[] {
  return paths.filter((path) => !path.startsWith("/"));
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

/** Normalizes a link typed in the editor. Only https links are kept. */
function httpsUrl(value: string): string | null | false {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" || !url.hostname.includes(".")) return false;
    return url.toString();
  } catch {
    return false;
  }
}

type EventColumns = {
  event_starts_at: string | null;
  event_ends_at: string | null;
  event_location: string | null;
  event_location_url: string | null;
  event_committee: string | null;
  event_registration: "none" | "site" | "external";
  event_registration_url: string | null;
  event_registration_closes_at: string | null;
  event_capacity: number | null;
  event_guide: string | null;
};

const NO_EVENT: EventColumns = {
  event_starts_at: null,
  event_ends_at: null,
  event_location: null,
  event_location_url: null,
  event_committee: null,
  event_registration: "none",
  event_registration_url: null,
  event_registration_closes_at: null,
  event_capacity: null,
  event_guide: null,
};

/** Checks the event fields and turns them into database columns, or explains what is wrong. */
function eventColumns(input: EventInput): { ok: true; columns: EventColumns } | { ok: false; error: string } {
  if (!input.date || !input.start) return { ok: false, error: "Etkinliğin tarihini ve başlangıç saatini gir." };
  const startsAt = istanbulToIso(input.date, input.start);
  if (!startsAt) return { ok: false, error: "Etkinliğin tarihi ya da saati geçersiz." };

  let endsAt: string | null = null;
  if (input.end) {
    endsAt = istanbulToIso(input.date, input.end);
    if (!endsAt) return { ok: false, error: "Bitiş saati geçersiz." };
    if (Date.parse(endsAt) <= Date.parse(startsAt)) return { ok: false, error: "Bitiş saati başlangıç saatinden sonra olmalı." };
  }

  const location = input.location.trim();
  if (location.length > 200) return { ok: false, error: "Yer en fazla 200 karakter olabilir." };
  const locationUrl = httpsUrl(input.locationUrl);
  if (locationUrl === false) return { ok: false, error: "Harita bağlantısı https:// ile başlayan geçerli bir adres olmalı." };

  const committee = input.committee || null;
  if (committee && !["cs", "ras", "wie"].includes(committee)) return { ok: false, error: "Geçersiz komite." };

  const guide = input.guide.trim() || null;
  if (guide && !getWorkshops().some((workshop) => workshop.slug === guide)) return { ok: false, error: "Seçilen kurulum rehberi bulunamadı." };

  let registrationUrl: string | null = null;
  if (input.registration === "external") {
    const url = httpsUrl(input.registrationUrl);
    if (!url) return { ok: false, error: "Kayıt bağlantısını https:// ile başlayan bir adres olarak gir." };
    registrationUrl = url;
  }

  let capacity: number | null = null;
  if (input.registration === "site" && input.capacity.trim()) {
    capacity = Number(input.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) return { ok: false, error: "Kontenjan 1 ile 10000 arasında bir tam sayı olmalı." };
  }

  let closesAt: string | null = null;
  if (input.registration !== "none" && (input.closesDate || input.closesTime)) {
    closesAt = istanbulToIso(input.closesDate, input.closesTime || "23:59");
    if (!closesAt) return { ok: false, error: "Kayıtların kapanacağı tarih geçersiz." };
    if (Date.parse(closesAt) > Date.parse(startsAt)) return { ok: false, error: "Kayıtlar etkinlik başlamadan önce kapanmalı." };
  }

  return {
    ok: true,
    columns: {
      event_starts_at: startsAt,
      event_ends_at: endsAt,
      event_location: location || null,
      event_location_url: locationUrl,
      event_committee: committee,
      event_registration: input.registration,
      event_registration_url: registrationUrl,
      event_registration_closes_at: closesAt,
      event_capacity: capacity,
      event_guide: guide,
    },
  };
}

export async function savePost(input: PostInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();

  const titleTr = clean(input.titleTr);
  const slug = clean(input.slug) || slugify(titleTr);
  if (!titleTr) return fail("Başlık boş olamaz.");
  if (titleTr.length > 200) return fail("Başlık en fazla 200 karakter olabilir.");
  if (!SLUG_PATTERN.test(slug)) return fail("Adres yalnızca küçük harf, rakam ve kısa çizgiden oluşabilir.");
  if (input.kind === "event" && slug === "rehber") return fail("Bu adres kurulum rehberleri için ayrıldı. Farklı bir adres yaz.");

  let event: EventColumns = NO_EVENT;
  if (input.kind === "event") {
    const checked = eventColumns(input.event);
    if (!checked.ok) return fail(checked.error);
    event = checked.columns;
  }
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
    kind: input.kind,
    ...event,
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

  // Only one post or event can be featured at a time, so the previous one steps down first.
  if (input.featured) {
    let others = supabase.from("posts").update({ featured: false }).eq("featured", true);
    if (input.id) others = others.neq("id", input.id);
    await others;
  }

  const result = input.id
    ? await supabase.from("posts").update(row).eq("id", input.id).select("id").single()
    : await supabase.from("posts").insert(row).select("id").single();

  if (result.error) {
    if (result.error.code === "23505") {
      if (result.error.message.includes("posts_one_featured_idx")) return fail("Başka bir içerik öne çıkmış durumda. Sayfayı yenileyip tekrar dene.");
      return fail("Bu adres başka bir yazıda kullanılıyor. Farklı bir adres yaz.");
    }
    console.error("savePost failed", result.error);
    return fail("Kaydedilemedi. Biraz sonra yeniden dene.");
  }
  const id = result.data.id as string;

  // Remove images that are no longer used by this post.
  if (previous) {
    const before = new Set([...(previous.cover_path ? [previous.cover_path] : []), ...imagePaths(previous.content_tr, previous.content_en)]);
    const after = new Set([...(input.coverPath ? [input.coverPath] : []), ...imagePaths(contentTr, contentEn)]);
    const unused = storedOnly([...before].filter((path) => !after.has(path)));
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

  const paths = storedOnly([...(post.cover_path ? [post.cover_path] : []), ...imagePaths(post.content_tr, post.content_en)]);
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
