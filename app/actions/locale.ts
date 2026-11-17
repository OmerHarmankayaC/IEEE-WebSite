"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/dictionaries";

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale === "en" ? "en" : "tr", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
