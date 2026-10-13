# Abhiram RS — portfolio

Static site built with Astro. No backend, no paid services.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (once). |
| `npm run dev` | Dev server at http://localhost:4321 with live reload. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the production build at http://localhost:4321. |
| `npm test` | Run the "Ask about Abhiram" test set (Node's built-in test runner). |
| `npm run check:links` | Check every internal and external link in `dist/` (build first). |
| `npm run resume` | Rebuild the public résumé at `public/Abhiram-RS-Resume.pdf`. |
| `npm run resume:private` | Build the private résumé outside the project (see below). |
| `npm run og` | Re-render the social preview images (`public/og.png` and one per project in `public/og/`) and PNG favicons. |
| `npm run build:pages` | Production build for GitHub Pages, followed by the SEO checks. |
| `npm run check:seo` | Check titles, descriptions, canonicals, social tags, JSON-LD and the sitemap in `dist/`. |
| `node scripts/measure-vitals.mjs [url…]` | Lab LCP, CLS and page weight with a throttled headless Chrome (run `npm run preview:pages` first). |

The résumé, OG image and favicon scripts use a local Chrome or Edge (set `CHROME_PATH` if neither is found).

## Where the content lives

Every fact is in `src/data/profile.js`. The pages, both résumés and the chatbot all read from it, so editing a fact there updates everything. After editing, run `npm run resume`, `npm test` and `npm run build`.

The chat assistant (Trace, the robot in the bottom-right corner, `src/components/Assistant.astro`; its name lives in `src/data/assistant.js`) composes answers in `src/data/kb.js` from the same data. The matching and conversation logic is in `src/scripts/bot.js` and `src/scripts/smalltalk.js`, and loads only when the chat is first opened.

The explorer game lives in `src/scripts/game.js` (achievements) and `src/components/Bug.astro` (the five hidden bugs; their stories are `bugFacts` in `profile.js`). Progress is stored in the visitor's browser only. The hero graph is `src/components/WorkGraph.astro`, built from the project and job stacks.

## Private résumé

Phone and address never go in the project. Either set environment variables:

```bash
RESUME_PHONE="..." RESUME_ADDRESS="..." npm run resume:private
```

or create `~/.abhiram-resume/private.json` containing `{"phone": "...", "address": "..."}` and run `npm run resume:private`.
The PDF is written to `~/Documents/Abhiram-RS-Resume-Private.pdf` (override with `RESUME_PRIVATE_OUT`). The script refuses to read from or write to anywhere inside the project folder.

## Contact form

The message composer in the contact section always works. Without EmailJS keys, Send opens the visitor's email app with the message written and addressed. To send straight to the inbox instead, copy `.env.example` to `.env`, fill in the EmailJS service ID, template ID and public key, and rebuild. If a send fails, the composer offers the email-app route. `.env` is git-ignored.

## Hosting

Set `SITE_URL` (for example `https://your-domain.com`) when building for hosting, so canonical and Open Graph URLs are absolute. `dist/` is plain static files and works on any static host.

## Deploying to GitHub Pages

The site is served from the `gh-pages` branch at https://abhiram200.github.io/portfolio/.

```bash
npm run build:pages              # builds dist/ for the /portfolio/ path
npm run preview:pages            # optional: check it at http://localhost:4322/portfolio/
```

Then publish `dist/` to the `gh-pages` branch, for example with a worktree:

```bash
git fetch origin gh-pages
git worktree add ../ghp origin/gh-pages
cd ../ghp && git rm -rq . && cp -r ../portfolio/dist/. . && git add -A
git commit -m "Deploy" && git push origin HEAD:gh-pages
cd ../portfolio && git worktree remove ../ghp
```

`dist/` includes `.nojekyll`, which stops GitHub Pages from hiding the `_astro/` folder.

## Search engines

### What the build produces

- **Titles and descriptions** for each page live in `src/data/seo.js`, written from the facts in `profile.js`. Keep titles near 60 characters and descriptions between 70 and 160; `npm run check:seo` warns outside that range.
- **Canonical URLs** always end in a slash (`…/portfolio/work/aura/`), matching how GitHub Pages serves the pages.
- **`sitemap.xml`** is written after every build from the pages' own canonical URLs (`astro.config.mjs`). Pages marked `noindex` (only the 404 page) are left out. It has no `lastmod`, because the build can't know when content last changed.
- **Structured data** (JSON-LD) comes from `src/lib/schema.js`: a `Person` and `WebSite` on every page, a `ProfilePage` on the home page, and a `WebPage` with a breadcrumb plus the project itself on each project page. Projects with public source are `SoftwareSourceCode`; the LoRa project links its IJIRT paper. Every value comes from `profile.js`.
- **Social previews**: each project page has its own 1200×630 image in `public/og/`.

`npm run build:pages` runs `check:seo` on the output and fails if a title, description, canonical, social image, JSON-LD block or sitemap entry is missing, duplicated or wrong. It reads `dist/` only, so it can't see whether a URL is live; `npm run check:links` does that.

### robots.txt

Crawlers only read `robots.txt` from the root of a host (`https://abhiram200.github.io/robots.txt`), and that root is served by a separate `abhiram200.github.io` repository, which doesn't exist. Today the root answers 404, which search engines treat as "everything may be crawled", so nothing is blocked. A `robots.txt` inside `/portfolio/` would be ignored, so the site doesn't ship one.

To add one anyway, create a public repository named `abhiram200.github.io` with GitHub Pages enabled and this `robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://abhiram200.github.io/portfolio/sitemap.xml
```

Note that the same repository would also serve `https://abhiram200.github.io/` itself.

### Google Search Console (free)

1. Go to https://search.google.com/search-console and add a **URL prefix** property: `https://abhiram200.github.io/portfolio/`. A Domain property isn't possible, because `github.io` isn't your domain.
2. Choose the **HTML tag** verification method and copy only the `content` value from the tag Google shows.
3. Build with that value and deploy:

   ```bash
   PUBLIC_GOOGLE_SITE_VERIFICATION=the-copied-value npm run build:pages
   ```

   (or put `PUBLIC_GOOGLE_SITE_VERIFICATION=…` in `.env`, which is git-ignored). Every page then carries `<meta name="google-site-verification">`. Press **Verify** in Search Console. Keep the value in `.env` so later builds keep the tag.
4. In **Sitemaps**, submit `sitemap.xml` (the full URL is `https://abhiram200.github.io/portfolio/sitemap.xml`).
5. In **URL inspection**, inspect the home page and each project page and press **Request indexing**.

Indexing usually takes days to weeks, and Search Console's reports start filling in a few days after verification.

### Bing Webmaster Tools (free)

Bing also powers DuckDuckGo and Yahoo results. At https://www.bing.com/webmasters, the quickest route is **Import from Google Search Console** once Google is verified. Otherwise add the site, choose the meta tag method, build with `PUBLIC_BING_SITE_VERIFICATION=the-value` (or put it in `.env`), deploy, verify, and submit the same sitemap URL.
