import type { Metadata } from "next";
import { TeamManager, type AdminMember, type AdminTerm } from "@/components/admin/TeamManager";
import { requireAdmin } from "@/lib/auth";
import { teamPhotoUrl } from "@/lib/env";
import type { MemberRow } from "@/lib/team";

export const metadata: Metadata = { title: "Ekip" };

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ donem?: string }> }) {
  const { supabase } = await requireAdmin();
  const { data: termRows } = await supabase.from("team_terms").select("id, published").order("id", { ascending: false });
  const terms: AdminTerm[] = termRows ?? [];

  const wanted = (await searchParams).donem;
  const selected = terms.find((term) => term.id === wanted) ?? terms.find((term) => term.published) ?? terms[0] ?? null;

  let members: AdminMember[] = [];
  if (selected) {
    const { data } = await supabase
      .from("team_members")
      .select("id, term_id, team, role, name, linkedin, photo_path, sort_order")
      .eq("term_id", selected.id)
      .order("sort_order")
      .order("name")
      .returns<MemberRow[]>();
    members = (data ?? []).map((row) => ({ ...row, photo_url: teamPhotoUrl(row.photo_path) }));
  }

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="admin-title">Ekip</h1>
          <span className="mono mono--muted">Ana sayfadaki yönetim kurulu bölümü. Değişiklikler sitede hemen görünür.</span>
        </div>
      </div>
      <TeamManager terms={terms} selected={selected} members={members} />
    </div>
  );
}
