import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Crosshair } from "@/components/icons";
import { Cover } from "@/components/site/Cover";
import { PostMeta } from "@/components/site/PostMeta";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TeamSection } from "@/components/site/TeamSection";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale";
import { getPublishedPosts, orderForDisplay } from "@/lib/posts";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const posts = orderForDisplay(await getPublishedPosts(locale));
  const [featured, ...rest] = posts;
  const latest = rest.slice(0, 3);

  return (
    <>
      <SiteHeader t={t} locale={locale} />
      <main>
        {/* Hero */}
        <section className="hero" id="ust">
          <div className="container hero__inner">
            <div className="hero__copy">
              <p className="hero__eyebrow">{t.hero.eyebrow}</p>
              <h1 className="hero__title">
                {t.hero.titleStart} <span className="accent">{t.hero.titleAccent}</span>
              </h1>
              <p className="hero__lead">{t.hero.lead}</p>
              <div className="hero__actions">
                <Link href="#katil" className="btn btn--primary">
                  {t.hero.cta}
                  <ArrowRight />
                </Link>
                <Link href="#blog" className="text-link">
                  {t.hero.secondary}
                </Link>
              </div>
            </div>
            <aside className="colophon" aria-label={t.colophon.label}>
              <div className="colophon__bar colophon__bar--top">
                <span>{t.colophon.title}</span>
                <span>{t.colophon.sheet}</span>
              </div>
              <dl>
                <dt>{t.colophon.institution}</dt>
                <dd>{t.colophon.institutionValue}</dd>
                <dt>{t.colophon.committees}</dt>
                <dd>CS · RAS · WIE</dd>
                <dt>{t.colophon.term}</dt>
                <dd>{site.currentTerm}</dd>
                <dt>{t.colophon.network}</dt>
                <dd>{t.colophon.networkValue}</dd>
                <dt>{t.colophon.email}</dt>
                <dd>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </dl>
              <div className="colophon__bar colophon__bar--bottom">
                <span>{t.colophon.scale}</span>
                <span>{t.colophon.page}</span>
              </div>
            </aside>
          </div>
        </section>

        {/* Optional club photo */}
        {site.heroPhoto && (
          <section className="photo-band" aria-label={t.photo.label}>
            <div className="container photo-band__inner">
              <div className="dimension" aria-hidden="true">
                <span className="dimension__tick" />
                <span className="dimension__line" />
                <span>{t.photo.width}</span>
                <span className="dimension__line" />
                <span className="dimension__tick" />
              </div>
              <div className="photo-band__frame">
                <Image src={site.heroPhoto.src} alt={site.heroPhoto.caption[locale]} fill sizes="(max-width: 1280px) 100vw, 1152px" />
                <Crosshair position="tl" />
                <Crosshair position="tr" />
                <Crosshair position="bl" />
                <Crosshair position="br" />
              </div>
              <div className="caption-row">
                <span>
                  {t.photo.figure} · {site.heroPhoto.caption[locale]}
                </span>
                <span>IEEE TEDU</span>
              </div>
            </div>
          </section>
        )}

        {/* About */}
        <section className="section" id="hakkimizda">
          <div className="container stack">
            <div className="section-head">
              <span>{t.about.head}</span>
              <span className="section-head__side">{t.about.side}</span>
            </div>
            <div className="about__row">
              <h2 className="about__statement">
                {t.about.statementStart} <span className="accent">{t.about.statementAccent}</span> {t.about.statementEnd}
              </h2>
              <div className="about__body">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
              </div>
            </div>
            <ul className="index-list">
              {t.about.items.map((item, index) => (
                <li key={item}>
                  <span className="mono mono--muted">1.{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Committees */}
        <section className="section section--white" id="komiteler">
          <div className="container stack">
            <div className="section-head">
              <span>{t.committees.head}</span>
              <span className="section-head__side">{t.committees.side}</span>
            </div>
            <h2 className="section-title">{t.committees.title}</h2>
            <div className="committee-list">
              {site.committees.map((committee, index) => (
                <article key={committee.id} className="committee-card">
                  <div className="committee-card__bar mono mono--muted">
                    <span>02.{index + 1}</span>
                    <span>{committee.code}</span>
                  </div>
                  <div className="committee-card__body">
                    <Image
                      className="committee-card__logo"
                      src={committee.logo}
                      alt={`${committee.name} ${t.committees.logoAlt}`}
                      width={224}
                      height={224}
                    />
                    <h3>{committee.name}</h3>
                    <p>{t.committees[committee.id]}</p>
                  </div>
                  <a className="committee-card__link" href={committee.instagram.href} target="_blank" rel="noopener noreferrer">
                    <span>{committee.instagram.handle}</span>
                    <ArrowUpRight />
                  </a>
                </article>
              ))}
            </div>
            <span className="swipe-hint mono mono--muted">{t.committees.swipe}</span>
          </div>
        </section>

        {/* Latest posts */}
        <section className="section" id="blog">
          <div className="container stack">
            <div className="section-head">
              <span>{t.blog.head}</span>
              <span className="section-head__side">{t.blog.side}</span>
            </div>
            <div className="title-row">
              <h2 className="section-title">{t.blog.title}</h2>
              {featured && (
                <Link href={localePath(locale, "/blog")} className="text-link">
                  {t.blog.all}
                  <ArrowRight />
                </Link>
              )}
            </div>
            {featured ? (
              <div className="latest">
                <Link href={localePath(locale, `/blog/${featured.slug}`)} className="latest__featured">
                  <Cover src={featured.coverUrl} alt={featured.title} sizes="(max-width: 960px) 100vw, 720px" />
                  <PostMeta post={featured} locale={locale} accent />
                  <span className="post-title">{featured.title}</span>
                  {featured.excerpt && <span className="excerpt">{featured.excerpt}</span>}
                </Link>
                {latest.length > 0 && (
                  <ul className="latest__list">
                    {latest.map((post) => (
                      <li key={post.id}>
                        <Link href={localePath(locale, `/blog/${post.slug}`)} className="post-row">
                          <Cover src={post.coverUrl} alt="" sizes="112px" />
                          <span className="post-row__text">
                            <PostMeta post={post} locale={locale} />
                            <span className="post-title">{post.title}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t.blog.empty}</p>
              </div>
            )}
          </div>
        </section>

        {/* Team */}
        <section className="section section--white" id="ekip" style={{ borderBottom: 0 }}>
          <div className="container stack" style={{ gap: 40 }}>
            <div className="section-head">
              <span>{t.team.head}</span>
              <span className="section-head__side">{t.team.side}</span>
            </div>
            <TeamSection t={t.team} />
          </div>
        </section>

        {/* Join */}
        <section className="dark" id="katil">
          <div className="container join__inner">
            <div className="section-head">
              <span>{t.join.head}</span>
              <span className="section-head__side">{t.join.side}</span>
            </div>
            <div className="join__row">
              <div className="join__copy">
                <h2 className="join__title">
                  {t.join.titleStart} <span className="accent">{t.join.titleAccent}</span>
                </h2>
                <p className="join__lead">{t.join.lead}</p>
                <a href={`mailto:${site.email}`} className="btn btn--light">
                  {site.email}
                  <ArrowRight />
                </a>
              </div>
              <ul className="channels">
                {site.socials.map((social) => (
                  <li key={social.href}>
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                      <span className="mono mono--muted">{social.label}</span>
                      <span className="channel__handle">{social.handle} ↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <SiteFooter t={t} locale={locale} />
          </div>
        </section>
      </main>
    </>
  );
}
