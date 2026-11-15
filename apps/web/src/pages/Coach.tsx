import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Seg, colourVar, useToast } from '../components/ui';
import { IconCheck, IconLock } from '../components/icons';
import { specById } from '../catalog/catalog';
import { useCoach, useDecks, useMistakes, useProfile } from '../lib/data';
import { aiMark, aiQuestions, type AiMark } from '../lib/ai';
import { addMistakes, isDueMistake, mistakePattern, newMistake, retest } from '../lib/mistakes';
import { store } from '../lib/store';
import { cleanText, uid } from '../lib/sanitize';
import { shuffle } from '../lib/srs';
import { loadSpecContent } from '../content/spec';
import { emptyDeck, MISTAKE_KINDS, type DeckData, type MistakeKind } from '../lib/types';
import type { TopicWeakness } from '../lib/weakness';
import { subjectName, useColourOf, usePro, useRebuildPlan, useWeakness } from './hooks';

type Item =
  | { ai: true; specId: string; topic?: number; question: string; marks: number; markPoints: string[]; modelAnswer: string; targets: string }
  | { ai: false; specId?: string; topic?: number; question: string; answer: string; mistakeId?: string };

const PASS = 0.6;

export default function Coach() {
  const pro = usePro();
  const weak = useWeakness();
  const [mistakes] = useMistakes();
  const [profile, setProfile] = useProfile();
  const rebuild = useRebuildPlan();
  const colourOf = useColourOf();
  const toast = useToast();
  const [tab, setTab] = useState<'practice' | 'mark'>('practice');
  const [items, setItems] = useState<Item[] | null>(null);
  const pattern = mistakePattern(mistakes.list);

  if (!pro) return <CoachLocked weakCount={weak.length} />;

  return (
    <>
      <Topbar title="AI coach" sub="Learns from your mistakes and weak topics, then tests you on them">
        <Link className="btn btn-ghost" to="/tools/mistakes">Mistake log</Link>
      </Topbar>
      <div className="content stack">
        <p className="small muted">The coach is an AI, not a person. It can get things wrong, so check anything surprising against your notes or a mark scheme.</p>
        {items ? <Session items={items} onEnd={() => setItems(null)} /> : (
          <>
            <div className="grid">
              <section className="panel c7">
                <div className="panel-head"><h2>What Hilite has learnt about you</h2><span className="small muted">{weak.length} weak {weak.length === 1 ? 'topic' : 'topics'}</span></div>
                <div className="panel-body">
                  {!weak.length ? <p className="small muted">Nothing stands out yet. Rate your topics, log mistakes from past papers, and do some flashcards or coach questions. The coach uses all of it.</p> : (
                    <ul className="list">{weak.slice(0, 7).map((w) => (
                      <li key={w.specId + w.topic} className="item">
                        <span className="sub-tab" style={colourVar(colourOf(w.specId))} />
                        <div className="grow"><div className="title">{w.name}</div><div className="meta"><span>{w.subject}</span>{w.reasons.map((r) => <span key={r}>{r}</span>)}</div></div>
                        <div className="meter" style={{ width: 70 }} title={'Weakness ' + Math.round(w.score * 100) + '%'}><i style={{ width: Math.round(w.score * 100) + '%', background: w.score >= 0.5 ? 'var(--bad)' : 'var(--warn)' }} /></div>
                      </li>
                    ))}</ul>
                  )}
                </div>
              </section>
              <section className="panel c5">
                <div className="panel-head"><h2>Your mistake pattern</h2></div>
                <div className="panel-body">
                  {!pattern.length ? <p className="small muted">Log mistakes after each paper and the coach will spot patterns in why you lose marks.</p> : (
                    <>
                      <p style={{ marginBottom: 8 }}>Most of your lost marks are from <b>{MISTAKE_KINDS[pattern[0].kind].name.toLowerCase()}</b> ({pattern[0].n} in 60 days).</p>
                      <p className="small muted">{MISTAKE_KINDS[pattern[0].kind].hint} <Link to={'/guides/' + MISTAKE_KINDS[pattern[0].kind].guide}>Read the guide</Link></p>
                    </>
                  )}
                  <div className="divider" />
                  <label className="check"><input type="checkbox" checked={profile.adaptive} onChange={(e) => setProfile((p) => ({ ...p, adaptive: e.target.checked }))} />Let my plan adapt to my weak topics</label>
                  <p className="small muted" style={{ margin: '6px 0 10px' }}>Weak topics get extra sessions, including AI practice, and very weak ones are treated as red.</p>
                  <button className="btn btn-sm" onClick={() => { rebuild(); toast('Plan rebuilt around your weak topics'); }}>Rebuild my plan now</button>
                </div>
              </section>
            </div>
            <Seg label="Coach mode" value={tab} onChange={setTab} options={[['practice', 'Targeted practice'], ['mark', 'Mark a written answer']]} />
            {tab === 'practice' ? <Start weak={weak} onStart={setItems} /> : <MarkAnswer />}
          </>
        )}
      </div>
    </>
  );
}

function CoachLocked({ weakCount }: { weakCount: number }) {
  return (
    <>
      <Topbar title="AI coach" sub="Part of Hilite Pro" />
      <div className="content">
        <section className="panel panel-pad" style={{ maxWidth: 640 }}>
          <h2 style={{ marginBottom: 8 }}><IconLock width={18} height={18} style={{ verticalAlign: '-3px' }} /> The coach learns from your mistakes</h2>
          <p className="muted" style={{ marginBottom: 14 }}>{weakCount ? 'Hilite has already spotted ' + weakCount + ' weak ' + (weakCount === 1 ? 'topic' : 'topics') + ' from your ratings, mistakes and flashcards. ' : ''}With Pro, the AI coach uses them to test you.</p>
          <ul className="list" style={{ marginBottom: 16 }}>
            {['Writes new exam-style questions aimed at your weak topics and the mistakes in your log.', 'Marks your written answers like an examiner, says what was missing, and shows a model answer.', 'Anything you get wrong goes into your mistake log, so the next session targets it.', 'Reshapes your revision plan around what you keep getting wrong.', 'Turns your notes into flashcards.'].map((x) => (
              <li key={x} className="item" style={{ alignItems: 'flex-start' }}><IconCheck width={17} height={17} style={{ color: 'var(--good)', flexShrink: 0, marginTop: 3 }} /><span>{x}</span></li>
            ))}
          </ul>
          <Link className="btn btn-primary" to="/upgrade">See Pro</Link>
          <p className="small muted" style={{ marginTop: 14 }}>Your <Link to="/tools/mistakes">mistake log</Link> is free and already retests you on every mistake you log.</p>
        </section>
      </div>
    </>
  );
}

function Start({ weak, onStart }: { weak: TopicWeakness[]; onStart: (items: Item[]) => void }) {
  const [profile] = useProfile();
  const [mistakes] = useMistakes();
  const [coach] = useCoach();
  const [decks] = useDecks();
  const toast = useToast();
  const [specId, setSpecId] = useState(weak[0]?.specId || profile.subjects[0]?.specId || '');
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const spec = specById(specId);
  const choice = profile.subjects.find((s) => s.specId === specId);
  // The weakest topics in this subject, or a spread of its topics if nothing stands out yet.
  const targets = weak.filter((w) => w.specId === specId).slice(0, 4);
  const topics = targets.length ? targets : spec ? shuffle(spec.topics.map((name, topic) => ({ specId, topic, name, subject: spec.subject, score: 0, reasons: ['Not tested yet'] }))).slice(0, 3) : [];

  /** Without the AI: retest your own mistakes and the flashcards you keep forgetting in these topics. */
  const offline = (): Item[] => {
    const ms = mistakes.list.filter((m) => !m.cleared && m.specId === specId).sort((a, b) => Number(isDueMistake(b)) - Number(isDueMistake(a)));
    const fromMistakes: Item[] = ms.map((m) => ({ ai: false, specId: m.specId, topic: m.topic, question: m.what, answer: m.fix, mistakeId: m.id }));
    const fromCards: Item[] = decks.list.filter((d) => d.specId === specId && (d.topic == null || topics.some((t) => t.topic === d.topic)))
      .flatMap((d) => store.get<DeckData>('deck_' + d.id, emptyDeck()).cards.filter((c) => (c.lapses || 0) > 0).map((c) => ({ ai: false as const, specId, topic: d.topic, question: c.f, answer: c.b })));
    return fromMistakes.concat(shuffle(fromCards)).slice(0, count);
  };

  const start = async () => {
    if (!spec) return;
    setBusy(true);
    const content = await loadSpecContent(specId).catch(() => null);
    const subTopics = (topic: number) => content?.topics[topic]?.flatMap((sec) => sec.points.filter((pt) => !(choice?.tier === 'F' && pt.higher)).map((pt) => pt.name)).slice(0, 25);
    const res = await aiQuestions({
      subject: spec.subject, board: spec.board, code: spec.code, tier: choice?.tier,
      topics: topics.map((t) => ({ name: t.name, reasons: t.reasons, points: subTopics(t.topic) })),
      mistakes: mistakes.list.filter((m) => !m.cleared && m.specId === specId && topics.some((t) => t.topic === m.topic)).slice(-12)
        .map((m) => ({ topic: topics.findIndex((t) => t.topic === m.topic), kind: m.kind, what: cleanText(m.what, 400), fix: cleanText(m.fix, 400) })),
      recent: coach.attempts.filter((a) => a.specId === specId && a.ai && a.max && a.score / a.max < PASS).slice(-6).map((a) => ({ question: cleanText(a.q, 600), feedback: cleanText(a.feedback, 600) })),
      count,
    });
    setBusy(false);
    if (res.ok && res.data.questions.length) {
      onStart(res.data.questions.map((q) => ({ ai: true, specId, topic: topics[q.topic]?.topic, question: q.question, marks: Math.max(1, Math.min(30, q.marks)), markPoints: q.markPoints, modelAnswer: q.modelAnswer, targets: q.targets })));
      return;
    }
    const fallback = offline();
    if (!fallback.length) { toast(res.ok ? 'No questions came back. Try again.' : res.error); return; }
    toast((res.ok ? 'No AI questions came back.' : res.error) + ' Practising your own mistakes and cards instead.');
    onStart(fallback);
  };

  return (
    <section className="panel panel-pad">
      <h2 style={{ marginBottom: 6 }}>Targeted practice</h2>
      <p className="small muted" style={{ marginBottom: 14 }}>The coach writes exam-style questions on your weakest topics in a subject, aimed at the mistakes you’ve made before, then marks your answers.</p>
      <div className="field-row">
        <div className="field"><label htmlFor="cs">Subject</label><select id="cs" className="select" value={specId} onChange={(e) => setSpecId(e.target.value)}>{profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}</select></div>
        <div className="field"><span className="label">Questions</span><Seg label="Questions" value={String(count)} onChange={(v) => setCount(Number(v))} options={[['3', '3'], ['5', '5'], ['8', '8']]} /></div>
      </div>
      {topics.length > 0 && <p className="small" style={{ marginBottom: 14 }}><span className="muted">Focusing on:</span> {topics.map((t) => t.name).join(', ')}</p>}
      <button className="btn btn-primary btn-lg" disabled={busy || !spec} onClick={start}>{busy ? 'Writing your questions…' : 'Start'}</button>
    </section>
  );
}

function Session({ items, onEnd }: { items: Item[]; onEnd: () => void }) {
  const [, setCoach] = useCoach();
  const [, setMistakes] = useMistakes();
  const rebuild = useRebuildPlan();
  const toast = useToast();
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [mark, setMark] = useState<AiMark | null>(null);
  const [shown, setShown] = useState(false);
  const [results, setResults] = useState<{ score: number; max: number; logged: boolean }[]>([]);
  const item = items[i];
  const spec = item ? specById(item.specId || '') : undefined;

  const record = (score: number, max: number, feedback: string, ai: boolean) => {
    if (!item) return false;
    setCoach((c) => ({ attempts: c.attempts.concat({ id: uid(), specId: item.specId, topic: item.topic, q: cleanText(item.question, 600), a: cleanText(answer, 3000), score, max, feedback: cleanText(feedback, 1200), at: Date.now(), ai }).slice(-120) }));
    return score / max < PASS;
  };

  const markIt = async () => {
    if (!item?.ai || !spec) return;
    setBusy(true);
    const res = await aiMark({ subject: spec.subject, board: spec.board, question: item.question, marks: item.marks, markPoints: item.markPoints, answer: cleanText(answer, 5000) });
    setBusy(false);
    if (!res.ok) { toast(res.error); return; }
    const m = { ...res.data, score: Math.max(0, Math.min(item.marks, res.data.score)) };
    setMark(m);
    const low = record(m.score, item.marks, m.feedback, true);
    if (low) {
      const kind: MistakeKind = m.mistakeKind === 'none' ? 'knowledge' : m.mistakeKind;
      setMistakes((l) => addMistakes(l, [newMistake({ specId: item.specId, topic: item.topic, source: 'coach', kind, what: item.question, fix: m.modelAnswer || item.modelAnswer })]));
    }
    setResults((r) => r.concat({ score: m.score, max: item.marks, logged: low }));
  };
  const selfMark = (got: boolean) => {
    if (!item || item.ai) return;
    record(got ? 1 : 0, 1, got ? 'Self-marked right' : 'Self-marked wrong', false);
    if (item.mistakeId) setMistakes((l) => ({ list: l.list.map((m) => (m.id === item.mistakeId ? retest(m, got) : m)) }));
    else if (!got) setMistakes((l) => addMistakes(l, [newMistake({ specId: item.specId, topic: item.topic, source: 'coach', kind: 'recall', what: item.question, fix: item.answer })]));
    setResults((r) => r.concat({ score: got ? 1 : 0, max: 1, logged: !got && !item.mistakeId }));
    next();
  };
  const next = () => { setI(i + 1); setAnswer(''); setMark(null); setShown(false); };

  if (!item) {
    const got = results.reduce((a, r) => a + r.score, 0), max = results.reduce((a, r) => a + r.max, 0);
    const logged = results.filter((r) => r.logged).length;
    return (
      <section className="panel panel-pad stack" style={{ gap: 12 }}>
        <h2>Session done: {got} of {max} marks</h2>
        <p className="muted">{logged ? logged + (logged === 1 ? ' question' : ' questions') + ' went into your mistake log. The coach will come back to them.' : 'Nothing new for your mistake log this time.'}</p>
        <div className="row wrap">
          <button className="btn btn-primary" onClick={() => { rebuild(); toast('Plan updated from this session'); onEnd(); }}>Update my plan from this</button>
          <Link className="btn" to="/tools/mistakes">Open mistake log</Link>
          <button className="btn btn-ghost" onClick={onEnd}>Back to the coach</button>
        </div>
      </section>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 820 }}>
      <div className="row between small muted"><span>Question {i + 1} of {items.length}{item.topic != null && spec ? ', ' + spec.topics[item.topic] : ''}</span><button className="btn btn-sm btn-ghost" onClick={() => setI(items.length)}>Finish now</button></div>
      <div className="meter"><i style={{ width: Math.round((i / items.length) * 100) + '%' }} /></div>
      <section className="panel panel-pad">
        <div className="row between" style={{ marginBottom: 10 }}>{item.ai ? <span className="tag accent">{item.marks} {item.marks === 1 ? 'mark' : 'marks'}</span> : <span className="tag">{item.mistakeId ? 'From your mistake log' : 'From your flashcards'}</span>}</div>
        <p style={{ fontSize: 17, fontWeight: 600, whiteSpace: 'pre-wrap' }}>{item.question}</p>
        {item.ai && item.targets && <p className="small muted" style={{ marginTop: 8 }}>Why this question: {item.targets}</p>}
      </section>

      {item.ai ? (
        <>
          <textarea className="textarea" style={{ minHeight: 140 }} value={answer} maxLength={5000} onChange={(e) => setAnswer(e.target.value)} disabled={!!mark} aria-label="Your answer" placeholder="Answer as you would in the exam." autoFocus />
          {!mark ? (
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => { record(0, item.marks, 'Skipped', true); setResults((r) => r.concat({ score: 0, max: item.marks, logged: false })); next(); }}>Skip</button>
              <button className="btn btn-primary" disabled={busy || !answer.trim()} onClick={markIt}>{busy ? 'Marking…' : 'Mark my answer'}</button>
            </div>
          ) : (
            <section className="panel panel-pad">
              <div className="row between" style={{ marginBottom: 8 }}><h3>{mark.score} of {item.marks} marks</h3>{mark.score / item.marks < PASS && <span className="tag warn">Added to your mistake log</span>}</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{mark.feedback}</p>
              {mark.missed.length > 0 && <><h3 style={{ margin: '14px 0 6px' }}>What would have got the marks</h3><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{mark.missed.map((m) => <li key={m}>{m}</li>)}</ul></>}
              <h3 style={{ margin: '14px 0 6px' }}>Model answer</h3>
              <p className="small" style={{ whiteSpace: 'pre-wrap' }}>{mark.modelAnswer || item.modelAnswer}</p>
              <div className="row between" style={{ marginTop: 14 }}><span className="tiny faint">AI marking is a guide, not an exam board mark.</span><button className="btn btn-primary" autoFocus onClick={next}>Next</button></div>
            </section>
          )}
        </>
      ) : !shown ? (
        <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn btn-primary" onClick={() => setShown(true)}>Show the answer</button></div>
      ) : (
        <section className="panel panel-pad">
          <p style={{ whiteSpace: 'pre-wrap' }}>{item.answer}</p>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn" onClick={() => selfMark(false)}>Not yet</button><button className="btn btn-primary" onClick={() => selfMark(true)}>I got it right</button></div>
        </section>
      )}
    </div>
  );
}

function MarkAnswer() {
  const [profile] = useProfile();
  const [, setCoach] = useCoach();
  const [, setMistakes] = useMistakes();
  const toast = useToast();
  const [specId, setSpecId] = useState(profile.subjects[0]?.specId || '');
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState(6);
  const [scheme, setScheme] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [mark, setMark] = useState<AiMark | null>(null);
  const [logged, setLogged] = useState(false);
  const spec = specById(specId);
  const go = async () => {
    if (!spec) return;
    setBusy(true); setLogged(false);
    const res = await aiMark({ subject: spec.subject, board: spec.board, question: cleanText(question, 1500), marks, markScheme: cleanText(scheme, 3000) || undefined, answer: cleanText(answer, 5000) });
    setBusy(false);
    if (!res.ok) { toast(res.error); return; }
    const m = { ...res.data, score: Math.max(0, Math.min(marks, res.data.score)) };
    setMark(m);
    setCoach((c) => ({ attempts: c.attempts.concat({ id: uid(), specId, q: cleanText(question, 600), a: cleanText(answer, 3000), score: m.score, max: marks, feedback: cleanText(m.feedback, 1200), at: Date.now(), ai: true }).slice(-120) }));
  };
  return (
    <section className="panel panel-pad">
      <h2 style={{ marginBottom: 6 }}>Mark a written answer</h2>
      <p className="small muted" style={{ marginBottom: 14 }}>Paste a past-paper question and your answer. Add the mark scheme if you have it for a closer mark.</p>
      <div className="field-row">
        <div className="field"><label htmlFor="ms">Subject</label><select id="ms" className="select" value={specId} onChange={(e) => setSpecId(e.target.value)}>{profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}</select></div>
        <div className="field"><label htmlFor="mm">Marks</label><input id="mm" className="input num" type="number" min={1} max={30} value={marks} onChange={(e) => setMarks(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} /></div>
      </div>
      <div className="field"><label htmlFor="mq">Question</label><textarea id="mq" className="textarea" style={{ minHeight: 80 }} maxLength={1500} value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
      <div className="field"><label htmlFor="ma">Your answer</label><textarea id="ma" className="textarea" style={{ minHeight: 160 }} maxLength={5000} value={answer} onChange={(e) => setAnswer(e.target.value)} /></div>
      <div className="field"><label htmlFor="msc">Mark scheme (optional)</label><textarea id="msc" className="textarea" style={{ minHeight: 80 }} maxLength={3000} value={scheme} onChange={(e) => setScheme(e.target.value)} /></div>
      <button className="btn btn-primary" disabled={busy || !question.trim() || !answer.trim()} onClick={go}>{busy ? 'Marking…' : 'Mark it'}</button>
      {mark && (
        <>
          <div className="divider" />
          <div className="row between" style={{ marginBottom: 8 }}><h3>{mark.score} of {marks} marks</h3>
            <button className="btn btn-sm" disabled={logged} onClick={() => { setMistakes((l) => addMistakes(l, [newMistake({ specId, source: 'coach', kind: mark.mistakeKind === 'none' ? 'technique' : mark.mistakeKind, what: question, fix: mark.missed.join('; ') || mark.modelAnswer })])); setLogged(true); toast('Added to your mistake log'); }}>{logged ? 'In your mistake log' : 'Add to mistake log'}</button></div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{mark.feedback}</p>
          {mark.missed.length > 0 && <><h3 style={{ margin: '14px 0 6px' }}>What would have got the marks</h3><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{mark.missed.map((m) => <li key={m}>{m}</li>)}</ul></>}
          {mark.modelAnswer && <><h3 style={{ margin: '14px 0 6px' }}>Model answer</h3><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{mark.modelAnswer}</p></>}
          <p className="tiny faint" style={{ marginTop: 12 }}>AI marking is a guide, not an exam board mark.</p>
        </>
      )}
    </section>
  );
}
