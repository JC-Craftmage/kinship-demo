// One-off codemod: escape unescaped JSX quote entities reported by
// eslint react/no-unescaped-entities. Precise line/column targeting.
const fs = require('fs');
const path = require('path');

const reportPath = process.argv[2];
const root = process.argv[3];
let rawReport = fs.readFileSync(reportPath, 'utf8');
if (rawReport.charCodeAt(0) === 0xfeff) rawReport = rawReport.slice(1);
const report = JSON.parse(rawReport);

let changedFiles = 0;
let changedChars = 0;

for (const file of report) {
  const msgs = file.messages.filter(
    (m) => m.severity === 2 && m.ruleId === 'react/no-unescaped-entities'
  );
  if (!msgs.length) continue;

  const rel = path.relative(root, file.filePath);
  const raw = fs.readFileSync(file.filePath, 'utf8');
  const hasBom = raw.charCodeAt(0) === 0xfeff;
  let text = hasBom ? raw.slice(1) : raw;

  // eslint columns are 1-based and count UTF-16 code units, which matches
  // JS string indices for the BMP. Group by line, apply right-to-left.
  const byLine = new Map();
  for (const m of msgs) {
    if (!byLine.has(m.line)) byLine.set(m.line, []);
    byLine.get(m.line).push(m);
  }

  const lines = text.split('\n');
  for (const [lineNo, lineMsgs] of byLine) {
    const idx = lineNo - 1;
    if (idx < 0 || idx >= lines.length) {
      throw new Error(`bad line ${lineNo} in ${rel}`);
    }
    const cols = lineMsgs.map((m) => m.column).sort((a, b) => b - a);
    let line = lines[idx];
    for (const col of cols) {
      const pos = col - 1;
      const ch = line[pos];
      let replacement;
      if (ch === "'") replacement = '&#39;';
      else if (ch === '"') replacement = '&quot;';
      else {
        throw new Error(
          `unexpected char ${JSON.stringify(ch)} at ${rel}:${lineNo}:${col}`
        );
      }
      line = line.slice(0, pos) + replacement + line.slice(pos + 1);
      changedChars++;
    }
    lines[idx] = line;
  }

  const out = (hasBom ? '\ufeff' : '') + lines.join('\n');
  if (out !== text) {
    fs.writeFileSync(file.filePath, out, 'utf8');
    changedFiles++;
    console.log(`fixed ${rel} (${msgs.length} errors)`);
  }
}

console.log(`\n${changedFiles} files changed, ${changedChars} characters escaped.`);
