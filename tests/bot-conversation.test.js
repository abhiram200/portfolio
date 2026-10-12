import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ask } from '../src/scripts/bot.js';
import { assistant } from '../src/data/assistant.js';

const NAME = assistant.name;

// [question, expected id prefix, text the answer must include]
const talk = [
  ['hey, what’s your name?', 'talk:name', NAME],
  ['What should I call you?', 'talk:name', NAME],
  ['who are you', 'talk:name', NAME],
  ['hi', 'talk:greeting', NAME === 'Trace' ? 'Abhiram' : 'Abhiram'],
  ['Good morning!', 'talk:greeting', 'Abhiram'],
  ['how are you?', 'talk:how-are-you', 'thanks'],
  ['what’s up', 'talk:how-are-you', 'Abhiram'],
  ['Are you an AI?', 'talk:ai', 'browser'],
  ['are you a real person?', 'talk:ai', 'won’t make things up'],
  ['Is this ChatGPT?', 'talk:ai', NAME],
  ['who built you?', 'talk:creator', 'Abhiram'],
  ['What time is it for him?', 'talk:time', 'India Standard Time'],
  ['what time is it in Trivandrum', 'talk:time', 'UTC+5:30'],
  ['what’s the date today?', 'talk:date', '20'],
  ['tell me a joke', 'talk:joke', '?'],
  ['where are the hidden bugs?', 'talk:game', 'five bugs'],
  ['how do achievements work?', 'talk:game', 'trophy'],
  ['nice website!', 'talk:compliment', 'Abhiram'],
  ['what can you do?', 'talk:capabilities', 'projects'],
  ['bye', 'talk:bye', 'abhiramrs24@gmail.com'],
  ['hello, what does he do at EY?', 'current-role', 'EY GDS'],
  ['hey there, is he open to work?', 'availability', 'actively looking'],
  ['hi, what is his phone number?', 'decline-phone', 'shared here'],
];

for (const [q, id, include] of talk) {
  test(`talk: "${q}"`, () => {
    const r = ask(q);
    assert.ok(r.id.startsWith(id), `"${q}" -> [${r.id}] ${r.answer}`);
    assert.ok(r.answer.includes(include), `"${q}" missing "${include}": ${r.answer}`);
  });
}

test('"how does he fix bugs" is about his work, not the game', () => {
  assert.notEqual(ask('How does he fix bugs at work?').id, 'talk:game');
});

test('the time answer is about now in IST', () => {
  const r = ask('what time is it there?');
  const hour = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric' }).format(new Date()).split(' ')[0];
  assert.ok(r.answer.includes(`${hour}:`), r.answer);
});

test('conversation memory: follow-ups stay on topic', () => {
  const ctx = { shown: new Set() };
  const say = (q) => {
    const r = ask(q, ctx);
    if (r.topic) ctx.topic = r.topic;
    (r.passageIds ?? []).forEach((id) => ctx.shown.add(id));
    return r;
  };
  assert.equal(say('What is ForcingKnight?').topic, 'forcingknight');
  assert.equal(say('how strong is it?').id, 'forcingknight-elo');
  assert.equal(say('what about the search?').topic, 'forcingknight');
  const more1 = say('tell me more');
  const more2 = say('tell me more');
  assert.ok(more1.id.startsWith('more:') && more2.id.startsWith('more:'));
  assert.notEqual(more1.answer, more2.answer, 'tell me more repeats itself');
  // A question that doesn't refer back must not be dragged into the topic.
  assert.equal(say('what is the capital of France?').id, 'unknown');
  assert.equal(say('Does he speak Hindi?').id, 'languages-spoken');
});

test('fallback replies vary but always point to email', () => {
  const answers = new Set(['what is the capital of France?', 'favourite colour?', 'Will it rain tomorrow?'].map((q) => ask(q).answer));
  assert.ok(answers.size >= 2);
  for (const a of answers) assert.ok(a.includes('abhiramrs24@gmail.com'));
});

// Recency and "first/biggest" questions get one direct answer.
const direct = [
  ['What was is most recent project?', 'latest-project', 'Reverse Learning'],
  ['what is he working on lately?', 'latest-project', 'Reverse Learning'],
  ['What was his first project?', 'first-project', 'LoRa'],
  ['what was his first job?', 'first-job', 'Bendra'],
  ['What is his biggest project?', 'biggest-project', 'AURA'],
  ['latest certification?', 'latest-cert', 'Generative AI'],
  ['where does he work?', 'current-role', 'EY GDS'],
  ['who does he work for?', 'current-role', 'EY GDS'],
  ['How does AURA use SYNAPSE?', 'aura-synapse', 'knowledge graph'],
];
for (const [q, id, include] of direct) {
  test(`direct: "${q}"`, () => {
    const r = ask(q);
    assert.equal(r.id, id, `"${q}" -> [${r.id}] ${r.answer}`);
    assert.ok(r.answer.includes(include), r.answer);
  });
}

test('default answers stay short', () => {
  const common = [
    'Who is Abhiram?', 'What projects has he built?', 'What is AURA?', 'What is SYNAPSE?', 'What is Reverse Learning?',
    'What is ForcingKnight?', 'How strong is ForcingKnight?', 'What are his skills?', 'What certifications does he have?',
    'Where does he work?', 'What does he do day to day?', 'What did he build at Perusal Gulf?', 'What was his final year project?',
    'Did he use AI to build his projects?', 'What was his most recent project?',
  ];
  for (const q of common) {
    const { answer } = ask(q);
    assert.ok(answer.length <= 320, `"${q}" is ${answer.length} chars: ${answer}`);
  }
});

test('"tell me more" expands the last short answer first', () => {
  const ctx = { shown: new Set() };
  const first = ask('What is AURA?', ctx);
  ctx.topic = first.topic;
  ctx.lastMore = first.more;
  const more = ask('tell me more', ctx);
  assert.equal(more.id, 'more:aura');
  assert.ok(more.answer.length > first.answer.length);
  assert.ok(more.answer.includes('CodeMirror'));
});

// Every way of asking to expand should expand, not fall through.
const expandWordings = [
  'tell me more', 'more details', 'Expand on this', 'can you elaborate?', 'elaborate', 'go deeper', 'explain further',
  'give me more info', 'could you explain that in more detail?', 'details please', 'more', 'what else?', 'anything else?',
  'keep going', 'go on', 'tell me more about it', 'say more', 'in detail please', 'dig deeper', 'more about that',
  'explain it fully', 'expand please', 'can you go into more detail?',
];
for (const q of expandWordings) {
  test(`expand: "${q}"`, () => {
    const r = ask(q, { topic: 'aura', lastMore: 'aura', shown: new Set() });
    assert.equal(r.id, 'more:aura', `"${q}" -> [${r.id}] ${r.answer}`);
  });
}

test('expanding a named subject gives that subject in full', () => {
  assert.equal(ask('tell me more about his skills').id, 'more:skills');
  assert.equal(ask('more details on ForcingKnight').id, 'more:forcingknight');
  assert.equal(ask('elaborate on his EY work').id, 'more:current-role');
});

test('with nothing to expand, the assistant asks what to expand', () => {
  assert.equal(ask('tell me more').id, 'more:what');
});

test('normal questions containing similar words are not expand requests', () => {
  assert.equal(ask('Is he available to continue full time?').id, 'availability');
  assert.equal(ask('Where does he work?').id, 'current-role');
});

// Bug stories shown after squashing a bug.
const notes = [
  'Bug 2 of 5 squashed! At EY he does “history fixes”: correcting historical data loads so previously processed periods match fixed logic and upstream data.',
  'Bug 4 of 5 squashed! ForcingKnight’s learning rate never dropped because tiny per-epoch gains kept resetting ReduceLROnPlateau.',
];

test('asking about a numbered bug story explains it', () => {
  const r = ask('No i mean what is this bug2 thing you said', { notes, shown: new Set() });
  assert.equal(r.id, 'bug-note');
  assert.match(r.answer, /bug hunt/);
  assert.match(r.answer, /Bug 2 is about his work at EY/);
  assert.equal(r.topic, 'ey');
});

test('a vague question right after a bug story is about that story', () => {
  const r = ask('What is this about?', { notes, noteFresh: true, shown: new Set() });
  assert.equal(r.id, 'bug-note');
  assert.match(r.answer, /Bug 4 is about ForcingKnight/);
  assert.equal(ask('What is this about?', { notes, shown: new Set() }).id, 'unknown');
});

test('asking about a bug not yet squashed says so', () => {
  assert.match(ask('what is bug 3', { notes, shown: new Set() }).answer, /haven’t squashed bug 3/);
});

test('game questions still get the game answer', () => {
  assert.equal(ask('where are the bugs hidden', { notes, shown: new Set() }).id, 'talk:game');
});

test('"yes" after an offer continues the topic', () => {
  assert.equal(ask('yes', { topic: 'ey', shown: new Set() }).id, 'more:ey');
  assert.equal(ask('yes').id, 'talk:yes');
});

test('the learning-rate story is about ForcingKnight, not Reverse Learning', () => {
  assert.equal(ask('what is the learning rate bug').id, 'passage:forcingknight');
});
