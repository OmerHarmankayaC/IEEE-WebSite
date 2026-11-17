import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader({ t, locale, current }: { t: Dictionary; locale: Locale; current?: "blog" }) {
  const links = [
    { href: "/#hakkimizda", label: t.nav.about },
    { href: "/#komiteler", label: t.nav.committees },
    { href: "/blog", label: t.nav.blog, current: current === "blog" },
    { href: "/#ekip", label: t.nav.team },
    { href: "/#katil", label: t.nav.contact },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand" aria-label={t.nav.homeLink}>
          <Image src="/images/brand/ieee-tedu-logo.png" alt="IEEE TED University Student Branch" width={1278} height={150} priority />
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
          <Link href="/#katil" className="btn btn--primary btn--small">
            {t.nav.join}
          </Link>
        </div>
        <MobileMenu
          locale={locale}
          links={links.map(({ href, label }) => ({ href, label }))}
          labels={{ open: t.nav.openMenu, close: t.nav.closeMenu, menu: t.nav.mainMenu, language: t.nav.language, join: t.nav.join }}
        />
      </div>
    </header>
  );
}
