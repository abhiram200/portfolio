// Escape text and render `backticks` as inline code.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
export const plain = (s) => s.replace(/`/g, '');
