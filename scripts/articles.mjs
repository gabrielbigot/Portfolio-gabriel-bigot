#!/usr/bin/env node
/*
 * articles.mjs — articles du portfolio (dossiers sourcés, avec notes, images et sous-articles).
 *
 *   node scripts/articles.mjs import <slug> [--rebuild]   copie un article construit (articles-src/<slug>) dans content/articles/<slug>/
 *                                                         (article.json, build/…) et l'ajoute à content/articles.json en BROUILLON
 *   node scripts/articles.mjs list                        articles du dépôt : statut, notes, sous-articles
 *   node scripts/articles.mjs build-public                génère public/articles/ (articles « public » seulement) — lancé par `pnpm build`
 *
 * Où vit quoi :
 *   articles-src/<slug>/          sources et construction (hors dépôt) : build.mjs, données, python
 *   content/articles/<slug>/      article.json, build/ (HTML + assets), annotations.json (notes, images, sous-articles — éditées dans le studio)
 *   content/articles.json         liste des articles ; `status: "public"` = visible sur le site public (réglé depuis le studio)
 *   public/articles/              GÉNÉRÉ au build (ignoré par git) : article + ses notes publiques + sous-articles publics
 * Les échanges avec l'IA ne sont jamais publiés.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { applyEdits, editImages, applyFigureOverrides, parseReportData } from '../lib/articles/edits.mjs';
import { transformIndex, subPages, publicTree, usedImages } from '../lib/articles/emit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'articles-src'), CONTENT = path.join(ROOT, 'content', 'articles'), MANIFEST = path.join(ROOT, 'content', 'articles.json'), PUB = path.join(ROOT, 'public', 'articles');
const ENGINE = path.join(ROOT, 'lib', 'articles', 'annotate.js');
const COPY_DIRS = ['assets', 'vendor', 'lieflat', 'models'];
const rd = p => JSON.parse(fs.readFileSync(p, 'utf8')); const exists = p => fs.existsSync(p);
const manifest = () => exists(MANIFEST) ? rd(MANIFEST) : { articles: [] };
const saveManifest = m => fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + '\n');
const treeOf = slug => { const f = path.join(CONTENT, slug, 'annotations.json'); const d = exists(f) ? rd(f) : {}; return { notes: d.notes || [], pictures: d.pictures || [] }; };
const countSubs = ns => ns.reduce((a, n) => a + (n.sub ? 1 + countSubs(n.sub.notes || []) : 0), 0);
const countNotes = ns => ns.reduce((a, n) => a + 1 + (n.sub ? countNotes(n.sub.notes || []) : 0), 0);

const [cmd, slug, ...flags] = process.argv.slice(2);

if (cmd === 'import') {
  const src = path.join(SRC, slug || '');
  if (!slug || !exists(path.join(src, 'article.json'))) { console.error('Article introuvable dans articles-src : ' + slug); process.exit(1); }
  if (flags.includes('--rebuild')) { const r = spawnSync('node', ['build.mjs'], { cwd: src, encoding: 'utf8' }); if (r.status !== 0 || /"errors": \[\s*"/.test(r.stdout)) { console.error(r.stdout + r.stderr); process.exit(1); } }
  const dest = path.join(CONTENT, slug); const build = path.join(dest, 'build');
  fs.rmSync(build, { recursive: true, force: true }); fs.mkdirSync(build, { recursive: true });
  fs.copyFileSync(path.join(src, 'index.html'), path.join(build, 'index.html'));
  for (const d of COPY_DIRS) if (exists(path.join(src, d))) fs.cpSync(path.join(src, d), path.join(build, d), { recursive: true, filter: f => !/\.(map|DS_Store)$/.test(f) && !f.endsWith('assets/annotate.js') });
  if (exists(path.join(src, 'data/report-data.js'))) { fs.mkdirSync(path.join(build, 'data'), { recursive: true }); fs.copyFileSync(path.join(src, 'data/report-data.js'), path.join(build, 'data/report-data.js')); }
  const meta = rd(path.join(src, 'article.json')); fs.writeFileSync(path.join(dest, 'article.json'), JSON.stringify(meta, null, 2) + '\n');
  // notes, images et sous-articles : une seule fois (ensuite ils appartiennent au studio)
  if (!exists(path.join(dest, 'annotations.json'))) {
    if (exists(path.join(src, 'annotations.json'))) { const d = rd(path.join(src, 'annotations.json')); const noThread = ns => (ns || []).map(n => ({ ...n, thread: [], ...(n.sub ? { sub: { ...n.sub, notes: noThread(n.sub.notes) } } : {}) })); d.notes = noThread(d.notes); fs.writeFileSync(path.join(dest, 'annotations.json'), JSON.stringify({ slug, notes: d.notes || [], pictures: d.pictures || [] }, null, 1) + '\n'); }
    else fs.writeFileSync(path.join(dest, 'annotations.json'), JSON.stringify({ slug, notes: [], pictures: [] }, null, 1) + '\n');
    if (exists(path.join(src, 'annotation-images'))) fs.cpSync(path.join(src, 'annotation-images'), path.join(dest, 'annotation-images'), { recursive: true });
  }
  const m = manifest(); const prev = m.articles.find(a => a.slug === slug);
  const entry = { slug, title: meta.title, subtitle: meta.subtitle || '', summary: meta.summary || '', tags: meta.tags || [], series: meta.series || '', published: prev?.published || meta.published || new Date().toISOString().slice(0, 10), updated: new Date().toISOString().slice(0, 10), readingMinutes: meta.readingMinutes || null, sourceCount: meta.sourceCount || null, status: prev?.status || 'draft' };
  m.articles = [...m.articles.filter(a => a.slug !== slug), entry].sort((a, b) => String(b.published).localeCompare(String(a.published)));
  saveManifest(m);
  console.log(`importé : content/articles/${slug} (statut : ${entry.status}). Le statut « public » se règle depuis le studio ; publiez ensuite.`);
} else if (cmd === 'list') {
  for (const a of manifest().articles) { const t = treeOf(a.slug); console.log((a.status === 'public' ? 'PUBLIC   ' : 'brouillon ') + a.slug + '  — ' + a.title + `  [${countNotes(t.notes)} notes, ${countSubs(t.notes)} sous-articles, ${t.pictures.length} images]`); }
} else if (cmd === 'build-public') {
  // Génère public/articles/ pour les articles « public ». Copie privée du studio : rien n'est généré (les articles sont servis depuis le brouillon).
  fs.rmSync(PUB, { recursive: true, force: true });
  if (process.env.STUDIO_MODE === '1') { console.log('studio : public/articles/ non généré'); process.exit(0); }
  const list = manifest().articles.filter(a => a.status === 'public'); const engine = fs.readFileSync(ENGINE);
  for (const a of list) {
    const root = path.join(CONTENT, a.slug), build = path.join(root, 'build'), dest = path.join(PUB, a.slug);
    if (!exists(path.join(build, 'index.html'))) { console.error('article sans construction : ' + a.slug); process.exit(1); }
    fs.mkdirSync(dest, { recursive: true });
    const am = rd(path.join(root, 'article.json')), created = am.createdInStudio, adopted = am.adopted, tpl = path.join(CONTENT, '_template/build'); // dossier créé dans le studio : moteur partagé
    for (const d of [...COPY_DIRS, 'data']) { const from = exists(path.join(build, d)) ? path.join(build, d) : created && exists(path.join(tpl, d)) ? path.join(tpl, d) : null; if (from) fs.cpSync(from, path.join(dest, d), { recursive: true }); }
    fs.mkdirSync(path.join(dest, 'assets'), { recursive: true }); fs.writeFileSync(path.join(dest, 'assets/annotate.js'), engine);
    const eds = exists(path.join(root, 'edits.json')) ? rd(path.join(root, 'edits.json')) : { pages: {} };
    const evid = new Map(); if (exists(path.join(dest, 'data/report-data.js'))) { try { for (const e of parseReportData(fs.readFileSync(path.join(dest, 'data/report-data.js'), 'utf8')).evidence || []) evid.set(e.key, e); } catch {} } for (const e of eds.evidence || []) evid.set(e.key, e);
    if (((eds.figures && Object.keys(eds.figures).length) || (eds.evidence && eds.evidence.length)) && exists(path.join(dest, 'data/report-data.js'))) fs.writeFileSync(path.join(dest, 'data/report-data.js'), applyFigureOverrides(fs.readFileSync(path.join(dest, 'data/report-data.js'), 'utf8'), eds.figures, eds.evidence));
    fs.writeFileSync(path.join(dest, 'index.html'), applyEdits(transformIndex(fs.readFileSync(path.join(build, 'index.html'), 'utf8'), a.slug, 'public'), eds.pages[''], { mode: 'public', evidence: evid, registry: created && !adopted ? eds.evidence : undefined }));
    const meta = rd(path.join(root, 'article.json')); const ann = treeOf(a.slug); const tree = publicTree(ann);
    fs.writeFileSync(path.join(dest, 'annotations.public.json'), JSON.stringify({ slug: a.slug, ...tree }));
    for (const p of subPages(a.slug, meta, ann.notes, 'public')) { const dir = path.join(dest, 's', ...p.ids.flatMap(i => [i, 's']).slice(0, -1)); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'index.html'), applyEdits(p.html, eds.pages[p.ids.join('/')], { mode: 'public' })); }
    const imgSrc = path.join(root, 'annotation-images'); const used = usedImages(tree); for (const f of editImages(eds)) used.add(f);
    if (exists(imgSrc) && used.size) { fs.mkdirSync(path.join(dest, 'annotation-images'), { recursive: true }); for (const f of fs.readdirSync(imgSrc)) if (used.has(f)) fs.copyFileSync(path.join(imgSrc, f), path.join(dest, 'annotation-images', f)); }
    console.log('public/articles/' + a.slug + ' (' + tree.notes.length + ' note(s) publique(s))');
  }
  if (!list.length) console.log('aucun article public');
} else { console.log('Commandes : import <slug> [--rebuild] | list | build-public'); }
