import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { Empty, Seg, colourVar, useToast } from '../../components/ui';
import { useDecks, useMistakes, useProfile } from '../../lib/data';
import { store } from '../../lib/store';
import { checkTyped, shuffle, type Card } from '../../lib/srs';
import { addMistakes, newMistake } from '../../lib/mistakes';
import { emptyDeck, type DeckData, type DeckMeta } from '../../lib/types';
import { subjectName, usePro } from '../hooks';
import { ProGate } from '../../components/pickers';

interface Q { card: Card; deck: DeckMeta; options: string[] }
type Mode = 'type' | 'quiz';

/** Practice only: mixed questions don't change your flashcard schedule. */
function buildQueue(decks: DeckMeta[], n: number): Q[] {
  const pools = decks.map((deck) => {
    const cards = store.get<DeckData>('deck_' + deck.id, emptyDeck()).cards;
    // Cards you've forgotten before come first, then the rest in a random order.
    const hard = shuffle(cards.filter((c) => (c.lapses || 0) > 0)).sort((a, b) => (b.lapses || 0) - (a.lapses || 0));
    const rest = shuffle(cards.filter((c) => !(c.lapses || 0)));
    return { deck, cards, queue: hard.concat(rest) };
  }).filter((p) => p.cards.length);
  const all = pools.flatMap((p) => p.cards.map((c) => c.b));
  const out: Q[] = [];
  // Round robin across decks so topics are interleaved, not blocked.
  for (let round = 0; out.length < n && pools.some((p) => p.queue.length); round++) {
    shuffle(pools).forEach((p) => {
      const card = p.queue.shift();
      if (!card || out.length >= n) return;
      const same = p.cards.filter((c) => c.id !== card.id && c.b !== card.b).map((c) => c.b);
      const wrong = shuffle(same.length >= 3 ? same : same.concat(all.filter((b) => b !== card.b))).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
      out.push({ card, deck: p.deck, options: shuffle(wrong.concat(card.b)) });
    });
  }
  return out;
}

export default function Mixed() {
  const [params] = useSearchParams();
  const [decks] = useDecks();
  const [profile] = useProfile();
  const [, setMistakes] = useMistakes();
  const toast = useToast();
  const withCards = decks.list.filter((d) => store.get<DeckData>('deck_' + d.id, emptyDeck()).cards.length);
  const subjects = Array.from(new Set(withCards.map((d) => d.specId || '')));
  const [chosen, setChosen] = useState<Set<string>>(() => { const only = params.get('spec'); return new Set(only && subjects.includes(only) ? [only] : subjects); });
  const [count, setCount] = useState(20);
  const [mode, setMode] = useState<Mode>('type');
  const [queue, setQueue] = useState<Q[] | null>(null);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<Q[]>([]);
  const [logged, setLogged] = useState(false);
  const q = queue?.[i];
  const pool = useMemo(() => withCards.filter((d) => chosen.has(d.specId || '')), [withCards, chosen]);
  const pro = usePro();

  const next = (right: boolean) => {
    if (!right && q) setWrong((w) => w.concat(q));
    setI(i + 1); setTyped(''); setVerdict(null); setPicked(null);
  };
  const start = () => { setQueue(buildQueue(pool, count)); setI(0); setWrong([]); setLogged(false); };

  if (!pro) return <ProGate title="Mixed quiz" intro="Practise like the real exam" points={['Flashcards from all your decks and subjects, shuffled together so you practise choosing the right answer, not just remembering it.', 'Cards you keep forgetting come up first.', 'Anything you get wrong goes straight into your mistake log.']} />;
  if (!withCards.length) return (<><Topbar title="Mixed quiz" /><div className="content"><div className="panel"><Empty title="Make some flashcards first" action={<Link className="btn btn-primary" to="/flashcards">Open flashcards</Link>}>The mixed quiz pulls cards from all your decks and shuffles the topics together, like a real exam.</Empty></div></div></>);

  return (
    <>
      <Topbar title="Mixed quiz" sub={queue ? (q ? (queue.length - i) + ' left' : 'Done') : 'Cards from different topics and subjects, shuffled together'}>
        <Link className="btn btn-ghost" to="/guides/interleaving">Why mix topics</Link>
        {queue && <button className="btn" onClick={() => setQueue(null)}>End</button>}
      </Topbar>
      <div className="content stack" style={{ maxWidth: 760 }}>
        {!queue && (
          <section className="panel panel-pad">
            <div className="field"><span className="label">Subjects</span>
              <div className="chips">{subjects.map((s) => <button key={s} className="chip" aria-pressed={chosen.has(s)} onClick={() => { const n = new Set(chosen); if (n.has(s)) n.delete(s); else n.add(s); setChosen(n); }}><span className="dot" style={colourVar(profile.subjects.find((x) => x.specId === s)?.colour ?? 9)} />{s ? subjectName(s) : 'Other decks'}</button>)}</div></div>
            <div className="field-row">
              <div className="field"><span className="label">Questions</span><Seg label="Questions" value={String(count)} onChange={(v) => setCount(Number(v))} options={[['10', '10'], ['20', '20'], ['30', '30']]} /></div>
              <div className="field"><span className="label">Answer by</span><Seg label="Answer by" value={mode} onChange={setMode} options={[['type', 'Typing'], ['quiz', 'Multiple choice']]} /></div>
            </div>
            <p className="small muted" style={{ marginBottom: 14 }}>Cards you’ve forgotten before come up first. This is practice, so it won’t change when your cards are next due.</p>
            <button className="btn btn-primary btn-lg" disabled={!pool.length} onClick={start}>Start</button>
          </section>
        )}
        {queue && q && (
          <>
            <div className="meter"><i style={{ width: Math.round((i / queue.length) * 100) + '%' }} /></div>
            <div className="row small muted"><span className="dot" style={colourVar(profile.subjects.find((x) => x.specId === q.deck.specId)?.colour ?? 9)} />{subjectName(q.deck.specId)}, {q.deck.name}</div>
            <div className="panel card-face" style={{ minHeight: 190, cursor: 'default' }}>{q.card.f}</div>
            {mode === 'type' ? (verdict === null ? (
              <form className="row" onSubmit={(e) => { e.preventDefault(); setVerdict(checkTyped(typed, q.card.b) !== 'no'); }}>
                <input className="input" style={{ height: 46 }} autoFocus placeholder="Type the answer" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Your answer" />
                <button className="btn btn-primary btn-lg">Check</button>
                <button type="button" className="btn btn-lg" onClick={() => setVerdict(false)}>Show</button>
              </form>
            ) : (
              <div className="banner" style={{ background: verdict ? 'var(--good-soft)' : 'var(--bad-soft)', alignItems: 'flex-start' }}>
                <p><b>{verdict ? 'Right' : 'Not quite'}</b><br />Answer: {q.card.b}{!verdict && typed && <><br /><span className="muted">You wrote: {typed}</span></>}</p>
                <div className="row">{!verdict && typed && <button className="btn btn-sm" onClick={() => next(true)}>I was right</button>}<button className="btn btn-sm btn-primary" autoFocus onClick={() => next(verdict)}>Next</button></div>
              </div>
            )) : (
              <>
                <div className="stack" style={{ gap: 8 }}>{q.options.map((o, n) => {
                  const right = o === q.card.b;
                  const style = picked == null ? {} : right ? { borderColor: 'var(--good)', background: 'var(--good-soft)' } : n === picked ? { borderColor: 'var(--bad)', background: 'var(--bad-soft)' } : { opacity: 0.6 };
                  return <button key={n} className="btn btn-lg" style={{ justifyContent: 'flex-start', height: 'auto', padding: '12px 16px', whiteSpace: 'normal', textAlign: 'left', ...style }} disabled={picked != null} onClick={() => setPicked(n)}>{o}</button>;
                })}</div>
                {picked != null && <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn btn-primary" autoFocus onClick={() => next(q.options[picked] === q.card.b)}>Next</button></div>}
              </>
            )}
          </>
        )}
        {queue && !q && (
          <section className="panel panel-pad stack" style={{ gap: 12 }}>
            <h2>{queue.length - wrong.length} of {queue.length} right</h2>
            {wrong.length > 0 ? (
              <>
                <p className="muted">These are the ones to work on:</p>
                <ul className="list">{wrong.map((w) => <li key={w.card.id} className="item small"><div className="grow"><div className="title">{w.card.f}</div><div className="muted">{w.card.b}</div></div><span className="faint">{subjectName(w.deck.specId)}</span></li>)}</ul>
                <div className="row wrap">
                  <button className="btn btn-primary" disabled={logged} onClick={() => { setMistakes((l) => addMistakes(l, wrong.map((w) => newMistake({ specId: w.deck.specId, topic: w.deck.topic, source: 'quiz', kind: 'recall', what: w.card.f, fix: w.card.b })))); setLogged(true); toast('Added ' + wrong.length + ' to your mistake log'); }}>{logged ? 'Added to your mistake log' : 'Add them to your mistake log'}</button>
                  <button className="btn" onClick={start}>Go again</button>
                </div>
              </>
            ) : <><p className="muted">Every one right. Try a bigger set or add more subjects.</p><div><button className="btn" onClick={start}>Go again</button></div></>}
          </section>
        )}
      </div>
    </>
  );
}
