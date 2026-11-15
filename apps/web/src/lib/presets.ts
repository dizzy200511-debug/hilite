import type { Spec } from '../catalog/catalog';
import type { Method } from './types';

/**
 * Preset revision plans. Each one is a sequence of active methods per topic, spaced out
 * by days after the topic is first learnt. The planner squeezes the gaps when exams are close.
 */
export type PresetId = 'auto' | 'balanced' | 'steady' | 'crunch' | 'mocks' | 'short' | 'practice' | 'essay';
export type SubjectKind = 'maths' | 'science' | 'cs' | 'english-lit' | 'english-lang' | 'language' | 'humanities';

export interface Preset {
  id: Exclude<PresetId, 'auto'>;
  name: string;
  summary: string;
  bestFor: string;
  /** [days after first learning the topic, method]. The first stage is day 0. */
  stages: [number, Method][];
  /** Extra stage for topics rated red. */
  red: [number, Method];
  /** One session per subject per week across all its topics. */
  weekly: Method[];
  /** Overrides your usual session length. */
  sessionMins?: number;
  /** Method guides that explain this plan. */
  guides: string[];
}

export const PRESETS: Preset[] = [
  {
    id: 'balanced', name: 'Balanced',
    summary: 'Learn each topic, review it with flashcards after 3 days, do exam questions after 8, then teach it back after 18.',
    bestFor: 'Most subjects, with a few months to go.',
    stages: [[0, 'learn'], [3, 'review'], [8, 'pastq'], [18, 'teach']], red: [12, 'review'], weekly: [],
    guides: ['blurting', 'spaced-repetition', 'past-papers', 'feynman'],
  },
  {
    id: 'steady', name: 'Steady from now',
    summary: 'Cornell notes and flashcards first, then long gaps between reviews, blurts and exam questions, with a mixed session each week.',
    bestFor: 'Starting early, three months or more before your exams.',
    stages: [[0, 'notes'], [1, 'cards'], [4, 'review'], [10, 'blurt'], [21, 'pastq'], [35, 'review'], [56, 'teach']], red: [15, 'blurt'], weekly: ['mixed'],
    guides: ['cornell', 'flashcards', 'spaced-repetition', 'interleaving'],
  },
  {
    id: 'crunch', name: 'Final four weeks',
    summary: 'Straight into blurting and exam questions, quick reviews, a timed set, then redo every mistake.',
    bestFor: 'The last month before the exams, when you’ve already learnt most of the content.',
    stages: [[0, 'blurt'], [1, 'pastq'], [3, 'review'], [6, 'timed'], [9, 'mistakes']], red: [4, 'pastq'], weekly: [],
    guides: ['blurting', 'past-papers', 'timed-practice', 'mistake-log'],
  },
  {
    id: 'mocks', name: 'Mock sprint',
    summary: 'Two tight weeks: blurt, make cards, review, exam questions, then redo what you got wrong.',
    bestFor: 'Mocks or a test in the next two to three weeks.',
    stages: [[0, 'blurt'], [1, 'cards'], [3, 'review'], [6, 'pastq'], [9, 'mistakes']], red: [5, 'blurt'], weekly: [],
    guides: ['blurting', 'flashcards', 'past-papers', 'mistake-log'],
  },
  {
    id: 'short', name: 'Little and often',
    summary: '20-minute sessions with breaks: flashcards, a blurt, reviews and a mind map before exam questions, plus a weekly mixed quiz.',
    bestFor: 'Busy weeks, learning vocabulary, or when long sessions don’t stick.',
    stages: [[0, 'cards'], [1, 'blurt'], [3, 'review'], [7, 'mindmap'], [12, 'review'], [20, 'pastq']], red: [5, 'review'], weekly: ['mixed'],
    sessionMins: 20, guides: ['flashcards', 'focus', 'mind-maps', 'interleaving'],
  },
  {
    id: 'practice', name: 'Practice heavy',
    summary: 'Learn from worked examples, then mostly exam questions, redoing mistakes and mixed practice each week.',
    bestFor: 'Maths, sciences and computer science, where marks come from applying what you know.',
    stages: [[0, 'learn'], [2, 'pastq'], [5, 'mistakes'], [11, 'pastq'], [22, 'timed']], red: [8, 'pastq'], weekly: ['mixed'],
    guides: ['worked-examples', 'past-papers', 'mistake-log', 'interleaving'],
  },
  {
    id: 'essay', name: 'Essay subjects',
    summary: 'Cornell notes, memorise key quotes and facts, map the ideas, plan exam answers, teach it back, then write one timed.',
    bestFor: 'English, history, RS and other subjects marked on extended writing.',
    stages: [[0, 'notes'], [2, 'memorise'], [5, 'mindmap'], [9, 'pastq'], [16, 'teach'], [26, 'timed']], red: [12, 'blurt'], weekly: [],
    guides: ['cornell', 'memorising', 'mind-maps', 'past-papers'],
  },
];

export const presetById = (id: string) => PRESETS.find((p) => p.id === id);

export function subjectKind(spec: Spec): SubjectKind {
  const s = spec.subject;
  if (/Mathematics|Statistics/.test(s)) return 'maths';
  if (/Biology|Chemistry|Physics|Combined Science/.test(s)) return 'science';
  if (/Computer Science/.test(s)) return 'cs';
  if (/English Literature/.test(s)) return 'english-lit';
  if (/English Language/.test(s)) return 'english-lang';
  if (/French|Spanish|German|Italian|Mandarin|Latin/.test(s)) return 'language';
  return 'humanities';
}

const AUTO: Record<SubjectKind, Preset['id']> = {
  maths: 'practice', science: 'practice', cs: 'practice',
  'english-lit': 'essay', 'english-lang': 'essay', humanities: 'essay', language: 'short',
};

/** The preset a subject follows. "Auto" matches each subject to the plan that suits how it's examined. */
export function presetFor(id: PresetId, spec: Spec): Preset {
  return presetById(id === 'auto' ? AUTO[subjectKind(spec)] : id) || PRESETS[0];
}
