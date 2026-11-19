// Invites a new admin by e-mail, or gives admin rights to someone who already has an account.
// Only signed-in admins may call it. It runs inside Supabase, so the service role key never
// leaves the platform and is not part of the website.
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// New API keys arrive as JSON objects; older projects still have the single legacy keys.
function key(legacy: string, modern: string) {
  const single = Deno.env.get(legacy);
  if (single) return single;
  try {
    const all = JSON.parse(Deno.env.get(modern) ?? "{}");
    return (all.default ?? Object.values(all)[0] ?? "") as string;
  } catch {
    return "";
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const publicKey = key("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEYS");
  const serviceKey = key("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEYS");

  // Who is calling, and are they an admin? Checked with the caller's own session.
  const caller = createClient(url, publicKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData } = await caller.auth.getUser();
  if (!userData?.user) return json({ error: "not_signed_in" }, 401);
  const { data: row } = await caller.from("admins").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (!row) return json({ error: "not_admin" }, 403);

  let body: { email?: unknown; redirectTo?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 200) return json({ error: "invalid_email" }, 400);
  const redirectTo =
    typeof body.redirectTo === "string" && /^(https:\/\/|http:\/\/localhost[:/])/.test(body.redirectTo) ? body.redirectTo : undefined;

  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  let userId: string | null = null;
  let invited = false;
  const { data: invite } = await service.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (invite?.user) {
    userId = invite.user.id;
    invited = true;
  } else {
    // The address already has an account: find it.
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      userId = data.users.find((user) => user.email?.toLowerCase() === email)?.id ?? null;
      if (data.users.length < 200) break;
    }
  }
  if (!userId) return json({ error: "invite_failed" }, 500);

  const { error } = await service.from("admins").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) return json({ error: "save_failed" }, 500);

  return json({ ok: true, invited });
});
