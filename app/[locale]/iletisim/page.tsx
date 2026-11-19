import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "@/components/icons";
import { ContactForm } from "@/components/site/ContactForm";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  return {
    title: t.contact.title,
    description: t.meta.contactDescription,
    alternates: { canonical: localePath(locale, "/iletisim"), languages: { tr: "/iletisim", en: "/en/iletisim" } },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);

  return (
    <>
      <SiteHeader t={t} locale={locale} current="contact" />
      <main>
        <section className="page-head">
          <div className="sun" aria-hidden="true" />
          <div className="container page-head__inner">
            <Link href={localePath(locale, "/")} className="back-link">
              <ChevronLeft />
              {t.blogPage.back}
            </Link>
            <h1 className="page-title">{t.contact.title}</h1>
            <p className="page-lead">{t.contact.lead}</p>
          </div>
        </section>

        <section className="container blog-body">
          <div className="contact">
            <ContactForm t={t.contact} />
            <aside className="contact-side">
              <span className="meta meta--muted">{t.contact.orEmail}</span>
              <a href={`mailto:${site.email}`} className="btn btn--outline" style={{ alignSelf: "flex-start" }}>
                {site.email}
              </a>
              <ul className="channels">
                {site.socials.map((social) => (
                  <li key={social.href}>
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                      <span>{social.label}</span>
                      <span className="channel__handle">{social.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
