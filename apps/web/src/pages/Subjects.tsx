import { useState } from 'react';
import { Topbar } from '../components/Shell';
import { Modal, Seg, colourVar, useToast } from '../components/ui';
import { IconCheck, IconPlus } from '../components/icons';
import { useProfile } from '../lib/data';
import { BOARDS, specById, subjectsFor, type Board, type Spec } from '../catalog/catalog';
import { SUBJECT_COLOURS, type SubjectChoice } from '../lib/types';

const BOARD_LIST: Board[] = ['AQA', 'Edexcel', 'OCR'];

/** Pick subjects from one exam board at a time. Shared by onboarding and the Subjects page. */
export function SubjectPicker({ value, onChange }: { value: SubjectChoice[]; onChange: (v: SubjectChoice[]) => void }) {
  const [board, setBoard] = useState<Board>(() => (value[0] && specById(value[0].specId)?.board) || 'AQA');
  const [q, setQ] = useState('');
  const list = subjectsFor('GCSE', board).filter((s) => !q || s.subject.toLowerCase().includes(q.toLowerCase()));
  const has = (id: string) => value.find((v) => v.specId === id);
  const nextColour = () => { const used = new Set(value.map((v) => v.colour)); for (let i = 0; i < SUBJECT_COLOURS.length; i++) if (!used.has(i)) return i; return value.length % SUBJECT_COLOURS.length; };
  const toggle = (s: Spec) => {
    if (has(s.id)) onChange(value.filter((v) => v.specId !== s.id));
    else {
      // You only sit one version of a subject, so picking AQA Biology replaces another board's Biology.
      const rest = value.filter((v) => specById(v.specId)?.subject !== s.subject);
      onChange(rest.concat({ specId: s.id, colour: nextColour(), tier: s.tiered ? 'H' : undefined }));
    }
  };
  const setTier = (id: string, tier: 'F' | 'H') => onChange(value.map((v) => (v.specId === id ? { ...v, tier } : v)));
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row wrap between">
        <Seg label="Qualification" value="GCSE" onChange={() => undefined} options={[['GCSE', 'GCSE']]} />
        <span className="small muted">A-level is coming next.</span>
      </div>
      <div className="row wrap between">
        <div className="chips" role="tablist" aria-label="Exam board">{BOARD_LIST.map((b) => <button key={b} className="chip" role="tab" aria-pressed={board === b} onClick={() => setBoard(b)}>{BOARDS[b].name}<span className="faint num" style={{ marginLeft: 6 }}>{value.filter((v) => specById(v.specId)?.board === b).length || ''}</span></button>)}</div>
        <input className="input" style={{ width: 200, height: 34 }} placeholder="Search subjects" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search subjects" />
      </div>
      <ul className="list" style={{ maxHeight: 360, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 12, padding: '0 14px' }}>
        {list.map((s) => {
          const pick = has(s.id);
          return (
            <li key={s.id} className="item">
              <button className="tick" aria-pressed={!!pick} aria-label={(pick ? 'Remove ' : 'Add ') + s.subject} onClick={() => toggle(s)} style={pick ? { ...colourVar(pick.colour), background: 'var(--c)', borderColor: 'var(--c)' } : undefined}><IconCheck /></button>
              <div className="grow" style={{ cursor: 'pointer' }} onClick={() => toggle(s)}>
                <div className="title">{s.subject}</div>
                <div className="meta"><span className="num">{s.code}</span><span>{s.papers.length} papers</span>{!s.papers.some((p) => p.sitting) && <span>No dates yet</span>}</div>
              </div>
              {pick && s.tiered && <Seg label={'Tier for ' + s.subject} value={pick.tier || 'H'} onChange={(t: 'F' | 'H') => setTier(s.id, t)} options={[['F', 'Foundation'], ['H', 'Higher']]} />}
            </li>
          );
        })}
        {!list.length && <li className="item small muted">No subjects match.</li>}
      </ul>
      <p className="small muted">Can’t find a subject? Pick the closest one and add your own exam dates on the timetable, or tell us and we’ll add it.</p>
    </div>
  );
}

export default function Subjects() {
  const [profile, setProfile] = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SubjectChoice[]>(profile.subjects);
  const toast = useToast();
  const recolour = (id: string, colour: number) => setProfile((p) => ({ ...p, subjects: p.subjects.map((s) => (s.specId === id ? { ...s, colour } : s)) }));
  return (
    <>
      <Topbar title="Subjects" sub={profile.subjects.length + ' subjects'}>
        <button className="btn btn-primary" onClick={() => { setDraft(profile.subjects); setEditing(true); }}><IconPlus />Add or remove</button>
      </Topbar>
      <div className="content">
        <div className="grid">
          {profile.subjects.map((s) => {
            const spec = specById(s.specId);
            if (!spec) return null;
            const next = spec.papers.filter((p) => p.sitting).map((p) => p.sitting!.date).sort()[0];
            return (
              <section key={s.specId} className="panel panel-pad c6" style={colourVar(s.colour)}>
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}><span className="sub-tab" style={{ height: 40 }} />
                    <div><h3>{spec.subject}</h3><div className="small muted">{BOARDS[spec.board].name} {spec.qual}, <span className="num">{spec.code}</span>{s.tier ? ', ' + (s.tier === 'H' ? 'Higher' : 'Foundation') : ''}</div></div>
                  </div>
                  <a className="btn btn-sm" href={BOARDS[spec.board].pastPapers} target="_blank" rel="noopener noreferrer">Past papers</a>
                </div>
                <div className="row wrap small muted" style={{ marginTop: 14, gap: 16 }}>
                  <span>{spec.topics.length} topics</span><span>{spec.papers.length} papers</span>
                  <span>{next ? 'First exam ' + new Date(next + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'No exam dates yet'}</span>
                </div>
                <div className="row" style={{ marginTop: 14, gap: 6 }} aria-label="Colour">
                  {SUBJECT_COLOURS.map((c, i) => <button key={c} aria-label={'Colour ' + (i + 1)} aria-pressed={s.colour === i} onClick={() => recolour(s.specId, i)} style={{ width: 20, height: 20, borderRadius: 6, background: c, border: s.colour === i ? '2px solid var(--ink)' : '2px solid transparent', outline: s.colour === i ? '1px solid var(--bg)' : 'none', outlineOffset: -3, cursor: 'pointer' }} />)}
                </div>
                {spec.note && <p className="small muted" style={{ marginTop: 12 }}>{spec.note}</p>}
              </section>
            );
          })}
        </div>
      </div>
      {editing && <Modal title="Your subjects" wide onClose={() => setEditing(false)} footer={<><button className="btn" onClick={() => setEditing(false)}>Cancel</button><button className="btn btn-primary" disabled={!draft.length} onClick={() => { setProfile((p) => ({ ...p, subjects: draft })); setEditing(false); toast('Subjects saved. Rebuild your plan to include changes.'); }}>Save {draft.length} subjects</button></>}>
        <SubjectPicker value={draft} onChange={setDraft} />
      </Modal>}
    </>
  );
}
