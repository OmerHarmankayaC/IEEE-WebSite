import Image from "next/image";
import Link from "next/link";
import { Cover } from "@/components/site/Cover";
import { PostMeta } from "@/components/site/PostMeta";
import { FooterBand } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TeamSection } from "@/components/site/TeamSection";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getPublishedPosts, orderForDisplay } from "@/lib/posts";
import { site } from "@/lib/site";
import { getTerms } from "@/lib/team";

export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const [allPosts, terms] = await Promise.all([getPublishedPosts(locale), getTerms()]);
  const posts = orderForDisplay(allPosts);
  const [featured, ...rest] = posts;
  const latest = rest.slice(0, 3);

  return (
    <>
      <SiteHeader t={t} locale={locale} />
      <main>
        {/* Hero */}
        <section className="hero" id="ust">
          <div className="sun" aria-hidden="true" />
          <div className="container hero__inner">
            <div className="hero__copy">
              <h1 className="hero__title">{t.hero.title}</h1>
              <p className="hero__lead">{t.hero.lead}</p>
              <div className="hero__actions">
                <Link href="#katil" className="btn btn--primary">
                  {t.hero.cta}
                </Link>
                <Link href="#blog" className="text-link">
                  {t.hero.secondary}
                </Link>
              </div>
            </div>
            <p className="hero__tagline">{t.hero.tagline}</p>
          </div>
        </section>

        {/* Optional club photo */}
        {site.heroPhoto && (
          <section className="photo-band" aria-label={t.photo.label}>
            <div className="container photo-band__inner">
              <div className="photo-band__frame">
                <Image src={site.heroPhoto.src} alt={site.heroPhoto.caption[locale]} fill sizes="(max-width: 1280px) 100vw, 1152px" />
              </div>
              <span className="meta meta--muted">{site.heroPhoto.caption[locale]}</span>
            </div>
          </section>
        )}

        {/* About */}
        <section className="section ruled" id="hakkimizda">
          <div className="container sec">
            <h2 className="vt">{t.about.title}</h2>
            <div className="stack">
              <p className="about__statement">{t.about.statement}</p>
              <div className="about__body">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
              </div>
              <ul className="activity-list">
                {t.about.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Committees */}
        <section className="section ruled" id="komiteler">
          <div className="container sec">
            <h2 className="vt">{t.committees.title}</h2>
            <div className="committee-list">
              {site.committees.map((committee) => (
                <article key={committee.id} className={`committee-card committee-card--${committee.id}`}>
                  <Image
                    className="committee-card__logo"
                    src={committee.logo}
                    alt={`${committee.name} ${t.committees.logoAlt}`}
                    width={208}
                    height={208}
                  />
                  <h3>{committee.name}</h3>
                  <p>{t.committees[committee.id]}</p>
                  <a className="committee-card__link" href={committee.instagram.href} target="_blank" rel="noopener noreferrer">
                    {committee.instagram.handle}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Latest posts */}
        <section className="section ruled" id="blog">
          <div className="container sec">
            <h2 className="vt">{t.blog.title}</h2>
            {featured ? (
              <div className="latest">
                <Link href={localePath(locale, `/blog/${featured.slug}`)} className="latest__featured">
                  <Cover src={featured.coverUrl} alt={featured.title} sizes="(max-width: 960px) 100vw, 720px" />
                  <PostMeta post={featured} locale={locale} accent />
                  <span className="post-title post-title--display">{featured.title}</span>
                  {featured.excerpt && <span className="excerpt">{featured.excerpt}</span>}
                </Link>
                <div className="latest__side">
                  {latest.length > 0 && (
                    <ul className="latest__list">
                      {latest.map((post) => (
                        <li key={post.id}>
                          <Link href={localePath(locale, `/blog/${post.slug}`)} className="post-row">
                            <PostMeta post={post} locale={locale} accent />
                            <span className="post-title">{post.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link href={localePath(locale, "/blog")} className="text-link">
                    {t.blog.all}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>{t.blog.empty}</p>
              </div>
            )}
          </div>
        </section>

        {/* Team */}
        <section className="section ruled tinted" id="ekip">
          <div className="container sec">
            <h2 className="vt">{t.team.title}</h2>
            <TeamSection t={t.team} terms={terms} />
          </div>
        </section>

        {/* Join */}
        <section className="section join" id="katil">
          <div className="container join__row">
            <div className="join__copy">
              <h2 className="join__title">{t.join.title}</h2>
              <p className="join__lead">{t.join.lead}</p>
              <div className="hero__actions">
                <Link href={localePath(locale, "/iletisim")} className="btn btn--primary">
                  {t.contact.write}
                </Link>
                <a href={`mailto:${site.email}`} className="text-link">
                  {site.email}
                </a>
              </div>
            </div>
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
          </div>
        </section>
      </main>
      <FooterBand t={t} locale={locale} />
    </>
  );
}
