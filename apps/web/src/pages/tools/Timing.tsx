import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { useSittings } from '../hooks';

const pad = (n: number) => (n < 10 ? '0' : '') + n;
const clock = (start: string, mins: number) => {
  const [h, m] = start.split(':').map(Number);
  const t = (h * 60 + m + Math.round(mins)) % 1440;
  return pad(Math.floor(t / 60)) + ':' + pad(t % 60);
};

export default function Timing() {
  const sittings = useSittings();
  const papers = sittings.filter((s) => s.paper.marks);
  const [key, setKey] = useState(papers[0]?.key || '');
  const chosen = papers.find((p) => p.key === key);
  const [mins, setMins] = useState(chosen?.paper.mins || 90);
  const [marks, setMarks] = useState(chosen?.paper.marks || 80);
  const [check, setCheck] = useState(5);
  const [start, setStart] = useState(chosen?.session === 'PM' ? '13:30' : '09:00');
  const [qs, setQs] = useState('');
  const per = Math.max(0, mins - check) / Math.max(1, marks);
  const list = qs.split(/[\s,]+/).map(Number).filter((n) => n > 0 && n <= 100);
  let run = 0;

  return (
    <>
      <Topbar title="Exam timing" sub="Minutes per mark and checkpoints, so you finish with time to check">
        <Link className="btn btn-ghost" to="/guides/timing">Timing guide</Link>
      </Topbar>
      <div className="content stack" style={{ maxWidth: 860 }}>
        <section className="panel panel-pad">
          {papers.length > 0 && (
            <div className="field"><label htmlFor="pp">Your paper</label>
              <select id="pp" className="select" value={key} onChange={(e) => { const p = papers.find((x) => x.key === e.target.value); setKey(e.target.value); if (p) { setMins(p.paper.mins); setMarks(p.paper.marks || marks); setStart(p.session === 'PM' ? '13:30' : '09:00'); } }}>
                {papers.map((p) => <option key={p.key} value={p.key}>{p.spec.subject}: {p.paper.name}</option>)}
                <option value="">Something else</option>
              </select></div>
          )}
          <div className="field-row-3">
            <div className="field"><label htmlFor="tm">Minutes</label><input id="tm" className="input num" type="number" min={10} max={300} value={mins} onChange={(e) => setMins(Number(e.target.value))} /></div>
            <div className="field"><label htmlFor="mk">Marks</label><input id="mk" className="input num" type="number" min={1} max={300} value={marks} onChange={(e) => setMarks(Number(e.target.value))} /></div>
            <div className="field"><label htmlFor="ck">Checking time (minutes)</label><input id="ck" className="input num" type="number" min={0} max={30} value={check} onChange={(e) => setCheck(Number(e.target.value))} /></div>
          </div>
          <div className="row wrap" style={{ gap: 32 }}>
            <div className="stat"><div className="v">{per.toFixed(1)}</div><div className="k">minutes per mark</div></div>
            <div className="stat"><div className="v">{Math.round(per * 6)}</div><div className="k">minutes for a 6-mark question</div></div>
            <div className="stat"><div className="v">{clock(start, (mins - check) / 2)}</div><div className="k">be halfway by</div></div>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>Check your school’s timetable for the exact start time. The times here assume the exam starts at the time below.</p>
        </section>
        <section className="panel panel-pad">
          <div className="field-row">
            <div className="field"><label htmlFor="st">Start time</label><input id="st" className="input" type="time" value={start} onChange={(e) => setStart(e.target.value || '09:00')} /></div>
            <div className="field"><label htmlFor="qs">Marks for each question, in order</label><input id="qs" className="input" value={qs} onChange={(e) => setQs(e.target.value)} placeholder="e.g. 4, 6, 3, 9, 12" /></div>
          </div>
          {list.length > 0 && (
            <table className="table" style={{ marginTop: 6 }}><thead><tr><th>Question</th><th>Marks</th><th>Time to spend</th><th>Finish by</th></tr></thead>
              <tbody>{list.map((m, n) => { run += m * per; return <tr key={n}><td>{n + 1}</td><td className="num">{m}</td><td className="num">{Math.round(m * per)} min</td><td className="num">{clock(start, run)}</td></tr>; })}</tbody></table>
          )}
        </section>
      </div>
    </>
  );
}
