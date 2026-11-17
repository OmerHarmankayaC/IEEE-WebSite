# IEEE TEDU Student Branch Website

The website of the **IEEE Student Branch at TED University** (Ankara, Türkiye). It introduces the branch and its committees (Computer Society, Robotics and Automation Society, Women in Engineering), shows the board of directors and hosts a blog that is written from an admin panel, without touching the code.

**Live:** [ieee-tedu.vercel.app](https://ieee-tedu.vercel.app)

## Features

- **Bilingual (TR / EN).** Turkish pages live at the root (`/blog`), English ones under `/en` (`/en/blog`). The TR / EN buttons open the same page in the other language; old `?lang=en` links still work.
- **Blog with an admin panel** at `/admin`: write posts in a rich text editor, add images by dragging them in, set a cover image, a category and a publish date, mark one post as featured, and keep drafts. English versions are optional; when a post has none, the Turkish text is shown.
- **Images are shrunk in the browser** (WebP, at most 1600 px) before upload, so free storage lasts.
- **Board of directors by academic year,** kept in a single data file.
- **Old addresses keep working:** links to the previous static pages (`blog-otonom-arac.html` and so on) redirect to the new ones.
- Responsive, accessible markup, sitemap and robots file included.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19, deployed on **Vercel**
- [Supabase](https://supabase.com): Postgres database, authentication and image storage, all protected by row level security
- [Tiptap](https://tiptap.dev) for the post editor
- Plain CSS with design tokens (`app/globals.css`) and fonts through `next/font`: Inter, Space Grotesk, JetBrains Mono

## Getting started

```bash
git clone https://github.com/OmerHarmankayaC/IEEE-WebSite.git
cd IEEE-WebSite
npm install
npm run dev                  # http://localhost:3000
```

### Environment variables

The site works without any configuration: the public Supabase address and publishable key of the production project are set as defaults in `lib/env.ts`. To point a copy of the site at another Supabase project, set these two variables (in `.env.local` locally, in the Vercel project settings for deployments):

| Name | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard, Project Settings, API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard, Project Settings, API Keys (the `sb_publishable_...` key) |

Both values are public by design: they reach every visitor's browser, and every table and the storage bucket are protected by row level security. Never put the secret or service role key in this project.

## Admin panel

The panel lives at `/admin`. There is a single role: admin.

**Adding an admin**

1. Supabase dashboard, Authentication, Users, **Add user**. Enter the email and a password, and tick *Auto Confirm User*.
2. Grant admin rights in the SQL editor:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'name@example.com';
   ```

**Recommended Supabase settings**

- Authentication, Sign In / Providers: turn off **Allow new users to sign up** (accounts are only created by hand).
- Authentication, URL Configuration: set **Site URL** to the production address so password reset emails link back to the site.

## Content that lives in code

| What | Where |
| --- | --- |
| Board of directors | `lib/team.ts`, photos in `public/images/team/` |
| Committee texts, all interface text (TR and EN) | `lib/i18n/dictionaries.ts` |
| Email, social links, current term, optional homepage photo | `lib/site.ts` |
| Colors and fonts | top of `app/globals.css` |

To add a wide club photo under the hero, put the image in `public/images/` and set `heroPhoto` in `lib/site.ts`.

## Project structure

```text
app/
  [locale]/           Public pages in both languages: homepage, /blog, /blog/[slug]
  admin/              Login, password reset, post list, editor, preview (own root layout)
  global-not-found.tsx  404 page for addresses that match nothing
  api/keepalive/      Daily request that keeps the free Supabase project awake
components/
  site/               Header, mobile menu, team section, article, cards
  admin/              Post editor, rich text editor, posts table, dialogs
lib/                  Data access, i18n, team data, Supabase clients, helpers
public/images/        Logos and team photos
supabase/migrations/  Database schema (tables, policies, storage bucket)
proxy.ts              Admin session refresh and redirects for old ?lang= links
```

## How caching works

Public pages are rendered ahead of time for both languages and served from Vercel's edge cache, so visitors never wait for the database. Turkish addresses reach the `tr` pages through rewrites in `next.config.ts`, which run in Vercel's routing layer and keep the cache intact. Every save or delete in the admin panel expires the cached pages immediately; otherwise they refresh once an hour. Newly published posts are rendered on their first visit and cached from then on.

Server code runs in Frankfurt (`fra1` in `vercel.json`), next to the Supabase database.

Free Supabase projects pause after a week without activity. `vercel.json` schedules `/api/keepalive` once a day to prevent that.

## Deployment

Every push to `main` deploys to production on Vercel; pull requests get preview deployments. `vercel.json` sets the framework to Next.js and registers the daily cron job.

## Contributing

Branch members are welcome to contribute. Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** first.

## Contact

- Email: [ieee@tedu.edu.tr](mailto:ieee@tedu.edu.tr)
- Instagram: [@ieee.tedu](https://www.instagram.com/ieee.tedu/), [CS](https://www.instagram.com/ieeeteducomputersociety/), [RAS](https://www.instagram.com/tedu.ras/), [WIE](https://www.instagram.com/teduwie/)
- LinkedIn: [IEEE TEDU Student Branch](https://www.linkedin.com/company/ieeetedusb/)

---

*Built and maintained by the IEEE TEDU team.*
