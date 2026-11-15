import { store } from './store';
import { cleanText, uid } from './sanitize';
import { emptyDeck, type DeckData, type DeckMeta, type Decks } from './types';

/** Adds cards to the deck for a topic, making the deck if there isn't one. Returns the deck id. */
export function addToTopicDeck(name: string, cards: { f: string; b: string }[], specId?: string, topic?: number): string {
  const decks = store.get<Decks>('decks', { list: [] });
  let meta = specId && topic != null ? decks.list.find((d) => d.specId === specId && d.topic === topic) : undefined;
  if (!meta) {
    meta = { id: uid(), name: cleanText(name, 80) || 'New deck', specId: specId || undefined, topic, created: Date.now() } as DeckMeta;
    store.set('decks', { list: decks.list.concat(meta) });
  }
  const data = store.get<DeckData>('deck_' + meta.id, emptyDeck());
  store.set('deck_' + meta.id, { ...data, cards: data.cards.concat(cards.map((c) => ({ id: uid(), f: cleanText(c.f, 1000), b: cleanText(c.b, 2000) }))) });
  return meta.id;
}
