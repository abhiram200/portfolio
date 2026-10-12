// Prefixes a site-internal path with the deploy base (for example /portfolio
// on GitHub Pages). In Node (tests, scripts) there is no base, so paths are
// returned unchanged.
const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const PREFIX = BASE.replace(/\/+$/, '');

export const url = (path) => (path.startsWith('/') ? `${PREFIX}${path}` : path);
