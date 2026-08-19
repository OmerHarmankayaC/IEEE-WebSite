# IEEE TEDU Student Branch Website

The official website of the TED University IEEE Student Branch — the branch's
public face, carrying its projects, events and blog posts.

**Live:** [ieee-tedu.vercel.app](https://ieee-tedu.vercel.app)

## Stack

Static and frontend-only, on purpose: semantic HTML5, vanilla CSS3, and vanilla
JavaScript. No framework and no build step, so a new committee member can edit a
page without setting up a toolchain first.

## Structure

```
index.html            landing page
contact.html          contact page
blog.html             blog index
blog-*.html           individual posts
vercel.json           deployment configuration
assets/
├── css/styles.css    global stylesheet and responsive rules
├── js/app.js         interactivity and animations
└── images/           logos, photos, team pictures
```

## Development

Node.js is the only requirement; `live-server` gives hot reload.

```bash
git clone https://github.com/OmerHarmankayaC/IEEE-WebSite.git
cd IEEE-WebSite
npm run dev       # opens http://localhost:8080
```

Edits to HTML, CSS or JS reload the page immediately.

## Deployment

Deployed on Vercel. Pushing to `main` triggers a new deployment; routing and
header configuration live in `vercel.json`.

## Contributing

- Keep CSS class names consistent with the ones already there.
- Compress images and use web-appropriate formats before committing them.
- Leave one-off scripts and scratch files out of the repository.

---

*Built by the TEDU IEEE development team.*
