import type { Metadata } from "next";
import { TeamManager, type AdminMember, type AdminTerm } from "@/components/admin/TeamManager";
import { requireAdmin } from "@/lib/auth";
import { teamPhotoUrl } from "@/lib/env";
import { collectPeople, type MemberRow } from "@/lib/team";

export const metadata: Metadata = { title: "Ekip" };

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ donem?: string }> }) {
  const { supabase } = await requireAdmin();
  const [{ data: termRows }, { data: memberRows }] = await Promise.all([
    supabase.from("team_terms").select("id, published").order("id", { ascending: false }),
    // Every term, so a new member can be picked from the people of earlier terms.
    supabase
      .from("team_members")
      .select("id, term_id, team, role, name, linkedin, photo_path, sort_order")
      .order("sort_order")
      .order("name")
      .returns<MemberRow[]>(),
  ]);
  const terms: AdminTerm[] = termRows ?? [];
  const rows = memberRows ?? [];

  const wanted = (await searchParams).donem;
  const selected = terms.find((term) => term.id === wanted) ?? terms.find((term) => term.published) ?? terms[0] ?? null;

  const members: AdminMember[] = selected
    ? rows.filter((row) => row.term_id === selected.id).map((row) => ({ ...row, photo_url: teamPhotoUrl(row.photo_path) }))
    : [];

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="admin-title">Ekip</h1>
          <span className="mono mono--muted">Ana sayfadaki yönetim kurulu bölümü. Değişiklikler sitede hemen görünür.</span>
        </div>
      </div>
      <TeamManager terms={terms} selected={selected} members={members} people={collectPeople(rows)} />
    </div>
  );
}
