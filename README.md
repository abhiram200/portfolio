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
| `npm run og` | Re-render the Open Graph image and PNG favicons. |

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
