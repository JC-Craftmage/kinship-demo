/**
 * verify-seed.js
 * ==============
 * Proves that `supabase/seed.sql` is safe to paste into a real Supabase project
 * and that it actually produces a populated product.
 *
 * Why this exists: a brand-new Supabase project gives you 26 empty tables. Every
 * board renders an empty state, which is the worst possible first impression for
 * a pastor Jesse is trying to sign. The seed file fixes that -- but a seed file
 * that references an illegal enum value, or a column that does not exist, or that
 * silently drops rows when the UI mapper reads them, would make the demo lie.
 * That failure mode is invisible until someone clicks the app.
 *
 * What it proves:
 *   PHASE A  combined.sql + seed.sql apply cleanly on a real Postgres engine
 *   PHASE B  every board actually has content (minimum row counts)
 *   PHASE C  every constrained column holds ONLY values the UI mapper accepts
 *            (a row with an unknown category is DROPPED by the mapper, not shown)
 *   PHASE D  the seed does not weaken security: RLS on, zero anon grants,
 *            deny_client_access on every table, anon still blocked
 *   PHASE E  the seed is idempotent: running it twice changes nothing
 *
 * Run: npm run verify:seed
 */
const fs = require("fs");
const path = require("path");
const { PGlite } = require("@electric-sql/pglite");

const MIG = path.resolve(__dirname, "..", "supabase", "migrations");
const SEED = path.resolve(__dirname, "..", "supabase", "seed.sql");

let FAILURES = 0;
function check(label, pass, detail) {
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${label}${detail ? " — " + detail : ""}`);
  if (!pass) FAILURES++;
}
function head(t) { console.log("\n" + "=".repeat(72) + "\n" + t + "\n" + "=".repeat(72)); }

async function provisionSupabaseRoles(db) {
  await db.exec(`
    do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
    do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
    do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
    grant usage on schema public to anon, authenticated, service_role;
    grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
    create schema if not exists auth;
    create or replace function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
}

function sanitize(sql) {
  return sql.replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/gi, "");
}

async function runAs(db, role, sql) {
  try {
    await db.exec("set role " + role);
    const r = await db.query(sql);
    return { allowed: true, value: r.rows && r.rows[0] ? JSON.stringify(r.rows[0]) : "(ok)" };
  } catch (e) {
    return { allowed: false, value: String(e.message).split("\n")[0].slice(0, 110) };
  } finally {
    try { await db.exec("reset role"); } catch { /* already reset */ }
  }
}

async function countOf(db, table) {
  const r = await db.query(`select count(*)::int c from ${table};`);
  return r.rows[0].c;
}

/** Count for a full SQL statement that already selects count(*). */
async function rawCount(db, sql) {
  const r = await db.query(sql);
  return r.rows[0].c;
}

async function distinctValues(db, sql) {
  const r = await db.query(sql);
  return r.rows.map((x) => Object.values(x)[0]);
}

/** The legal value sets, mirrored from lib/board-mappers.ts + lib/types. */
const LEGAL = {
  "needs.category": ["Moving Help", "Prayer Request", "Childcare", "Transportation", "Home Repair", "Event Help"],
  "assets.category": ["vehicle", "equipment", "tools", "business"],
  "offers.category": ["Moving Help", "Childcare", "Transportation", "Home Repair", "Event Help", "Skilled Labor", "Equipment Rental", "Other"],
  "offers.availability": ["available", "limited", "unavailable"],
  "meal_signups.meal_type": ["lunch", "dinner", "breakfast"],
  "life_events.event_type": ["baby", "birthday", "wedding", "new-home", "graduation", "travel"],
  "notifications.type": ["kudos", "meal_train", "asset_request", "join_request", "comment", "mention"],
  "support_tickets.category": ["faq", "issue", "feature", "other"],
  "support_tickets.status": ["open", "in_progress", "resolved", "closed"],
  "support_tickets.priority": ["low", "medium", "high"],
};

const MIN_ROWS = {
  churches: 1, campuses: 2, church_members: 8, campus_overseers: 2, members: 8,
  needs: 6, need_volunteers: 3, offers: 5, assets: 5,
  meal_trains: 2, meal_signups: 8, kudos: 6,
  life_events: 4, life_event_comments: 4,
  bible_study_groups: 2, bible_study_signups: 4, bible_study_sessions: 4, bible_study_posts: 3,
  notifications: 5, join_requests: 4, church_questionnaires: 3, join_request_responses: 5,
  support_tickets: 2, invite_codes: 2, member_departures: 1, join_request_denials: 1,
};

(async () => {
  const seedSql = fs.readFileSync(SEED, "utf8");
  const db = await PGlite.create();
  await provisionSupabaseRoles(db);

  // ---------------------------------------------------------------- PHASE A
  head("PHASE A — combined.sql + seed.sql on a real Postgres engine");
  let combinedOk = true, seedOk = true;
  try {
    await db.exec(sanitize(fs.readFileSync(MIG + "/combined.sql", "utf8")));
    console.log("  applied combined.sql");
  } catch (e) {
    combinedOk = false;
    console.log("  FAILED combined.sql -> " + String(e.message).split("\n")[0].slice(0, 200));
  }
  check("combined.sql applies", combinedOk);

  if (combinedOk) {
    try {
      await db.exec(seedSql);
      console.log("  applied seed.sql");
    } catch (e) {
      seedOk = false;
      console.log("  FAILED seed.sql -> " + String(e.message).split("\n")[0].slice(0, 300));
    }
  }
  check("seed.sql applies with no error", seedOk);
  if (!seedOk) {
    head(FAILURES + " CHECK(S) FAILED");
    process.exit(1);
  }

  // ---------------------------------------------------------------- PHASE B
  head("PHASE B — every board actually has content");
  for (const [tbl, min] of Object.entries(MIN_ROWS)) {
    const c = await countOf(db, tbl);
    check(`${tbl} has content`, c >= min, `${c} row(s), expected >= ${min}`);
  }

  // ---------------------------------------------------------------- PHASE C
  head("PHASE C — every constrained column holds only values the UI mapper accepts");
  const probes = {
    "needs.category": "select distinct category from needs",
    "assets.category": "select distinct category from assets",
    "offers.category": "select distinct category from offers",
    "offers.availability": "select distinct availability from offers",
    "meal_signups.meal_type": "select distinct meal_type from meal_signups",
    "life_events.event_type": "select distinct event_type from life_events",
    "notifications.type": "select distinct type from notifications",
    "support_tickets.category": "select distinct category from support_tickets",
    "support_tickets.status": "select distinct status from support_tickets",
    "support_tickets.priority": "select distinct priority from support_tickets",
  };
  for (const [key, sql] of Object.entries(probes)) {
    const vals = await distinctValues(db, sql);
    const bad = vals.filter((v) => !LEGAL[key].includes(v));
    check(`${key} uses only legal UI values`, bad.length === 0,
      bad.length ? "ILLEGAL: " + bad.join(", ") : vals.join(", "));
  }

  // The mappers drop a row they cannot represent. A cancelled need is one of
  // them, and it must not be the only need on the board.
  const cancelled = await rawCount(db, "select count(*)::int c from needs where status='cancelled'");
  const live = await rawCount(db, "select count(*)::int c from needs where status <> 'cancelled'");
  check("no need row is silently dropped by the mapper", live > 0 && cancelled === 0,
    `${live} visible need(s), ${cancelled} cancelled`);

  // Enum columns that are still enums in the DB.
  const enumChecks = [
    ["needs.urgency", "select distinct urgency from needs", ["low", "medium", "high"]],
    ["needs.status", "select distinct status from needs", ["open", "in_progress", "fulfilled", "cancelled"]],
    ["meal_signups.status", "select distinct status from meal_signups", ["pending", "confirmed", "delivered", "cancelled"]],
    ["need_volunteers.status", "select distinct status from need_volunteers", ["pending", "accepted", "completed", "declined"]],
    ["join_requests.status", "select distinct status from join_requests", ["pending", "approved", "denied", "withdrawn"]],
    ["church_members.role", "select distinct role from church_members", ["owner", "overseer", "moderator", "member"]],
  ];
  for (const [key, sql, legal] of enumChecks) {
    const vals = await distinctValues(db, sql);
    const bad = vals.filter((v) => !legal.includes(v));
    check(`${key} uses only legal enum values`, bad.length === 0, bad.length ? "ILLEGAL: " + bad.join(", ") : vals.join(", "));
  }

  // kudos.amount is CHECK (amount BETWEEN 1 AND 10).
  const badKudos = await rawCount(db, "select count(*)::int c from kudos where amount < 1 or amount > 10");
  check("kudos.amount stays within 1..10", badKudos === 0, badKudos + " illegal row(s)");

  // Every seeded row must belong to the ONE demo church. A typo'd church id
  // would scatter demo rows across the platform.
  const orphanTables = ["needs", "offers", "assets", "kudos", "life_events", "notifications", "church_members", "meal_trains", "bible_study_groups"];
  for (const t of orphanTables) {
    const c = await rawCount(db, `select count(*)::int c from ${t} where church_id <> '11111111-1111-4111-8111-111111111111'`);
    check(`${t} rows all belong to the demo church`, c === 0, c + " stray row(s)");
  }

  // The demo church must be obviously fake.
  const nm = await db.query("select name from churches where id='11111111-1111-4111-8111-111111111111'");
  check("demo church is labelled as demo data", /DEMO/i.test(nm.rows[0] ? nm.rows[0].name : ""),
    nm.rows[0] ? nm.rows[0].name : "church missing");
  const emails = await distinctValues(db, "select distinct email from members");
  check("all member emails use example.com (no real addresses)", emails.every((e) => /@example\.com$/.test(e)), emails.join(", "));

  // The owner-bind hint must be actionable: a user_demo_01 that owns the church.
  const owner = await db.query("select owner_id from churches where id='11111111-1111-4111-8111-111111111111'");
  const ownerIsDemo = owner.rows[0] && owner.rows[0].owner_id === "user_demo_01";
  check("church owner is a placeholder id that can be re-bound", ownerIsDemo, owner.rows[0] ? owner.rows[0].owner_id : "none");

  // ---------------------------------------------------------------- PHASE D
  head("PHASE D — the seed does not weaken security");
  const rls = await db.query(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and c.relrowsecurity=false`);
  check("every table still has RLS enabled after seeding", rls.rows.length === 0,
    rls.rows.length ? "without RLS: " + rls.rows.map((x) => x.relname).join(", ") : "0 tables without RLS");

  const grants = await db.query(`select grantee, count(*)::int c from information_schema.role_table_grants
    where grantee in ('anon','authenticated') and table_schema='public' group by grantee`);
  check("anon/authenticated still hold zero table grants", grants.rows.length === 0,
    grants.rows.length ? JSON.stringify(grants.rows) : "0 grants");

  const pol = await db.query(`select c.relname, p.polname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    join pg_policy p on p.polrelid=c.oid where n.nspname='public' and c.relkind='r' and p.polname='deny_client_access'`);
  const tblCount = await db.query(`select count(*)::int c from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r'`);
  check("deny_client_access policy on every table", pol.rows.length === tblCount.rows[0].c,
    `${pol.rows.length}/${tblCount.rows[0].c} tables`);

  // The seed rows must be invisible to the leaked public key.
  for (const [label, sql] of [
    ["READ the seeded member roster", "select count(*)::int c from members;"],
    ["READ the seeded needs board", "select count(*)::int c from needs;"],
    ["READ the seeded notifications", "select count(*)::int c from notifications;"],
    ["READ the seeded assets", "select count(*)::int c from assets;"],
    ["INSERT a fake member", "insert into members (user_id, name, email) values ('evil','Evil','evil@example.com');"],
    ["UPDATE a seeded need", "update needs set title='pwned';"],
    ["DELETE a seeded need", "delete from needs;"],
  ]) {
    const r = await runAs(db, "anon", sql);
    check(`anon: ${label} is blocked`, r.allowed === false, r.allowed ? "ALLOWED " + r.value : "blocked");
  }

  // The app's own path must still see the seeded rows.
  const appRead = await runAs(db, "service_role", "select count(*)::int c from needs;");
  check("service_role can read the seeded needs (the app's path works)", appRead.allowed === true,
    appRead.allowed ? appRead.value : "BLOCKED: " + appRead.value);

  // ---------------------------------------------------------------- PHASE E
  head("PHASE E — the seed is idempotent");
  const before = {};
  for (const t of Object.keys(MIN_ROWS)) before[t] = await countOf(db, t);
  let secondOk = true;
  try {
    await db.exec(seedSql);
  } catch (e) {
    secondOk = false;
    console.log("  FAILED on second run -> " + String(e.message).split("\n")[0].slice(0, 200));
  }
  check("seed.sql runs a second time without error", secondOk);
  if (secondOk) {
    let drift = [];
    for (const t of Object.keys(MIN_ROWS)) {
      const after = await countOf(db, t);
      if (after !== before[t]) drift.push(`${t}: ${before[t]} -> ${after}`);
    }
    check("re-running the seed changes no row counts", drift.length === 0, drift.length ? drift.join(", ") : "all 27 tables stable");
  }

  await db.close();

  head(FAILURES === 0 ? "ALL CHECKS PASSED" : FAILURES + " CHECK(S) FAILED");
  console.log(FAILURES === 0
    ? "seed.sql is safe to paste into a real Supabase project and produces a fully populated demo."
    : "DO NOT paste seed.sql into Supabase until the failures above are fixed.");
  process.exit(FAILURES === 0 ? 0 : 1);
})().catch((e) => { console.error("HARNESS ERROR: " + e.stack); process.exit(2); });
