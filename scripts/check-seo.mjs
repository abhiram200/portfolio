// Checks the built site's search metadata (run `npm run build:pages` first).
// It reads dist/ only, so it needs no network. Errors fail the run; warnings
// are advice (for example a title a little over the length search results show).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';

const dist = resolve(import.meta.dirname, '..', 'dist');
const SITE = (process.env.SITE_URL || 'https://abhiram200.github.io').replace(/\/+$/, '');
const BASE = (process.env.BASE_PATH || '/portfolio').replace(/\/+$/, '');
const ROOT = `${SITE}${BASE}/`;
// Pages that are deliberately kept out of search results.
const NOINDEX = new Set(['404.html']);

if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build:pages` first.');
  process.exit(1);
}

const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

const pages = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    // Search engine verification files (google….html) are plain text, not pages.
    else if (p.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f)) pages.push(p);
  }
};
walk(dist);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const all = (html, re) => [...html.matchAll(re)].map((m) => decode(m[1]));
const meta = (html, attr, name) => all(html, new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`, 'g'));

const titles = new Map();
const descriptions = new Map();
const indexable = [];

for (const file of pages) {
  const page = relative(dist, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  const expected = `${ROOT}${page.replace(/(^|\/)index\.html$/, '$1')}`;
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  if (!/<html lang="[a-z-]+"/.test(html)) err(page, 'missing <html lang>');
  if (!/<meta name="viewport"/.test(html)) err(page, 'missing viewport meta');

  const title = all(html, /<title>([^<]*)<\/title>/g);
  if (title.length !== 1 || !title[0].trim()) err(page, `expected one non-empty <title>, found ${title.length}`);
  const desc = meta(html, 'name', 'description');
  if (desc.length !== 1 || !desc[0].trim()) err(page, `expected one meta description, found ${desc.length}`);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) err(page, `expected one <h1>, found ${h1}`);

  if (NOINDEX.has(page)) {
    if (!noindex) err(page, 'should be noindex');
    continue;
  }
  if (noindex) {
    err(page, 'is noindex but is a public page');
    continue;
  }
  indexable.push(expected);

  // Titles and descriptions: present, unique and a length search results show whole.
  const t = title[0] ?? '';
  const d = desc[0] ?? '';
  if (titles.has(t)) err(page, `duplicate title (also ${titles.get(t)})`);
  titles.set(t, page);
  if (descriptions.has(d)) err(page, `duplicate description (also ${descriptions.get(d)})`);
  descriptions.set(d, page);
  if (t.length > 70) warn(page, `title is ${t.length} characters (search results show about 60)`);
  if (d.length < 70 || d.length > 160) warn(page, `description is ${d.length} characters (aim for 70 to 160)`);

  // Canonical: exactly one, absolute, under the project path, pointing at this page.
  const canonical = all(html, /<link rel="canonical" href="([^"]*)"/g);
  if (canonical.length !== 1) err(page, `expected one canonical, found ${canonical.length}`);
  else if (canonical[0] !== expected) err(page, `canonical is ${canonical[0]}, expected ${expected}`);

  // Social previews: absolute URLs that exist in the build.
  const ogUrl = meta(html, 'property', 'og:url')[0];
  if (ogUrl !== expected) err(page, `og:url is ${ogUrl}, expected ${expected}`);
  for (const key of ['og:title', 'og:description', 'og:image', 'og:image:alt']) {
    if (!meta(html, 'property', key)[0]) err(page, `missing ${key}`);
  }
  for (const img of [...meta(html, 'property', 'og:image'), ...meta(html, 'name', 'twitter:image')]) {
    if (!img.startsWith(ROOT)) err(page, `social image ${img} is not an absolute URL under ${ROOT}`);
    else if (!existsSync(join(dist, img.slice(ROOT.length)))) err(page, `social image ${img} is not in the build`);
  }
  if (!meta(html, 'name', 'twitter:card')[0]) err(page, 'missing twitter:card');

  // Structured data: valid JSON, a schema.org context, and every @id reference defined.
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) err(page, 'no JSON-LD');
  for (const block of blocks) {
    let data;
    try {
      data = JSON.parse(block);
    } catch (e) {
      err(page, `invalid JSON-LD: ${e.message}`);
      continue;
    }
    if (data['@context'] !== 'https://schema.org') err(page, 'JSON-LD @context is not https://schema.org');
    const nodes = data['@graph'] ?? [data];
    const defined = new Set(nodes.map((n) => n['@id']).filter(Boolean));
    const refs = [];
    const visit = (v) => {
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === 'object') {
        if (v['@id'] && Object.keys(v).length === 1) refs.push(v['@id']);
        Object.values(v).forEach(visit);
      }
    };
    nodes.forEach((n) => Object.values(n).forEach(visit));
    for (const r of refs) {
      // References to the project entities live on their own pages.
      if (!defined.has(r) && !/\/work\/[^/]+\/#project$/.test(r)) err(page, `JSON-LD references undefined ${r}`);
    }
    for (const n of nodes) if (!n['@type']) err(page, `JSON-LD node ${n['@id'] ?? ''} has no @type`);
    const url = JSON.stringify(data).match(/https?:\/\/[^"]+/g) ?? [];
    for (const u of url) if (u.startsWith(SITE) && !u.startsWith(ROOT)) err(page, `JSON-LD URL ${u} is missing ${BASE}`);
  }
}

// Sitemap: lists exactly the indexable pages, under their canonical URLs.
const sitemapFile = join(dist, 'sitemap.xml');
if (!existsSync(sitemapFile)) err('sitemap.xml', 'missing (is SITE_URL set for the build?)');
else {
  const xml = readFileSync(sitemapFile, 'utf8');
  if (!xml.startsWith('<?xml') || !xml.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) err('sitemap.xml', 'not a valid sitemap');
  const listed = all(xml, /<loc>([^<]+)<\/loc>/g);
  for (const u of indexable) if (!listed.includes(u)) err('sitemap.xml', `missing ${u}`);
  for (const u of listed) if (!indexable.includes(u)) err('sitemap.xml', `lists ${u}, which is not an indexable page`);
  if (new Set(listed).size !== listed.length) err('sitemap.xml', 'has duplicate URLs');
}

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`Checked ${pages.length} pages (${indexable.length} indexable) against ${ROOT}.`);
if (errors.length) {
  console.log(`${errors.length} error(s).`);
  process.exit(1);
}
console.log('SEO checks passed.');
