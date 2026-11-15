import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Topbar } from '../components/Shell';
import { Empty, colourVar } from '../components/ui';
import { SpecPoints, useTopicProgress } from '../components/SpecPoints';
import { specById } from '../catalog/catalog';
import { hasSpecContent } from '../content/spec';
import { useChecklist, useProfile } from '../lib/data';
import type { Rating, SubjectChoice } from '../lib/types';

type Filter = 'all' | Rating | 'none';

export default function Topics() {
  const [profile] = useProfile();
  const [checklist] = useChecklist();
  const [filter, setFilter] = useState<Filter>('all');
  if (!profile.subjects.length) return (<><Topbar title="Topic checklist" /><div className="content"><div className="panel"><Empty title="Add your subjects first" action={<Link className="btn btn-primary" to="/subjects">Add subjects</Link>}>Your checklist lists every topic in your exact specification.</Empty></div></div></>);
  let total = 0, green = 0;
  profile.subjects.forEach((s) => { const sp = specById(s.specId); if (!sp) return; total += sp.topics.length; Object.values(checklist[s.specId] || {}).forEach((v) => { if (v === 'g') green++; }); });
  return (
    <>
      <Topbar title="Topic checklist" sub={green + ' of ' + total + ' topics confident'} />
      <div className="content stack">
        <div className="row between wrap">
          <p className="small muted">Rate each topic honestly. Red topics get extra sessions in your plan, green ones fewer. Open a topic to see everything it covers and tick off what you know.</p>
          <div className="chips">{([['all', 'All'], ['r', 'Red'], ['a', 'Amber'], ['g', 'Green'], ['none', 'Not rated']] as const).map(([v, l]) => <button key={v} className="chip" aria-pressed={filter === v} onClick={() => setFilter(v)}>{l}</button>)}</div>
        </div>
        {profile.subjects.map((s) => <SubjectChecklist key={s.specId} choice={s} filter={filter} />)}
      </div>
    </>
  );
}

function SubjectChecklist({ choice, filter }: { choice: SubjectChoice; filter: Filter }) {
  const [checklist, setChecklist] = useChecklist();
  const [open, setOpen] = useState<number | null>(null);
  const progress = useTopicProgress(choice.specId);
  const spec = specById(choice.specId);
  if (!spec) return null;
  const ratings = checklist[spec.id] || {};
  const g = Object.values(ratings).filter((v) => v === 'g').length;
  const rows = spec.topics.map((name, i) => ({ name, i, r: ratings[i] as Rating | undefined })).filter((x) => filter === 'all' || (filter === 'none' ? !x.r : x.r === filter));
  if (!rows.length) return null;
  const detail = hasSpecContent(spec.id);
  const rate = (i: number, r: Rating) => setChecklist((c) => {
    const cur = { ...(c[spec.id] || {}) };
    if (cur[i] === r) delete cur[i]; else cur[i] = r;
    return { ...c, [spec.id]: cur };
  });
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="row"><span className="sub-tab" style={{ ...colourVar(choice.colour), height: 22 }} /><h2>{spec.subject}</h2><span className="small muted">{spec.board} {spec.code}</span></div>
        <span className="small muted num">{g}/{spec.topics.length} green</span>
      </div>
      <div className="panel-body">
        <div className="meter good" style={{ marginBottom: 6 }}><i style={{ width: Math.round((g / spec.topics.length) * 100) + '%' }} /></div>
        <ul className="list">{rows.map((x) => {
          const papers = spec.papers.filter((p) => !p.topics || p.topics.indexOf(x.i) >= 0).map((p) => p.name.split(':')[0]);
          const pr = detail ? progress(x.i) : null;
          return (
            <li key={x.i} className="item" style={{ flexWrap: 'wrap' }}>
              <div className="grow">
                <div className="title">{x.name}</div>
                <div className="meta">
                  {papers.length < spec.papers.length && <span>{papers.join(', ')}</span>}
                  {detail && <button className="link small" aria-expanded={open === x.i} onClick={() => setOpen(open === x.i ? null : x.i)}>{open === x.i ? 'Hide sub-topics' : pr ? pr.total + ' sub-topics' + (pr.done ? ', ' + pr.done + ' ticked' : '') : 'Sub-topics'}</button>}
                </div>
              </div>
              <div className="rag" role="group" aria-label={'Confidence in ' + x.name}>
                {(['r', 'a', 'g'] as Rating[]).map((r) => <button key={r} className={r} aria-pressed={x.r === r} onClick={() => rate(x.i, r)} title={r === 'r' ? 'Not confident' : r === 'a' ? 'Getting there' : 'Confident'}>{r === 'r' ? 'R' : r === 'a' ? 'A' : 'G'}</button>)}
              </div>
              {open === x.i && <div style={{ flexBasis: '100%' }}><SpecPoints specId={spec.id} topic={x.i} /></div>}
            </li>
          );
        })}</ul>
        {spec.note && <p className="small muted" style={{ marginTop: 10 }}>{spec.note}</p>}
      </div>
    </section>
  );
}
