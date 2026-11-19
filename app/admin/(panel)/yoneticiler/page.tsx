import type { Metadata } from "next";
import { AdminsManager, type AdminRow } from "@/components/admin/AdminsManager";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Yöneticiler" };

export default async function AdminsPage() {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.rpc("list_admins");

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="admin-title">Yöneticiler</h1>
          <span className="mono mono--muted">Bu panele girebilen kişiler. Hepsi aynı yetkiye sahip.</span>
        </div>
      </div>
      <AdminsManager admins={(data ?? []) as AdminRow[]} currentUserId={user.id} />
    </div>
  );
}
