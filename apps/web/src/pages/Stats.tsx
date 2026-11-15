import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Bars, colourVar } from '../components/ui';
import { IconLock } from '../components/icons';
import { useAuth } from '../auth/AuthProvider';
import { useChecklist, useDecks, useFocus, usePapers, usePlanner, useProfile } from '../lib/data';
import { addDays, DAY_NAMES, fmtMins, today } from '../lib/dates';
import { pct, predictGrade, trend } from '../lib/grades';
import { specById } from '../catalog/catalog';
import { store } from '../lib/store';
import { emptyDeck, type DeckData } from '../lib/types';
import { minsOn, streak } from './Focus';
import { subjectName } from './hooks';

export default function Stats() {
  const auth = useAuth();
  const pro = auth.plan === 'pro' || auth.isOwner;
  const [profile] = useProfile();
  const [focus] = useFocus();
  const [papers] = usePapers();
  const [checklist] = useChecklist();
  const [planner] = usePlanner();
  const [decks] = useDecks();

  const days = pro ? 28 : 7;
  const vals: number[] = [], labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const k = addDays(today(), -i);
    vals.push(minsOn(focus.sessions, k));
    labels.push(i === 0 ? 'Today' : days > 7 ? (i % 7 === 0 ? k.slice(8) : '') : DAY_NAMES[new Date(k + 'T12:00').getDay()].slice(0, 3));
  }
  const total = vals.reduce((a, b) => a + b, 0);
  const weekMins = vals.slice(-7).reduce((a, b) => a + b, 0);
  const weekStart = addDays(today(), -6);
  const doneWeek = planner.sessions.filter((s) => s.done && s.day >= weekStart && s.day <= today()).length;
  const plannedWeek = planner.sessions.filter((s) => s.day >= weekStart && s.day <= today()).length;

  let reviews = 0, right = 0;
  decks.list.forEach((d) => {
    const data = store.get<DeckData>('deck_' + d.id, emptyDeck());
    for (let i = 0; i < 28; i++) { const k = addDays(today(), -i); reviews += data.stats.rev[k] || 0; right += data.stats.ok[k] || 0; }
  });

  const bySubject = new Map<string, number>();
  focus.sessions.filter((x) => x.s > Date.now() - 28 * 864e5).forEach((x) => { const k = x.specId || ''; bySubject.set(k, (bySubject.get(k) || 0) + x.m); });
  const subjMax = Math.max(1, ...bySubject.values());

  return (
    <>
      <Topbar title="Progress" sub="How your revision is going, across every subject" />
      <div className="content stack">
        <section className="panel panel-pad">
          <div className="row wrap" style={{ gap: 36 }}>
            <div className="stat"><div className="v">{fmtMins(weekMins)}</div><div className="k">studied this week</div></div>
            <div className="stat"><div className="v">{streak(focus.sessions)}</div><div className="k">day streak</div></div>
            <div className="stat"><div className="v">{plannedWeek ? doneWeek + '/' + plannedWeek : '–'}</div><div className="k">planned sessions done, 7 days</div></div>
            <div className="stat"><div className="v">{reviews ? Math.round((right / reviews) * 100) + '%' : '–'}</div><div className="k">flashcards right, 4 weeks</div></div>
            <div className="stat"><div className="v">{papers.logs.length}</div><div className="k">papers logged</div></div>
          </div>
        </section>
        <div className="grid">
          <section className="panel panel-pad c8">
            <div className="row between" style={{ marginBottom: 12 }}><h3>Study time, {days} days</h3><span className="small muted num">{fmtMins(total)} total</span></div>
            <Bars values={vals} labels={labels} unit="mins" />
            {!pro && <p className="small muted" style={{ marginTop: 12 }}><IconLock width={14} height={14} style={{ verticalAlign: '-2px' }} /> See 4 weeks of history and per-paper trends with <Link to="/upgrade">Pro</Link>.</p>}
          </section>
          <section className="panel c4">
            <div className="panel-head"><h2>Time by subject</h2></div>
            <div className="panel-body">{!bySubject.size ? <p className="small muted">Use the focus timer and pick a subject to see this.</p> :
              Array.from(bySubject.entries()).sort((a, b) => b[1] - a[1]).map(([k, m]) => (
                <div key={k} className="hbar" style={colourVar(profile.subjects.find((s) => s.specId === k)?.colour ?? 9)}>
                  <span>{subjectName(k || undefined)}</span><div className="meter"><i style={{ width: Math.round((m / subjMax) * 100) + '%', background: 'var(--c)' }} /></div><b>{fmtMins(m)}</b>
                </div>
              ))}</div>
          </section>
        </div>
        <section className="panel">
          <div className="panel-head"><h2>Subjects</h2></div>
          <div className="panel-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <table className="table">
              <thead><tr><th>Subject</th><th>Topics confident</th><th>Papers</th><th>Average</th><th>Latest</th><th>{pro ? 'Predicted' : <span className="row" style={{ gap: 4 }}><IconLock width={13} height={13} />Predicted</span>}</th></tr></thead>
              <tbody>{profile.subjects.map((s) => {
                const spec = specById(s.specId);
                if (!spec) return null;
                const ratings = checklist[s.specId] || {};
                const g = spec.topics.filter((_, i) => ratings[i] === 'g').length;
                const logs = papers.logs.filter((l) => l.specId === s.specId);
                const t = trend(logs);
                const last = logs.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
                const pred = pro ? predictGrade(logs) : null;
                return (
                  <tr key={s.specId}>
                    <td><span className="row" style={{ gap: 10 }}><span className="sub-tab" style={{ ...colourVar(s.colour), height: 18 }} />{spec.subject}</span></td>
                    <td><div className="row" style={{ gap: 10 }}><div className="meter" style={{ width: 90 }}><i style={{ width: Math.round((g / spec.topics.length) * 100) + '%', background: 'var(--good)' }} /></div><span className="num small">{g}/{spec.topics.length}</span></div></td>
                    <td className="num">{logs.length}</td>
                    <td className="num">{t.avg != null ? t.avg + '%' : '–'}</td>
                    <td className="num">{last ? pct(last) + '%' + (last.grade ? ', ' + last.grade : '') : '–'}</td>
                    <td>{!pro ? <Link to="/upgrade" className="small">Unlock</Link> : pred ? <span>{pred.grade} <span className="small muted">({pred.confidence} confidence)</span></span> : <span className="small muted">Log 2+ graded papers</span>}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
