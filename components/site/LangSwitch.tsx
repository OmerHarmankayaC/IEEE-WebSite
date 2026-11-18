"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/dictionaries";
import { switchLocalePath } from "@/lib/i18n/locale";

/** TR / EN links that open the same page in the other language. */
export function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? "/";

  return (
    <div role="group" aria-label={label} className="segmented">
      {(["tr", "en"] as const).map((code) => (
        <Link key={code} href={switchLocalePath(pathname, code)} hrefLang={code} lang={code} aria-current={locale === code ? "true" : undefined}>
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
