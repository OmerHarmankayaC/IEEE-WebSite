import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/PostEditor";
import { emptyPost, loadCategories } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { getWorkshops } from "@/lib/workshops";

export const metadata: Metadata = { title: "Yeni yazı" };

export default async function NewPostPage() {
  const { supabase } = await requireAdmin();
  const categories = await loadCategories(supabase);
  const guides = getWorkshops().map(({ slug, title }) => ({ slug, title }));
  return <PostEditor post={emptyPost} categories={categories} guides={guides} registrations={null} />;
}
