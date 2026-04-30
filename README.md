# IEEE TEDU Student Branch Website

Welcome to the official repository for the TED University IEEE Student Branch website. This project serves as the digital face of our student branch, showcasing our projects, events, and blog posts.

## Tech Stack

This is a static, frontend-only project built with core web technologies for maximum performance and simplicity:

- **HTML5**: Semantic structure and page layouts.
- **CSS3 (Vanilla)**: Custom styling, responsive design, and animations without the overhead of heavy frameworks.
- **JavaScript (Vanilla)**: DOM manipulation, interactivity, and dynamic content rendering.

## Project Structure

The repository is organized as follows:

```text
├── index.html           # Main landing page
├── contact.html         # Contact and reach-out page
├── blog.html            # Blog listing page
├── blog-*.html          # Individual blog post pages
├── package.json         # Project metadata and scripts
├── vercel.json          # Deployment configuration for Vercel
└── assets/              # Static assets
    ├── css/
    │   └── styles.css   # Global stylesheet and responsive rules
    ├── js/
    │   └── app.js       # Global scripts, animations, and interactivity
    └── images/          # Images, logos, and team member pictures
```

## Local Development

To run this project locally, you only need Node.js installed on your machine. We use `live-server` for a fast development experience with hot-reloading.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd IEEE-WebSite
   ```

2. **Install dependencies (if any are added later) and run the dev server:**
   ```bash
   npm run dev
   ```
   This will automatically open your default browser to `http://localhost:8080` (or another available port). Any changes you make to the HTML, CSS, or JS files will instantly reload the page.

## Deployment

This project is configured for seamless deployment on **Vercel**. The `vercel.json` file contains any necessary routing or header configurations. Pushing to the `main` branch will automatically trigger a new deployment.

## Contributing

When contributing to this project, please ensure:
- CSS classes follow a logical naming convention.
- New assets are optimized for web (compressed images, proper formats).
- Unnecessary files or one-off scripts are excluded from the main repository to keep the codebase clean.

---
*Built by the TEDU IEEE Development Team.*
