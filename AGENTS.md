# Hilite: notes for coding agents

Read this first, then `docs/HANDOFF.md` for the full history, status and to-do list.

## What this is
Hilite is a GCSE and A-level revision website plus a Windows app, modelled on Save My Exams, being built to launch commercially. Free plan stays genuinely useful; Pro is £8/month or £60/year (prices in `PRICE` in `pages/Upgrade.tsx`).

## Commands
```
cd apps/web && npm install && npm run dev          # website at http://localhost:5173
cd apps/web && npm run typecheck && npm run build   # must pass before you finish any change
cd apps/desktop && npm install && npm start         # Windows app (builds the web app in desktop mode first)
cd apps/web && npm run papers:update                # refresh past paper links from the boards (Node 23.6+), then commit
cd apps/web && npm run icons                        # redraw favicon, PNG icons and the Windows .ico from the brand mark
```
With no `VITE_SUPABASE_*` env vars the app runs in **local mode**: sign-up, codes (shown on screen), sign-in and reset are simulated in the browser, each local account has its own data, and checkout switches Pro on with no payment. Local accounts get owner access unless `localStorage['hilite:localPlan'] = 'free'`. Use it to test UI changes.

## Rules the owner set (keep applying them)
- **Security is non-negotiable.**
  - A failed login always says exactly "Email or password is incorrect." Never reveal whether an email exists.
  - Protect against SQL injection: never build SQL from strings. Use supabase-js / parameterised queries and RLS.
  - Protect against XSS: no `dangerouslySetInnerHTML` except through `safeHtml()` in `lib/sanitize.ts`, `safeUrl()` for any user-supplied link, and `cleanText()` on every text input.
  - Keep the CSP in `apps/web/vercel.json` and `apps/desktop/main.js` strict.
- **Both login types** (email+password, Google) use 6-digit email codes: sign-up confirmation, password reset, and a new-device check.
- **Design must look considered, not "AI slop".**
  - No gradients, glass, glow, blobs or emoji in the UI.
  - One accent (ink blue `--accent`). Highlighter yellow `--hl` only for small emphasis.
  - Subject colours as thin tabs. 1px borders, minimal shadow, Hanken Grotesk, tabular numbers.
  - Reuse classes in `styles/app.css` before adding new ones, and check dark mode and a 390px-wide phone.
- **Copy style:**
  - Plain, specific, friendly British English ("revise", "colour", "maths").
  - No hype words ("unlock", "supercharge", "seamless"), no exclamation marks.
  - Say what happened and what to do next.
- **Past papers are linked to the official board sites, never hosted** (copyright). Hilite deep-links to each board's own PDF (collected by `scripts/fetch-past-papers.mjs` into `catalog/papers/`); never download, proxy or re-host them. The public `/past-papers` pages need no sign-in.
- **Practice questions are written for Hilite** (`content/questions/`). Never copy questions from past papers or board materials.
- **Specification content is written in Hilite's own words** (`content/spec/`). AQA's policy forbids reproducing its materials in apps or on third-party sites, so never paste spec text. Section and sub-topic names follow the spec structure; the explanations are ours.
- **Free entices, Pro is the full kit** (owner’s call, 15 November 2026). Free keeps everything needed to revise: timetable, a full revision plan, flashcards, past papers, checklist, mistake log and retests, blurting, teach-back. Pro gets the AI, most plan styles, unlimited notes and maps, the deeper tools and guides. The split lives in `lib/pro.ts`; change it there.
- **GCSE and A-level, always.** Hilite serves both. Never write copy, pages or features as GCSE-only (owner's call, 15 November 2026).
- The Classroom homework scanner is the owner's **separate personal tool**. Do not add it to Hilite.

## Map
```
apps/web/src
  App.tsx            routing + gates: loading → signed out → untrusted device → onboarding → app
  main.tsx           providers; HashRouter in the desktop build, BrowserRouter on the web
  auth/              AuthProvider (all Supabase auth + device trust), AuthPages (sign in/up, codes, reset)
  catalog/catalog.ts every spec: papers, topics, 2027 exam dates (AQA, Edexcel, OCR), board past-paper finders
  catalog/papers/    one JSON per spec: direct links to official question papers, mark schemes, examiner reports
  seo/               static pages built by the Vite plugin: /exam-dates, /past-papers, sitemap.xml, robots.txt
  lib/               logic only, no UI (store, planner, presets, srs, mistakes, weakness, ai, decks, exams, grades, timer, dates, sanitize, types, data hooks)
  content/spec/      every spec broken into sections and sub-topics with own-words explanations, loaded per spec on demand
  content/questions/ practice question banks by content area (bio, chem, phys, maths, cs, english, humanities), mapped onto each spec's topics in index.ts
  content/           static content: guides (revision methods, subjects, exam technique), command words, starter decks, tools list
  pages/             one file per screen; pages/tools/ holds the revision tools (mistake log, blurt, teach-back, notes, mind map, memoriser, mixed quiz…)
  components/        Shell (sidebar, phone tab bar, reminders), ui (Modal, Toast, Seg, Bars…), pickers (subject/topic select, ProLock), MistakeModal, Diagram (question pictures drawn from data), icons
  styles/app.css     whole design system, light + dark
apps/web/scripts     fetch-past-papers.mjs (board links), make-icons.mjs (favicon, PNGs, .ico)
apps/desktop         Electron: main.js (app:// protocol, tray, notifications, deep links, auto-update), preload.js
supabase             migrations/0001_init.sql (tables + RLS), 0002_ai.sql (AI daily limit), 0003_owner_ai.sql (AI usage for the owner), functions/{device,billing,stripe-webhook,ai}, templates/ (code emails)
.github/workflows    web.yml (typecheck+build), desktop-release.yml (tag v* → Windows installer on GitHub Releases)
```

## Data model
- User data is a set of JSON documents kept in localStorage per user (`hilite:<uid>:<key>`) and synced last-write-wins to the Supabase `user_docs` table.
- Keys: `profile`, `examDates`, `tests` (own school tests), `checklist`, `planner`, `papers`, `practice` (question attempts), `focus`, `decks`, `deck_<id>`, `mistakes`, `notes`, `note_<id>`, `blurts`, `memos`, `mindmaps`, `coach`, `specTicks`.
- AI calls go only through `lib/ai.ts` → the `ai` edge function, which checks Pro, the trusted device and a daily limit. Never call an AI provider from the client.
- Read and write them only through the hooks in `lib/data.ts` (`useProfile()`, `useDeck(id)`, …). Types are in `lib/types.ts`.
- Keep each document under about 480k characters.
