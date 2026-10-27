#!/usr/bin/env node
/**
 * Adopte les dossiers importés (content/articles/<slug>, hors dossiers créés dans le studio) dans le modèle « blocs » : un seul éditeur d'écriture pour tous les articles.
 *   node scripts/adopt-dossiers.mjs --dry          vérifie chaque dossier et affiche ce qui serait converti (n'écrit rien)
 *   node scripts/adopt-dossiers.mjs [slug …]       convertit (tous les dossiers, ou ceux nommés)
 * Garde-fou : le rendu converti doit être IDENTIQUE au rendu d'origine (sections, sommaire) ; sinon le dossier est laissé tel quel.
 * Sauvegarde : _original/ (article.json, index.html, edits.json) dans le dossier de l'article ; retour arrière : --restore <slug>.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyEdits, parseReportData } from '../lib/articles/edits.mjs';
import { adopt, verify } from '../lib/articles/adopt.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), CONTENT = path.join(ROOT, 'content/articles');
const args = process.argv.slice(2), dry = args.includes('--dry'), restore = args.includes('--restore'), only = args.filter(a => !a.startsWith('--'));
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const manifest = rd(path.join(ROOT, 'content/articles.json')).articles;

for (const a of manifest) {
  if (only.length && !only.includes(a.slug)) continue;
  const dir = path.join(CONTENT, a.slug), meta = fs.existsSync(path.join(dir, 'article.json')) ? rd(path.join(dir, 'article.json')) : null; if (!meta) continue;
  if (restore) { const o = path.join(dir, '_original'); if (!fs.existsSync(o)) { console.log('pas de sauvegarde :', a.slug); continue; } fs.copyFileSync(path.join(o, 'article.json'), path.join(dir, 'article.json')); fs.copyFileSync(path.join(o, 'index.html'), path.join(dir, 'build/index.html')); if (fs.existsSync(path.join(o, 'edits.json'))) fs.copyFileSync(path.join(o, 'edits.json'), path.join(dir, 'edits.json')); else fs.rmSync(path.join(dir, 'edits.json'), { force: true }); console.log('restauré :', a.slug); continue; }
  if (meta.createdInStudio || meta.adopted) { continue; }
  const idx = path.join(dir, 'build/index.html'); if (!fs.existsSync(idx)) continue;
  const edits = fs.existsSync(path.join(dir, 'edits.json')) ? rd(path.join(dir, 'edits.json')) : { pages: {} };
  const data = fs.existsSync(path.join(dir, 'build/data/report-data.js')) ? parseReportData(fs.readFileSync(path.join(dir, 'build/data/report-data.js'), 'utf8')) : { evidence: [] };
  const evMap = new Map([...(data.evidence || []), ...(edits.evidence || [])].map(e => [e.key, e]));
  const original = applyEdits(fs.readFileSync(idx, 'utf8'), (edits.pages || {})[''], { mode: 'public', evidence: evMap });
  const r = adopt(original);
  if (r.error) { console.log(`✗ ${a.slug} : ${r.error} — laissé tel quel`); continue; }
  const problems = verify(original, r.shell, r.sections, evMap);
  if (problems.length) { console.log(`✗ ${a.slug} : écarts de rendu (${problems.slice(0, 3).join(' ; ')}) — laissé tel quel`); continue; }
  console.log(`✓ ${a.slug} : ${r.sections.length} sections, ${r.stats.blocks} blocs dont ${r.stats.blocks - r.stats.raw} éditables et ${r.stats.raw} conservés en HTML d'origine — rendu identique`);
  if (dry) continue;
  const o = path.join(dir, '_original'); if (!fs.existsSync(o)) { fs.mkdirSync(o); fs.copyFileSync(path.join(dir, 'article.json'), path.join(o, 'article.json')); fs.copyFileSync(idx, path.join(o, 'index.html')); if (fs.existsSync(path.join(dir, 'edits.json'))) fs.copyFileSync(path.join(dir, 'edits.json'), path.join(o, 'edits.json')); }
  fs.writeFileSync(idx, r.shell);
  fs.writeFileSync(path.join(dir, 'edits.json'), JSON.stringify({ ...edits, pages: { ...(edits.pages || {}), '': { order: r.sections.map(s => s.id), hidden: [], added: r.sections } }, figures: edits.figures || {}, evidence: edits.evidence || [] }, null, 1) + '\n');
  fs.writeFileSync(path.join(dir, 'article.json'), JSON.stringify({ ...meta, createdInStudio: true, adopted: true }, null, 2) + '\n');
}
