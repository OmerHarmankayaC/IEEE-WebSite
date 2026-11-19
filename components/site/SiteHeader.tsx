import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader({ t, locale, current }: { t: Dictionary; locale: Locale; current?: "blog" | "workshops" | "contact" }) {
  const links = [
    { href: localePath(locale, "/#hakkimizda"), label: t.nav.about },
    { href: localePath(locale, "/#komiteler"), label: t.nav.committees },
    { href: localePath(locale, "/blog"), label: t.nav.blog, current: current === "blog" },
    { href: localePath(locale, "/atolyeler"), label: t.nav.workshops, current: current === "workshops" },
    { href: localePath(locale, "/#ekip"), label: t.nav.team },
    { href: localePath(locale, "/iletisim"), label: t.nav.contact, current: current === "contact" },
  ];
  const joinHref = localePath(locale, "/#katil");

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href={localePath(locale, "/")} className="brand" aria-label={t.nav.homeLink}>
          <Image src="/images/brand/ieee-tedu-logo.png" alt="IEEE TED University Student Branch" width={1278} height={150} unoptimized priority />
        </Link>
        <nav className="site-nav" aria-label={t.nav.mainMenu}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={link.current ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <LangSwitch locale={locale} label={t.nav.language} />
          <Link href={joinHref} className="btn btn--sun btn--small">
            {t.nav.join}
          </Link>
        </div>
        <MobileMenu
          locale={locale}
          joinHref={joinHref}
          links={links.map(({ href, label }) => ({ href, label }))}
          labels={{ open: t.nav.openMenu, close: t.nav.closeMenu, menu: t.nav.mainMenu, language: t.nav.language, join: t.nav.join, menuButton: t.nav.menu, closeButton: t.nav.close }}
        />
      </div>
    </header>
  );
}
