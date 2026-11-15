import type { Card } from './srs';
import type { PresetId } from './presets';

export interface SubjectChoice { specId: string; tier?: 'F' | 'H'; colour: number }

export interface Profile {
  name: string;
  onboarded: boolean;
  subjects: SubjectChoice[];
  dailyGoalMins: number;
  weekdayMins: number;
  weekendMins: number;
  sessionMins: number;
  restDays: number[];
  newCardsPerDay: number;
  theme: 'auto' | 'light' | 'dark';
  reminders: boolean;
  /** Which preset revision plan the planner follows. */
  planPreset: PresetId;
  /** Pro: let your mistakes and weak topics reshape the plan. */
  adaptive: boolean;
}
export const DEFAULT_PROFILE: Profile = {
  name: '', onboarded: false, subjects: [], dailyGoalMins: 120, weekdayMins: 90, weekendMins: 180,
  sessionMins: 30, restDays: [], newCardsPerDay: 20, theme: 'auto', reminders: true,
  planPreset: 'auto', adaptive: true,
};

/** Your own dates for papers Hilite doesn't have dates for, or overrides. Key: specId:paperId */
export type ExamDates = Record<string, { date: string; session: 'AM' | 'PM' }>;

/**
 * Your own tests: school tests, mocks and end-of-topic tests. `topics` are indexes into the spec's topics;
 * `extra` is anything else the test covers, in the student's own words.
 */
export interface OwnTest {
  id: string; title: string; specId?: string; topics: number[]; extra: string;
  date: string; session: 'AM' | 'PM' | ''; mins?: number; notes: string;
  score?: number; max?: number;
}
export interface OwnTests { list: OwnTest[] }

/** Topic confidence. Key: specId, then topic index. */
export type Rating = 'r' | 'a' | 'g';
export type Checklist = Record<string, Record<number, Rating>>;

export type Method = 'learn' | 'cards' | 'review' | 'pastq' | 'teach' | 'timed' | 'blurt' | 'notes' | 'mindmap' | 'memorise' | 'mistakes' | 'mixed' | 'coach';
/** topic is an index into the spec's topics, or -1 for a session across the whole subject. */
export interface Session { id: string; specId: string; topic: number; method: Method; stage: number; day: string; mins: number; done: boolean; doneAt?: number; /** Revision for one of your own tests. */ testId?: string }
export interface Task { id: string; title: string; specId?: string; due?: string; mins: number; done: number }
export interface Planner { sessions: Session[]; tasks: Task[]; builtAt?: number }
export const DEFAULT_PLANNER: Planner = { sessions: [], tasks: [] };

export interface PaperLog {
  id: string; specId: string; paperId: string; year: number; series: 'June' | 'November' | 'Mock' | 'Other';
  tier?: 'F' | 'H'; score: number; max: number; date: string; grade?: string; timedMins?: number; notes?: string;
}
export interface Papers { logs: PaperLog[] }

export interface FocusSession { s: number; m: number; specId?: string }
export interface Focus { sessions: FocusSession[]; work: number; brk: number; lbrk: number; every: number }
export const DEFAULT_FOCUS: Focus = { sessions: [], work: 25, brk: 5, lbrk: 15, every: 4 };

export interface DeckMeta { id: string; name: string; specId?: string; topic?: number; created: number }
export interface Decks { list: DeckMeta[] }
export interface DeckData { cards: Card[]; stats: { rev: Record<string, number>; ok: Record<string, number>; newDay: Record<string, number> } }
export const emptyDeck = (): DeckData => ({ cards: [], stats: { rev: {}, ok: {}, newDay: {} } });

/** Every revision method the planner can schedule: how to do it, its guide, and the tool that runs it. */
export const METHODS: Record<Method, { name: string; how: string; guide: string; tool: string; pro?: boolean }> = {
  learn: { name: 'Learn and blurt', how: 'Read your notes once, close them, then write down everything you remember. Check, and fill the gaps in a different colour.', guide: 'blurting', tool: '/tools/blurt' },
  cards: { name: 'Make flashcards', how: 'Turn the topic into question-and-answer cards in Hilite, then test yourself once.', guide: 'flashcards', tool: '/flashcards' },
  review: { name: 'Flashcard review', how: 'Test yourself on this topic’s cards. Say each answer before you flip.', guide: 'spaced-repetition', tool: '/flashcards' },
  pastq: { name: 'Exam questions', how: 'Do past-paper questions on this topic, then mark them with the mark scheme. Log every mark you lost in your mistake log.', guide: 'past-papers', tool: '/papers' },
  teach: { name: 'Teach it back', how: 'Explain the topic out loud without notes, as if teaching a friend. Note where you got stuck.', guide: 'feynman', tool: '/tools/teach' },
  timed: { name: 'Timed practice', how: 'Do a timed set of exam questions on this topic under exam conditions.', guide: 'timed-practice', tool: '/papers' },
  blurt: { name: 'Blurt from memory', how: 'Without notes, write everything you know about the topic for 10 minutes. Then check it and note what you missed.', guide: 'blurting', tool: '/tools/blurt' },
  notes: { name: 'Cornell notes', how: 'Make condensed notes with cue questions down the side and a short summary at the bottom. Cover the notes and answer the cues.', guide: 'cornell', tool: '/tools/notes' },
  mindmap: { name: 'Mind map', how: 'Map the topic from memory: the big idea in the middle, branches for each part, examples on the ends. Then check and add what you missed.', guide: 'mind-maps', tool: '/tools/mindmap' },
  memorise: { name: 'Memorise key quotes and facts', how: 'Learn the quotes, dates, definitions or equations you need word for word, hiding more of each one every round.', guide: 'memorising', tool: '/tools/memorise' },
  mistakes: { name: 'Redo your mistakes', how: 'Retest yourself on the mistakes in your log that are due. Only clear one when you get it right without help.', guide: 'mistake-log', tool: '/tools/mistakes' },
  mixed: { name: 'Mixed practice', how: 'Answer questions from different topics in a random order, so you practise choosing the right method as well as using it.', guide: 'interleaving', tool: '/tools/mixed' },
  coach: { name: 'AI targeted practice', how: 'The AI coach writes questions aimed at your weak spots and past mistakes, then marks your answers.', guide: 'mistake-log', tool: '/coach', pro: true },
};

/** Why a mark was lost. Knowing the pattern matters as much as the fix. */
export type MistakeKind = 'knowledge' | 'recall' | 'misread' | 'technique' | 'careless' | 'timing';
export const MISTAKE_KINDS: Record<MistakeKind, { name: string; hint: string; guide: string }> = {
  knowledge: { name: 'Didn’t know it', hint: 'A gap in what you’ve learnt. Relearn it, then make a flashcard.', guide: 'active-recall' },
  recall: { name: 'Knew it but forgot', hint: 'You’d learnt it but couldn’t bring it back. More spaced retrieval fixes this.', guide: 'spaced-repetition' },
  misread: { name: 'Misread the question', hint: 'Answered a different question. Underline the command word and key terms first.', guide: 'reading-questions' },
  technique: { name: 'Exam technique', hint: 'Knew the content but didn’t give the examiner what the marks need.', guide: 'command-words' },
  careless: { name: 'Careless slip', hint: 'Arithmetic, units, copying or spelling. Build a checking routine.', guide: 'reading-questions' },
  timing: { name: 'Ran out of time', hint: 'Use about a minute per mark and move on when you’re stuck.', guide: 'timing' },
};
export type MistakeSource = 'paper' | 'cards' | 'blurt' | 'teach' | 'coach' | 'quiz' | 'own';
export interface Mistake {
  id: string; specId?: string; topic?: number; source: MistakeSource; kind: MistakeKind;
  /** The question, or what went wrong. */
  what: string;
  /** The right answer, or what to do next time. */
  fix: string;
  at: number; due: string; step: number; cleared?: number;
}
export interface Mistakes { list: Mistake[] }

/** Cornell notes: the list holds titles; each note's text is its own document so big notes don't share a size limit. */
export interface NoteMeta { id: string; title: string; specId?: string; topic?: number; updated: number }
export interface Notes { list: NoteMeta[] }
export interface NoteData { cues: string; body: string; summary: string }

export interface Blurt { id: string; specId?: string; topic?: number; at: number; mins: number; score: number; text: string; gaps: string }
export interface Blurts { list: Blurt[] }

export interface MemoItem { id: string; title: string; text: string; specId?: string; level: number; best: number; updated: number }
export interface Memos { list: MemoItem[] }

export interface MindMap { id: string; title: string; specId?: string; topic?: number; outline: string; updated: number }
export interface MindMaps { list: MindMap[] }

/** Pro: answers the AI coach has marked. These feed back into what it tests you on next. */
export interface CoachAttempt { id: string; specId?: string; topic?: number; q: string; a: string; score: number; max: number; feedback: string; at: number; ai: boolean }
export interface Coach { attempts: CoachAttempt[] }

export const SUBJECT_COLOURS = ['#3a5bd9', '#d9544d', '#1f9d74', '#c98a12', '#8a4fd1', '#1f8fb0', '#c2477f', '#5f7a1f', '#b0602b', '#4b5563'];
