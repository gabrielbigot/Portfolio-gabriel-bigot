#!/usr/bin/env node
/**
 * Migration UNIQUE des essais (content/site/blog-posts.json) vers le format article (content/articles/<slug>/).
 *   node scripts/migrate-essays.mjs --dry   affiche ce qui serait créé, n'écrit rien
 *   node scripts/migrate-essays.mjs         crée les articles manquants (jamais d'écrasement) et les ajoute à content/articles.json
 * Non destructif : blog-posts.json n'est pas modifié ; les articles existants ne sont pas touchés ; relancer ne recrée rien.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { essayToArticle } from '../lib/articles/essay-convert.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), CONTENT = path.join(ROOT, 'content/articles'), MANIFEST = path.join(ROOT, 'content/articles.json');
const dry = process.argv.includes('--dry');
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site/blog-posts.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); let created = 0, skipped = 0;
for (const post of posts) {
  const dir = path.join(CONTENT, post.slug);
  if (fs.existsSync(dir) || manifest.articles.some(a => a.slug === post.slug)) { console.log('déjà présent, ignoré :', post.slug); skipped++; continue; }
  const r = essayToArticle(post);
  const secs = r.edits.pages[''].added;
  console.log(`${dry ? '[dry] ' : ''}${post.slug} → ${r.meta.status} · ${secs.length} sections (${secs.map(s => s.title.slice(0, 28)).join(' | ')}) · ${r.edits.figures && Object.keys(r.edits.figures).length} figure(s)`);
  if (dry) continue;
  fs.mkdirSync(path.join(dir, 'build/data'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'article.json'), JSON.stringify(r.meta, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'build/index.html'), r.html);
  fs.writeFileSync(path.join(dir, 'build/data/report-data.js'), r.data);
  fs.writeFileSync(path.join(dir, 'edits.json'), JSON.stringify(r.edits, null, 1) + '\n');
  fs.writeFileSync(path.join(dir, 'annotations.json'), JSON.stringify({ notes: [], pictures: [] }, null, 2) + '\n');
  const m = r.meta; manifest.articles.push({ slug: m.slug, title: m.title, subtitle: m.subtitle, summary: m.summary, tags: m.tags, series: m.series, published: m.published, updated: m.updated, readingMinutes: m.readingMinutes, sourceCount: m.sourceCount, status: m.status });
  created++;
}
if (!dry && created) fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`${dry ? '[dry] ' : ''}${created} article(s) créé(s), ${skipped} ignoré(s).`);
