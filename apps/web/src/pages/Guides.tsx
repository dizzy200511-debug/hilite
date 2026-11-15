import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { IconArrowLeft } from '../components/icons';
import { GUIDE_KINDS, GUIDES, guideById, type Guide, type GuideKind } from '../content/guides';
import { specById } from '../catalog/catalog';
import { PRESETS, subjectKind } from '../lib/presets';
import { useProfile } from '../lib/data';
import { FREE_GUIDE_KINDS } from '../lib/pro';
import { IconLock } from '../components/icons';
import { usePro } from './hooks';

function GuideTile({ g }: { g: Guide }) {
  const pro = usePro();
  return (
    <Link to={'/guides/' + g.id} className="tool">
      <span className="row between"><span className="tool-name">{g.title}</span>{!pro && !FREE_GUIDE_KINDS.has(g.kind) && <span className="tag accent">Pro</span>}</span>
      <p>{g.summary}</p>
      {g.time && <span className="tiny faint">{g.time}</span>}
    </Link>
  );
}

export function GuideList() {
  const [profile] = useProfile();
  const [q, setQ] = useState('');
  const mine = new Set(profile.subjects.map((s) => { const sp = specById(s.specId); return sp ? subjectKind(sp) : null; }));
  const forYou = GUIDES.filter((g) => g.kind === 'subject' && g.kinds?.some((k) => mine.has(k)));
  const match = (g: Guide) => !q || (g.title + ' ' + g.summary).toLowerCase().includes(q.toLowerCase());
  return (
    <>
      <Topbar title="Revision guides" sub="How to revise well: methods, subjects and exam technique">
        <input className="input" style={{ width: 220, height: 36 }} placeholder="Search guides" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search guides" />
      </Topbar>
      <div className="content stack">
        {!q && forYou.length > 0 && (
          <section className="stack" style={{ gap: 10 }}>
            <h2 style={{ fontSize: 16 }}>For your subjects</h2>
            <div className="tool-grid">{forYou.map((g) => <GuideTile key={g.id} g={g} />)}</div>
          </section>
        )}
        {(Object.keys(GUIDE_KINDS) as GuideKind[]).map((kind) => {
          const list = GUIDES.filter((g) => g.kind === kind && match(g) && (q || kind !== 'subject' || !forYou.includes(g)));
          if (!list.length) return null;
          return (
            <section key={kind} className="stack" style={{ gap: 10 }}>
              <h2 style={{ fontSize: 16 }}>{kind === 'subject' && forYou.length && !q ? 'Other subjects' : GUIDE_KINDS[kind]}</h2>
              <div className="tool-grid">{list.map((g) => <GuideTile key={g.id} g={g} />)}</div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export function GuidePage() {
  const { id = '' } = useParams();
  const pro = usePro();
  const g = guideById(id);
  if (!g) return (<><Topbar title="Guide not found" /><div className="content"><Link to="/guides">All guides</Link></div></>);
  const plans = PRESETS.filter((p) => p.guides.includes(g.id));
  // Subject and exam technique guides: the first section is free, the rest is Pro.
  const locked = !pro && !FREE_GUIDE_KINDS.has(g.kind);
  const sections = locked ? g.sections.slice(0, 1) : g.sections;
  return (
    <>
      <Topbar title={<><Link to="/guides" className="icon-btn" aria-label="All guides" style={{ verticalAlign: 'middle', marginRight: 4 }}><IconArrowLeft /></Link>{g.title}</>} sub={g.summary} />
      <div className="content">
        <div className="grid">
          <article className="panel panel-pad c8 guide">
            {g.time && <p className="small muted">{GUIDE_KINDS[g.kind]}, {g.time.toLowerCase()}</p>}
            {sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p && <p>{s.p}</p>}
                {s.steps && <ol>{s.steps.map((x) => <li key={x}>{x}</li>)}</ol>}
                {s.list && <ul>{s.list.map((x) => <li key={x}>{x}</li>)}</ul>}
              </section>
            ))}
            {locked && (
              <div className="banner info" style={{ marginTop: 18 }}>
                <p><IconLock width={14} height={14} style={{ verticalAlign: '-2px' }} /> The rest of this guide ({g.sections.slice(1).map((s) => s.h.toLowerCase()).join(', ')}) is in Pro, with every subject and exam technique guide.</p>
                <Link className="btn btn-sm" to="/upgrade">See Pro</Link>
              </div>
            )}
          </article>
          <aside className="c4 stack">
            {g.tool && (
              <section className="panel panel-pad">
                <h3 style={{ marginBottom: 10 }}>Do it in Hilite</h3>
                <Link className="btn btn-primary btn-block" to={g.tool[0]}>{g.tool[1]}</Link>
              </section>
            )}
            {plans.length > 0 && (
              <section className="panel">
                <div className="panel-head"><h3>Plans that use this</h3></div>
                <div className="panel-body"><ul className="list">{plans.map((p) => (
                  <li key={p.id} className="item"><div className="grow"><div className="title small">{p.name}</div><div className="meta">{p.bestFor}</div></div></li>
                ))}</ul><Link className="small" to="/planner?style=1">Change your plan style</Link></div>
              </section>
            )}
            <section className="panel">
              <div className="panel-head"><h3>Related guides</h3></div>
              <div className="panel-body"><ul className="list">{g.related.map((r) => guideById(r)).filter(Boolean).map((r) => (
                <li key={r!.id} className="item"><Link to={'/guides/' + r!.id} className="grow small" style={{ fontWeight: 600 }}>{r!.title}</Link></li>
              ))}</ul></div>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
