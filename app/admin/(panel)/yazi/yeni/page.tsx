import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/PostEditor";
import { emptyPost, loadCategories } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Yeni yazı" };

export default async function NewPostPage() {
  const { supabase } = await requireAdmin();
  const categories = await loadCategories(supabase);
  return <PostEditor post={emptyPost} categories={categories} />;
}
