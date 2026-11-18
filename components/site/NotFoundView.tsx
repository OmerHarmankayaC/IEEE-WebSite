import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";

/** The 404 body: a yellow circle with the code, a short note and two ways out. */
export function NotFoundView({ t, locale, extra }: { t: Dictionary; locale: Locale; extra?: React.ReactNode }) {
  return (
    <main className="notfound">
      <div className="container notfound__inner">
        <div className="notfound__sun" aria-hidden="true">
          404
        </div>
        <div className="notfound__text">
          <h1 className="notfound__title">{t.notFound.title}</h1>
          <p style={{ margin: 0, maxWidth: "28em", fontSize: 19 }}>{t.notFound.lead}</p>
          <div className="hero__actions">
            <Link href={localePath(locale, "/")} className="btn btn--primary">
              {t.notFound.home}
            </Link>
            <Link href={localePath(locale, "/blog")} className="text-link">
              {t.notFound.blog}
            </Link>
            {extra}
          </div>
        </div>
      </div>
    </main>
  );
}
