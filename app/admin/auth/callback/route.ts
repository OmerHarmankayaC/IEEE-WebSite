import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Landing point of the password reset email: trades the one-time code for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";
  const destination = next.startsWith("/admin") ? next : "/admin";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destination}`);
  }
  return NextResponse.redirect(`${origin}/admin/giris?hata=baglanti`);
}
