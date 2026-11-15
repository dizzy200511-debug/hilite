# Hilite handoff

Everything an agent needs to continue the project. Written 15 November 2026, when the code moved from a cloud session to the owner's machine (T3 Code).

## 1. How we got here
1. **Origin.** Hilite started as a Google Apps Script that scanned the owner's Google Classroom streams for homework set as announcements. A small Electron wrapper followed.
2. **Pivot.** The owner decided to turn the name and idea into a real revision product: a website plus an "actual" Windows app, not a website wrapper. The app updates from GitHub Releases and is monetised later.
3. **Scanner split off.** The homework scanner stays as the owner's personal Apps Script tool and is **not** part of Hilite.
4. **Rebuild.** The product was rebuilt from scratch in this repo (React + TypeScript + Supabase + Electron), with a full UI redesign aiming at "professional, sleek, thought-out, not AI slop".

## 2. Product decisions
| Topic | Decision |
|---|---|
| Model | Like Save My Exams. Pick qualification, board, subject and tier. Each subject shows its real exam dates, past papers, a revision planner and user-made flashcards. |
| Pricing | Free stays good. Pro is £8/month or £60/year (£5 a month billed yearly, saving £36). Owner raised it from £5/£50 on 15 November 2026. |
| Pro features | AI coach (learns from the mistake log, weak topics, card lapses, coach marks and blurt scores; writes targeted questions; marks answers; wrong answers go back into the mistake log), AI marking of pasted answers, AI flashcards from notes, a plan that adapts to weak topics, predicted grades, full stats history. |
| Free and Pro split | Set in `apps/web/src/lib/pro.ts` (owner chose on 15 November 2026: free should entice, Pro should be wanted). Free: timetable, a full plan in Balanced or Mock sprint style, flashcards, past papers, checklist, focus, mistake log with retests (1, 3, 7 days), blurting, teach-back, command words, exam timing, method guides, the command words deck, and 3 Cornell notes, 3 mind maps and 5 memoriser items. Pro: AI coach, AI marking, AI flashcards, adaptive plan, Auto and the other plan styles, the why-you-lose-marks pattern, unlimited notes, maps and memoriser, mixed quiz, grade target, subject and exam technique guides (first section free), equation and formula decks, predicted grades and full history. |
| Login | Email+password and Google. Both use 6-digit email codes (sign-up, reset, new device). A wrong login always says "Email or password is incorrect." |
| Past papers | Link to the official board finders (AQA, Pearson, OCR). The last 2 years show as "Not public yet". Never hosted. |
| Coverage | GCSE only for now: 14 AQA specs, 14 Pearson Edexcel specs, and OCR Computer Science J277 and Maths J560 (no dates). A-level is next. |
| Spec content | Every topic of all 30 specs is broken into the spec's own sections and sub-topics (1,582 in total), each with a short explanation in Hilite's own words, Higher-tier and separate-science-only flags, and a tick for "I know this". Combined science content is derived from the separate sciences. Shown in the topic checklist, blurt checks and plan sessions, and sent to the AI coach so questions stay on the spec. Built from the boards' published specifications in November 2026; check against new spec issues each year. Never paste spec text (AQA forbids it in apps). |
| Exam dates | Real summer 2027 dates for every AQA and Edexcel spec. `TIMETABLE_YEAR = 2027`. Students can override any date. |
| Revision method | The planner follows a preset plan style (`lib/presets.ts`): Balanced, Steady from now, Final four weeks, Mock sprint, Little and often, Practice heavy, Essay subjects, or Auto (default: practice heavy for maths, sciences and CS; essay for English and humanities; little and often for languages). Each is a sequence of active methods per topic with day offsets, squeezed when exams are close. Red topics get an extra session and green topics drop one. Some presets add a weekly mixed session; open mistakes add "redo your mistakes" sessions. Every session links to its tool and its guide. Daily caps, rest days optional. |
| Study day | Starts at 4am, so late-night revision counts as the same day. |
| Children's data | Many users are under 18. Follow the ICO Children's Code: no ads, no trackers, private by default, minimal data. |
| Hosting | Vercel (web), Supabase London region (DB, auth, functions), Resend (code emails, needs own domain), GitHub public repo `dizzy200511-debug/hilite` (code and Windows releases). |
| Payments | Stripe, set up later. Stubs are written. |

**Sources for the exam dates:**
- [AQA provisional GCSE June 2027 timetable](https://www.aqa.org.uk/files/32986d0b-0ce6-462a-9682-5ba7a41619f9) (v1.0, January 2026).
- [Pearson Edexcel GCSE summer 2027 final timetable](https://www.wellandparkacademy.co.uk/assets/Documents/Exams/Pearson-gcse-summer-2027-final.pdf). This is a school's copy, because [Pearson's own link](https://qualifications.pearson.com/content/dam/pdf/Support/Examination-timetables-for-UK-Edexcel-GCSE/gcse-summer-2027-prov.pdf) has moved.
- OCR dates were not loaded.

## 3. Status

**Built and verified in local mode** (Playwright click-through of every page in light, dark and 390px phone width; no console errors; typecheck and build pass):
- Onboarding: name → subjects → study time → plan built.
- Today, Exam timetable (clashes, date override, .ics export) and Revision planner (week view, move or done sessions, tasks, study-time settings).
- Past papers (series × paper table, log marks, timed mock mode).
- Topic checklist (red/amber/green).
- Flashcards: decks, bulk paste, SM-2 scheduling, and flip, type and quiz modes.
- Focus timer: Pomodoro, carries on across pages, logs sessions.
- Progress (stats and predicted grades for Pro), Subjects manager, Settings (theme, goals, devices, backup/restore, delete account).
- Upgrade page, Owner dashboard, mobile More page, landing page, Privacy and Terms drafts.
- Revision tools, guides, plan styles and the AI coach (added 15 November 2026). Checked in local mode: every new page in light, dark, desktop and 390px with no console errors; blurt → gaps into flashcards, mistake retest scheduling, memoriser checking, plan style switch and rebuild, starter decks, and the coach falling back to the student's own mistakes and cards when AI isn't available.

**AI coach:** the `ai` edge function typechecks against `@anthropic-ai/sdk@1.3.0`, but it has never run against the real API. Test question quality, marking accuracy and cost per request before launch.

**Windows app:** launched under xvfb with Playwright. It loads `app://hilite/index.html`, the preload bridge works (`hiliteDesktop.version` returned "1.0.0"), and there are no CSP errors. The NSIS installer itself has not been built yet (it needs Windows or the GitHub Action).

**Written but never run against real services:**
- **Supabase auth flows:** sign-up code, sign-in, Google OAuth (web and the `hilite://auth` deep link), password reset.
- **Database (`0001_init.sql`):** the RLS device check reads the `x-device-id` header via `current_setting('request.headers')`. Verify that PostgREST passes it through.
- **Edge functions:**
  - `device`: send, verify, trust-new-account / trust-after-reset (relies on the JWT `amr` claim showing an email OTP in the last 15 minutes), delete-account.
  - `billing` and `stripe-webhook`.
- Resend email delivery.

**Not set up yet (owner to do; steps in README.md):** GitHub repo, Supabase project, Vercel project, domain plus Resend, Google OAuth client, Stripe, Anthropic API key for the AI coach.

## 4. Next tasks, in rough priority order
1. **Go-live wiring.** Help the owner create the accounts. Run the migration, deploy the functions, set env vars, then test every auth path end to end. Fix whatever breaks. Likely suspects:
   - the `amr` method names;
   - headers reaching RLS;
   - the CORS/origin of `app://hilite` for auth endpoints;
   - Google redirect in the desktop app.
2. **SEO exam-date pages.** The owner asked for this. Generate static, crawlable pages at build time, one per spec, such as `/exam-dates/aqa-gcse-biology` titled "AQA GCSE Biology exam dates 2027".
   - Each page lists every paper with date, AM/PM and length, a countdown and a "Plan your revision free" button.
   - Plus an index page and a sitemap.xml.
   - The app is an SPA, so write a small Node script run after `vite build`. It should import `catalog.ts` and emit plain HTML styled with the same CSS, plus Vercel rewrites so these paths aren't sent to `index.html`.
3. **Windows polish.** A proper multi-size `.ico`. Code signing later (SmartScreen warns until then). Check the tray icon at 16px.
4. **More content.**
   - OCR timetable dates.
   - More OCR and WJEC/Eduqas specs.
   - A-level.
   - Finer topic lists for the bigger specs.
5. **Pro.** Wire Stripe once a parent sets up the account. Deploy the `ai` function and run `0002_ai.sql`, then test the coach end to end with a real key: question accuracy per subject, marking against real mark schemes, cost per request, and whether `AI_DAILY_LIMIT` (40) fits the £5 price. Add AI request counts to the owner dashboard.
6. **Sync scaling.** Whole documents sync last-write-wins, so a big deck re-uploads after each review. If decks get large, move cards to their own rows or sync diffs.
7. **Legal.** The Privacy and Terms pages are drafts. The new AI section in Privacy describes Anthropic's handling of API data in general terms; check it against Anthropic's current commercial terms and data retention before launch. The contact email `hello@hilite.study` is a placeholder until the domain is chosen.

## 5. Conventions
- **Adding a spec:** add an entry in `catalog/catalog.ts` with a unique `id` such as `aqa-gcse-xxx`, `papers` with `sitting: d(day, month, 'AM'|'PM')`, and a `topics` array. Paper `topics` are indexes into it.
- **New persisted data:** add a type in `lib/types.ts` and a hook in `lib/data.ts` using `useDoc(key, default)`. Never write to localStorage directly for user data.
- **Pro gating:** `const pro = auth.plan === 'pro' || auth.isOwner`. Show a lock and a link to `/upgrade`, never a blocking modal.
- **Modals and toasts:** use `Modal` and `useToast` from `components/ui.tsx`.
- **Dates:** use the helpers in `lib/dates.ts` (`today()`, `addDays`, `studyDayOf`). Date keys are `YYYY-MM-DD`.
- **Desktop-only code:** check `window.hiliteDesktop`. Adding to the bridge means changing `env.d.ts`, `preload.js` and `main.js` together, and keep the bridge small.

## 6. Marketing plan (agreed direction)
1. Start with the owner's own school year group before mocks.
2. Approach small study creators (about 5k–50k followers) with free Pro plus a follower code.
3. Make own short screen-recording videos; the "student built this" angle.
4. SEO exam-date pages (task 2).
5. r/GCSE and GCSE Discords, posted as "I built this" asking for feedback.
6. A referral reward of a free Pro month.
7. Teachers sharing it with classes.
8. Time launches for January mocks, the Easter holidays and late April.
