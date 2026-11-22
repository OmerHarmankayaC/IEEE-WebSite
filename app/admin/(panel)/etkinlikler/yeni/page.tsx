import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/PostEditor";
import { emptyPost, loadCategories } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { getWorkshops } from "@/lib/workshops";

export const metadata: Metadata = { title: "Yeni etkinlik" };

export default async function NewEventPage() {
  const { supabase } = await requireAdmin();
  const categories = await loadCategories(supabase);
  const guides = getWorkshops().map(({ slug, title }) => ({ slug, title }));
  return <PostEditor post={{ ...emptyPost, kind: "event" }} categories={categories} guides={guides} registrations={null} />;
}
