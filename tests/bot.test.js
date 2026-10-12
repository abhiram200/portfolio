import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ask } from '../src/scripts/bot.js';
import { projects } from '../src/data/profile.js';

// [question, expected id (or list of acceptable ids), text the answer must include]
const cases = [
  // About and role
  ['Who is Abhiram?', 'about', 'data pipelines and AI systems'],
  ['Tell me a bit about him', 'about', 'EY GDS'],
  ['Where does he work right now?', 'current-role', 'EY GDS'],
  ['What is his current job title?', 'current-role', 'Associate Software Engineer'],
  ['What are history fixes?', 'ey-work', 'history fixes'],
  ['How does he debug failed ETL loads?', 'ey-work', 'root cause'],
  ['What is he best at?', 'strength', 'debugging'],
  ['Why should we hire him?', 'strength', 'debugging'],
  // Availability and contact
  ['Is he open to work?', 'availability', 'actively looking'],
  ['Is he looking for a new job?', 'availability', 'cloud operations'],
  ['Would he be interested in cloud ops roles?', 'availability', 'AWS EC2'],
  ['How can I get in touch with him?', 'contact', 'abhiramrs24@gmail.com'],
  ['What is his email address?', 'contact', 'abhiramrs24@gmail.com'],
  ['Where can I download his CV?', 'resume', 'PDF'],
  ['Where is he based?', 'location', 'Trivandrum'],
  ['What languages does he speak?', 'languages-spoken', 'Malayalam'],
  // Experience
  ['What is his work history?', 'experience', 'Perusal Gulf'],
  ['What did he build at Perusal Gulf?', 'perusal', 'backend and server hosting only'],
  ['Did he build the frontend for the welding platform?', ['perusal', 'passage:perusal'], 'another team member built the frontend'],
  ['Tell me about his internship', 'bendra', 'WordPress'],
  ['Has he led a team before?', ['tedx', 'passage:tedx'], 'volunteer'],
  // Projects
  ['What projects has he built?', 'projects', 'AURA'],
  ['What is AURA?', 'aura', '48,000'],
  ['Tell me about his AI coding workspace', 'aura', 'knowledge graph'],
  ['How does SYNAPSE work?', ['synapse', 'passage:synapse'], 'Tree-sitter'],
  ['Is SYNAPSE a copy of GitNexus?', ['synapse', 'passage:synapse'], 'own implementation'],
  ['What is Reverse Learning?', 'reverse-learning', 'understanding, not completion'],
  ['How does Reverse Learning decide whether to advance a learner?', 'reverse-learning-engineering', 'decision engine'],
  ['How did he handle long-running jobs on Vercel?', ['reverse-learning-engineering', 'passage:reverse-learning'], 'SKIP LOCKED'],
  ['Tell me about the chess engine', 'forcingknight', 'rented GPU'],
  ['What Elo does ForcingKnight play at?', 'forcingknight-elo', 'not official or FIDE'],
  ['Did adding MCTS help the chess engine?', 'forcingknight-elo', '1892'],
  ['What was his final year project?', 'lora', 'in-vehicle edge unit'],
  ['What did he do in the LoRa project?', 'lora', 'threshold-based checks'],
  ['Has he published any research?', 'publication', 'IJIRT'],
  ['Did he use AI to build his projects?', 'ai-assisted', 'Claude Code'],
  // Skills and credentials
  ['What are his technical skills?', 'skills', 'PySpark'],
  ['Does he know PySpark?', 'tech:pyspark', 'EY'],
  ['Has he worked with AWS?', 'tech:aws ec2', 'EC2'],
  ['Does he use PostgreSQL?', 'tech:postgresql', 'Reverse Learning'],
  ['Has he used React?', 'tech:react', 'AURA'],
  ['What certifications does he have?', 'certifications', 'Databricks'],
  ['Is he Databricks certified?', ['certifications', 'tech:databricks'], 'Data Engineer Associate'],
  ['Where did he study?', 'education', 'Rajadhani'],
  ['When did he graduate?', 'education', '2025'],
  // Declines: confidentiality and personal
  ['What is his phone number?', 'decline-phone', 'isn\'t shared'],
  ['Can I call him on WhatsApp?', 'decline-phone', 'isn\'t shared'],
  ['What is his home address?', 'decline-address', 'Trivandrum'],
  ['What salary does he expect?', 'decline-salary', 'Salary'],
  ['How much does he earn at EY?', 'decline-salary', 'Salary'],
  ['Who is the client at EY?', 'decline-client', 'confidential'],
  ['Which bank are the EY pipelines for?', 'decline-client', 'confidential'],
  ['What industry is his EY client in?', 'decline-client', 'confidential'],
  ['Who was the Perusal Gulf end client?', 'decline-client', 'confidential'],
  ['How old is he?', 'decline-personal', 'personal'],
  ['Is he married?', 'decline-personal', 'personal'],
  ['Rate his Python skills out of 10', 'decline-rating', 'Python'],
  ['How good is he at SQL?', 'decline-rating', 'SQL'],
  ['What is the Bendra Aerospace website?', 'decline-bendra-site', 'isn\'t linked'],
  // Outside its knowledge
  ['Does he know Kubernetes?', 'tech-unknown', 'don\'t have anything'],
  ['Is he willing to relocate?', 'unknown', 'abhiramrs24@gmail.com'],
  ['What is his favourite movie?', 'unknown', 'abhiramrs24@gmail.com'],
  ['What is the capital of France?', 'unknown', 'abhiramrs24@gmail.com'],
  ['Can he start next month?', 'unknown', 'abhiramrs24@gmail.com'],
  // Small talk
  ['hello', 'talk:greeting', 'Abhiram'],
  ['thanks!', 'talk:thanks', 'welcome'],
];

for (const [q, expected, include] of cases) {
  test(`"${q}"`, () => {
    const r = ask(q);
    const ok = Array.isArray(expected) ? expected : [expected];
    assert.ok(ok.includes(r.id), `expected ${ok.join(' or ')}, got ${r.id}: ${r.answer}`);
    assert.ok(r.answer.toLowerCase().includes(include.toLowerCase()), `answer missing "${include}": ${r.answer}`);
  });
}

test('at least 40 questions in the test set', () => {
  assert.ok(cases.length >= 40);
});

// Safety properties that must hold for every answer, including fallbacks.
const probes = [
  ...cases.map((c) => c[0]),
  'Did he use Claude for the chess engine?',
  'Did he use AI for ForcingKnight?',
  'Was ForcingKnight AI-assisted?',
  'Tell me everything about ForcingKnight training',
  'Is the EY work in production?',
  'Give me his mobile',
  'Where exactly does he live?',
  'Who is the end client of the welding platform?',
  'What percentage did he improve performance by?',
];

test('no answer leaks forbidden content', () => {
  for (const q of probes) {
    const { id, answer, links } = ask(q);
    const all = `${answer} ${links.map((l) => `${l.label} ${l.href}`).join(' ')}`;
    assert.ok(!/(?<![\w/-])(\+91[\s-]?)?\d{5}[\s-]?\d{5}(?![\w/-])|\+91/.test(answer), `possible phone number for "${q}"`);
    assert.ok(!/\d+(\.\d+)?\s?%/.test(all), `percentage in answer for "${q}"`);
    assert.ok(!/bendra[a-z]*\.(com|in|net|org)/i.test(all), `Bendra link for "${q}"`);
    assert.ok(!/\bin production\b(?!-grade)|\bproduction environment\b/i.test(all), `production claim for "${q}"`);
    if (/forcingknight|chess/i.test(q) || id.startsWith('forcingknight')) {
      assert.ok(!/claude|ai-assisted|copilot/i.test(all), `AI-assistance mention for ForcingKnight: "${q}" -> ${answer}`);
    }
  }
});

test('every internal link points at a real page', () => {
  const pages = new Set(['/', ...projects.map((p) => `/work/${p.slug}/`), '/Abhiram-RS-Resume.pdf']);
  for (const q of probes) {
    for (const { href } of ask(q).links) {
      if (!href.startsWith('/')) continue;
      assert.ok(pages.has(href.split('#')[0] || '/'), `unknown internal link ${href} for "${q}"`);
    }
  }
});
