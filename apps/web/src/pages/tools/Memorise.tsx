import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { Empty, Modal, Seg } from '../../components/ui';
import { IconPlus } from '../../components/icons';
import { useToolTarget } from '../../components/pickers';
import { useMemos, useProfile } from '../../lib/data';
import { normAnswer } from '../../lib/srs';
import { cleanText, uid } from '../../lib/sanitize';
import type { MemoItem } from '../../lib/types';
import { subjectName, usePro } from '../hooks';
import { FREE_LIMITS } from '../../lib/pro';

const LEVELS = ['Read it', 'Every 4th word', 'Every other word', 'First letters', 'From memory'];
const hidden = (level: number, i: number) => level === 1 ? i % 4 === 3 : level === 2 ? i % 2 === 1 : level >= 3;

/** Words in the original that the typed attempt got, in order (longest common subsequence). */
function compare(original: string[], typed: string[]): boolean[] {
  const a = original.map(normAnswer), b = typed.map(normAnswer);
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) d[i][j] = a[i] === b[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  const got = new Array(m).fill(false);
  let i = 0, j = 0;
  while (i < m && j < n) { if (a[i] === b[j]) { got[i] = true; i++; j++; } else if (d[i + 1][j] >= d[i][j + 1]) i++; else j++; }
  return got;
}

export default function Memorise() {
  const target = useToolTarget();
  const [memos, setMemos] = useMemos();
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<boolean[] | null>(null);
  const item = memos.list.find((m) => m.id === openId);
  const pro = usePro();
  const full = !pro && memos.list.length >= FREE_LIMITS.memos;
  const words = useMemo(() => (item ? item.text.split(/\s+/).filter(Boolean) : []), [item]);
  const level = item?.level ?? 0;
  const setItem = (patch: Partial<MemoItem>) => setMemos((x) => ({ list: x.list.map((m) => (m.id === openId ? { ...m, ...patch, updated: Date.now() } : m)) }));
  const setLevel = (l: number) => { setItem({ level: l }); setShown(new Set()); setTyped(''); setResult(null); };
  const check = () => {
    const got = compare(words, typed.split(/\s+/).filter(Boolean));
    setResult(got);
    const pct = Math.round((got.filter(Boolean).length / Math.max(1, words.length)) * 100);
    if (pct > (item?.best ?? 0)) setItem({ best: pct });
  };
  const score = result ? Math.round((result.filter(Boolean).length / Math.max(1, words.length)) * 100) : null;
  const forSubject = memos.list.filter((m) => !target.specId || !m.specId || m.specId === target.specId);

  return (
    <>
      <Topbar title="Memoriser" sub={item ? item.title : 'Learn quotes, definitions and equations word for word'}>
        <Link className="btn btn-ghost" to="/guides/memorising">How to memorise</Link>
        {item ? <button className="btn" onClick={() => setOpenId(null)}>All items</button> : <button className="btn btn-primary" disabled={full} onClick={() => setAdding(true)}><IconPlus />Add something to learn</button>}
      </Topbar>
      <div className="content stack" style={{ maxWidth: 900 }}>
        {!item && full && <div className="banner info"><p>You’ve used your {FREE_LIMITS.memos} free items. Pro lets you learn as many quotes, equations and definitions as you need.</p><Link className="btn btn-sm" to="/upgrade">See Pro</Link></div>}
        {!item ? (
          <section className="panel"><div className="panel-body">
            {!forSubject.length ? <Empty title="Nothing to memorise yet" action={<button className="btn btn-primary" onClick={() => setAdding(true)}>Add a quote or definition</button>}>Add a quote, a definition, an equation or a list. Each round hides more of it until you can write it from nothing.</Empty> : (
              <ul className="list">{forSubject.slice().sort((a, b) => b.updated - a.updated).map((m) => (
                <li key={m.id} className="item" style={{ cursor: 'pointer' }} onClick={() => { setOpenId(m.id); setShown(new Set()); setTyped(''); setResult(null); }}>
                  <div className="grow"><div className="title">{m.title}</div><div className="meta"><span>{subjectName(m.specId)}</span><span>{LEVELS[m.level]}</span>{m.best > 0 && <span className="num">Best {m.best}%</span>}</div></div>
                  {m.best >= 90 && m.level >= 4 ? <span className="tag good">Learnt</span> : <span className="tag">Level {m.level + 1} of 5</span>}
                  <button className="btn btn-sm btn-ghost btn-danger" onClick={(e) => { e.stopPropagation(); setMemos((x) => ({ list: x.list.filter((y) => y.id !== m.id) })); }}>Delete</button>
                </li>
              ))}</ul>
            )}
          </div></section>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}><Seg label="Level" value={String(level)} onChange={(v) => setLevel(Number(v))} options={LEVELS.map((l, i) => [String(i), (i + 1) + '. ' + l] as [string, string])} /></div>
            <section className="panel panel-pad">
              {level < 4 ? (
                <p className="memo-text">{words.map((w, i) => {
                  if (!hidden(level, i) || shown.has(i)) return <span key={i} className={shown.has(i) ? 'gap-shown' : ''}>{w} </span>;
                  if (level === 3) return <span key={i}>{w.match(/^[^\p{L}\p{N}]*[\p{L}\p{N}]?/u)?.[0] ?? w[0]}<button className="gap" style={{ width: Math.max(1, w.length - 1) + 'ch' }} aria-label="Show this word" onClick={() => setShown(new Set(shown).add(i))} /> </span>;
                  return <span key={i}><button className="gap" style={{ width: w.length + 'ch' }} aria-label="Show this word" onClick={() => setShown(new Set(shown).add(i))} /> </span>;
                })}</p>
              ) : <p className="muted">Write the whole thing from memory below.</p>}
              <p className="small muted" style={{ marginTop: 12 }}>{level === 0 ? 'Read it a couple of times, out loud if you can. Then move to level 2.' : level < 4 ? 'Say the hidden words before you tap them. Then type the whole thing below to check.' : 'No hints. Type it, then check.'}</p>
            </section>
            {level > 0 && (
              <section className="panel panel-pad">
                <div className="field"><label htmlFor="ty">Type it out</label><textarea id="ty" className="textarea" value={typed} onChange={(e) => { setTyped(e.target.value); setResult(null); }} maxLength={4000} /></div>
                <div className="row between wrap">
                  {score != null ? <b className="num">{score}% of words right{score >= 90 && level < 4 ? '. Ready for the next level.' : ''}</b> : <span />}
                  <div className="row">
                    {score != null && score >= 90 && level < 4 && <button className="btn" onClick={() => setLevel(level + 1)}>Next level</button>}
                    <button className="btn btn-primary" disabled={!typed.trim()} onClick={check}>Check</button>
                  </div>
                </div>
                {result && <p className="memo-diff" style={{ marginTop: 12 }}>{words.map((w, i) => <span key={i} className={result[i] ? '' : 'miss'}>{w} </span>)}</p>}
              </section>
            )}
          </>
        )}
      </div>
      {adding && <AddMemo specId={target.specId} onClose={() => setAdding(false)} onSave={(m) => { setMemos((x) => ({ list: x.list.concat(m).slice(-300) })); setAdding(false); setOpenId(m.id); }} />}
    </>
  );
}

function AddMemo({ specId: initial, onClose, onSave }: { specId: string; onClose: () => void; onSave: (m: MemoItem) => void }) {
  const [profile] = useProfile();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [specId, setSpecId] = useState(initial);
  const ok = cleanText(text).split(/\s+/).length >= 2;
  return (
    <Modal title="Add something to learn" onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" disabled={!ok} onClick={() => onSave({ id: uid(), title: cleanText(title, 80) || cleanText(text, 40) + '…', text: cleanText(text, 1500), specId: specId || undefined, level: 0, best: 0, updated: Date.now() })}>Add</button></>}>
      <div className="field"><label htmlFor="mt">Name</label><input id="mt" className="input" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Macbeth, “Stars, hide your fires”" autoFocus /></div>
      <div className="field"><label htmlFor="mx">What to learn</label><textarea id="mx" className="textarea" maxLength={1500} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the exact wording" /></div>
      <div className="field"><label htmlFor="ms">Subject</label><select id="ms" className="select" value={specId} onChange={(e) => setSpecId(e.target.value)}><option value="">None</option>{profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}</select></div>
    </Modal>
  );
}
