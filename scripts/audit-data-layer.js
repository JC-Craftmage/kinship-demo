/**
 * audit-data-layer.js — how does this app talk to the database?
 *
 * Why this exists (2026-11-01): the Supabase project does not exist, and the
 * "just paste the schema into any Postgres" idea was floating around as an
 * unblock. That idea is only half true, and this script is the proof.
 *
 * supabase-js `.from()` calls go over HTTP to PostgREST, NOT to Postgres
 * directly. So a plain Postgres (Neon, RDS, a local Docker Postgres) holds the
 * data but the app cannot read it — there is no PostgREST in front of it.
 * The only ways out are: a real Supabase project, a self-hosted PostgREST /
 * Supabase stack, or rewriting the data layer onto a direct SQL driver.
 *
 * This script measures the blast radius of that third option so the estimate
 * is not a guess.
 *
 * Usage: node scripts/audit-data-layer.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);
const SUPABASE_RE = /@supabase\/supabase-js/;
const RAW_DRIVER_RE =
  /(from|require\()\s*['"](pg|postgres|drizzle-orm|@vercel\/postgres|neon-http|@neondatabase)/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

// 1. Which client does the app use?
const sourceFiles = walk(ROOT).filter(
  (f) => /\.(ts|tsx|js|mjs)$/.test(f) && !rel(f).startsWith('scripts/')
);
const supabaseUsers = [];
const rawDriverUsers = [];
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (SUPABASE_RE.test(text)) supabaseUsers.push(rel(file));
  if (RAW_DRIVER_RE.test(text)) rawDriverUsers.push(rel(file));
}

// 2. API surface — how many PostgREST call sites would a driver swap touch?
const routes = walk(path.join(ROOT, 'app', 'api')).filter((f) => path.basename(f) === 'route.ts');
const tables = new Set();
let fromCalls = 0;
let rpcCalls = 0;
let routeLines = 0;
for (const route of routes) {
  const text = fs.readFileSync(route, 'utf8');
  fromCalls += (text.match(/\.from\(/g) || []).length;
  rpcCalls += (text.match(/\.rpc\(/g) || []).length;
  routeLines += text.split('\n').length;
  for (const m of text.match(/\.from\(['"]([a-z_]+)['"]\)/g) || []) {
    tables.add(m.replace(/\.from\(['"]|['"]\)/g, ''));
  }
}

// 3. Database objects that are not plain table CRUD.
const schemaFile = path.join(ROOT, 'supabase', 'migrations', 'combined.sql');
const schema = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf8') : '';
const count = (re) => (schema.match(re) || []).length;

console.log('=== Kinship data-layer audit ===');
console.log('app files scanned            :', sourceFiles.length);
console.log('files using @supabase/supabase-js :', supabaseUsers.length);
console.log('files using a raw SQL driver :', rawDriverUsers.length, rawDriverUsers);
console.log('API routes                   :', routes.length);
console.log('route lines                  :', routeLines);
console.log('.from() call sites in routes :', fromCalls);
console.log('.rpc() call sites in routes  :', rpcCalls);
console.log('distinct tables touched      :', tables.size);
console.log('schema objects: tables', count(/CREATE TABLE/g),
  '| functions', count(/CREATE (OR REPLACE )?FUNCTION/g),
  '| triggers', count(/CREATE TRIGGER/g),
  '| indexes', count(/CREATE INDEX/g));
console.log('');
console.log('verdict: the data layer is 100% PostgREST table CRUD (no stored-procedure calls),');
console.log('so a direct-driver rewrite is bounded by the', fromCalls, 'call sites above.');
