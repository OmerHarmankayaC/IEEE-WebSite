import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

// Called once a day by Vercel Cron (see vercel.json). A free Supabase project pauses
// after a week without database activity; this tiny read keeps it awake.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.from("categories").select("slug", { head: true, count: "exact" });
  return Response.json({ ok: !error }, { status: error ? 500 : 200 });
}
