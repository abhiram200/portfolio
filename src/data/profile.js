// Single source of truth for every fact on the site, in the résumés and in the
// "Ask about Abhiram" assistant. Edit facts here only.
//
// Writing convention: strings are pronoun-free (verb-first or about the system),
// so the same text reads correctly on the site, on the résumé and in the bot.
// Text wrapped in `backticks` renders as inline code.

export const person = {
  name: 'Abhiram RS',
  headline: 'Software engineer working across data pipelines and AI systems.',
  role: 'Associate Software Engineer',
  employer: 'EY GDS',
  roleSince: 'Nov 2025',
  location: 'Trivandrum, India',
  email: 'abhiramrs24@gmail.com',
  github: 'https://github.com/abhiram200',
  githubHandle: 'abhiram200',
  linkedin: 'https://www.linkedin.com/in/abhiram-rs-183634300/',
  languages: ['English', 'Hindi', 'Malayalam'],
  // First-person intro used on the home page.
  intro: [
    'I work at EY GDS in Trivandrum, keeping a suite of daily batch ETL pipelines running for an enterprise client: watching the daily loads, fixing the ones that fail, correcting historical data, and resolving defects in the Scala and SQL transformation code.',
    'On my own time I build AI systems end to end: a code knowledge graph, an agentic coding workspace that runs on top of it, an AI learning platform, and a neural chess engine I trained myself.',
  ],
  strength:
    'Building complete systems end to end, and following a failure across code, schedulers, logs and data files until the root cause is clear.',
  seeking: {
    summary: 'Open to roles in software engineering, data engineering and cloud operations.',
    detail:
      'Particularly interested in cloud ops work such as running and managing VMs, for example on AWS EC2, which was part of the Perusal Gulf work.',
    areas: ['Software engineering', 'Data engineering', 'Cloud operations'],
  },
};

export const experience = [
  {
    id: 'ey',
    title: 'Associate Software Engineer',
    org: 'EY GDS',
    place: 'Trivandrum',
    start: 'Nov 2025',
    end: 'Present',
    current: true,
    context: 'Data pipeline support for an enterprise client, in the client’s UAT environment.',
    bullets: [
      'Responsible for keeping a suite of daily batch ETL pipelines (Python, Scala, PySpark, SQL) running reliably in the client’s UAT environment, orchestrated through Tidal Enterprise Scheduler.',
      'Debugs failed loads end to end: traces each failure through scheduler output, Spark job behaviour and the source and target files on Oracle Cloud Infrastructure (browsed with CloudBerry), finds the root cause, fixes it and re-runs the load.',
      'Corrects historical data loads (internally called “history fixes”) so previously processed periods are consistent with fixed logic and upstream data.',
      'Resolves defects in production-grade Scala and SQL transformation code alongside the wider delivery team.',
    ],
    stack: ['Python', 'Scala', 'PySpark', 'SQL', 'Tidal Enterprise Scheduler', 'Oracle Cloud Infrastructure (OCI)', 'CloudBerry'],
  },
  {
    id: 'perusal',
    resume: [
      'Owned the backend and server hosting (another team member built the frontend) for a private, role-based welding-certification platform with four roles, enforcing role-specific permissions throughout. Done alongside a B.Tech.',
      'Automated the certification workflow: creating a job card generates a PDF report and emails invitations to the observer and welders; the observer’s results generate a certificate for the tester to review; once approved, it is emailed to the welder with a generated welder ID. Admins get an activity log of who did what.',
      'Deployed and ran the whole system on an AWS EC2 instance, including the VM’s firewall configuration and shell scripting for server tasks.',
    ],
    title: 'Full Stack Developer (Freelance, Remote)',
    org: 'Perusal Gulf',
    place: 'Remote',
    start: 'Apr 2023',
    end: 'Mar 2024',
    context:
      'Backend and server hosting for a private, role-based welding-certification platform, done alongside a B.Tech. Another team member built the frontend.',
    bullets: [
      'Built the backend for a role-based platform with four roles (admin, tester, observer, welder), enforcing role-specific permissions throughout.',
      'Automated the certification workflow: creating a job card generates a PDF report and emails invitations to the observer and welders; the observer’s results generate a certificate for the tester to review; once approved, it is emailed to the welder with a generated welder ID.',
      'Gave admins full control of users across all roles and an activity log of who did what.',
      'Deployed and ran the whole system on an AWS EC2 instance, including the VM’s firewall configuration and shell scripting for server tasks.',
    ],
    roles: [
      { name: 'Admin', text: 'Full control. Manages users across all roles and monitors system usage through an activity log of who did what.' },
      { name: 'Tester', text: 'Groups welders under an observer, creates the job card, invites observers and welders to tests, and reviews and approves generated certificates.' },
      { name: 'Observer', text: 'Records per-welder results and a final pass or fail verdict during the test.' },
      { name: 'Welder', text: 'Logs in to see their job profile card and test certificates.' },
    ],
    stack: ['Node.js', 'MongoDB', 'PDFKit', 'EmailJS', 'AWS EC2', 'Linux', 'Shell scripting'],
  },
  {
    id: 'bendra',
    resume: [
      'One of two developers who restructured and redesigned the company’s WordPress site to the client’s requirements: theme customisation, page restructuring and plugin configuration. The client ultimately chose a simpler design than the one the team proposed.',
    ],
    title: 'Web Developer Intern',
    org: 'Bendra Aerospace Pvt. Ltd.',
    place: 'Trivandrum',
    start: 'May 2022',
    end: 'Jun 2022',
    context: 'Internship on the company’s WordPress site.',
    bullets: [
      'One of two developers who restructured and redesigned the company’s WordPress site: theme customisation, page restructuring and plugin configuration.',
      'The client ultimately chose a simpler design than the one the team proposed.',
    ],
    stack: ['WordPress'],
  },
];

export const volunteering = [
  {
    id: 'tedx',
    title: 'Volunteer, website team lead',
    org: 'TEDxRIET',
    year: '2023',
    text: 'Volunteered and led the website team for the college’s first approved TEDx event. The site had a speaker list, an event schedule, a registration form and a countdown to the event.',
  },
];

export const projects = [
  {
    slug: 'aura',
    highlights: ['About 48,000 lines of TypeScript', 'About 40 agent tools', '17 languages parsed'],
    resume: [
      "Browser-based development environment (file explorer, CodeMirror editor, real terminals via xterm.js and node-pty, git tree view) with models running locally through Ollama.",
      "Agent with about 40 tools that answers from a live code knowledge graph (SYNAPSE) instead of pasting the codebase into context; splits large questions across sub-agents, compacts long conversations and detects repeated tool calls without progress.",
      "Extended parsing to 17 Tree-sitter grammars. About 48,000 lines of TypeScript; built with Claude Code as an AI-assisted workflow, reviewing specs and designs and steering fixes for hard bugs."
    ],
    name: 'AURA',
    tagline: 'An AI coding workspace whose agent works from a live knowledge graph of the project.',
    kind: 'Personal project, open source',
    dates: 'May to Jul 2026',
    year: '2026',
    status: 'Runs locally. Never deployed as a hosted service.',
    links: [{ label: 'Source on GitHub', href: 'https://github.com/abhiram200/AURA' }],
    stack: ['TypeScript', 'React', 'Express', 'WebSockets', 'node-pty', 'Tree-sitter', 'Ollama', 'Playwright', 'three.js'],
    facts: [
      { label: 'Size', value: 'About 48,000 lines of TypeScript' },
      { label: 'History', value: '182 public commits: 181 from May to July 2026, plus a README commit at publication' },
      { label: 'Agent tools', value: 'About 40' },
      { label: 'Languages parsed', value: '17 Tree-sitter grammars' },
    ],
    aiAssisted: true,
    summary:
      'A browser-based development environment with a coding agent that answers from a live knowledge graph of the project (provided by SYNAPSE) instead of pasting the codebase into its context or spending rounds of tool calls exploring files.',
    sections: [
      {
        heading: 'The problem',
        paragraphs: [
          'A coding agent usually has two options. Either the whole codebase is pasted into its context, which is expensive and runs out of room, or it spends many rounds of tool calls exploring files, wasting tokens before it can answer.',
          'AURA’s agent does neither. It works from a live knowledge graph of the project, provided by SYNAPSE, so it can ask precise questions (what calls this, what breaks if this changes, which routes hit this service) and get answers immediately.',
        ],
      },
      {
        heading: 'The workspace',
        paragraphs: [
          'A complete development environment in the browser: a file explorer, a CodeMirror editor, real terminals (xterm.js over node-pty), a git tree view, and settings for models, skills, memory and the system prompt. Models run locally through Ollama.',
        ],
      },
      {
        heading: 'The agent',
        list: [
          'About 40 tools: graph queries (search, context, impact, dependencies, route and API maps, process traces, git change detection, rename), file reads and writes, managed shell sessions, browser automation through Playwright, web search and vision.',
          'Splits large questions across sub-agents and merges their findings.',
          'Compacts long conversations with an AI-written summary, falling back to a rule-based summary if that fails.',
          'Detects when it is repeating tool calls without progress and changes approach.',
          'Loads “skills” on demand: playbooks for exploring, debugging, refactoring, building and impact analysis.',
        ],
      },
      {
        heading: 'Integrating SYNAPSE',
        paragraphs: [
          'After SYNAPSE was integrated, AURA’s parser was extended from SYNAPSE’s original JavaScript, TypeScript and Python to 17 Tree-sitter grammars: JavaScript, TypeScript, TSX, Python, HTML, CSS, SCSS, PHP, Java, C, C++, C#, Go, Rust, Kotlin, Dart and Bash. Several SYNAPSE features were reworked for the agent.',
        ],
      },
    ],
    builtWith:
      'Built with Claude Code as an AI-assisted workflow. Abhiram reviewed and shaped the design documents and specs before implementation, and when the agent got stuck on a bug he worked through the logic himself and steered it to the right fix. It is a working example of directing AI-assisted development on a genuinely complex system: about 48,000 lines across an editor, terminals, a graph engine and a multi-tool agent.',
  },
  {
    slug: 'synapse',
    highlights: ['About 16,000 lines of TypeScript', '22 HTTP endpoints', 'BM25 + embedding search'],
    resume: [
      "Tree-sitter parsing into a graph of files, functions, classes and their imports, calls, extends and implements relationships, re-indexed incrementally by a file watcher.",
      "Impact analysis with propagation-based severity, hybrid BM25 and embedding search with Reciprocal Rank Fusion, route and API analysis (Express, Flask, FastAPI, Django), git-diff blast radius and dry-run renames.",
      "About 16,000 lines of TypeScript with 22 HTTP endpoints for projects; inspired by GitNexus, independently implemented; built with an AI-assisted workflow."
    ],
    name: 'SYNAPSE',
    tagline: 'A code knowledge graph that gives an AI agent near-instant understanding of a project.',
    kind: 'Personal project, open source',
    dates: '2026',
    year: '2026',
    status: 'Built first, as the foundation for AURA.',
    links: [{ label: 'Source on GitHub', href: 'https://github.com/abhiram200/SYNAPSE' }],
    stack: ['TypeScript', 'Tree-sitter', 'Express', 'Server-sent events', 'React', 'react-three-fiber', 'Ollama'],
    facts: [
      { label: 'Size', value: 'About 16,000 lines of TypeScript' },
      { label: 'API', value: '22 HTTP endpoints for projects, plus more for project groups' },
      { label: 'Languages parsed', value: 'JavaScript, TypeScript and Python (standalone version)' },
      { label: 'Inspiration', value: 'GitNexus. SYNAPSE is an independent implementation, not based on GitNexus code.' },
    ],
    aiAssisted: true,
    summary:
      'Parses a codebase into a knowledge graph of files, functions, classes and their relationships, keeps it current as files change, and answers the questions an agent needs: impact, search, routes, process traces, change blast radius and safe renames.',
    sections: [
      {
        heading: 'Why it exists',
        paragraphs: [
          'SYNAPSE was built first, specifically as AURA’s foundation. The goal: give an AI agent near-instant understanding of a project without dumping code into its context or spending many tool rounds, by keeping a well-maintained knowledge graph.',
          'It was inspired by GitNexus, but it is Abhiram’s own implementation and is not based on GitNexus code.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'Tree-sitter parses source (JavaScript, TypeScript and Python in the standalone version) into files, functions, classes, interfaces, methods and variables. SYNAPSE then resolves imports, calls, extends and implements relationships between them, and a file watcher re-indexes incrementally as code changes.',
        ],
      },
      {
        heading: 'What it answers',
        list: [
          'Impact analysis with propagation-based severity (critical, moderate or low) and trace paths.',
          'Hybrid search fusing BM25 and semantic embeddings with Reciprocal Rank Fusion, with a fuzzy fallback.',
          'Route and API analysis for Express, Flask, FastAPI and Django routes, plus the fetch, axios and httpx calls that hit them, with response-shape checks.',
          'Process tracing from a route through middleware, handler and services.',
          'Git-diff change detection showing the blast radius of a change.',
          'Cross-codebase rename with a dry-run preview.',
          'Cross-project groups that match one service’s provider routes to another service’s consumer calls.',
        ],
      },
      {
        heading: 'Interface',
        paragraphs: [
          'A 3D force-directed graph view (react-three-fiber) that can be filtered by node and edge type, plus a chat agent that uses the graph tools, streamed over server-sent events.',
        ],
      },
    ],
    builtWith:
      'Built with Claude Code as an AI-assisted workflow, the same way as AURA. Abhiram reviewed and shaped the design documents and specs before implementation, and when the agent got stuck on a bug he worked through the logic himself and steered it to the right fix.',
  },
  {
    slug: 'reverse-learning',
    highlights: ['Live on Vercel', '59 test files', 'Zod-validated model output'],
    resume: [
      "AI learning platform that measures understanding: learners explain concepts back, and weak understanding inserts remediation and keeps dependent topics gated.",
      "“AI produces scores, code produces decisions”: a pure TypeScript decision engine, isolated by ESLint rules, decides advance, remediate or gate; model output validated with Zod and repaired or retried up to three times.",
      "Long-running resource discovery moved to a Postgres job queue drained by GitHub Actions, claimed with FOR UPDATE SKIP LOCKED; per-learner inference keys; 59 test files that run without a database or network. Built with an AI-assisted workflow."
    ],
    name: 'Reverse Learning',
    tagline: 'An AI learning platform that measures understanding, not completion.',
    kind: 'Personal project, live',
    dates: 'Aug 2026',
    year: '2026',
    status: 'Live. Source is private.',
    links: [{ label: 'Open the live app', href: 'https://reverse-learning.vercel.app/signin' }],
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL (Neon)', 'NextAuth (Google sign-in)', 'Zod', 'Vitest', 'Vercel', 'GitHub Actions'],
    facts: [
      { label: 'Design rule', value: 'AI produces scores, code produces decisions' },
      { label: 'Tests', value: '59 test files that run without a database or network' },
      { label: 'Model output', value: 'Validated with Zod; repaired or retried up to three times' },
    ],
    aiAssisted: true,
    summary:
      'An AI generates a roadmap of topics linked by prerequisites. Learners study with verified resources, then explain each concept back in an assessment conversation. Weak understanding reshapes the roadmap: remediation is inserted and dependent topics stay gated until the foundation is solid.',
    sections: [
      {
        heading: 'The idea',
        paragraphs: [
          'Reverse Learning measures understanding, not completion. An AI generates a roadmap of topics linked by prerequisites. Learners study with verified resources, then explain the concept back in an assessment conversation.',
          'The AI scores the explanation, and weak understanding reshapes the roadmap: remediation is inserted, and dependent topics stay gated until the foundation is solid.',
        ],
      },
      {
        heading: 'AI produces scores, code produces decisions',
        paragraphs: [
          'The model supplies a score and a confidence. Nothing more. A pure TypeScript decision engine, with no network, database or AI access and isolated by ESLint rules, decides whether to advance, remediate or gate. Every decision is explainable and testable, because the part that decides is ordinary code.',
        ],
      },
      {
        heading: 'Engineering decisions',
        list: [
          'Strict layers: core domain logic, an AI layer that is the only code allowed to call models, a Prisma database layer, orchestration services, and the Next.js App Router app.',
          'Every model response is validated with Zod and repaired or retried (up to three attempts) before use.',
          'Per-learner inference keys, so learners never share a gateway session and can never see each other’s transcripts. The client refuses to make inference calls with the application key.',
          'Resource discovery is a long-running job, taking 47 to 90 seconds per topic, beyond Vercel’s function limits. It runs through a Postgres job queue drained every few minutes by a GitHub Actions workflow, and jobs are claimed with `FOR UPDATE SKIP LOCKED` so overlapping runs never take the same job.',
          'Resource links are sanitised and checked live before learners see them.',
          'Every server action re-checks that the signed-in learner owns the goal.',
          'An evaluation suite of labelled transcripts (strong, vocabulary-only, partial, wrong) calibrates the scoring model, and 59 test files run without a database or network.',
        ],
      },
      {
        heading: 'Known limits',
        paragraphs: [
          'Roadmap generation takes 60 to 90 seconds, and the generator currently over-links prerequisites. Both are tracked.',
        ],
      },
    ],
    builtWith:
      'Built with Claude Code, using the same AI-assisted approach as AURA and SYNAPSE. Abhiram wrote and reviewed the design spec and implementation plans before each phase, and when the agent got stuck on a bug he worked through the logic himself and steered it to the right fix.',
  },
  {
    slug: 'forcingknight',
    highlights: ['Up to 100M training positions', 'About 1972 Elo (Maia scale, estimate)', '19.7M parameters'],
    resume: [
      "AlphaZero-style policy-and-value ResNet trained in PyTorch on up to 100 million positions from parallel Stockfish workers and the Lichess evaluations database, streamed out-of-core.",
      "PUCT MCTS with an exact solver, batched evaluation with virtual loss, and a forcing-line tactical search; replaced ReduceLROnPlateau, which never lowered the learning rate over 100k-step epochs, with a per-step warmup and cosine schedule, and convergence became steady.",
      "Estimated about 1972 Elo on a Maia (human-scale) ladder and about 1838 on a Stockfish ladder via maximum-likelihood fits (estimates, not official ratings). Shipped as a PySide6 app, UCI engine and Windows build."
    ],
    name: 'ForcingKnight',
    tagline: 'A neural chess engine, trained from scratch on a rented GPU and shipped as a desktop app.',
    kind: 'Personal project, open source',
    dates: '2026',
    year: '2026',
    status: 'Desktop app, UCI engine and Windows build.',
    links: [{ label: 'Source on GitHub', href: 'https://github.com/abhiram200/chessai' }],
    stack: ['Python', 'PyTorch', 'python-chess', 'Stockfish', 'PySide6', 'PyInstaller'],
    facts: [
      { label: 'Network', value: 'AlphaZero-style ResNet, up to 15 blocks × 192 filters (19.7M parameters)' },
      { label: 'Training data', value: 'Up to 100 million positions' },
      { label: 'Final training run', value: 'About 4 to 5 hours on a rented GPU' },
      { label: 'Estimated strength', value: 'About 1972 on the Maia (human) ladder; about 1838 on the Stockfish ladder. Estimates on those scales, not official or FIDE ratings.' },
    ],
    aiAssisted: false,
    summary:
      'An end-to-end pipeline: generate and stream training data, train a policy-and-value network, add search, and ship a playable product. Development and training were done solo on a rented GPU.',
    sections: [
      {
        heading: 'The network',
        paragraphs: [
          'An AlphaZero-style ResNet with a policy head over a fixed 4,672-move encoding and a win/draw/loss value head, trained in PyTorch by supervised learning. Training positions came from parallel Stockfish workers and the Lichess open evaluations database, streamed out-of-core from zstd files.',
        ],
      },
      {
        heading: 'Scaling the data',
        paragraphs: [
          'Three checkpoints were trained on 185 thousand, 15 million and 100 million positions. The trunk grew from 10 blocks × 128 filters (12.7M parameters) to 15 blocks × 192 filters (19.7M parameters) for the larger datasets. All three checkpoints ship with the app and make up its difficulty ladder. The final model took about 4 to 5 hours to train.',
        ],
      },
      {
        heading: 'A training fix',
        paragraphs: [
          'With 100k-step epochs, ReduceLROnPlateau never lowered the learning rate, because tiny per-epoch gains kept resetting its patience. It was replaced with a per-step warmup and cosine schedule, and convergence became steady.',
        ],
      },
      {
        heading: 'Search',
        list: [
          'PUCT Monte Carlo tree search with an exact solver that propagates proven wins, draws and losses.',
          'Batched leaf evaluation with virtual loss, tree reuse and a transposition cache.',
          'A forcing-line tactical search (captures and checks) that vetoes moves losing material to forcing sequences: the net proposes, the forcing search disposes.',
        ],
      },
      {
        heading: 'Playing it',
        paragraphs: [
          'A PySide6 desktop app with move sounds, animations, a captured-pieces tray and clocks; a UCI engine for chess GUIs such as Arena and Cute Chess; and a PyInstaller Windows build.',
        ],
      },
    ],
    builtWith: null,
  },
  {
    slug: 'lora-alerting',
    highlights: ['Published in IJIRT', 'Team of four', 'Working prototype'],
    resume: [
      "Team of four: buried Arduino sensor capsules broadcast distress messages over LoRa (ESP32), rebroadcast by relay nodes on poles.",
      "Wrote the software for the in-vehicle edge unit (Raspberry Pi, LoRa receiver, display) that filters noise with threshold-based checks and alerts drivers. Working prototype; published in IJIRT, June 2025."
    ],
    name: 'LoRa disaster alerting',
    fullName: 'Vehicle-Based Disaster Alerting System Using LoRa',
    tagline: 'Buried sensors broadcast disaster alerts over LoRa to drivers nearby.',
    kind: 'Final-year B.Tech project, team of four',
    dates: '2024 to 2025',
    year: '2025',
    status: 'Working prototype. Published in IJIRT, June 2025.',
    links: [{ label: 'Read the paper (PDF)', href: 'https://ijirt.org/publishedpaper/IJIRT180560_PAPER.pdf' }],
    stack: ['Raspberry Pi', 'LoRa', 'ESP32', 'Arduino'],
    facts: [
      { label: 'Team', value: 'Four students, guided by Ms. Athira Sarath' },
      { label: 'Abhiram’s part', value: 'Software for the in-vehicle edge unit' },
      { label: 'Status', value: 'Working prototype' },
    ],
    aiAssisted: false,
    summary:
      'A buried capsule of sensors detects unusual conditions and broadcasts a distress message over LoRa. Relay nodes on poles rebroadcast it, and units in vehicles warn drivers that a disaster is happening nearby.',
    sections: [
      {
        heading: 'The system',
        paragraphs: [
          'A buried capsule of sensors, driven by an Arduino, sits in a disaster-prone area, wired to a LoRa transceiver (ESP32) on a pole. When it detects something unusual, it broadcasts a distress message describing what it found. Relay LoRa nodes on other poles rebroadcast it, and any LoRa device in range receives it, including units in vehicles.',
        ],
      },
      {
        heading: 'Abhiram’s part: the in-vehicle unit',
        paragraphs: [
          'Wrote the software for the in-vehicle edge unit: a Raspberry Pi with a LoRa receiver and a display. It listens for broadcasts, uses threshold-based checks to separate noise from real events, and shows the driver an alert that a disaster is happening nearby.',
        ],
      },
      {
        heading: 'Where it could go next',
        paragraphs: [
          'Once enough sensor data is collected, a small on-device AI model could detect disasters before they happen.',
        ],
      },
    ],
    builtWith: null,
  },
];

// ForcingKnight strength estimates. Single maximum-likelihood Elo fitted across
// all results on each ladder. Estimates on the stated scale only.
export const forcingKnightElo = {
  method:
    'Elo was estimated against two independent opponent ladders. For each, a single maximum-likelihood Elo was fitted across all results rather than reading the score off one opponent.',
  caveat: 'These are estimates on the stated scale. They are not official or FIDE ratings.',
  maia: {
    name: 'Maia ladder (human scale)',
    about:
      'Maia networks are trained to imitate human play at specific Lichess rating bands. ForcingKnight played bands from 1100 to 1900.',
    scaling: [
      { label: '185K positions', elo: 921 },
      { label: '15M positions', elo: 1395 },
      { label: '100M positions', elo: 1607 },
    ],
    ablation: [
      { label: 'Raw policy (100M model)', elo: 1607, delta: null },
      { label: '+ MCTS (400 simulations)', elo: 1892, delta: 285 },
      { label: '+ forcing-line search', elo: 1963, delta: 71 },
      { label: '+ opening book, tablebases, adaptive time', elo: 1972, delta: 9 },
    ],
  },
  stockfish: {
    name: 'Stockfish ladder (engine scale)',
    about: 'Stockfish at fixed strengths (`UCI_LimitStrength`, 1650 to 2250), with 200 games per configuration.',
    ablation: [
      { label: 'Network + plain MCTS', elo: 1760, delta: null, approx: true },
      { label: '+ forcing-line search', elo: 1838, delta: 78, approx: true },
      { label: '+ opening book, tablebases, adaptive time', elo: 1833, delta: -5, note: 'within noise' },
    ],
  },
  conclusion:
    'Both ladders tell the same story: search is the biggest lever, the forcing-line search is the only extra layer that measurably adds strength, and the remaining layers make the engine more complete, not stronger.',
  lesson:
    'Early runs with only 16 games per strength gave misleading gaps, which is why the final comparisons used many more games.',
};

export const otherWork = {
  note: 'Earlier experiments from 2023 to 2024, all on GitHub.',
  items: [
    { name: 'chess-pgn-generator', text: 'A Stockfish game generator that preceded ForcingKnight.', href: 'https://github.com/abhiram200/chess-pgn-generator' },
    { name: 'Face-Recognition-And-Registration', text: 'Face recognition and registration with OpenCV.', href: 'https://github.com/abhiram200/Face-Recognition-And-Registration' },
    { name: 'ChatBot', text: 'An NLTK intent-based bot that learns from user corrections.', href: 'https://github.com/abhiram200/ChatBot' },
    { name: 'JSON-DataSet-Maker', text: 'A small utility.', href: 'https://github.com/abhiram200/JSON-DataSet-Maker' },
  ],
};

export const education = {
  degree: 'B.Tech in Computer Science and Engineering',
  school: 'Rajadhani Institute of Engineering and Technology',
  place: 'Trivandrum',
  dates: '2021 to 2025',
};

export const certifications = [
  {
    name: 'Databricks Certified Generative AI Engineer Associate',
    issuer: 'Databricks',
    earned: 'Oct 2026',
    validTo: 'Oct 2028',
    href: 'https://credentials.databricks.com/617319e1-f32c-4956-b904-3654dadec573',
    badge: 'https://artifacts.credential.net/bk1a2xkl/badge/c87c487238466a46fcecb6b03d521b8b/master.png',
  },
  {
    name: 'Databricks Certified Data Engineer Associate',
    issuer: 'Databricks',
    earned: 'Apr 2026',
    validTo: 'Apr 2028',
    href: 'https://credentials.databricks.com/37371796-43c9-4666-8bb9-6139e0b71b38',
    badge: 'https://artifacts.credential.net/s1obc31z/badge/5f54e7ebc9d2bd64ae44a7596f253f7c/master.png',
  },
  {
    name: 'GitHub Copilot',
    issuer: 'Microsoft',
    earned: 'Feb 2026',
    validTo: 'Feb 2028',
    href: 'https://learn.microsoft.com/api/credentials/share/en-us/AbhiramRs-2354/F27630DB51DB7E2?sharingId=6380162731BF2D1',
    badge: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/github-copilot.svg',
  },
];

export const publication = {
  title: 'Vehicle-Based Disaster Alerting System Using LoRa Communication',
  venue: 'International Journal of Innovative Research in Technology (IJIRT)',
  issue: 'Vol. 12, Issue 1, June 2025',
  authors: 'Abhiram RS, Arjun RM, Pranav J, Muhammad Shafi MS, guided by Ms. Athira Sarath',
  href: 'https://ijirt.org/publishedpaper/IJIRT180560_PAPER.pdf',
};

// Skills mapped to the work that evidences them. No levels, by design.
export const skills = [
  {
    area: 'Data engineering',
    evidence: 'EY, the Databricks Data Engineer certification and ForcingKnight’s data pipeline',
    items: ['PySpark', 'Scala', 'SQL', 'Python', 'Databricks', 'Tidal Enterprise Scheduler', 'Oracle Cloud Infrastructure'],
  },
  {
    area: 'AI and machine learning',
    evidence: 'SYNAPSE, AURA, Reverse Learning and ForcingKnight',
    items: ['PyTorch', 'LLM agents and tool use', 'Structured LLM output with Zod', 'LLM evaluation suites', 'Hybrid BM25 and embedding search', 'MCTS', 'Ollama'],
  },
  {
    area: 'Backend and cloud',
    evidence: 'Perusal Gulf, Reverse Learning and AURA',
    items: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'PostgreSQL with Prisma', 'AWS EC2 (including VM firewall setup)', 'Linux servers', 'Shell scripting', 'Vercel', 'GitHub Actions'],
  },
  {
    area: 'Frontend',
    evidence: 'Reverse Learning, AURA and SYNAPSE',
    items: ['React', 'Next.js', 'Tailwind CSS', 'three.js', 'HTML and CSS'],
  },
  {
    area: 'AI-assisted development',
    evidence: 'AURA, SYNAPSE and Reverse Learning',
    items: ['Directing coding agents (Claude Code) through large codebases by reviewing specs and designs and debugging alongside the agent'],
  },
];

export const resumeFile = '/Abhiram-RS-Resume.pdf';

// The bug-hunt game on the home page. Each squashed bug reveals one of these.
export const bugFacts = [
  'Part of his work at EY is tracing a failed load across code, the scheduler, logs and data files until the root cause is clear.',
  'At EY he does “history fixes”: correcting historical data loads so previously processed periods match fixed logic and upstream data.',
  'ForcingKnight’s learning rate never dropped because tiny per-epoch gains kept resetting ReduceLROnPlateau. He switched to a per-step warmup and cosine schedule, and convergence became steady.',
  'Reverse Learning claims queued jobs with `FOR UPDATE SKIP LOCKED`, so overlapping workers never take the same job.',
  'Early ForcingKnight strength runs with only 16 games per strength gave misleading gaps, so the final comparisons used far more games.',
];
