import type { Question } from './types';

type Extra = Partial<Pick<Question, 'diagram' | 'higher' | 'separate'>>;

/** Multiple choice, 1 mark. `why` explains the right answer. */
export const mcq = (id: string, level: Question['level'], q: string, options: string[], answer: number, why?: string, extra: Extra = {}): Question =>
  ({ id, kind: 'mcq', marks: 1, level, q, options, answer, scheme: [why ? options[answer] + '. ' + why : options[answer]], ...extra });

/** Working and an answer. */
export const calc = (id: string, marks: number, level: Question['level'], q: string, scheme: string[], model?: string, extra: Extra = {}): Question =>
  ({ id, kind: 'calc', marks, level, q, scheme, model, ...extra });

/** A few words or a sentence or two. */
export const short = (id: string, marks: number, level: Question['level'], q: string, scheme: string[], extra: Extra = {}): Question =>
  ({ id, kind: 'short', marks, level, q, scheme, ...extra });

/** Extended writing: the scheme lists what a top answer includes. */
export const long = (id: string, marks: number, level: Question['level'], q: string, scheme: string[], model?: string, extra: Extra = {}): Question =>
  ({ id, kind: 'long', marks, level, q, scheme, model, ...extra });
