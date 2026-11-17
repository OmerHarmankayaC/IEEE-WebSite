import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE)?.value === "en" ? "en" : "tr";
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}

export function formatDate(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

/** Upper case that respects Turkish dotted and dotless i. */
export function upper(text: string, locale: Locale): string {
  return text.toLocaleUpperCase(locale === "en" ? "en-US" : "tr-TR");
}
