import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Empty, Modal, colourVar, useToast } from '../components/ui';
import { IconDownload, IconEdit } from '../components/icons';
import { BOARDS, TIMETABLE_YEAR } from '../catalog/catalog';
import { clashes, daysUntil, toICS, type MySitting } from '../lib/exams';
import { useExamDates } from '../lib/data';
import { fmtDayLong, fmtMins, MONTHS, today } from '../lib/dates';
import { useSittings } from './hooks';

export default function Timetable() {
  const sittings = useSittings();
  const [, setDates] = useExamDates();
  const [editing, setEditing] = useState<MySitting | null>(null);
  const [showPast, setShowPast] = useState(false);
  const toast = useToast();
  const t = today();
  const dated = sittings.filter((s) => s.date && (showPast || s.date >= t));
  const missing = sittings.filter((s) => !s.date);
  const clash = clashes(sittings.filter((s) => s.date && s.date >= t));
  const boards = Array.from(new Set(sittings.map((s) => s.spec.board)));

  const groups = new Map<string, MySitting[]>();
  dated.forEach((s) => { const k = s.date!.slice(0, 7); groups.set(k, (groups.get(k) || []).concat(s)); });

  const download = () => {
    const blob = new Blob([toICS(sittings)], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'hilite-exams-' + TIMETABLE_YEAR + '.ics'; a.click();
    toast('Calendar file downloaded. Open it to add your exams.');
  };

  return (
    <>
      <Topbar title="Exam timetable" sub={'Summer ' + TIMETABLE_YEAR + ', ' + sittings.length + ' papers'}>
        <button className="btn" onClick={download} disabled={!dated.length}><IconDownload />Add to calendar</button>
      </Topbar>
      <div className="content stack">
        {!sittings.length && <div className="panel"><Empty title="No subjects yet" action={<Link className="btn btn-primary" to="/subjects">Add subjects</Link>}>Pick your exam boards and subjects, and every paper you’re sitting appears here with its date.</Empty></div>}
        {clash.length > 0 && clash.map(([a, b]) => (
          <div className="banner" key={a.key + b.key}><p><b>Possible clash on {fmtDayLong(a.date!)}.</b> {a.spec.subject} {a.paper.name} and {b.spec.subject} {b.paper.name} are both in the {a.session === 'AM' ? 'morning' : 'afternoon'}. Your school’s exams officer will sort out the timing, but it’s worth checking with them.</p></div>
        ))}
        {missing.length > 0 && (
          <section className="panel">
            <div className="panel-head"><h2>Papers without a date</h2></div>
            <div className="panel-body">
              <p className="small muted" style={{ marginBottom: 6 }}>Hilite doesn’t have official dates for these yet. Add them from your school’s exam timetable so your plan and countdowns are right.</p>
              <ul className="list">{missing.map((s) => (
                <li className="item" key={s.key}>
                  <span className="sub-tab" style={colourVar(s.colour)} />
                  <div className="grow"><div className="title">{s.spec.subject}: {s.paper.name}</div><div className="meta"><span>{s.spec.board} {s.paper.code}</span><span>{fmtMins(s.paper.mins)}</span></div></div>
                  <button className="btn btn-sm" onClick={() => setEditing(s)}>Add date</button>
                </li>
              ))}</ul>
            </div>
          </section>
        )}
        {Array.from(groups.entries()).map(([month, list]) => (
          <section className="panel" key={month}>
            <div className="panel-head"><h2>{MONTHS[Number(month.slice(5)) - 1]} {month.slice(0, 4)}</h2><span className="small muted">{list.length} papers</span></div>
            <div className="panel-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <table className="table">
                <thead><tr><th>Date</th><th>Paper</th><th>Code</th><th>Session</th><th>Length</th><th>Countdown</th><th /></tr></thead>
                <tbody>
                  {list.map((s) => {
                    const days = daysUntil(s.date!);
                    return (
                      <tr key={s.key}>
                        <td className="num" style={{ whiteSpace: 'nowrap' }}><b>{fmtDayLong(s.date!).replace(/ \d{4}$/, '')}</b></td>
                        <td><div className="row"><span className="sub-tab" style={{ ...colourVar(s.colour), height: 28 }} /><div><b>{s.spec.subject}</b><div className="small muted">{s.paper.name}{s.tier ? (s.tier === 'H' ? ', Higher' : ', Foundation') : ''}</div></div></div></td>
                        <td className="small muted num">{s.paper.code}</td>
                        <td>{s.session === 'AM' ? 'Morning' : 'Afternoon'}</td>
                        <td className="num">{fmtMins(s.paper.mins)}</td>
                        <td>{days < 0 ? <span className="tag">Done</span> : <span className={'tag num' + (days <= 7 ? ' hl' : '')}>{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days + ' days'}</span>}{s.custom && <span className="tag" style={{ marginLeft: 6 }}>Your date</span>}</td>
                        <td><button className="icon-btn" aria-label="Change date" onClick={() => setEditing(s)}><IconEdit /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        {sittings.some((s) => s.date && s.date < t) && <button className="link small" onClick={() => setShowPast(!showPast)}>{showPast ? 'Hide past papers' : 'Show papers already sat'}</button>}
        {boards.length > 0 && (
          <p className="small faint">Dates from: {boards.map((b) => BOARDS[b].timetableSource).join(' · ')}. Provisional dates can change, and your school confirms start times and rooms.</p>
        )}
      </div>
      {editing && <DateModal s={editing} onClose={() => setEditing(null)} onSave={(date, session) => {
        setDates((d) => { const n = { ...d }; if (date) n[editing.key] = { date, session }; else delete n[editing.key]; return n; });
        setEditing(null); toast(date ? 'Date saved' : 'Using the official date');
      }} hasOfficial={!!editing.paper.sitting} />}
    </>
  );
}

function DateModal({ s, onClose, onSave, hasOfficial }: { s: MySitting; onClose: () => void; onSave: (date: string | null, session: 'AM' | 'PM') => void; hasOfficial: boolean }) {
  const [date, setDate] = useState(s.date || '');
  const [session, setSession] = useState<'AM' | 'PM'>(s.session || 'AM');
  return (
    <Modal title={s.spec.subject + ': ' + s.paper.name} onClose={onClose} footer={<>
      {s.custom && hasOfficial && <button className="btn btn-ghost" onClick={() => onSave(null, session)}>Use official date</button>}
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" disabled={!date} onClick={() => onSave(date, session)}>Save date</button>
    </>}>
      <p className="small muted" style={{ marginBottom: 14 }}>{s.spec.board} {s.paper.code}, {fmtMins(s.paper.mins)}. {hasOfficial ? 'Only change this if your school has moved the paper.' : 'Copy the date from your school’s exam timetable.'}</p>
      <div className="field-row">
        <div className="field"><label htmlFor="dd">Date</label><input id="dd" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="field"><label htmlFor="ss">Session</label><select id="ss" className="select" value={session} onChange={(e) => setSession(e.target.value as 'AM' | 'PM')}><option value="AM">Morning</option><option value="PM">Afternoon</option></select></div>
      </div>
    </Modal>
  );
}
