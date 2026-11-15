import { supabase } from './supabase';
import type { MistakeKind } from './types';

/**
 * Pro AI features. Every call goes through the `ai` edge function, which checks the plan,
 * the device and a daily limit, and holds the API key. Nothing here talks to an AI provider directly.
 */
export interface AiQuestion { topic: number; question: string; marks: number; markPoints: string[]; modelAnswer: string; targets: string }
export interface AiMark { score: number; feedback: string; missed: string[]; modelAnswer: string; mistakeKind: MistakeKind | 'none'; mistakeSummary: string }
export interface AiCard { f: string; b: string }

export interface QuestionsRequest {
  subject: string; board: string; code: string; tier?: 'F' | 'H';
  /** points: the topic's sub-topics from the spec, so questions stay on the specification. */
  topics: { name: string; reasons: string[]; points?: string[] }[];
  mistakes: { topic: number; kind: MistakeKind; what: string; fix: string }[];
  recent: { question: string; feedback: string }[];
  count: number;
}
export interface MarkRequest { subject: string; board: string; question: string; marks: number; markPoints?: string[]; markScheme?: string; answer: string }
export interface CardsRequest { subject: string; topic?: string; notes: string }

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function call<T>(action: string, body: object): Promise<Result<T>> {
  if (!supabase) return { ok: false, error: 'AI needs an account. Local mode is for testing.' };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { ok: false, error: 'You’re offline. AI needs an internet connection.' };
  const { data, error } = await supabase.functions.invoke('ai', { body: { action, ...body } });
  if (error) {
    let msg = '';
    try { msg = (await (error as { context?: Response }).context?.json())?.error ?? ''; } catch { /* not JSON */ }
    return { ok: false, error: msg || 'The AI coach couldn’t answer just now. Try again in a minute.' };
  }
  return { ok: true, data: data as T };
}

export const aiQuestions = (r: QuestionsRequest) => call<{ questions: AiQuestion[] }>('questions', r);
export const aiMark = (r: MarkRequest) => call<AiMark>('mark', r);
export const aiCards = (r: CardsRequest) => call<{ cards: AiCard[] }>('cards', r);
