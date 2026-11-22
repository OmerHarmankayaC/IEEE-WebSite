import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Article } from "@/components/site/Article";
import { EventView } from "@/components/site/EventView";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { requireAdmin } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { EVENT_FIELDS } from "@/lib/events";
import { toPost } from "@/lib/posts";
import { getWorkshop } from "@/lib/workshops";

export const metadata: Metadata = { title: "Önizleme" };

// Shows the last saved version of a post, drafts included, exactly as visitors will see it.
export default async function PreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ dil?: string }> }) {
  const { id } = await params;
  const { dil } = await searchParams;
  const locale = dil === "en" ? "en" : "tr";
  const t = getDictionary(locale);
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin || !/^[0-9a-f-]{36}$/.test(id)) notFound();

  const { data } = await supabase
    .from("posts")
    .select(`id, kind, slug, status, featured, published_at, cover_path, title_tr, title_en, excerpt_tr, excerpt_en, content_tr, content_en, ${EVENT_FIELDS}, category:categories(slug, name_tr, name_en)`)
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const post = toPost(data as unknown as Parameters<typeof toPost>[0], locale);
  const editHref = post.kind === "event" ? `/admin/etkinlikler/${id}` : `/admin/yazi/${id}`;
  let registered = 0;
  if (post.event) {
    const { count } = await supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("post_id", id);
    registered = count ?? 0;
  }
  const guide = post.event?.guide ? getWorkshop(post.event.guide) : null;

  return (
    <>
      <div className="preview-bar">
        <span>
          Önizleme: son kaydedilen hali ({data.status === "published" ? "yayında" : "taslak"})
        </span>
        <span className="chip-row" style={{ gap: 16 }}>
          <Link href={`/admin/onizle/${id}?dil=${locale === "en" ? "tr" : "en"}`}>{locale === "en" ? "Türkçesini gör" : "İngilizcesini gör"}</Link>
          <Link href={editHref}>Düzenlemeye dön</Link>
        </span>
      </div>
      <SiteHeader t={t} locale={locale} current={post.event ? "events" : "blog"} />
      <main>
        {post.event ? (
          <EventView
            post={post}
            event={post.event}
            registered={registered}
            guide={guide ? { slug: guide.slug, title: guide.title } : null}
            t={t}
            locale={locale}
          />
        ) : (
          <Article post={post} more={[]} t={t} locale={locale} />
        )}
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
