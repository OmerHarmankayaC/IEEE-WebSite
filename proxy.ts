import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

// Admin pages that can be opened without a session.
const PUBLIC_ADMIN_PATHS = ["/admin/giris", "/admin/sifremi-unuttum", "/admin/auth"];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // "?lang=en" or "?lang=tr" in any link switches the language and is then removed from the URL.
  const lang = searchParams.get("lang");
  if (lang === "tr" || lang === "en") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
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
  matcher: ["/((?!_next/static|_next/image|images/|api/|icon.png|apple-icon.png|sitemap.xml|robots.txt).*)"],
};
