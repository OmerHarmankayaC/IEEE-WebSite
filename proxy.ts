import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { switchLocalePath } from "@/lib/i18n/locale";

// Admin pages that can be opened without a session.
const PUBLIC_ADMIN_PATHS = ["/admin/giris", "/admin/sifremi-unuttum", "/admin/auth"];

// Runs only for /admin and for links that carry ?lang= (see config below), so public
// pages never wait for it and stay fully cached.
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Links from the old site used "?lang=en". Send them to the matching address.
  const lang = searchParams.get("lang");
  if ((lang === "tr" || lang === "en") && !pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    url.pathname = switchLocalePath(pathname, lang);
    return NextResponse.redirect(url, 308);
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Keep the Supabase session fresh for admin pages.
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));
  if (!data?.claims && !isPublicAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/giris";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    { source: "/((?!_next/|images/|api/).*)", has: [{ type: "query", key: "lang" }] },
  ],
};
