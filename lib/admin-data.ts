import type { EventInput } from "@/app/admin/actions";
import type { CategoryOption, EditorPost } from "@/components/admin/PostEditor";
import { EVENT_FIELDS, isoToIstanbulInputs, type EventRow } from "@/lib/events";
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

export const emptyEvent: EventInput = {
  date: "",
  start: "",
  end: "",
  location: "",
  locationUrl: "",
  committee: "",
  registration: "none",
  registrationUrl: "",
  capacity: "",
  closesDate: "",
  closesTime: "",
  guide: "",
};

function toEventInput(row: EventRow): EventInput {
  const start = isoToIstanbulInputs(row.event_starts_at);
  const closes = isoToIstanbulInputs(row.event_registration_closes_at);
  const committee = row.event_committee === "cs" || row.event_committee === "ras" || row.event_committee === "wie" ? row.event_committee : "";
  return {
    date: start.date,
    start: start.time,
    end: isoToIstanbulInputs(row.event_ends_at).time,
    location: row.event_location ?? "",
    locationUrl: row.event_location_url ?? "",
    committee,
    registration: row.event_registration ?? "none",
    registrationUrl: row.event_registration_url ?? "",
    capacity: row.event_capacity === null ? "" : String(row.event_capacity),
    closesDate: closes.date,
    closesTime: closes.time,
    guide: row.event_guide ?? "",
  };
}

export const emptyPost: EditorPost = {
  id: null,
  kind: "post",
  event: emptyEvent,
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
    .select(`id, kind, slug, status, category_id, cover_path, featured, published_at, title_tr, excerpt_tr, content_tr, title_en, excerpt_en, content_en, updated_at, ${EVENT_FIELDS}`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    kind: data.kind,
    event: data.kind === "event" ? toEventInput(data as unknown as EventRow) : emptyEvent,
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
