import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Article } from "@/components/site/Article";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { requireAdmin } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { toPost } from "@/lib/posts";

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
    .select("id, slug, status, featured, published_at, cover_path, title_tr, title_en, excerpt_tr, excerpt_en, content_tr, content_en, category:categories(slug, name_tr, name_en)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const post = toPost(data as unknown as Parameters<typeof toPost>[0], locale);

  return (
    <>
      <div className="preview-bar">
        <span>
          ÖNİZLEME · {data.status === "published" ? "YAYINDA" : "TASLAK"} · SON KAYDEDİLEN HALİ
        </span>
        <span className="chip-row" style={{ gap: 16 }}>
          <Link href={`/admin/onizle/${id}?dil=${locale === "en" ? "tr" : "en"}`}>{locale === "en" ? "TÜRKÇESİNİ GÖR" : "İNGİLİZCESİNİ GÖR"}</Link>
          <Link href={`/admin/yazi/${id}`}>DÜZENLEMEYE DÖN →</Link>
        </span>
      </div>
      <SiteHeader t={t} locale={locale} current="blog" />
      <main>
        <Article post={post} more={[]} t={t} locale={locale} />
      </main>
      <FooterBand t={t} />
    </>
  );
}
