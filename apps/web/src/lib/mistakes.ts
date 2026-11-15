import { addDays, today } from './dates';
import { cleanText, uid } from './sanitize';
import type { Mistake, MistakeKind, MistakeSource, Mistakes } from './types';

/** Days until the next retest after each correct answer. Three correct retests in a row clears it. */
const STEPS = [1, 3, 7];
const MAX_KEPT = 800;

export function newMistake(m: { specId?: string; topic?: number; source: MistakeSource; kind: MistakeKind; what: string; fix: string }): Mistake {
  return { id: uid(), specId: m.specId || undefined, topic: m.topic, source: m.source, kind: m.kind, what: cleanText(m.what, 1000), fix: cleanText(m.fix, 1500), at: Date.now(), due: addDays(today(), 1), step: 0 };
}

/** Adds mistakes, dropping the oldest cleared ones first if the log gets very long. */
export function addMistakes(log: Mistakes, items: Mistake[]): Mistakes {
  let list = log.list.concat(items);
  if (list.length > MAX_KEPT) {
    const cleared = list.filter((m) => m.cleared).sort((a, b) => a.at - b.at);
    const drop = new Set(cleared.slice(0, list.length - MAX_KEPT).map((m) => m.id));
    list = list.filter((m) => !drop.has(m.id)).slice(-MAX_KEPT);
  }
  return { list };
}

export function retest(m: Mistake, gotIt: boolean): Mistake {
  if (!gotIt) return { ...m, step: 0, due: addDays(today(), 1), cleared: undefined };
  const step = m.step + 1;
  if (step >= STEPS.length) return { ...m, step, cleared: Date.now() };
  return { ...m, step, due: addDays(today(), STEPS[step]) };
}

export const isOpen = (m: Mistake) => !m.cleared;
export const isDueMistake = (m: Mistake) => !m.cleared && m.due <= today();

export function openBySpec(list: Mistake[]): Record<string, number> {
  const out: Record<string, number> = {};
  list.forEach((m) => { if (!m.cleared && m.specId) out[m.specId] = (out[m.specId] || 0) + 1; });
  return out;
}

/** Counts of each kind of mistake in the last 60 days, most common first. */
export function mistakePattern(list: Mistake[]): { kind: MistakeKind; n: number }[] {
  const since = Date.now() - 60 * 864e5;
  const counts = new Map<MistakeKind, number>();
  list.forEach((m) => { if (m.at >= since) counts.set(m.kind, (counts.get(m.kind) || 0) + 1); });
  return Array.from(counts.entries()).map(([kind, n]) => ({ kind, n })).sort((a, b) => b.n - a.n);
}
