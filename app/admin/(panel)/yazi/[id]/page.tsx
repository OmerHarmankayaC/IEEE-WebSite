import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { loadCategories, loadPost } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Yazıyı düzenle" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [post, categories] = await Promise.all([loadPost(supabase, id), loadCategories(supabase)]);
  if (!post) notFound();

  // The key resets the editor when another post is opened.
  return <PostEditor key={post.id} post={post} categories={categories} />;
}
