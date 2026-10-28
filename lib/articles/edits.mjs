// Modifications d'un article ou d'un sous-article (texte, ordre, masquage, sections ajoutées) — fonctions pures.
// Elles s'appliquent PAR-DESSUS le HTML construit (article) ou généré (sous-article), identiquement dans la copie privée (mode « draft »,
// où les éléments éditables sont repérés pour l'éditeur) et dans le build public. Voir ARTICLES.md.
import { parse } from 'node-html-parser';
import { inlineHtml } from '../inline-md-core.mjs';

const OPTS = { comment: true, blockTextElements: { script: true, noscript: true, style: true, pre: true } };
const EDITABLE = 'h1,h2,h3,h4,p,li,blockquote,figcaption,td,th,dt,dd';
const BLOCKS = 'p,ul,ol,li,h1,h2,h3,h4,figure,div,table,blockquote,section,dl';
const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const ID_OK = /^[a-z0-9][a-z0-9-]{1,40}$/;
export const KINDS = ['text', 'image', 'quote', 'list'];
export const BLOCK_TYPES = ['lede', 'p', 'h3', 'ul', 'ol', 'quote', 'callout', 'table', 'image', 'figure', 'gloss', 'code', 'html', 'genfig', 'divider'];
export const FIG_ID = /^fig-[a-z0-9-]{1,50}$/;

const SVG_TAGS = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'lineargradient', 'radialgradient', 'stop', 'title', 'desc', 'clippath', 'marker', 'pattern', 'mask']);
const SVG_ATTR = new Set(['viewbox', 'xmlns', 'width', 'height', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-opacity', 'fill-opacity', 'opacity', 'transform', 'text-anchor', 'dominant-baseline', 'font-size', 'font-weight', 'font-family', 'font-style', 'letter-spacing', 'class', 'id', 'role', 'aria-label', 'aria-hidden', 'aria-labelledby', 'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'clip-path', 'marker-end', 'marker-start', 'markerwidth', 'markerheight', 'refx', 'refy', 'orient', 'patternunits', 'patterntransform', 'preserveaspectratio', 'dx', 'dy', 'textlength', 'mask', 'xml:space']);
/** SVG produit par Claude → SVG sûr : balises et attributs d'une liste blanche, aucune adresse externe (url(#…) seulement), aucun script ni gestionnaire d'évènement. Renvoie '' si inutilisable. */
export function cleanSvg(raw) {
  const src = String(raw || '').slice(0, 60000); const m = /<svg[\s>][\s\S]*<\/svg>/i.exec(src); if (!m) return '';
  const root = parse(m[0], OPTS).querySelector('svg'); if (!root) return '';
  const walk = n => {
    if (n.nodeType === 3) return esc(n.rawText.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, x => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[x])));
    if (n.nodeType !== 1) return '';
    const t = (n.rawTagName || '').toLowerCase(); if (!SVG_TAGS.has(t)) return t === 'style' || t === 'script' ? '' : n.childNodes.map(walk).join('');
    let attrs = ''; for (const [k0, v0] of Object.entries(n.attributes || {})) { const k = k0.toLowerCase(), v = String(v0); if (!SVG_ATTR.has(k) || k.startsWith('on')) continue;
      if (/javascript:|data:|expression\(|@import/i.test(v)) continue; if (/url\(/i.test(v) && !/^url\(#[A-Za-z0-9_-]+\)$/.test(v.trim())) continue; attrs += ' ' + k + '="' + esc(v) + '"'; }
    if (t === 'svg' && !/xmlns=/.test(attrs)) attrs += ' xmlns="http://www.w3.org/2000/svg"';
    return '<' + t + attrs + '>' + n.childNodes.map(walk).join('') + '</' + t + '>';
  };
  const out = walk(root); return out.length > 40 && out.length <= 60000 ? out : '';
}

/** Blocs d'une section écrite dans l'éditeur d'écriture → HTML identique à celui des dossiers du skill (lede, prose, callout, tbl, fig, gloss). */
export function blocksHtml(blocks, ev) {
  const title = k => { const e = ev && ev.get && ev.get(k); return e ? String(e.fact || '').slice(0, 400) : ''; };
  const il = t => inlineHtml(t, title);
  let out = '';
  for (const b of blocks || []) {
    const t = b.type;
    if (t === 'lede') out += '<p class="lede">' + il(b.text) + '</p>';
    else if (t === 'p') { if (String(b.text || '').trim()) out += '<p>' + il(b.text) + '</p>'; }
    else if (t === 'h3') out += '<h3>' + il(b.text) + '</h3>';
    else if (t === 'ul' || t === 'ol') out += '<' + t + ' class="prose">' + (b.items || []).map(x => '<li>' + il(x) + '</li>').join('') + '</' + t + '>';
    else if (t === 'quote') out += '<blockquote><p>' + il(b.text) + '</p></blockquote>' + (b.cite ? '<p class="small">' + il(b.cite) + '</p>' : '');
    else if (t === 'callout') { const v = b.variant === undefined ? 'keep' : String(b.variant); out += '<div class="callout' + (/^[a-z]{1,12}$/.test(v) ? ' ' + v : '') + '">' + (b.title ? '<h4>' + il(b.title) + '</h4>' : '') + '<p>' + il(b.text) + '</p></div>'; }
    else if (t === 'table') { const A = b.attrs || {}, at = k => (A[k] && /^[\w\s=":;.,%#()-]*$/.test(A[k]) ? A[k] : ''); const tbl = '<table' + (A.table === undefined ? ' class="tbl"' : at('table')) + '>' + (b.caption ? '<caption' + at('cap') + '>' + il(b.caption) + '</caption>' : '') + '<thead><tr>' + (b.head || []).map(c => '<th' + at('th') + '>' + il(c) + '</th>').join('') + '</tr></thead><tbody>' + (b.rows || []).map(r => '<tr>' + r.map(c => '<td>' + il(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>'; out += A.wrap === '' ? tbl : '<div' + (A.wrap === undefined ? ' class="tbl-wrap"' : at('wrap')) + '>' + tbl + '</div>'; }
    else if (t === 'image') { if (b.file) out += '<figure class="fig"><img src="annotation-images/' + esc(b.file) + '" alt="' + esc(b.caption || '') + '" loading="lazy" style="max-width:100%;height:auto"><figcaption>' + il(b.caption || '') + '</figcaption></figure>'; }
    else if (t === 'figure' && FIG_ID.test(String(b.fig))) out += '<figure class="fig" id="' + esc(b.fig) + '-wrap"' + (b.kicker ? '' : ' data-added-fig="1"') + '><div class="fig-head"><p class="fig-kicker">' + esc(b.kicker || 'Figure 0') + '</p><h3 class="fig-title">' + il(b.title || '') + '</h3></div><div class="vra-chart" data-fig="' + esc(b.fig) + '" role="group" aria-label="' + esc(b.ariaLabel != null ? b.ariaLabel : (b.title || '')) + '"></div>' + (b.reading ? '<figcaption><b>Lecture :</b> ' + il(b.reading) + '</figcaption>' : '') + '</figure>';
    else if (t === 'gloss') out += '<div class="gloss">' + (b.terms || []).map(g => '<details><summary>' + esc(g.term) + '</summary><div class="g-body">' + il(g.def) + '</div></details>').join('') + '</div>';
    else if (t === 'code') out += '<pre><code>' + esc(b.text) + '</code></pre>';
    else if (t === 'genfig') { const sv = cleanSvg(b.svg); if (sv) out += '<figure class="fig" data-added-fig="1" data-genfig="1"><div class="fig-head"><p class="fig-kicker">Figure 0</p><h3 class="fig-title">' + il(b.title || '') + '</h3></div><div class="vra-chart" style="overflow-x:auto">' + sv + '</div>' + (b.reading ? '<figcaption><b>Lecture :</b> ' + il(b.reading) + '</figcaption>' : '') + '</figure>'; }
    else if (t === 'html') out += String(b.html || ''); // HTML d'origine d'un dossier importé, conservé tel quel
    else if (t === 'divider') out += '<hr>';
  }
  return out;
}

export const hashOf = s => { let h = 2166136261; const t = String(s).replace(/\s+/g, ' ').trim(); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };

/** Nettoie un fragment HTML en ligne : balises sûres seulement (strong, em, a, code, br, sup, sub, pastille de source). */
export function cleanInline(html) {
  const root = parse('<div>' + String(html || '').slice(0, 40000) + '</div>', OPTS).firstChild;
  const walk = n => {
    if (n.nodeType === 3) return esc(n.rawText.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, m => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }[m])));
    if (n.nodeType !== 1) return '';
    const t = n.tagName.toLowerCase(), inner = n.childNodes.map(walk).join('');
    if (t === 'b' || t === 'strong') return '<strong>' + inner + '</strong>';
    if (t === 'i' || t === 'em') return '<em>' + inner + '</em>';
    if (t === 'code' || t === 'sup' || t === 'sub') return '<' + t + '>' + inner + '</' + t + '>';
    if (t === 'br') return '<br>';
    if (t === 'a') {
      const href = n.getAttribute('href') || '';
      if (/(^|\s)src(\s|$)/.test(n.getAttribute('class') || '') && /^#src-[A-Za-z0-9]{1,6}$/.test(href)) return '<a class="src" href="' + esc(href) + '" data-src="' + esc(href.slice(5)) + '"' + (n.getAttribute('title') ? ' title="' + esc(n.getAttribute('title')) + '"' : '') + '>' + inner + '</a>';
      if (/^(https?:\/\/|mailto:|#)/i.test(href)) return '<a href="' + esc(href) + '"' + (/^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + inner + '</a>';
      return inner;
    }
    return inner; // toute autre balise : on garde le texte
  };
  return root.childNodes.map(walk).join('').trim();
}

/** HTML d'une section ajoutée depuis le studio. */
export function addedSection(a, ev) {
  const id = a.id, title = esc(a.title || 'Nouvelle section');
  if (Array.isArray(a.blocks)) return '<section id="' + esc(id) + '" data-num="00" data-toc="' + esc(a.toc || a.title || 'Nouvelle section') + '"' + (a.marker ? ' data-marker="' + esc(a.marker) + '"' : '') + ' data-added="1" data-blocks="1"><p class="marker">00 · ' + esc(a.marker || a.toc || a.title || 'Nouvelle section') + '</p><h2>' + title + '</h2>' + blocksHtml(a.blocks, ev) + '</section>';
  let body = '';
  if (a.kind === 'image') body = (a.file ? '<figure class="fig"><img src="annotation-images/' + esc(a.file) + '" alt="' + esc(a.caption || '') + '" loading="lazy" style="max-width:100%;height:auto"><figcaption>' + esc(a.caption || 'Légende de l\'image') + '</figcaption></figure>' : '') + '<p>Texte qui accompagne l\'image.</p>';
  else if (a.kind === 'quote') body = '<blockquote><p>Une citation à mettre en avant.</p></blockquote><p>Source ou contexte.</p>';
  else if (a.kind === 'list') body = '<ul class="prose"><li>Premier point</li><li>Deuxième point</li><li>Troisième point</li></ul>';
  else body = '<p>Écrivez ici : cliquez sur ce texte pour le modifier.</p>';
  return '<section id="' + esc(id) + '" data-num="00" data-toc="' + title + '" data-added="1"><p class="marker">00 · ' + title + '</p><h2>' + title + '</h2>' + body + '</section>';
}

const group = el => { for (let p = el; p; p = p.parentNode) { const t = p.tagName && p.tagName.toLowerCase(); if (t === 'section' && p.getAttribute('id')) return p.getAttribute('id'); if (t === 'header') return 'cover'; if (t === 'footer') return 'foot'; } return null; };
const inBlocks = el => { for (let p = el.parentNode; p; p = p.parentNode) if (p.getAttribute && p.getAttribute('data-blocks')) return true; return false; }; // section écrite dans l'éditeur d'écriture : pas d'édition en place
const blocked = el => { for (let p = el.parentNode; p; p = p.parentNode) { const t = p.tagName && p.tagName.toLowerCase(); if (!t) continue; if (t === 'figure' || t === 'nav' || t === 'button' || t === 'script' || t === 'details' && false || p.getAttribute && p.getAttribute('data-no-edit') != null) return true; } return false; };

/**
 * @param html     page complète
 * @param page     { text, order, hidden, added } (ou vide)
 * @param opts     { mode: 'draft' | 'public' }
 */
export function applyEdits(html, page, opts = {}) {
  const draft = opts.mode === 'draft'; const pg = page || {};
  const structural = (pg.order && pg.order.length) || (pg.hidden && pg.hidden.length) || (pg.added && pg.added.length);
  if (!draft && !structural && !Object.keys(pg.text || {}).length) return html;
  const root = parse(html, OPTS); const main = root.querySelector('main');
  // sections ajoutées
  if (main && pg.added && pg.added.length) { const have = new Set(main.querySelectorAll('section').map(s => s.getAttribute('id'))); const add = pg.added.filter(a => ID_OK.test(a.id) && !have.has(a.id)).map(a => addedSection(a, opts.evidence)).join('\n'); if (add) main.insertAdjacentHTML('beforeend', add); }
  // texte : repérage des éléments éditables (avant toute modification de contenu)
  const counters = {};
  for (const el of root.querySelectorAll(EDITABLE)) {
    if (blocked(el) || el.querySelector(BLOCKS) || el.classList.contains('marker') || inBlocks(el)) continue;
    const g = group(el); if (!g) continue;
    const k = g + ':' + (counters[g] = (counters[g] || 0) + 1), h = hashOf(el.innerHTML), e = pg.text && pg.text[k];
    if (e && e.h === h && typeof e.html === 'string') el.set_content(cleanInline(e.html));
    if (draft) { el.setAttribute('data-ed', k); el.setAttribute('data-h', h); if (e && e.h === h) el.setAttribute('data-edited', '1'); else if (e) el.setAttribute('data-stale', '1'); }
  }
  // ordre et masquage
  if (main && structural) {
    const secs = main.childNodes.filter(n => n.nodeType === 1 && n.tagName.toLowerCase() === 'section');
    if (secs.length) {
      const idx = id => (pg.order || []).indexOf(id);
      const ordered = secs.map((s, i) => ({ s, i, o: idx(s.getAttribute('id')) })).sort((a, b) => (a.o < 0 ? 1e6 + a.i : a.o) - (b.o < 0 ? 1e6 + b.i : b.o)).map(x => x.s);
      const hidden = new Set(pg.hidden || []);
      let n = 0;
      for (const s of ordered) {
        const id = s.getAttribute('id'), hid = hidden.has(id);
        if (hid) { if (draft) { s.setAttribute('data-hidden', '1'); s.setAttribute('style', ((s.getAttribute('style') || '') + ';display:none').replace(/^;/, '')); } continue; }
        if (s.getAttribute('data-num')) { n++; const num = String(n).padStart(2, '0'); s.setAttribute('data-num', num); const m = s.querySelector('.marker'); if (m) m.set_content(num + ' · ' + esc(s.getAttribute('data-marker') || s.getAttribute('data-toc') || '')); }
      }
      const toc = root.querySelector('.vra-toc ol');
      if (toc) toc.set_content(ordered.filter(s => !hidden.has(s.getAttribute('id')) && s.getAttribute('data-num')).map(s => '<li><a href="#' + esc(s.getAttribute('id')) + '">' + s.getAttribute('data-num') + ' · ' + esc(s.getAttribute('data-toc') || '') + '</a></li>').join(''));
      const keep = ordered.filter(s => draft || !hidden.has(s.getAttribute('id')));
      const first = secs[0]; const before = []; const after = [];
      let seen = false; for (const n2 of main.childNodes) { if (secs.includes(n2)) { seen = true; continue; } (seen ? after : before).push(n2.toString()); }
      main.set_content(before.join('') + keep.map(s => s.toString()).join('\n') + after.join('')); void first;
    }
  }
  if (main && opts.registry && opts.registry.length) { // dossier créé dans le studio : registre des sources généré (lien « Voir dans le registre »)
    const ST = { actual: 'Réel', estimate: 'Estimation', forecast: 'Prévision', derived: 'Calculé', claim: 'Affirmation', gap: 'Lacune' };
    const n = main.querySelectorAll('section').filter(x => x.getAttribute('data-num') && !x.getAttribute('data-hidden')).length + 1, num = String(n).padStart(2, '0');
    const rows = opts.registry.map(e => '<tr id="src-' + esc(e.key) + '"><th scope="row">' + esc(e.key) + '</th><td>' + esc(e.fact) + (e.value ? ' <strong>' + esc(e.value) + (e.unit ? ' ' + esc(e.unit) : '') + '</strong>' : '') + '</td><td>' + (ST[e.state] || 'Affirmation') + '</td><td>' + (e.url && /^https?:/.test(e.url) ? '<a href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer">' + esc(e.sourceName || e.url) + '</a>' : esc(e.sourceName)) + '</td><td>' + esc([e.publicationDate, e.observationDate].filter(Boolean).join(' · ')) + '</td><td>' + esc([e.formula, e.limitations].filter(Boolean).join(' · ')) + '</td></tr>').join('');
    main.insertAdjacentHTML('beforeend', '<section id="registre" data-num="' + num + '" data-toc="Registre des sources" data-auto="1"><p class="marker">' + num + ' · Registre des sources</p><h2>Registre des sources</h2><p>Chaque clé du texte renvoie à une ligne de ce registre.</p><div class="tbl-wrap"><table class="register"><thead><tr><th scope="col">Clé</th><th scope="col">Fait et valeur</th><th scope="col">État</th><th scope="col">Source</th><th scope="col">Dates</th><th scope="col">Limites</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>');
    const tl = root.querySelector('.vra-toc ol'); if (tl) tl.insertAdjacentHTML('beforeend', '<li><a href="#registre">' + num + ' · Registre des sources</a></li>');
  }
  if (root.querySelector('[data-added-fig]')) { let n = 0; for (const k of root.querySelectorAll('.fig-kicker')) { n++; if (/^Figure\s+\d+/.test(k.text.trim())) k.set_content('Figure ' + n); } } // figures ajoutées : numérotation continue
  return root.toString();
}

/** Éditeur (mode draft seulement) : configuration + script. */
export function editorTags(slug, pageKey, created) {
  const cfg = 'window.VRA_EDIT=' + JSON.stringify({ slug, page: pageKey, created: !!created, api: '/api/studio/articles/' + slug }).replace(/</g, '\\u003c') + ';';
  return '<script>' + cfg + '</script><script src="/articles/' + slug + '/assets/edit.js"></script>';
}
export const withEditor = (html, slug, pageKey, created) => html.replace('</body>', editorTags(slug, pageKey, created) + '\n</body>');

/** Fichiers images utilisés par les sections ajoutées (copiés dans le build public). */
export function editImages(edits) { const s = new Set(); for (const p of Object.values((edits && edits.pages) || {})) for (const a of p.added || []) if (a.file) s.add(a.file); return s; }

/** Remplace des figures dans `data/report-data.js` (window.VRA_DATA = {...}) : `figures` = { <idFigure>: figure }. Identique en copie privée et en build public. */
export function applyFigureOverrides(js, figures, evidence) {
  if ((!figures || !Object.keys(figures).length) && (!evidence || !evidence.length)) return js;
  const i = js.indexOf('='); if (i < 0) return js;
  let data; try { data = JSON.parse(js.slice(i + 1).trim().replace(/;\s*$/, '')); } catch { return js; }
  data.figures = { ...(data.figures || {}), ...(figures || {}) };
  if (evidence && evidence.length) { const have = new Set((data.evidence || []).map(e => e.key)); data.evidence = [...(data.evidence || []), ...evidence.filter(e => !have.has(e.key))]; } // sources ajoutées depuis le studio
  return js.slice(0, i + 1) + ' ' + JSON.stringify(data) + ';\n';
}
export function parseReportData(js) { const i = js.indexOf('='); return JSON.parse(js.slice(i + 1).trim().replace(/;\s*$/, '')); }
