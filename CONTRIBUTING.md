# Contributing

Thanks for helping improve the IEEE TEDU website.

## Writing blog posts

You don't need to touch the code for that. Ask the current webmaster for an admin account and use the panel at `/admin`.

## Changing the code

1. Create a branch from `main` (for example `feat/events-page` or `fix/mobile-menu`).
2. Run the site locally (see the README) and check your change on both a desktop and a phone width.
3. Before opening a pull request, make sure these pass:

   ```bash
   npm run lint
   npm run build
   ```

4. Open a pull request against `main`. Vercel adds a preview link to it, so reviewers can see the change live.

## Guidelines

- **Text in two languages.** Any interface text goes into `lib/i18n/dictionaries.ts`, in both `tr` and `en`. TypeScript will complain if one side is missing.
- **Turkish first.** Write natural Turkish, not a translation of English sentences. English uses American spelling.
- **Design rules.** Hairline borders, sharp corners, no shadows and no gradients. Reuse the tokens and classes in `app/globals.css` instead of adding new colors.
- **Accessibility.** Use real buttons and links, give icon-only buttons an `aria-label`, and keep text contrast at 4.5:1 or more.
- **Images.** Team photos go in `public/images/team/` as `firstname-lastname.jpg`, at most about 800 px on the long side.
- **Database changes** go in a new file under `supabase/migrations/`, and every new table needs row level security.
