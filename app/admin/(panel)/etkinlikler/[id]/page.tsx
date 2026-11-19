import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { loadCategories, loadPost } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { getWorkshops } from "@/lib/workshops";

export const metadata: Metadata = { title: "Etkinliği düzenle" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [post, categories, { count }] = await Promise.all([
    loadPost(supabase, id),
    loadCategories(supabase),
    supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("post_id", id),
  ]);
  if (!post) notFound();
  if (post.kind !== "event") redirect(`/admin/yazi/${id}`);
  const guides = getWorkshops().map(({ slug, title }) => ({ slug, title }));

  return <PostEditor key={post.id} post={post} categories={categories} guides={guides} registrations={count ?? 0} />;
}
