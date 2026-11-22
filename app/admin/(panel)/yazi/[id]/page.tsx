import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { loadCategories, loadPost } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { getWorkshops } from "@/lib/workshops";

export const metadata: Metadata = { title: "Yazıyı düzenle" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [post, categories] = await Promise.all([loadPost(supabase, id), loadCategories(supabase)]);
  if (!post) notFound();
  if (post.kind === "event") redirect(`/admin/etkinlikler/${id}`);
  const guides = getWorkshops().map(({ slug, title }) => ({ slug, title }));

  // The key resets the editor when another post is opened.
  return <PostEditor key={post.id} post={post} categories={categories} guides={guides} registrations={null} />;
}
