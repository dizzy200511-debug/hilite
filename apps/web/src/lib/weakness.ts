import { specById } from '../catalog/catalog';
import { pct } from './grades';
import type { Blurt, Checklist, CoachAttempt, DeckData, DeckMeta, Mistake, SubjectChoice } from './types';

export interface TopicWeakness { specId: string; topic: number; name: string; subject: string; score: number; reasons: string[] }

/**
 * How weak each topic looks, from everything you've done in Hilite: your own rating,
 * open mistakes, flashcards you keep forgetting, coach marks and blurt scores.
 * Score runs 0 (no sign of trouble) to 1 (clearly weak).
 */
export function weaknesses(input: {
  subjects: SubjectChoice[]; checklist: Checklist; mistakes: Mistake[];
  decks: { meta: DeckMeta; data: DeckData }[]; coach: CoachAttempt[]; blurts: Blurt[];
}): TopicWeakness[] {
  const out: TopicWeakness[] = [];
  const since = Date.now() - 45 * 864e5;
  input.subjects.forEach((sub) => {
    const spec = specById(sub.specId);
    if (!spec) return;
    spec.topics.forEach((name, topic) => {
      let score = 0;
      const reasons: string[] = [];
      const rating = (input.checklist[spec.id] || {})[topic];
      if (rating === 'r') { score += 0.35; reasons.push('You rated it red'); }
      else if (rating === 'a') { score += 0.15; reasons.push('You rated it amber'); }
      else if (rating === 'g') score -= 0.1;

      const open = input.mistakes.filter((m) => !m.cleared && m.specId === spec.id && m.topic === topic);
      if (open.length) { score += Math.min(0.45, open.length * 0.15); reasons.push(open.length + (open.length === 1 ? ' open mistake' : ' open mistakes')); }

      let cards = 0, lapses = 0;
      input.decks.forEach(({ meta, data }) => {
        if (meta.specId !== spec.id || meta.topic !== topic) return;
        data.cards.forEach((c) => { cards++; lapses += c.lapses || 0; });
      });
      if (cards && lapses) {
        const ratio = lapses / cards;
        if (ratio >= 0.2) { score += Math.min(0.3, ratio * 0.3); reasons.push('Forgot flashcards ' + lapses + (lapses === 1 ? ' time' : ' times')); }
      }

      const marked = input.coach.filter((a) => a.specId === spec.id && a.topic === topic && a.at >= since && a.max > 0);
      if (marked.length) {
        const avg = marked.reduce((s, a) => s + pct({ score: a.score, max: a.max }), 0) / marked.length;
        if (avg < 70) { score += 0.35 * (1 - avg / 100); reasons.push('Coach questions: ' + Math.round(avg) + '% on average'); }
        else score -= 0.1;
      }

      const blurt = input.blurts.filter((b) => b.specId === spec.id && b.topic === topic).sort((a, b) => b.at - a.at)[0];
      if (blurt && blurt.score < 50) { score += 0.2; reasons.push('Last blurt: ' + blurt.score + '% recalled'); }

      score = Math.max(0, Math.min(1, score));
      if (score > 0) out.push({ specId: spec.id, topic, name, subject: spec.subject, score, reasons });
    });
  });
  return out.sort((a, b) => b.score - a.score);
}

export const weakMap = (list: TopicWeakness[]) => new Map(list.map((w) => [w.specId + ':' + w.topic, w.score]));
