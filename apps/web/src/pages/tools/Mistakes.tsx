import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { Empty, colourVar, useToast } from '../../components/ui';
import { IconEdit, IconLock, IconPlus } from '../../components/icons';
import { MistakeModal } from '../../components/MistakeModal';
import { topicName } from '../../components/pickers';
import { useMistakes, useProfile } from '../../lib/data';
import { isDueMistake, mistakePattern, retest } from '../../lib/mistakes';
import { relDay } from '../../lib/dates';
import { shuffle } from '../../lib/srs';
import { MISTAKE_KINDS, type Mistake, type MistakeKind } from '../../lib/types';
import { subjectName, useColourOf, usePro } from '../hooks';

export default function Mistakes() {
  const [log, setLog] = useMistakes();
  const [profile] = useProfile();
  const [params] = useSearchParams();
  const colourOf = useColourOf();
  const pro = usePro();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Mistake | null>(null);
  const [specFilter, setSpecFilter] = useState(params.get('spec') || '');
  const [kindFilter, setKindFilter] = useState<MistakeKind | ''>('');
  const [showCleared, setShowCleared] = useState(false);
  const [queue, setQueue] = useState<string[] | null>(() => (params.get('retest') ? dueIds(log.list, params.get('spec')) : null));

  const open = log.list.filter((m) => !m.cleared);
  const due = log.list.filter(isDueMistake);
  const cleared = log.list.length - open.length;
  const pattern = mistakePattern(log.list);
  const patMax = Math.max(1, ...pattern.map((p) => p.n));
  const rows = log.list
    .filter((m) => (showCleared ? true : !m.cleared) && (!specFilter || m.specId === specFilter) && (!kindFilter || m.kind === kindFilter))
    .sort((a, b) => b.at - a.at);

  if (queue) return <Retest ids={queue} onDone={(n, right) => { setQueue(null); toast(n ? right + ' of ' + n + ' right. Wrong ones come back tomorrow.' : 'Nothing due'); }} />;

  return (
    <>
      <Topbar title="Mistake log" sub="Every lost mark, why it happened, and a retest until it sticks">
        <button className="btn" onClick={() => setAdding(true)}><IconPlus />Log a mistake</button>
        <button className="btn btn-primary" disabled={!due.length} onClick={() => setQueue(dueIds(log.list, specFilter))}>{due.length ? 'Retest ' + due.length + ' due' : 'Nothing due'}</button>
      </Topbar>
      <div className="content stack">
        <div className="grid">
          <section className="panel panel-pad c8">
            <div className="row wrap" style={{ gap: 32 }}>
              <div className="stat"><div className="v">{open.length}</div><div className="k">open</div></div>
              <div className="stat"><div className="v">{due.length}</div><div className="k">due to retest</div></div>
              <div className="stat"><div className="v">{cleared}</div><div className="k">cleared</div></div>
            </div>
            <p className="small muted" style={{ marginTop: 14 }}>Each mistake comes back after 1, 3 and 7 days. Get it right three times in a row and it’s cleared. Only count it if you got it without looking.</p>
            {!pro && <p className="small muted" style={{ marginTop: 6 }}>With <Link to="/upgrade">Pro</Link>, the AI coach writes new questions that test the same ideas as your mistakes, and marks your answers.</p>}
          </section>
          <section className="panel c4">
            <div className="panel-head"><h2>Why you lose marks</h2><span className="small muted">60 days</span></div>
            <div className="panel-body">
              {!pro ? <p className="small muted"><IconLock width={14} height={14} style={{ verticalAlign: '-2px' }} /> {pattern.length ? 'Hilite has found a pattern in your ' + pattern.reduce((a, p) => a + p.n, 0) + ' recent mistakes.' : 'Hilite spots patterns in why you lose marks.'} See whether it’s content, technique, misreading or timing, and what to do about it, with <Link to="/upgrade">Pro</Link>.</p>
                : !pattern.length ? <p className="small muted">Log a few mistakes and the pattern shows here.</p> : (
                <>
                  {pattern.map((p) => (
                    <div key={p.kind} className="hbar" style={{ gridTemplateColumns: '130px 1fr 30px' }}>
                      <span>{MISTAKE_KINDS[p.kind].name}</span><div className="meter"><i style={{ width: Math.round((p.n / patMax) * 100) + '%' }} /></div><b>{p.n}</b>
                    </div>
                  ))}
                  <p className="small" style={{ marginTop: 10 }}>Most common: {MISTAKE_KINDS[pattern[0].kind].name.toLowerCase()}. {MISTAKE_KINDS[pattern[0].kind].hint} <Link to={'/guides/' + MISTAKE_KINDS[pattern[0].kind].guide}>Read the guide</Link></p>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="row between wrap">
          <div className="chips">
            <button className="chip" aria-pressed={!specFilter} onClick={() => setSpecFilter('')}>All subjects</button>
            {profile.subjects.map((s) => <button key={s.specId} className="chip" aria-pressed={specFilter === s.specId} onClick={() => setSpecFilter(s.specId)}><span className="dot" style={colourVar(s.colour)} />{subjectName(s.specId)}</button>)}
          </div>
          <div className="row">
            <select className="select" style={{ width: 'auto', height: 34 }} value={kindFilter} onChange={(e) => setKindFilter(e.target.value as MistakeKind | '')} aria-label="Kind of mistake">
              <option value="">Every kind</option>
              {(Object.keys(MISTAKE_KINDS) as MistakeKind[]).map((k) => <option key={k} value={k}>{MISTAKE_KINDS[k].name}</option>)}
            </select>
            <label className="check small"><input type="checkbox" checked={showCleared} onChange={(e) => setShowCleared(e.target.checked)} />Show cleared</label>
          </div>
        </div>

        <section className="panel">
          <div className="panel-body">
            {!rows.length ? (
              <Empty title={log.list.length ? 'Nothing matches' : 'No mistakes logged yet'} action={!log.list.length && <button className="btn btn-primary" onClick={() => setAdding(true)}>Log a mistake</button>}>
                After marking a past paper, quiz or blurt, add each mark you lost here with the right answer. It’s the quickest way to stop losing the same marks twice.
              </Empty>
            ) : (
              <ul className="list">{rows.map((m) => (
                <li key={m.id} className={'item' + (m.cleared ? ' done' : '')}>
                  <span className="sub-tab" style={colourVar(colourOf(m.specId))} />
                  <div className="grow">
                    <div className="title" style={{ whiteSpace: 'pre-wrap' }}>{m.what}</div>
                    <div className="small muted" style={{ whiteSpace: 'pre-wrap', marginTop: 2 }}>{m.fix}</div>
                    <div className="meta">
                      <span>{subjectName(m.specId)}{topicName(m.specId, m.topic) ? ', ' + topicName(m.specId, m.topic) : ''}</span>
                      <span>{MISTAKE_KINDS[m.kind].name}</span>
                      {m.source === 'coach' && <span>From the AI coach</span>}
                      {m.cleared ? <span className="tag good">Cleared</span> : isDueMistake(m) ? <span className="tag hl">Due</span> : <span>Next retest {relDay(m.due).toLowerCase()}</span>}
                    </div>
                  </div>
                  <button className="icon-btn" aria-label="Edit mistake" onClick={() => setEditing(m)}><IconEdit /></button>
                  <button className="btn btn-sm btn-ghost btn-danger" onClick={() => { setLog((l) => ({ list: l.list.filter((x) => x.id !== m.id) })); toast('Removed'); }}>Remove</button>
                </li>
              ))}</ul>
            )}
          </div>
        </section>
      </div>
      {adding && <MistakeModal source="own" initial={{ specId: specFilter || profile.subjects[0]?.specId }} onClose={() => setAdding(false)} />}
      {editing && <MistakeModal source={editing.source} initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

const dueIds = (list: Mistake[], specId?: string | null) => shuffle(list.filter((m) => isDueMistake(m) && (!specId || m.specId === specId))).map((m) => m.id);

function Retest({ ids, onDone }: { ids: string[]; onDone: (n: number, right: number) => void }) {
  const [log, setLog] = useMistakes();
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [right, setRight] = useState(0);
  const m = log.list.find((x) => x.id === ids[i]);
  if (!m) return <div className="content"><button className="btn" onClick={() => onDone(i, right)}>Back to the log</button></div>;
  const answer = (got: boolean) => {
    setLog((l) => ({ list: l.list.map((x) => (x.id === m.id ? retest(x, got) : x)) }));
    if (got) setRight(right + 1);
    setShown(false);
    if (i + 1 >= ids.length) onDone(ids.length, right + (got ? 1 : 0)); else setI(i + 1);
  };
  return (
    <>
      <Topbar title="Retest your mistakes" sub={subjectName(m.specId) + (topicName(m.specId, m.topic) ? ', ' + topicName(m.specId, m.topic) : '')}>
        <button className="btn" onClick={() => onDone(i, right)}>End</button>
      </Topbar>
      <div className="content" style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
        <div className="row between small muted" style={{ marginBottom: 8 }}><span>{ids.length - i} left</span><span>{MISTAKE_KINDS[m.kind].name}</span></div>
        <div className="meter" style={{ marginBottom: 18 }}><i style={{ width: Math.round((i / ids.length) * 100) + '%' }} /></div>
        <div className="panel card-face" style={{ cursor: shown ? 'default' : 'pointer', fontSize: 19 }} onClick={() => setShown(true)} role="button" tabIndex={0} aria-label={shown ? 'Answer' : 'Question, press to show the answer'}>
          {shown ? <div><div className="small muted" style={{ marginBottom: 10 }}>{m.what}</div><div style={{ fontWeight: 500 }}>{m.fix}</div></div> : m.what}
        </div>
        {!shown ? <p className="small muted" style={{ textAlign: 'center', marginTop: 12 }}>Answer it in your head or on paper first, then show the fix.</p> : (
          <div className="row" style={{ marginTop: 14, justifyContent: 'center' }}>
            <button className="btn btn-lg" onClick={() => answer(false)}>Not yet</button>
            <button className="btn btn-lg btn-primary" autoFocus onClick={() => answer(true)}>I got it right</button>
          </div>
        )}
        <p className="small muted" style={{ textAlign: 'center', marginTop: 14 }}>{MISTAKE_KINDS[m.kind].hint}</p>
      </div>
    </>
  );
}
