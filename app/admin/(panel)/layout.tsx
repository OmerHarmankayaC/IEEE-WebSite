import { signOut } from "@/app/admin/actions";
import { AuthShell } from "@/components/admin/AuthShell";
import { Sidebar } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return (
      <AuthShell title="Yetki yok" lead={`${user.email ?? "Bu hesap"} ile giriş yaptın ama bu hesabın yönetici yetkisi yok.`}>
        <form action={signOut}>
          <button type="submit" className="btn btn--outline" style={{ width: "100%" }}>
            Çıkış yap
          </button>
        </form>
      </AuthShell>
    );
  }

  const [{ count }, { count: eventCount }, { count: unread }] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("kind", "post"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("kind", "event"),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return (
    <div className="admin-shell">
      <Sidebar email={user.email} postCount={count ?? 0} eventCount={eventCount ?? 0} unread={unread ?? 0} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
