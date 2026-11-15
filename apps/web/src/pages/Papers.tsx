import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Empty, Modal, colourVar, useToast } from '../components/ui';
import { IconExternal, IconLock, IconTimer } from '../components/icons';
import { BOARDS, gradeScale, pastSeries, specById, type Paper, type Spec } from '../catalog/catalog';
import { usePapers, useProfile } from '../lib/data';
import { pct, predictGrade, trend } from '../lib/grades';
import { fmtClock, fmtDay, today } from '../lib/dates';
import { uid } from '../lib/sanitize';
import { useAuth } from '../auth/AuthProvider';
import type { PaperLog } from '../lib/types';
import { MistakeModal } from '../components/MistakeModal';

export default function Papers() {
  const [profile] = useProfile();
  const [papers, setPapers] = usePapers();
  const auth = useAuth();
  const toast = useToast();
  const [specId, setSpecId] = useState(profile.subjects[0]?.specId || '');
  const [log, setLog] = useState<{ spec: Spec; paper: Paper; year: number; series: PaperLog['series']; timed?: number } | null>(null);
  const [mock, setMock] = useState<{ spec: Spec; paper: Paper; year: number; series: PaperLog['series'] } | null>(null);
  const [mistakeFor, setMistakeFor] = useState<PaperLog | null>(null);
  const spec = specById(specId);
  const choice = profile.subjects.find((s) => s.specId === specId);
  const logs = papers.logs.filter((l) => l.specId === specId);
  const tr = trend(logs);
  const pred = predictGrade(logs);

  if (!profile.subjects.length) return (<><Topbar title="Past papers" /><div className="content"><div className="panel"><Empty title="Add your subjects first" action={<Link className="btn btn-primary" to="/subjects">Add subjects</Link>}>Past papers are listed by your exact specification, so Hilite needs your subjects.</Empty></div></div></>);

  return (
    <>
      <Topbar title="Past papers" sub="Every series for your specs, with your marks tracked" />
      <div className="content stack">
        <div className="chips">{profile.subjects.map((s) => { const sp = specById(s.specId); return sp ? <button key={s.specId} className="chip" aria-pressed={s.specId === specId} onClick={() => setSpecId(s.specId)}><span className="dot" style={colourVar(s.colour)} />{sp.subject}</button> : null; })}</div>
        {spec && (
          <>
            <div className="grid">
              <div className="panel panel-pad c3"><div className="stat"><div className="v">{logs.length}</div><div className="k">papers logged</div></div></div>
              <div className="panel panel-pad c3"><div className="stat"><div className="v">{tr.avg == null ? '–' : tr.avg + '%'}</div><div className="k">average of last 5</div></div></div>
              <div className="panel panel-pad c3"><div className="stat"><div className="v" style={{ color: tr.change == null ? undefined : tr.change >= 0 ? 'var(--good)' : 'var(--bad)' }}>{tr.change == null ? '–' : (tr.change >= 0 ? '+' : '') + tr.change + '%'}</div><div className="k">since your previous paper</div></div></div>
              <div className="panel panel-pad c3"><div className="stat">
                {auth.plan === 'pro' ? <><div className="v">{pred ? pred.grade : '–'}</div><div className="k">{pred ? 'predicted grade, ' + pred.confidence + ' confidence' : 'log 2 graded papers for a prediction'}</div></>
                  : <><div className="v faint"><IconLock width={22} height={22} /></div><div className="k">Predicted grade is in <Link to="/upgrade">Pro</Link></div></>}
              </div></div>
            </div>
            <section className="panel">
              <div className="panel-head"><h2>{spec.board} {spec.qual} {spec.subject} <span className="muted small">({spec.code})</span></h2>
                <a className="btn btn-sm" href={BOARDS[spec.board].pastPapers} target="_blank" rel="noopener noreferrer">Open {BOARDS[spec.board].name} papers<IconExternal /></a></div>
              <div className="panel-body" style={{ paddingLeft: 0, paddingRight: 0, overflowX: 'auto' }}>
                <p className="small muted" style={{ padding: '0 20px 10px' }}>Papers open on the official {BOARDS[spec.board].name} site, so you always get the real paper and mark scheme. The most recent series are kept private by the board until they’re released.</p>
                <table className="table">
                  <thead><tr><th>Series</th><th>Paper</th><th>Your mark</th><th>Grade</th><th /></tr></thead>
                  <tbody>
                    {pastSeries(spec).flatMap((ser) => spec.papers.map((p) => {
                      const mine = logs.filter((l) => l.paperId === p.id && l.year === ser.year && l.series === ser.series).sort((a, b) => b.date.localeCompare(a.date))[0];
                      return (
                        <tr key={ser.year + ser.series + p.id}>
                          <td className="num" style={{ whiteSpace: 'nowrap' }}><b>{ser.series} {ser.year}</b>{!ser.isPublic && <div className="tiny faint">Not public yet</div>}</td>
                          <td>{p.name}{choice?.tier ? <span className="muted small">, {choice.tier === 'H' ? 'Higher' : 'Foundation'}</span> : null}</td>
                          <td className="num">{mine ? <><b>{mine.score}/{mine.max}</b> <span className="muted">({pct(mine)}%)</span></> : <span className="faint">–</span>}</td>
                          <td>{mine?.grade ? <span className="tag accent">{mine.grade}</span> : <span className="faint">–</span>}</td>
                          <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                            <button className="btn btn-sm btn-ghost" onClick={() => setMock({ spec, paper: p, year: ser.year, series: ser.series })}><IconTimer />Mock</button>
                            <button className="btn btn-sm" onClick={() => setLog({ spec, paper: p, year: ser.year, series: ser.series })}>{mine ? 'Log again' : 'Log mark'}</button>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </section>
            {logs.length > 0 && (
              <section className="panel">
                <div className="panel-head"><h2>History</h2></div>
                <div className="panel-body"><ul className="list">{logs.slice().sort((a, b) => b.date.localeCompare(a.date)).map((l) => (
                  <li key={l.id} className="item"><div className="grow"><div className="title">{l.series} {l.year}: {spec.papers.find((p) => p.id === l.paperId)?.name}</div><div className="meta"><span>{fmtDay(l.date)}</span>{l.timedMins && <span>Timed: {l.timedMins} min</span>}</div></div>
                    <b className="num">{pct(l)}%</b>{l.grade && <span className="tag accent">{l.grade}</span>}
                    <button className="btn btn-sm" onClick={() => setMistakeFor(l)}>Log mistakes</button>
                    <button className="btn btn-sm btn-ghost btn-danger" onClick={() => { setPapers((p) => ({ logs: p.logs.filter((x) => x.id !== l.id) })); toast('Removed'); }}>Remove</button></li>
                ))}</ul></div>
              </section>
            )}
          </>
        )}
      </div>
      {log && <LogModal {...log} onClose={() => setLog(null)} onSave={(entry) => { setPapers((p) => ({ logs: p.logs.concat(entry) })); setLog(null); toast('Mark saved'); if (entry.score < entry.max) setMistakeFor(entry); }} />}
      {mistakeFor && <MistakeModal source="paper" initial={{ specId: mistakeFor.specId, what: mistakeFor.series + ' ' + mistakeFor.year + ', ' + (specById(mistakeFor.specId)?.papers.find((p) => p.id === mistakeFor.paperId)?.name.split(':')[0] ?? 'Paper') + ', question ' }} onClose={() => setMistakeFor(null)} />}
      {mock && <MockMode {...mock} onClose={() => setMock(null)} onFinish={(mins) => { setLog({ ...mock, timed: mins }); setMock(null); }} />}
    </>
  );
}

function LogModal({ spec, paper, year, series, timed, onClose, onSave }: { spec: Spec; paper: Paper; year: number; series: PaperLog['series']; timed?: number; onClose: () => void; onSave: (l: PaperLog) => void }) {
  const [score, setScore] = useState('');
  const [max, setMax] = useState(paper.marks ? String(paper.marks) : '');
  const [grade, setGrade] = useState('');
  const [date, setDate] = useState(today());
  const ok = score !== '' && Number(max) > 0 && Number(score) >= 0 && Number(score) <= Number(max);
  return (
    <Modal title={'Log ' + series + ' ' + year + ', ' + paper.name.split(':')[0]} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" disabled={!ok} onClick={() => onSave({ id: uid(), specId: spec.id, paperId: paper.id, year, series, score: Number(score), max: Number(max), grade: grade || undefined, date, timedMins: timed })}>Save mark</button></>}>
      {timed && <div className="banner info" style={{ marginBottom: 14 }}><p>You took {timed} minutes. Mark it with the official mark scheme, then enter your score.</p></div>}
      <div className="field-row-3">
        <div className="field"><label htmlFor="sc">Mark</label><input id="sc" className="input num" type="number" min={0} value={score} onChange={(e) => setScore(e.target.value)} autoFocus /></div>
        <div className="field"><label htmlFor="mx">Out of</label><input id="mx" className="input num" type="number" min={1} value={max} onChange={(e) => setMax(e.target.value)} /></div>
        <div className="field"><label htmlFor="gr">Grade</label><select id="gr" className="select" value={grade} onChange={(e) => setGrade(e.target.value)}><option value="">Not sure</option>{gradeScale(spec.qual).map((g) => <option key={g}>{g}</option>)}</select></div>
      </div>
      <div className="field"><label htmlFor="dt">Date done</label><input id="dt" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <p className="small muted">For the grade, use that series’ grade boundaries from the board’s website. They’re published alongside the papers.</p>
    </Modal>
  );
}

function MockMode({ spec, paper, year, series, onClose, onFinish }: { spec: Spec; paper: Paper; year: number; series: string; onClose: () => void; onFinish: (mins: number) => void }) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const total = paper.mins * 60000;
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);
  const elapsed = startedAt ? now - startedAt : 0;
  const left = Math.max(0, total - elapsed);
  const fiveLeft = startedAt && left <= 5 * 60000 && left > 0;
  const mins = useMemo(() => Math.max(1, Math.round(elapsed / 60000)), [elapsed]);
  useEffect(() => { if (startedAt && left === 0) window.hiliteDesktop?.notify('Time’s up', spec.subject + ' ' + paper.name.split(':')[0]); }, [left, startedAt, spec, paper]);
  return (
    <Modal title="Mock exam" onClose={onClose} wide footer={startedAt ? <><button className="btn" onClick={onClose}>Abandon</button><button className="btn btn-primary" onClick={() => onFinish(mins)}>I’ve finished</button></> : <><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => setStartedAt(Date.now())}>Start the clock</button></>}>
      <p className="muted">{spec.board} {spec.subject}, {series} {year}, {paper.name} ({paper.code})</p>
      <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
        <div className="timer" style={{ color: left === 0 && startedAt ? 'var(--bad)' : undefined }}>{fmtClock(startedAt ? left : total)}</div>
        <p className="muted" style={{ marginTop: 10 }}>{!startedAt ? 'Real exam length: ' + paper.mins + ' minutes. Open the paper, put your phone away, then start.' : left === 0 ? 'Time’s up. Pens down.' : fiveLeft ? 'Five minutes left. Check your answers.' : 'Exam conditions: no notes, no breaks.'}</p>
      </div>
      {!startedAt && <a className="btn btn-block" href={BOARDS[spec.board].pastPapers} target="_blank" rel="noopener noreferrer">Find the paper on {BOARDS[spec.board].name}<IconExternal /></a>}
    </Modal>
  );
}
