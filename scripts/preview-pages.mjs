// Serves the GitHub Pages build locally at http://localhost:4322/portfolio/
process.env.SITE_URL = 'https://abhiram200.github.io';
process.env.BASE_PATH = '/portfolio';
const { preview } = await import('astro');
await preview({ server: { port: 4322 } });
