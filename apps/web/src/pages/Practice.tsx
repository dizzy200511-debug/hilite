import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Empty, Seg, useToast } from '../components/ui';
import { ProLock, useToolTarget } from '../components/pickers';
import { Diagram } from '../components/Diagram';
import { specById } from '../catalog/catalog';
import { useQuestions } from '../content/questions';
import type { Question } from '../content/questions/types';
import { useMistakes, usePractice, useProfile } from '../lib/data';
import { addMistakes, newMistake } from '../lib/mistakes';
import { aiMark } from '../lib/ai';
import { cleanText } from '../lib/sanitize';
import { FREE_LIMITS } from '../lib/pro';
import { subjectName, usePro } from './hooks';

const LEVELS = ['', 'Easy', 'Medium', 'Hard'];
type Level = 'all' | '1' | '2' | '3';

/** Exam-style questions for every topic, marked against a mark scheme or, for Pro, by AI. */
export default function Practice() {
  const target = useToolTarget();
  const [profile] = useProfile();
  const [specId, setSpecId] = useState(target.specId);
  const [topic, setTopic] = useState<number | undefined>(target.topic);
  const [level, setLevel] = useState<Level>('all');
  const [hideDone, setHideDone] = useState(false);
  const [log] = usePractice();
  const pro = usePro();
  const spec = specById(specId);
  const tier = profile.subjects.find((s) => s.specId === specId)?.tier;
  const qs = useQuestions(specId || undefined, tier);
  useEffect(() => { setSpecId(target.specId); setTopic(target.topic); }, [target.specId, target.topic]);

  const stats = (list: Question[]) => {
    const done = list.filter((q) => log[q.id]);
    const got = done.reduce((a, q) => a + log[q.id].s, 0), max = done.reduce((a, q) => a + log[q.id].m, 0);
    return { done: done.length, pct: max ? Math.round((got / max) * 100) : null };
  };
  const all = topic != null && qs ? qs[topic] ?? [] : [];
  const open = all.slice(0, pro ? all.length : FREE_LIMITS.questionsPerTopic);
  const shown = open.filter((q) => (level === 'all' || q.level === Number(level)) && (!hideDone || !log[q.id]));
  const locked = all.length - open.length;

  return (
    <>
      <Topbar title="Practice questions" sub="Exam-style questions for every topic, with mark schemes" />
      <div className="content stack">
        {!profile.subjects.length ? (
          <div className="panel"><Empty title="Add your subjects first" action={<Link className="btn btn-primary" to="/subjects">Add subjects</Link>}>Practice questions follow your exam board and tier.</Empty></div>
        ) : (
          <section className="panel panel-pad">
            <div className="field-row">
              <div className="field"><label htmlFor="ps">Subject</label>
                <select id="ps" className="select" value={specId} onChange={(e) => { setSpecId(e.target.value); setTopic(undefined); }}>
                  {profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}
                </select></div>
              <div className="field"><label htmlFor="pt">Topic</label>
                <select id="pt" className="select" value={topic ?? ''} onChange={(e) => setTopic(e.target.value === '' ? undefined : Number(e.target.value))}>
                  <option value="">All topics</option>
                  {spec?.topics.map((t, i) => <option key={i} value={i}>{t}</option>)}
                </select></div>
            </div>
            {topic != null && (
              <div className="row wrap between">
                <Seg label="Difficulty" value={level} onChange={setLevel} options={[['all', 'All'], ['1', 'Easy'], ['2', 'Medium'], ['3', 'Hard']]} />
                <label className="check small"><input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />Hide questions I’ve done</label>
              </div>
            )}
          </section>
        )}

        {qs === undefined && specId && <p className="muted small">Loading questions…</p>}
        {qs === null && spec && <div className="panel"><Empty title="Questions for this subject are on the way">Hilite doesn’t have practice questions for {spec.subject} yet. Use past papers for now{pro ? ', or ask the AI coach for questions on any topic' : ''}.</Empty></div>}

        {qs && spec && topic == null && (
          <section className="panel">
            <div className="panel-head"><h2>Choose a topic</h2><span className="small muted">{qs.reduce((a, l) => a + l.length, 0)} questions</span></div>
            <div className="panel-body">
              <ul className="list">{spec.topics.map((name, i) => {
                const list = qs[i] ?? [], st = stats(list);
                return (
                  <li className="item" key={i}>
                    <div className="grow"><div className="title">{name}</div>
                      <div className="meta"><span>{list.length ? list.length + ' questions' : 'Questions coming soon'}</span>{st.done > 0 && <span>{st.done} done</span>}{st.pct != null && <span className={'tag ' + (st.pct >= 70 ? 'good' : st.pct >= 40 ? 'warn' : 'bad')}>{st.pct}%</span>}</div></div>
                    <button className="btn btn-sm" disabled={!list.length} onClick={() => setTopic(i)}>Practise</button>
                  </li>
                );
              })}</ul>
            </div>
          </section>
        )}

        {qs && spec && topic != null && (
          <>
            {!all.length && <div className="panel"><Empty title="No questions for this topic yet">Try another topic{pro ? ', or ask the AI coach to write some' : ''}.</Empty></div>}
            {all.length > 0 && !shown.length && <p className="muted">No questions match. Change the difficulty, or show the ones you’ve done.</p>}
            {shown.map((q) => <QuestionCard key={q.id} q={q} n={all.indexOf(q) + 1} specId={specId} topic={topic} />)}
            {locked > 0 && <section className="panel panel-pad"><ProLock>{locked} more {locked === 1 ? 'question' : 'questions'} on this topic, and AI marking, come with Pro.</ProLock></section>}
          </>
        )}
      </div>
    </>
  );
}

function QuestionCard({ q, n, specId, topic }: { q: Question; n: number; specId: string; topic: number }) {
  const spec = specById(specId)!;
  const [log, setLog] = usePractice();
  const [, setMistakes] = useMistakes();
  const pro = usePro();
  const toast = useToast();
  const saved = log[q.id];
  const [answer, setAnswer] = useState('');
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>(() => q.scheme.map(() => false));
  const [ai, setAi] = useState<{ score: number; feedback: string; missed: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [logged, setLogged] = useState(false);

  const save = (s: number) => setLog((l) => ({ ...l, [q.id]: { s, m: q.marks, at: Date.now() } }));
  // When a scheme lists more points than marks (long answers), each point is worth a share.
  const selfScore = Math.min(q.marks, q.scheme.length === q.marks ? ticks.filter(Boolean).length : Math.round((ticks.filter(Boolean).length / q.scheme.length) * q.marks));
  const pick = (i: number) => { if (chosen != null) return; setChosen(i); setRevealed(true); save(i === q.answer ? 1 : 0); };
  const markWithAi = async () => {
    setBusy(true);
    const res = await aiMark({ subject: spec.subject, board: spec.board, question: cleanText(q.q, 1500), marks: q.marks, markPoints: q.scheme.slice(0, 12), answer: cleanText(answer, 5000) });
    setBusy(false);
    if (!res.ok) { toast(res.error); return; }
    const score = Math.max(0, Math.min(q.marks, res.data.score));
    setAi({ score, feedback: res.data.feedback, missed: res.data.missed });
    setRevealed(true);
    save(score);
  };
  const toMistakes = () => {
    setMistakes((l) => addMistakes(l, [newMistake({ specId, topic, source: 'quiz', kind: 'knowledge', what: q.q, fix: q.scheme.join('. ') })]));
    setLogged(true);
    toast('Added to your mistake log. You’ll be retested tomorrow.');
  };
  const lastScore = ai?.score ?? (chosen != null ? (chosen === q.answer ? 1 : 0) : null);
  const lost = (lastScore ?? saved?.s ?? q.marks) < q.marks && (chosen != null || ai != null || saved != null);

  return (
    <article className="panel q-card">
      <header className="q-head">
        <b>Question {n}</b>
        <span className="tag num">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
        <span className={'tag' + (q.level === 3 ? ' warn' : '')}>{LEVELS[q.level]}</span>
        {q.higher && <span className="tag accent">Higher</span>}
        {saved && <span className={'tag num ' + (saved.s >= saved.m ? 'good' : saved.s / saved.m >= 0.5 ? 'warn' : 'bad')} style={{ marginLeft: 'auto' }}>Last: {saved.s}/{saved.m}</span>}
      </header>
      {q.diagram && <Diagram d={q.diagram} />}
      <p className="q-text">{q.q}</p>

      {q.kind === 'mcq' ? (
        <div className="q-opts">{q.options!.map((o, i) => (
          <button key={i} className={'q-opt' + (chosen != null && i === q.answer ? ' right' : '') + (chosen === i && i !== q.answer ? ' wrong' : '')} onClick={() => pick(i)} disabled={chosen != null}>
            <span className="q-letter">{String.fromCharCode(65 + i)}</span>{o}
          </button>
        ))}</div>
      ) : (
        <textarea className="textarea" style={{ minHeight: q.kind === 'long' ? 160 : 80 }} maxLength={5000} value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label={'Your answer to question ' + n} placeholder={q.kind === 'calc' ? 'Show your working, then your answer' : 'Write your answer as you would in the exam'} />
      )}

      {q.kind !== 'mcq' && !revealed && (
        <div className="row wrap">
          <button className="btn" onClick={() => setRevealed(true)}>Check with the mark scheme</button>
          {pro ? <button className="btn btn-primary" disabled={busy || !cleanText(answer)} onClick={markWithAi}>{busy ? 'Marking…' : 'Mark with AI'}</button> : null}
        </div>
      )}

      {revealed && (
        <div className="q-scheme">
          {ai && (
            <div className="banner info" style={{ marginBottom: 10 }}><p><b className="num">AI mark: {ai.score}/{q.marks}.</b> {ai.feedback}{ai.missed.length > 0 && <> You missed: {ai.missed.join('; ')}.</>}</p></div>
          )}
          <div className="spec-section-name">Mark scheme</div>
          {q.kind === 'mcq' ? <p>{q.scheme[0]}</p> : (
            <ul className="list">{q.scheme.map((pt, i) => (
              <li key={i} className="item" style={{ padding: '7px 0' }}>
                {!ai && <input type="checkbox" checked={ticks[i]} onChange={() => setTicks(ticks.map((t, j) => (j === i ? !t : t)))} aria-label={'I got: ' + pt} />}
                <span className="small">{pt}</span>
              </li>
            ))}</ul>
          )}
          {q.model && <details style={{ marginTop: 8 }}><summary className="small" style={{ cursor: 'pointer', fontWeight: 600 }}>Model answer</summary><p className="small q-text" style={{ marginTop: 6 }}>{q.model}</p></details>}
          <div className="row wrap" style={{ marginTop: 12 }}>
            {q.kind !== 'mcq' && !ai && <button className="btn btn-primary btn-sm" onClick={() => { save(selfScore); toast('Saved: ' + selfScore + '/' + q.marks); }}>Save my mark: {selfScore}/{q.marks}</button>}
            {q.kind !== 'mcq' && !ai && <span className="small muted">Tick each point you got.</span>}
            {lost && !logged && <button className="btn btn-sm" onClick={toMistakes}>Add to mistake log</button>}
          </div>
        </div>
      )}
    </article>
  );
}
