# Hilite

Revision built around your exams: real GCSE exam dates by board and spec, past papers, a revision planner, flashcards, topic checklists and a focus timer. Runs as a website and as a Windows app that updates itself.

```
apps/web       The app (React + TypeScript + Vite). Hosted on Vercel.
apps/desktop   Hilite for Windows (Electron). Bundles the same app, works offline.
supabase       Database, security rules, sign-in emails and server functions.
.github        Website checks, and the Windows release pipeline.
```

## Try it on your computer

You need Node.js 20 or newer.

```
cd apps/web
npm install
npm run dev
```

Open http://localhost:5173. With no Supabase keys it runs in **local mode**: no sign-in, data saved in the browser, owner tools on. Good for testing the app.

Windows app, from `apps/desktop`: `npm install`, then `npm start`.

## Going live

Use your personal accounts for all of this, not school ones.

### 1. GitHub
Create a **public** repo called `hilite` under `dizzy200511-debug`, then push this folder to it. It has to be public so installed copies of the Windows app can download updates.

### 2. Supabase (database and sign-in)
1. Create a project at supabase.com. Pick the **London** region.
2. **SQL editor:** paste in `supabase/migrations/0001_init.sql` and run it.
3. **Authentication, Sign In / Providers, Email:** turn on *Confirm email*. Set the minimum password length to 10.
4. **Authentication, Emails, Templates:** paste `supabase/templates/confirm.html` into *Confirm signup* and `recovery.html` into *Reset password*. The subject lines are in `supabase/config.toml`. These make the emails show a 6-digit code instead of a link.
5. **Authentication, URL configuration:** set the Site URL to your website address, and add `hilite://auth` and `http://localhost:5173` as redirect URLs.
6. **Project settings, API:** copy the Project URL and the `anon` public key.

### 3. Emails from your own address (Resend)
Supabase's built-in email is for testing and limited to a few emails an hour. For launch:
1. Buy a domain (about £10 a year, e.g. `hilite.study`).
2. Make a free Resend account, add the domain, and add the DNS records it gives you.
3. In Supabase, go to **Authentication, Emails, SMTP settings**, and enter Resend's SMTP details. This sends the sign-up and reset codes.
4. Deploy the server functions with the Supabase CLI:
   ```
   npx supabase login
   npx supabase link --project-ref YOUR-PROJECT-REF
   npx supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="Hilite <codes@hilite.study>" SITE_URL=https://hilite.study
   npx supabase functions deploy device
   npx supabase functions deploy billing
   npx supabase functions deploy stripe-webhook --no-verify-jwt
   ```

### 4. Google sign-in
1. In Google Cloud Console, use a personal Google account and create a project.
2. Set up the OAuth consent screen: External, app name Hilite.
3. Under **Credentials**, create an *OAuth client ID* of type *Web application*. Add the callback URL that Supabase shows on its Google provider page.
4. Paste the client ID and secret into **Supabase, Authentication, Providers, Google**.

### 5. Website (Vercel)
1. Import the GitHub repo in Vercel and set the **Root Directory** to `apps/web`.
2. Add the environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SITE_URL`.
3. Deploy, then add your domain in Vercel.

Every push to `main` redeploys the site automatically.

### 6. The AI coach (Pro)
The AI coach, AI marking and AI flashcards run through the `ai` server function, so the API key never reaches anyone's browser.
1. Make an account at console.anthropic.com with your parent, add billing, and create an API key. Set a monthly spend limit there too.
2. In the Supabase SQL editor, run `supabase/migrations/0002_ai.sql`. It adds the daily request counter.
3. Set the secrets and deploy:
   ```
   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx AI_DAILY_LIMIT=40
   npx supabase functions deploy ai
   ```
   `AI_MODEL` is optional and defaults to `claude-opus-5-5`. A cheaper model such as `claude-haiku-5-5` costs much less per request; test the quality of its questions and marking before you switch.

Only Pro accounts (and the owner) on a trusted device can use it, and each account is capped at `AI_DAILY_LIMIT` requests a day. Without the key, the coach falls back to retesting the student’s own mistakes and flashcards.

### 7. Make yourself the owner
Sign up on the site, then run this in the Supabase SQL editor:
```sql
update public.profiles set is_owner = true
where id = (select id from auth.users where email = 'you@example.com');
```

### 8. Windows app releases
1. In the GitHub repo, go to **Settings, Secrets and variables, Actions**. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SITE_URL`.
2. To release a version:
   ```
   git tag v1.0.0
   git push origin v1.0.0
   ```
   GitHub builds `Hilite-Setup-1.0.0.exe` and publishes it under Releases. The website's download button always points to the latest release.
3. Installed copies check for updates when they start and every 4 hours, download in the background, and install on restart. To ship an update, push a higher tag, such as `v1.0.1`.

The installer isn't code-signed yet, so Windows SmartScreen shows "Windows protected your PC". Click *More info*, then *Run anyway*. A signing certificate removes this once Hilite is earning money.

### 9. Payments (later, with a parent)
Stripe needs an adult account holder. When you're ready:
1. Make two prices in Stripe: £5 a month and £50 a year.
2. Set the secrets:
   ```
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx STRIPE_PRICE_MONTH=price_xxx STRIPE_PRICE_YEAR=price_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
3. Add a webhook to `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook` for `checkout.session.completed` and `customer.subscription.*`.

Until then, the Upgrade button says payments aren't open yet, and everything else works.

## Security

| Risk | How Hilite handles it |
|---|---|
| SQL injection | No SQL is built from strings. Supabase sends values as parameters, and the database checks every key and size. |
| Reading someone else's data | Row Level Security on every table means each account can only reach its own rows. |
| Stolen password | Revision data also needs a **trusted device**. A new browser or PC must enter a code emailed to the account owner. |
| XSS | React escapes everything it renders. The few places that allow formatting go through DOMPurify with a strict allowlist. A Content Security Policy blocks inline and outside scripts, on the website and in the Windows app. |
| Guessing which emails have accounts | Every failed sign-in says "Email or password is incorrect." Sign-up and reset look the same whether or not the email exists. |
| Brute-forcing codes | Codes are random 6 digits, stored only as hashes, and expire in 10 minutes. Each code allows 5 tries, and sending is rate limited. |
| Weak passwords | Minimum 10 characters, common passwords rejected, strength meter. |
| Windows app | Sandboxed renderer with no Node access and a fixed bridge of 10 functions. The app can't navigate off its own files. |

## Updating exam dates

Dates live in `apps/web/src/catalog/catalog.ts`. Each paper has a `sitting: d(day, month, 'AM' | 'PM')`. When boards publish the 2028 timetables, update these and `TIMETABLE_YEAR`. Students can always override a date on the Exam timetable page.
