import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Dot, Tick, colourVar } from '../components/ui';
import { useChecklist, useFocus, usePlanner, useProfile } from '../lib/data';
import { daysUntil, upcoming } from '../lib/exams';
import { fmtDay, fmtMins, greeting, studyDayOf, today } from '../lib/dates';
import { missedSessions } from '../lib/planner';
import { METHODS } from '../lib/types';
import { sessionTopic, subjectName, toolLink, useColourOf, useDueCount, usePro, useSittings } from './hooks';
import { useMistakes } from '../lib/data';
import { isDueMistake } from '../lib/mistakes';
import { specById } from '../catalog/catalog';

export default function Today() {
  const [profile] = useProfile();
  const [planner, setPlanner] = usePlanner();
  const [focus] = useFocus();
  const [checklist] = useChecklist();
  const sittings = useSittings();
  const colourOf = useColourOf();
  const dueCards = useDueCount();
  const pro = usePro();
  const [mistakes] = useMistakes();
  const dueMistakes = mistakes.list.filter(isDueMistake).length;
  const t = today();
  const next = upcoming(sittings);
  const first = next[0];
  const todays = planner.sessions.filter((s) => s.day === t);
  const tasks = planner.tasks.filter((x) => !x.done && (!x.due || x.due <= t));
  const missed = missedSessions(planner.sessions);
  const doneCount = todays.filter((s) => s.done).length;
  const mins = focus.sessions.filter((s) => studyDayOf(s.s) === t).reduce((a, s) => a + s.m, 0);
  const goalPct = Math.min(100, Math.round((mins / profile.dailyGoalMins) * 100));
  const weak = profile.subjects.flatMap((sub) => {
    const spec = specById(sub.specId);
    if (!spec) return [];
    return spec.topics.map((name, i) => ({ spec, name, i, r: (checklist[spec.id] || {})[i] })).filter((x) => x.r === 'r');
  }).slice(0, 5);

  const toggle = (id: string) => setPlanner((p) => ({ ...p, sessions: p.sessions.map((s) => (s.id === id ? { ...s, done: !s.done, doneAt: !s.done ? Date.now() : undefined } : s)) }));
  const toggleTask = (id: string) => setPlanner((p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === id ? { ...x, done: x.done ? 0 : Date.now() } : x)) }));

  const summary = first
    ? <>Your next exam is <span className="mark">{first.spec.subject} {first.paper.name.split(':')[0]}</span> in {daysUntil(first.date!)} days.</>
    : profile.subjects.length ? 'No upcoming exams with dates yet.' : 'Add your subjects to see your exams.';

  return (
    <>
      <Topbar title={greeting() + (profile.name ? ', ' + profile.name : '')} sub={summary} />
      <div className="content">
        {missed.length > 0 && (
          <div className="banner" style={{ marginBottom: 16 }}><p><b>{missed.length} revision {missed.length === 1 ? 'session' : 'sessions'} missed.</b> Rebuild your plan to fit them back in before your exams.</p><Link className="btn btn-sm" to="/planner">Open planner</Link></div>
        )}
        <div className="grid">
          <section className="panel c8">
            <div className="panel-head"><h2>Today’s revision</h2><span className="small muted">{todays.length ? doneCount + ' of ' + todays.length + ' done' : ''}</span></div>
            <div className="panel-body">
              {!todays.length && !tasks.length && !dueCards && !dueMistakes && (
                <p className="muted">Nothing scheduled for today. {planner.sessions.length ? 'Enjoy the break, or get ahead with some flashcards.' : <>Build a plan from your exam dates in the <Link to="/planner">revision planner</Link>.</>}</p>
              )}
              <ul className="list">
                {todays.map((s) => (
                  <li key={s.id} className={'item' + (s.done ? ' done' : '')}>
                    <Tick on={s.done} onClick={() => toggle(s.id)} label="Mark as done" />
                    <span className="sub-tab" style={colourVar(colourOf(s.specId))} />
                    <div className="grow">
                      <div className="title">{sessionTopic(s)}</div>
                      <div className="meta"><span>{subjectName(s.specId)}</span><span>{METHODS[s.method].name}</span><span className="num">{fmtMins(s.mins)}</span><Link to={'/guides/' + METHODS[s.method].guide}>How to</Link></div>
                    </div>
                    {!s.done && (!METHODS[s.method].pro || pro) && <Link className="btn btn-sm" to={toolLink(s.method, s.specId, s.topic)}>Start</Link>}
                  </li>
                ))}
                {tasks.map((x) => (
                  <li key={x.id} className="item">
                    <Tick on={false} onClick={() => toggleTask(x.id)} label="Mark as done" />
                    <span className="sub-tab" style={colourVar(colourOf(x.specId))} />
                    <div className="grow"><div className="title">{x.title}</div><div className="meta"><span>{x.specId ? subjectName(x.specId) : 'Task'}</span>{x.due && <span className="tag warn">Due {x.due < t ? fmtDay(x.due) : 'today'}</span>}<span className="num">{fmtMins(x.mins)}</span></div></div>
                  </li>
                ))}
                {dueMistakes > 0 && (
                  <li className="item">
                    <span className="tick" style={{ borderStyle: 'dashed', cursor: 'default' }} />
                    <div className="grow"><div className="title">Retest {dueMistakes} {dueMistakes === 1 ? 'mistake' : 'mistakes'}</div><div className="meta"><span>From your mistake log</span><span>About {fmtMins(Math.max(2, Math.round(dueMistakes * 0.75)))}</span></div></div>
                    <Link className="btn btn-sm btn-primary" to="/tools/mistakes?retest=1">Retest</Link>
                  </li>
                )}
                {dueCards > 0 && (
                  <li className="item">
                    <span className="tick" style={{ borderStyle: 'dashed', cursor: 'default' }} />
                    <div className="grow"><div className="title">Review {dueCards} flashcards</div><div className="meta"><span>About {fmtMins(Math.max(2, Math.round(dueCards * 0.25)))}</span></div></div>
                    <Link className="btn btn-sm btn-primary" to="/flashcards">Review</Link>
                  </li>
                )}
              </ul>
            </div>
          </section>

          <section className="panel c4">
            <div className="panel-head"><h2>Focus today</h2><Link className="small" to="/focus">Open timer</Link></div>
            <div className="panel-body">
              <div className="countdown"><b className="num">{fmtMins(mins)}</b></div>
              <p className="small muted" style={{ margin: '6px 0 10px' }}>of your {fmtMins(profile.dailyGoalMins)} goal</p>
              <div className={'meter' + (goalPct >= 100 ? ' good' : '')}><i style={{ width: goalPct + '%' }} /></div>
            </div>
          </section>

          <section className="panel c8">
            <div className="panel-head"><h2>Coming up</h2><Link className="small" to="/timetable">Full timetable</Link></div>
            <div className="panel-body">
              {!next.length ? <p className="muted">{profile.subjects.length ? 'Your exam dates will appear here.' : <><Link to="/subjects">Add your subjects</Link> to load your exam dates.</>}</p> : (
                <ul className="list">
                  {next.slice(0, 5).map((s) => {
                    const days = daysUntil(s.date!);
                    return (
                      <li key={s.key} className="item">
                        <div className={'datebox' + (days === 0 ? ' today' : '')}><span>{fmtDay(s.date!).split(' ')[0]}</span><b>{Number(s.date!.slice(8))}</b></div>
                        <span className="sub-tab" style={colourVar(s.colour)} />
                        <div className="grow"><div className="title">{s.spec.subject}: {s.paper.name}</div><div className="meta"><span>{s.spec.board} {s.paper.code}</span><span>{s.session === 'AM' ? 'Morning' : 'Afternoon'}</span><span>{fmtMins(s.paper.mins)}</span></div></div>
                        <span className={'tag' + (days <= 7 ? ' hl' : '')}>{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days + ' days'}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="panel c4">
            <div className="panel-head"><h2>Weakest topics</h2><Link className="small" to="/topics">Checklist</Link></div>
            <div className="panel-body">
              {!weak.length ? <p className="muted small">Rate your topics red, amber or green in the checklist. Red topics show here and get extra revision.</p> : (
                <ul className="list">{weak.map((w) => <li key={w.spec.id + w.i} className="item"><Dot colour={colourOf(w.spec.id)} /><div className="grow"><div className="title small">{w.name}</div><div className="meta">{w.spec.subject}</div></div></li>)}</ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
