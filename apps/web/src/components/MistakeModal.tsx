import { useState } from 'react';
import { Modal, useToast } from './ui';
import { SubjectTopicSelect } from './pickers';
import { useMistakes } from '../lib/data';
import { addMistakes, newMistake } from '../lib/mistakes';
import { cleanText } from '../lib/sanitize';
import { MISTAKE_KINDS, type Mistake, type MistakeKind, type MistakeSource } from '../lib/types';

/** Add or edit one entry in the mistake log. Used from past papers, blurts, teach-back and the log itself. */
export function MistakeModal({ initial, source, onClose }: {
  initial?: Partial<Mistake>; source: MistakeSource; onClose: () => void;
}) {
  const [, setLog] = useMistakes();
  const toast = useToast();
  const [specId, setSpecId] = useState(initial?.specId || '');
  const [topic, setTopic] = useState<number | undefined>(initial?.topic);
  const [kind, setKind] = useState<MistakeKind>(initial?.kind || 'knowledge');
  const [what, setWhat] = useState(initial?.what || '');
  const [fix, setFix] = useState(initial?.fix || '');
  const editing = !!initial?.id;
  const ok = !!cleanText(what) && !!cleanText(fix);
  const save = (another: boolean) => {
    if (editing) {
      setLog((l) => ({ list: l.list.map((m) => (m.id === initial!.id ? { ...m, specId: specId || undefined, topic, kind, what: cleanText(what, 1000), fix: cleanText(fix, 1500) } : m)) }));
      toast('Mistake updated');
      onClose();
      return;
    }
    setLog((l) => addMistakes(l, [newMistake({ specId, topic, source, kind, what, fix })]));
    toast('Added to your mistake log. Hilite will retest you tomorrow.');
    if (another) { setWhat(''); setFix(''); } else onClose();
  };
  return (
    <Modal title={editing ? 'Edit mistake' : 'Log a mistake'} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      {!editing && <button className="btn" disabled={!ok} onClick={() => save(true)}>Save and add another</button>}
      <button className="btn btn-primary" disabled={!ok} onClick={() => save(false)}>Save</button>
    </>}>
      <SubjectTopicSelect specId={specId} topic={topic} onChange={(s, t) => { setSpecId(s); setTopic(t); }} idPrefix="mm" />
      <div className="field"><label htmlFor="mk">What kind of mistake?</label>
        <select id="mk" className="select" value={kind} onChange={(e) => setKind(e.target.value as MistakeKind)}>
          {(Object.keys(MISTAKE_KINDS) as MistakeKind[]).map((k) => <option key={k} value={k}>{MISTAKE_KINDS[k].name}</option>)}
        </select>
        <span className="hint">{MISTAKE_KINDS[kind].hint}</span></div>
      <div className="field"><label htmlFor="mw">The question, or what went wrong</label><textarea id="mw" className="textarea" style={{ minHeight: 80 }} maxLength={1000} value={what} onChange={(e) => setWhat(e.target.value)} placeholder="e.g. Explain why the rate of reaction increases with temperature (3 marks)" autoFocus /></div>
      <div className="field"><label htmlFor="mf">The right answer, or what to do next time</label><textarea id="mf" className="textarea" style={{ minHeight: 80 }} maxLength={1500} value={fix} onChange={(e) => setFix(e.target.value)} placeholder="e.g. Particles move faster, so more frequent collisions, and more collisions have energy above the activation energy" /></div>
    </Modal>
  );
}
