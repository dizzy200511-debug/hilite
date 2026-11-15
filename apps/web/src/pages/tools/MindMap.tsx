import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { Empty, colourVar } from '../../components/ui';
import { IconPlus } from '../../components/icons';
import { SubjectTopicSelect, topicName, useToolTarget } from '../../components/pickers';
import { useMindMaps } from '../../lib/data';
import { uid } from '../../lib/sanitize';
import type { MindMap as Map } from '../../lib/types';
import { subjectName, usePro } from '../hooks';
import { FREE_LIMITS } from '../../lib/pro';

interface Node { text: string; kids: Node[] }

/** Indented lines to a tree. Two spaces, a tab or a leading dash each add a level. */
export function parseOutline(text: string): Node[] {
  const root: Node = { text: '', kids: [] };
  const stack: { depth: number; node: Node }[] = [{ depth: -1, node: root }];
  text.split('\n').forEach((raw) => {
    if (!raw.trim()) return;
    const lead = raw.match(/^[\t ]*/)![0].replace(/\t/g, '  ').length;
    const dashes = raw.trim().match(/^-+/)?.[0].length ?? 0;
    const depth = Math.floor(lead / 2) + Math.max(0, dashes - 1);
    const node = { text: raw.trim().replace(/^-+\s*/, ''), kids: [] };
    if (!node.text) return;
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
    stack[stack.length - 1].node.kids.push(node);
    stack.push({ depth, node });
  });
  return root.kids;
}

function Kids({ list }: { list: Node[] }) {
  if (!list.length) return null;
  return <ul>{list.map((k, i) => <li key={i}>{k.text}<Kids list={k.kids} /></li>)}</ul>;
}

export default function MindMap() {
  const target = useToolTarget();
  const [maps, setMaps] = useMindMaps();
  const [openId, setOpenId] = useState<string | null>(() => maps.list.find((m) => m.specId === target.specId && m.topic === target.topic && target.topic != null)?.id ?? null);
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const map = maps.list.find((m) => m.id === openId);
  const pro = usePro();
  const full = !pro && maps.list.length >= FREE_LIMITS.mindmaps;
  const update = (patch: Partial<Map>) => setMaps((x) => ({ list: x.list.map((m) => (m.id === openId ? { ...m, ...patch, updated: Date.now() } : m)) }));
  const create = () => {
    if (full) return;
    const id = uid();
    setMaps((x) => ({ list: x.list.concat({ id, title: topicName(target.specId, target.topic) || 'New mind map', specId: target.specId || undefined, topic: target.topic, outline: '', updated: Date.now() }).slice(-150) }));
    setOpenId(id); setHide(false);
  };
  const tree = map ? parseOutline(map.outline) : [];

  return (
    <>
      <Topbar title="Mind maps" sub={map ? subjectName(map.specId) : 'Show how a topic fits together, then rebuild it from memory'}>
        <Link className="btn btn-ghost" to="/guides/mind-maps">How to use them</Link>
        {map ? <button className="btn" onClick={() => setOpenId(null)}>All maps</button> : <button className="btn btn-primary" disabled={full} onClick={create}><IconPlus />New mind map</button>}
      </Topbar>
      <div className="content stack">
        {!map && full && <div className="banner info"><p>You’ve used your {FREE_LIMITS.mindmaps} free mind maps. Pro gives you as many as you need.</p><Link className="btn btn-sm" to="/upgrade">See Pro</Link></div>}
        {!map ? (
          <section className="panel"><div className="panel-body">
            {!maps.list.length ? <Empty title="No mind maps yet" action={<button className="btn btn-primary" onClick={create}>Make one</button>}>Type an outline: each main branch on its own line, with details indented underneath. Hilite lays it out as a map.</Empty> : (
              <ul className="list">{maps.list.slice().sort((a, b) => b.updated - a.updated).map((m) => (
                <li key={m.id} className="item" style={{ cursor: 'pointer' }} onClick={() => { setOpenId(m.id); setHide(false); }}>
                  <div className="grow"><div className="title">{m.title}</div><div className="meta"><span>{subjectName(m.specId)}</span><span>{parseOutline(m.outline).length} branches</span></div></div>
                  <button className="btn btn-sm btn-ghost btn-danger" onClick={(e) => { e.stopPropagation(); setMaps((x) => ({ list: x.list.filter((y) => y.id !== m.id) })); }}>Delete</button>
                </li>
              ))}</ul>
            )}
          </div></section>
        ) : (
          <div className="grid">
            <section className="panel panel-pad c5">
              <div className="field"><label htmlFor="mt">Title</label><input id="mt" className="input" maxLength={80} value={map.title} onChange={(e) => update({ title: e.target.value.slice(0, 80) })} /></div>
              <SubjectTopicSelect specId={map.specId || ''} topic={map.topic} onChange={(s, t) => update({ specId: s || undefined, topic: t })} idPrefix="mp" />
              <div className="field"><label htmlFor="mo">Outline</label>
                <textarea id="mo" className="textarea" style={{ minHeight: 300, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13.5 }} value={map.outline} maxLength={6000} onChange={(e) => update({ outline: e.target.value })}
                  placeholder={'Causes of WW1\n  Militarism\n    Arms race\n    Naval race\n  Alliances\n    Triple Entente\n  Imperialism'} />
                <span className="hint">Do it from memory first. Then check your notes and add what you missed.</span></div>
            </section>
            <section className="panel panel-pad c7">
              <div className="row between" style={{ marginBottom: 12 }}>
                <span className="mm-center">{map.title}</span>
                <label className="check small"><input type="checkbox" checked={hide} onChange={(e) => { setHide(e.target.checked); setShown(new Set()); }} />Hide details</label>
              </div>
              {!tree.length ? <p className="small muted">Your map appears here as you type.</p> : (
                <div className="mm-branches">{tree.map((b, i) => (
                  <div key={i} className="mm-branch" style={colourVar(i)}>
                    <b>{b.text}</b>
                    {hide && !shown.has(i) ? (b.kids.length > 0 && <button className="link small" onClick={() => setShown(new Set(shown).add(i))}>Recall {b.kids.length} {b.kids.length === 1 ? 'point' : 'points'}, then show</button>) : <Kids list={b.kids} />}
                  </div>
                ))}</div>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
