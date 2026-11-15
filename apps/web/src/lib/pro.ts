import type { PresetId } from './presets';

/**
 * What the free plan includes. Everything the free plan needs to revise properly stays free
 * (timetable, a full revision plan, flashcards, past papers, checklist, mistake log, blurting, teach-back);
 * Pro unlocks the rest. Change the split here, in one place.
 */
export const FREE_LIMITS = { notes: 3, mindmaps: 3, memos: 5, questionsPerTopic: 5 };

/** Plan styles free accounts can use. Free plans only ever schedule free tools. */
export const FREE_PRESETS: PresetId[] = ['balanced', 'mocks'];

/** Whole tools that are Pro only. */
export const PRO_TOOLS = new Set(['/coach', '/tools/mixed', '/tools/target']);

/** Method guides are free; subject and exam technique guides are Pro after the first section. */
export const FREE_GUIDE_KINDS = new Set(['method']);

export const FREE_STARTER_DECKS = new Set(['command-words']);

/** The plan style a free account actually gets if it has a Pro one saved. */
export const effectivePreset = (id: PresetId, pro: boolean): PresetId => (pro || FREE_PRESETS.includes(id) ? id : 'balanced');
