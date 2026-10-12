// Conversation layer for the portfolio assistant: greetings, its own identity,
// the time in Trivandrum, the site's game, jokes and other small talk. Facts
// about Abhiram still come only from kb.js; this file never states any.

import { assistant } from '../data/assistant.js';
import { person } from '../data/profile.js';

const NAME = assistant.name;

// Stable choice per question, so the same question reads the same way but
// different questions don't all start with the same words.
export function pick(options, seed = '') {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return options[h % options.length];
}

const GREETING = /^(?:hi+|hey+|hello+|hiya|heya|yo|howdy|greetings|good (?:morning|afternoon|evening|day))\b(?:\s+(?:there|trace|bot|buddy|friend))?[\s,!.:-]*/;

/** Split a leading greeting off a message: "hey, what's your name?" -> greeting + rest. */
export function splitGreeting(q) {
  const m = q.trim().match(GREETING);
  if (!m) return { greeted: false, rest: q.trim() };
  return { greeted: true, rest: q.trim().slice(m[0].length).trim() };
}

export const greetingReply = (seed) =>
  pick(
    [
      `Hey! I’m ${NAME}. Ask me anything about Abhiram: his work, projects, skills, or how to reach him.`,
      `Hi there! I’m ${NAME}, Abhiram’s portfolio assistant. What would you like to know about him?`,
      `Hello! I can tell you about Abhiram’s experience, the things he’s built, or how to get in touch. Where should we start?`,
    ],
    seed,
  );

const greetPrefix = (seed) => pick(['Hey! ', 'Hi! ', 'Hello! '], seed);

const ist = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', ...opts }).format(new Date());

// Each intent: a test on the normalized question and a reply builder.
const intents = [
  {
    id: 'name',
    test: (q) =>
      /\b(your name|ur name|who are you|who r u|what are you called|what should i call you|introduce yourself|who am i (talking|speaking|chatting) (to|with))\b/.test(q),
    reply: (s) =>
      pick(
        [
          `I’m ${NAME}, Abhiram’s portfolio assistant. I know what’s on this site inside out, so ask me about his work, projects, skills or how to reach him.`,
          `I’m ${NAME}, the assistant on Abhiram’s portfolio. The name comes from a stack trace, which is how you follow a bug back to its cause. Debugging happens to be Abhiram’s core strength.`,
        ],
        s,
      ),
  },
  {
    id: 'ai',
    test: (q) =>
      /\b(are (you|u) (a |an )?(ai|a\.i|bot|robot|human|real|person|chatgpt|gpt|llm|machine|program)|is this (an? )?(ai|bot|chatgpt)|how do (you|u) work|how were you (made|built)|what model)\b/.test(q),
    reply: () =>
      `I’m ${NAME}, a lightweight assistant built into this site. I run right here in your browser and answer from what’s on Abhiram’s portfolio, so I won’t make things up. If something isn’t covered, I’ll tell you and point you to ${person.email}.`,
  },
  {
    id: 'creator',
    test: (q) => /\bwho (made|built|created|designed|programmed|coded) (you|this (site|website|portfolio|page|bot))\b/.test(q),
    reply: () => `I’m part of Abhiram’s portfolio site. For anything about how it was put together, the best person to ask is Abhiram himself at ${person.email}.`,
  },
  {
    id: 'how-are-you',
    test: (q) => /\b(how are (you|u)|how r u|how('s| is) it going|how do you do|what('s| is) up|wassup|sup)\b/.test(q),
    reply: (s) =>
      pick(
        [
          'Doing great, thanks for asking! Ready to talk about Abhiram’s work whenever you are. Want to start with what he’s doing now, or his projects?',
          'All good here, thanks! Ask me anything about Abhiram. His chess engine is a fun place to start.',
        ],
        s,
      ),
  },
  {
    id: 'time',
    test: (q) =>
      /\b(time|clock)\b/.test(q) &&
      !/\b(full.?time|part.?time|on time|time zone overlap|how much time|take|took|training time|long)\b/.test(q),
    reply: () =>
      `It’s ${ist({ hour: 'numeric', minute: '2-digit' })} on ${ist({ weekday: 'long' })} in Trivandrum right now (India Standard Time, UTC+5:30), where Abhiram is based.`,
  },
  {
    id: 'date',
    test: (q) => /\b(what('s| is) (the |today'?s )?(date|day)|what day is it|today'?s date)\b/.test(q),
    reply: () => `In Trivandrum it’s ${ist({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`,
  },
  {
    id: 'game',
    test: (q) =>
      /\b(achievements?|trophy|trophies|side quest|explorer progress|the game)\b/.test(q) ||
      (/\bbugs?\b/.test(q) && /\b(hidden|hiding|find|squash|where|game|catch|page|site|how many)\b/.test(q) && !/\bfix(es|ed|ing)?\b/.test(q)),
    reply: () =>
      'There’s a little side quest: five bugs are hiding on the home page, and one of them crawls across the top. Click one to squash it and you’ll get a real story from Abhiram’s debugging work. Squashing bugs, opening his projects, chatting with me and a few other things unlock achievements. Check the trophy in the top bar to see your progress.',
  },
  {
    id: 'joke',
    test: (q) => /\b(joke|make me laugh|something funny|tell me something fun)\b/.test(q),
    reply: (s) =>
      pick(
        [
          'Why do programmers prefer dark mode? Because light attracts bugs. Speaking of which, five of them are hiding on this page.',
          'A batch job walks into a bar at 2 a.m. The bartender says, “You again? Didn’t you finish last night?” Abhiram is the one who finds out why it didn’t.',
        ],
        s,
      ),
  },
  {
    id: 'compliment',
    test: (q) =>
      /\b((you('re| are)|ur|this is) (so )?(cool|awesome|great|smart|nice|amazing|cute|helpful|fun)|nice (site|website|portfolio|work|bot)|love (this|the|your) (site|website|portfolio|design)|great (site|portfolio|work|job)|cool (site|bot|portfolio)|good bot|well done)\b/.test(q),
    reply: (s) =>
      pick(
        [
          'Thank you! I’ll pass that along. If you like what you see, Abhiram would love to hear from you.',
          'That’s kind of you! If you’d like to tell Abhiram directly, the contact section is just below.',
        ],
        s,
      ),
  },
  {
    id: 'capabilities',
    test: (q) => /\b(what can (you|u) do|what can i ask|what do you know|help me|^help$|how can you help|what should i ask)\b/.test(q),
    reply: () =>
      'I can tell you about Abhiram’s current role, past jobs, each of his projects in detail (down to things like how his chess engine searches), his skills and where he used them, his certifications, education and publication, whether he’s open to new roles, the time where he is, and how to contact him.',
  },
  {
    id: 'thanks',
    test: (q) => /^(thanks?|thank (you|u)|thx|ty|cheers|much appreciated|great,? thanks?|ok,? thanks?|awesome,? thanks?)\b/.test(q),
    reply: (s) => pick([`You’re welcome! Anything else you’d like to know?`, `Happy to help! Ask away if anything else comes up.`], s),
  },
  {
    id: 'bye',
    test: (q) => /^(bye|goodbye|see (you|ya)|later|cya|good night|gotta go)\b/.test(q),
    reply: () => `Bye for now! If you’d like to reach Abhiram, email ${person.email}.`,
  },
  {
    id: 'ok',
    test: (q) => /^(ok|okay|cool|nice|great|got it|alright|i see|hmm+|interesting|wow)[.!]*$/.test(q),
    reply: (s) => pick(['Glad that helped. Want to dig into one of his projects next?', 'Anything else you’re curious about?'], s),
  },
];

/** Returns { id, answer } for small talk, or null. `q` is the normalized question. */
export function smallTalk(q, { greeted = false, seed = '' } = {}) {
  const text = q.trim();
  for (const it of intents) {
    if (it.test(text)) return { id: `talk:${it.id}`, answer: (greeted ? greetPrefix(seed) : '') + it.reply(seed) };
  }
  return null;
}

export const withGreeting = (answer, greeted, seed) => (greeted ? greetPrefix(seed) + answer : answer);

export const fallbackReply = (seed) =>
  pick(
    [
      `Hmm, I don’t have that one. I only know what’s on Abhiram’s portfolio, and that isn’t covered. You could ask him directly at ${person.email} or on LinkedIn.`,
      `That’s outside what I know, sorry! I can only speak to what’s on this site. For anything else, Abhiram is at ${person.email}.`,
      `I’m not sure about that, and I’d rather not guess. Try asking Abhiram directly at ${person.email}, or ask me about his work and projects.`,
    ],
    seed,
  );

