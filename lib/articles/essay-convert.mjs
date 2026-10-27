// Conversion d'un essai (blog-posts.json) vers le format article : sections numérotées (coupées aux titres), blocs, figures, sources.
// Sert à la migration unique des essais existants et à « Nouvel article avec Claude ». Aucune donnée n'est inventée ni perdue.
import { blankDossier } from './blank.mjs';

const num = t => { const m = /(\d+)/.exec(String(t || '')); return m ? +m[1] : 1; };
const slugId = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 's';

/** @param {any} post  essai { slug, title, excerpt, date, readingTime, category, published, content[] }  @param {{ images?: Map<string,string> }} [o] images : src d'origine → nom de fichier copié */
export function essayToArticle(post, o = {}) {
  const sections = [], figures = {}, evidence = []; let cur = null, n = 0, figN = 0;
  const open = (title, id) => { cur = { id: id || 'x-' + slugId(title) + '-' + (++n), kind: 'blocks', title: String(title || '').slice(0, 120), blocks: [] }; sections.push(cur); return cur; };
  const sec = () => cur || open('Introduction', 'x-intro');
  for (const c of post.content || []) {
    if (c.type === 'heading' && c.level !== 3 && !/^\d+[.)]\s/.test(c.text || '')) { open(c.text); continue; } // « 1. … » : sous-point de la section en cours
    const s = sec();
    if (c.type === 'heading') s.blocks.push({ type: 'h3', text: c.text || '' });
    else if (c.type === 'paragraph') s.blocks.push({ type: 'p', text: c.text || '' });
    else if (c.type === 'list') s.blocks.push({ type: c.ordered ? 'ol' : 'ul', items: c.items || [] });
    else if (c.type === 'quote') s.blocks.push({ type: 'quote', text: c.text || '', cite: '' });
    else if (c.type === 'code') s.blocks.push({ type: 'code', text: c.text || '' });
    else if (c.type === 'divider') s.blocks.push({ type: 'divider' });
    else if (c.type === 'image') { const f = o.images && o.images.get(c.src); if (f) s.blocks.push({ type: 'image', file: f, caption: c.caption || c.alt || '' }); }
    else if (c.type === 'figure' && c.figure) {
      const id = 'fig-' + slugId(c.title || 'figure') + '-' + (++figN); let fig = JSON.parse(JSON.stringify(c.figure));
      if (c.source) { const key = 'K' + (evidence.length + 1); evidence.push({ key, fact: String(c.source).slice(0, 1200), value: '', unit: '', sourceClass: '', sourceName: String(c.source).slice(0, 400), publicationDate: '', observationDate: '', url: (/https?:\/\/\S+/.exec(c.source) || [''])[0], formula: '', limitations: '', state: 'actual' }); fig = JSON.parse(JSON.stringify(fig).replace(/"S1"/g, '"' + key + '"')); }
      figures[id] = fig; s.blocks.push({ type: 'figure', fig: id, title: c.title || '', reading: c.reading || '' });
    }
  }
  for (const s of sections) if (!s.blocks.length) s.blocks.push({ type: 'p', text: '' });
  if (!sections.length) open('Introduction', 'x-intro').blocks.push({ type: 'p', text: '' });
  const date = /^\d{4}-\d{2}$/.test(post.date) ? post.date + '-01' : String(post.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const d = blankDossier({ slug: post.slug, title: post.title, subtitle: post.excerpt || '', date, tags: post.category ? [post.category] : [], series: 'Essais', summary: post.excerpt || '', readingMinutes: num(post.readingTime) });
  const meta = { ...d.meta, status: post.published ? 'public' : 'draft', sourceCount: evidence.length, migratedFromEssay: true };
  return { meta, html: d.html, data: d.data, edits: { pages: { '': { order: sections.map(s => s.id), hidden: [], added: sections } }, figures, evidence } };
}
