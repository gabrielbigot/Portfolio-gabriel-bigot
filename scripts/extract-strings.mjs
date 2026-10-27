#!/usr/bin/env node
/*
 * extract-strings.mjs — migration ponctuelle : sort les textes écrits en dur dans le JSX des pages et composants vers
 * content/site/strings.json (éditable dans le studio) et remplace le JSX par des appels t("clé").
 *   node scripts/extract-strings.mjs --dry     (compte et liste, n'écrit rien)
 *   node scripts/extract-strings.mjs           (applique)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DRY = process.argv.includes('--dry');
const DICT_ONLY = process.argv.includes('--dict-only'); // reconstruit seulement strings.json depuis les sources d'origine (SRC_ROOT)
const SRC_ROOT = process.env.SRC_ROOT || ROOT;
const FILES = [
  'app/about/page.tsx', 'app/en/about/page.tsx', 'app/uses/page.tsx', 'app/en/uses/page.tsx', 'app/work/page.tsx', 'app/en/work/page.tsx',
  'app/work/[slug]/page.tsx', 'app/projects/[slug]/page.tsx', 'app/en/projects/[slug]/page.tsx', 'app/blog/[slug]/page.tsx', 'app/newsletters/page.tsx',
  'app/articles/page.tsx', 'app/en/portfolio/page.tsx', 'app/en/projects/page.tsx',
  'components/BlogPageClient.tsx', 'components/EssayContents.tsx', 'components/ImageModal.tsx', 'components/PortfolioClient.tsx', 'components/ProjectMediaCarousel.tsx',
  'components/ProjectsPageClient.tsx', 'components/ShareButtons.tsx', 'components/TechnologyGroups.tsx', 'components/contact-form.tsx',
];
const ATTRS = new Set(['alt', 'title', 'placeholder', 'aria-label']);
const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", laquo: '«', raquo: '»', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', eacute: 'é', egrave: 'è', agrave: 'à', ecirc: 'ê', ccedil: 'ç' };
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e] ?? m));
const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 6).join('-') || 'texte';
// règle de React pour les JsxText : lignes rognées, lignes vides ignorées, jointes par une espace
function cleanJsxText(raw) {
  const lines = raw.split(/\r\n|\n|\r/); let last = 0; lines.forEach((l, i) => { if (/[^ \t]/.test(l)) last = i; });
  let out = '';
  lines.forEach((l, i) => { let x = l.replace(/\t/g, ' '); if (i !== 0) x = x.replace(/^ +/, ''); if (i !== lines.length - 1) x = x.replace(/ +$/, ''); if (x) { if (i !== last) x += ' '; out += x; } });
  return out;
}
const dict = fs.existsSync(path.join(ROOT, 'content/site/strings.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site/strings.json'), 'utf8')) : {};
let totalStrings = 0;
for (const rel of FILES) {
  const file = path.join(SRC_ROOT, rel); let src = fs.readFileSync(file, 'utf8');
  if (src.includes('getT("') || src.includes('useT("')) { console.log('· déjà migré :', rel); continue; }
  const isClient = /^\s*['"]use client['"]/.test(src);
  const base = path.basename(rel, '.tsx');
  const ns = rel.startsWith('components/') ? 'component.' + base : 'page.' + rel.replace(/^app\//, '').replace(/\/page\.tsx$/, '').replace(/\[|\]/g, '').replace(/\//g, '-');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const tName = /\bt\b/.test(src.replace(/\b(t)\s*:/g, '')) && sf.getText().match(/\b(const|let|var|function)\s+t\b|[(,]\s*t\s*[,)=:]/) ? 'tr' : 't';
  const used = dict[ns] || (dict[ns] = {}); const byText = new Map(Object.entries(used).map(([k, v]) => [v, k]));
  const key = text => { if (byText.has(text)) return byText.get(text); let k = slug(text), i = 2; while (k in used) k = slug(text) + '-' + i++; used[k] = text; byText.set(text, k); return k; };
  const edits = []; const fns = new Set();
  const topFn = n => { for (let p = n; p; p = p.parent) { if (p.parent && ts.isSourceFile(p.parent)) return p; } return null; };
  const mark = n => { const f = topFn(n); if (!f) throw new Error('hors fonction : ' + rel); fns.add(f); };
  const visit = n => {
    if (ts.isJsxText(n)) {
      const cleaned = decode(cleanJsxText(n.text)); const core = cleaned.trim();
      if (/\p{L}/u.test(core)) {
        const k = key(core); mark(n);
        edits.push({ s: n.pos, e: n.getEnd(), text: (/^\s/.test(cleaned) ? '{" "}' : '') + `{${tName}("${k}")}` + (/\s$/.test(cleaned) ? '{" "}' : '') });
      }
      return;
    }
    if (ts.isJsxAttribute(n) && n.initializer && ts.isStringLiteral(n.initializer) && ATTRS.has(n.name.text)) {
      const v = decode(n.initializer.text); if (/\p{L}/u.test(v)) { const k = key(v); mark(n); edits.push({ s: n.initializer.getStart(), e: n.initializer.getEnd(), text: `{${tName}("${k}")}` }); }
      return;
    }
    if (ts.isStringLiteral(n) && n.parent && !ts.isJsxAttribute(n.parent) && (ts.isJsxExpression(n.parent) || (ts.isConditionalExpression(n.parent) && n.parent.parent && ts.isJsxExpression(n.parent.parent)))
        && /\p{L}{3}/u.test(n.text) && !/^[\w./:#-]+$/.test(n.text)) { const k = key(n.text); mark(n); edits.push({ s: n.getStart(), e: n.getEnd(), text: `${tName}("${k}")` }); return; }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  // export const metadata = { title: "…", description: "…" }
  let metaEdit = null;
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st) && st.declarationList.declarations[0]?.name.getText() === 'metadata' && st.declarationList.declarations[0].initializer && ts.isObjectLiteralExpression(st.declarationList.declarations[0].initializer)) {
      const props = st.declarationList.declarations[0].initializer.properties;
      if (props.every(p => ts.isPropertyAssignment(p) && ts.isStringLiteral(p.initializer))) {
        const body = props.map(p => `    ${p.name.getText()}: ${tName}("${key('' + p.initializer.text).toString()}"),`).join('\n');
        metaEdit = { s: st.getStart(), e: st.getEnd(), text: `export async function generateMetadata() {\n  const ${tName} = await getT("${ns}")\n  return {\n${body}\n  }\n}` };
      }
    }
  }
  if (metaEdit) edits.push(metaEdit);
  if (!edits.length) { console.log('· rien :', rel); continue; }
  // t dans chaque composant concerné
  for (const f of fns) {
    let body = f.body ?? (ts.isVariableStatement(f) ? f.declarationList.declarations[0].initializer?.body : null);
    const fn = ts.isVariableStatement(f) ? f.declarationList.declarations[0].initializer : f;
    body = fn.body; if (!body || !ts.isBlock(body)) throw new Error('corps non bloc : ' + rel + ' ' + (fn.name?.getText?.() ?? ''));
    edits.push({ s: body.getStart() + 1, e: body.getStart() + 1, text: isClient ? `\n  const ${tName} = useT("${ns}")` : `\n  const ${tName} = await getT("${ns}")` });
    if (!isClient && !(fn.modifiers || []).some(m => m.kind === ts.SyntaxKind.AsyncKeyword)) {
      const head = src.slice(fn.getStart(), body.getStart()); const m = /\bfunction\b/.exec(head) ?? { index: 0 }; const at = ts.isFunctionDeclaration(fn) ? fn.getStart() + m.index : fn.getStart();
      if (ts.isArrowFunction(fn)) edits.push({ s: fn.getStart(), e: fn.getStart(), text: 'async ' }); else edits.push({ s: at, e: at, text: 'async ' });
    }
  }
  if (metaEdit && !fns.size && false) {}
  edits.sort((a, b) => b.s - a.s || b.e - a.e);
  let out = src; for (const e of edits) out = out.slice(0, e.s) + e.text + out.slice(e.e);
  // imports
  const imp = [];
  if (isClient && fns.size) imp.push('import { useT } from "@/components/strings-provider"');
  if (!isClient && (fns.size || metaEdit)) imp.push('import { getT } from "@/lib/strings"');
  const useClient = out.match(/^(\s*['"]use client['"];?\s*\n)/); const insertAt = useClient ? useClient[0].length : 0;
  out = out.slice(0, insertAt) + imp.join('\n') + '\n' + out.slice(insertAt);
  const n = Object.keys(used).length; totalStrings += n; console.log(String(edits.filter(e => e.text.includes(`${tName}("`)).length).padStart(4), 'textes', '→', ns.padEnd(34), rel);
  if (!DRY && !DICT_ONLY) fs.writeFileSync(file, out);
}
if (!DRY) { fs.writeFileSync(path.join(ROOT, 'content/site/strings.json'), JSON.stringify(dict, null, 2) + '\n'); console.log('✓ strings.json :', Object.values(dict).reduce((a, d) => a + Object.keys(d).length, 0), 'textes'); }
else console.log('(dry) espaces :', Object.keys(dict).length, 'textes :', Object.values(dict).reduce((a, d) => a + Object.keys(d).length, 0));
