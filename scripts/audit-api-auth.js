#!/usr/bin/env node
/**
 * audit-api-auth.js
 * =================
 * Kinship uses the Supabase **service_role** key on the server, which BYPASSES
 * row level security. RLS therefore protects the *anon key*, not the app's own
 * users. The ONLY thing standing between a signed-in user and another church's
 * data is the authorization logic inside these API routes.
 *
 * That logic is invisible to the compiler and to tests, so it rots silently.
 * This tool audits every route in `app/api/**` against an explicit manifest and
 * fails if reality drifts from the declaration.
 *
 * INVARIANT: every API route must appear in the manifest. Adding a route
 * without classifying it is a FAILURE, not a skip.
 *
 * Run:  node scripts/audit-api-auth.js          (audit)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_DIR = path.join(ROOT, "app", "api");

/**
 * scope:
 *   'own'     — the caller's own data only (scoped by user_id)
 *   'tenant'  — data belonging to one church; requires a membership/role check
 *   'public'  — no user data; cross-tenant by design (listing/discovery)
 *
 * guards: each entry is a list of ALTERNATIVES; at least one must appear.
 *   auth       — the caller must be identified: `getUserId()` or `await auth()`
 *   membership — a church-scoped lookup must happen: `getMembership(` or
 *                `requireChurchRole(`
 *   role       — the role must be checked: a role list must be applied
 */
const MANIFEST = {
  "app/api/churches/create/route.ts": {
    verbs: ["POST"], scope: "own",
    guards: [["getUserId", "await auth()"], ["getAnyMembership"]],
    note: "Creates a church owned by the caller; refuses if the caller already has one.",
  },
  "app/api/churches/leave/route.ts": {
    verbs: ["POST"], scope: "own",
    guards: [["getUserId", "await auth()"], [".eq('user_id'"]],
    note: "Membership row is loaded by BOTH id and user_id, so a caller can only leave their own membership.",
  },
  "app/api/churches/search/route.ts": {
    verbs: ["GET"], scope: "public",
    guards: [["getUserId", "await auth()"]],
    note: "Cross-tenant discovery by design. Must expose listing-safe fields only.",
  },
  "app/api/churches/[id]/route.ts": {
    verbs: ["GET"], scope: "public",
    guards: [["getUserId", "await auth()"]],
    note: "Public directory view. Must not return owner id or member data.",
  },
  "app/api/churches/[id]/questionnaire/route.ts": {
    verbs: ["GET"], scope: "public",
    guards: [["getUserId", "await auth()"]],
    note: "Returns questions only, never responses.",
  },
  "app/api/invites/generate/route.ts": {
    verbs: ["POST"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"], ["'owner', 'overseer'"]],
    note: "Owner/overseer only, and the campus must belong to the same church.",
  },
  "app/api/invites/join/route.ts": {
    verbs: ["POST"], scope: "own",
    guards: [["getUserId", "await auth()"], ["getAnyMembership"], ["campusBelongsToChurch"]],
    note: "Joins the caller to a church via invite code; membership belongs to the caller.",
  },
  "app/api/join-requests/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"], ["REQUEST_REVIEW_ROLES"]],
    note: "Lists join requests for one church.",
  },
  "app/api/join-requests/create/route.ts": {
    verbs: ["POST"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"], ["campusBelongsToChurch"]],
    note: "Files a join request against one church.",
  },
  "app/api/join-requests/[id]/approve/route.ts": {
    verbs: ["POST"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"], ["REQUEST_REVIEW_ROLES"]],
    note: "Derives the target church from the request row, never from client input.",
  },
  "app/api/join-requests/[id]/deny/route.ts": {
    verbs: ["POST"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"], ["REQUEST_REVIEW_ROLES"]],
    note: "Derives the target church from the request row, never from client input.",
  },
  "app/api/assets/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Assets shared by the caller's own church members. Church id comes from the caller's membership.",
  },
  "app/api/bible-study/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Bible Study groups of the caller's own church.",
  },
  "app/api/directory/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Member directory of the caller's own church.",
  },
  "app/api/meal-trains/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Meal trains of the caller's own church, with their signups.",
  },
  "app/api/needs/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Needs posted by the caller's own church, with their volunteers.",
  },
  "app/api/offers/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Offers shared by the caller's own church.",
  },
  "app/api/kudos/route.ts": {
    verbs: ["GET", "POST"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Kudos of the caller's own church. The church comes from the caller's membership, the recipient must belong to that church, and self-kudos are refused.",
  },
  "app/api/life-events/route.ts": {
    verbs: ["GET", "POST"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Life events of the caller's own church. The church comes from the caller's membership; a named member or campus must belong to that church.",
  },
  "app/api/life-events/[id]/comments/route.ts": {
    verbs: ["GET", "POST"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "Comments on a life event. The event is loaded by BOTH id and church id, so an event from another church is not visible here.",
  },
  "app/api/me/church/route.ts": {
    verbs: ["GET"], scope: "own",
    guards: [["getUserId", "await auth()"], ["getAnyMembership"]],
    note: "Returns only the caller's own membership.",
  },
  "app/api/support/route.ts": {
    verbs: ["POST", "GET"], scope: "own",
    guards: [["getUserId", "await auth()"], ["getMembership", "requireChurchRole"]],
    note: "GET is scoped by user_id; POST is scoped by membership when churchId is given.",
  },
  "app/api/support/admin/tickets/route.ts": {
    verbs: ["GET"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["requireChurchRole"], ["ADMIN_ROLES"]],
    note: "Owner/overseer of the requested church.",
  },
  "app/api/support/admin/tickets/[id]/route.ts": {
    verbs: ["PATCH"], scope: "tenant",
    guards: [["getUserId", "await auth()"], ["requireChurchRole"], ["ADMIN_ROLES"]],
    note: "Target church derived from the ticket row, never from client input.",
  },
};

/** Tables that hold tenant data. A route touching these must be tenant-scoped. */
const TENANT_TABLES = [
  "church_members", "campus_overseers", "members", "assets", "meal_trains",
  "meal_signups", "needs", "need_volunteers", "join_requests",
  "join_request_responses", "join_request_denials", "member_departures",
  "support_tickets", "invite_codes", "offers", "bible_study_groups",
  "bible_study_signups", "bible_study_sessions", "bible_study_posts", "kudos",
  "life_events", "life_event_comments",
];

let FAILURES = 0;
const fail = (m) => { console.log(`  [FAIL] ${m}`); FAILURES++; };
const pass = (m) => console.log(`  [PASS] ${m}`);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "route.ts") out.push(p);
  }
  return out;
}

/** Every file under a directory (not just route.ts). */
function walkAll(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkAll(p, out);
    else out.push(p);
  }
  return out;
}

function rel(p) { return path.relative(ROOT, p).split(path.sep).join("/"); }

console.log("=".repeat(72));
console.log("KINSHIP API AUTHORIZATION AUDIT");
console.log("=".repeat(72));
console.log("service_role bypasses RLS. These route guards are the real boundary.\n");

// ---------------------------------------------------------------- 1. manifest
const routeFiles = walk(API_DIR).map(rel).sort();
console.log(`[1] Manifest coverage (${routeFiles.length} routes found)`);
for (const r of routeFiles) {
  if (!MANIFEST[r]) fail(`${r} is NOT in the manifest — classify it (new route = unclassified risk)`);
}
const declared = Object.keys(MANIFEST);
for (const d of declared) {
  if (!routeFiles.includes(d)) fail(`manifest lists ${d} but that file does not exist (stale manifest entry)`);
}
if (FAILURES === 0) pass(`all ${routeFiles.length} routes are classified`);

// ---------------------------------------------------------------- 2. per route
console.log(`\n[2] Per-route guard verification`);
const detected = {};
for (const r of routeFiles) {
  const src = fs.readFileSync(path.join(ROOT, r), "utf8");
  const m = MANIFEST[r];
  const verbs = [...src.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)/g)].map((x) => x[1]);
  const found = [];
  for (const g of ["getUserId", "getMembership", "getAnyMembership", "requireChurchRole", "campusBelongsToChurch"]) {
    if (src.includes(g)) found.push(g);
  }
  detected[r] = { verbs, found, src };

  const label = r.replace("app/api/", "");
  if (!m) continue;

  // verbs match the manifest
  const declaredV = m.verbs.slice().sort().join(",");
  const actualV = verbs.slice().sort().join(",");
  if (declaredV !== actualV) {
    fail(`${label}: manifest says verbs [${declaredV}] but the file exports [${actualV}]`);
  }

  // every declared guard must be satisfied by at least one of its alternatives
  m.guards.forEach((alts, idx) => {
    if (!alts.some((a) => src.includes(a))) {
      fail(`${label}: guard #${idx + 1} unsatisfied — none of [${alts.join(" | ")}] appear in the route`);
    }
  });

  // a route must authenticate unless it touches no user data at all
  const authenticates = src.includes("await auth()") || src.includes("getUserId()");
  if (!authenticates) fail(`${label}: no authentication — the caller is never identified`);

  // tenant scope must actually consult membership
  if (m.scope === "tenant") {
    const checksMembership = found.some((g) => ["getMembership", "requireChurchRole"].includes(g));
    if (!checksMembership) fail(`${label}: tenant-scoped route does not check membership`);
  }

  // own scope must actually filter by the caller's user id
  if (m.scope === "own") {
    const scopedByUser = src.includes(".eq('user_id'") || found.includes("getAnyMembership");
    if (!scopedByUser) fail(`${label}: own-scoped route never filters by user_id`);
  }
}
if (FAILURES === 0) pass("every route matches its manifest declaration");

// ---------------------------------------------------------------- 3. client leak
console.log(`\n[3] Browser-side Supabase access`);
const leakFiles = [];
function scanDir(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const relp = rel(p);
    if (relp.includes("node_modules") || relp.includes(".next") || relp.includes(".git")) continue;
    if (e.isDirectory()) { scanDir(p); continue; }
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name)) continue;
    const src = fs.readFileSync(p, "utf8");
    const isClient = /^\s*["']use client["']/.test(src);
    const importsSupabase = /@\/lib\/supabase\/(client|server)/.test(src) || /@supabase\/supabase-js/.test(src);
    if (isClient && importsSupabase) leakFiles.push(relp);
    // The project URL is not a credential and is read only from a server-only
    // module. Any OTHER NEXT_PUBLIC_SUPABASE_* name is a rejected anon key.
    const pubSupabase = [...src.matchAll(/NEXT_PUBLIC_SUPABASE_[A-Z_]+/g)].map((m) => m[0]);
    for (const name of new Set(pubSupabase)) {
      if (name === "NEXT_PUBLIC_SUPABASE_URL") {
        if (!/server-only/.test(src)) leakFiles.push(relp + ` (${name} used outside a server-only module)`);
      } else {
        leakFiles.push(relp + ` (${name} — browser-reachable Supabase credential)`);
      }
    }
    if (/service_role|SUPABASE_SERVICE_ROLE/.test(src) && isClient) leakFiles.push(relp + " (service_role reference in a client component)");
  }
}
scanDir(path.join(ROOT, "app"));
scanDir(path.join(ROOT, "components"));
scanDir(path.join(ROOT, "hooks"));
scanDir(path.join(ROOT, "lib"));
scanDir(path.join(ROOT, "scripts"));
// this audit tool legitimately names the variables it forbids
for (let i = leakFiles.length - 1; i >= 0; i--) {
  if (leakFiles[i].startsWith("scripts/audit-api-auth.js")) leakFiles.splice(i, 1);
}
if (leakFiles.length) {
  leakFiles.forEach((f) => fail(`browser-side Supabase access: ${f}`));
} else {
  pass("no client component imports Supabase; no NEXT_PUBLIC_SUPABASE or service_role in source");
}

// the browser-side client module must not exist at all
if (fs.existsSync(path.join(ROOT, "lib", "supabase", "client.ts"))) {
  fail("lib/supabase/client.ts still exists — the browser can reach Supabase directly");
} else {
  pass("lib/supabase/client.ts does not exist");
}

// ---------------------------------------------------------------- 4. tenant tables
console.log(`\n[4] Tenant-table access in routes`);
for (const r of routeFiles) {
  const m = MANIFEST[r];
  if (!m) continue;
  const src = detected[r].src;
  const touched = TENANT_TABLES.filter((t) => new RegExp(`from\\('${t}'\\)`).test(src));
  if (!touched.length) continue;
  if (m.scope === "public") {
    // discovery routes must not reach into tenant tables at all
    if (touched.length) fail(`${r.replace("app/api/", "")}: public/discovery route reads tenant table(s): ${touched.join(", ")}`);
    else pass(`${r.replace("app/api/", "")}: public route touches no tenant table`);
  } else {
    pass(`${r.replace("app/api/", "")}: touches ${touched.join(", ")} with scope '${m.scope}'`);
  }
}

// ------------------------------------------- 5. tenant-table module containment
// A tenant table can be reached from a helper module instead of the route
// itself. That is fine ONLY if the helper is server-only (so it can never be
// pulled into a browser bundle) and the route that uses it is classified.
console.log(`\n[5] Tenant-table access is contained to server-only modules`);
const containmentRoots = ["app", "components", "hooks", "lib"];
const offenders = [];
for (const root of containmentRoots) {
  const base = path.join(ROOT, root);
  if (!fs.existsSync(base)) continue;
  for (const f of walkAll(base)) {
    const relp = rel(f);
    if (relp.includes("node_modules") || relp.includes(".next") || relp.includes(".git")) continue;
    if (!/\.(ts|tsx|js|jsx)$/.test(f)) continue;
    const src = fs.readFileSync(f, "utf8");
    const touched = TENANT_TABLES.filter((t) => new RegExp(`from\\('${t}'\\)`).test(src));
    if (!touched.length) continue;

    const isRoute = relp.startsWith("app/api/");
    const serverOnly = /import\s+['"]server-only['"]/.test(src);

    if (isRoute) {
      const m = MANIFEST[relp];
      if (!m) {
        offenders.push(`${relp}: reaches tenant table(s) ${touched.join(", ")} but is unclassified`);
      } else if (m.scope === "public") {
        offenders.push(`${relp}: public route reaches tenant table(s) ${touched.join(", ")}`);
      }
    } else if (!serverOnly) {
      offenders.push(`${relp}: reaches tenant table(s) ${touched.join(", ")} but is not marked 'server-only'`);
    }
  }
}
if (offenders.length) {
  offenders.forEach((o) => fail(`tenant-table containment: ${o}`));
} else {
  pass("every tenant-table read lives in a server-only module or a classified tenant route");
}

console.log("\n" + "=".repeat(72));
if (FAILURES === 0) {
  console.log("API AUTHORIZATION AUDIT PASSED");
  console.log("Every route is classified, authenticated, and its tenant scope is enforced.");
} else {
  console.log(`${FAILURES} FAILURE(S)`);
}
console.log("=".repeat(72));
process.exit(FAILURES === 0 ? 0 : 1);
