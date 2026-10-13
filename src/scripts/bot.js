// "Ask about Abhiram": retrieval over a curated knowledge base, entirely in the
// browser. No model, no network, no keys. It can only return approved text.

import { entries, guards, techAnswer, techAliases, contactLine, passages, passageAnswer } from '../data/kb.js';
import { person, projects as projectsList } from '../data/profile.js';
import { url } from '../lib/url.js';
import { smallTalk, splitGreeting, greetingReply, withGreeting, fallbackReply, pick } from './smalltalk.js';

const STOP = new Set(
  'a an the is are was were be been am do does did doing has have had he him his abhiram abhirams bit little i me my you your we us our it its this that these those of in on at to for from by with about as and or but if then so than what which who whom whose when where why how can could would should will shall may might must tell know please any some there their they them just also very really much many more most into out up down over again s t'.split(
    ' ',
  ),
);

export function normalize(text) {
  return ` ${text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/'s\b/g, '')
    .replace(/[^a-z0-9+#.\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

// Irregular forms and domain synonyms, applied before stemming so questions
// and write-ups meet on the same word.
const SYN = {
  came: 'come',
  built: 'build',
  made: 'make',
  ran: 'run',
  fixed: 'fix',
  parsed: 'parse',
  parser: 'parse',
  parsing: 'parse',
  parses: 'parse',
  positions: 'data',
  position: 'data',
};

export function tokenize(text) {
  return normalize(text)
    .split(/[\s\-]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter((t) => t && !STOP.has(t))
    .map((t) => stem(SYN[t] ?? t));
}

// --- BM25 indexes -----------------------------------------------------------
const K1 = 1.2;
const B = 0.75;

function makeIndex(items, tokensOf, b = B) {
  const docs = items.map((item) => {
    const tokens = tokensOf(item);
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { item, tf, len: tokens.length };
  });
  const avgLen = docs.reduce((n, d) => n + d.len, 0) / docs.length;
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = (t) => Math.log(1 + (docs.length - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
  // `known` is the query reduced to words that appear anywhere in the
  // knowledge base; coverage is measured against it, so an unknown word
  // ("why did X fail?") doesn't hide a passage that answers everything else.
  // Coverage is weighted by rarity: matching "ReduceLROnPlateau" counts for
  // more than matching "fail".
  const search = (known, boost = () => 1) => {
    const total = known.reduce((n, t) => n + idf(t), 0);
    return docs
      .map((d) => {
        let score = 0;
        let got = 0;
        let matched = 0;
        for (const t of known) {
          const f = d.tf.get(t);
          if (!f) continue;
          matched++;
          got += idf(t);
          score += idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - b + (b * d.len) / avgLen)));
        }
        return { item: d.item, score: score * boost(d.item), coverage: total ? got / total : 0, matched };
      })
      .sort((x, y) => y.score - x.score);
  };
  return { search, vocab: df };
}

// Curated answers: matched on example questions and (double-weighted) keywords.
const entryIndex = makeIndex(entries, (e) => [
  ...e.q.flatMap(tokenize),
  ...e.k.flatMap((k) => tokenize(k)).flatMap((t) => [t, t]),
]);

// Write-up passages: matched on their text, section title and project names.
const passageIndex = makeIndex(passages, (p) => [
  ...tokenize(p.text),
  ...tokenize(p.title).flatMap((t) => [t, t, t]),
  ...p.keys.flatMap(tokenize),
], 0.4);

// Curated entries that are whole-project overviews. A question naming the
// project plus something specific should get the specific passage instead.
const OVERVIEWS = new Set(['aura', 'synapse', 'reverse-learning', 'forcingknight', 'lora', 'projects']);

// Words too common to justify a passage on their own.
const GENERIC = new Set(['next', 'go', 'start', 'make', 'use', 'work', 'run', 'show', 'time', 'new', 'good', 'way', 'come', 'get', 'build', 'data', 'fail']);

const isKnown = (t) => entryIndex.vocab.has(t) || passageIndex.vocab.has(t);

// Names of projects and roles. A question made only of these ("what is AURA?")
// wants the overview; extra words ("AURA compaction") want a specific passage.
const TOPIC_NAMES = {
  aura: ['aura'],
  synapse: ['synapse'],
  'reverse-learning': ['reverse', 'learning'],
  forcingknight: ['forcingknight', 'chess', 'engine'],
  'lora-alerting': ['lora'],
  ey: ['ey', 'gd'],
  perusal: ['perusal', 'gulf'],
};
for (const k of Object.keys(TOPIC_NAMES)) TOPIC_NAMES[k] = TOPIC_NAMES[k].flatMap(tokenize);
const ENTITY = new Set([...Object.values(TOPIC_NAMES).flat(), 'project', 'tell']);

// The project named first in a question is the one it's about
// ("how does AURA use SYNAPSE?" is about AURA).
function primaryTopic(tokens) {
  for (const t of tokens) for (const [topic, names] of Object.entries(TOPIC_NAMES)) if (names[0] === t || (topic === 'forcingknight' && t === 'chess')) return topic;
  return null;
}

// Which project or role an answer is about, for follow-up suggestions.
const ENTRY_TOPIC = {
  aura: 'aura',
  synapse: 'synapse',
  'reverse-learning': 'reverse-learning',
  'reverse-learning-engineering': 'reverse-learning',
  forcingknight: 'forcingknight',
  'forcingknight-elo': 'forcingknight',
  'forcingknight-build': 'forcingknight',
  lora: 'lora-alerting',
  publication: 'lora-alerting',
  'current-role': 'ey',
  'ey-work': 'ey',
  strength: 'ey',
  perusal: 'perusal',
  'latest-project': 'reverse-learning',
  'first-project': 'lora-alerting',
  'biggest-project': 'aura',
  'aura-synapse': 'aura',
};

// Greetings and thanks only win when the message is nothing but that.
const SMALL_TALK = new Set(['greeting', 'thanks']);
const MIN_SCORE = 2.2;
const MIN_PASSAGE_SCORE = 3;
const MIN_PASSAGE_COVERAGE = 0.5;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const techPatterns = Object.entries(techAliases).map(([key, list]) => ({
  key,
  re: new RegExp(`(^|[^a-z0-9+#])(${list.map(escapeRe).join('|')})(?=[^a-z0-9+#]|$)`),
}));

function detectTech(q) {
  for (const { key, re } of techPatterns) if (re.test(q)) return key;
  return null;
}

const SKILL_INTENT =
  /\b(know|knows|knowledge|use|used|uses|using|experience|experienced|worked with|work with|works with|familiar|skill|skills|can he|does he|has he|did he|proficient|good at|comfortable|level)\b/;

const INTENT_TOKENS = new Set(
  ['know', 'use', 'work', 'experience', 'familiar', 'skill', 'comfortable', 'proficient', 'good', 'level', 'ever', 'certified'].map(stem),
);

const contactLinks = [
  { label: `Email ${person.email}`, href: `mailto:${person.email}` },
  { label: 'LinkedIn', href: person.linkedin },
];

export const FALLBACK = {
  id: 'unknown',
  answer: `I don't know that one. I only answer from the facts on this site, and that isn't covered. ${contactLine}`,
  links: contactLinks,
};

const pretty = (key) =>
  ({ 'aws ec2': 'AWS EC2', oci: 'Oracle Cloud Infrastructure', 'c++': 'C++', gcp: 'Google Cloud', 'node.js': 'Node.js', 'next.js': 'Next.js' })[key] ??
  key.replace(/\b\w/g, (c) => c.toUpperCase());

function guardCheck(q) {
  const tech = detectTech(q);
  for (const g of guards) {
    if (g.test(q)) {
      // A rating question about a specific technology still gets the evidence.
      if (g.id === 'decline-rating' && tech) {
        const t = techAnswer(tech);
        if (t) return { id: g.id, answer: `${g.answer.split(' Ask about')[0]} Here’s the evidence. ${t}`, links: g.links };
      }
      return { id: g.id, answer: g.answer, links: g.links ?? [], topic: ENTRY_TOPIC[g.id] };
    }
  }
  return null;
}

function answerCore(question, ctx = {}) {
  const q = normalize(question ?? '');
  if (!q.trim()) {
    return { id: 'empty', answer: 'Type a question about Abhiram’s work, projects, skills or how to contact him.', links: [] };
  }

  const tech = detectTech(q);
  const topicName = ctx.topic && TOPIC_NAMES[ctx.topic] && PRONOUN.test(q) ? ` ${TOPIC_NAMES[ctx.topic][0]} ` : '';
  const guarded = guardCheck(q + topicName);
  if (guarded) return guarded;

  let tokens = tokenize(question);

  // Only ForcingKnight has a learning rate; without this, "learning" pulls in
  // Reverse Learning.
  if (/ learning rate /.test(q) && !primaryTopic(tokens.filter((t) => t !== 'learning'))) {
    tokens = [...tokens.filter((t) => t !== 'learning'), 'forcingknight', 'reducelronplateau'];
  }

  // Follow-ups like "how was it trained?" carry on from the last topic.
  if (ctx.topic && !primaryTopic(tokens) && TOPIC_NAMES[ctx.topic] && (PRONOUN.test(q) || REFER_BACK.test(q))) {
    tokens = [...tokens, TOPIC_NAMES[ctx.topic][0]];
  }

  // A technology question ("does he know X") rather than a question that
  // happens to mention one ("how did he run long jobs on Vercel").
  const aliasTokens = new Set(techAliases[tech ?? '']?.flatMap(tokenize) ?? []);
  const rest = tokens.filter((t) => !aliasTokens.has(t) && !INTENT_TOKENS.has(t));
  if (tech && (SKILL_INTENT.test(q) || tokens.length <= 2) && rest.length <= 1) {
    const t = techAnswer(tech);
    if (t) return { id: `tech:${tech}`, answer: t, links: [{ label: 'Skills and evidence', href: url('/#skills') }] };
    return {
      id: 'tech-unknown',
      answer: `I don't have anything about ${pretty(tech)} in his work, so I can't say. ${contactLine}`,
      links: contactLinks,
    };
  }

  if (!tokens.length) {
    // "Who is Abhiram?", "Tell me about him": everything was a stopword.
    if (/\b(abhiram|him|he)\b/.test(q)) return pack(entries.find((e) => e.id === 'about'));
    return FALLBACK;
  }

  // Very common questions made of very common words, routed directly.
  for (const r of ROUTES) if (r.test.test(q.trim())) return pack(entries.find((e) => e.id === r.id));

  // A question naming both AURA and SYNAPSE is about how they fit together.
  if (tokens.includes('aura') && tokens.includes('synapse')) return pack(entries.find((e) => e.id === 'aura-synapse'));

  const known = [...new Set(tokens)].filter(isKnown);
  const best = entryIndex.search(known)[0];
  const entryOk = best && best.score >= MIN_SCORE;
  // The question's topic: the project it names first, else the topic of the
  // best curated answer. Passages from that write-up get a boost.
  const topic = primaryTopic(tokens) ?? (entryOk ? ENTRY_TOPIC[best.item.id] : null);
  const rankedPassages = passageIndex.search(known, (p) => (topic && p.topic === topic ? 1.5 : 1) * (p.fact ? 0.7 : 1));
  const entryCoverage = entryOk ? best.coverage : 0;
  // Best passage that covers enough of the question: at least half of it, or
  // clearly more of it than the best curated answer does.
  const eligible = (r) =>
    r.score >= MIN_PASSAGE_SCORE && (r.coverage >= MIN_PASSAGE_COVERAGE || (r.coverage >= 0.4 && r.coverage >= entryCoverage + 0.15));
  const passage = rankedPassages.find(eligible);
  const singleGeneric = passage && passage.matched < 2 && known.every((t) => GENERIC.has(t) || ENTITY.has(t));
  const passageOk = Boolean(passage) && !singleGeneric;

  // Overview question plus specifics ("how was AURA built?") -> passage, when
  // a passage from that same write-up answers the specific part.
  const specificTokens = known.filter((t) => !ENTITY.has(t));
  const passageSpecific =
    passage && specificTokens.length ? specificTokens.filter((t) => tokenize(`${passage.item.title} ${passage.item.text}`).includes(t)).length / specificTokens.length : 0;
  const refinesOverview =
    entryOk && OVERVIEWS.has(best.item.id) && passageOk && passage.item.topic === ENTRY_TOPIC[best.item.id] && passageSpecific >= 0.6;

  // A specific passage beats a curated answer when it covers more of the
  // question ("what is the forcing-line search?" vs "what is ForcingKnight?").
  if (passageOk && (!entryOk || passage.coverage > best.coverage + 0.01 || refinesOverview)) {
    const p = passage.item;
    let answer = passageAnswer(p);
    // Add a second passage from the same write-up when it's nearly as relevant.
    const second = rankedPassages.find(
      (r) => r !== passage && r.item.topic === p.topic && r.coverage >= 0.45 && r.score >= passage.score * 0.55,
    );
    // Keep answers short: only add a second passage when both together stay brief.
    if (second && answer.length + second.item.text.length < 520) answer += ` ${second.item.text}`;
    return { id: `passage:${p.topic}`, answer, links: p.links, topic: p.topic, passageIds: [p.id, second?.item.id].filter(Boolean) };
  }
  if (entryOk) return pack(best.item);
  // Short messages like "hi" or "thanks" score low but are still clear.
  if (best && SMALL_TALK.has(best.item.id) && best.score > 0) return pack(best.item);
  return FALLBACK;
}

function pack(e) {
  return { id: e.id, answer: e.answer, links: e.links ?? [], topic: ENTRY_TOPIC[e.id], more: e.more ? e.id : undefined };
}


const ROUTES = [
  { id: 'current-role', test: /\b(where (does|is|do) (he|abhiram) (work|working|employed)|who (does|is) (he|abhiram) (work|working) (for|with)|^ *is (he|abhiram) (employed|working)( anywhere| now| currently)? *$|what does (he|abhiram) do for (a living|work)|(his|current) (employer|company|job))\b/ },
  { id: 'about', test: /^ *(what does (he|abhiram) do|who is (he|abhiram)) *$/ },
];

// "What about the search?", "and the training?" refer back to the last topic.
const REFER_BACK = /^ *(what|how) about |^ *and /;
const PRONOUN = /\b(it|its|they|them|their|the project|the engine|the platform|the system|the app|the model)\b/;

const TOPIC_LABEL = {
  ...Object.fromEntries(projectsList.map((p) => [p.slug, p.name])),
  ey: 'his work at EY',
  perusal: 'the Perusal Gulf platform',
};

/**
 * Answer a visitor question. `ctx` carries the conversation so far:
 * { topic, shown: Set of passage ids }. Returns { id, answer, links, topic, passageIds }.
 */
export function ask(question, ctx = {}) {
  const raw = String(question ?? '').trim();
  if (!raw) return { id: 'empty', answer: 'Ask me anything about Abhiram: his work, projects, skills or how to reach him.', links: [] };
  const seed = raw.toLowerCase();
  const talk = talkNormalize(raw);
  const { greeted, rest } = splitGreeting(talk);

  // Privacy rules apply to the whole message, greeting or not. A follow-up
  // like "how strong is it?" is read with the current topic named.
  const norm = normalize(raw);
  const topicName = ctx.topic && TOPIC_NAMES[ctx.topic] && PRONOUN.test(norm) ? ` ${TOPIC_NAMES[ctx.topic][0]} ` : '';
  const guarded = guardCheck(norm + topicName);
  if (guarded) return { ...guarded, answer: withGreeting(guarded.answer, greeted, seed) };

  if (!rest) return { id: 'talk:greeting', answer: greetingReply(seed), links: [] };

  // "Yes" to "want to hear more about X?" continues the current topic.
  if (YES.test(rest)) {
    if (ctx.topic || ctx.lastMore) return expand('more', ctx, seed);
    return { id: 'talk:yes', answer: 'Great! What would you like to know? His current role, a project, or his skills are good places to start.', links: [] };
  }

  const bug = bugNote(seed, ctx);
  if (bug) return { ...bug, answer: withGreeting(bug.answer, greeted, seed) };

  const small = smallTalk(rest, { greeted, seed });
  if (small) return { ...small, links: [] };

  // Requests to expand ("more details", "expand on this", "can you elaborate?").
  if (EXPAND.test(rest)) return expand(rest, ctx, seed);

  const r = answerCore(rest, ctx);
  if (r.id === 'unknown') return { ...r, answer: fallbackReply(seed) };
  return { ...r, answer: withGreeting(r.answer, greeted, seed) };
}

// Questions about the bug stories that appear when a visitor squashes a bug:
// "what is this bug 2 thing?", or "what is this about?" right after one shows.
const YES = /^ *(yes|yeah|yea|yep|yup|sure|ok sure|okay sure|yes please|please|please do|go ahead|sounds good|definitely|of course|absolutely)( please)? *[.!]* *$/;
const BUG_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5 };
const BUG_REF = /\bbug ?#? ?([1-5]|one|two|three|four|five)\b|\b(this|that|the|these|those) (bug|bugs|message|messages|note|notes|popup|pop up)\b|\bbugs? (thing|message|note|story|stories|popup|pop up)\b|\bsquash(ed|ing)?\b/;
const VAGUE = /^ *(what|whats|what is|what does|what do) (is )?(this|that|it|these|those) ?(about|mean|means|thing|is)? *$|^ *(explain|meaning)( this| that)? *$|^ *(huh|what|wdym|what do you mean) *$/;

function bugNote(seed, ctx) {
  const s = seed.replace(/[’']/g, '').replace(/[^a-z0-9#]+/g, ' ');
  const ref = s.match(BUG_REF);
  if (!ref && !(ctx.noteFresh && VAGUE.test(s))) return null;
  // "squash" alone or "find the bugs" is the game question, handled by small talk.
  if (ref && !ref[1] && !ctx.noteFresh && !/\b(this|that|these|those|message|note|story|popup|pop up|thing)\b/.test(s)) return null;

  const notes = ctx.notes ?? [];
  const parsed = notes.map((t) => {
    const m = t.match(/^(?:Bug (\d) of 5|All 5 bugs) squashed! (.*)$/);
    return m ? { n: m[1] ? Number(m[1]) : 5, fact: m[2] } : null;
  }).filter(Boolean);
  const wanted = ref?.[1] ? BUG_NUM[ref[1]] ?? Number(ref[1]) : null;
  const note = wanted ? parsed.find((p) => p.n === wanted) : parsed.at(-1);
  const intro = 'Those notes come from the bug hunt on this page: five bugs hide on the home page, and squashing one reveals a true story from Abhiram’s work.';

  if (!note) {
    const answer = wanted
      ? `${intro} You haven’t squashed bug ${wanted} yet, so keep looking!`
      : `${intro} Click one to squash it, and I’ll keep its story here in the chat.`;
    return { id: 'bug-note', answer, links: [] };
  }
  const topic = primaryTopic(tokenize(note.fact)) ?? undefined;
  const label = TOPIC_LABEL[topic];
  const found = parsed.length >= 5 ? 'You’ve found all five.' : `You’ve found ${parsed.length} of 5 so far.`;
  const answer = `${intro} Bug ${note.n}${label ? ` is about ${label}` : ''}. ${found}${label ? ` Want to hear more about ${label}?` : ''}`;
  return { id: 'bug-note', answer, links: [], topic };
}

/**
 * Expands on something. If the message names a subject ("tell me more about
 * his skills"), that subject's full answer is given. Otherwise it expands the
 * last short answer, then continues the current topic with passages not yet
 * shown.
 */
function expand(rest, ctx, seed) {
  const remainder = rest.replace(EXPAND, ' ').replace(EXPAND_FILLER, ' ').replace(/\s+/g, ' ').trim();
  if (tokenize(remainder).length) {
    const r = answerCore(remainder, ctx);
    if (r.id !== 'unknown') {
      const e = entries.find((x) => x.id === r.id);
      if (e?.more) return { ...r, id: `more:${e.id}`, answer: e.more, more: undefined };
      return r;
    }
  }

  if (ctx.lastMore) {
    const e = entries.find((x) => x.id === ctx.lastMore);
    if (e?.more) return { id: `more:${e.id}`, answer: e.more, links: e.links ?? [], topic: ENTRY_TOPIC[e.id] ?? ctx.topic };
  }

  if (ctx.topic) {
    const shown = ctx.shown ?? new Set();
    const next = passages.filter((p) => p.topic === ctx.topic && !p.fact && !shown.has(p.id)).slice(0, 2);
    const label = TOPIC_LABEL[ctx.topic] ?? 'that';
    if (!next.length) {
      return { id: 'more:done', answer: `That’s most of what I know about ${label}. Want to hear about one of his other projects?`, links: [], topic: ctx.topic };
    }
    return {
      id: `more:${ctx.topic}`,
      answer: `Sure, here’s more on ${label}. ${next.map((p) => p.text).join(' ')}`,
      links: next[0].links,
      topic: ctx.topic,
      passageIds: next.map((p) => p.id),
    };
  }

  return {
    id: 'more:what',
    answer: pick(
      [
        'Happy to go deeper. What would you like more on: his work at EY, one of his projects, or his skills?',
        'Sure! More on what, exactly? You can ask about his current role, any of his projects, or his certifications.',
      ],
      seed,
    ),
    links: [],
  };
}

// Words left over around an expand request that don't name a subject.
const EXPAND_FILLER =
  /\b(about|on|regarding|of|into|the|his|him|he|it|its|that|this|these|those|them|please|pls|can|could|would|will|you|u|me|a|an|bit|little|some|bit more|further|abit|for|thanks?|ok|okay|so|just|now|explain|describe|talk|tell|give|show|go|say|share|know|want|like|need|what|more|detail|details)\b/g;

// "tell me more", "more details", "expand on this", "can you elaborate?",
// "go deeper", "explain further", "give me more info", "in more detail".
const EXPAND =
  /\b(tell me more|say more|more (details?|info|information|please|on|about|context|depth)|(give|show|share) (me )?(more|the details|the full)|in (more |greater |full |much more )?detail|details? please|elaborate|expand|go deeper|dig deeper|deeper dive|deep dive|go into (more )?detail|explain (that |this |it |them )?(further|more|fully|properly|in depth|better)|keep going|go on|carry on|continue|what else|anything else|full (answer|version|story|details|picture)|more$|^more|^details?$|^and$)\b/;

function talkNormalize(text) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' .,?!@-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[?!.]+$/, '');
}

export { suggestions, followUps } from '../data/suggestions.js';

