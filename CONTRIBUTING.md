# Contributing

Thanks for helping improve the IEEE TEDU website! This guide explains how we work so that changes stay consistent and easy to review.

The repository language is **English**: code, comments, file names, commit messages, issues and pull requests. Visitor-facing text is bilingual (Turkish and English) and lives in the translation files.

## Workflow

1. **Create a branch** from `main`:

   ```bash
   git checkout main && git pull
   git checkout -b feat/short-description
   ```

   Prefixes: `feat/`, `fix/`, `content/` (text, photos, posts), `docs/`, `refactor/`, `chore/`.

2. **Make your change** and test it locally (`npm run dev` or `python3 -m http.server 8080`).

3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/), as in the existing history:

   ```text
   feat: add 2027-2028 board to the year switcher
   fix: keep team carousel arrows hidden on small screens
   content: add photos for new RAS members
   docs: explain how to add a blog post
   ```

4. **Open a pull request** against `main` and fill in the checklist. If Vercel posts a preview link on the PR, check your change there too.

5. At least one other maintainer reviews before merging. `main` deploys to production automatically.

## Before you open a pull request

- [ ] Checked the change in **both languages** (TR / EN toggle, or `?lang=en`).
- [ ] Checked phone (≈375px), tablet (≈768px) and laptop (≈1280px) widths.
- [ ] No errors or i18n warnings in the browser console.
- [ ] `npm run check:i18n` passes.
- [ ] New images are optimized and named correctly (see below).

## Code style

- **Indentation:** 4 spaces in HTML, CSS and JS (see `.editorconfig`).
- **No frameworks or build tools.** Keep the site plain HTML/CSS/JS so anyone in the branch can edit it.
- **Text:** never hard-code visible text in HTML or JS. Add a key to both `assets/js/i18n/tr.js` and `en.js` (see the [Localization section in the README](README.md#localization-tr--en)).
- **Data:** team members go in `assets/js/data/team.js`, not in HTML or `app.js`.
- **JavaScript:** guard DOM lookups (`if (el) { … }`) because `app.js` runs on every page. Escape any data you insert with `innerHTML` (use the `escapeHTML` helper).
- **CSS:** reuse the variables in `:root` (`--ted-navy`, `--ted-red`, …) rather than new hex colors. Prefer adding classes to `styles.css` over inline `style="…"` attributes.
- **Accessibility:** icon-only buttons need an `aria-label` (translated via `data-i18n-attr`), images need meaningful `alt` text, decorative SVGs get `aria-hidden="true"`.
- **Comments:** in English, explaining *why* rather than *what*.

## Images

- **Location:** member photos in `assets/images/team/`, logos in `assets/images/brand/`.
- **Naming:** lowercase ASCII kebab-case, no spaces or Turkish characters — `irem-akil.jpg`, not `İrem Akıl-WIE.JPG`. Don't put roles in file names; roles change every year and belong in `team.js`.
- **Size:** resize photos to about **800px** on the longest side and keep them under **~300 KB**. On macOS:

  ```bash
  sips -Z 800 -s formatOptions 80 assets/images/team/jane-doe.jpg
  ```

- **Consent:** only add photos of people who agreed to appear on the site.

## Reporting problems

Open a GitHub issue with what you expected, what happened, the page URL, and your browser/device. Screenshots help.
