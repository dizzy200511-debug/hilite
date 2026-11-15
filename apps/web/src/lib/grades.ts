import type { PaperLog } from './types';

export const pct = (l: Pick<PaperLog, 'score' | 'max'>) => (l.max ? Math.round((l.score / l.max) * 100) : 0);

/** Average of the last five papers and the change since the one before. */
export function trend(logs: PaperLog[]) {
  const sorted = logs.slice().sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map(pct);
  const last5 = values.slice(-5);
  const avg = last5.length ? Math.round(last5.reduce((a, b) => a + b, 0) / last5.length) : null;
  const change = values.length > 1 ? values[values.length - 1] - values[values.length - 2] : null;
  return { values, avg, change };
}

/**
 * Predicted grade (Pro): a weighted recent average mapped through the grades you logged.
 * Only uses grades from your own logged papers, never guessed boundaries.
 */
export function predictGrade(logs: PaperLog[]): { grade: string; confidence: 'low' | 'medium' | 'high' } | null {
  const graded = logs.filter((l) => l.grade).sort((a, b) => a.date.localeCompare(b.date));
  if (graded.length < 2) return null;
  const recent = graded.slice(-4);
  let wsum = 0, psum = 0;
  recent.forEach((l, i) => { const w = i + 1; wsum += w; psum += pct(l) * w; });
  const target = psum / wsum;
  let best = recent[recent.length - 1];
  recent.forEach((l) => { if (Math.abs(pct(l) - target) < Math.abs(pct(best) - target)) best = l; });
  return { grade: best.grade!, confidence: graded.length >= 6 ? 'high' : graded.length >= 4 ? 'medium' : 'low' };
}
