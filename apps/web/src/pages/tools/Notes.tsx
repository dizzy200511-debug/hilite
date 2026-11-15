import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { Empty, Modal, colourVar, useToast } from '../../components/ui';
import { IconArrowLeft, IconPlus } from '../../components/icons';
import { ProLock, SubjectTopicSelect, topicName, useToolTarget } from '../../components/pickers';
import { specById } from '../../catalog/catalog';
import { useNote, useNotes } from '../../lib/data';
import { store } from '../../lib/store';
import { aiCards, type AiCard } from '../../lib/ai';
import { addToTopicDeck } from '../../lib/decks';
import { relDay, studyDayOf } from '../../lib/dates';
import { cleanText, uid } from '../../lib/sanitize';
import { subjectName, useColourOf, usePro } from '../hooks';
import { FREE_LIMITS } from '../../lib/pro';

export function NotesList() {
  const [notes, setNotes] = useNotes();
  const target = useToolTarget();
  const colourOf = useColourOf();
  const nav = useNavigate();
  const pro = usePro();
  const full = !pro && notes.list.length >= FREE_LIMITS.notes;
  const create = () => {
    if (full) return;
    const id = uid();
    const title = topicName(target.specId, target.topic) || 'New notes';
    setNotes((n) => ({ list: n.list.concat({ id, title, specId: target.specId || undefined, topic: target.topic, updated: Date.now() }) }));
    nav('/tools/notes/' + id);
  };
  // Opened from a planned session: go straight to that topic's notes if they exist.
  const existing = target.topic != null ? notes.list.find((n) => n.specId === target.specId && n.topic === target.topic) : undefined;
  const sorted = notes.list.slice().sort((a, b) => b.updated - a.updated);
  return (
    <>
      <Topbar title="Cornell notes" sub="Condensed notes with cue questions, built for testing yourself">
        <Link className="btn btn-ghost" to="/guides/cornell">How to make them</Link>
        <button className="btn btn-primary" disabled={full} onClick={create}><IconPlus />{target.topic != null && !existing ? 'Notes for ' + topicName(target.specId, target.topic) : 'New notes'}</button>
      </Topbar>
      <div className="content stack">
        {full && <div className="banner info"><p>You’ve used your {FREE_LIMITS.notes} free notes. Pro gives you unlimited notes, and the AI can turn them into flashcards.</p><Link className="btn btn-sm" to="/upgrade">See Pro</Link></div>}
        {existing && <div className="banner info"><p>You already have notes for <b>{existing.title}</b>.</p><Link className="btn btn-sm" to={'/tools/notes/' + existing.id}>Open them</Link></div>}
        <section className="panel">
          <div className="panel-body">
            {!sorted.length ? <Empty title="No notes yet" action={<button className="btn btn-primary" onClick={create}>Make your first notes</button>}>One page per topic: notes in the middle, cue questions down the side, a short summary at the bottom.</Empty> : (
              <ul className="list">{sorted.map((n) => (
                <li key={n.id} className="item" style={{ cursor: 'pointer' }} onClick={() => nav('/tools/notes/' + n.id)}>
                  <span className="sub-tab" style={colourVar(colourOf(n.specId))} />
                  <div className="grow"><div className="title">{n.title}</div><div className="meta"><span>{subjectName(n.specId)}</span><span>Edited {relDay(studyDayOf(n.updated)).toLowerCase()}</span></div></div>
                  <button className="btn btn-sm btn-ghost btn-danger" onClick={(e) => { e.stopPropagation(); setNotes((x) => ({ list: x.list.filter((y) => y.id !== n.id) })); store.remove('note_' + n.id); }}>Delete</button>
                </li>
              ))}</ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export function NoteEditor() {
  const { id = '' } = useParams();
  const [notes, setNotes] = useNotes();
  const [note, setNote] = useNote(id);
  const [testing, setTesting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const pro = usePro();
  const meta = notes.list.find((n) => n.id === id);
  if (!meta) return (<><Topbar title="Notes not found" /><div className="content"><Link to="/tools/notes">All notes</Link></div></>);
  const touch = (patch: Partial<typeof meta>) => setNotes((n) => ({ list: n.list.map((x) => (x.id === id ? { ...x, ...patch, updated: Date.now() } : x)) }));
  const edit = (k: 'cues' | 'body' | 'summary', v: string, max: number) => setNote((d) => ({ ...d, [k]: v.slice(0, max) }));
  const cues = note.cues.split('\n').map((c) => c.trim()).filter(Boolean);
  const q = new URLSearchParams({ ...(meta.specId ? { spec: meta.specId } : {}), ...(meta.topic != null ? { topic: String(meta.topic) } : {}) }).toString();

  return (
    <>
      <Topbar title={<><Link to="/tools/notes" className="icon-btn" aria-label="All notes" style={{ verticalAlign: 'middle', marginRight: 4 }}><IconArrowLeft /></Link>{meta.title}</>} sub={subjectName(meta.specId) + (topicName(meta.specId, meta.topic) ? ', ' + topicName(meta.specId, meta.topic) : '')}>
        <button className={'btn ' + (testing ? '' : 'btn-primary')} disabled={!cues.length && !testing} title={cues.length ? '' : 'Add some cue questions first'} onClick={() => { setTesting(!testing); setRevealed(false); }}>{testing ? 'Back to editing' : 'Test yourself'}</button>
      </Topbar>
      <div className="content stack">
        {testing ? (
          <section className="panel panel-pad">
            <p className="small muted" style={{ marginBottom: 12 }}>Answer each cue out loud without looking. Then reveal your notes and check.</p>
            <ol style={{ margin: '0 0 16px', paddingLeft: 20, display: 'grid', gap: 8, fontSize: 16, fontWeight: 600 }}>{cues.map((c, i) => <li key={i}>{c}</li>)}</ol>
            {!revealed ? <button className="btn" onClick={() => setRevealed(true)}>Reveal notes</button> : (
              <>
                <div className="divider" />
                <p style={{ whiteSpace: 'pre-wrap' }}>{note.body}</p>
                {note.summary && <p className="muted" style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}><b>Summary:</b> {note.summary}</p>}
                <div className="row wrap" style={{ marginTop: 14 }}>
                  <Link className="btn btn-sm" to={'/tools/blurt' + (q ? '?' + q : '')}>Blurt this topic</Link>
                  <Link className="btn btn-sm" to={'/tools/mistakes'}>Log what you missed</Link>
                </div>
              </>
            )}
          </section>
        ) : (
          <>
            <section className="panel panel-pad">
              <div className="field"><label htmlFor="nt">Title</label><input id="nt" className="input" maxLength={80} value={meta.title} onChange={(e) => touch({ title: e.target.value.slice(0, 80) })} onBlur={() => touch({ title: cleanText(meta.title, 80) || 'Notes' })} /></div>
              <SubjectTopicSelect specId={meta.specId || ''} topic={meta.topic} onChange={(s, t) => touch({ specId: s || undefined, topic: t })} idPrefix="nt" />
            </section>
            <div className="cornell">
              <div className="field" style={{ margin: 0 }}><label htmlFor="nc">Cue questions</label>
                <textarea id="nc" className="textarea" style={{ minHeight: 340 }} value={note.cues} onChange={(e) => edit('cues', e.target.value, 3000)} onBlur={() => touch({})} placeholder={'One question per line\nWhat are the stages of mitosis?\nWhy do cells need to divide?'} /></div>
              <div className="field" style={{ margin: 0 }}><label htmlFor="nb">Notes</label>
                <textarea id="nb" className="textarea" style={{ minHeight: 340 }} value={note.body} onChange={(e) => edit('body', e.target.value, 12000)} onBlur={() => touch({})} placeholder="Condensed, in your own words. Bullet points, not paragraphs." /></div>
            </div>
            <div className="field"><label htmlFor="ns">Summary</label>
              <textarea id="ns" className="textarea" style={{ minHeight: 80 }} value={note.summary} onChange={(e) => edit('summary', e.target.value, 1500)} onBlur={() => touch({})} placeholder="Three or four sentences that sum up the whole topic, written from memory." /></div>
            <section className="panel panel-pad">
              <h3 style={{ marginBottom: 6 }}>Make flashcards from these notes</h3>
              {pro ? (
                <><p className="small muted" style={{ marginBottom: 10 }}>The AI coach reads your notes and suggests question-and-answer cards. You choose which to keep.</p>
                  <button className="btn" disabled={note.body.trim().length < 80} title={note.body.trim().length < 80 ? 'Write a bit more first' : ''} onClick={() => setAiOpen(true)}>Suggest flashcards</button></>
              ) : <ProLock>With Pro, the AI turns your notes into flashcards for you.</ProLock>}
            </section>
          </>
        )}
      </div>
      {aiOpen && <AiCardsModal subject={specById(meta.specId || '')?.subject || 'General'} topic={topicName(meta.specId, meta.topic)} notes={[note.cues, note.body, note.summary].join('\n\n')} specId={meta.specId} topicIndex={meta.topic} deckName={meta.title} onClose={() => setAiOpen(false)} />}
    </>
  );
}

/** Pro: AI suggests cards from some notes; the student picks which to keep. */
export function AiCardsModal({ subject, topic, notes, specId, topicIndex, deckName, onClose, onAdd }: {
  subject: string; topic?: string; notes: string; specId?: string; topicIndex?: number; deckName: string; onClose: () => void;
  /** Add to a specific deck instead of the topic's deck. */
  onAdd?: (cards: AiCard[]) => void;
}) {
  const toast = useToast();
  const nav = useNavigate();
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [cards, setCards] = useState<AiCard[]>([]);
  const [keep, setKeep] = useState<boolean[]>([]);
  const run = async () => {
    setState('busy');
    const res = await aiCards({ subject, topic, notes: cleanText(notes, 12000) });
    if (!res.ok) { toast(res.error); setState('idle'); return; }
    setCards(res.data.cards); setKeep(res.data.cards.map(() => true)); setState('done');
  };
  const chosen = cards.filter((_, i) => keep[i]);
  const add = () => {
    if (onAdd) { onAdd(chosen); onClose(); return; }
    const id = addToTopicDeck(deckName, chosen, specId, topicIndex);
    toast('Added ' + chosen.length + ' flashcards');
    nav('/flashcards/' + id);
  };
  return (
    <Modal title="Suggested flashcards" wide onClose={onClose} footer={state === 'done'
      ? <><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!chosen.length} onClick={add}>Add {chosen.length} cards</button></>
      : <><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={state === 'busy'} onClick={run}>{state === 'busy' ? 'Reading your notes…' : 'Suggest cards'}</button></>}>
      {state !== 'done' ? <p className="muted">Your notes are sent to the AI coach to suggest cards. Nothing is added until you choose.</p> : !cards.length ? <p className="muted">No cards suggested. Try adding more detail to your notes.</p> : (
        <ul className="list">{cards.map((c, i) => (
          <li key={i} className="item" style={{ alignItems: 'flex-start' }}>
            <input type="checkbox" checked={keep[i]} onChange={(e) => setKeep(keep.map((k, j) => (j === i ? e.target.checked : k)))} aria-label="Keep this card" style={{ marginTop: 4, width: 17, height: 17, accentColor: 'var(--accent)' }} />
            <div className="grow"><div className="title small">{c.f}</div><div className="small muted">{c.b}</div></div>
          </li>
        ))}</ul>
      )}
      {state === 'done' && <p className="tiny faint" style={{ marginTop: 10 }}>Check each card against your notes. AI can get things wrong.</p>}
    </Modal>
  );
}
