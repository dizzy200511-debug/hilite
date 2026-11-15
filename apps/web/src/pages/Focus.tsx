import { useState } from 'react';
import { Topbar } from '../components/Shell';
import { Bars, Modal, Seg } from '../components/ui';
import { useFocus, useProfile } from '../lib/data';
import { timer, useTimer, type TimerMode } from '../lib/timer';
import { addDays, DAY_NAMES, fmtClock, fmtMins, studyDayOf, today } from '../lib/dates';
import { subjectName } from './hooks';

export function minsOn(sessions: { s: number; m: number }[], day: string) {
  return sessions.filter((x) => studyDayOf(x.s) === day).reduce((a, x) => a + x.m, 0);
}

export function streak(sessions: { s: number; m: number }[]) {
  const days = new Set(sessions.map((x) => studyDayOf(x.s)));
  let n = 0, d = today();
  if (!days.has(d)) d = addDays(d, -1);
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

export default function Focus() {
  const t = useTimer();
  const [focus, setFocus] = useFocus();
  const [profile] = useProfile();
  const [editing, setEditing] = useState(false);
  const todayMins = minsOn(focus.sessions, today());
  const vals: number[] = [], labels: string[] = [];
  for (let i = 6; i >= 0; i--) { const k = addDays(today(), -i); vals.push(minsOn(focus.sessions, k)); labels.push(i === 0 ? 'Today' : DAY_NAMES[new Date(k + 'T12:00').getDay()].slice(0, 3)); }
  const ring = 1 - t.left / Math.max(1, t.total);
  const recent = focus.sessions.slice(-8).reverse();
  return (
    <>
      <Topbar title="Focus timer" sub={'Focus for ' + focus.work + ' minutes, then take a ' + focus.brk + '-minute break'}>
        <button className="btn" onClick={() => setEditing(true)}>Timer settings</button>
      </Topbar>
      <div className="content">
        <div className="grid">
          <section className="panel panel-pad c8" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
              <Seg label="Timer mode" value={t.mode} onChange={(m: TimerMode) => timer.setMode(m)} options={[['work', 'Focus'], ['short', 'Short break'], ['long', 'Long break']]} />
            </div>
            <div className="timer" aria-live="off">{fmtClock(t.left)}</div>
            <div className="meter" style={{ maxWidth: 360, margin: '22px auto 0' }}><i style={{ width: Math.round(ring * 100) + '%' }} /></div>
            <div className="row" style={{ justifyContent: 'center', marginTop: 26 }}>
              {t.running ? <button className="btn btn-lg" onClick={timer.pause}>Pause</button> : <button className="btn btn-primary btn-lg" style={{ minWidth: 140 }} onClick={timer.start}>{t.startedAt ? 'Resume' : 'Start'}</button>}
              {(t.running || t.startedAt) && <button className="btn btn-lg btn-ghost" onClick={timer.stop}>Stop</button>}
            </div>
            <div className="row" style={{ justifyContent: 'center', marginTop: 22 }}>
              <label className="small muted" htmlFor="tsub">Studying</label>
              <select id="tsub" className="select" style={{ width: 'auto', height: 34 }} value={t.specId || ''} onChange={(e) => timer.setSubject(e.target.value || undefined)}>
                <option value="">No particular subject</option>
                {profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}
              </select>
            </div>
            <p className="small faint" style={{ marginTop: 18 }}>Session {(t.count % focus.every) + 1} of {focus.every} before a long break. The timer keeps running if you switch pages{window.hiliteDesktop ? ', and shows in the taskbar tray.' : '.'}</p>
          </section>
          <section className="panel c4">
            <div className="panel-head"><h2>Today</h2></div>
            <div className="panel-body">
              <div className="stat" style={{ marginBottom: 14 }}><div className="v">{fmtMins(todayMins)}</div><div className="k">of {fmtMins(profile.dailyGoalMins)} goal</div></div>
              <div className="meter"><i style={{ width: Math.min(100, Math.round((todayMins / Math.max(1, profile.dailyGoalMins)) * 100)) + '%' }} /></div>
              <div className="stat" style={{ marginTop: 20 }}><div className="v">{streak(focus.sessions)}</div><div className="k">day streak</div></div>
            </div>
          </section>
          <section className="panel panel-pad c8"><h3 style={{ marginBottom: 12 }}>Last 7 days</h3><Bars values={vals} labels={labels} unit="mins" /></section>
          <section className="panel c4">
            <div className="panel-head"><h2>Recent sessions</h2></div>
            <div className="panel-body">{!recent.length ? <p className="small muted">Sessions you finish appear here.</p> : <ul className="list">{recent.map((x) => (
              <li key={x.s} className="item"><div className="grow"><div className="title">{subjectName(x.specId)}</div><div className="meta">{new Date(x.s).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</div></div><span className="num small">{fmtMins(x.m)}</span></li>
            ))}</ul>}</div>
          </section>
        </div>
      </div>
      {editing && <TimerSettings value={focus} onClose={() => setEditing(false)} onSave={(v) => { setFocus((f) => ({ ...f, ...v })); timer.refresh(); setEditing(false); }} />}
    </>
  );
}

function TimerSettings({ value, onClose, onSave }: { value: { work: number; brk: number; lbrk: number; every: number }; onClose: () => void; onSave: (v: { work: number; brk: number; lbrk: number; every: number }) => void }) {
  const [v, setV] = useState({ work: value.work, brk: value.brk, lbrk: value.lbrk, every: value.every });
  const num = (k: keyof typeof v, label: string, min: number, max: number) => (
    <div className="field"><label htmlFor={'t' + k}>{label}</label><input id={'t' + k} className="input" type="number" min={min} max={max} value={v[k]} onChange={(e) => setV({ ...v, [k]: Math.max(min, Math.min(max, Number(e.target.value) || min)) })} /></div>
  );
  return (
    <Modal title="Timer settings" onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(v)}>Save</button></>}>
      <div className="field-row">{num('work', 'Focus (minutes)', 5, 120)}{num('brk', 'Short break (minutes)', 1, 30)}</div>
      <div className="field-row">{num('lbrk', 'Long break (minutes)', 5, 60)}{num('every', 'Long break every', 2, 8)}</div>
    </Modal>
  );
}
