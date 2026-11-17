import type { CategoryOption, EditorPost } from "@/components/admin/PostEditor";
import type { createServerSupabase } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createServerSupabase>>;

export async function loadCategories(supabase: Client): Promise<CategoryOption[]> {
  const { data } = await supabase.from("categories").select("id, name_tr");
  return (data ?? []).sort((a, b) => a.name_tr.localeCompare(b.name_tr, "tr"));
}

/** Calendar day in Istanbul, as the date input expects it. */
export function toDateInput(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date(iso));
}

export const emptyPost: EditorPost = {
  id: null,
  slug: "",
  status: "draft",
  categoryId: null,
  coverPath: null,
  featured: false,
  publishedDate: null,
  titleTr: "",
  excerptTr: "",
  contentTr: "",
  titleEn: "",
  excerptEn: "",
  contentEn: "",
  updatedAt: null,
};

export async function loadPost(supabase: Client, id: string): Promise<EditorPost | null> {
  const { data } = await supabase
    .from("posts")
    .select("id, slug, status, category_id, cover_path, featured, published_at, title_tr, excerpt_tr, content_tr, title_en, excerpt_en, content_en, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    status: data.status,
    categoryId: data.category_id,
    coverPath: data.cover_path,
    featured: data.featured,
    publishedDate: toDateInput(data.published_at),
    titleTr: data.title_tr,
    excerptTr: data.excerpt_tr ?? "",
    contentTr: data.content_tr ?? "",
    titleEn: data.title_en ?? "",
    excerptEn: data.excerpt_en ?? "",
    contentEn: data.content_en ?? "",
    updatedAt: data.updated_at,
  };
}
