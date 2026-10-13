// Lab measurement of LCP, CLS, FCP and page weight with a local headless
// Chrome, emulating a mid-range phone (4x CPU slowdown, fast 4G).
// Usage: node scripts/measure-vitals.mjs [url ...]
// Default: the local preview (npm run preview:pages) home and one project page.
// These are lab numbers from one machine, not field data from real visitors.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromePath } from './chrome.mjs';

const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['http://localhost:4322/portfolio/', 'http://localhost:4322/portfolio/work/forcingknight/'];
const PORT = 9333;
const profile = mkdtempSync(join(tmpdir(), 'vitals-'));
const proc = spawn(chromePath(), ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], {
  stdio: 'ignore',
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
  } catch {
    /* not up yet */
  }
}
if (!target) throw new Error('Chrome did not start');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? msg.error);
    pending.delete(msg.id);
  } else if (msg.method) events.push(msg);
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const id = ++seq;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2.6, mobile: true });
await send('Emulation.setCPUThrottlingRate', { rate: 4 });
// Roughly "fast 4G": 150 ms latency, 9 Mbps down, 1.5 Mbps up.
await send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1125000, uploadThroughput: 187500 });
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__v={lcp:0,cls:0};
new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__v.lcp=e.startTime;window.__v.lcpEl=(e.element&&(e.element.tagName+(e.element.id?'#'+e.element.id:'')))||e.url}}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__v.cls+=e.value}).observe({type:'layout-shift',buffered:true});`,
});

// One unmeasured load first: a fresh Chrome's first page pays start-up costs
// that real visitors' already-running browsers don't.
const runs = [urls[0], ...urls];
for (const [i, url] of runs.entries()) {
  events.length = 0;
  await send('Page.navigate', { url });
  for (let i = 0; i < 100 && !events.some((e) => e.method === 'Page.loadEventFired'); i++) await sleep(100);
  await sleep(2500);
  const { result } = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const nav = performance.getEntriesByType('navigation')[0];
      const res = performance.getEntriesByType('resource');
      return {
        fcp: Math.round(fcp ? fcp.startTime : -1),
        lcp: Math.round(window.__v.lcp),
        lcpElement: window.__v.lcpEl,
        cls: +window.__v.cls.toFixed(3),
        load: Math.round(nav.loadEventEnd),
        kb: Math.round((nav.transferSize + res.reduce((a, e) => a + e.transferSize, 0)) / 1024),
        js: Math.round(res.filter((e) => e.initiatorType === 'script' || e.name.endsWith('.js')).reduce((a, e) => a + e.transferSize, 0) / 1024),
        requests: res.length + 1,
      };
    })()`,
  });
  if (i === 0) continue;
  console.log(url);
  const v = result.value;
  console.log(`  FCP ${v.fcp} ms | LCP ${v.lcp} ms (${v.lcpElement}) | CLS ${v.cls} | load ${v.load} ms | ${v.kb} KB in ${v.requests} requests (${v.js} KB JS)`);
}

ws.close();
proc.kill();
await sleep(500);
try {
  rmSync(profile, { recursive: true, force: true });
} catch {
  /* Chrome may still hold files briefly */
}
