import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconDownload } from '../components/icons';
import { Seg } from '../components/ui';
import { Diagram } from '../components/Diagram';
import { BOARDS, CONTINGENCY_DAY, SPECS, TIMETABLE_YEAR, specSlug, type Board, type Qual, type Spec } from '../catalog/catalog';
import { hasPaperLinks } from '../lib/paperLinks';
import { addDays, daysBetween, fmtDay, today } from '../lib/dates';
import { SITE_URL } from '../lib/supabase';
import { PriceCards } from './Upgrade';

export const RELEASES_URL = 'https://github.com/dizzy200511-debug/hilite/releases/latest';

/** The exam-date and past paper pages are static files on the website, so the Windows app opens them there. */
const web = (path: string) => (window.hiliteDesktop ? SITE_URL : '') + path;
const BOARD_LIST: Board[] = ['AQA', 'Edexcel', 'OCR'];
const QUALS: [Qual, string][] = [['GCSE', 'GCSE'], ['A-level', 'A-level']];
const firstSpec = (q: Qual, b: Board) => SPECS.find((s) => s.qual === q && s.board === b && dated(s).length)!.id;
const dated = (s: Spec) => s.papers.filter((p) => p.sitting).sort((a, b) => a.sitting!.date.localeCompare(b.sitting!.date) || a.sitting!.session.localeCompare(b.sitting!.session));
const countdown = (date: string) => { const n = daysBetween(today(), date); return n < 0 ? 'Sat' : n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n + ' days'; };

/** Pick a level, board and subject, see every paper with its date, and jump to free past papers. No account needed. */
function FindExams() {
  const [qual, setQual] = useState<Qual>('GCSE');
  const [board, setBoard] = useState<Board>('AQA');
  const specs = SPECS.filter((s) => s.qual === qual && s.board === board && dated(s).length).sort((a, b) => a.subject.localeCompare(b.subject));
  const [specId, setSpecId] = useState(specs[0].id);
  const spec = specs.find((s) => s.id === specId) ?? specs[0];
  return (
    <div className="finder" aria-label="Find your exams">
      <div className="finder-head">
        <b>Find your exams</b>
        <Seg label="Qualification" value={qual} onChange={(q) => { setQual(q); setSpecId(firstSpec(q, board)); }} options={QUALS} />
      </div>
      <Seg label="Exam board" value={board} onChange={(b) => { setBoard(b); setSpecId(firstSpec(qual, b)); }} options={BOARD_LIST.map((b) => [b, BOARDS[b].name])} />
      <select className="select" aria-label="Subject" value={spec.id} onChange={(e) => setSpecId(e.target.value)}>
        {specs.map((s) => <option key={s.id} value={s.id}>{s.subject} ({s.code})</option>)}
      </select>
      <ul className="finder-list">
        {dated(spec).map((p) => (
          <li key={p.id}>
            <div className="datebox"><span>{fmtDay(p.sitting!.date).split(' ')[0]}</span><b className="num">{Number(p.sitting!.date.slice(8))}</b></div>
            <div className="grow"><div className="finder-paper">{p.name}</div><div className="tiny muted num">{fmtDay(p.sitting!.date).replace(/^\w+ /, '')}, {p.sitting!.session === 'AM' ? 'morning' : 'afternoon'}, {Math.floor(p.mins / 60) ? Math.floor(p.mins / 60) + ' h ' : ''}{p.mins % 60 ? (p.mins % 60) + ' min' : ''}</div></div>
            <span className="tag num">{countdown(p.sitting!.date)}</span>
          </li>
        ))}
      </ul>
      <div className="row wrap" style={{ gap: 8 }}>
        {hasPaperLinks(spec.id) && <a className="btn btn-primary" href={web('/past-papers/' + specSlug(spec))}>Free {spec.subject} past papers</a>}
        <a className="btn" href={web('/exam-dates/' + specSlug(spec))}>{spec.subject} exam dates</a>
      </div>
    </div>
  );
}

/** May and June 2027 as weekday columns, each day shaded by how many GCSE or A-level papers fall on it. */
function ExamSeason() {
  const [level, setLevel] = useState<'all' | Qual>('all');
  const { weeks, max } = useMemo(() => {
    const count: Record<string, number> = {};
    SPECS.filter((s) => level === 'all' || s.qual === level).forEach((s) => s.papers.forEach((p) => { if (p.sitting) count[p.sitting.date] = (count[p.sitting.date] || 0) + 1; }));
    const start = '2027-05-10', out: { date: string; n: number }[][] = [];
    for (let w = 0; w < 7; w++) out.push([0, 1, 2, 3, 4].map((d) => { const date = addDays(start, w * 7 + d); return { date, n: count[date] || 0 }; }));
    return { weeks: out.filter((wk) => wk.some((d) => d.n) || wk.some((d) => d.date === CONTINGENCY_DAY)), max: Math.max(...Object.values(count)) };
  }, [level]);
  const first = weeks[0][0].date;
  return (
    <div className="season">
      <div style={{ marginBottom: 12 }}><Seg label="Show papers for" value={level} onChange={setLevel} options={[['all', 'GCSE and A-level'], ['GCSE', 'GCSE'], ['A-level', 'A-level']]} /></div>
      <div className="season-grid" role="table" aria-label={'Exam season ' + TIMETABLE_YEAR + ', papers per day'}>
        <div className="season-row season-days" role="row"><span />{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => <span key={d} role="columnheader">{d}</span>)}</div>
        {weeks.map((wk) => (
          <div className="season-row" role="row" key={wk[0].date}>
            <span className="season-week num" role="rowheader">{fmtDay(wk[0].date).replace(/^\w+ /, '')}</span>
            {wk.map(({ date, n }) => {
              const c = date === CONTINGENCY_DAY;
              const level = n ? Math.ceil((n / max) * 4) : 0;
              return <span key={date} role="cell" className={'season-day l' + level + (c ? ' contingency' : '')} title={fmtDay(date) + ': ' + (c ? 'contingency day' : n ? n + ' papers' : 'no exams')}><span className="num">{Number(date.slice(8))}</span>{n > 0 && <em className="num">{n}</em>}</span>;
            })}
          </div>
        ))}
      </div>
      <div className="season-key small muted">
        <span><i className="season-day l1" /> fewer papers</span><span><i className="season-day l4" /> busiest days</span><span><i className="season-day contingency" /> contingency day: stay free</span>
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>Written papers start {fmtDay(first)} {TIMETABLE_YEAR}. Counts cover every AQA, Pearson Edexcel and OCR {level === 'all' ? 'GCSE and A-level' : level} paper in Hilite.</p>
    </div>
  );
}

/** Free past papers by board, for GCSE or A-level. */
function FreePapers() {
  const [qual, setQual] = useState<Qual>('GCSE');
  return (
    <>
      <div style={{ marginBottom: 14 }}><Seg label="Qualification" value={qual} onChange={setQual} options={QUALS} /></div>
      <div className="board-cols">
        {BOARD_LIST.map((b) => {
          const list = SPECS.filter((s) => s.qual === qual && s.board === b && hasPaperLinks(s.id)).sort((x, y) => x.subject.localeCompare(y.subject));
          return (
            <div key={b}>
              <h3>{BOARDS[b].name} {qual}</h3>
              {list.length ? <ul>{list.map((s) => <li key={s.id}><a href={web('/past-papers/' + specSlug(s))}>{s.subject}</a></li>)}</ul> : <p className="small muted">Use the {BOARDS[b].name} finder for now.</p>}
            </div>
          );
        })}
      </div>
    </>
  );
}

/** One real practice question, answerable right here. */
function SampleQuestion() {
  const [chosen, setChosen] = useState<number | null>(null);
  const opts = ['3 m/s²', '4 m/s²', '12 m/s²', '48 m/s²'];
  return (
    <div className="panel q-card sample-q">
      <div className="q-head"><b>Physics, motion</b><span className="tag num">1 mark</span><span className="tag">Easy</span></div>
      <Diagram d={{ type: 'graph', x: 'Time (s)', y: 'Velocity (m/s)', xMax: 6, yMax: 14, xStep: 1, yStep: 2, series: [{ points: [[0, 0], [4, 12], [6, 12]] }] }} />
      <p className="q-text">The graph shows a cyclist speeding up. What is the acceleration in the first 4 seconds?</p>
      <div className="q-opts">{opts.map((o, i) => (
        <button key={o} className={'q-opt' + (chosen != null && i === 0 ? ' right' : '') + (chosen === i && i !== 0 ? ' wrong' : '')} disabled={chosen != null} onClick={() => setChosen(i)}>
          <span className="q-letter">{String.fromCharCode(65 + i)}</span>{o}
        </button>
      ))}</div>
      {chosen != null && <p className="small">{chosen === 0 ? 'Right.' : 'Not quite.'} Acceleration is change in velocity ÷ time: 12 ÷ 4 = 3 m/s².</p>}
    </div>
  );
}

const FEATURES: [string, string][] = [
  ['A plan that fits every topic in', 'Tell Hilite how long you can revise. It spaces every topic out before its paper, with methods matched to how each subject is examined.'],
  ['Practice questions for every topic', 'Exam-style questions with diagrams and a mark scheme for each. Mark yourself, or let Pro’s AI mark your written answers.'],
  ['Your school tests too', 'Add mocks and end-of-topic tests with the topics they cover. Hilite plans revision for them alongside your real exams.'],
  ['A mistake log that retests you', 'Every lost mark goes in with why you lost it. Hilite brings it back after 1, 3 and 7 days until you get it right.'],
  ['Flashcards that space themselves', 'Make decks or start from ready-made ones for equations and formulae. Cards come back just before you’d forget them.'],
  ['On the web and on Windows', 'Use Hilite in a browser or install the Windows app with a focus timer in your tray. Everything syncs.'],
];

const FAQ: [string, string][] = [
  ['Are the past papers really free?', 'Yes. Pick your subject and every public question paper, mark scheme and examiners’ report opens on the exam board’s own website. You don’t need an account.'],
  ['Which exam boards do you cover?', 'AQA, Pearson Edexcel and OCR, at GCSE and A-level, with every 2027 exam date loaded. You can add your own dates for anything else.'],
  ['What do I get without paying?', 'The timetable, a full revision plan, flashcards, past paper tracking, practice questions, the mistake log and the core revision tools, with no time limit.'],
  ['Is my data safe?', 'A code goes to your email whenever a new device signs in. We never sell data or show ads, and you can delete everything at any time.'],
];

export default function Landing() {
  const nextExam = useMemo(() => SPECS.flatMap((s) => dated(s).map((p) => p.sitting!.date)).sort()[0], []);
  const days = daysBetween(today(), nextExam);
  return (
    <div className="landing">
      <header className="lnav">
        <Link to="/" className="brand" style={{ color: 'var(--ink)', textDecoration: 'none' }}><span className="brand-mark"><i /></span>Hilite</Link>
        <nav className="row" style={{ gap: 4 }}>
          <a className="btn btn-ghost hide-sm" href={web('/past-papers')}>Past papers</a>
          <a className="btn btn-ghost hide-sm" href={web('/exam-dates')}>Exam dates</a>
          <a className="btn btn-ghost hide-sm" href="#pricing">Pricing</a>
          <Link className="btn btn-ghost" to="/signin">Sign in</Link>
          <Link className="btn btn-primary" to="/signup">Get started</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="hero-kicker">{days > 0 ? <>GCSE and A-level exams start in <b className="num">{days}</b> days</> : <>GCSE and A-level exams are under way</>}</p>
          <h1>Revise for the exams you’re <span className="mark">actually sitting.</span></h1>
          <p className="hero-lead">For GCSE and A-level. Real exam dates for your board and spec, free past papers, practice questions, and a revision plan that gets every topic done in time.</p>
          <div className="row wrap">
            <Link className="btn btn-primary btn-lg" to="/signup">Start revising free</Link>
            <a className="btn btn-lg" href={web('/past-papers')}>Browse past papers</a>
          </div>
          <p className="small muted" style={{ marginTop: 14 }}>GCSE and A-level, for AQA, Pearson Edexcel and OCR. No card needed. <a href={RELEASES_URL}><IconDownload width={14} height={14} style={{ verticalAlign: '-2px' }} /> Windows app</a></p>
        </div>
        <FindExams />
      </section>

      <section className="lsection">
        <div className="lsplit">
          <div>
            <h2 className="lh2">Exam season {TIMETABLE_YEAR} at a glance</h2>
            <p className="muted lp">Every written GCSE and A-level paper from all three boards, by day. Darker days have more papers. Sign up and Hilite shows only yours, warns you about clashes and plans backwards from each one.</p>
            <a className="btn" href={web('/exam-dates')}>All exam dates by subject</a>
          </div>
          <ExamSeason />
        </div>
      </section>

      <section className="lsection">
        <h2 className="lh2">Free past papers, no sign-up</h2>
        <p className="muted lp">Question papers, mark schemes and examiners’ reports for GCSE and A-level, straight from the boards. Pick a subject.</p>
        <FreePapers />
      </section>

      <section className="lsection">
        <div className="lsplit">
          <div>
            <h2 className="lh2">Everything for revision, built around your exams</h2>
            <p className="muted lp">Not another notes app. Hilite knows when each paper is, so it always knows what you should do next.</p>
            <dl className="feature-list">{FEATURES.map(([h, p]) => <div key={h}><dt>{h}</dt><dd>{p}</dd></div>)}</dl>
          </div>
          <SampleQuestion />
        </div>
      </section>

      <section className="lsection">
        <h2 className="lh2">Set up in a minute</h2>
        <ol className="steps-row">
          {[['Pick your subjects', 'Choose your exam board and tier for each subject. Your papers and dates load straight away.'], ['Say how long you can revise', 'School days, weekends and days off. Hilite builds a plan that fits every topic in.'], ['Open Hilite each day', 'Today shows what to revise, what’s due and how long until each exam.']].map(([h, p], i) => (
            <li key={h}><span className="step-n num">{i + 1}</span><h3>{h}</h3><p className="muted">{p}</p></li>
          ))}
        </ol>
      </section>

      <section className="lsection" id="pricing">
        <h2 className="lh2">Simple pricing</h2>
        <p className="muted lp">Free covers everything you need to revise. Pro adds the AI coach and the deeper tools.</p>
        <PriceCards cta={() => <Link className="btn btn-primary btn-block btn-lg" to="/signup">Start free, upgrade any time</Link>} />
      </section>

      <section className="lsection">
        <h2 className="lh2">Questions</h2>
        <div className="faq">{FAQ.map(([q, a]) => <div key={q}><h3>{q}</h3><p className="muted">{a}</p></div>)}</div>
      </section>

      <footer className="lfoot">
        <div className="lfoot-brand"><div className="brand" style={{ padding: 0 }}><span className="brand-mark"><i /></span>Hilite</div><p className="small muted">GCSE and A-level revision built around your exams.</p></div>
        <div><h4>Revise</h4><a href={web('/past-papers')}>Past papers</a><a href={web('/exam-dates')}>Exam dates {TIMETABLE_YEAR}</a><Link to="/signup">Revision planner</Link></div>
        <div><h4>Hilite</h4><a href="#pricing">Pricing</a><a href={RELEASES_URL}>Windows app</a><a href="mailto:hello@hilite.study">Contact</a></div>
        <div><h4>Legal</h4><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
        <p className="lfoot-note small muted">© 2026 Hilite. Exam dates from the AQA, Pearson and OCR published timetables; always check your school’s final timetable. Past papers belong to the exam boards and open on their websites.</p>
      </footer>
    </div>
  );
}
