import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { useToast } from '../../components/ui';
import { MistakeModal } from '../../components/MistakeModal';
import { SubjectTopicSelect, topicName, useToolTarget } from '../../components/pickers';
import { useBlurts, useChecklist, useDecks, useNotes } from '../../lib/data';
import { store } from '../../lib/store';
import { fmtClock } from '../../lib/dates';
import { parseCardLines } from '../../lib/srs';
import { addToTopicDeck } from '../../lib/decks';
import { cleanText, uid } from '../../lib/sanitize';
import { emptyDeck, type DeckData, type NoteData, type Rating } from '../../lib/types';
import { subjectName } from '../hooks';
import { SpecPoints } from '../../components/SpecPoints';
import { hasSpecContent } from '../../content/spec';

type Phase = 'setup' | 'write' | 'check' | 'saved';

export default function Blurt() {
  const target = useToolTarget();
  const [specId, setSpecId] = useState(target.specId);
  const [topic, setTopic] = useState<number | undefined>(target.topic);
  const [mins, setMins] = useState(10);
  const [phase, setPhase] = useState<Phase>('setup');
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [text, setText] = useState('');
  const [score, setScore] = useState(50);
  const [gaps, setGaps] = useState('');
  const [logging, setLogging] = useState(false);
  const [blurts, setBlurts] = useBlurts();
  const [checklist, setChecklist] = useChecklist();
  const [notes] = useNotes();
  const [decks] = useDecks();
  const toast = useToast();
  const nav = useNavigate();
  const name = topicName(specId, topic) || subjectName(specId);
  const last = blurts.list.filter((b) => b.specId === (specId || undefined) && b.topic === topic).sort((a, b) => b.at - a.at)[0];

  useEffect(() => {
    if (phase !== 'write') return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [phase]);
  const left = Math.max(0, startedAt + mins * 60000 - now);

  // What to check the blurt against: your own notes and flashcards for this topic.
  const check = useMemo(() => {
    if (phase !== 'check') return { notes: [] as NoteData[], cards: [] as { f: string; b: string }[] };
    const n = notes.list.filter((x) => x.specId === specId && (topic == null || x.topic === topic)).map((x) => store.get<NoteData>('note_' + x.id, { cues: '', body: '', summary: '' }));
    const c = decks.list.filter((d) => d.specId === specId && (topic == null || d.topic === topic)).flatMap((d) => store.get<DeckData>('deck_' + d.id, emptyDeck()).cards).slice(0, 60);
    return { notes: n, cards: c };
  }, [phase, notes, decks, specId, topic]);

  const rate = (r: Rating) => {
    if (!specId || topic == null) return;
    setChecklist((c) => ({ ...c, [specId]: { ...(c[specId] || {}), [topic]: r } }));
    toast('Topic rated ' + (r === 'r' ? 'red' : r === 'a' ? 'amber' : 'green'));
  };
  const save = () => {
    const entry = { id: uid(), specId: specId || undefined, topic, at: Date.now(), mins: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), score, text: cleanText(text, 3000), gaps: cleanText(gaps, 2000) };
    setBlurts((b) => ({ list: b.list.concat(entry).slice(-60) }));
    setPhase('saved');
  };
  const gapCards = parseCardLines(gaps);
  const rating = specId && topic != null ? (checklist[specId] || {})[topic] : undefined;

  return (
    <>
      <Topbar title="Blurting" sub={phase === 'setup' ? 'Write everything you remember, then check what you missed' : name}>
        <Link className="btn btn-ghost" to="/guides/blurting">How to blurt</Link>
      </Topbar>
      <div className="content stack" style={{ maxWidth: 900 }}>
        {phase === 'setup' && (
          <section className="panel panel-pad">
            <SubjectTopicSelect specId={specId} topic={topic} onChange={(s, t) => { setSpecId(s); setTopic(t); }} />
            <div className="field"><span className="label">Time</span>
              <div className="chips">{[5, 10, 15, 20].map((n) => <button key={n} className="chip" aria-pressed={mins === n} onClick={() => setMins(n)}>{n} min</button>)}</div></div>
            {last?.gaps && <div className="banner info" style={{ marginBottom: 14, alignItems: 'flex-start' }}><p><b>Last time you missed:</b><br /><span style={{ whiteSpace: 'pre-wrap' }}>{last.gaps}</span></p></div>}
            <p className="small muted" style={{ marginBottom: 14 }}>Close your notes and books. When you start, write or type anything you can remember about {name.toLowerCase() === 'general' ? 'the topic' : name}: key words, processes, examples, dates, quotes.</p>
            <button className="btn btn-primary btn-lg" onClick={() => { setStartedAt(Date.now()); setNow(Date.now()); setPhase('write'); }}>Start {mins} minutes</button>
          </section>
        )}

        {phase === 'write' && (
          <section className="panel panel-pad">
            <div className="row between" style={{ marginBottom: 10 }}>
              <b className="num" style={{ fontSize: 26, color: left === 0 ? 'var(--bad)' : undefined }}>{fmtClock(left)}</b>
              <span className="small muted">{left === 0 ? 'Time’s up. Finish your sentence, then check.' : 'No notes. Keep writing, even if you’re unsure.'}</span>
            </div>
            <textarea className="textarea" style={{ minHeight: 320 }} autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={3000} aria-label="Everything you remember" placeholder="Start anywhere. Bullet points are fine." />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}><button className="btn btn-primary" onClick={() => setPhase('check')}>I’m done, check it</button></div>
          </section>
        )}

        {phase === 'check' && (
          <>
            <div className="grid">
              <section className="panel c6"><div className="panel-head"><h2>What you wrote</h2></div><div className="panel-body"><p style={{ whiteSpace: 'pre-wrap' }}>{text || <span className="muted">Nothing written.</span>}</p></div></section>
              <section className="panel c6"><div className="panel-head"><h2>Check against</h2></div><div className="panel-body">
                {topic != null && hasSpecContent(specId) && <><p className="small muted">Tick each part of the spec you remembered.</p><SpecPoints specId={specId} topic={topic} /></>}
                {!check.notes.length && !check.cards.length && !(topic != null && hasSpecContent(specId)) && <p className="small muted">Open your class notes, textbook or revision guide for this topic and compare. Make <Link to="/tools/notes">Cornell notes</Link> or <Link to="/flashcards">flashcards</Link> for it and they’ll show here next time.</p>}
                {check.notes.map((n, i) => <div key={i} style={{ marginBottom: 12 }}><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{n.body}</p>{n.summary && <p className="small muted" style={{ marginTop: 6 }}>{n.summary}</p>}</div>)}
                {check.cards.length > 0 && <ul className="list">{check.cards.map((c, i) => <li key={i} className="item small" style={{ padding: '7px 0' }}><b style={{ minWidth: 0, flex: '0 1 45%' }}>{c.f}</b><span className="muted grow">{c.b}</span></li>)}</ul>}
              </div></section>
            </div>
            <section className="panel panel-pad">
              <div className="field"><label htmlFor="sc">How much did you remember? <span className="num">{score}%</span></label>
                <input id="sc" type="range" min={0} max={100} step={5} value={score} onChange={(e) => setScore(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} /></div>
              <div className="field"><label htmlFor="gp">What did you miss?</label>
                <textarea id="gp" className="textarea" value={gaps} maxLength={2000} onChange={(e) => setGaps(e.target.value)} placeholder={'One point per line. Write it as “question - answer” and Hilite can turn it into flashcards:\nWhat does amylase break down - Starch into sugars'} />
                <span className="hint">These show next time you blurt this topic.</span></div>
              <div className="row between wrap">
                {topic != null ? <div className="row"><span className="small muted">Rate this topic</span><div className="rag" role="group" aria-label="Rate this topic">{(['r', 'a', 'g'] as Rating[]).map((r) => <button key={r} className={r} aria-pressed={rating === r} onClick={() => rate(r)}>{r.toUpperCase()}</button>)}</div></div> : <span />}
                <button className="btn btn-primary" onClick={save}>Save blurt</button>
              </div>
            </section>
          </>
        )}

        {phase === 'saved' && (
          <section className="panel panel-pad stack" style={{ gap: 12 }}>
            <h2>Blurt saved</h2>
            <p className="muted">You remembered about {score}% of {name}. {score < 50 ? 'Revisit your notes on the gaps, then blurt it again in a day or two.' : 'Blurt it again in a few days to check the gaps have gone.'}</p>
            <div className="row wrap">
              {gapCards.length > 0 && <button className="btn" onClick={() => { const id = addToTopicDeck(name, gapCards, specId, topic); toast('Added ' + gapCards.length + ' flashcards'); nav('/flashcards/' + id); }}>Turn {gapCards.length} gaps into flashcards</button>}
              <button className="btn" onClick={() => setLogging(true)}>Log a mistake</button>
              <button className="btn" onClick={() => { setText(''); setGaps(''); setScore(50); setPhase('setup'); }}>Blurt another topic</button>
              <Link className="btn btn-ghost" to="/planner">Back to your plan</Link>
            </div>
          </section>
        )}
      </div>
      {logging && <MistakeModal source="blurt" initial={{ specId, topic, kind: 'recall', what: gaps.split('\n')[0] || '' }} onClose={() => setLogging(false)} />}
    </>
  );
}
