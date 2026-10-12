// Every link that leaves the site (other domains, PDFs) opens in a new tab.
// Links to sections and pages of this site stay in the same tab.
const NOTE = ' (opens in a new tab)';

export function isExternal(a) {
  const href = a.getAttribute('href') ?? '';
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  const url = new URL(href, location.href);
  return url.origin !== location.origin || url.pathname.toLowerCase().endsWith('.pdf');
}

export function markExternal(root = document) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (a.dataset.ext || !isExternal(a)) return;
    a.dataset.ext = '1';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const note = document.createElement('span');
    note.className = 'visually-hidden';
    note.textContent = NOTE;
    a.append(note);
  });
}
