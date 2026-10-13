// Search and social copy for each page, written from the facts in profile.js.
// Titles stay near 60 characters and descriptions under 160 so search results
// show them whole. scripts/check-seo.mjs enforces both.

export const homeSeo = {
  title: 'Abhiram RS | Software Engineer, Data Pipelines & AI Systems',
  description:
    'Abhiram RS is a software engineer at EY GDS in Trivandrum, India, working on data pipelines and AI systems. Projects, experience, skills and contact.',
};

export const projectSeo = {
  aura: {
    title: 'AURA: AI Coding Workspace on a Live Code Knowledge Graph',
    description:
      'AURA is a browser-based coding workspace by Abhiram RS whose AI agent answers from a live knowledge graph of the project. TypeScript, React, Ollama.',
  },
  synapse: {
    title: 'SYNAPSE: Code Knowledge Graph for AI Coding Agents',
    description:
      'SYNAPSE parses a codebase with Tree-sitter into a live knowledge graph so an AI agent can answer impact, search and safe-rename questions. By Abhiram RS.',
  },
  'reverse-learning': {
    title: 'Reverse Learning: AI Platform That Tests Understanding',
    description:
      'Reverse Learning builds an AI roadmap of prerequisite-linked topics, then has learners explain each concept back. Next.js, Prisma, PostgreSQL. By Abhiram RS.',
  },
  forcingknight: {
    title: 'ForcingKnight: Neural Chess Engine Trained From Scratch',
    description:
      'ForcingKnight is a policy-and-value neural chess engine that Abhiram RS trained from scratch on a rented GPU and shipped as a desktop app. PyTorch and MCTS.',
  },
  'lora-alerting': {
    title: 'Vehicle-Based Disaster Alerting System Using LoRa',
    description:
      'Final-year B.Tech team project, published in IJIRT (2025): buried sensors broadcast disaster alerts over LoRa to units in vehicles that warn nearby drivers.',
  },
};

export const SITE_NAME = 'Abhiram RS';
export const withSiteName = (title) => `${title} | ${SITE_NAME}`;
