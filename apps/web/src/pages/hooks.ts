import { useMemo } from 'react';
import { specById } from '../catalog/catalog';
import { mySittings } from '../lib/exams';
import { useBlurts, useChecklist, useCoach, useDecks, useExamDates, useMistakes, usePlanner, useProfile } from '../lib/data';
import { store, useStoreVersion } from '../lib/store';
import { isDue, isNew } from '../lib/srs';
import { today } from '../lib/dates';
import { emptyDeck, METHODS, type DeckData, type Method, type Profile, type Session } from '../lib/types';
import { useAuth } from '../auth/AuthProvider';
import { buildPlan } from '../lib/planner';
import { openBySpec } from '../lib/mistakes';
import { weakMap, weaknesses } from '../lib/weakness';

export function useSittings() {
  const [profile] = useProfile();
  const [dates] = useExamDates();
  return useMemo(() => mySittings(profile, dates), [profile, dates]);
}
export function useColourOf() {
  const [profile] = useProfile();
  return (specId?: string) => profile.subjects.find((s) => s.specId === specId)?.colour ?? 9;
}
export const subjectName = (specId?: string) => (specId ? specById(specId)?.subject ?? 'Subject' : 'General');

export function deckCounts(d: DeckData, newPerDay: number) {
  const used = d.stats.newDay[today()] || 0;
  let due = 0, fresh = 0, mastered = 0;
  d.cards.forEach((c) => { if (isDue(c)) due++; else if (isNew(c)) fresh++; if ((c.ivl || 0) >= 21) mastered++; });
  return { total: d.cards.length, due, fresh, newToday: Math.min(fresh, Math.max(0, newPerDay - used)), mastered };
}
export function useDueCount() {
  useStoreVersion();
  const [decks] = useDecks();
  const [profile] = useProfile();
  let n = 0;
  decks.list.forEach((d) => { const c = deckCounts(store.get<DeckData>('deck_' + d.id, emptyDeck()), profile.newCardsPerDay); n += c.due + c.newToday; });
  return n;
}

export function usePro() {
  const auth = useAuth();
  return auth.plan === 'pro' || auth.isOwner;
}

/** A session's topic name, or "Mixed topics" for whole-subject sessions. */
export const sessionTopic = (s: Pick<Session, 'specId' | 'topic'>) => (s.topic < 0 ? 'Mixed topics' : specById(s.specId)?.topics[s.topic] ?? 'Topic');

/** Where a planned session's Start button goes, with the subject and topic filled in. */
export function toolLink(method: Method, specId?: string, topic?: number) {
  const tool = METHODS[method].tool;
  const q = new URLSearchParams();
  if (specId) q.set('spec', specId);
  if (topic != null && topic >= 0) q.set('topic', String(topic));
  const qs = q.toString();
  return tool + (qs ? '?' + qs : '');
}

/** Weak topics, worked out from everything you've done. Recomputed when any of it changes. */
export function useWeakness() {
  const version = useStoreVersion();
  const [profile] = useProfile();
  const [checklist] = useChecklist();
  const [mistakes] = useMistakes();
  const [coach] = useCoach();
  const [blurts] = useBlurts();
  const [decks] = useDecks();
  return useMemo(() => weaknesses({
    subjects: profile.subjects, checklist, mistakes: mistakes.list, coach: coach.attempts, blurts: blurts.list,
    decks: decks.list.map((meta) => ({ meta, data: store.get<DeckData>('deck_' + meta.id, emptyDeck()) })),
  }), [version]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Rebuilds the plan with everything the planner can use: ratings, open mistakes and, for Pro, weak topics. */
export function useRebuildPlan() {
  const [, setPlanner] = usePlanner();
  const [profile] = useProfile();
  const [checklist] = useChecklist();
  const [mistakes] = useMistakes();
  const sittings = useSittings();
  const weak = useWeakness();
  const pro = usePro();
  return (override?: Partial<Profile>) => {
    const p = { ...profile, ...override };
    const adaptive = pro && p.adaptive;
    setPlanner((pl) => ({ ...pl, sessions: buildPlan(sittings, checklist, p, pl.sessions, { pro: adaptive, proPlans: pro, weak: adaptive ? weakMap(weak) : undefined, openMistakes: openBySpec(mistakes.list) }), builtAt: Date.now() }));
  };
}
