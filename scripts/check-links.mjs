// Checks every link in the built site (run `npm run build` first).
// Internal links must resolve to a file in dist/. External links are fetched.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '..', 'dist');
if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const pages = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) pages.push(p);
  }
};
walk(dist);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#38;/g, '&');
const internal = new Map();
const external = new Map();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, raw] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const href = decode(raw);
    if (href.startsWith('mailto:') || href.startsWith('#')) continue;
    const map = /^https?:\/\//.test(href) ? external : internal;
    if (!map.has(href)) map.set(href, new Set());
    map.get(href).add(page.slice(dist.length + 1));
  }
}

let failures = 0;

// Internal: /path, /path/, /path#hash, /file.ext. BASE_PATH (e.g. /portfolio)
// is the sub-path the site is served from; files in dist/ don't include it.
const base = (process.env.BASE_PATH || '').replace(/\/+$/, '');
for (const [href, from] of internal) {
  if (base && !href.startsWith(`${base}/`) && href !== base) {
    failures++;
    console.log(`BROKEN internal ${href} (missing ${base} prefix, in ${[...from].join(', ')})`);
    continue;
  }
  const path = (base ? href.slice(base.length) : href).split('#')[0].split('?')[0] || '/';
  const candidates = [join(dist, path), join(dist, path, 'index.html')];
  if (!candidates.some((c) => existsSync(c) && statSync(c).isFile())) {
    failures++;
    console.log(`BROKEN internal ${href} (in ${[...from].join(', ')})`);
  }
  const hash = href.split('#')[1];
  if (hash) {
    const target = candidates.find((c) => existsSync(c) && statSync(c).isFile());
    if (target && !readFileSync(target, 'utf8').includes(`id="${hash}"`)) {
      failures++;
      console.log(`BROKEN anchor ${href}`);
    }
  }
}
console.log(`Internal links checked: ${internal.size}`);

// External. LinkedIn answers automated requests with status 999; that means
// "blocked for bots", not "missing", so it is reported separately.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const results = await Promise.all(
  [...external.keys()].map(async (url) => {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,application/pdf,*/*' }, signal: AbortSignal.timeout(30000) });
      return { url, status: res.status };
    } catch (e) {
      return { url, status: `error: ${e.cause?.code ?? e.message}` };
    }
  }),
);
for (const { url, status } of results.sort((a, b) => a.url.localeCompare(b.url))) {
  const ok = typeof status === 'number' && status < 400;
  const botBlocked = status === 999 && url.includes('linkedin.com');
  if (!ok && !botBlocked) failures++;
  console.log(`${ok ? 'OK  ' : botBlocked ? 'BOT ' : 'FAIL'} ${status} ${url}`);
}
console.log(`External links checked: ${external.size}`);
if (failures) {
  console.log(`${failures} problem(s) found.`);
  process.exit(1);
}
console.log('All links OK.');
