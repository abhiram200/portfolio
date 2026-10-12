// Production build for GitHub Pages: https://abhiram200.github.io/portfolio/
process.env.SITE_URL = 'https://abhiram200.github.io';
process.env.BASE_PATH = '/portfolio';
const { build } = await import('astro');
await build({});
