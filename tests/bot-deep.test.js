import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ask, followUps, suggestions } from '../src/scripts/bot.js';

// Specific questions about the inside of each project. Each must land on the
// right project and contain the key detail, not a generic overview.
const deep = [
  ['What is forcing-line search', 'forcingknight', 'vetoes moves'],
  ['What is the forcing-line search?', 'forcingknight', 'captures and checks'],
  ['What is PUCT?', 'forcingknight', 'PUCT'],
  ['How did he fix the learning rate?', 'forcingknight', 'cosine'],
  ['Why did ReduceLROnPlateau fail?', 'forcingknight', 'patience'],
  ['What network architecture does ForcingKnight use?', 'forcingknight', 'ResNet'],
  ['Where did the training data come from?', 'forcingknight', 'Lichess'],
  ['How strong is ForcingKnight?', 'forcingknight', 'not official or FIDE'],
  ['Can I play ForcingKnight in Arena?', 'forcingknight', 'UCI'],
  ['How does SYNAPSE search work?', 'synapse', 'Reciprocal Rank Fusion'],
  ['What is Reciprocal Rank Fusion used for?', 'synapse', 'BM25'],
  ['What does impact analysis show?', 'synapse', 'severity'],
  ['How does SYNAPSE analyse API routes?', 'synapse', 'Flask'],
  ['Can SYNAPSE rename across a codebase?', 'synapse', 'dry-run'],
  ['How does AURA use SYNAPSE?', 'aura', 'knowledge graph'],
  ['What tools does AURA’s agent have?', 'aura', '40 tools'],
  ['How does AURA handle long conversations?', 'aura', 'summary'],
  ['What happens when AURA repeats tool calls?', 'aura', 'changes approach'],
  ['Which languages can AURA parse?', 'aura', 'Kotlin'],
  ['How was AURA built?', 'aura', 'Claude Code'],
  ['How does Reverse Learning make decisions?', 'reverse-learning', 'decision engine'],
  ['How does it handle long-running jobs?', 'reverse-learning', 'SKIP LOCKED'],
  ['What are its known limits?', 'reverse-learning', 'over-links prerequisites'],
  ['How does Reverse Learning keep transcripts private?', 'reverse-learning', 'inference keys'],
  ['How are the AI responses validated in Reverse Learning?', 'reverse-learning', 'Zod'],
  ['What did he build for the LoRa project?', 'lora-alerting', 'threshold-based'],
  ['Where was the paper published?', 'lora-alerting', 'IJIRT'],
  ['Where could the LoRa project go next?', 'lora-alerting', 'on-device AI model'],
  ['What are history fixes?', 'ey', 'historical data loads'],
  ['How does he debug failed loads?', 'ey', 'root cause'],
  ['What did the tester role do?', 'perusal', 'job card'],
  ['How was the platform hosted?', 'perusal', 'EC2'],
  ['What did the certification workflow do?', 'perusal', 'PDF report'],
];

for (const [q, topic, include] of deep) {
  test(`deep: "${q}"`, () => {
    const r = ask(q);
    assert.ok(r.answer.toLowerCase().includes(include.toLowerCase()), `"${q}" -> [${r.id}] ${r.answer}`);
    assert.equal(r.topic, topic, `"${q}" topic ${r.topic} (${r.id})`);
  });
}

test('every suggestion and follow-up chip gets a real answer', () => {
  const all = [...suggestions, ...Object.values(followUps).flat()];
  for (const q of all) {
    const r = ask(q);
    assert.notEqual(r.id, 'unknown', `chip "${q}" fell through to unknown`);
  }
});

test('ForcingKnight passages never mention AI assistance', () => {
  for (const q of ['What is forcing-line search', 'How did he fix the learning rate?', 'How was ForcingKnight built?', 'Did he use AI for the chess engine?']) {
    assert.ok(!/claude|ai-assisted|copilot/i.test(ask(q).answer), q);
  }
});
