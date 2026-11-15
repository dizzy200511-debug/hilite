import type { Method } from '../lib/types';

/** Every revision tool, for the Tools page. Which ones are Pro is set in lib/pro.ts. */
export interface ToolInfo { to: string; name: string; summary: string; guide: string; methods: Method[] }

export const TOOLS: ToolInfo[] = [
  { to: '/coach', name: 'AI coach', summary: 'Learns from your mistakes and weak topics, writes questions aimed at them and marks your answers.', guide: 'mistake-log', methods: ['coach'] },
  { to: '/tools/mistakes', name: 'Mistake log', summary: 'Every mark you lose, why you lost it, and retests until you get it right three times.', guide: 'mistake-log', methods: ['mistakes'] },
  { to: '/tools/blurt', name: 'Blurting', summary: 'Write everything you know against the clock, then check it and note the gaps.', guide: 'blurting', methods: ['learn', 'blurt'] },
  { to: '/tools/teach', name: 'Teach-back', summary: 'Explain a topic simply, step by step. Where you get stuck is what to revise.', guide: 'feynman', methods: ['teach'] },
  { to: '/tools/notes', name: 'Cornell notes', summary: 'Condensed notes with cue questions and a summary, plus a mode that tests you on them.', guide: 'cornell', methods: ['notes'] },
  { to: '/tools/mindmap', name: 'Mind maps', summary: 'Type an outline and see it as a map. Hide the details and rebuild them from memory.', guide: 'mind-maps', methods: ['mindmap'] },
  { to: '/tools/memorise', name: 'Memoriser', summary: 'Learn quotes, definitions and equations word for word by hiding more each round.', guide: 'memorising', methods: ['memorise'] },
  { to: '/tools/mixed', name: 'Mixed quiz', summary: 'Flashcards from several decks and subjects in a random order, to practise like the exam.', guide: 'interleaving', methods: ['mixed'] },
  { to: '/tools/command-words', name: 'Command words', summary: 'What “explain”, “evaluate” and the rest actually ask for, with a quick quiz.', guide: 'command-words', methods: [] },
  { to: '/tools/timing', name: 'Exam timing', summary: 'Minutes per mark and clock checkpoints for any of your papers.', guide: 'timing', methods: ['timed'] },
  { to: '/tools/target', name: 'Grade target', summary: 'How many marks you need on your remaining papers to reach a grade boundary.', guide: 'past-papers', methods: [] },
  { to: '/flashcards', name: 'Flashcards', summary: 'Spaced repetition decks, including ready-made decks for equations and formulae.', guide: 'flashcards', methods: ['cards', 'review'] },
  { to: '/practice', name: 'Practice questions', summary: 'Exam-style questions for every topic, some with diagrams, and a mark scheme for each. Pro adds AI marking.', guide: 'past-papers', methods: ['pastq'] },
  { to: '/papers', name: 'Past papers', summary: 'Official papers for your specs, mock mode, and your marks over time.', guide: 'past-papers', methods: ['timed'] },
  { to: '/focus', name: 'Focus timer', summary: 'Pomodoro sessions that log your study time by subject.', guide: 'focus', methods: [] },
];
