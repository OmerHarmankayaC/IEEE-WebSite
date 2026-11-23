"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { SITE_URL, TEAM_BUCKET } from "@/lib/env";
import { CONTENT_TAG } from "@/lib/supabase/public";
import { ROLES_BY_GROUP, type RoleKey, type TeamGroup } from "@/lib/team";
import type { ActionResult } from "./actions";

const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data });
const fail = (error: string) => ({ ok: false as const, error });

/* Messages ------------------------------------------------------------------ */

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("messages").update({ status: read ? "read" : "new" }).eq("id", id);
  if (error) return fail("Mesaj güncellenemedi.");
  revalidatePath("/admin", "layout");
  return ok(undefined);
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) return fail("Mesaj silinemedi.");
  revalidatePath("/admin", "layout");
  return ok(undefined);
}

/* Event registrations ------------------------------------------------------- */

export async function deleteRegistration(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("event_registrations").delete().eq("id", id);
  if (error) return fail("Kayıt silinemedi.");
  // The remaining places shown on the site change.
  updateTag(CONTENT_TAG);
  revalidatePath("/admin/etkinlikler", "layout");
  return ok(undefined);
}

/* Board of directors ---------------------------------------------------------- */

export type MemberInput = {
  id: string | null;
  termId: string;
  team: TeamGroup;
  role: RoleKey;
  name: string;
  linkedin: string;
  photoPath: string | null;
};

const TERM_PATTERN = /^(\d{4})-(\d{4})$/;

function afterTeamChange() {
  updateTag(CONTENT_TAG);
  revalidatePath("/admin/ekip");
}

/**
 * Removes photos we uploaded once no member of any term uses them, since a person picked from an
 * earlier term shares their photo. Bundled photos under /images/team/ always stay.
 */
async function removeUnusedPhotos(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], paths: (string | null | undefined)[]) {
  const uploaded = [...new Set(paths.filter((path): path is string => Boolean(path && !path.startsWith("/"))))];
  if (uploaded.length === 0) return;
  const { data: inUse, error } = await supabase.from("team_members").select("photo_path").in("photo_path", uploaded);
  // When we cannot tell, keeping a file is safer than breaking someone's photo.
  if (error) return;
  const used = new Set((inUse ?? []).map((row) => row.photo_path));
  const unused = uploaded.filter((path) => !used.has(path));
  if (unused.length) await supabase.storage.from(TEAM_BUCKET).remove(unused);
}

export async function saveMember(input: MemberInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const name = input.name.trim();
  const linkedin = input.linkedin.trim();
  if (!name) return fail("Ad soyad boş olamaz.");
  if (name.length > 100) return fail("Ad soyad en fazla 100 karakter olabilir.");
  if (linkedin && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(linkedin)) return fail("LinkedIn adresi https://www.linkedin.com/in/... biçiminde olmalı.");
  if (!ROLES_BY_GROUP[input.team]?.includes(input.role)) return fail("Bu görev seçilen grupta kullanılamaz.");

  const row = {
    term_id: input.termId,
    team: input.team,
    role: input.role,
    name,
    linkedin: linkedin || null,
    photo_path: input.photoPath,
    sort_order: input.team === "board" ? ROLES_BY_GROUP.board.indexOf(input.role) : input.role === "leader" ? 0 : 1,
  };

  if (input.id) {
    const { data: previous } = await supabase.from("team_members").select("photo_path").eq("id", input.id).maybeSingle();
    const { error } = await supabase.from("team_members").update(row).eq("id", input.id);
    if (error) return fail("Üye kaydedilemedi.");
    if (previous && previous.photo_path !== input.photoPath) await removeUnusedPhotos(supabase, [previous.photo_path]);
    afterTeamChange();
    return ok({ id: input.id });
  }

  const { data, error } = await supabase.from("team_members").insert(row).select("id").single();
  if (error || !data) return fail("Üye eklenemedi.");
  afterTeamChange();
  return ok({ id: data.id });
}

export async function deleteMember(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: member } = await supabase.from("team_members").select("photo_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return fail("Üye silinemedi.");
  await removeUnusedPhotos(supabase, [member?.photo_path]);
  afterTeamChange();
  return ok(undefined);
}

export async function createTerm(id: string): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const term = id.trim();
  const match = TERM_PATTERN.exec(term);
  if (!match || Number(match[2]) !== Number(match[1]) + 1) return fail("Dönem 2027-2028 gibi art arda iki yıl olmalı.");
  const { error } = await supabase.from("team_terms").insert({ id: term, published: false });
  if (error) return fail(error.code === "23505" ? "Bu dönem zaten var." : "Dönem eklenemedi.");
  afterTeamChange();
  return ok({ id: term });
}

export async function setTermPublished(id: string, published: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("team_terms").update({ published }).eq("id", id);
  if (error) return fail("Dönem güncellenemedi.");
  afterTeamChange();
  return ok(undefined);
}

export async function deleteTerm(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: members } = await supabase.from("team_members").select("photo_path").eq("term_id", id);
  const { error } = await supabase.from("team_terms").delete().eq("id", id);
  if (error) return fail("Dönem silinemedi.");
  await removeUnusedPhotos(supabase, (members ?? []).map((m) => m.photo_path));
  afterTeamChange();
  return ok(undefined);
}

/* Admins ---------------------------------------------------------------------- */

export async function inviteAdmin(email: string): Promise<ActionResult<{ invited: boolean }>> {
  const { supabase } = await requireAdmin();
  const address = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return fail("Geçerli bir e-posta adresi yaz.");

  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; invited?: boolean; error?: string }>("invite-admin", {
    body: { email: address, redirectTo: `${SITE_URL}/admin/davet` },
  });
  if (error || !data?.ok) return fail("Davet gönderilemedi. Biraz sonra tekrar dene.");
  revalidatePath("/admin/yoneticiler");
  return ok({ invited: Boolean(data.invited) });
}

export async function removeAdmin(userId: string): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (userId === user.id) return fail("Kendi yöneticiliğini kaldıramazsın.");
  const { error, count } = await supabase.from("admins").delete({ count: "exact" }).eq("user_id", userId);
  if (error || !count) return fail("Yönetici kaldırılamadı.");
  revalidatePath("/admin/yoneticiler");
  return ok(undefined);
}
