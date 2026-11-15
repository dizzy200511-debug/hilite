import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const UPDATED = '5 November 2026';
const CONTACT = 'hello@hilite.study';

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="landing">
      <header className="lnav"><Link to="/" className="brand" style={{ color: 'var(--ink)' }}><span className="brand-mark"><i /></span>Hilite</Link></header>
      <article className="legal"><h1>{title}</h1><p className="small muted">Last updated {UPDATED}</p>{children}</article>
    </div>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy policy">
      <p>Hilite is a revision app built for students, many of whom are under 18. We collect as little as we can, we never sell data, and we never show ads.</p>
      <h2>What we store</h2>
      <ul>
        <li><b>Your account:</b> your email address, and a securely hashed password if you don’t use Google sign-in. We never see your password.</li>
        <li><b>What you make in Hilite:</b> your subjects, plan, flashcards, paper marks, topic ratings and timer history. This is stored so it syncs between your devices.</li>
        <li><b>Your devices:</b> a random code for each device you sign in on, stored only as a one-way hash, so we can ask for an email code on new devices.</li>
        <li><b>Payments:</b> if you buy Pro, Stripe handles the card. We only keep whether you’re on Pro.</li>
        <li><b>AI features (Pro):</b> a count of how many AI requests you make each day, so we can limit use. We don’t keep a separate copy of what you send.</li>
      </ul>
      <h2>What we don’t do</h2>
      <ul>
        <li>No advertising, no ad trackers, no selling or sharing data for marketing.</li>
        <li>No public profiles. Everything you make is private to you.</li>
        <li>No reading your revision content, except if you ask us for help with a problem.</li>
      </ul>
      <h2>Who processes data for us</h2>
      <p>Supabase (database and sign-in, EU region), Vercel (website hosting), Resend (sending sign-in codes), Stripe (payments, only if you buy Pro), Google (only if you choose Google sign-in), and Anthropic (the AI coach, only when you use a Pro AI feature).</p>
      <h2>AI features</h2>
      <p>When you use the AI coach, AI marking or AI flashcards, the text needed for that request is sent to Anthropic, which runs the AI model: your answer or notes, the question, your subject and board, and short descriptions of your weak topics and logged mistakes. Your name and email are not sent. Anthropic processes it to give the answer and, under its commercial terms, doesn’t use it to train its models. Nothing is sent unless you press a button that uses AI.</p>
      <h2>Your rights</h2>
      <p>You can download everything in Settings, and delete your account and all its data at any time from Settings. Under UK GDPR you can also ask us for a copy of your data, to correct it, or to delete it by emailing {CONTACT}. You can complain to the Information Commissioner’s Office (ico.org.uk).</p>
      <h2>Children</h2>
      <p>Hilite follows the ICO’s Age Appropriate Design Code: settings are private by default, we collect only what’s needed to run the app, and there are no nudges to share data. If you’re under 13, ask a parent or carer before making an account.</p>
      <h2>Contact</h2>
      <p>Email {CONTACT}.</p>
    </Page>
  );
}

export function Terms() {
  return (
    <Page title="Terms of use">
      <p>By using Hilite you agree to these terms. They’re written to be readable.</p>
      <h2>Using Hilite</h2>
      <ul>
        <li>Keep your sign-in details to yourself. You’re responsible for what happens on your account.</li>
        <li>Don’t try to break, overload or get around Hilite’s security, or access anyone else’s account.</li>
        <li>Don’t upload anything illegal, or content you don’t have the right to use.</li>
      </ul>
      <h2>Exam dates and papers</h2>
      <p>Exam dates come from the exam boards’ published timetables. Boards can change them, so always check the final timetable your school gives you. Past papers belong to the exam boards: Hilite links to them on the boards’ own websites and doesn’t host them.</p>
      <h2>Hilite Pro</h2>
      <ul>
        <li>Pro costs £5 a month or £50 a year and renews automatically until you cancel.</li>
        <li>You can cancel at any time from the Upgrade page. You keep Pro until the end of the period you paid for.</li>
        <li>If you’re unhappy within 14 days of your first payment, email us for a full refund.</li>
        <li>If you’re under 18, a parent or carer must agree to the purchase.</li>
      </ul>
      <h2>Your content</h2>
      <p>What you make in Hilite is yours. You give us permission to store and sync it so the app works, and nothing more.</p>
      <h2>No guarantees</h2>
      <p>We work hard to keep Hilite accurate and running, but we can’t promise it will always be available or error-free, and it isn’t a replacement for your teachers’ advice. Our liability is limited to what you’ve paid us in the last 12 months, as far as the law allows.</p>
      <h2>Changes</h2>
      <p>If these terms change in an important way, we’ll tell you in the app first. Questions: {CONTACT}.</p>
    </Page>
  );
}
