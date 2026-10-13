// One résumé template for both versions. `privateDetails` adds phone and
// address; it is only ever passed in by build-resume.mjs --private.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  person,
  experience,
  volunteering,
  projects,
  education,
  certifications,
  publication,
  skills,
} from '../src/data/profile.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '');
const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export function resumeHtml({ root, privateDetails = null }) {
  const font = (p) => pathToFileURL(join(root, 'node_modules/@fontsource-variable', p)).href;

  const contact = [
    privateDetails?.address ? esc(privateDetails.address) : esc(person.location),
    privateDetails?.phone ? esc(privateDetails.phone) : null,
    `<a href="mailto:${person.email}">${person.email}</a>`,
    `<a href="${person.linkedin}">${bare(person.linkedin)}</a>`,
    `<a href="${person.github}">${bare(person.github)}</a>`,
  ].filter(Boolean);

  const jobs = experience
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-head">
        <h3>${esc(e.title)}, ${esc(e.org)}</h3>
        <span class="date">${esc(e.place)} | ${esc(e.start)} to ${esc(e.end)}</span>
      </div>
      <ul>${(e.resume ?? e.bullets).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p class="tech">${e.stack.map(esc).join(', ')}</p>
    </div>`,
    )
    .join('');

  const work = projects
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-head">
        <h3>${esc(p.fullName ?? p.name)}</h3>
        <span class="date">${esc(p.dates)}</span>
      </div>
      <p class="sub">${esc(p.tagline)} <a href="${p.links[0].href}">${bare(p.links[0].href)}</a></p>
      <ul>${p.resume.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p class="tech">${p.stack.map(esc).join(', ')}</p>
    </div>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${person.name}: Résumé</title>
<meta name="author" content="${person.name}">
<meta name="description" content="${esc(person.headline)}">
<style>
@font-face{font-family:Archivo;src:url(${font('archivo/files/archivo-latin-wdth-normal.woff2')}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:Archivo;src:url(${font('archivo/files/archivo-latin-ext-wdth-normal.woff2')}) format('woff2');font-weight:100 900;font-stretch:62% 125%;unicode-range:U+0100-02BA,U+1E00-1EFF}
@font-face{font-family:SourceSerif;src:url(${font('source-serif-4/files/source-serif-4-latin-opsz-normal.woff2')}) format('woff2');font-weight:200 900}
@page{size:A4;margin:10mm 14mm 10mm}
*{box-sizing:border-box}
body{margin:0;font-family:SourceSerif,Georgia,serif;font-size:9pt;line-height:1.3;color:#14213d}
a{color:#0b7261;text-decoration:none}
h1,h2,h3{font-family:Archivo,Arial,sans-serif;margin:0}
h1{font-size:25pt;font-weight:850;font-stretch:120%;letter-spacing:-0.02em;line-height:1}
.headline{font-family:Archivo,Arial,sans-serif;font-size:11.5pt;font-weight:500;margin:3pt 0 5pt}
.contact{font-family:Archivo,Arial,sans-serif;font-size:8.8pt;margin:0;color:#4b5565}
.contact span+span::before{content:" | ";color:#9aa3b2}
h2{font-size:10.5pt;font-weight:750;font-stretch:110%;border-bottom:1.5pt solid #14213d;padding-bottom:1.5pt;margin:9pt 0 4pt}
.summary{margin:7pt 0 0}
.entry{margin:0 0 6.5pt;break-inside:avoid}
.entry-head{display:flex;justify-content:space-between;align-items:baseline;gap:8pt}
h3{font-size:9.8pt;font-weight:700}
.date{font-family:Archivo,Arial,sans-serif;font-size:8.6pt;color:#4b5565;white-space:nowrap}
.sub{margin:1pt 0 1pt;font-style:italic}
.sub a{font-style:normal;font-family:Archivo,Arial,sans-serif;font-size:8.4pt}
ul{margin:2pt 0 0;padding-left:11pt}
li{margin:0 0 1.2pt}
.tech{font-family:Archivo,Arial,sans-serif;font-size:8.3pt;color:#4b5565;margin:1.5pt 0 0}
.skills p{margin:0 0 2.5pt}
.skills b,.label{font-family:Archivo,Arial,sans-serif;font-weight:650}
.two{display:grid;grid-template-columns:1fr 1fr;gap:0 16pt}
.plain{margin:0 0 3pt}
</style>
</head>
<body>
<header>
  <h1>${person.name}</h1>
  <p class="headline">${esc(person.headline)}</p>
  <p class="contact">${contact.map((c) => `<span>${c}</span>`).join('')}</p>
  <p class="summary">${esc(person.role)} at ${esc(person.employer)}, keeping daily batch ETL pipelines running for an enterprise client: monitoring the daily loads, fixing failed ones down to the root cause, correcting historical data and resolving defects in Scala and SQL transformation code. Builds AI systems end to end on his own time. ${esc(person.seeking.summary)}</p>
</header>

<section>
  <h2>Experience</h2>
  ${jobs}
</section>

<section>
  <h2>Projects</h2>
  ${work}
</section>

<section class="skills">
  <h2>Skills</h2>
  ${skills.map((s) => `<p><b>${esc(s.area)}:</b> ${s.items.map(esc).join(', ')}</p>`).join('')}
</section>

<div class="two">
<section>
  <h2>Certifications</h2>
  ${certifications
    .map((c) => `<p class="plain"><span class="label">${esc(c.name)}</span><br>${esc(c.issuer)}, ${esc(c.earned)} (valid to ${esc(c.validTo)}). <a href="${c.href}">Verify</a></p>`)
    .join('')}
  <h2>Volunteering</h2>
  ${volunteering.map((v) => `<p class="plain"><span class="label">${esc(v.title)}, ${esc(v.org)} (${esc(v.year)})</span><br>${esc(v.text)}</p>`).join('')}
</section>
<section>
  <h2>Education</h2>
  <p class="plain"><span class="label">${esc(education.degree)}</span><br>${esc(education.school)}, ${esc(education.place)}, ${esc(education.dates)}</p>
  <h2>Publication</h2>
  <p class="plain">“${esc(publication.title)}”, ${esc(publication.venue)}, ${esc(publication.issue)}. ${esc(publication.authors)}. <a href="${publication.href}">PDF</a></p>
  <p class="plain"><span class="label">Languages:</span> ${person.languages.join(', ')}</p>
</section>
</div>
</body>
</html>`;
}
