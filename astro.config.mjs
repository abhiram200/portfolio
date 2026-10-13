import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// After the build, make every link that leaves the site (other domains and
// PDFs) open in a new tab. src/scripts/links.js does the same at runtime for
// links created in the browser, such as the ones in Bit's answers.
const externalLinks = () => ({
  name: 'external-links-new-tab',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const root = fileURLToPath(dir);
      const walk = async (d) => {
        for (const entry of await readdir(d, { withFileTypes: true })) {
          const p = join(d, entry.name);
          if (entry.isDirectory()) await walk(p);
          else if (p.endsWith('.html')) await rewrite(p);
        }
      };
      const rewrite = async (file) => {
        const html = await readFile(file, 'utf8');
        const out = html.replace(/<a\b([^>]*?)\shref="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (m, pre, href, post, inner) => {
          const external = /^https?:\/\//.test(href) || /\.pdf($|[?#])/i.test(href);
          if (!external || /\btarget=/.test(pre + post)) return m;
          let attrs = `${pre} href="${href}"${post}`;
          attrs = /\srel="/.test(attrs)
            ? attrs.replace(/\srel="([^"]*)"/, ' rel="$1 noopener noreferrer"')
            : `${attrs} rel="noopener noreferrer"`;
          return `<a${attrs} target="_blank" data-ext="1">${inner}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
        });
        if (out !== html) await writeFile(file, out);
      };
      await walk(root);
    },
  },
});

// After the build, write sitemap.xml from the pages themselves: every page
// with a canonical URL and no noindex is listed, under its canonical URL.
// No lastmod is written, because the build doesn't know when content changed.
const sitemap = () => ({
  name: 'sitemap-from-canonicals',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      if (!process.env.SITE_URL) return;
      const root = fileURLToPath(dir);
      const urls = [];
      const walk = async (d) => {
        for (const entry of await readdir(d, { withFileTypes: true })) {
          const p = join(d, entry.name);
          if (entry.isDirectory()) await walk(p);
          else if (p.endsWith('.html')) {
            const html = await readFile(p, 'utf8');
            const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
            if (canonical && !/<meta name="robots" content="[^"]*noindex/.test(html)) urls.push(canonical);
          }
        }
      };
      await walk(root);
      urls.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map((u) => `  <url><loc>${u}</loc></url>`)
        .join('\n')}\n</urlset>\n`;
      await writeFile(join(root, 'sitemap.xml'), xml);
    },
  },
});

// Set SITE_URL (e.g. https://your-domain.com) when building for hosting so that
// canonical and Open Graph URLs are absolute. Without it they stay relative.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  // Set BASE_PATH (e.g. /portfolio) when the site is served from a sub-path.
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  // The CSS is small, so it's inlined: the first paint needn't wait for a
  // separate stylesheet request.
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [externalLinks(), sitemap()],
});
