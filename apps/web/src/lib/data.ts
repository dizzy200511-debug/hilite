import { useDoc } from './store';
import { DEFAULT_FOCUS, DEFAULT_PLANNER, DEFAULT_PROFILE, emptyDeck, type Blurts, type Checklist, type Coach, type DeckData, type Decks, type ExamDates, type Focus, type Memos, type MindMaps, type Mistakes, type NoteData, type Notes, type OwnTests, type Papers, type Planner, type Profile } from './types';

export const useProfile = () => {
  const [p, set] = useDoc<Profile>('profile', DEFAULT_PROFILE);
  return [{ ...DEFAULT_PROFILE, ...p }, set] as const;
};
export const useExamDates = () => useDoc<ExamDates>('examDates', {});
export const useTests = () => useDoc<OwnTests>('tests', { list: [] });
export const useChecklist = () => useDoc<Checklist>('checklist', {});
export const usePlanner = () => useDoc<Planner>('planner', DEFAULT_PLANNER);
export const usePapers = () => useDoc<Papers>('papers', { logs: [] });
export const useFocus = () => {
  const [f, set] = useDoc<Focus>('focus', DEFAULT_FOCUS);
  return [{ ...DEFAULT_FOCUS, ...f }, set] as const;
};
export const useDecks = () => useDoc<Decks>('decks', { list: [] });
export const useDeck = (id: string) => useDoc<DeckData>('deck_' + id, emptyDeck());
export const useMistakes = () => useDoc<Mistakes>('mistakes', { list: [] });
export const useNotes = () => useDoc<Notes>('notes', { list: [] });
export const useNote = (id: string) => useDoc<NoteData>('note_' + id, { cues: '', body: '', summary: '' });
export const useBlurts = () => useDoc<Blurts>('blurts', { list: [] });
export const useMemos = () => useDoc<Memos>('memos', { list: [] });
export const useMindMaps = () => useDoc<MindMaps>('mindmaps', { list: [] });
export const useCoach = () => useDoc<Coach>('coach', { attempts: [] });
/** Sub-topics ticked as known. Key: specId, then topic.section.point. */
export const useSpecTicks = () => useDoc<Record<string, Record<string, 1>>>('specTicks', {});
