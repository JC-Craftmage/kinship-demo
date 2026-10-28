#!/usr/bin/env node
/**
 * check-no-mock-imports.js
 * ========================
 * `data/*.ts` holds DEMO FIXTURES — fake churches, fake members, fake needs.
 * It exists so a demo build has something to show. It is NOT production data
 * and it must never stand in for a real database without the demo mode being
 * explicitly switched on.
 *
 * The boards now read from the authenticated API routes. If a client
 * component imports the fixtures directly, the app would silently show fake
 * data while the user believes they are looking at their church. That is the
 * single most damaging failure this project can have, so it is a build-time
 * failure, not a code-review convention.
 *
 * Rules:
 *   app/, components/, hooks/  -> may NOT import @/data/* at all
 *   lib/                       -> may import it ONLY from the explicit demo
 *                                  loader (lib/demo/loader.ts), which must be
 *                                  a 'server-only' module
 *
 * Run:  node scripts/check-no-mock-imports.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CLIENT_ROOTS = ["app", "components", "hooks"];
const SERVER_ALLOWED_ROOT = "lib";
/** The one module allowed to reach the fixtures. */
const DEMO_LOADER = "lib/demo/loader.ts";

let FAILURES = 0;
const fail = (m) => { console.log(`  [FAIL] ${m}`); FAILURES++; };
const pass = (m) => console.log(`  [PASS] ${m}`);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

function rel(p) { return path.relative(ROOT, p).split(path.sep).join("/"); }

console.log("=".repeat(72));
console.log("KINSHIP MOCK-DATA IMPORT GATE");
console.log("=".repeat(72));
console.log("Demo fixtures must not leak into the client as if they were real.\n");

const clientHits = [];
const libHits = [];

for (const root of [...CLIENT_ROOTS, SERVER_ALLOWED_ROOT]) {
  const base = path.join(ROOT, root);
  for (const f of walk(base)) {
    const src = fs.readFileSync(f, "utf8");
    const m = src.match(/from '@\/data\/[^']+'/g);
    if (!m) continue;
    const relp = rel(f);
    if (root === SERVER_ALLOWED_ROOT) {
      const serverOnly = /import\s+['"]server-only['"]/.test(src);
      const notes = [];
      if (!serverOnly) notes.push("NOT server-only");
      if (relp !== DEMO_LOADER) notes.push(`not the demo loader (${DEMO_LOADER})`);
      libHits.push(`${relp}${notes.length ? ` (${notes.join(", ")})` : ""}`);
    } else {
      clientHits.push(`${relp} -> ${[...new Set(m)].join(", ")}`);
    }
  }
}

console.log(`[1] Client code (${CLIENT_ROOTS.join(", ")}) must not import demo fixtures`);
if (clientHits.length) {
  clientHits.forEach((h) => fail(`client imports demo fixtures: ${h}`));
} else {
  pass("no client file imports @/data/*");
}

console.log(`\n[2] only ${DEMO_LOADER} may import demo fixtures, and it must be 'server-only'`);
if (libHits.length) {
  const bad = libHits.filter((h) => h.includes("NOT server-only") || h.includes("not the demo loader"));
  if (bad.length) bad.forEach((h) => fail(`unauthorized demo-fixture import: ${h}`));
  else pass(`demo fixtures are reachable only through ${DEMO_LOADER}`);
} else {
  pass("no lib module imports @/data/* (the boards read from the API routes)");
}

console.log("\n" + "=".repeat(72));
if (FAILURES === 0) {
  console.log("MOCK-DATA IMPORT GATE PASSED");
  console.log("Every board reads from the authenticated API routes, not from fixtures.");
} else {
  console.log(`${FAILURES} FAILURE(S)`);
}
console.log("=".repeat(72));
process.exit(FAILURES === 0 ? 0 : 1);
