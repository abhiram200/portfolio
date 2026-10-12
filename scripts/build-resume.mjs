// Builds the résumé PDFs from scripts/resume-template.mjs using a local
// headless Chrome (real text, so it stays ATS-readable).
//
//   npm run resume            -> public/Abhiram-RS-Resume.pdf (no phone, no address)
//   npm run resume:private    -> private PDF written OUTSIDE the project
//
// Private details are read from environment variables RESUME_PHONE and
// RESUME_ADDRESS, or from a JSON file ({ "phone": "...", "address": "..." })
// at RESUME_PRIVATE_FILE (default: ~/.abhiram-resume/private.json).
// Output path: RESUME_PRIVATE_OUT (default: ~/Documents/Abhiram-RS-Resume-Private.pdf).
// Nothing private is ever written inside the project folder.
import { writeFileSync, mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, resolve, dirname, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chrome } from './chrome.mjs';
import { resumeHtml } from './resume-template.mjs';

const root = resolve(import.meta.dirname, '..');
const isPrivate = process.argv.includes('--private');

function loadPrivate() {
  let phone = process.env.RESUME_PHONE?.trim();
  let address = process.env.RESUME_ADDRESS?.trim();
  const file = process.env.RESUME_PRIVATE_FILE || join(homedir(), '.abhiram-resume', 'private.json');
  if ((!phone || !address) && existsSync(file)) {
    if (isInside(root, resolve(file))) throw new Error(`Refusing to read private details from inside the project: ${file}`);
    const data = JSON.parse(readFileSync(file, 'utf8'));
    phone ||= data.phone?.trim();
    address ||= data.address?.trim();
  }
  if (!phone || !address) {
    throw new Error(
      `Private résumé needs a phone number and address. Set RESUME_PHONE and RESUME_ADDRESS, or create ${file} with {"phone": "...", "address": "..."}.`,
    );
  }
  return { phone, address };
}

function isInside(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

const out = isPrivate
  ? resolve(process.env.RESUME_PRIVATE_OUT || join(homedir(), 'Documents', 'Abhiram-RS-Resume-Private.pdf'))
  : join(root, 'public', 'Abhiram-RS-Resume.pdf');

if (isPrivate && isInside(root, out)) {
  console.error(`Refusing to write the private résumé inside the project folder (${out}). Choose a path outside it.`);
  process.exit(1);
}

const privateDetails = isPrivate ? loadPrivate() : null;
const dir = mkdtempSync(join(tmpdir(), 'resume-'));
try {
  const html = join(dir, 'resume.html');
  const pdf = join(dir, 'resume.pdf');
  writeFileSync(html, resumeHtml({ root, privateDetails }));
  chrome(['--no-pdf-header-footer', '--virtual-time-budget=3000', `--print-to-pdf=${pdf}`, pathToFileURL(html).href]);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(pdf, out);
  console.log(`Wrote ${out}`);
} finally {
  // The temporary HTML holds private details for the private build, so always remove it.
  rmSync(dir, { recursive: true, force: true });
}
