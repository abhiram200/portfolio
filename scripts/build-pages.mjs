// Production build for GitHub Pages: https://abhiram200.github.io/portfolio/
// The SEO checks run on the output, so a build with broken metadata fails.
process.env.SITE_URL = 'https://abhiram200.github.io';
process.env.BASE_PATH = '/portfolio';
const { build } = await import('astro');
await build({});
await import('./check-seo.mjs');
