import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/** Signed-in user and whether they are listed in the admins table. */
export async function getSession() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { supabase, user: null, isAdmin: false } as const;

  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", claims.sub).maybeSingle();
  return {
    supabase,
    user: { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null },
    isAdmin: Boolean(row),
  } as const;
}

/** For pages and actions that only an admin may use. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session.user) redirect("/admin/giris");
  return session;
}
