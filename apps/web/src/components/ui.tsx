import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { IconCheck, IconX } from './icons';
import { SUBJECT_COLOURS } from '../lib/types';

const ToastCtx = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const show = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">{items.map((i) => <div className="toast" key={i.id}>{i.msg}</div>)}</div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { width: 'min(720px, 100%)' } : undefined}>
        <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><IconX /></button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Tick({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return <button className={'tick' + (on ? ' on' : '')} onClick={onClick} aria-pressed={on} aria-label={label}><IconCheck /></button>;
}
export function Dot({ colour }: { colour: number }) {
  return <span className="dot" style={{ ['--c' as string]: SUBJECT_COLOURS[colour % SUBJECT_COLOURS.length] }} />;
}
export const colourVar = (colour: number) => ({ ['--c' as string]: SUBJECT_COLOURS[colour % SUBJECT_COLOURS.length] });

export function Empty({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty"><h3>{title}</h3><p>{children}</p>{action}</div>;
}
export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}
export function Bars({ values, labels, unit }: { values: number[]; labels: string[]; unit?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="bars" role="img" aria-label={'Chart: ' + values.join(', ') + (unit ? ' ' + unit : '')}>
      {values.map((v, i) => (
        <div key={i} title={v + (unit ? ' ' + unit : '')}>
          <i className={v ? '' : 'zero'} style={{ height: Math.max(2, (v / max) * 100) + '%' }} />
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
