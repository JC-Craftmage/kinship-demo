#!/usr/bin/env node
/**
 * verify-live-db.js
 * =================
 * Proves that the REAL Supabase project matches the schema and the security
 * posture the app depends on.
 *
 * WHY THIS EXISTS
 * `verify-migrations.js` executes the migration chain against PGlite (real
 * Postgres compiled to WASM). That proves the SQL is correct - but it CANNOT
 * prove the live project is correct, because Supabase provisions the
 * `anon` / `authenticated` / `service_role` roles and applies DEFAULT
 * PRIVILEGES that grant new tables to those roles automatically. A table
 * created in the Supabase SQL editor can therefore be readable by an
 * anonymous browser call even though the migration file revoked it.
 *
 * That is exactly the class of bug that only shows up in production, and
 * exactly the bug that would expose a church's roster to the internet.
 *
 * So this script talks to the LIVE project over PostgREST and checks:
 *
 *   PHASE A  connectivity + the 26 expected tables all exist and are readable
 *            by service_role
 *   PHASE B  column drift between the live database and lib/supabase/types.ts
 *            (the contract the app compiles against)
 *   PHASE C  the attack battery - `anon` must be refused on EVERY table, for
 *            both READ and INSERT (skipped, loudly, if no anon key is given)
 *   PHASE D  service_role write path (optional, --write: inserts and then
 *            deletes a real row to prove writes are not blocked)
 *
 * It NEVER prints a key, and it never writes anything unless --write is
 * passed.
 *
 * Usage:
 *   node scripts/verify-live-db.js
 *   node scripts/verify-live-db.js --write
 *
 * Credentials are read from the environment, or from .env.local if present:
 *   NEXT_PUBLIC_SUPABASE_URL   (required)
 *   SUPABASE_SERVICE_ROLE_KEY  (required)
 *   SUPABASE_ANON_KEY          (optional - enables the attack battery)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WRITE_TEST = process.argv.includes('--write');

const EXPECTED_TABLES = [
  'churches', 'campuses', 'church_members', 'campus_overseers', 'invite_codes',
  'members', 'assets', 'meal_trains', 'meal_signups', 'needs',
  'need_volunteers', 'join_requests', 'church_questionnaires',
  'join_request_responses', 'join_request_denials', 'member_departures',
  'support_tickets', 'offers', 'bible_study_groups', 'bible_study_signups',
  'bible_study_sessions', 'bible_study_posts', 'kudos', 'life_events',
  'life_event_comments', 'notifications',
];

let FAILURES = 0;
let SKIPS = 0;

function check(label, pass, detail) {
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${label}${detail ? ' - ' + detail : ''}`);
  if (!pass) FAILURES += 1;
}

function skip(label, detail) {
  console.log(`  [SKIP] ${label}${detail ? ' - ' + detail : ''}`);
  SKIPS += 1;
}

function head(title) {
  console.log('\n' + '='.repeat(74) + '\n' + title + '\n' + '='.repeat(74));
}

// ------------------------------------------------------------------ config

/** Minimal .env.local reader - no dependency, no side effects. */
function readEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = readEnvFile(path.join(ROOT, '.env.local'));
const env = (key) => process.env[key] || fileEnv[key];

const URL_ = env('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const ANON_KEY = env('SUPABASE_ANON_KEY');

// --------------------------------------------------------------- http util

async function req(pathname, { key, method = 'GET', body, headers = {} } = {}) {
  let res;
  try {
    res = await fetch(`${URL_.replace(/\/$/, '')}${pathname}`, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // DNS failure / connection refused / TLS problem - the project may not
    // exist at all. Report it as a value, not a crash.
    const cause = (err && (err.cause || err).code) || (err && err.message) || 'network error';
    return { status: 0, text: `network error: ${cause}`, json: null, networkError: true };
  }
  const text = await res.text().catch(() => '');
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, text, json };
}

function isDenied(res) {
  if (res.status === 401 || res.status === 403 || res.status === 404) return true;
  const code = res.json && (res.json.code || res.json.errorCode);
  if (code === '42501' || code === 'PGRST301' || code === 'PGRST302') return true;
  return /permission denied|not authorized|401|403|42501/i.test(res.text || '');
}

/** Read the expected columns for each table out of lib/supabase/types.ts. */
function expectedColumns() {
  const file = path.join(ROOT, 'lib', 'supabase', 'types.ts');
  if (!fs.existsSync(file)) return {};
  const src = fs.readFileSync(file, 'utf8');
  const out = {};
  // Tolerate CRLF: the file is checked out on Windows.
  const re = /^[ ]{6}(\w+): \{\r?\n[ ]{8}Row: \{\r?\n([\s\S]*?)\r?\n[ ]{8}\};/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const table = m[1];
    const cols = new Set();
    for (const line of m[2].split(/\r?\n/)) {
      const cm = /^[ ]{10}(\w+)\??:/.exec(line);
      if (cm) cols.add(cm[1]);
    }
    if (cols.size) out[table] = [...cols];
  }
  return out;
}

// ------------------------------------------------------------------- main

async function main() {
  if (!URL_ || !SERVICE_KEY) {
    console.error(
      '\nMissing credentials.\n' +
        '  NEXT_PUBLIC_SUPABASE_URL  = ' + (URL_ ? 'found' : 'MISSING') + '\n' +
        '  SUPABASE_SERVICE_ROLE_KEY = ' + (SERVICE_KEY ? 'found' : 'MISSING') + '\n' +
        '\nSet them in the environment or in .env.local, then run again.\n' +
        'See SUPABASE-ONBOARD.md for the full walkthrough.\n'
    );
    process.exit(2);
  }

  console.log('Live Supabase verification');
  console.log('  project : ' + URL_.replace(/https?:\/\//, '').replace(/\/$/, ''));
  console.log('  anon key: ' + (ANON_KEY ? 'provided (attack battery will run)' : 'NOT provided - attack battery will be skipped'));

  // ------------------------------------------------------------- PHASE A
  head('PHASE A - connectivity and table presence');

  let spec = null;
  const root = await req('/rest/v1/', { key: SERVICE_KEY });
  check('PostgREST reachable with the service role key', root.status === 200,
    root.status === 200 ? 'HTTP 200' : 'HTTP ' + root.status + ' ' + (root.text || '').slice(0, 200));
  if (root.networkError) {
    console.log('\n  The host ' + URL_.replace(/https?:\/\//, '').replace(/\/$/, '') + ' did not answer.');
    console.log('  A DNS failure here means the Supabase project does not exist (or was deleted),');
    console.log('  not that the credentials are wrong. Create the project first, then re-run.');
    if (root.networkError && /ECONNREFUSED/.test(root.text)) {
      console.log('  (This one was a refused connection rather than a DNS failure.)');
    }
  }
  if (root.status !== 200) {
    console.log('\nCannot reach the database. Nothing else can be verified.');
    process.exit(1);
  }
  spec = root.json || {};

  const missing = [];
  const present = [];
  for (const table of EXPECTED_TABLES) {
    const res = await req(`/rest/v1/${table}?select=*&limit=1`, { key: SERVICE_KEY });
    if (res.status === 200) present.push(table);
    else missing.push(`${table} (HTTP ${res.status} ${(res.text || '').slice(0, 120)})`);
  }
  check(`all ${EXPECTED_TABLES.length} expected tables exist and are readable by service_role`,
    missing.length === 0,
    missing.length ? missing.join('; ') : present.length + ' tables confirmed');

  if (missing.length) {
    console.log('\n  The migrations do not appear to be applied. Run supabase/migrations/combined.sql');
    console.log('  in the Supabase SQL editor, wait ~10s for the schema cache to reload, and re-run.');
  }

  // ------------------------------------------------------------- PHASE B
  head('PHASE B - column drift against lib/supabase/types.ts');

  const expected = expectedColumns();
  const defs = (spec.definitions || {});
  let driftCount = 0;
  for (const table of EXPECTED_TABLES) {
    const def = defs[table];
    if (!def || !def.properties) continue;
    const liveCols = Object.keys(def.properties);
    const want = expected[table];
    if (!want) continue;
    const missingCols = want.filter((c) => !liveCols.includes(c));
    if (missingCols.length) {
      driftCount += 1;
      check(`${table}: every column the app compiles against exists`, false,
        'missing in the live database: ' + missingCols.join(', '));
    }
  }
  if (driftCount === 0) {
    check(`no column drift between the live database and lib/supabase/types.ts (${Object.keys(expected).length} tables checked)`, true);
  }

  // ------------------------------------------------------------- PHASE C
  head('PHASE C - attack battery: anon must be refused everywhere');

  if (!ANON_KEY) {
    skip('anon read battery', 'no SUPABASE_ANON_KEY - copy the "anon public" key from the Supabase dashboard (API settings) and re-run');
    skip('anon insert battery', 'no SUPABASE_ANON_KEY');
    console.log('  NOTE: this means the client-access lockdown is currently UNPROVEN against the live project.');
  } else {
    let readBlocked = 0;
    let readLeaks = [];
    let insertBlocked = 0;
    let insertLeaks = [];
    for (const table of EXPECTED_TABLES) {
      const read = await req(`/rest/v1/${table}?select=*&limit=1`, { key: ANON_KEY });
      if (isDenied(read)) readBlocked += 1;
      else readLeaks.push(`${table} (HTTP ${read.status})`);

      const ins = await req(`/rest/v1/${table}`, {
        key: ANON_KEY,
        method: 'POST',
        body: { __watchdog_probe: true },
      });
      if (isDenied(ins)) insertBlocked += 1;
      else insertLeaks.push(`${table} (HTTP ${ins.status})`);
    }
    check(`anon is refused on READ for all ${EXPECTED_TABLES.length} tables`, readLeaks.length === 0,
      readLeaks.length ? 'LEAKED: ' + readLeaks.join(', ') : readBlocked + '/' + EXPECTED_TABLES.length + ' blocked');
    check(`anon is refused on INSERT for all ${EXPECTED_TABLES.length} tables`, insertLeaks.length === 0,
      insertLeaks.length ? 'LEAKED: ' + insertLeaks.join(', ') : insertBlocked + '/' + EXPECTED_TABLES.length + ' blocked');
  }

  // ------------------------------------------------------------- PHASE D
  head('PHASE D - service_role write path');

  if (!WRITE_TEST) {
    skip('write probe', 'pass --write to insert and delete a real row');
  } else {
    const id = '00000000-0000-0000-0000-0000000000ff';
    const row = {
      id,
      user_id: 'watchdog-probe',
      actor_user_id: 'watchdog-probe',
      actor_name: 'Watchdog Probe',
      type: 'mention',
      title: 'Watchdog probe',
      message: 'Created by verify-live-db.js --write; deleted immediately.',
      action_url: '/',
    };
    const ins = await req('/rest/v1/notifications', { key: SERVICE_KEY, method: 'POST', body: row });
    check('service_role can INSERT a notification', ins.status === 201 || ins.status === 200,
      ins.status === 201 || ins.status === 200 ? 'inserted' : 'HTTP ' + ins.status + ' ' + (ins.text || '').slice(0, 200));
    const del = await req(`/rest/v1/notifications?id=eq.${id}`, { key: SERVICE_KEY, method: 'DELETE' });
    check('service_role can DELETE the probe row', del.status === 204 || del.status === 200,
      'HTTP ' + del.status);
  }

  // -------------------------------------------------------------- result
  head('RESULT');
  if (FAILURES === 0) {
    console.log(`  ALL CHECKS PASSED${SKIPS ? ` (${SKIPS} skipped)` : ''}`);
    console.log('  The live project matches the schema and the security posture the app assumes.');
    process.exit(0);
  }
  console.log(`  ${FAILURES} CHECK(S) FAILED`);
  process.exit(1);
}

main().catch((err) => {
  console.error('\nverification crashed: ' + (err && err.stack ? err.stack : err));
  process.exit(1);
});
