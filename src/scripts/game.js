// Visitor exploration game: achievements and the bug hunt.
// It scores what the VISITOR explores, never Abhiram's skills.
// State lives in localStorage when available and falls back to memory.

import { assistant } from '../data/assistant.js';

const KEY = 'ar-explorer-v1';

export const ACHIEVEMENTS = [
  { id: 'bugs', title: 'Root cause', text: 'Squash all 5 bugs hidden on the home page.' },
  { id: 'graph', title: 'Graph walker', text: 'Drag a node or open a project from the work graph.' },
  { id: 'chat', title: 'Small talk', text: `Ask ${assistant.name} a question about Abhiram.` },
  { id: 'levels', title: 'Completionist', text: 'Open all five project write-ups.' },
  { id: 'resume', title: 'Paper trail', text: 'Open the résumé.' },
  { id: 'verified', title: 'Trust but verify', text: 'Open a certification’s verification link.' },
  { id: 'hello', title: 'Hello, world', text: 'Send Abhiram a message from the contact section.' },
];

export const BUG_COUNT = 5;
export const PROJECT_COUNT = 5;

let memory = { ach: [], bugs: [], visited: [] };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) memory = { ...memory, ...JSON.parse(raw) };
  } catch {
    /* storage blocked: keep in-memory state */
  }
  return memory;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* ignore */
  }
}

load();

export const state = () => memory;

const emit = (type, detail) => document.dispatchEvent(new CustomEvent(type, { detail }));

export function unlock(id) {
  if (memory.ach.includes(id)) return false;
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return false;
  memory.ach = [...memory.ach, id];
  save();
  emit('game:unlock', a);
  emit('game:change', memory);
  return true;
}

export function squash(bugId, fact = '') {
  if (memory.bugs.includes(bugId)) return memory.bugs.length;
  memory.bugs = [...memory.bugs, bugId];
  save();
  emit('game:squash', { id: bugId, count: memory.bugs.length, fact });
  emit('game:change', memory);
  if (memory.bugs.length >= BUG_COUNT) unlock('bugs');
  return memory.bugs.length;
}

export function visitProject(slug) {
  if (!memory.visited.includes(slug)) {
    memory.visited = [...memory.visited, slug];
    save();
    emit('game:change', memory);
  }
  if (memory.visited.length >= PROJECT_COUNT) unlock('levels');
}

export function reset() {
  memory = { ach: [], bugs: [], visited: [] };
  save();
  emit('game:change', memory);
  emit('game:reset', memory);
}

export const reducedMotion = () =>
  document.documentElement.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches;
