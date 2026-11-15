import { useState } from 'react';
import { Modal, colourVar, useToast } from '../components/ui';
import { IconEdit, IconPlus } from '../components/icons';
import { specById } from '../catalog/catalog';
import { usePlanner, useProfile, useTests } from '../lib/data';
import { daysUntil } from '../lib/exams';
import { fmtDay, fmtMins, today } from '../lib/dates';
import { cleanText, uid } from '../lib/sanitize';
import type { OwnTest } from '../lib/types';
import { subjectName, useColourOf, useRebuildPlan } from './hooks';

/** The topic names a test covers, plus anything else the student wrote. */
export const testTopics = (x: OwnTest) => {
  const spec = specById(x.specId || '');
  return x.topics.map((i) => spec?.topics[i]).filter(Boolean).concat(x.extra ? [x.extra] : []) as string[];
};
export const countdownTag = (days: number) => <span className={'tag num' + (days <= 7 ? ' hl' : '')}>{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days + ' days'}</span>;

/** The "Your own tests" panel on the exam timetable: school tests, mocks and end-of-topic tests. */
export function OwnTestsPanel() {
  const [tests, setTests] = useTests();
  const [planner] = usePlanner();
  const rebuild = useRebuildPlan();
  const colourOf = useColourOf();
  const toast = useToast();
  const [editing, setEditing] = useState<OwnTest | 'new' | null>(null);
  const [showPast, setShowPast] = useState(false);
  const t = today();
  const sorted = tests.list.slice().sort((a, b) => a.date.localeCompare(b.date));
  const coming = sorted.filter((x) => x.date >= t);
  const past = sorted.filter((x) => x.date < t).reverse();

  const save = (x: OwnTest) => {
    const list = tests.list.some((y) => y.id === x.id) ? tests.list.map((y) => (y.id === x.id ? x : y)) : tests.list.concat(x);
    setTests({ list });
    setEditing(null);
    const planned = !!x.specId && x.topics.length > 0 && x.date > t;
    if (planned && planner.sessions.length) { rebuild(undefined, list); toast('Test saved. Revision for it is in your plan.'); }
    else toast(planned ? 'Test saved. Build your plan in the planner to add revision for it.' : 'Test saved');
  };
  const remove = (id: string) => {
    const list = tests.list.filter((y) => y.id !== id);
    setTests({ list });
    setEditing(null);
    if (planner.sessions.some((s) => s.testId === id && !s.done)) rebuild(undefined, list);
    toast('Test deleted');
  };

  const row = (x: OwnTest) => {
    const days = daysUntil(x.date);
    const topics = testTopics(x);
    return (
      <li className="item" key={x.id}>
        <div className={'datebox' + (days === 0 ? ' today' : '')}><span>{fmtDay(x.date).split(' ')[0]}</span><b>{Number(x.date.slice(8))}</b></div>
        <span className="sub-tab" style={colourVar(colourOf(x.specId))} />
        <div className="grow">
          <div className="title">{x.title}</div>
          <div className="meta">
            <span>{x.specId ? subjectName(x.specId) : 'No subject'}</span>
            <span className="num">{fmtDay(x.date)}{x.session ? (x.session === 'AM' ? ', morning' : ', afternoon') : ''}</span>
            {x.mins ? <span className="num">{fmtMins(x.mins)}</span> : null}
            {x.score != null && x.max ? <span className="tag num">{x.score}/{x.max}, {Math.round((x.score / x.max) * 100)}%</span> : null}
          </div>
          {topics.length > 0 && <div className="small muted" style={{ marginTop: 3 }}>Covers {topics.join(', ')}</div>}
        </div>
        {days >= 0 ? countdownTag(days) : x.score == null && <button className="btn btn-sm" onClick={() => setEditing(x)}>Log your mark</button>}
        <button className="icon-btn" aria-label={'Edit ' + x.title} onClick={() => setEditing(x)}><IconEdit /></button>
      </li>
    );
  };

  return (
    <section className="panel">
      <div className="panel-head"><h2>Your own tests</h2><button className="btn btn-sm" onClick={() => setEditing('new')}><IconPlus />Add a test</button></div>
      <div className="panel-body">
        {!coming.length && <p className="small muted">Add school tests, mocks and end-of-topic tests. Pick the topics each one covers and Hilite adds revision for them to your plan.</p>}
        <ul className="list">{coming.map(row)}</ul>
        {past.length > 0 && <button className="link small" style={{ marginTop: 8 }} onClick={() => setShowPast(!showPast)}>{showPast ? 'Hide past tests' : 'Show past tests (' + past.length + ')'}</button>}
        {showPast && <ul className="list">{past.map(row)}</ul>}
      </div>
      {editing && <TestModal initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={save} onDelete={remove} />}
    </section>
  );
}

function TestModal({ initial, onClose, onSave, onDelete }: { initial: OwnTest | null; onClose: () => void; onSave: (x: OwnTest) => void; onDelete: (id: string) => void }) {
  const [profile] = useProfile();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [specId, setSpecId] = useState(initial?.specId ?? profile.subjects[0]?.specId ?? '');
  const [topics, setTopics] = useState<number[]>(initial?.topics ?? []);
  const [extra, setExtra] = useState(initial?.extra ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [session, setSession] = useState<OwnTest['session']>(initial?.session ?? '');
  const [mins, setMins] = useState(initial?.mins ? String(initial.mins) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [score, setScore] = useState(initial?.score != null ? String(initial.score) : '');
  const [max, setMax] = useState(initial?.max != null ? String(initial.max) : '');
  const spec = specById(specId);
  const isPast = !!date && date < today();
  const num = (v: string, hi: number) => { const n = Math.round(Number(v)); return v.trim() && Number.isFinite(n) && n >= 0 && n <= hi ? n : undefined; };
  const markOk = !score || (num(score, 1000) != null && num(max, 1000) != null && Number(score) <= Number(max));
  const ok = !!cleanText(title) && !!date && markOk;
  const toggle = (i: number) => setTopics(topics.indexOf(i) >= 0 ? topics.filter((x) => x !== i) : topics.concat(i).sort((a, b) => a - b));

  const submit = () => onSave({
    id: initial?.id ?? uid(), title: cleanText(title, 80), specId: specId || undefined,
    topics: spec ? topics.filter((i) => i < spec.topics.length) : [], extra: cleanText(extra, 200),
    date, session, mins: num(mins, 600) || undefined, notes: cleanText(notes, 1000),
    score: isPast ? num(score, 1000) : undefined, max: isPast ? num(max, 1000) : undefined,
  });

  return (
    <Modal title={initial ? 'Edit test' : 'Add a test'} onClose={onClose} footer={<>
      {initial && <button className="btn btn-ghost btn-danger" style={{ marginRight: 'auto' }} onClick={() => onDelete(initial.id)}>Delete</button>}
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" disabled={!ok} onClick={submit}>{initial ? 'Save' : 'Add test'}</button>
    </>}>
      <div className="field"><label htmlFor="tt">Name</label><input id="tt" className="input" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Year 11 biology mock" autoFocus /></div>
      <div className="field"><label htmlFor="tsub">Subject</label>
        <select id="tsub" className="select" value={specId} onChange={(e) => { setSpecId(e.target.value); setTopics([]); }}>
          <option value="">No subject</option>
          {profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}
        </select></div>
      <div className="field-row-3">
        <div className="field"><label htmlFor="td">Date</label><input id="td" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="field"><label htmlFor="ts">Session</label>
          <select id="ts" className="select" value={session} onChange={(e) => setSession(e.target.value as OwnTest['session'])}>
            <option value="">Not sure</option><option value="AM">Morning</option><option value="PM">Afternoon</option>
          </select></div>
        <div className="field"><label htmlFor="tm">Length (minutes)</label><input id="tm" className="input num" inputMode="numeric" maxLength={3} value={mins} onChange={(e) => setMins(e.target.value.replace(/\D/g, ''))} placeholder="Optional" /></div>
      </div>
      {spec && (
        <div className="field"><span className="label">Topics it covers</span>
          <div className="chips">{spec.topics.map((name, i) => <button key={i} type="button" className="chip" aria-pressed={topics.indexOf(i) >= 0} onClick={() => toggle(i)}>{name}</button>)}</div>
          <span className="hint">Hilite plans a blurt and a set of exam questions for each topic you pick, before the test.</span>
        </div>
      )}
      <div className="field"><label htmlFor="tx">Anything else it covers</label><input id="tx" className="input" maxLength={200} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g. Required practicals 1 to 4" /></div>
      <div className="field"><label htmlFor="tn">Notes</label><textarea id="tn" className="textarea" style={{ minHeight: 70 }} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Room, what to bring, what your teacher said to focus on" /></div>
      {isPast && (
        <div className="field-row">
          <div className="field"><label htmlFor="tsc">Your mark</label><input id="tsc" className="input num" inputMode="numeric" maxLength={4} value={score} onChange={(e) => setScore(e.target.value.replace(/\D/g, ''))} /></div>
          <div className="field"><label htmlFor="tmx">Out of</label><input id="tmx" className="input num" inputMode="numeric" maxLength={4} value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} /></div>
        </div>
      )}
    </Modal>
  );
}
