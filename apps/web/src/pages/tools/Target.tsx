import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { specById } from '../../catalog/catalog';
import { useProfile } from '../../lib/data';
import { subjectName, usePro } from '../hooks';
import { ProGate } from '../../components/pickers';

/** Marks needed on the papers left to reach a boundary. Uses boundaries the student enters, never guessed ones. */
export default function Target() {
  const [profile] = useProfile();
  const [specId, setSpecId] = useState(profile.subjects[0]?.specId || '');
  const spec = specById(specId);
  const papers = spec?.papers.filter((p) => p.marks) || [];
  const total = papers.reduce((a, p) => a + (p.marks || 0), 0);
  const [boundary, setBoundary] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const done = papers.filter((p) => scores[p.id] !== undefined && scores[p.id] !== '');
  const got = done.reduce((a, p) => a + Number(scores[p.id] || 0), 0);
  const leftPapers = papers.filter((p) => !done.includes(p));
  const leftMarks = leftPapers.reduce((a, p) => a + (p.marks || 0), 0);
  const need = Math.max(0, Number(boundary) - got);
  const b = Number(boundary);
  const ok = b > 0 && b <= total;
  const pro = usePro();
  if (!pro) return <ProGate title="Grade target" intro="Know exactly what you need" points={['Enter a grade boundary and the marks you’ve got so far.', 'See how many marks you need on each paper you have left to reach your target grade.', 'Works for every subject with fixed paper totals.']} />;

  return (
    <>
      <Topbar title="Grade target" sub="How many marks you need on the papers you have left">
        <Link className="btn btn-ghost" to="/papers">Past papers</Link>
      </Topbar>
      <div className="content stack" style={{ maxWidth: 760 }}>
        <section className="panel panel-pad">
          <div className="field"><label htmlFor="ts">Subject</label>
            <select id="ts" className="select" value={specId} onChange={(e) => { setSpecId(e.target.value); setScores({}); setBoundary(''); }}>
              {profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}
            </select></div>
          {!papers.length ? <p className="small muted">This subject’s papers don’t have fixed mark totals in Hilite, so this calculator can’t work it out.</p> : (
            <>
              <div className="field"><label htmlFor="tb">Grade boundary (total marks across all papers, {total} available)</label>
                <input id="tb" className="input num" type="number" min={1} max={total} value={boundary} onChange={(e) => setBoundary(e.target.value)} placeholder="e.g. 180" />
                <span className="hint">Find this in the board’s grade boundaries for a recent series, for your tier. Boundaries change every year, so treat it as a guide.</span></div>
              <span className="label">Marks you’ve already got (leave blank for papers you haven’t sat)</span>
              <div className="stack" style={{ gap: 8, margin: '8px 0 16px' }}>{papers.map((p) => (
                <div key={p.id} className="row"><span className="grow small">{p.name}</span><input className="input num" style={{ width: 110 }} type="number" min={0} max={p.marks || 0} value={scores[p.id] ?? ''} onChange={(e) => setScores({ ...scores, [p.id]: e.target.value })} aria-label={'Marks on ' + p.name} /><span className="small muted num" style={{ width: 44 }}>/ {p.marks}</span></div>
              ))}</div>
              {ok && (
                leftPapers.length === 0
                  ? <div className={'banner ' + (got >= b ? 'info' : '')}><p>{got >= b ? 'You’re at or above the boundary with ' + got + ' marks.' : 'You’re ' + (b - got) + ' marks short of the boundary.'}</p></div>
                  : <div className="banner info"><p>{need === 0 ? 'You’re already over the boundary. Keep it up.' : need > leftMarks ? 'You’d need ' + need + ' of the ' + leftMarks + ' marks left, which isn’t possible on these numbers. Check the boundary, or aim for the grade below.' : <>You need <b>{need} of {leftMarks}</b> marks on the {leftPapers.length === 1 ? 'paper' : leftPapers.length + ' papers'} left: about <b>{Math.round((need / leftMarks) * 100)}%</b>{leftPapers.length > 1 ? ', or ' + Math.ceil(need / leftPapers.length) + ' marks per paper' : ''}.</>}</p></div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
