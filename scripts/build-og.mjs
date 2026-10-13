// Renders the Open Graph image and PNG favicons from HTML with a local
// headless Chrome. Output goes to public/.
import { writeFileSync, mkdtempSync, rmSync, copyFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chrome } from './chrome.mjs';
import { person, projects } from '../src/data/profile.js';

const root = resolve(import.meta.dirname, '..');
const font = (p) => pathToFileURL(join(root, 'node_modules/@fontsource-variable', p)).href;
const fonts = `
@font-face{font-family:Archivo;src:url(${font('archivo/files/archivo-latin-wdth-normal.woff2')}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:Serif;src:url(${font('source-serif-4/files/source-serif-4-latin-opsz-normal.woff2')}) format('woff2');font-weight:200 900}
*{margin:0;box-sizing:border-box}`;

const og = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
body{width:1200px;height:630px;background:radial-gradient(700px 420px at 92% 0%,rgba(139,108,255,.45),transparent 60%),radial-gradient(600px 400px at 0% 100%,rgba(255,111,181,.25),transparent 60%),#110e33;color:#f4f2ff;padding:70px 80px;display:flex;flex-direction:column;justify-content:space-between;font-family:Archivo;position:relative;overflow:hidden}
body::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.08) 1.5px,transparent 1.5px);background-size:30px 30px}
h1{position:relative;font-size:138px;font-weight:900;font-stretch:120%;letter-spacing:-0.04em;line-height:.9;background:linear-gradient(100deg,#fff 35%,#d8ccff 65%,#ffb8dc 100%);-webkit-background-clip:text;color:transparent}
p{position:relative;font-size:46px;font-weight:650;line-height:1.15;max-width:820px;margin-top:26px;color:#ffd166}
.row{position:relative;display:flex;justify-content:space-between;align-items:center;font-size:26px;font-weight:650;color:#bdb8ea}
.chip{display:inline-flex;gap:12px;align-items:center;border:2px solid rgba(255,111,181,.6);background:rgba(229,70,143,.15);color:#f4f2ff;border-radius:16px;padding:10px 18px}
svg.g{position:absolute;right:60px;top:150px;width:330px;height:330px}
</style></head><body>
<svg class="g" viewBox="0 0 330 330"><g stroke="rgba(189,184,234,.35)" stroke-width="2"><line x1="165" y1="165" x2="70" y2="80"/><line x1="165" y1="165" x2="270" y2="90"/><line x1="165" y1="165" x2="280" y2="240"/><line x1="165" y1="165" x2="80" y2="260"/><line x1="70" y1="80" x2="30" y2="120"/><line x1="270" y1="90" x2="310" y2="50"/><line x1="280" y1="240" x2="315" y2="290"/><line x1="80" y1="260" x2="40" y2="300"/></g><circle cx="165" cy="165" r="26" fill="#8b6cff"/><g fill="#110e33" stroke="#ffd166" stroke-width="6"><circle cx="70" cy="80" r="16"/><circle cx="270" cy="90" r="16"/><circle cx="280" cy="240" r="16"/></g><circle cx="80" cy="260" r="13" fill="#f4f2ff"/><circle cx="30" cy="120" r="8" fill="#1f9cc6"/><circle cx="310" cy="50" r="8" fill="#e5468f"/><circle cx="315" cy="290" r="8" fill="#2fa85a"/><circle cx="40" cy="300" r="8" fill="#c9761a"/></svg>
<div><h1>${person.name}</h1><p>${person.headline}</p></div>
<div class="row"><span class="chip">🐞 5 bugs are hiding on the site. Can you find them?</span><span>${person.location}</span></div>
</body></html>`;

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// One preview per project page: name, tagline and stack.
const projectOg = (p) => `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
body{width:1200px;height:630px;background:radial-gradient(700px 420px at 92% 0%,rgba(139,108,255,.45),transparent 60%),radial-gradient(600px 400px at 0% 100%,rgba(255,209,102,.18),transparent 60%),#110e33;color:#f4f2ff;padding:64px 80px;display:flex;flex-direction:column;justify-content:space-between;font-family:Archivo;position:relative;overflow:hidden}
body::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.08) 1.5px,transparent 1.5px);background-size:30px 30px}
.kind{position:relative;font-size:26px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#bdb8ea}
h1{position:relative;font-size:${(p.name.length > 14 ? 92 : 124)}px;font-weight:900;font-stretch:118%;letter-spacing:-0.04em;line-height:.95;margin-top:18px;padding-bottom:.08em;background:linear-gradient(100deg,#fff 35%,#d8ccff 70%,#ffb8dc 100%);-webkit-background-clip:text;color:transparent}
p{position:relative;font-size:40px;font-weight:650;line-height:1.18;max-width:1000px;margin-top:22px;color:#ffd166}
.row{position:relative;display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
ul{list-style:none;display:flex;flex-wrap:wrap;gap:10px;padding:0;max-width:820px}
li{font-size:22px;font-weight:650;border:2px solid rgba(139,108,255,.6);background:rgba(139,108,255,.14);border-radius:12px;padding:6px 14px}
.by{font-size:28px;font-weight:800;color:#f4f2ff;white-space:nowrap}
</style></head><body>
<div><div class="kind">${esc(p.kind)}</div><h1>${esc(p.name)}</h1><p>${esc(p.tagline)}</p></div>
<div class="row"><ul>${p.stack.slice(0, 6).map((t) => `<li>${esc(t)}</li>`).join('')}</ul><span class="by">${esc(person.name)}</span></div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
try {
  const ogHtml = join(dir, 'og.html');
  writeFileSync(ogHtml, og);
  const ogOut = join(dir, 'og.png');
  chrome(['--window-size=1200,630', '--force-device-scale-factor=1', `--screenshot=${ogOut}`, '--virtual-time-budget=3000', pathToFileURL(ogHtml).href]);
  copyFileSync(ogOut, join(root, 'public/og.png'));

  mkdirSync(join(root, 'public/og'), { recursive: true });
  for (const p of projects) {
    const html = join(dir, `og-${p.slug}.html`);
    writeFileSync(html, projectOg(p));
    const out = join(dir, `og-${p.slug}.png`);
    chrome(['--window-size=1200,630', '--force-device-scale-factor=1', `--screenshot=${out}`, '--virtual-time-budget=3000', pathToFileURL(html).href]);
    copyFileSync(out, join(root, 'public/og', `${p.slug}.png`));
  }

  const svg = pathToFileURL(join(root, 'public/favicon.svg')).href;
  for (const [size, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']]) {
    const html = join(dir, `icon-${size}.html`);
    writeFileSync(html, `<!doctype html><style>*{margin:0}body{width:${size}px;height:${size}px;background:#110E33}img{display:block;width:${size}px;height:${size}px}</style><img src="${svg}">`);
    const out = join(dir, name);
    chrome([`--window-size=${size},${size}`, '--force-device-scale-factor=1', `--screenshot=${out}`, pathToFileURL(html).href]);
    copyFileSync(out, join(root, 'public', name));
  }
  console.log('Wrote public/og.png, public/og/<project>.png, public/favicon-32.png, public/apple-touch-icon.png');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
