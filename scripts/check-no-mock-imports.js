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
 * Rules for INLINE mock data (added 2026-10-30):
 *   A fixture in `data/` is only fake because it is clearly fake and clearly
 *   server-gated. An inline dataset pasted straight into a component has
 *   neither property: it renders the same in a production build as in a demo
 *   build, so the user sees invented people and invented activity and has no
 *   way to tell. So inline mock datasets are a build-time failure too.
 *
 *   An inline dataset is flagged when EITHER:
 *     (a) it is named like a mock (MOCK_*, mockX, fakeX, DEMO_*, demoX,
 *         SAMPLE_*, sampleX), or
 *     (b) it is an array of records -- objects that each carry an `id` and a
 *         human-readable field (text/title/name/message). That is the shape
 *         of fake rows: fake members, fake kudos, fake notifications.
 *
 *   Static UI configuration (string lists, style maps, icon maps) is NOT
 *   flagged. The difference matters: a list of campus names is part of the
 *   product, a list of invented members is not.
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
const inlineHits = [];

/** Names that give a dataset away as mock data. */
const MOCK_NAME = /^(MOCK_[A-Z0-9_]*|mock[A-Z_]|fake[A-Z_]|FAKE_[A-Z0-9_]*|DEMO_[A-Z0-9_]*|demo[A-Z_]|SAMPLE_[A-Z0-9_]*|sample[A-Z_])/;

/** Fields that make an object look like a record with a human-readable title. */
const RECORD_TEXT_FIELDS = ["text", "title", "name", "message"];

/**
 * Find the matching close bracket for the opener at `start`, skipping over
 * strings so brackets inside a string do not confuse the scan.
 */
function matchBracket(src, start) {
  const open = src[start];
  const close = open === "[" ? "]" : open === "{" ? "}" : ")";
  let depth = 0;

  for (let i = start; i < src.length; i++) {
    const ch = src[i];

    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") { i++; continue; }
        if (src[i] === quote) break;
        i++;
      }
      continue;
    }

    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Split the body of an array literal into its top-level elements. */
function splitElements(body) {
  const parts = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];

    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      current += ch;
      i++;
      while (i < body.length) {
        current += body[i];
        if (body[i] === "\\") { current += body[i + 1] ?? ""; i += 2; continue; }
        if (body[i] === quote) break;
        i++;
      }
      continue;
    }

    if (ch === "[" || ch === "{" || ch === "(") depth++;
    else if (ch === "]" || ch === "}" || ch === ")") depth--;

    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** The keys declared directly on an object literal. */
function objectKeys(literal) {
  const body = literal.trim().replace(/^\{/, "").replace(/\}$/, "");
  const keys = new Set();
  const re = /(?:^|[,{\s])([A-Za-z_$][\w$]*)\s*:/g;
  let m;
  while ((m = re.exec(body))) keys.add(m[1]);
  return keys;
}

/**
 * An array of records: every element is an object literal carrying an `id`
 * and a human-readable field. That is the shape of invented rows.
 */
function looksLikeRecords(elements) {
  if (elements.length < 2) return false;
  let records = 0;

  for (const element of elements) {
    if (!element.startsWith("{")) return false;
    const keys = objectKeys(element);
    if (!keys.has("id")) return false;
    if (!RECORD_TEXT_FIELDS.some((field) => keys.has(field))) return false;
    records++;
  }
  return records === elements.length;
}

/**
 * Scan a file for inline datasets. Returns a list of human-readable
 * findings: { line, name, reason }.
 */
function findInlineDatasets(src) {
  const findings = [];
  const seen = new Set();

  // (a) Datasets named like mock data.
  const declRe = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=;]*?)?=\s*([\[{])/g;
  let m;
  while ((m = declRe.exec(src))) {
    const name = m[1];
    if (!MOCK_NAME.test(name)) continue;
    const line = src.slice(0, m.index).split("\n").length;
    const key = `${line}:${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({ line, name, reason: "named like mock data" });
  }

  // (b) Arrays of invented records.
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== "[") continue;
    const before = src.slice(Math.max(0, i - 60), i);
    if (!/[=(:,]\s*$/.test(before)) continue;
    const end = matchBracket(src, i);
    if (end < 0) continue;

    const elements = splitElements(src.slice(i + 1, end));
    if (!looksLikeRecords(elements)) continue;

    // Find the name this array belongs to, if any.
    const decl = before.match(/([A-Za-z_$][\w$]*)\s*(?::[^=;]*?)?=\s*$/);
    const name = decl ? decl[1] : "(inline)";
    if (MOCK_NAME.test(name)) continue; // already reported by (a)

    const line = src.slice(0, i).split("\n").length;
    const key = `${line}:${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({ line, name, reason: "inline array of invented records" });
    i = end;
  }

  return findings;
}

for (const root of [...CLIENT_ROOTS, SERVER_ALLOWED_ROOT]) {
  const base = path.join(ROOT, root);
  for (const f of walk(base)) {
    const src = fs.readFileSync(f, "utf8");
    const relp = rel(f);

    // Rule 3: inline mock datasets.
    for (const finding of findInlineDatasets(src)) {
      inlineHits.push(`${relp}:${finding.line}  ${finding.name}  (${finding.reason})`);
    }

    const m = src.match(/from '@\/data\/[^']+'/g);
    if (!m) continue;
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

console.log(`\n[3] no inline mock datasets in ${CLIENT_ROOTS.join(", ")} or lib/`);
if (inlineHits.length) {
  inlineHits.forEach((h) => fail(`inline mock dataset: ${h}`));
} else {
  pass("no inline mock datasets (every board reads the database)");
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
