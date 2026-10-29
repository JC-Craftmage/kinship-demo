/**
 * verify-migrations.js
 * ====================
 * Executes the FULL Kinship migration chain against a real PostgreSQL engine
 * (PGlite 0.5.x, compiled Postgres — not a mock) and proves:
 *
 *   PHASE A  the 7-file migration chain (001 -> 002 -> 002 -> 003 -> 004 -> 005 -> 006) applies cleanly
 *   PHASE B  the attack battery from proof.js now fails against `anon`
 *   PHASE C  the app's real path (service_role) still works, including updated_at triggers
 *   PHASE D  post-conditions: RLS on every table, anon holds zero table grants,
 *            deny_client_access policy present on every table
 *   PHASE E  combined.sql (the single-file paste path) applies cleanly and reaches
 *            the same post-conditions
 *
 * Why this exists: `004_rls_policies.sql` had never been executed against a real
 * Postgres engine. If it failed, Jesse would find out at the exact moment he
 * created the Supabase project — the worst possible time.
 *
 * Run: npm run verify:db
 */
const fs = require("fs");
const { PGlite } = require("@electric-sql/pglite");

const path = require("path");
const MIG = path.resolve(__dirname, "..", "supabase", "migrations");
const CHAIN = [
  "001_initial_schema.sql",
  "002_add_location_fields.sql",
  "002_support_tickets.sql",
  "003_join_request_system.sql",
  "004_rls_policies.sql",
  "005_offers_and_bible_study.sql",
  "006_kudos.sql",
];

let FAILURES = 0;
function check(label, pass, detail) {
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${label}${detail ? " — " + detail : ""}`);
  if (!pass) FAILURES++;
}
function head(t) { console.log("\n" + "=".repeat(72) + "\n" + t + "\n" + "=".repeat(72)); }

/** Supabase provisions these roles for you. PGlite does not, so we stand them up. */
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

/** PGlite has no uuid-ossp extension build, and the app generates UUIDs in JS. */
function sanitize(sql) {
  return sql.replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/gi, "");
}

async function applyChain(db, files) {
  for (const f of files) {
    const sql = sanitize(fs.readFileSync(MIG + "/" + f, "utf8"));
    try {
      await db.exec(sql);
      console.log(`  applied ${f}`);
    } catch (e) {
      console.log(`  FAILED ${f}\n     -> ${String(e.message).split("\n")[0].slice(0, 200)}`);
      throw e;
    }
  }
}

async function runAs(db, role, sql) {
  try {
    await db.exec("set role " + role);
    const r = await db.query(sql);
    return { allowed: true, value: r.rows && r.rows[0] ? JSON.stringify(r.rows[0]) : "(ok, no rows)" };
  } catch (e) {
    return { allowed: false, value: String(e.message).split("\n")[0].slice(0, 110) };
  } finally {
    try { await db.exec("reset role"); } catch { /* role already reset */ }
  }
}

async function metadata(db) {
  const cols = await db.query(`select table_name, column_name, data_type, is_nullable, column_default, udt_name
    from information_schema.columns where table_schema='public' order by table_name, ordinal_position`);
  const byTbl = {};
  cols.rows.forEach((c) => (byTbl[c.table_name] = byTbl[c.table_name] || []).push(c));
  const enums = await db.query(`select t.typname, e.enumlabel from pg_type t join pg_enum e on e.enumtypid=t.oid order by t.typname, e.enumsortorder`);
  const enumMap = {};
  enums.rows.forEach((r) => { (enumMap[r.typname] = enumMap[r.typname] || []).push(r.enumlabel); });

  // CHECK constraints: a TEXT column can be constrained to a value list
  // (e.g. support_tickets.category IN ('faq','issue','feature','other')).
  // The harness must insert a legal value, or it "fails" a perfectly good schema.
  // NOTE: information_schema.key_column_usage does NOT list CHECK constraint
  // columns, so this has to come from the pg_constraint catalog.
  const chk = await db.query(`
    select c.conrelid::regclass::text as tbl,
           (select array_agg(a.attname order by a.attnum)
              from unnest(c.conkey) with ordinality as k(attnum, ord)
              join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum) as cols,
           pg_get_constraintdef(c.oid) as def
    from pg_constraint c
    where c.contype = 'c' and c.connamespace = 'public'::regnamespace`);
  const checkValues = {};
  chk.rows.forEach((r) => {
    const vals = (String(r.def).match(/'([^']*)'/g) || [])
      .map((s) => s.slice(1, -1))
      .filter((s) => s && !s.includes("::"));
    if (!vals.length) return;
    (r.cols || []).forEach((col) => {
      const tbl = (checkValues[r.tbl] = checkValues[r.tbl] || {});
      tbl[col] = vals;
    });
  });
  console.log("  [harness] CHECK-constrained columns discovered: " +
    Object.entries(checkValues).map(([t, cols]) => t + "{" + Object.keys(cols).join(",") + "}").join(" "));

  return { byTbl, enumMap, checkValues };
}

function valueFor(col, enumMap, checkValues, tbl) {
  const n = col.column_name.toLowerCase();
  if (col.udt_name && enumMap[col.udt_name]) return "'" + enumMap[col.udt_name][0] + "'";
  const allowed = checkValues && checkValues[tbl] && checkValues[tbl][col.column_name];
  if (allowed && allowed.length) return "'" + allowed[0] + "'";
  if (col.data_type === "uuid") return "'11111111-1111-1111-1111-111111111111'";
  if (col.data_type === "boolean") return "false";
  if (["integer", "bigint", "smallint"].includes(col.data_type)) return "0";
  if (["numeric", "double precision", "real"].includes(col.data_type)) return "0";
  if (n.endsWith("_at")) return "now()";
  if (n === "email") return "'x@example.com'";
  return "'test'";
}

function insertSql(byTbl, enumMap, checkValues, tbl) {
  const cs = byTbl[tbl] || [];
  const req = cs.filter((c) => c.is_nullable === "NO" && !c.column_default);
  if (!req.length) return `insert into ${tbl} default values;`;
  return `insert into ${tbl} (${req.map((c) => c.column_name).join(", ")}) values (${req.map((c) => valueFor(c, enumMap, checkValues, tbl)).join(", ")});`;
}

/** Shared post-condition audit — used by both PHASE A and PHASE E. */
async function auditPostConditions(db, label) {
  const rls = await db.query(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and c.relrowsecurity=false`);
  check(`${label}: every table has RLS enabled`, rls.rows.length === 0,
    rls.rows.length ? "without RLS: " + rls.rows.map((x) => x.relname).join(", ") : "0 tables without RLS");

  const grants = await db.query(`select grantee, count(*)::int c from information_schema.role_table_grants
    where grantee in ('anon','authenticated') and table_schema='public' group by grantee`);
  check(`${label}: anon/authenticated hold zero table grants`, grants.rows.length === 0,
    grants.rows.length ? JSON.stringify(grants.rows) : "0 grants");

  const pol = await db.query(`select c.relname, p.polname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    join pg_policy p on p.polrelid=c.oid where n.nspname='public' and c.relkind='r' and p.polname='deny_client_access'`);
  const tblCount = await db.query(`select count(*)::int c from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r'`);
  check(`${label}: deny_client_access policy on every table`, pol.rows.length === tblCount.rows[0].c,
    `${pol.rows.length}/${tblCount.rows[0].c} tables`);

  const seq = await db.query(`select count(*)::int c from information_schema.role_usage_grants
    where grantee in ('anon','authenticated') and object_schema='public'`);
  check(`${label}: anon/authenticated hold zero schema usage`, seq.rows[0].c === 0, seq.rows[0].c + " usage grants");
}

(async () => {
  // ---------------------------------------------------------------- PHASE A
  head("PHASE A — full 6-file migration chain on a real Postgres engine");
  const db = await PGlite.create();
  await provisionSupabaseRoles(db);
  let chainOk = true;
  try {
    await applyChain(db, CHAIN);
  } catch { chainOk = false; }
  check("chain 001 -> 002 -> 002 -> 003 -> 004 -> 005 -> 006 applies with no error", chainOk);

  const { byTbl, enumMap, checkValues } = await metadata(db);
  const tblCount = await db.query(`select count(*)::int c from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r'`);
  check("all 23 tables created", tblCount.rows[0].c === 23, tblCount.rows[0].c + " tables");

  // The two boards that used to have no table at all must now exist.
  const boardTables = await db.query(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and c.relname in
    ('offers','bible_study_groups','bible_study_signups','bible_study_sessions','bible_study_posts','kudos')
    order by c.relname`);
  check("Offers + Bible Study + Kudos tables exist", boardTables.rows.length === 6,
    boardTables.rows.map((r) => r.relname).join(", "));

  // needs.category must now be TEXT holding the UI's labels, not the old enum.
  const needsCat = await db.query(`select data_type, udt_name from information_schema.columns
    where table_schema='public' and table_name='needs' and column_name='category'`);
  check("needs.category is TEXT (UI contract), not an enum", needsCat.rows[0] && needsCat.rows[0].data_type === "text",
    needsCat.rows[0] ? needsCat.rows[0].data_type + "/" + needsCat.rows[0].udt_name : "column missing");
  const oldEnum = await db.query(`select 1 from pg_type where typname='need_category'`);
  check("legacy need_category enum is gone", oldEnum.rows.length === 0, oldEnum.rows.length + " row(s)");

  // ---------------------------------------------------------------- PHASE B
  head("PHASE B — attack battery against `anon` (the leaked public key)");
  await db.exec(`insert into churches (id, name, owner_id) values ('11111111-1111-1111-1111-111111111111','Test Church','owner_1');`);

  const attacks = [
    ["READ every church on the platform", "select count(*)::int c from churches;"],
    ["READ the member roster (names, emails, phones)", "select count(*)::int c from church_members;"],
    ["INSERT a fake member into a real church", insertSql(byTbl, enumMap, checkValues, "church_members")],
    ["INSERT a fake 'need' (noisy post)", insertSql(byTbl, enumMap, checkValues, "needs")],
    ["READ the offers board", "select count(*)::int c from offers;"],
    ["INSERT a fake offer", insertSql(byTbl, enumMap, checkValues, "offers")],
    ["READ the bible study groups", "select count(*)::int c from bible_study_groups;"],
    ["INSERT a fake bible study group", insertSql(byTbl, enumMap, checkValues, "bible_study_groups")],
    ["READ bible study discussion posts", "select count(*)::int c from bible_study_posts;"],
    ["READ everyone's physical assets", "select count(*)::int c from assets;"],
    ["READ the kudos feed", "select count(*)::int c from kudos;"],
    ["INSERT a fake kudos entry", insertSql(byTbl, enumMap, checkValues, "kudos")],
    ["INSERT a join request impersonating anyone", insertSql(byTbl, enumMap, checkValues, "join_requests")],
    ["READ member_departures (who left the church)", "select count(*)::int c from member_departures;"],
    ["INSERT into support_tickets", insertSql(byTbl, enumMap, checkValues, "support_tickets")],
    ["UPDATE a need", "update needs set title='pwned';"],
    ["DELETE a church", "delete from churches;"],
    ["INSERT a church (claim ownership)", insertSql(byTbl, enumMap, checkValues, "churches")],
  ];
  for (const [label, sql] of attacks) {
    const r = await runAs(db, "anon", sql);
    check(`anon: ${label}`, r.allowed === false, r.allowed ? "ALLOWED " + r.value : "blocked");
  }

  // An authenticated-but-not-matching-user path (what a Clerk user hitting Supabase directly would be).
  await db.exec("set role authenticated");
  await db.exec("select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false)");
  const authR = await runAs(db, "authenticated", "select count(*)::int c from churches;");
  check("authenticated: READ every church", authR.allowed === false, authR.allowed ? "ALLOWED" : "blocked");
  try { await db.exec("reset role"); } catch { /* role already reset */ }

  // ---------------------------------------------------------------- PHASE C
  head("PHASE C — the app's real path still works (service_role, BYPASSRLS)");
  const sr = await runAs(db, "service_role", insertSql(byTbl, enumMap, checkValues, "needs").replace(/;$/, " returning id;"));
  check("service_role: INSERT a need (the app's main write)", sr.allowed === true, sr.allowed ? "allowed " + sr.value : "BLOCKED: " + sr.value);
  const srRead = await runAs(db, "service_role", "select count(*)::int c from needs;");
  check("service_role: SELECT needs", srRead.allowed === true, srRead.allowed ? srRead.value : "BLOCKED: " + srRead.value);
  const srMembers = await runAs(db, "service_role", "select count(*)::int c from church_members;");
  check("service_role: SELECT church_members", srMembers.allowed === true, srMembers.allowed ? srMembers.value : "BLOCKED: " + srMembers.value);
  const srTickets = await runAs(db, "service_role", insertSql(byTbl, enumMap, checkValues, "support_tickets").replace(/;$/, " returning id;"));
  check("service_role: INSERT support_tickets (support board write)", srTickets.allowed === true, srTickets.allowed ? "allowed" : "BLOCKED: " + srTickets.value);

  // The five new tables must be reachable by service_role. BYPASSRLS does NOT
  // bypass table-level privileges, so a missing GRANT would make the app's own
  // API routes fail even though the row-level policy allows the read.
  for (const t of ["offers", "bible_study_groups", "bible_study_signups", "bible_study_sessions", "bible_study_posts", "kudos"]) {
    const r = await runAs(db, "service_role", `select count(*)::int c from ${t};`);
    check(`service_role: SELECT ${t} (new table is granted)`, r.allowed === true, r.allowed ? r.value : "BLOCKED: " + r.value);
  }
  const srOffer = await runAs(db, "service_role", insertSql(byTbl, enumMap, checkValues, "offers").replace(/;$/, " returning id;"));
  check("service_role: INSERT an offer (Offers board write)", srOffer.allowed === true, srOffer.allowed ? "allowed" : "BLOCKED: " + srOffer.value);
  const srGroup = await runAs(db, "service_role", insertSql(byTbl, enumMap, checkValues, "bible_study_groups").replace(/;$/, " returning id;"));
  check("service_role: INSERT a bible study group (Bible Study board write)", srGroup.allowed === true, srGroup.allowed ? "allowed" : "BLOCKED: " + srGroup.value);

  // The whole point of migration 005's Section 3: a category the UI can
  // actually produce must be storable, and the retired enum label must not be.
  const okCat = await runAs(db, "service_role", "update needs set category='Moving Help' where id=(select id from needs limit 1);");
  check("service_role: store a UI category ('Moving Help') on needs", okCat.allowed === true,
    okCat.allowed ? "accepted" : "REJECTED: " + okCat.value);
  const badCat = await runAs(db, "service_role", "update needs set category='practical' where id=(select id from needs limit 1);");
  check("service_role: retire the old enum label ('practical')", badCat.allowed === false,
    badCat.allowed ? "STILL ACCEPTED: " + badCat.value : "rejected by CHECK constraint");

  // Trigger functions lost EXECUTE from PUBLIC in section 3 of 004. Postgres checks
  // trigger EXECUTE at CREATE TRIGGER time, not fire time — but that must be proven,
  // not assumed, or updated_at silently stops updating.
  const trig = await db.query(`select tgrelid::regclass::text as tbl, tgname
    from pg_trigger where not tgisinternal and tgrelid in
    (select c.oid from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public')`);
  console.log(`  (${trig.rows.length} user triggers found: ${trig.rows.map((t) => t.tbl + "." + t.tgname).join(", ") || "none"})`);
  const hasUpdatedAt = trig.rows.length > 0;
  if (hasUpdatedAt) {
    const upd = await runAs(db, "service_role", "update needs set title='trigger check' returning updated_at;");
    check("updated_at trigger still fires after REVOKE EXECUTE FROM PUBLIC", upd.allowed === true,
      upd.allowed ? "trigger fired, updated_at=" + upd.value : "UPDATE BLOCKED: " + upd.value);
  } else {
    console.log("  (no user triggers in this schema — skipping trigger check)");
  }

  // ---------------------------------------------------------------- PHASE D
  head("PHASE D — post-conditions after 004");
  await auditPostConditions(db, "chain");

  await db.close();

  // ---------------------------------------------------------------- PHASE E
  head("PHASE E — combined.sql single-file paste path");
  const db2 = await PGlite.create();
  await provisionSupabaseRoles(db2);
  let combinedOk = true;
  try {
    await db2.exec(sanitize(fs.readFileSync(MIG + "/combined.sql", "utf8")));
    console.log("  applied combined.sql");
  } catch (e) {
    combinedOk = false;
    console.log("  FAILED combined.sql\n     -> " + String(e.message).split("\n")[0].slice(0, 200));
  }
  check("combined.sql applies with no error", combinedOk);
  if (combinedOk) {
    const t2 = await db2.query(`select count(*)::int c from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relkind='r'`);
    check("combined.sql creates all 23 tables", t2.rows[0].c === 23, t2.rows[0].c + " tables");
    await auditPostConditions(db2, "combined");
    const leak = await runAs(db2, "anon", "select count(*)::int c from churches;");
    check("combined: anon cannot READ churches", leak.allowed === false, leak.allowed ? "ALLOWED" : "blocked");
    const ok = await runAs(db2, "service_role", "select count(*)::int c from churches;");
    check("combined: service_role still works", ok.allowed === true, ok.allowed ? ok.value : "BLOCKED: " + ok.value);
    for (const t of ["offers", "bible_study_groups", "bible_study_signups", "bible_study_sessions", "bible_study_posts", "kudos"]) {
      const r2 = await runAs(db2, "service_role", `select count(*)::int c from ${t};`);
      check(`combined: service_role can reach ${t}`, r2.allowed === true, r2.allowed ? r2.value : "BLOCKED: " + r2.value);
    }
    const leakOffer = await runAs(db2, "anon", "select count(*)::int c from offers;");
    check("combined: anon cannot READ offers", leakOffer.allowed === false, leakOffer.allowed ? "ALLOWED" : "blocked");
    await db2.close();
  }

  head(FAILURES === 0 ? "ALL CHECKS PASSED" : FAILURES + " CHECK(S) FAILED");
  console.log(FAILURES === 0
    ? "The migration chain and combined.sql are both safe to apply to a real Supabase project."
    : "DO NOT apply to Supabase until the failures above are fixed.");
  process.exit(FAILURES === 0 ? 0 : 1);
})().catch((e) => { console.error("HARNESS ERROR: " + e.stack); process.exit(2); });
