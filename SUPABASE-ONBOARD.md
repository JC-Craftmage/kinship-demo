# SUPABASE ONBOARDING — Kinship

**The last mile between "the code is done" and "the app has data."**
Everything in this file is a step Jesse performs. Everything else is already
built and verified.

Status as of **2026-10-31**: the code is done, the schema is verified against a
real Postgres engine (PGlite), and `scripts/verify-live-db.js` is ready to
prove the live project. **The Supabase project itself does not exist yet** —
the reference `meclvssgrfzswqmgtwtj` returns `ENOTFOUND`, which means the
project was never created or was deleted.

---

## Step 1 — Create the project (2 minutes)

1. Go to <https://supabase.com/dashboard> → **New project**.
2. **Organization:** the free tier is fine for a pilot.
3. **Project name:** `kinship` (the URL becomes `https://<ref>.supabase.co`).
4. **Database password:** generate a strong one and **save it in a password
   manager**. It is not needed by the app — Supabase gives you the service
   role key instead — but you need it for the SQL editor and for the
   dashboard.
5. **Region:** pick the one closest to you (US West). Closest = lowest latency
   for the pilot.
6. Wait for provisioning to finish (30–60 seconds).

> **Do not paste the database password into any file.** The app never needs it.

---

## Step 2 — Apply the schema (2 minutes)

1. Open **SQL Editor → New query**.
2. Paste the **entire** contents of `supabase/migrations/combined.sql`
   (the single-file paste path — it is the concatenation of all 9 migration
   files, `001` → `008`, and it is what the verifier proves in PHASE E).
3. Click **Run**. It should report success and create **26 tables**.

**Why the single file and not the 9 separate ones:** the separate files are
the source of truth for history, but `combined.sql` is the one that is proven
to apply cleanly in a single pass. `npm run verify:db` executes both paths.

**Wait ~10 seconds** after it finishes. Supabase reloads the PostgREST schema
cache automatically; the verifier retries if it catches the cache mid-reload.

---

## Step 3 — Copy the three keys

**Project Settings → API** (or **Project Settings → API Keys**, depending on
the dashboard version):

| Key | Where it goes | Notes |
|---|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` | e.g. `https://<ref>.supabase.co` |
| **service_role** key | `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Never expose to the browser, never commit. |
| **anon / public** key | `SUPABASE_ANON_KEY` | Used **only** by the verifier's attack battery to prove the anon role is locked out. The app never uses it — the browser never talks to Supabase directly. |

Put the first two in `code/.env.local` (already exists — replace the
placeholders). The third can also go in `.env.local`; it is a public key, but
keeping it out of git avoids noise.

```bash
# code/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<the service_role key>
SUPABASE_ANON_KEY=<the anon key>
```

`.env.local` is gitignored. Confirm it stays that way before committing.

---

## Step 4 — Prove the live project (1 minute)

```bash
cd code
npm run verify:live
```

This talks to the **real** project and checks:

- **Phase A** — all 26 tables exist and are readable by `service_role`.
- **Phase B** — no column drift between the live database and
  `lib/supabase/types.ts` (the contract the app compiles against). Catches a
  half-pasted migration before the app ever boots.
- **Phase C** — the **attack battery**: the `anon` role must be refused on
  every table for both READ and INSERT. This is the check PGlite cannot do,
  because Supabase provisions `anon`/`authenticated` with default privileges
  that can hand a new table to the public the moment it is created. If this
  phase fails, a church roster is one HTTP call from being public.
- **Phase D** — skipped by default; `npm run verify:live:write` inserts and
  then deletes one real row to prove the write path is not blocked.

Expected output: `ALL CHECKS PASSED`.

If Phase C fails, re-run the migration — it ends with an explicit `REVOKE`
sweep plus `deny_client_access` policies. Do not proceed to deployment until
it passes.

---

## Step 4b — Seed the demo data (recommended before any demo) ⭐

**Do this after Step 4 passes and before you show the app to anyone.**

A brand-new project has 26 tables and **zero rows**. Every board renders an
empty state, which reads as "broken" to a pastor who is deciding whether to
answer your email. The seed file fills one clearly-labelled demo church with
realistic content on every board — directory, needs, offers, assets, meal
trains, kudos, life events, bible study, notifications, join requests,
questionnaires and support tickets — so the product shows what it actually does.

1. **SQL Editor → New query.**
2. Paste the **entire** contents of `supabase/seed.sql` → **Run**.
3. Paste the **entire** contents of `supabase/seed-bind-owner.sql`, replace
   `user_REPLACE_WITH_YOUR_CLERK_ID` with your real Clerk user id (Clerk
   Dashboard → Users → your user; it starts with `user_`) → **Run**.
4. Sign up in the app, then confirm the demo church loads with content and that
   your own rows show as "mine".

Properties the seed guarantees (proven by `npm run verify:seed`):

| Property | How it is guaranteed |
|---|---|
| It applies cleanly | Executed against a real Postgres engine, not a mock |
| It is idempotent | Fixed ids + `ON CONFLICT DO NOTHING`; re-running changes no row counts |
| It never fabricates a legal value | Every CHECK/enum column is asserted to hold only values the UI mapper accepts — a row with an unknown category would be **dropped** by `lib/board-mappers.ts`, so the demo would silently show fewer rows than it claims |
| It does not weaken security | After seeding: RLS on 26/26, zero `anon`/`authenticated` grants, `deny_client_access` on every table, and the `anon` attack battery still blocked |
| It cannot be mistaken for a real church | The church is named `Sample Church (DEMO DATA)`, all emails use `@example.com`, and every row belongs to that one church |
| It never touches a real church | Fixed UUIDs in a fixed id range; every other church is untouched |

The seed **only INSERTs.** It never alters the schema and never grants
anything. You can delete the demo church with a single `DELETE FROM churches
WHERE id = '11111111-1111-4111-8111-111111111111';` (cascades to everything
below it).

---

## Step 5 — Deploy (Vercel or anywhere that runs Next.js)

The app is a standard Next.js app. Any host works.

**Environment variables in the host's dashboard** (all four are required):

```
NEXT_PUBLIC_SUPABASE_URL     https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY    <service_role key>       # server only
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  pk_...
CLERK_SECRET_KEY             sk_...
```

**Clerk setup** — after the first deploy, add the production origin to the
Clerk app (**Settings → Allowed origins**), then set:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL  /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL  /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL  /home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL  /home
```

Deploying before Clerk knows the origin is the #1 cause of a blank sign-in
screen. Add the origin first.

---

## Step 6 — Smoke test

1. Sign in. You should land on `/home`.
2. If you ran Step 4b, the demo church is already populated — every board
   should have content and your own rows should be flagged as yours.
3. Create a church (owner) → invite a member → approve a join request.
4. Post a life event, give kudos, read the notification bell. **Each of these
   writes a real row** — then re-run `npm run verify:live` and confirm nothing
   changed structurally.
5. Check the row count in the dashboard: **Dashboard → Table Editor**.

---

## What is verified already (no action needed)

| Check | Command | Status |
|---|---|---|
| Migration chain applies cleanly | `npm run verify:db` | PASS (9 files, 26 tables, RLS 26/26) |
| `combined.sql` applies cleanly | `npm run verify:db` (Phase E) | PASS |
| Seed data applies, is legal, is idempotent, and does not weaken security | `npm run verify:seed` | PASS (27 tables populated, RLS 26/26, anon blocked) |
| API route auth/tenant scoping | `npm run audit:auth` | PASS |
| No mock/fixture imports outside the demo loader | `npm run check:no-mock` | PASS |
| Typecheck / lint / build | `tsc --noEmit`, `npm run lint`, `npm run build` | PASS |

The only thing that has never been proven is the one thing that cannot be
proven without a real project: **the live database in front of real users.**
That is exactly what Step 4 does.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ENOTFOUND` on the project host | The project does not exist | Step 1 |
| `401` on every request | Wrong service role key, or a key from a different project | Step 3 |
| `PGRST205` / table not found | Migrations not applied, or the schema cache is stale | Step 2, wait 10s, re-run |
| Phase C reports a leak | `combined.sql` was only partially pasted | Re-run Step 2 in full, then re-verify |
| App shows "Demo data" banner | `KINSHIP_DEMO_MODE=true` is set | Unset it — demo mode is OFF by default and only turns on when that exact variable is `true` |
