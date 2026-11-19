import { teamPhotoUrl } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Board of directors. The data lives in Supabase (team_terms and team_members) and is
 * edited from the admin panel. Members are listed alphabetically on the site.
 */

export type RoleKey =
  | "president"
  | "vicePresident"
  | "leader"
  | "csMember"
  | "rasMember"
  | "wieMember"
  | "designMember"
  | "mediaMember";

export type CommitteeId = "cs" | "ras" | "wie" | "media";
export type TeamGroup = "board" | CommitteeId;

export const COMMITTEES: CommitteeId[] = ["cs", "ras", "wie", "media"];

/** Roles that fit each group, in the order the admin panel offers them. */
export const ROLES_BY_GROUP: Record<TeamGroup, RoleKey[]> = {
  board: ["president", "vicePresident"],
  cs: ["leader", "csMember"],
  ras: ["leader", "rasMember"],
  wie: ["leader", "wieMember"],
  media: ["leader", "designMember", "mediaMember"],
};

export type Member = {
  name: string;
  role: RoleKey;
  photo: string | null;
  linkedin: string | null;
};

export type Board = {
  presidential: Member[];
  committees: Record<CommitteeId, { leader: Member | null; members: Member[] }>;
};

/** A term with no members yet is shown as "to be announced". */
export type Term = { id: string; board: Board | null };

export type MemberRow = {
  id: string;
  term_id: string;
  team: TeamGroup;
  role: RoleKey;
  name: string;
  linkedin: string | null;
  photo_path: string | null;
  sort_order: number;
};

export const sortByName = (members: Member[]) => [...members].sort((a, b) => a.name.localeCompare(b.name, "tr"));

export function buildBoard(rows: MemberRow[]): Board | null {
  if (rows.length === 0) return null;
  const toMember = (row: MemberRow): Member => ({
    name: row.name,
    role: row.role,
    photo: teamPhotoUrl(row.photo_path),
    linkedin: row.linkedin,
  });
  const committees = Object.fromEntries(
    COMMITTEES.map((id) => {
      const group = rows.filter((row) => row.team === id);
      const leader = group.find((row) => row.role === "leader");
      return [id, { leader: leader ? toMember(leader) : null, members: group.filter((row) => row !== leader).map(toMember) }];
    }),
  ) as Board["committees"];
  const presidential = rows
    .filter((row) => row.team === "board")
    .sort((a, b) => a.sort_order - b.sort_order || ROLES_BY_GROUP.board.indexOf(a.role) - ROLES_BY_GROUP.board.indexOf(b.role))
    .map(toMember);
  return { presidential, committees };
}

/** Published terms, newest first. */
export async function getTerms(): Promise<Term[]> {
  const supabase = createPublicClient();
  const [{ data: terms }, { data: members }] = await Promise.all([
    supabase.from("team_terms").select("id").eq("published", true).order("id", { ascending: false }),
    supabase.from("team_members").select("id, term_id, team, role, name, linkedin, photo_path, sort_order"),
  ]);
  const rows = (members ?? []) as MemberRow[];
  return (terms ?? []).map((term) => ({ id: term.id, board: buildBoard(rows.filter((row) => row.term_id === term.id)) }));
}
