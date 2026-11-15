import { addDays, today } from './dates';

export interface Card {
  id: string;
  f: string;
  b: string;
  img?: string;
  due?: string;
  ivl?: number;
  ef?: number;
  reps?: number;
  lapses?: number;
  last?: string;
}
export type Grade = 1 | 3 | 4 | 5;

export const isNew = (c: Card) => !c.due;
export const isDue = (c: Card) => !!c.due && c.due <= today();

/** SM-2 style scheduling with Anki-like first steps. */
export function schedule(card: Card, q: Grade): Card {
  const t = today();
  const c = { ...card, reps: card.reps || 0, ef: card.ef || 2.5, ivl: card.ivl || 0 };
  if (q < 3) {
    c.reps = 0; c.ivl = 0; c.lapses = (c.lapses || 0) + 1; c.due = t;
  } else {
    c.reps += 1;
    if (c.reps === 1) c.ivl = q === 5 ? 3 : 1;
    else if (c.reps === 2) c.ivl = q === 3 ? 3 : q === 5 ? 8 : 6;
    else c.ivl = Math.max(c.ivl + 1, Math.round(c.ivl * (q === 3 ? 1.2 : q === 5 ? c.ef * 1.3 : c.ef)));
    c.ef = Math.max(1.3, c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    c.due = addDays(t, c.ivl);
  }
  c.last = t;
  return c;
}
export function intervalLabel(card: Card, q: Grade): string {
  if (q < 3) return 'again soon';
  const n = schedule(card, q).ivl || 1;
  return n < 30 ? n + (n === 1 ? ' day' : ' days') : Math.round(n / 30) + ' mo';
}
export const isMastered = (c: Card) => (c.ivl || 0) >= 21;

const SEPS = ['\t', ' - ', ' – ', ' — ', ' = ', ' : ', ': ', ' -- '];
/** Turns pasted lines like "term - definition" into cards. */
export function parseCardLines(text: string): { f: string; b: string }[] {
  const out: { f: string; b: string }[] = [];
  text.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    let best = -1, sep = '';
    SEPS.forEach((s) => { const i = line.indexOf(s); if (i > 0 && (best < 0 || i < best)) { best = i; sep = s; } });
    if (best < 0) return;
    const f = line.slice(0, best).trim(), b = line.slice(best + sep.length).trim();
    if (f && b) out.push({ f, b });
  });
  return out;
}
export const normAnswer = (s: string) => s.toLowerCase().replace(/[.,;:!?"'()]/g, '').replace(/\s+/g, ' ').trim();
export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
/** 'ok' exact, 'close' small typo (counts as right), 'no' wrong. */
export function checkTyped(typed: string, answer: string): 'ok' | 'close' | 'no' {
  const a = normAnswer(typed), b = normAnswer(answer);
  if (!a) return 'no';
  if (a === b) return 'ok';
  const allow = b.length >= 6 ? Math.max(2, Math.round(b.length * 0.22)) : b.length >= 4 ? 1 : 0;
  return levenshtein(a, b) <= allow ? 'close' : 'no';
}
export function shuffle<T>(a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}
