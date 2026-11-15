import { Link } from 'react-router-dom';
import { colourVar } from '../components/ui';
import { IconCheck, IconDownload } from '../components/icons';
import { PriceCards } from './Upgrade';

export const RELEASES_URL = 'https://github.com/dizzy200511-debug/hilite/releases/latest';

/** A static preview of the Today screen. Real data shapes, so it looks like the app it is. */
function Preview() {
  const exams: [string, string, string, number, string][] = [
    ['MAY', '12', 'Biology Paper 1', 0, '8461/1H'],
    ['MAY', '14', 'English Literature Paper 1', 1, '8702/1'],
    ['MAY', '18', 'Maths Paper 1, non-calculator', 2, '1MA1/1H'],
  ];
  const sessions: [string, string, number, boolean][] = [
    ['Bioenergetics', 'Learn and blurt, 30 min', 0, true],
    ['Macbeth: key quotes', 'Flashcard review, 20 min', 1, false],
    ['Algebra', 'Exam questions, 30 min', 2, false],
  ];
  return (
    <div className="sheet" aria-hidden="true">
      <div className="row between" style={{ marginBottom: 14 }}>
        <div><div style={{ fontWeight: 750, fontSize: 18, letterSpacing: '-0.02em' }}>Good evening, Sam</div><div className="small muted">First exam in <b style={{ color: 'var(--ink)' }}>187 days</b></div></div>
        <span className="sync idle"><i />Saved</span>
      </div>
      <div className="grid" style={{ gap: 12 }}>
        <div className="panel c7" style={{ padding: 14 }}>
          <div className="small" style={{ fontWeight: 700, marginBottom: 6 }}>Today’s revision</div>
          <ul className="list">{sessions.map(([t, m, c, done]) => (
            <li key={t} className="item" style={{ padding: '9px 0' }}>
              <span className="tick" aria-pressed={done} style={colourVar(c)}><IconCheck /></span>
              <div className="grow"><div className="title" style={{ fontSize: 14, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>{t}</div><div className="meta">{m}</div></div>
            </li>
          ))}</ul>
        </div>
        <div className="panel c5" style={{ padding: 14 }}>
          <div className="small" style={{ fontWeight: 700, marginBottom: 8 }}>Coming up</div>
          <div className="stack" style={{ gap: 9 }}>{exams.map(([mo, d, n, c, code]) => (
            <div key={n} className="row" style={{ gap: 10, ...colourVar(c) }}>
              <div className="datebox" style={{ width: 42 }}><span style={{ fontSize: 9.5 }}>{mo}</span><b style={{ fontSize: 15 }}>{d}</b></div>
              <div style={{ minWidth: 0 }}><div className="small" style={{ fontWeight: 650, lineHeight: 1.25 }}>{n}</div><div className="tiny muted num">{code}</div></div>
            </div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}

const FEATURES: [string, string][] = [
  ['Your real exam dates', 'Pick your board and subjects. Every paper appears with its date, session and a countdown, and Hilite warns you about clashes. Add them to your phone’s calendar in one click.'],
  ['A plan that fits every topic in', 'Tell Hilite how long you can revise. It spaces every topic out before each paper, with revision methods matched to how each subject is examined: notes and quotes for English, exam questions for maths and sciences.'],
  ['Every past paper, tracked', 'Open the official papers for your exact spec, sit them under timed conditions, and log your marks to see your trend over time.'],
  ['Every way to revise, with guides', 'Flashcards with spaced repetition, blurting, teach-back, Cornell notes, mind maps, a memoriser for quotes and equations, and mixed quizzes. Each one has a guide, and your plan tells you which to use when.'],
  ['Stop losing the same marks', 'Log each mark you lose and why. Hilite retests you until you get it right, and shows whether you’re losing marks on content, technique or misreading. Pro adds an AI coach that tests you on your weak spots.'],
  ['On the web and on Windows', 'Use Hilite in any browser, or install the Windows app with a focus timer in your tray and reminders. Everything syncs, and it works offline.'],
];

const FAQ: [string, string][] = [
  ['Is it really free?', 'Yes. The timetable, revision plan, flashcards, past paper tracker, mistake log and core revision tools are free, with no time limit. Pro adds the AI coach, more plan styles, unlimited notes and maps, every guide, and predicted grades.'],
  ['Which exam boards do you cover?', 'AQA and Pearson Edexcel GCSEs, with their 2027 exam dates loaded. OCR Computer Science and Maths are in too, and you can add your own dates for anything else. A-levels are next.'],
  ['Where do the past papers come from?', 'From the exam boards’ own websites. Hilite links you straight to them so you always get the official paper and mark scheme.'],
  ['Is my data safe?', 'Your account is protected with a code sent to your email whenever a new device signs in. We never sell data or show ads, and you can delete everything at any time.'],
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="lnav">
        <div className="brand"><span className="brand-mark"><i /></span>Hilite</div>
        <nav className="row" style={{ gap: 6 }}>
          <a className="btn btn-ghost hide-sm" href="#pricing">Pricing</a>
          <a className="btn btn-ghost hide-sm" href={RELEASES_URL}>Windows app</a>
          <Link className="btn btn-ghost" to="/signin">Sign in</Link>
          <Link className="btn btn-primary" to="/signup">Get started</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <span className="tag hl" style={{ marginBottom: 18 }}>GCSE 2027 exam dates are in</span>
          <h1>Revise for the exams you’re <span className="mark">actually sitting.</span></h1>
          <p>Hilite loads the real dates and papers for your exact exam board and spec, then builds a revision plan that gets every topic done in time.</p>
          <div className="row wrap">
            <Link className="btn btn-primary btn-lg" to="/signup">Start revising, it’s free</Link>
            <a className="btn btn-lg" href={RELEASES_URL}><IconDownload />Download for Windows</a>
          </div>
          <p className="small muted" style={{ fontSize: 13.5, margin: '14px 0 0' }}>AQA, Pearson Edexcel and OCR. No card needed.</p>
        </div>
        <Preview />
      </section>

      <section className="lsection">
        <h2 style={{ fontSize: 30, letterSpacing: '-0.03em', marginBottom: 6 }}>Everything for revision, in one place</h2>
        <p className="muted" style={{ marginBottom: 24, maxWidth: '60ch' }}>Not another notes app. Hilite is built around your exam timetable, so you always know what to revise next and whether you’re on track.</p>
        <div className="features">{FEATURES.map(([h, p]) => <div key={h}><h3>{h}</h3><p>{p}</p></div>)}</div>
      </section>

      <section className="lsection">
        <div className="grid">
          {[['1', 'Pick your subjects', 'Choose your qualification, exam board and tier. Takes a minute.'], ['2', 'Say how long you can revise', 'Weekdays, weekends and days off. Hilite builds the plan.'], ['3', 'Open Hilite each day', 'Today shows what to do, what’s due and how long until each exam.']].map(([n, h, p]) => (
            <div key={n} className="c4"><div className="num" style={{ fontWeight: 800, fontSize: 15, width: 30, height: 30, borderRadius: 8, background: 'var(--hl)', color: '#14161b', display: 'grid', placeItems: 'center', marginBottom: 12 }}>{n}</div><h3 style={{ marginBottom: 4 }}>{h}</h3><p className="muted">{p}</p></div>
          ))}
        </div>
      </section>

      <section className="lsection" id="pricing">
        <h2 style={{ fontSize: 30, letterSpacing: '-0.03em', marginBottom: 6 }}>Simple pricing</h2>
        <p className="muted" style={{ marginBottom: 20 }}>Free covers everything you need to revise. Pro is for students who want the extras.</p>
        <PriceCards cta={() => <Link className="btn btn-primary btn-block btn-lg" to="/signup">Start free, upgrade any time</Link>} />
      </section>

      <section className="lsection">
        <h2 style={{ fontSize: 30, letterSpacing: '-0.03em', marginBottom: 18 }}>Questions</h2>
        <div className="grid">{FAQ.map(([q, a]) => <div key={q} className="c6"><h3 style={{ marginBottom: 4 }}>{q}</h3><p className="muted">{a}</p></div>)}</div>
      </section>

      <footer className="lfoot">
        <span>© 2026 Hilite</span>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <a href="mailto:hello@hilite.study">Contact</a>
        <span style={{ marginLeft: 'auto' }}>Exam dates from AQA and Pearson published timetables. Always check your school’s final timetable.</span>
      </footer>
    </div>
  );
}
