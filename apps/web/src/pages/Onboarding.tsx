import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChecklist, usePlanner, useProfile, useExamDates } from '../lib/data';
import { cleanText } from '../lib/sanitize';
import { DAY_NAMES } from '../lib/dates';
import { buildPlan } from '../lib/planner';
import { mySittings, upcoming } from '../lib/exams';
import { SubjectPicker } from './Subjects';
import type { Profile, SubjectChoice } from '../lib/types';
import { PRESETS, type PresetId } from '../lib/presets';
import { FREE_PRESETS, effectivePreset } from '../lib/pro';
import { usePro } from './hooks';
import { useAuth } from '../auth/AuthProvider';
import { PriceCards, useBilling } from './Upgrade';


export default function Onboarding() {
  const [profile, setProfile] = useProfile();
  const [, setPlanner] = usePlanner();
  const [checklist] = useChecklist();
  const [dates] = useExamDates();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [subjects, setSubjects] = useState<SubjectChoice[]>(profile.subjects);
  const [wd, setWd] = useState(profile.weekdayMins);
  const [we, setWe] = useState(profile.weekendMins);
  const [rest, setRest] = useState<number[]>(profile.restDays);
  const pro = usePro();
  const auth = useAuth();
  // Everyone who isn't paying sees the Pro step once, including the owner.
  const offerPro = auth.plan !== 'pro';
  const steps = ['Your name', 'Subjects', 'Study time'].concat(offerPro ? ['Your plan'] : []);
  const billing = useBilling();
  const [preset, setPreset] = useState<PresetId>(effectivePreset(profile.planPreset, pro));

  const save = () => {
    const next: Profile = { ...profile, name: cleanText(name, 40), subjects, weekdayMins: wd, weekendMins: we, restDays: rest, planPreset: preset, dailyGoalMins: Math.round((wd * 5 + we * 2) / 7 / 5) * 5, onboarded: true };
    const sittings = mySittings(next, dates);
    setPlanner((p) => ({ ...p, sessions: upcoming(sittings).length ? buildPlan(sittings, checklist, next, [], { proPlans: pro }) : [], builtAt: Date.now() }));
    setProfile(next);
  };
  const finish = () => { save(); nav('/', { replace: true }); };
  // Save first: real checkout leaves the page, and Stripe brings the student back to the app.
  const getPro = async (period: 'month' | 'year') => { save(); if (await billing.go('checkout', period)) nav('/', { replace: true }); };

  return (
    <div className="onboard">
      <header className="lnav" style={{ width: '100%' }}>
        <div className="brand"><span className="brand-mark"><i /></span>Hilite</div>
        <ol className="steps" aria-label="Setup steps">{steps.map((s, i) => <li key={s} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : ''}><span className="num">{i + 1}</span>{s}</li>)}</ol>
      </header>
      <main className="onboard-card" style={step === 3 ? { maxWidth: 880 } : undefined}>
        {step === 0 && (
          <form onSubmit={(e) => { e.preventDefault(); if (cleanText(name)) setStep(1); }}>
            <h1>Welcome to Hilite</h1>
            <p className="lead">Let’s set up your exams. It takes about a minute, and you can change anything later.</p>
            <div className="field"><label htmlFor="nm">What should we call you?</label><input id="nm" className="input" style={{ height: 46, fontSize: 16 }} maxLength={40} autoFocus autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" /></div>
            <div className="onboard-foot"><span /><button className="btn btn-primary btn-lg" disabled={!cleanText(name)}>Continue</button></div>
          </form>
        )}
        {step === 1 && (
          <>
            <h1>Which subjects are you sitting?</h1>
            <p className="lead">Pick your exam board for each one. Hilite loads that spec’s papers, topics and exam dates.</p>
            <SubjectPicker value={subjects} onChange={setSubjects} />
            <div className="onboard-foot"><button className="btn btn-lg btn-ghost" onClick={() => setStep(0)}>Back</button><button className="btn btn-primary btn-lg" disabled={!subjects.length} onClick={() => setStep(2)}>Continue with {subjects.length || 'no'} subjects</button></div>
          </>
        )}
        {step === 2 && (
          <>
            <h1>How much time can you revise?</h1>
            <p className="lead">Be realistic. A plan you can keep beats a perfect one you can’t. Hilite fits every topic in before each paper.</p>
            <div className="field-row">
              <div className="field"><label htmlFor="wd">On a school day</label><select id="wd" className="select" value={wd} onChange={(e) => setWd(Number(e.target.value))}>{[30, 45, 60, 90, 120, 150, 180].map((n) => <option key={n} value={n}>{n < 60 ? n + ' minutes' : n / 60 + (n === 60 ? ' hour' : ' hours')}</option>)}</select></div>
              <div className="field"><label htmlFor="we">On a weekend day</label><select id="we" className="select" value={we} onChange={(e) => setWe(Number(e.target.value))}>{[60, 90, 120, 180, 240, 300, 360].map((n) => <option key={n} value={n}>{n / 60 + (n === 60 ? ' hour' : ' hours')}</option>)}</select></div>
            </div>
            <div className="field"><span className="label">Days off</span>
              <div className="chips">{DAY_NAMES.map((d, i) => <button key={d} className="chip" aria-pressed={rest.indexOf(i) >= 0} onClick={() => setRest(rest.indexOf(i) >= 0 ? rest.filter((x) => x !== i) : rest.concat(i))}>{d}</button>)}</div>
              <span className="hint">Optional. Nothing is planned on days off.</span>
            </div>
            <div className="field"><label htmlFor="ps">Plan style</label>
              <select id="ps" className="select" value={preset} onChange={(e) => setPreset(e.target.value as PresetId)}>
                {pro && <option value="auto">Auto: matched to each subject (recommended)</option>}
                {PRESETS.filter((p) => pro || FREE_PRESETS.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}: {p.bestFor}</option>)}
              </select>
              <span className="hint">Which revision methods your plan uses and how they’re spaced. You can change it any time in the planner.{!pro && ' Pro adds six more styles, including one matched to each subject.'}</span>
            </div>
            <div className="onboard-foot"><button className="btn btn-lg btn-ghost" onClick={() => setStep(1)}>Back</button>{offerPro ? <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Continue</button> : <button className="btn btn-primary btn-lg" onClick={finish}>Build my plan</button>}</div>
          </>
        )}
        {step === 3 && (
          <>
            <h1>Free or Pro?</h1>
            <p className="lead">Free has everything you need to revise, for good. Pro adds the AI coach, AI marking, every practice question and the deeper tools. You can upgrade later from Settings.</p>
            <PriceCards cta={(period) => <button className="btn btn-primary btn-block btn-lg" disabled={billing.busy} onClick={() => getPro(period)}>{billing.busy ? 'Opening checkout…' : 'Get Pro'}</button>} />
            <div className="onboard-foot"><button className="btn btn-lg btn-ghost" onClick={() => setStep(2)}>Back</button><button className="btn btn-lg" onClick={finish}>Continue with Free</button></div>
          </>
        )}
      </main>
    </div>
  );
}
