import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Empty, Modal, Tick, colourVar, useToast } from '../components/ui';
import { IconArrowLeft, IconPlus } from '../components/icons';
import { usePlanner, useProfile } from '../lib/data';
import { missedSessions } from '../lib/planner';
import { PRESETS, presetFor, type PresetId } from '../lib/presets';
import { FREE_PRESETS, effectivePreset } from '../lib/pro';
import { SpecPoints } from '../components/SpecPoints';
import { hasSpecContent } from '../content/spec';
import { guideById } from '../content/guides';
import { addDays, DAY_NAMES, fmtDay, fmtMins, isWeekend, today } from '../lib/dates';
import { METHODS, type Session, type Task } from '../lib/types';
import { cleanText, uid } from '../lib/sanitize';
import { specById } from '../catalog/catalog';
import { sessionTopic, subjectName, toolLink, useColourOf, usePro, useRebuildPlan, useSittings } from './hooks';

export default function Planner() {
  const [planner, setPlanner] = usePlanner();
  const [profile, setProfile] = useProfile();
  const sittings = useSittings();
  const rebuildPlan = useRebuildPlan();
  const pro = usePro();
  const [params, setParams] = useSearchParams();
  const [style, setStyle] = useState(params.get('style') === '1');
  const colourOf = useColourOf();
  const toast = useToast();
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState<Session | null>(null);
  const [taskModal, setTaskModal] = useState<Task | 'new' | null>(null);
  const [settings, setSettings] = useState(false);
  const t = today();
  const start = addDays(t, offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const missed = missedSessions(planner.sessions);
  const dated = sittings.filter((s) => s.date && s.date > t);
  const totalLeft = planner.sessions.filter((s) => !s.done && s.day >= t).length;

  const rebuild = (silent?: boolean) => {
    rebuildPlan();
    if (!silent) toast('Plan rebuilt around your exams');
  };
  const shownPreset = effectivePreset(profile.planPreset, pro);
  const presetName = shownPreset === 'auto' ? 'Auto' : PRESETS.find((p) => p.id === shownPreset)?.name;
  const toggle = (id: string) => setPlanner((p) => ({ ...p, sessions: p.sessions.map((s) => (s.id === id ? { ...s, done: !s.done, doneAt: !s.done ? Date.now() : undefined } : s)) }));
  const move = (id: string, day: string) => setPlanner((p) => ({ ...p, sessions: p.sessions.map((s) => (s.id === id ? { ...s, day } : s)) }));
  const toggleTask = (id: string) => setPlanner((p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === id ? { ...x, done: x.done ? 0 : Date.now() } : x)) }));

  const cap = (k: string) => (isWeekend(k) ? profile.weekendMins : profile.weekdayMins);
  const examsOn = (k: string) => sittings.filter((s) => s.date === k);

  return (
    <>
      <Topbar title="Revision planner" sub={planner.sessions.length ? totalLeft + ' sessions left before your exams. Plan style: ' + presetName + (pro && profile.adaptive ? ', adapted to your weak topics' : '') : 'A day-by-day plan built from your exam dates'}>
        <button className="btn" onClick={() => setTaskModal('new')}><IconPlus />Add task</button>
        <button className="btn" onClick={() => setStyle(true)}>Plan style</button>
        <button className="btn" onClick={() => setSettings(true)}>Study time</button>
        {planner.sessions.length > 0 && <button className="btn btn-primary" onClick={() => rebuild()}>Rebuild plan</button>}
      </Topbar>
      <div className="content stack">
        {!planner.sessions.length ? (
          <div className="panel">
            {dated.length ? (
              <Empty title="Build your revision plan" action={<button className="btn btn-primary btn-lg" onClick={() => rebuild()}>Build my plan</button>}>
                Hilite schedules every topic for your {dated.length} upcoming papers. Each topic is learnt, then revisited with active methods like flashcards, blurting, exam questions and teach-back, spaced out so it sticks. Red topics from your checklist get extra sessions. Plan style: {presetName}. <button className="link" onClick={() => setStyle(true)}>Change it</button>
              </Empty>
            ) : (
              <Empty title="Add your exams first" action={<Link className="btn btn-primary" to="/subjects">Add subjects</Link>}>The planner works backwards from your exam dates, so it needs your subjects first.</Empty>
            )}
          </div>
        ) : (
          <>
            {missed.length > 0 && <div className="banner"><p><b>{missed.length} {missed.length === 1 ? 'session' : 'sessions'} missed.</b> Rebuilding fits them back in before the exam, keeping everything you’ve done.</p><button className="btn btn-sm" onClick={() => rebuild()}>Fit them back in</button></div>}
            <div className="row between">
              <div className="row">
                <button className="icon-btn" aria-label="Previous week" disabled={offset <= 0} onClick={() => setOffset(offset - 1)}><IconArrowLeft /></button>
                <b>{fmtDay(days[0])} to {fmtDay(days[6])}</b>
                <button className="icon-btn" aria-label="Next week" onClick={() => setOffset(offset + 1)} style={{ transform: 'scaleX(-1)' }}><IconArrowLeft /></button>
              </div>
              {offset > 0 && <button className="btn btn-sm btn-ghost" onClick={() => setOffset(0)}>This week</button>}
            </div>
            <div className="week">
              {days.map((k) => {
                const list = planner.sessions.filter((s) => s.day === k);
                const tasks = planner.tasks.filter((x) => x.due === k);
                const mins = list.reduce((a, s) => a + s.mins, 0);
                const exams = examsOn(k);
                return (
                  <div key={k} className={'day' + (k === t ? ' is-today' : '')}>
                    <div className="day-h"><b>{k === t ? 'Today' : DAY_NAMES[new Date(k + 'T12:00').getDay()]}</b><span className="tiny muted num">{fmtDay(k).slice(4)}</span></div>
                    {exams.map((e) => <div key={e.key} className="tag hl" style={{ justifyContent: 'flex-start', whiteSpace: 'normal' }}>Exam: {e.spec.subject} {e.paper.name.split(':')[0]}</div>)}
                    {list.map((s) => (
                      <div key={s.id} className={'block' + (s.done ? ' done' : '')} style={colourVar(colourOf(s.specId))} onClick={() => setOpen(s)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(s); }}>
                        <b>{sessionTopic(s)}</b>
                        <span>{METHODS[s.method].name}, {fmtMins(s.mins)}</span>
                      </div>
                    ))}
                    {tasks.map((x) => (
                      <div key={x.id} className={'block' + (x.done ? ' done' : '')} style={colourVar(colourOf(x.specId))} onClick={() => setTaskModal(x)} role="button" tabIndex={0}>
                        <b>{x.title}</b><span>Task, {fmtMins(x.mins)}</span>
                      </div>
                    ))}
                    {!list.length && !tasks.length && !exams.length && <span className="small faint">{profile.restDays.indexOf(new Date(k + 'T12:00').getDay()) >= 0 ? 'Rest day' : 'Free'}</span>}
                    <span className="tiny faint num" style={{ marginTop: 'auto' }}>{fmtMins(mins)} of {fmtMins(cap(k))}</span>
                  </div>
                );
              })}
            </div>
            {planner.tasks.filter((x) => !x.done).length > 0 && (
              <section className="panel">
                <div className="panel-head"><h2>Your tasks</h2></div>
                <div className="panel-body"><ul className="list">{planner.tasks.filter((x) => !x.done).map((x) => (
                  <li key={x.id} className="item"><Tick on={false} onClick={() => toggleTask(x.id)} label="Mark as done" /><span className="sub-tab" style={colourVar(colourOf(x.specId))} />
                    <div className="grow"><div className="title">{x.title}</div><div className="meta"><span>{x.specId ? subjectName(x.specId) : 'General'}</span>{x.due && <span>Due {fmtDay(x.due)}</span>}<span>{fmtMins(x.mins)}</span></div></div>
                    <button className="btn btn-sm btn-ghost" onClick={() => setTaskModal(x)}>Edit</button></li>
                ))}</ul></div>
              </section>
            )}
          </>
        )}
      </div>

      {open && (() => {
        const s = planner.sessions.find((x) => x.id === open.id) || open;
        const spec = specById(s.specId);
        return (
          <Modal title={sessionTopic(s)} onClose={() => setOpen(null)} footer={<>
            <select className="select" style={{ width: 'auto', height: 36 }} value={s.day} onChange={(e) => { move(s.id, e.target.value); toast('Moved to ' + fmtDay(e.target.value)); }} aria-label="Move to day">
              {Array.from({ length: 30 }, (_, i) => addDays(t, i)).map((k) => <option key={k} value={k}>{fmtDay(k)}</option>)}
            </select>
            <button className={'btn ' + (s.done ? '' : 'btn-primary')} onClick={() => { toggle(s.id); setOpen(null); }}>{s.done ? 'Mark as not done' : 'Mark as done'}</button>
          </>}>
            <p className="small muted" style={{ marginBottom: 12 }}>{spec?.board} {spec?.subject}, {fmtDay(s.day)}, {fmtMins(s.mins)}</p>
            <h3 style={{ marginBottom: 6 }}>{METHODS[s.method].name}</h3>
            <p style={{ marginBottom: 14 }}>{METHODS[s.method].how}</p>
            {s.topic >= 0 && hasSpecContent(s.specId) && <details style={{ marginBottom: 14 }}><summary className="small" style={{ cursor: 'pointer', fontWeight: 600 }}>What this topic covers</summary><SpecPoints specId={s.specId} topic={s.topic} /></details>}
            <div className="row wrap">
              {METHODS[s.method].pro && !pro ? <Link className="btn btn-sm" to="/upgrade" onClick={() => setOpen(null)}>AI practice is in Pro</Link>
                : <Link className="btn btn-sm btn-primary" to={toolLink(s.method, s.specId, s.topic)} onClick={() => setOpen(null)}>Start</Link>}
              <Link className="btn btn-sm" to={'/guides/' + METHODS[s.method].guide} onClick={() => setOpen(null)}>Guide: {guideById(METHODS[s.method].guide)?.title}</Link>
              <Link className="btn btn-sm" to="/focus" onClick={() => setOpen(null)}>Start a focus timer</Link>
            </div>
          </Modal>
        );
      })()}
      {taskModal && <TaskModal task={taskModal === 'new' ? null : taskModal} onClose={() => setTaskModal(null)} onSave={(x, del) => {
        setPlanner((p) => ({ ...p, tasks: del ? p.tasks.filter((y) => y.id !== x.id) : p.tasks.some((y) => y.id === x.id) ? p.tasks.map((y) => (y.id === x.id ? x : y)) : p.tasks.concat(x) }));
        setTaskModal(null); toast(del ? 'Task deleted' : 'Task saved');
      }} />}
      {settings && <StudyTimeModal onClose={() => setSettings(false)} onSave={(v) => { setProfile((p) => ({ ...p, ...v })); setSettings(false); rebuildPlan(v); toast('Study time saved and plan rebuilt'); }} />}
      {style && <PresetModal onClose={() => { setStyle(false); if (params.get('style')) setParams({}); }} onSave={(planPreset) => {
        setProfile((p) => ({ ...p, planPreset })); setStyle(false); if (params.get('style')) setParams({});
        if (planner.sessions.length || dated.length) { rebuildPlan({ planPreset }); toast('Plan style saved and plan rebuilt'); } else toast('Plan style saved');
      }} />}
    </>
  );
}

function TaskModal({ task, onClose, onSave }: { task: Task | null; onClose: () => void; onSave: (t: Task, del?: boolean) => void }) {
  const [profile] = useProfile();
  const [title, setTitle] = useState(task?.title || '');
  const [specId, setSpecId] = useState(task?.specId || '');
  const [due, setDue] = useState(task?.due || '');
  const [mins, setMins] = useState(task?.mins || 30);
  return (
    <Modal title={task ? 'Edit task' : 'Add a task'} onClose={onClose} footer={<>
      {task && <button className="btn btn-danger btn-ghost" onClick={() => onSave(task, true)}>Delete</button>}
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" disabled={!cleanText(title)} onClick={() => onSave({ id: task?.id || uid(), title: cleanText(title, 140), specId: specId || undefined, due: due || undefined, mins: Math.max(5, Math.min(600, mins)), done: task?.done || 0 })}>Save</button>
    </>}>
      <div className="field"><label htmlFor="tt">Task</label><input id="tt" className="input" maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish the Macbeth essay plan" autoFocus /></div>
      <div className="field-row-3">
        <div className="field"><label htmlFor="ts">Subject</label><select id="ts" className="select" value={specId} onChange={(e) => setSpecId(e.target.value)}><option value="">None</option>{profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}</select></div>
        <div className="field"><label htmlFor="td">Due</label><input id="td" className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
        <div className="field"><label htmlFor="tm">Minutes</label><input id="tm" className="input" type="number" min={5} max={600} value={mins} onChange={(e) => setMins(Number(e.target.value))} /></div>
      </div>
    </Modal>
  );
}

export function StudyTimeModal({ onClose, onSave }: { onClose: () => void; onSave: (v: { weekdayMins: number; weekendMins: number; sessionMins: number; restDays: number[] }) => void }) {
  const [profile] = useProfile();
  const [wd, setWd] = useState(profile.weekdayMins);
  const [we, setWe] = useState(profile.weekendMins);
  const [len, setLen] = useState(profile.sessionMins);
  const [rest, setRest] = useState<number[]>(profile.restDays);
  return (
    <Modal title="Study time" onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave({ weekdayMins: wd, weekendMins: we, sessionMins: len, restDays: rest })}>Save and rebuild</button></>}>
      <div className="field-row-3">
        <div className="field"><label htmlFor="wd">Weekdays (minutes)</label><input id="wd" className="input" type="number" min={0} max={600} value={wd} onChange={(e) => setWd(Number(e.target.value))} /></div>
        <div className="field"><label htmlFor="we">Weekends (minutes)</label><input id="we" className="input" type="number" min={0} max={900} value={we} onChange={(e) => setWe(Number(e.target.value))} /></div>
        <div className="field"><label htmlFor="ln">Session length</label><select id="ln" className="select" value={len} onChange={(e) => setLen(Number(e.target.value))}>{[20, 25, 30, 40, 45, 60].map((n) => <option key={n} value={n}>{n} min</option>)}</select></div>
      </div>
      <div className="field"><span className="label">Rest days</span>
        <div className="chips">{DAY_NAMES.map((d, i) => <button key={d} className="chip" aria-pressed={rest.indexOf(i) >= 0} onClick={() => setRest(rest.indexOf(i) >= 0 ? rest.filter((x) => x !== i) : rest.concat(i))}>{d}</button>)}</div>
        <span className="hint">No revision is planned on rest days. Leave them all off to revise every day.</span>
      </div>
    </Modal>
  );
}

export function PresetModal({ onClose, onSave }: { onClose: () => void; onSave: (id: PresetId) => void }) {
  const [profile] = useProfile();
  const sittings = useSittings();
  const pro = usePro();
  const [pick, setPick] = useState<PresetId>(effectivePreset(profile.planPreset, pro));
  const specs = Array.from(new Map(sittings.map((s) => [s.spec.id, s.spec])).values());
  const options: [PresetId, string, string, string][] = [
    ['auto', 'Auto (recommended)', 'Matches each subject to the style that suits how it’s examined.',
      specs.length ? specs.map((sp) => sp.subject + ': ' + presetFor('auto', sp).name).join(', ') : 'Practice heavy for maths and sciences, Essay subjects for English and humanities, Little and often for languages.'],
    ...PRESETS.map((p) => [p.id, p.name, p.summary, p.bestFor] as [PresetId, string, string, string]),
  ];
  return (
    <Modal title="Plan style" wide onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(pick)}>Save and rebuild</button></>}>
      <p className="small muted" style={{ marginBottom: 12 }}>Each style is a sequence of revision methods for every topic, spaced out before your exams. Sessions you’ve done are kept when you switch. <Link to="/guides/building-a-plan" onClick={onClose}>How the plans work</Link></p>
      <ul className="list">
        {options.map(([id, name, summary, best]) => {
          const locked = !pro && !FREE_PRESETS.includes(id);
          return (
            <li key={id} className="item" style={{ alignItems: 'flex-start', cursor: locked ? 'default' : 'pointer' }} onClick={() => { if (!locked) setPick(id); }}>
              <input type="radio" name="preset" checked={pick === id} disabled={locked} onChange={() => setPick(id)} aria-label={name} style={{ marginTop: 4, accentColor: 'var(--accent)', width: 16, height: 16 }} />
              <div className="grow" style={locked ? { opacity: 0.7 } : undefined}><div className="title">{name}</div><div className="small" style={{ color: 'var(--ink-2)' }}>{summary}</div><div className="small muted">{best}</div></div>
              {locked && <Link className="tag accent" to="/upgrade" onClick={onClose}>Pro</Link>}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
