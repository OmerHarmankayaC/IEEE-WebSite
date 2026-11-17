"use client";

import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LangSwitch({ locale, label, dark = false }: { locale: Locale; label: string; dark?: boolean }) {
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => setLocale(next));
  };

  return (
    <div role="group" aria-label={label} aria-busy={pending} className={dark ? "lang-switch lang-switch--dark" : "lang-switch"}>
      {(["tr", "en"] as const).map((code) => (
        <button key={code} type="button" lang={code} aria-pressed={locale === code} onClick={() => choose(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
