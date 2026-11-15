import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { useToast } from '../../components/ui';
import { MistakeModal } from '../../components/MistakeModal';
import { ProLock, SubjectTopicSelect, topicName, useToolTarget } from '../../components/pickers';
import { specById } from '../../catalog/catalog';
import { useChecklist, useCoach } from '../../lib/data';
import { aiMark, type AiMark } from '../../lib/ai';
import { cleanText, uid } from '../../lib/sanitize';
import type { Rating } from '../../lib/types';
import { subjectName, usePro } from '../hooks';

const PROMPTS = [
  ['Explain it simply', 'Explain the topic as if to a Year 7 student. Plain words, and explain any key terms you use.'],
  ['Give an example', 'A real example, a worked case, or where it shows up in an exam question.'],
  ['Say why', 'Why does it happen, or why does it matter? Push past what to why and how.'],
  ['Link it', 'How does it connect to another topic you’ve studied?'],
] as const;

export default function Teach() {
  const target = useToolTarget();
  const pro = usePro();
  const toast = useToast();
  const [specId, setSpecId] = useState(target.specId);
  const [topic, setTopic] = useState<number | undefined>(target.topic);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [said, setSaid] = useState<boolean[]>([false, false, false, false]);
  const [stuck, setStuck] = useState('');
  const [logging, setLogging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<AiMark | null>(null);
  const [checklist, setChecklist] = useChecklist();
  const [, setCoach] = useCoach();
  const spec = specById(specId);
  const name = topicName(specId, topic);
  const rating = specId && topic != null ? (checklist[specId] || {})[topic] : undefined;
  const written = answers.map((a, i) => (a.trim() ? PROMPTS[i][0] + ': ' + a.trim() : '')).filter(Boolean).join('\n\n');

  const rate = (r: Rating) => {
    if (!specId || topic == null) return;
    setChecklist((c) => ({ ...c, [specId]: { ...(c[specId] || {}), [topic]: r } }));
    toast('Topic rated ' + (r === 'r' ? 'red' : r === 'a' ? 'amber' : 'green'));
  };
  const askAI = async () => {
    if (!spec || !name) return;
    setBusy(true);
    const question = 'Explain ' + name + ' clearly, with an example, the reasons behind it, and a link to another topic.';
    const res = await aiMark({ subject: spec.subject, board: spec.board, question, marks: 6, answer: cleanText(written, 5000) });
    setBusy(false);
    if (!res.ok) { toast(res.error); return; }
    setFeedback(res.data);
    setCoach((c) => ({ attempts: c.attempts.concat({ id: uid(), specId, topic, q: question, a: cleanText(written, 3000), score: res.data.score, max: 6, feedback: cleanText(res.data.feedback, 1200), at: Date.now(), ai: true }).slice(-120) }));
  };

  return (
    <>
      <Topbar title="Teach-back" sub={name ? subjectName(specId) + ', ' + name : 'Explain a topic simply. Where you get stuck is what to revise.'}>
        <Link className="btn btn-ghost" to="/guides/feynman">How to teach back</Link>
      </Topbar>
      <div className="content stack" style={{ maxWidth: 900 }}>
        <section className="panel panel-pad">
          <SubjectTopicSelect specId={specId} topic={topic} anyTopic={false} onChange={(s, t) => { setSpecId(s); setTopic(t); setFeedback(null); }} />
          <p className="small muted">Close your notes. Say each part out loud, or type it. Saying it is quicker; typing lets the AI coach give feedback.</p>
        </section>
        {PROMPTS.map(([h, p], i) => (
          <section key={h} className="panel panel-pad">
            <div className="row between" style={{ marginBottom: 6 }}><h3>{i + 1}. {h}</h3>
              <label className="check small"><input type="checkbox" checked={said[i]} onChange={(e) => setSaid(said.map((x, j) => (j === i ? e.target.checked : x)))} />Said it out loud</label></div>
            <p className="small muted" style={{ marginBottom: 8 }}>{p}</p>
            <textarea className="textarea" style={{ minHeight: 90 }} maxLength={1500} value={answers[i]} onChange={(e) => setAnswers(answers.map((x, j) => (j === i ? e.target.value : x)))} aria-label={h} />
          </section>
        ))}
        <section className="panel panel-pad">
          <div className="field"><label htmlFor="stk">Where did you get stuck or go vague?</label>
            <textarea id="stk" className="textarea" style={{ minHeight: 80 }} maxLength={1000} value={stuck} onChange={(e) => setStuck(e.target.value)} placeholder="e.g. Couldn’t explain why the rate levels off" />
            <span className="hint">Go back to your notes for just these points, then explain it again. Log them so Hilite retests you.</span></div>
          <div className="row between wrap">
            {topic != null ? <div className="row"><span className="small muted">Rate this topic</span><div className="rag" role="group" aria-label="Rate this topic">{(['r', 'a', 'g'] as Rating[]).map((r) => <button key={r} className={r} aria-pressed={rating === r} onClick={() => rate(r)}>{r.toUpperCase()}</button>)}</div></div> : <span />}
            <div className="row">
              <button className="btn" disabled={!stuck.trim()} onClick={() => setLogging(true)}>Log as a mistake</button>
              {pro && <button className="btn btn-primary" disabled={busy || !name || written.length < 40} onClick={askAI}>{busy ? 'Reading your explanation…' : 'Get AI feedback'}</button>}
            </div>
          </div>
          {!pro && <div style={{ marginTop: 12 }}><ProLock>With Pro, the AI coach reads your explanation and tells you what was missing or unclear.</ProLock></div>}
        </section>
        {feedback && (
          <section className="panel panel-pad">
            <div className="row between" style={{ marginBottom: 8 }}><h3>AI feedback</h3><span className="tag accent num">{feedback.score} / 6</span></div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{feedback.feedback}</p>
            {feedback.missed.length > 0 && <><h3 style={{ margin: '14px 0 6px' }}>What was missing</h3><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{feedback.missed.map((m) => <li key={m}>{m}</li>)}</ul></>}
            <p className="tiny faint" style={{ marginTop: 12 }}>AI feedback can be wrong. Check anything surprising against your notes or textbook.</p>
          </section>
        )}
      </div>
      {logging && <MistakeModal source="teach" initial={{ specId, topic, kind: 'knowledge', what: 'Teach-back: ' + (name || '') + ', got stuck on: ' + stuck, fix: feedback?.missed.join('; ') || '' }} onClose={() => setLogging(false)} />}
    </>
  );
}
