import { LOCALES, type Locale } from "./dictionaries";

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

/**
 * Public address of a page in the given language. Turkish lives at the root,
 * English under /en: localePath("en", "/blog") is "/en/blog".
 */
export function localePath(locale: Locale, path = "/"): string {
  if (locale === "tr") return path;
  if (path === "/") return "/en";
  return path.startsWith("/#") ? `/en${path.slice(1)}` : `/en${path}`;
}

/** The same page in the other language, given the current browser path. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const bare = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return localePath(target, bare || "/");
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
