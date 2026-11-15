import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { DeviceCheck, Forgot, SignIn, SignUp } from './auth/AuthPages';
import { Shell } from './components/Shell';
import { useProfile } from './lib/data';
import { Privacy, Terms } from './pages/Legal';
import Today from './pages/Today';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Subjects from './pages/Subjects';
import Upgrade from './pages/Upgrade';

const Timetable = lazy(() => import('./pages/Timetable'));
const Planner = lazy(() => import('./pages/Planner'));
const Papers = lazy(() => import('./pages/Papers'));
const Topics = lazy(() => import('./pages/Topics'));
const Focus = lazy(() => import('./pages/Focus'));
const Stats = lazy(() => import('./pages/Stats'));
const Settings = lazy(() => import('./pages/Settings'));
const Owner = lazy(() => import('./pages/Owner'));
const More = lazy(() => import('./pages/More'));
const DeckList = lazy(() => import('./pages/Flashcards').then((m) => ({ default: m.DeckList })));
const DeckPage = lazy(() => import('./pages/Flashcards').then((m) => ({ default: m.DeckPage })));
const Tools = lazy(() => import('./pages/Tools'));
const GuideList = lazy(() => import('./pages/Guides').then((m) => ({ default: m.GuideList })));
const GuidePage = lazy(() => import('./pages/Guides').then((m) => ({ default: m.GuidePage })));
const Coach = lazy(() => import('./pages/Coach'));
const Mistakes = lazy(() => import('./pages/tools/Mistakes'));
const Blurt = lazy(() => import('./pages/tools/Blurt'));
const Teach = lazy(() => import('./pages/tools/Teach'));
const NotesList = lazy(() => import('./pages/tools/Notes').then((m) => ({ default: m.NotesList })));
const NoteEditor = lazy(() => import('./pages/tools/Notes').then((m) => ({ default: m.NoteEditor })));
const MindMap = lazy(() => import('./pages/tools/MindMap'));
const Memorise = lazy(() => import('./pages/tools/Memorise'));
const Mixed = lazy(() => import('./pages/tools/Mixed'));
const CommandWords = lazy(() => import('./pages/tools/CommandWords'));
const Timing = lazy(() => import('./pages/tools/Timing'));
const Target = lazy(() => import('./pages/tools/Target'));
const Study = lazy(() => import('./pages/Flashcards').then((m) => ({ default: m.Study })));

function Splash() {
  return <div className="splash" role="status" aria-label="Loading"><span className="brand-mark"><i /></span></div>;
}

function useTitle() {
  const loc = useLocation();
  useEffect(() => {
    const names: Record<string, string> = { '': 'Today', timetable: 'Exam timetable', planner: 'Revision planner', papers: 'Past papers', topics: 'Topic checklist', flashcards: 'Flashcards', focus: 'Focus timer', tools: 'Revision tools', guides: 'Revision guides', coach: 'AI coach', 'tools/mistakes': 'Mistake log', 'tools/blurt': 'Blurting', 'tools/teach': 'Teach-back', 'tools/notes': 'Cornell notes', 'tools/mindmap': 'Mind maps', 'tools/memorise': 'Memoriser', 'tools/mixed': 'Mixed quiz', 'tools/command-words': 'Command words', 'tools/timing': 'Exam timing', 'tools/target': 'Grade target', stats: 'Progress', subjects: 'Subjects', settings: 'Settings', upgrade: 'Hilite Pro', signin: 'Sign in', signup: 'Create account', forgot: 'Reset password', privacy: 'Privacy', terms: 'Terms' };
    const parts = loc.pathname.split('/');
    const n = names[parts[1] + '/' + parts[2]] || names[parts[1] || ''];
    document.title = n ? n + ' · Hilite' : 'Hilite';
  }, [loc.pathname]);
}

export default function App() {
  const auth = useAuth();
  const [profile] = useProfile();
  useTitle();

  if (auth.loading) return <Splash />;

  const legal = <><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} /><Route path="/welcome" element={<Landing />} /></>;

  if (!auth.user) {
    return (
      <Routes>
        <Route path="/" element={window.hiliteDesktop ? <Navigate to="/signin" replace /> : <Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot" element={<Forgot />} />
        {legal}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }
  if (!auth.deviceTrusted) return <Routes>{legal}<Route path="*" element={<DeviceCheck />} /></Routes>;
  if (!profile.onboarded) return <Routes>{legal}<Route path="*" element={<Onboarding />} /></Routes>;

  return (
    <Suspense fallback={<Splash />}>
      <Routes>
        {legal}
        <Route element={<Shell />}>
          <Route index element={<Today />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="planner" element={<Planner />} />
          <Route path="papers" element={<Papers />} />
          <Route path="topics" element={<Topics />} />
          <Route path="flashcards" element={<DeckList />} />
          <Route path="flashcards/:id" element={<DeckPage />} />
          <Route path="flashcards/:id/study" element={<Study />} />
          <Route path="focus" element={<Focus />} />
          <Route path="tools" element={<Tools />} />
          <Route path="tools/mistakes" element={<Mistakes />} />
          <Route path="tools/blurt" element={<Blurt />} />
          <Route path="tools/teach" element={<Teach />} />
          <Route path="tools/notes" element={<NotesList />} />
          <Route path="tools/notes/:id" element={<NoteEditor />} />
          <Route path="tools/mindmap" element={<MindMap />} />
          <Route path="tools/memorise" element={<Memorise />} />
          <Route path="tools/mixed" element={<Mixed />} />
          <Route path="tools/command-words" element={<CommandWords />} />
          <Route path="tools/timing" element={<Timing />} />
          <Route path="tools/target" element={<Target />} />
          <Route path="guides" element={<GuideList />} />
          <Route path="guides/:id" element={<GuidePage />} />
          <Route path="coach" element={<Coach />} />
          <Route path="stats" element={<Stats />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="settings" element={<Settings />} />
          <Route path="upgrade" element={<Upgrade />} />
          <Route path="more" element={<More />} />
          {auth.isOwner && <Route path="owner" element={<Owner />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
