// Knowledge base for the "Ask about Abhiram" assistant.
// Every answer is composed from profile.js, so the assistant and the site
// cannot disagree. Nothing here may contain facts that are not in profile.js.

import { url } from '../lib/url.js';
import {
  person,
  experience,
  volunteering,
  projects,
  forcingKnightElo,
  otherWork,
  education,
  certifications,
  publication,
  skills,
  resumeFile,
} from './profile.js';

const strip = (s) => s.replace(/`/g, '');
const listJoin = (items) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
const project = (slug) => projects.find((p) => p.slug === slug);
const job = (id) => experience.find((e) => e.id === id);
const projectLink = (p) => ({ label: `${p.fullName ?? p.name} case study`, href: `/work/${p.slug}/` });

const contactLinks = [
  { label: `Email ${person.email}`, href: `mailto:${person.email}` },
  { label: 'LinkedIn', href: person.linkedin },
  { label: 'GitHub', href: person.github },
];

export const contactLine = `You can reach him by email at ${person.email}, or on LinkedIn.`;

// ---------------------------------------------------------------------------
// Guardrails: checked before retrieval. Each has a pattern and a fixed reply.
// ---------------------------------------------------------------------------
export const guards = [
  {
    id: 'decline-phone',
    test: (q) =>
      /\b(phone|telephone|mobile|cell ?phone|whats ?app|landline)\b/.test(q) ||
      /\b(contact|cell|personal) number\b/.test(q) ||
      /\bcall (him|abhiram)\b/.test(q) ||
      /\bhis number\b/.test(q),
    answer: `His phone number isn't shared here. ${contactLine}`,
    links: contactLinks,
  },
  {
    id: 'decline-address',
    test: (q) =>
      !/\bemail\b|\be-mail\b|\bmail address\b/.test(q) &&
      (/\b(home|house|street|postal|residential|full|exact) address\b/.test(q) ||
        /\baddress\b/.test(q) ||
        /\bwhere (exactly )?does (he|abhiram) (live|stay|reside)\b/.test(q) ||
        /\b(pin ?code|zip ?code)\b/.test(q)),
    answer: `He's based in ${person.location}. His home address isn't shared here. ${contactLine}`,
    links: contactLinks,
  },
  {
    id: 'decline-salary',
    test: (q) =>
      /\b(salary|salaries|ctc|compensation|wage|wages|pay ?scale|paycheck|stipend|lpa|package|hourly rate|day rate|remuneration)\b/.test(q) ||
      /\bhow much (does|did|is) (he|abhiram)\b.*\b(earn|make|paid|charge|get)\b/.test(q) ||
      /\b(expected|current) (pay|salary)\b/.test(q) ||
      /\b(earn|earns|earning|earnings)\b/.test(q),
    answer: `Salary and compensation aren't covered here. That's a conversation to have with him directly. ${contactLine}`,
    links: contactLinks,
  },
  {
    id: 'decline-client',
    test: (q) =>
      (/\b(client|clients|customer|customers|end client|end-client)\b/.test(q) &&
        /\b(who|which|what|name|named|called|company|industry|domain|sector|bank|business|for whom|identity|website|site|url|country|work for|works for)\b/.test(q)) ||
      /\bwhich (bank|company|firm|insurer|retailer|telecom)\b.*\b(ey|pipelines?|data)\b/.test(q) ||
      /\b(ey|perusal)\b.*\b(bank|insurance|retail|pharma|healthcare|telecom|airline|oil|government)\b/.test(q),
    answer:
      'Client details are confidential, so they aren’t shared here. At EY he supports data pipelines for an enterprise client. At Perusal Gulf he built the backend for a private, role-based welding-certification platform.',
    links: [
      { label: 'EY role on the home page', href: '/#experience' },
    ],
  },
  {
    id: 'decline-personal',
    test: (q) =>
      /\b(age|old is he|how old|birthday|date of birth|dob|married|marital|wife|girlfriend|boyfriend|partner|religion|religious|caste|politic|political|vote|votes|health|medical|family|parents|siblings|kids|children|height|weight)\b/.test(q),
    answer: `That's personal, so it isn't covered here. I can only answer questions about his work, projects, skills and how to contact him.`,
    links: [],
  },
  {
    id: 'decline-photo',
    test: (q) => /\b(photo|photos|picture|pictures|selfie|headshot|what does he look like|face)\b/.test(q) && !/face.?recognition/.test(q),
    answer: `There's no photo of him on this site. You can find him on LinkedIn.`,
    links: [{ label: 'LinkedIn', href: person.linkedin }],
  },
  {
    id: 'decline-bendra-site',
    test: (q) => /\bbendra\b/.test(q) && /\b(website|site|url|link|domain)\b/.test(q) && !/\bwordpress\b/.test(q),
    answer: `${job('bendra').bullets[0]} The company's site isn't linked here.`,
    links: [{ label: 'Experience on the home page', href: '/#experience' }],
  },
  {
    // ForcingKnight's build is described only as his own development and training.
    id: 'forcingknight-build',
    test: (q) =>
      /\b(forcingknight|forcing knight|chess)\b/.test(q) &&
      /\b(ai|claude|copilot|chatgpt|gpt|llm|assist|assisted|ai-assisted|help|helped|himself|alone|solo|who built|who made)\b/.test(q) &&
      !/\b(elo|rating|strength|strong|mcts)\b/.test(q),
    answer:
      'Abhiram did the development and training of ForcingKnight himself, on a rented GPU: the data pipeline, the network, the search and the desktop app. The final model took about 4 to 5 hours to train.',
    links: [{ label: 'ForcingKnight case study', href: '/work/forcingknight/' }],
  },
  {
    id: 'decline-rating',
    test: (q) =>
      /\b(rate|rating|score|out of 10|out of ten|percent|percentage|proficiency|proficient|expert|expertise level|level of|how good|how strong|how skilled|better than|compare (him|abhiram))\b/.test(q) &&
      !/\belo\b|\bchess\b|\bforcingknight\b|\bengine\b|\blearning rate\b|\bstrength of (the )?(engine|model|net)/.test(q),
    answer:
      'He doesn’t rate his skills with levels or percentages, because none have been measured. Instead, each skill on the site is tied to the work that shows it. Ask about a specific technology and I’ll tell you where he used it.',
    links: [{ label: 'Skills and evidence', href: '/#skills' }],
  },
];

// ---------------------------------------------------------------------------
// Retrieval entries. `q` holds example phrasings, `k` extra keywords.
// ---------------------------------------------------------------------------
const ey = job('ey');
const perusal = job('perusal');
const bendra = job('bendra');
const tedx = volunteering[0];
const aura = project('aura');
const synapse = project('synapse');
const rl = project('reverse-learning');
const fk = project('forcingknight');
const lora = project('lora-alerting');
const elo = forcingKnightElo;

export const entries = [
  {
    id: 'greeting',
    q: ['hi', 'hello', 'hey there', 'good morning', 'what can you do', 'what can i ask', 'help'],
    k: [],
    answer:
      'Hi. I answer questions about Abhiram: his experience, projects, skills, certifications, availability and how to contact him. Everything I say comes from the facts on this site.',
  },
  {
    id: 'thanks',
    q: ['thanks', 'thank you', 'great thanks', 'cheers', 'bye', 'goodbye'],
    k: [],
    answer: `You're welcome. ${contactLine}`,
    links: contactLinks,
  },
  {
    id: 'about',
    q: ['who is abhiram', 'tell me about abhiram', 'who is he', 'introduce him', 'summary of abhiram', 'what does he do', 'give me an overview', 'background'],
    k: ['about', 'bio', 'introduction', 'profile', 'overview'],
    answer: `${person.name} is a software engineer working across data pipelines and AI systems. He's an ${person.role} at ${person.employer} in ${person.location} (since ${person.roleSince}), where he keeps daily batch ETL pipelines running for an enterprise client. On his own time he builds AI systems end to end: a code knowledge graph (SYNAPSE), an agentic coding workspace (AURA), an AI learning platform (Reverse Learning) and a neural chess engine he trained himself (ForcingKnight).`,
    links: [{ label: 'Home page', href: '/' }],
  },
  {
    id: 'current-role',
    q: ['where does he work', 'what is his current job', 'current role', 'current employer', 'what does he do at ey', 'ey gds', 'tell me about his job at ey', 'what is his title'],
    k: ['ey', 'gds', 'employer', 'job', 'associate', 'company', 'working', 'currently', 'present', 'position', 'title', 'now', 'right now', 'today'],
    answer: `He's an ${ey.title} at ${ey.org}, ${ey.place}, since ${ey.start}. ${ey.context} ${ey.bullets[0]} ${ey.bullets[1]}`,
    links: [{ label: 'Experience', href: '/#experience' }],
  },
  {
    id: 'ey-work',
    q: ['what does he do day to day', 'history fixes', 'what are history fixes', 'etl pipelines', 'tidal scheduler', 'spark jobs', 'how does he debug failed loads', 'data pipeline work', 'oracle cloud cloudberry'],
    k: ['etl', 'pipeline', 'pipelines', 'batch', 'tidal', 'spark', 'pyspark', 'oci', 'oracle', 'cloudberry', 'history', 'uat', 'load', 'loads', 'scala', 'daily'],
    answer: `At ${ey.org} his work is: ${ey.bullets.map((b) => b.replace(/\.$/, '')).join('; ')}. Stack: ${listJoin(ey.stack)}.`,
    links: [{ label: 'Experience', href: '/#experience' }],
  },
  {
    id: 'strength',
    q: ['what is his biggest strength', 'what is he best at', 'what is he good at', 'core strength', 'why should we hire him', 'what makes him stand out', 'strongest skill'],
    k: ['strength', 'strengths', 'strongest', 'hire', 'stand', 'debugging', 'debug', 'troubleshooting', 'root', 'cause'],
    answer: `Two things stand out. His personal projects show he can design and build complete AI systems end to end, from SYNAPSE and AURA to a chess engine he trained himself. His EY work adds careful debugging: following a failure across code, schedulers, logs and data files until the root cause is clear, then fixing it properly.`,
  },
  {
    id: 'availability',
    q: ['is he looking for a job', 'is he open to work', 'is he available', 'what roles is he looking for', 'is he job hunting', 'would he consider a new role', 'what kind of job does he want', 'is he interested in cloud ops'],
    k: ['looking', 'open', 'available', 'availability', 'hiring', 'roles', 'opportunities', 'opportunity', 'search', 'interested', 'cloud', 'ops', 'operations', 'devops', 'vm', 'vms', 'want'],
    answer: `Yes. He's actively looking for roles in software engineering, data engineering and cloud operations. He's particularly interested in cloud ops work such as running and managing VMs, for example on AWS EC2, which he did for the Perusal Gulf platform. ${contactLine}`,
    links: [...contactLinks, { label: 'Résumé (PDF)', href: resumeFile }],
  },
  {
    id: 'contact',
    q: ['how can i contact him', 'what is his email', 'how do i reach him', 'email address', 'get in touch', 'linkedin profile', 'github profile', 'how to hire him'],
    k: ['contact', 'email', 'mail', 'reach', 'touch', 'linkedin', 'github', 'message', 'connect'],
    answer: `Email is best: ${person.email}. He's also on LinkedIn and GitHub (${person.githubHandle}).`,
    links: contactLinks,
  },
  {
    id: 'resume',
    q: ['can i see his resume', 'download cv', 'resume pdf', 'where is his cv'],
    k: ['resume', 'résumé', 'cv', 'pdf', 'download'],
    answer: 'His résumé is available as a PDF on this site. It covers the same experience, projects, skills and credentials as the site.',
    links: [{ label: 'Résumé (PDF)', href: resumeFile }],
  },
  {
    id: 'location',
    q: ['where is he based', 'where is he located', 'which city', 'what country is he in', 'location'],
    k: ['based', 'located', 'location', 'city', 'country', 'trivandrum', 'india', 'kerala', 'where'],
    answer: `He's based in ${person.location}.`,
  },
  {
    id: 'languages-spoken',
    q: ['what languages does he speak', 'does he speak english', 'does he speak hindi', 'spoken languages', 'malayalam'],
    k: ['speak', 'spoken', 'english', 'hindi', 'malayalam', 'speaks'],
    answer: `He speaks ${listJoin(person.languages)}.`,
  },
  {
    id: 'experience',
    q: ['what is his work experience', 'past jobs', 'previous employers', 'employment history', 'career history', 'where has he worked', 'how much experience does he have'],
    k: ['experience', 'career', 'history', 'jobs', 'worked', 'employment', 'previous', 'past', 'internship'],
    answer: `${listJoin(experience.map((e) => `${e.title} at ${e.org} (${e.start} to ${e.end === 'Present' ? 'present' : e.end})`))}. He also led the website team for TEDxRIET as a volunteer in ${tedx.year}.`,
    links: [{ label: 'Experience', href: '/#experience' }],
  },
  {
    id: 'perusal',
    q: ['perusal gulf', 'freelance work', 'welding certification platform', 'what did he build at perusal', 'did he do backend work', 'aws ec2 experience', 'has he hosted servers'],
    k: ['perusal', 'gulf', 'freelance', 'welding', 'welder', 'certificate', 'certification platform', 'observer', 'tester', 'mongodb', 'pdfkit', 'emailjs', 'ec2', 'aws', 'firewall', 'hosting', 'hosted', 'server', 'node'],
    answer: `From ${perusal.start} to ${perusal.end}, while studying for his B.Tech, he worked freelance for Perusal Gulf. His scope was backend and server hosting only; another team member built the frontend. The system is a private, role-based welding-certification platform with four roles (admin, tester, observer and welder). ${perusal.bullets[1]} He deployed and ran the whole system on an AWS EC2 instance, including the VM's firewall configuration and shell scripting for server tasks. Stack: ${listJoin(perusal.stack)}.`,
    links: [{ label: 'Experience', href: '/#experience' }],
  },
  {
    id: 'bendra',
    q: ['bendra aerospace', 'internship', 'wordpress work', 'web developer intern'],
    k: ['bendra', 'aerospace', 'intern', 'internship', 'wordpress'],
    answer: `He was a Web Developer Intern at ${bendra.org}, ${bendra.place}, from ${bendra.start} to ${bendra.end}. ${bendra.bullets.join(' ')}`,
    links: [{ label: 'Experience', href: '/#experience' }],
  },
  {
    id: 'tedx',
    q: ['tedx riet', 'volunteering', 'leadership experience', 'has he led a team'],
    k: ['tedx', 'tedxriet', 'volunteer', 'volunteering', 'leadership', 'led', 'lead', 'team'],
    answer: `In ${tedx.year} he volunteered and led the website team for TEDxRIET, the college's first approved TEDx event. The site had a speaker list, an event schedule, a registration form and a countdown to the event. This was volunteer work, not a job.`,
  },
  {
    id: 'projects',
    q: ['what projects has he built', 'show me his projects', 'portfolio projects', 'side projects', 'personal projects', 'what has he made'],
    k: ['projects', 'project', 'built', 'portfolio', 'side', 'personal', 'made', 'work'],
    answer: `His main projects: ${projects.map((p) => `${p.fullName ?? p.name}, ${p.tagline.charAt(0).toLowerCase()}${p.tagline.slice(1, -1)}`).join('; ')}.`,
    links: projects.map(projectLink),
  },
  {
    id: 'latest-project',
    q: ['what is his most recent project', 'what was his most recent project', 'latest project', 'newest project', 'what did he build most recently', 'what is he working on lately', 'what was his last project'],
    k: ['recent', 'recently', 'latest', 'newest', 'lately', 'last'],
    answer: `His most recent project is Reverse Learning (${rl.dates}): an AI learning platform that measures understanding, not completion. It's live, so you can try it yourself.`,
    links: [projectLink(rl), rl.links[0]],
  },
  {
    id: 'first-project',
    q: ['what was his first project', 'earliest project', 'oldest project', 'what did he build first'],
    k: ['first', 'earliest', 'oldest'],
    answer: `Among his main projects, the earliest is the LoRa disaster-alerting system, his final-year B.Tech project (${lora.dates}). Before that he built smaller experiments from 2023 to 2024, like chess-pgn-generator, which came before ForcingKnight.`,
    links: [projectLink(lora)],
  },
  {
    id: 'first-job',
    q: ['what was his first job', 'first internship', 'how did his career begin', 'his first work experience'],
    k: ['first job'],
    answer: `His first role was a web development internship at ${bendra.org} in ${bendra.start}, working on the company's WordPress site.`,
    links: [{ label: 'Experience', href: '/#experience' }],
  },
  {
    id: 'biggest-project',
    q: ['what is his biggest project', 'largest project', 'most complex project', 'most ambitious project'],
    k: ['biggest', 'largest', 'complex', 'ambitious', 'big'],
    answer: 'By code size, AURA: about 48,000 lines of TypeScript, with an editor, real terminals, a git view and an agent with about 40 tools that works from SYNAPSE’s knowledge graph.',
    links: [projectLink(aura)],
  },
  {
    id: 'latest-cert',
    q: ['what is his latest certification', 'most recent certification', 'newest certificate', 'latest certificate'],
    k: ['latest', 'newest'],
    answer: `His newest is the ${certifications[0].name}, earned in ${certifications[0].earned}.`,
    links: [{ label: 'Verify it', href: certifications[0].href }],
  },
  {
    id: 'aura-synapse',
    // Chosen by a rule in bot.js whenever a question names both projects.
    q: [],
    k: [],
    answer: 'AURA’s agent works from SYNAPSE’s live knowledge graph of the project, so it can ask what calls what, what breaks if something changes, or which routes hit a service, without reading every file. After integrating SYNAPSE, AURA extended its parser to 17 languages.',
    links: [projectLink(aura), projectLink(synapse)],
  },
  {
    id: 'aura',
    q: ['what is aura', 'tell me about aura', 'ai coding workspace', 'coding agent project', 'aura agent tools'],
    k: ['aura', 'workspace', 'agent', 'agentic', 'ide', 'editor', 'codemirror', 'terminal', 'xterm', 'pty', 'sub-agents', 'subagents', 'tools', 'playwright'],
    answer: `AURA is ${aura.tagline.charAt(0).toLowerCase()}${aura.tagline.slice(1)} ${strip(aura.sections[1].paragraphs[0])} The agent has about 40 tools, splits large questions across sub-agents, compacts long conversations, detects when it's repeating itself, and loads skills on demand. It's about 48,000 lines of TypeScript, open source, and runs locally.`,
    links: [projectLink(aura), aura.links[0]],
  },
  {
    id: 'synapse',
    q: ['what is synapse', 'tell me about synapse', 'code knowledge graph', 'knowledge graph project', 'impact analysis tool'],
    k: ['synapse', 'graph', 'knowledge', 'tree-sitter', 'treesitter', 'impact', 'bm25', 'rrf', 'reciprocal', 'rename', 'gitnexus', 'routes'],
    answer: `SYNAPSE is ${synapse.tagline.charAt(0).toLowerCase()}${synapse.tagline.slice(1)} It was built first, as AURA's foundation. Tree-sitter parses JavaScript, TypeScript and Python into files, functions, classes and their relationships, and a file watcher keeps the graph current. It answers impact analysis, hybrid BM25 and embedding search, route and API analysis, process tracing, git-diff blast radius and safe renames. It was inspired by GitNexus but is his own implementation. About 16,000 lines of TypeScript.`,
    links: [projectLink(synapse), synapse.links[0]],
  },
  {
    id: 'reverse-learning',
    q: ['what is reverse learning', 'tell me about reverse learning', 'ai learning platform', 'learning app', 'is reverse learning live'],
    k: ['reverse', 'learning', 'learner', 'learners', 'roadmap', 'assessment', 'remediation', 'nextjs', 'next.js', 'prisma', 'neon', 'vercel', 'nextauth'],
    answer: `Reverse Learning is ${rl.tagline.charAt(0).toLowerCase()}${rl.tagline.slice(1)} ${rl.summary} Its key design rule: AI produces scores, code produces decisions. It's live; the source is private.`,
    links: [projectLink(rl), rl.links[0]],
  },
  {
    id: 'reverse-learning-engineering',
    q: ['how does reverse learning make decisions', 'how does it decide whether a learner advances or gets remediation', 'ai produces scores code produces decisions'],
    k: ['decide', 'decides', 'advance', 'gate', 'gated', 'remediate', 'decision', 'decisions', 'scores'],
    answer: `In Reverse Learning the model only supplies a score and a confidence; a pure TypeScript decision engine with no network, database or AI access decides whether to advance, remediate or gate. Model responses are validated with Zod and repaired or retried up to three times. Resource discovery takes 47 to 90 seconds per topic, beyond Vercel's limits, so it runs through a Postgres job queue drained by a GitHub Actions workflow, with jobs claimed using FOR UPDATE SKIP LOCKED. A labelled evaluation suite calibrates scoring, and 59 test files run without a database or network. Known limits: roadmap generation takes 60 to 90 seconds and the generator over-links prerequisites; both are tracked.`,
    links: [projectLink(rl)],
  },
  {
    id: 'forcingknight',
    q: ['what is forcingknight', 'tell me about the chess engine', 'chess ai', 'neural chess engine', 'did he train a model', 'how was forcingknight trained', 'chess project'],
    k: ['forcingknight', 'forcing', 'knight', 'chess', 'stockfish', 'lichess', 'resnet', 'alphazero', 'pytorch', 'trained', 'train', 'training', 'gpu', 'mcts', 'pyside6', 'uci', 'model'],
    answer: `ForcingKnight is ${fk.tagline.charAt(0).toLowerCase()}${fk.tagline.slice(1)} He built the full pipeline himself: generating and streaming training data, training an AlphaZero-style policy-and-value ResNet in PyTorch, adding search (PUCT MCTS with an exact solver and a forcing-line tactical search), and shipping a PySide6 desktop app, a UCI engine and a Windows build. Three checkpoints were trained on 185 thousand, 15 million and 100 million positions; the final model took about 4 to 5 hours on a rented GPU.`,
    links: [projectLink(fk), fk.links[0]],
  },
  {
    id: 'forcingknight-elo',
    q: ['how strong is forcingknight', 'what elo does forcingknight play at', 'what is the elo of the chess engine', 'forcingknight rating', 'how was the strength measured', 'maia ladder', 'did mcts help'],
    k: ['elo', 'elo', 'rating', 'fide', 'strong', 'strength', 'maia', 'ladder', 'ablation', 'measured', 'games', 'help', 'helped'],
    answer: `${elo.method} On the Maia (human-scale) ladder the 100M model scores about 1607 as a raw network, 1892 with MCTS, 1963 with the forcing-line search, and 1972 with an opening book, tablebases and adaptive time. On the Stockfish ladder it's about 1760 with plain MCTS and about 1838 with the forcing-line search. ${elo.conclusion} ${elo.caveat}`,
    links: [projectLink(fk)],
  },
  {
    id: 'lora',
    q: ['lora project', 'disaster alerting system', 'final year project', 'raspberry pi project', 'iot project', 'what did he do in the lora project', 'hardware project'],
    k: ['lora', 'disaster', 'alert', 'alerting', 'raspberry', 'pi', 'esp32', 'arduino', 'sensor', 'sensors', 'vehicle', 'iot', 'hardware', 'final', 'year', 'embedded'],
    answer: `${lora.fullName} was his final-year B.Tech project (${lora.dates}, team of four). ${strip(lora.sections[0].paragraphs[0])} His part was the software for the in-vehicle edge unit: a Raspberry Pi with a LoRa receiver and a display that listens for broadcasts, uses threshold-based checks to separate noise from real events, and alerts the driver. It's a working prototype, and the paper was published in IJIRT in June 2025.`,
    links: [projectLink(lora), lora.links[0]],
  },
  {
    id: 'publication',
    q: ['has he published a paper', 'publications', 'research paper', 'ijirt'],
    k: ['paper', 'publication', 'publications', 'published', 'research', 'journal', 'ijirt'],
    answer: `"${publication.title}", ${publication.venue}, ${publication.issue}. Authors: ${publication.authors}.`,
    links: [{ label: 'Paper (PDF)', href: publication.href }],
  },
  {
    id: 'ai-assisted',
    q: ['did he use ai to build his projects', 'does he use claude code', 'ai assisted development', 'did he write the code himself', 'how does he work with coding agents', 'vibe coding'],
    k: ['claude', 'copilot', 'ai-assisted', 'assisted', 'agents', 'vibe', 'himself'],
    answer:
      'AURA, SYNAPSE and Reverse Learning were built with Claude Code as an AI-assisted workflow. He wrote or reviewed and shaped the design documents, specs and implementation plans before each phase, and when the agent got stuck on a bug he worked through the logic himself and steered it to the right fix. It shows high-level AI-assisted development on genuinely complex systems. He also holds the GitHub Copilot certification from Microsoft.',
    links: [projectLink(aura), projectLink(synapse), projectLink(rl)],
  },
  {
    id: 'skills',
    q: ['what are his skills', 'tech stack', 'what technologies does he know', 'programming languages', 'what languages does he code in', 'technical skills'],
    k: ['skills', 'skill', 'stack', 'technologies', 'tech', 'tools', 'languages', 'programming', 'know', 'knows'],
    answer: `${skills.map((s) => `${s.area}: ${listJoin(s.items)} (from ${s.evidence})`).join('. ')}.`,
    links: [{ label: 'Skills and evidence', href: '/#skills' }],
  },
  {
    id: 'certifications',
    q: ['what certifications does he have', 'is he certified', 'databricks certification', 'certificates', 'credentials'],
    k: ['certification', 'certifications', 'certified', 'certificate', 'certificates', 'credential', 'credentials', 'databricks', 'copilot', 'microsoft'],
    answer: `${certifications.map((c) => `${c.name} (${c.issuer}, earned ${c.earned}, valid to ${c.validTo})`).join('; ')}. Each has a public verification link.`,
    links: certifications.map((c) => ({ label: `Verify: ${c.name}`, href: c.href })),
  },
  {
    id: 'education',
    q: ['what is his education', 'where did he study', 'what degree does he have', 'college', 'university', 'when did he graduate'],
    k: ['education', 'degree', 'btech', 'b.tech', 'college', 'university', 'study', 'studied', 'graduate', 'graduated', 'rajadhani', 'riet', 'computer', 'science'],
    answer: `${education.degree}, ${education.school}, ${education.place}, ${education.dates}.`,
  },
  {
    id: 'other-work',
    q: ['older projects', 'earlier experiments', 'other github repos', 'face recognition', 'nltk chatbot'],
    k: ['older', 'earlier', 'experiments', 'opencv', 'nltk', 'chatbot', 'repos', 'repositories'],
    answer: `${otherWork.note} ${otherWork.items.map((i) => `${i.name}: ${i.text.replace(/\.$/, '')}`).join('; ')}.`,
    links: [{ label: 'GitHub', href: person.github }],
  },
];

// Short default answers. The full answer is kept as `more` and given when
// the visitor asks to hear more.
const SHORT = {
  "about": "Abhiram RS is a software engineer working across data pipelines and AI systems. He's an Associate Software Engineer at EY GDS in Trivandrum, and on his own time he builds AI systems like SYNAPSE, AURA, Reverse Learning and ForcingKnight.",
  "current-role": "He's an Associate Software Engineer at EY GDS in Trivandrum (since Nov 2025), keeping daily batch ETL pipelines running for an enterprise client: watching the loads, fixing failures and correcting historical data.",
  "ey-work": "Day to day he keeps batch ETL pipelines (Python, Scala, PySpark, SQL) running through Tidal Enterprise Scheduler, debugs failed loads down to the root cause and re-runs them, and does “history fixes”: correcting historical data loads so older periods match the fixed logic.",
  "perusal": "From Apr 2023 to Mar 2024 he freelanced for Perusal Gulf. His scope was backend and server hosting only: the backend for a role-based welding-certification platform, which he deployed and ran on AWS EC2. Another team member built the frontend.",
  "projects": "Five main ones: AURA, SYNAPSE, Reverse Learning, ForcingKnight, and a LoRa disaster-alerting system. Which one should I tell you about?",
  "aura": "AURA is a browser-based AI coding workspace whose agent answers from a live knowledge graph of the project (built on SYNAPSE) instead of reading every file. It’s about 48,000 lines of TypeScript, open source, and runs locally.",
  "synapse": "SYNAPSE turns a codebase into a knowledge graph of files, functions, classes and how they connect, so an AI agent can understand a project almost instantly. He built it first, as the foundation for AURA.",
  "reverse-learning": "Reverse Learning is an AI learning platform that measures understanding, not completion: learners explain concepts back, and weak spots reshape their roadmap. It’s live.",
  "reverse-learning-engineering": "Its core rule is “AI produces scores, code produces decisions”: the model only scores an explanation, and a plain TypeScript decision engine decides whether to advance, remediate or gate the learner.",
  "forcingknight": "ForcingKnight is a neural chess engine he trained himself on a rented GPU, with tree search on top, shipped as a desktop app and a UCI engine.",
  "forcingknight-elo": "Search is the biggest lever: on a human-scale (Maia) ladder, MCTS took the raw network from about 1607 to 1892, and with the forcing-line search it reaches about 1963 to 1972. Against Stockfish it’s about 1838. These are estimates on those scales, not official or FIDE ratings.",
  "lora": "It was his final-year B.Tech project, in a team of four: buried sensors broadcast disaster alerts over LoRa, and he wrote the software for the in-vehicle edge unit, a Raspberry Pi that uses threshold-based checks to tell real alerts from noise and warns the driver.",
  "skills": "Mainly data engineering (PySpark, Scala, SQL, Databricks), AI and ML (PyTorch, LLM agents, hybrid search), backend and cloud (Node.js, Express, PostgreSQL, AWS EC2) and frontend (React, Next.js). Want to know where he used any of them?",
  "certifications": "Three: Databricks Certified Generative AI Engineer Associate (Oct 2026), Databricks Certified Data Engineer Associate (Apr 2026) and GitHub Copilot from Microsoft (Feb 2026). Each links to a public verification page.",
  "ai-assisted": "For AURA, SYNAPSE and Reverse Learning, yes: he built them with Claude Code, writing and reviewing the specs and designs first and working through hard bugs himself when the agent got stuck.",
  "other-work": "A few smaller experiments from 2023 to 2024, all on GitHub: chess-pgn-generator (which came before ForcingKnight), a face-recognition app with OpenCV, an NLTK chatbot, and JSON-DataSet-Maker, a small utility."
};
for (const e of entries) {
  if (SHORT[e.id]) {
    e.more = e.answer;
    e.answer = SHORT[e.id];
  }
}

// Technology index: which work evidences each technology. Built from the
// stacks and skills in profile.js, so it stays in sync automatically.
const aliases = {
  python: ['python'],
  scala: ['scala'],
  pyspark: ['pyspark', 'spark', 'apache spark'],
  sql: ['sql'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js'],
  react: ['react', 'reactjs', 'react.js'],
  'next.js': ['next.js', 'nextjs', 'next js'],
  'node.js': ['node.js', 'nodejs', 'node js', 'node'],
  express: ['express', 'expressjs', 'express.js'],
  mongodb: ['mongodb', 'mongo'],
  postgresql: ['postgresql', 'postgres', 'neon'],
  prisma: ['prisma'],
  'aws ec2': ['aws', 'ec2', 'amazon web services'],
  linux: ['linux'],
  'shell scripting': ['shell', 'bash', 'shell scripting'],
  pytorch: ['pytorch', 'torch'],
  databricks: ['databricks'],
  'tree-sitter': ['tree-sitter', 'treesitter', 'tree sitter'],
  ollama: ['ollama'],
  'three.js': ['three.js', 'threejs', 'three js', 'react-three-fiber'],
  zod: ['zod'],
  vercel: ['vercel'],
  'github actions': ['github actions'],
  'tailwind css': ['tailwind', 'tailwind css'],
  oci: ['oci', 'oracle cloud', 'oracle cloud infrastructure'],
  playwright: ['playwright'],
  stockfish: ['stockfish'],
  'raspberry pi': ['raspberry pi', 'raspberry'],
  docker: ['docker'],
  kubernetes: ['kubernetes', 'k8s'],
  azure: ['azure'],
  gcp: ['gcp', 'google cloud'],
  java: ['java'],
  go: ['golang'],
  rust: ['rust'],
  airflow: ['airflow'],
  kafka: ['kafka'],
  snowflake: ['snowflake'],
  terraform: ['terraform'],
  android: ['android'],
  n8n: ['n8n'],
  'c++': ['c++', 'cpp'],
  angular: ['angular'],
  vue: ['vue', 'vuejs'],
  django: ['django'],
  flask: ['flask'],
  fastapi: ['fastapi'],
};

const sourcesFor = (needle) => {
  const n = needle.toLowerCase();
  const hit = (arr) =>
    arr.some((s) => {
      const t = s.toLowerCase();
      return t === n || t.startsWith(`${n} `) || t.includes(`(${n}`) || t.includes(` ${n} `) || t.endsWith(` ${n}`);
    });
  const out = [];
  for (const e of experience) if (hit(e.stack)) out.push(`${e.org}`);
  for (const p of projects) if (hit(p.stack)) out.push(p.name);
  for (const s of skills) if (hit(s.items)) out.push(`${s.area.toLowerCase()} (${s.evidence})`);
  return [...new Set(out)];
};

const techNotes = {
  python: 'Python: used daily in the ETL pipelines at EY, and for ForcingKnight’s data pipeline, training (PyTorch) and desktop app.',
  scala: 'Scala: he resolves defects in production-grade Scala transformation code in the ETL pipelines at EY.',
  pyspark: 'PySpark: part of the daily batch ETL pipelines he keeps running at EY, where he traces failures through Spark job behaviour. He also holds the Databricks Certified Data Engineer Associate certification.',
  sql: 'SQL: part of the EY pipelines, where he resolves defects in SQL transformation code.',
  typescript: 'TypeScript: AURA (about 48,000 lines), SYNAPSE (about 16,000 lines) and Reverse Learning are all TypeScript.',
  javascript: 'JavaScript ecosystem: the Perusal Gulf backend ran on Node.js, and AURA, SYNAPSE and Reverse Learning are written in TypeScript. SYNAPSE and AURA also parse JavaScript code with Tree-sitter.',
  react: 'React: the frontends of AURA and SYNAPSE (including react-three-fiber for SYNAPSE’s 3D graph), and Reverse Learning via Next.js.',
  'next.js': 'Next.js: Reverse Learning is built on the Next.js App Router.',
  'node.js': 'Node.js: the Perusal Gulf backend (with MongoDB), and the Express servers behind AURA and SYNAPSE.',
  express: 'Express: the servers behind AURA and SYNAPSE.',
  mongodb: 'MongoDB: the database for the Perusal Gulf welding-certification platform.',
  postgresql: 'PostgreSQL: Reverse Learning runs on PostgreSQL (Neon) with Prisma, including a job queue that claims work with FOR UPDATE SKIP LOCKED.',
  prisma: 'Prisma: Reverse Learning’s database layer.',
  'aws ec2': 'AWS EC2: he deployed and ran the whole Perusal Gulf system on an EC2 instance, including the VM’s firewall configuration and shell scripting for server tasks. Cloud ops work like this is one of the areas he’s looking for.',
  linux: 'Linux: he ran the Perusal Gulf server on a Linux VM on AWS EC2, with shell scripts for server tasks.',
  'shell scripting': 'Shell scripting: server tasks on the Perusal Gulf EC2 instance. AURA also parses Bash with Tree-sitter.',
  pytorch: 'PyTorch: he trained ForcingKnight’s AlphaZero-style policy-and-value network in PyTorch, on up to 100 million positions.',
  databricks: 'Databricks: he holds the Databricks Certified Data Engineer Associate and Generative AI Engineer Associate certifications.',
  'tree-sitter': 'Tree-sitter: SYNAPSE parses JavaScript, TypeScript and Python with it, and AURA extends that to 17 grammars.',
  ollama: 'Ollama: AURA and SYNAPSE run their models locally through Ollama.',
  'three.js': 'three.js: AURA uses three.js, and SYNAPSE’s 3D force-directed graph view uses react-three-fiber.',
  zod: 'Zod: Reverse Learning validates every model response with Zod, repairing or retrying up to three times.',
  vercel: 'Vercel: Reverse Learning is hosted on Vercel.',
  'github actions': 'GitHub Actions: Reverse Learning drains its Postgres job queue every few minutes with a GitHub Actions workflow.',
  'tailwind css': 'Tailwind CSS: listed in his frontend skills, from Reverse Learning, AURA and SYNAPSE.',
  oci: 'Oracle Cloud Infrastructure: at EY he traces failed loads through the source and target files on OCI, browsed with CloudBerry.',
  playwright: 'Playwright: AURA’s agent uses it for browser automation.',
  stockfish: 'Stockfish: ForcingKnight’s training positions came partly from parallel Stockfish workers, and its strength was measured against a Stockfish ladder.',
  'raspberry pi': 'Raspberry Pi: he wrote the software for the in-vehicle edge unit of the LoRa disaster alerting project, a Raspberry Pi with a LoRa receiver and a display.',
  django: 'Django: SYNAPSE’s route analysis understands Django routes, along with Express, Flask and FastAPI. That’s support in his tool, not a Django project of his own.',
  flask: 'Flask: SYNAPSE’s route analysis understands Flask routes, along with Express, FastAPI and Django. That’s support in his tool, not a Flask project of his own.',
  fastapi: 'FastAPI: SYNAPSE’s route analysis understands FastAPI routes, along with Express, Flask and Django. That’s support in his tool, not a FastAPI project of his own.',
};

export function techAnswer(key) {
  const note = techNotes[key];
  if (note) return note;
  const sources = sourcesFor(key);
  if (sources.length) return `${key}: used in ${listJoin(sources)}.`;
  return null;
}

export const techAliases = aliases;

// ---------------------------------------------------------------------------
// Passages: every paragraph and bullet of the write-ups, so specific questions
// ("what is the forcing-line search?") get the exact passage, not an overview.
// ---------------------------------------------------------------------------
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

export const passages = [];
const addPassage = (p) => passages.push({ id: `p${passages.length}`, ...p });

for (const p of projects) {
  const name = p.fullName ?? p.name;
  const link = projectLink(p);
  const aliases = [p.name, p.slug.replace(/-/g, ' ')];
  for (const sec of p.sections) {
    for (const t of sec.paragraphs ?? []) {
      addPassage({ topic: p.slug, title: sec.heading, keys: aliases, text: strip(t), leads: [`Here’s what the ${p.name} write-up says under “${sec.heading}”:`, `From the “${sec.heading}” part of ${p.name}:`, `Good question. In ${p.name} (“${sec.heading}”):`], links: [link] });
    }
    for (const t of sec.list ?? []) {
      addPassage({ topic: p.slug, title: sec.heading, keys: aliases, text: strip(t), leads: [`Here’s what the ${p.name} write-up says under “${sec.heading}”:`, `From the “${sec.heading}” part of ${p.name}:`, `Good question. In ${p.name} (“${sec.heading}”):`], links: [link] });
    }
  }
  if (p.builtWith) addPassage({ topic: p.slug, title: 'How it was built', keys: aliases, text: p.builtWith, leads: [`Here’s how ${p.name} was built:`, `On how ${p.name} came together:`], links: [link] });
  for (const f of p.facts) {
    addPassage({ topic: p.slug, title: '', fact: true, keys: aliases, text: `${f.label}: ${f.value}.`, leads: [`Quick fact about ${name}:`, `For ${name}:`], links: [link] });
  }
}

const fkLink = projectLink(fk);
for (const [title, text] of [
  ['How strength was measured', elo.method],
  ['Maia ladder', `${elo.maia.about} Raw network, no search: 185K model about 921, 15M model about 1395, 100M model about 1607.`],
  ['Stockfish ladder', strip(elo.stockfish.about)],
  ['What the ablation showed', elo.conclusion],
  ['Lesson from early runs', elo.lesson],
]) {
  addPassage({ topic: 'forcingknight', title, keys: ['ForcingKnight', 'chess engine', 'elo'], text: `${text} ${elo.caveat}`, leads: ['From the “Measuring strength” part of the ForcingKnight write-up:', 'On how ForcingKnight’s strength was measured:'], links: [fkLink] });
}

for (const e of experience) {
  const keys = [e.org, e.title];
  const lead = [`In his ${e.title} role at ${e.org}:`, `From his time at ${e.org}:`];
  const links = [{ label: 'Experience', href: '/#experience' }];
  addPassage({ topic: e.id, title: 'Context', keys, text: e.context, leads: lead, links });
  for (const b of e.bullets) addPassage({ topic: e.id, title: 'Work', keys, text: b, leads: lead, links });
  for (const r of e.roles ?? []) addPassage({ topic: e.id, title: `${r.name} role`, keys: [...keys, 'roles', r.name], text: `${r.name}: ${r.text}`, leads: ['In the Perusal Gulf welding-certification platform,'], lower: true, links });
}
for (const v of volunteering) {
  addPassage({ topic: 'tedx', title: v.org, keys: [v.org, 'volunteering'], text: v.text, leads: [`At ${v.org} (${v.year}):`], links: [] });
}

// Varied, conversational lead-ins, chosen stably per passage.
export const passageAnswer = (p) => {
  const lead = p.leads[Number(p.id.slice(1)) % p.leads.length];
  return `${lead} ${p.lower ? lowerFirst(p.text) : p.text}`;
};

// Prefix internal links with the deploy base (no-op locally and in tests).
for (const list of [guards, entries, passages]) {
  for (const item of list) item.links = (item.links ?? []).map((l) => (l.href.startsWith('/') ? { ...l, href: url(l.href) } : l));
}
