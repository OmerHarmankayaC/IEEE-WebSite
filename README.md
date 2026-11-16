# IEEE TEDU Student Branch Website

The official website of the **IEEE Student Branch at TED University** (Ankara, Türkiye).
It introduces the branch and its committees — **Computer Society (CS)**, **Robotics and Automation Society (RAS)** and **Women in Engineering (WIE)** — and showcases the board of directors, events, projects and blog posts.

**Live:** [ieee-tedu.vercel.app](https://ieee-tedu.vercel.app)

The site is available in **Turkish and English**; visitors switch languages with the **TR / EN** toggle.

## Features

- **Bilingual (TR / EN)** — lightweight client-side localization, remembers the visitor's choice.
- **Board of directors by academic year** — switch between years; the roster lives in a single data file.
- **Committee cards** with a swipeable mobile switcher.
- **Ideas & Projects** carousel linking to blog posts, with an optional live Instagram feed.
- **Contact form** that opens the visitor's email app with the message prefilled.
- Fully responsive, no build step, no dependencies.

## Tech stack

Plain **HTML5**, **CSS3** and **vanilla JavaScript** — on purpose. There is no framework and no build step, so a new committee member can edit a page without setting up a toolchain first. The files in this repository are served as-is on **Vercel**.

## Getting started

```bash
git clone https://github.com/OmerHarmankayaC/IEEE-WebSite.git
cd IEEE-WebSite
```

You only need a static file server. Pick one:

```bash
npm run dev                  # live-server with auto-reload on http://localhost:8080 (needs Node.js)
```

```bash
python3 -m http.server 8080  # no Node.js needed, then open http://localhost:8080
```

> Opening the HTML files directly (`file://…`) mostly works, but a local server matches production more closely.

To force a language while testing, add `?lang=en` or `?lang=tr` to any URL.

## Project structure

```text
├── index.html                 # Homepage: hero, about, committees, ideas & projects, board, footer
├── blog.html                  # Blog listing
├── blog-*.html                # One page per blog post (blog-post.html is the template)
├── contact.html               # Contact form
├── assets/
│   ├── css/styles.css         # Global styles (design tokens are at the top in :root)
│   ├── js/
│   │   ├── i18n/
│   │   │   ├── tr.js          # Turkish strings (default language)
│   │   │   └── en.js          # English strings
│   │   ├── i18n.js            # Localization engine + TR/EN switch
│   │   ├── data/team.js       # Board of directors, per academic year
│   │   └── app.js             # Page behaviour (animations, carousels, team rendering, contact form)
│   └── images/
│       ├── brand/             # IEEE TEDU and committee logos
│       └── team/              # Member photos (firstname-lastname.jpg)
├── docs/content/              # Original Turkish source copy and social media links (reference only)
├── scripts/check-i18n.js      # Verifies TR/EN translation files are in sync
├── package.json
└── vercel.json                # Vercel config (static output, no build command)
```

Every page loads its scripts in this order at the end of `<body>`:

```html
<script src="assets/js/data/team.js"></script>   <!-- homepage only -->
<script src="assets/js/i18n/tr.js"></script>
<script src="assets/js/i18n/en.js"></script>
<script src="assets/js/i18n.js"></script>
<script src="assets/js/app.js"></script>
```

## Localization (TR / EN)

All visible text comes from the two dictionaries in `assets/js/i18n/`. The Turkish text written in the HTML is only a fallback for visitors with JavaScript disabled.

**To change existing text**, edit the value in `tr.js` **and** `en.js`. Editing only the HTML has no visible effect.

**To add new text:**

1. Add the same key to both `assets/js/i18n/tr.js` and `assets/js/i18n/en.js`:

   ```js
   "events.title": "Etkinlikler",   // tr.js
   "events.title": "Events",        // en.js
   ```

2. Reference it from the HTML:

   | Attribute | Effect |
   | --- | --- |
   | `data-i18n="events.title"` | Sets the element's text |
   | `data-i18n-html="footer.join"` | Sets inner HTML (only for our own strings that contain `<br>`/`<span>`) |
   | `data-i18n-attr="placeholder:contact.namePlaceholder"` | Sets attributes (`alt`, `placeholder`, `aria-label`, `content`, …); separate several with `;` |

   From JavaScript, use `I18n.t('events.title')`, and listen for the `languagechange` event on `document` to re-render dynamic content.

3. Run the checker:

   ```bash
   npm run check:i18n
   ```

The language is chosen in this order: `?lang=` URL parameter → the visitor's saved choice → browser language (Turkish browsers get Turkish, everyone else English).

## Common tasks

### Updating the team

Edit **`assets/js/data/team.js`** — no HTML changes are needed.

1. Add the photo to `assets/images/team/` as `firstname-lastname.jpg` (lowercase, ASCII, hyphens; see [CONTRIBUTING.md](CONTRIBUTING.md#images)).
2. Add the person to the right committee (`cs`, `ras`, `wie`, `media`) of the right academic year:

   ```js
   { name: "Jane Doe", roleKey: "team.role.csMember", img: "assets/images/team/jane-doe.jpg", linkedin: "https://www.linkedin.com/in/jane-doe/" }
   ```

   Members are sorted alphabetically automatically. Use `name: null` for a seat that has not been announced yet; leave `linkedin` empty if there is no profile.
3. **New academic year:** copy a year block in `team.js`, then add a matching button in `index.html`:

   ```html
   <button type="button" class="year-btn" data-year="2027-2028">2027-2028</button>
   ```

### Adding a blog post

1. Copy `blog-post.html` to `blog-<slug>.html` (English, kebab-case slug).
2. Add keys for the post (`posts.<name>.title`, `.category`, `.excerpt`, and body paragraphs) to both translation files, and point the page's `data-i18n` attributes at them.
3. Add a card to `blog.html` and, if it should appear on the homepage, to the `#activities-carousel` in `index.html`.

> The existing posts currently share placeholder body text (`post.body.*`). Give each post its own keys when real content is written.

### Connecting the Instagram feed

Set `INSTAGRAM_FEED_URL` in `assets/js/app.js` (section 5) to a JSON feed URL, e.g. from [Behold](https://behold.so). While it is empty — or if the request fails — the homepage shows the static blog cards.

### Changing colors and fonts

Design tokens (`--ted-navy`, `--ted-red`, fonts, …) are defined at the top of `assets/css/styles.css`.

## Deployment

The site is deployed on **Vercel** as a static site (`vercel.json` sets the output directory to the repository root and disables the build command). Every push to `main` triggers a production deployment; with the Vercel GitHub integration, pull requests also get preview deployments.

## Contributing

Contributions from branch members are welcome. Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** before opening a pull request.

## Contact

- Email: [ieee@tedu.edu.tr](mailto:ieee@tedu.edu.tr)
- Instagram: [@ieee.tedu](https://www.instagram.com/ieee.tedu/) · [CS](https://www.instagram.com/ieeeteducomputersociety/) · [RAS](https://www.instagram.com/tedu.ras/) · [WIE](https://www.instagram.com/teduwie/)
- LinkedIn: [IEEE TEDU Student Branch](https://www.linkedin.com/company/ieeetedusb/)

---

*Built and maintained by the IEEE TEDU team.*
