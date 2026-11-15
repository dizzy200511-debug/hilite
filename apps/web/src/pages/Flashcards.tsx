import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Bars, Empty, Modal, colourVar, useToast } from '../components/ui';
import { IconArrowLeft, IconEdit, IconPlus } from '../components/icons';
import { useDeck, useDecks, useProfile } from '../lib/data';
import { checkTyped, intervalLabel, isDue, isNew, parseCardLines, schedule, shuffle, type Card, type Grade } from '../lib/srs';
import { addDays, DAY_NAMES, relDay, today } from '../lib/dates';
import { cleanText, uid } from '../lib/sanitize';
import { store } from '../lib/store';
import { specById } from '../catalog/catalog';
import { deckCounts, subjectName, useColourOf } from './hooks';
import { emptyDeck, type DeckData, type DeckMeta } from '../lib/types';
import { STARTER_DECKS } from '../content/starterDecks';
import { FREE_STARTER_DECKS } from '../lib/pro';
import { addToTopicDeck } from '../lib/decks';
import { ProLock } from '../components/pickers';
import { AiCardsModal } from './tools/Notes';
import { usePro } from './hooks';

export function DeckList() {
  const [decks] = useDecks();
  const [profile] = useProfile();
  const colourOf = useColourOf();
  const [creating, setCreating] = useState(false);
  const [starters, setStarters] = useState(false);
  const nav = useNavigate();
  const counts = decks.list.map((d) => ({ d, c: deckCounts(store.get<DeckData>('deck_' + d.id, emptyDeck()), profile.newCardsPerDay) }));
  const ready = counts.reduce((a, x) => a + x.c.due + x.c.newToday, 0);
  const bySubject = new Map<string, typeof counts>();
  counts.forEach((x) => { const k = x.d.specId || ''; bySubject.set(k, (bySubject.get(k) || []).concat(x)); });
  return (
    <>
      <Topbar title="Flashcards" sub={decks.list.length ? ready + ' cards ready to review' : 'Spaced repetition, so cards come back right before you’d forget'}>
        <button className="btn" onClick={() => setStarters(true)}>Ready-made decks</button>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><IconPlus />New deck</button>
      </Topbar>
      <div className="content stack">
        {!decks.list.length && <div className="panel"><Empty title="Make your first deck" action={<button className="btn btn-primary" onClick={() => setCreating(true)}>New deck</button>}>One deck per topic works best, like “Cell biology” or “Macbeth quotes”. You can paste in a whole list of terms at once.</Empty></div>}
        {Array.from(bySubject.entries()).map(([specId, list]) => (
          <section key={specId} className="panel">
            <div className="panel-head"><div className="row"><span className="sub-tab" style={{ ...colourVar(colourOf(specId)), height: 20 }} /><h2>{specId ? subjectName(specId) : 'Other decks'}</h2></div></div>
            <div className="panel-body"><ul className="list">{list.map(({ d, c }) => (
              <li key={d.id} className="item" style={{ cursor: 'pointer' }} onClick={() => nav('/flashcards/' + d.id)}>
                <div className="grow"><div className="title">{d.name}</div><div className="meta"><span className="num">{c.total} cards</span><span className="num">{c.mastered} mastered</span>{d.specId && d.topic != null && <span>{specById(d.specId)?.topics[d.topic]}</span>}</div></div>
                {c.due + c.newToday > 0 ? <span className="tag hl num">{c.due + c.newToday} to review</span> : c.total ? <span className="tag good">Caught up</span> : <span className="tag">Empty</span>}
              </li>
            ))}</ul></div>
          </section>
        ))}
      </div>
      {creating && <DeckModal onClose={() => setCreating(false)} onSaved={(id) => { setCreating(false); nav('/flashcards/' + id + '?add=1'); }} />}
      {starters && <StarterModal onClose={() => setStarters(false)} onAdded={(id) => { setStarters(false); nav('/flashcards/' + id); }} />}
    </>
  );
}

function DeckModal({ deck, onClose, onSaved, onDelete }: { deck?: DeckMeta; onClose: () => void; onSaved: (id: string) => void; onDelete?: () => void }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [profile] = useProfile();
  const [, setDecks] = useDecks();
  const [name, setName] = useState(deck?.name || '');
  const [specId, setSpecId] = useState(deck?.specId || profile.subjects[0]?.specId || '');
  const [topic, setTopic] = useState<string>(deck?.topic != null ? String(deck.topic) : '');
  const spec = specById(specId);
  const save = () => {
    const id = deck?.id || uid();
    const meta: DeckMeta = { id, name: cleanText(name, 80), specId: specId || undefined, topic: topic === '' ? undefined : Number(topic), created: deck?.created || Date.now() };
    setDecks((d) => ({ list: deck ? d.list.map((x) => (x.id === id ? meta : x)) : d.list.concat(meta) }));
    if (!deck) store.set('deck_' + id, emptyDeck());
    onSaved(id);
  };
  return (
    <Modal title={deck ? 'Deck settings' : 'New deck'} onClose={onClose} footer={<>{onDelete && <button className="btn btn-ghost btn-danger" style={{ marginRight: 'auto' }} onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}>{confirmDel ? 'Click again to delete' : 'Delete deck'}</button>}<button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!cleanText(name)} onClick={save}>{deck ? 'Save' : 'Create deck'}</button></>}>
      <div className="field"><label htmlFor="dn">Name</label><input id="dn" className="input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cell biology" autoFocus /></div>
      <div className="field-row">
        <div className="field"><label htmlFor="ds">Subject</label><select id="ds" className="select" value={specId} onChange={(e) => { setSpecId(e.target.value); setTopic(''); }}><option value="">None</option>{profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}</select></div>
        <div className="field"><label htmlFor="dt">Topic</label><select id="dt" className="select" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={!spec}><option value="">Any</option>{spec?.topics.map((t, i) => <option key={i} value={i}>{t}</option>)}</select></div>
      </div>
    </Modal>
  );
}

export function DeckPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const [decks, setDecks] = useDecks();
  const [deck, setDeck] = useDeck(id);
  const [profile] = useProfile();
  const nav = useNavigate();
  const toast = useToast();
  const [adding, setAdding] = useState(params.get('add') === '1');
  const [editing, setEditing] = useState<Card | null>(null);
  const [settings, setSettings] = useState(false);
  const [q, setQ] = useState('');
  const meta = decks.list.find((d) => d.id === id);
  if (!meta) return (<><Topbar title="Deck not found" /><div className="content"><Link to="/flashcards">Back to flashcards</Link></div></>);
  const c = deckCounts(deck, profile.newCardsPerDay);
  const ready = c.due + c.newToday;
  let rev = 0, ok = 0;
  const vals: number[] = [], labels: string[] = [];
  for (let i = 13; i >= 0; i--) { const k = addDays(today(), -i); const r = deck.stats.rev[k] || 0; rev += r; ok += deck.stats.ok[k] || 0; vals.push(r); labels.push(i === 0 ? 'Today' : DAY_NAMES[new Date(k + 'T12:00').getDay()].charAt(0)); }
  const cards = deck.cards.filter((x) => !q || (x.f + ' ' + x.b).toLowerCase().includes(q.toLowerCase())).slice().reverse();
  return (
    <>
      <Topbar title={<><Link to="/flashcards" className="icon-btn" aria-label="All decks" style={{ verticalAlign: 'middle', marginRight: 4 }}><IconArrowLeft /></Link>{meta.name}</>} sub={(meta.specId ? subjectName(meta.specId) + ', ' : '') + c.total + ' cards'}>
        <button className="btn" onClick={() => setSettings(true)}>Deck settings</button>
        <button className="btn" onClick={() => setAdding(true)}><IconPlus />Add cards</button>
      </Topbar>
      <div className="content stack">
        <div className="grid">
          <section className="panel panel-pad c8">
            <div className="row wrap" style={{ gap: 28, marginBottom: 18 }}>
              <div className="stat"><div className="v">{c.due}</div><div className="k">due</div></div>
              <div className="stat"><div className="v">{c.newToday}</div><div className="k">new today</div></div>
              <div className="stat"><div className="v">{c.mastered}</div><div className="k">mastered</div></div>
              <div className="stat"><div className="v">{rev ? Math.round((ok / rev) * 100) + '%' : '–'}</div><div className="k">right, last 2 weeks</div></div>
            </div>
            <div className="row wrap">
              <button className="btn btn-primary btn-lg" disabled={!ready} onClick={() => nav('/flashcards/' + id + '/study?mode=flip')}>{ready ? 'Review ' + ready + ' cards' : 'All caught up'}</button>
              <button className="btn btn-lg" disabled={!c.total} onClick={() => nav('/flashcards/' + id + '/study?mode=type')}>Type the answers</button>
              <button className="btn btn-lg" disabled={c.total < 4} title={c.total < 4 ? 'Needs at least 4 cards' : ''} onClick={() => nav('/flashcards/' + id + '/study?mode=quiz')}>Quiz</button>
            </div>
          </section>
          <section className="panel panel-pad c4"><h3 style={{ marginBottom: 12 }}>Reviews, 2 weeks</h3><Bars values={vals} labels={labels} unit="reviews" /></section>
        </div>
        <section className="panel">
          <div className="panel-head"><h2>Cards</h2><input className="input" style={{ width: 220, height: 34 }} placeholder="Search cards" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search cards" /></div>
          <div className="panel-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
            {!deck.cards.length ? <Empty title="No cards yet" action={<button className="btn btn-primary" onClick={() => setAdding(true)}>Add cards</button>}>Add one at a time, or paste a list with a dash or colon between each term and its meaning.</Empty> : (
              <table className="table"><thead><tr><th>Question</th><th>Answer</th><th>Next review</th><th /></tr></thead>
                <tbody>{cards.map((x) => (
                  <tr key={x.id}><td style={{ whiteSpace: 'pre-wrap' }}>{x.f}</td><td className="muted" style={{ whiteSpace: 'pre-wrap' }}>{x.b}</td>
                    <td>{isNew(x) ? <span className="tag accent">New</span> : isDue(x) ? <span className="tag hl">Due</span> : <span className="small muted">{relDay(x.due!)}</span>}</td>
                    <td><button className="icon-btn" aria-label="Edit card" onClick={() => setEditing(x)}><IconEdit /></button></td></tr>
                ))}</tbody></table>
            )}
          </div>
        </section>
      </div>
      {adding && <AddCards meta={meta} onClose={() => { setAdding(false); if (params.get('add')) setParams({}); }} onAdd={(list) => { setDeck((d) => ({ ...d, cards: d.cards.concat(list.map((x) => ({ id: uid(), f: cleanText(x.f, 1000), b: cleanText(x.b, 2000) }))) })); toast('Added ' + list.length + (list.length === 1 ? ' card' : ' cards')); }} />}
      {editing && <Modal title="Edit card" onClose={() => setEditing(null)} footer={<>
        <button className="btn btn-ghost btn-danger" onClick={() => { setDeck((d) => ({ ...d, cards: d.cards.filter((x) => x.id !== editing.id) })); setEditing(null); }}>Delete</button>
        <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { setDeck((d) => ({ ...d, cards: d.cards.map((x) => (x.id === editing.id ? editing : x)) })); setEditing(null); }}>Save</button></>}>
        <div className="field"><label htmlFor="ef">Question</label><textarea id="ef" className="textarea" style={{ minHeight: 80 }} value={editing.f} onChange={(e) => setEditing({ ...editing, f: cleanText(e.target.value, 1000) })} /></div>
        <div className="field"><label htmlFor="eb">Answer</label><textarea id="eb" className="textarea" style={{ minHeight: 80 }} value={editing.b} onChange={(e) => setEditing({ ...editing, b: cleanText(e.target.value, 2000) })} /></div>
      </Modal>}
      {settings && <DeckModal deck={meta} onClose={() => setSettings(false)} onSaved={() => setSettings(false)}
        onDelete={() => { setDecks((d) => ({ list: d.list.filter((x) => x.id !== id) })); store.remove('deck_' + id); nav('/flashcards'); toast('Deck deleted'); }} />}
    </>
  );
}

function AddCards({ onClose, onAdd, meta }: { onClose: () => void; onAdd: (list: { f: string; b: string }[]) => void; meta: DeckMeta }) {
  const pro = usePro();
  const [notes, setNotes] = useState('');
  const [ai, setAi] = useState(false);
  const [bulk, setBulk] = useState('');
  const [f, setF] = useState('');
  const [b, setB] = useState('');
  const parsed = useMemo(() => parseCardLines(bulk), [bulk]);
  const add = () => {
    const list = parsed.slice();
    if (f.trim() && b.trim()) list.push({ f: f.trim(), b: b.trim() });
    if (!list.length) return;
    onAdd(list); setBulk(''); setF(''); setB('');
  };
  return (
    <Modal title="Add cards" onClose={onClose} wide footer={<><button className="btn" onClick={onClose}>Done</button><button className="btn btn-primary" disabled={!parsed.length && !(f.trim() && b.trim())} onClick={add}>Add {parsed.length + (f.trim() && b.trim() ? 1 : 0) || ''} cards</button></>}>
      <div className="field"><label htmlFor="bk">Paste a list</label>
        <textarea id="bk" className="textarea" value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'One card per line, question then answer:\nMitochondria - Where aerobic respiration happens\nOsmosis: Movement of water across a partially permeable membrane'} />
        <span className="hint">{parsed.length ? parsed.length + ' cards found.' : 'Separate each question and answer with a dash, a colon, an equals sign or a tab. Copying from Quizlet works too.'}</span></div>
      <div className="divider" />
      <div className="field-row">
        <div className="field"><label htmlFor="sf">Question</label><textarea id="sf" className="textarea" style={{ minHeight: 80 }} value={f} onChange={(e) => setF(e.target.value)} /></div>
        <div className="field"><label htmlFor="sb">Answer</label><textarea id="sb" className="textarea" style={{ minHeight: 80 }} value={b} onChange={(e) => setB(e.target.value)} /></div>
      </div>
      <div className="divider" />
      <div className="field"><label htmlFor="an">Make cards from your notes</label>
        {pro ? <>
          <textarea id="an" className="textarea" value={notes} maxLength={12000} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your class notes or a section of your revision guide." />
          <div className="row" style={{ marginTop: 8 }}><button className="btn btn-sm" disabled={notes.trim().length < 80} onClick={() => setAi(true)}>Suggest cards from these notes</button><span className="hint">The AI coach suggests cards; you choose which to keep.</span></div>
        </> : <ProLock>With Pro, paste your notes and the AI coach suggests flashcards from them.</ProLock>}
      </div>
      {ai && <AiCardsModal subject={subjectName(meta.specId)} topic={meta.specId && meta.topic != null ? specById(meta.specId)?.topics[meta.topic] : undefined} notes={notes} deckName={meta.name} onClose={() => setAi(false)} onAdd={(cards) => { onAdd(cards); setNotes(''); }} />}
    </Modal>
  );
}

export function Study() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const mode = (params.get('mode') || 'flip') as 'flip' | 'type' | 'quiz';
  const [deck, setDeck] = useDeck(id);
  const [decks] = useDecks();
  const [profile] = useProfile();
  const nav = useNavigate();
  const meta = decks.list.find((d) => d.id === id);
  const [queue] = useState<string[]>(() => {
    const d = store.get<DeckData>('deck_' + id, emptyDeck());
    const due = d.cards.filter(isDue).sort((a, b) => (a.due! < b.due! ? -1 : 1));
    const used = d.stats.newDay[today()] || 0;
    const fresh = d.cards.filter(isNew).slice(0, Math.max(0, profile.newCardsPerDay - used));
    let q = due.concat(fresh).map((c) => c.id);
    if (mode !== 'flip' && !q.length) q = shuffle(d.cards).slice(0, 15).map((c) => c.id);
    if (mode === 'quiz') q = shuffle(d.cards).slice(0, Math.min(10, d.cards.length)).map((c) => c.id);
    return q;
  });
  const [order, setOrder] = useState(queue);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<null | 'ok' | 'close' | 'no'>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [res, setRes] = useState({ n: 0, ok: 0 });
  const card = deck.cards.find((c) => c.id === order[i]);
  const options = useMemo(() => {
    if (mode !== 'quiz' || !card) return [];
    const wrong = shuffle(deck.cards.filter((c) => c.id !== card.id && c.b !== card.b).map((c) => c.b)).slice(0, 3);
    return shuffle(wrong.concat(card.b));
  }, [mode, card?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const grade = (q: Grade) => {
    if (!card) return;
    const t = today();
    setDeck((d) => {
      const stats = { ...d.stats, rev: { ...d.stats.rev, [t]: (d.stats.rev[t] || 0) + 1 }, ok: { ...d.stats.ok, [t]: (d.stats.ok[t] || 0) + (q >= 3 ? 1 : 0) }, newDay: { ...d.stats.newDay } };
      if (isNew(card) && mode !== 'quiz') stats.newDay[t] = (stats.newDay[t] || 0) + 1;
      return { cards: mode === 'quiz' ? d.cards : d.cards.map((c) => (c.id === card.id ? schedule(c, q) : c)), stats };
    });
    setRes((r) => ({ n: r.n + 1, ok: r.ok + (q >= 3 ? 1 : 0) }));
    if (q < 3 && mode !== 'quiz') setOrder((o) => { const n = o.slice(); n.splice(Math.min(n.length, i + 4), 0, card.id); return n; });
    setI(i + 1); setFlipped(false); setTyped(''); setVerdict(null); setPicked(null);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (mode === 'flip') {
        if (e.code === 'Space') { e.preventDefault(); setFlipped(true); }
        const map: Record<string, Grade> = { '1': 1, '2': 3, '3': 4, '4': 5 };
        if (flipped && map[e.key]) grade(map[e.key]);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });

  if (!meta) return null;
  const left = order.length - i;
  return (
    <>
      <Topbar title={meta.name} sub={mode === 'flip' ? 'Review' : mode === 'type' ? 'Type the answers' : 'Quiz'}>
        <button className="btn" onClick={() => nav('/flashcards/' + id)}>End session</button>
      </Topbar>
      <div className="content" style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
        <div className="row between small muted" style={{ marginBottom: 8 }}><span>{card ? left + ' left' : 'Done'}</span><span className="num">{res.n ? Math.round((res.ok / res.n) * 100) + '% right' : ''}</span></div>
        <div className="meter" style={{ marginBottom: 18 }}><i style={{ width: Math.round((i / Math.max(1, order.length)) * 100) + '%' }} /></div>
        {!card ? (
          <div className="panel"><Empty title="Session done" action={<button className="btn btn-primary" onClick={() => nav('/flashcards/' + id)}>Back to deck</button>}>
            {res.n} {mode === 'quiz' ? 'questions' : 'reviews'}, {res.n ? Math.round((res.ok / res.n) * 100) : 0}% right. {mode === 'quiz' ? '' : 'Cards you found hard come back sooner.'}
          </Empty></div>
        ) : mode === 'flip' ? (
          <>
            <div className="panel card-face" onClick={() => setFlipped(true)} role="button" tabIndex={0} aria-label={flipped ? 'Answer' : 'Question, press to show answer'}>{flipped ? <div><div className="small muted" style={{ marginBottom: 10 }}>{card.f}</div><div>{card.b}</div></div> : card.f}</div>
            {!flipped ? <p className="small muted" style={{ textAlign: 'center', marginTop: 12 }}>Say your answer, then press <span className="kbd">Space</span> or tap the card.</p> : (
              <div className="grades" style={{ marginTop: 14 }}>
                {([[1, 'Again'], [3, 'Hard'], [4, 'Good'], [5, 'Easy']] as [Grade, string][]).map(([g, l], n) => <button key={g} onClick={() => grade(g)}>{l}<small>{intervalLabel(card, g)}</small><small className="faint">key {n + 1}</small></button>)}
              </div>
            )}
          </>
        ) : mode === 'type' ? (
          <>
            <div className="panel card-face" style={{ minHeight: 200, cursor: 'default' }}>{card.f}</div>
            {!verdict ? (
              <form className="row" style={{ marginTop: 14 }} onSubmit={(e) => { e.preventDefault(); setVerdict(checkTyped(typed, card.b)); }}>
                <input className="input" style={{ height: 46 }} autoFocus placeholder="Type the answer" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Your answer" />
                <button className="btn btn-primary btn-lg">Check</button>
                <button type="button" className="btn btn-lg" onClick={() => setVerdict('no')}>Show</button>
              </form>
            ) : (
              <div className={'banner ' + (verdict === 'no' ? '' : 'info')} style={{ marginTop: 14, background: verdict === 'no' ? 'var(--bad-soft)' : 'var(--good-soft)', alignItems: 'flex-start' }}>
                <p><b>{verdict === 'ok' ? 'Correct' : verdict === 'close' ? 'Almost, counted as right' : 'Not quite'}</b><br />Answer: {card.b}{verdict !== 'ok' && typed && <><br /><span className="muted">You wrote: {typed}</span></>}</p>
                <div className="row">{verdict === 'no' && typed && <button className="btn btn-sm" onClick={() => grade(4)}>I was right</button>}<button className="btn btn-sm btn-primary" autoFocus onClick={() => grade(verdict === 'ok' ? 4 : verdict === 'close' ? 3 : 1)}>Next</button></div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="panel card-face" style={{ minHeight: 170, cursor: 'default' }}>{card.f}</div>
            <div className="stack" style={{ gap: 8, marginTop: 14 }}>
              {options.map((o, n) => {
                const right = o === card.b;
                const style = picked == null ? {} : right ? { borderColor: 'var(--good)', background: 'var(--good-soft)' } : n === picked ? { borderColor: 'var(--bad)', background: 'var(--bad-soft)' } : { opacity: 0.6 };
                return <button key={n} className="btn btn-lg" style={{ justifyContent: 'flex-start', height: 'auto', padding: '12px 16px', whiteSpace: 'normal', textAlign: 'left', ...style }} disabled={picked != null} onClick={() => setPicked(n)}>{o}</button>;
              })}
            </div>
            {picked != null && <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn btn-primary" autoFocus onClick={() => grade(options[picked] === card.b ? 4 : 1)}>Next</button></div>}
          </>
        )}
      </div>
    </>
  );
}

function StarterModal({ onClose, onAdded }: { onClose: () => void; onAdded: (id: string) => void }) {
  const [profile] = useProfile();
  const pro = usePro();
  const toast = useToast();
  const mine = profile.subjects.map((sub) => specById(sub.specId)).filter(Boolean);
  // The subject decks are written for GCSE, so they only attach to GCSE subjects.
  const list = STARTER_DECKS.map((d) => ({ d, spec: d.subject ? mine.find((sp) => sp!.qual === 'GCSE' && d.subject!.test(sp!.subject)) : undefined }))
    .sort((a, b) => Number(!!b.spec) - Number(!!a.spec));
  return (
    <Modal title="Ready-made decks" onClose={onClose}>
      <p className="small muted" style={{ marginBottom: 10 }}>These become normal decks you can edit. Check them against your own specification.</p>
      <ul className="list">{list.map(({ d, spec }) => (
        <li key={d.id} className="item">
          <div className="grow"><div className="title">{d.name}</div><div className="meta"><span>{d.summary}</span><span className="num">{d.cards.length} cards</span></div></div>
          {!pro && !FREE_STARTER_DECKS.has(d.id) ? <Link className="tag accent" to="/upgrade" onClick={onClose}>Pro</Link> : <button className="btn btn-sm" onClick={() => { const id = addToTopicDeck(d.name, d.cards.map(([f, b]) => ({ f, b })), spec?.id); toast('Deck added'); onAdded(id); }}>Add</button>}
        </li>
      ))}</ul>
    </Modal>
  );
}
