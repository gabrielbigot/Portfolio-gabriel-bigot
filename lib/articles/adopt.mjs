// Adoption d'un dossier importé par le modèle « blocs » (éditeur d'écriture unique).
// Principe : chaque élément du HTML d'origine devient un bloc éditable SEULEMENT si le bloc, re-rendu, redonne exactement le même HTML ;
// sinon l'élément est conservé tel quel dans un bloc « html » (explications interactives, registre, tableaux complexes…). Rien n'est réécrit, rien n'est perdu.
import { parse } from 'node-html-parser';
import { blocksHtml, applyEdits } from './edits.mjs';

const OPTS = { comment: true, blockTextElements: { script: true, noscript: true, style: true, pre: true } };
const escMd = t => t.replace(/[\\*`\[\]{]/g, '\\$&');
const dec = t => t.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' }[e]));
class Unsupported extends Error {}

/** HTML en ligne → Markdown du modèle (gras, italique, code, lien, pastille de source) ; autre balise → Unsupported (le bloc restera en HTML) */
export function inlineMd(node) {
  const walk = n => {
    if (n.nodeType === 3) return escMd(dec(n.rawText));
    if (n.nodeType !== 1) { if (n.nodeType === 8) throw new Unsupported(); return ''; }
    const t = n.tagName.toLowerCase(), inner = () => n.childNodes.map(walk).join('');
    if (t === 'strong' || t === 'b') { const i = inner(); if (!i) throw new Unsupported(); return '**' + i + '**'; }
    if (t === 'em' || t === 'i') { const i = inner(); if (!i) throw new Unsupported(); return '*' + i + '*'; }
    if (t === 'code') { const x = dec(n.text); if (x.includes('`') || !x) throw new Unsupported(); return '`' + x + '`'; }
    if (t === 'a') {
      const href = n.getAttribute('href') || '';
      if (/(^|\s)src(\s|$)/.test(n.getAttribute('class') || '') && /^#src-([KDV]\d{1,4}(?:-\d{1,3})?)$/.test(href)) return '{{' + href.slice(5) + '}}';
      if (/^(https?:\/\/|mailto:|#|\/)/i.test(href) && !/\s/.test(href)) return '[' + inner() + '](' + href + ')';
    }
    throw new Unsupported();
  };
  return node.childNodes.map(walk).join('');
}

const canon = h => parse('<div>' + h + '</div>', OPTS).toString().replace(/\s+title="[^"]*"/g, '').replace(/&#39;|&apos;/g, "'").replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
const attrsOf = el => Object.keys(el.attributes || {});

function candidate(el) {
  const t = el.tagName.toLowerCase(), cls = (el.getAttribute('class') || '').trim(), at = attrsOf(el);
  const only = (...ok) => at.every(a => ok.includes(a));
  if (t === 'p' && only('class') && (cls === '' || cls === 'lede')) return [{ type: cls === 'lede' ? 'lede' : 'p', text: inlineMd(el) }];
  if (t === 'p' && at.length === 0) return [{ type: 'p', text: inlineMd(el) }];
  if (t === 'h3' && at.length === 0) return [{ type: 'h3', text: inlineMd(el) }];
  if ((t === 'ul' || t === 'ol') && only('class') && cls === 'prose') { const items = el.childNodes.filter(n => n.nodeType === 1); if (items.some(n => n.tagName.toLowerCase() !== 'li' || attrsOf(n).length)) return null; return [{ type: t, items: items.map(inlineMd) }]; }
  if (t === 'blockquote' && at.length === 0) { const ps = el.childNodes.filter(n => n.nodeType === 1); if (ps.length === 1 && ps[0].tagName.toLowerCase() === 'p') return [{ type: 'quote', text: inlineMd(ps[0]), cite: '' }]; return null; }
  if (t === 'div' && only('class') && /^callout( [a-z]{1,12})?$/.test(cls)) {
    const ch = el.childNodes.filter(n => n.nodeType === 1); let title = '', i = 0;
    if (ch[0] && ch[0].tagName.toLowerCase() === 'h4' && !attrsOf(ch[0]).length) { title = inlineMd(ch[0]); i = 1; }
    if (ch.length - i !== 1 || ch[i].tagName.toLowerCase() !== 'p' || attrsOf(ch[i]).length) return null;
    return [{ type: 'callout', variant: cls.split(' ')[1] || '', title, text: inlineMd(ch[i]) }];
  }
  if (t === 'hr' && at.length === 0) return [{ type: 'divider' }];
  if (t === 'figure' && el.querySelector('.vra-chart[data-fig]') && !cls.includes('explain')) {
    const chart = el.querySelector('.vra-chart[data-fig]'), fig = chart.getAttribute('data-fig'), k = el.querySelector('.fig-kicker'), ti = el.querySelector('.fig-title'), cap = el.querySelector('figcaption');
    if (!k || !ti || !fig) return null;
    const b = { type: 'figure', fig, kicker: dec(k.text), title: inlineMd(ti), ariaLabel: dec(chart.getAttribute('aria-label') || ''), reading: '' };
    if (cap) { const h = cap.innerHTML, pm = /^<b>Lecture(?:\s|&nbsp;|\u00a0|\u202f)*:<\/b>(?:\s|&nbsp;|\u00a0)*/.exec(h); if (!pm) return null; const tmp = parse('<div>' + h.slice(pm[0].length) + '</div>', OPTS).firstChild; b.reading = inlineMd(tmp); }
    return [b];
  }
  if (t === 'table' || (t === 'div' && /^tbl-wrap\b/.test(cls))) {
    const wrapped = t === 'div', tb = wrapped ? el.querySelector('table') : el; if (!tb || (wrapped && el.childNodes.filter(n => n.nodeType === 1).length !== 1)) return null;
    if (attrsOf(tb).some(a => a !== 'class')) return null;
    const cap = tb.querySelector('caption'), th = tb.querySelectorAll('thead th'), trs = tb.querySelectorAll('tbody tr');
    if (!th.length || th.some(c => attrsOf(c).some(a => a !== 'scope')) || trs.some(r => attrsOf(r).length || r.childNodes.filter(n => n.nodeType === 1).some(c => c.tagName.toLowerCase() !== 'td' || attrsOf(c).length))) return null;
    const attr = n => Object.entries(n.attributes || {}).map(([k, v]) => ` ${k}="${v}"`).join('');
    const attrs = { wrap: wrapped ? attr(el) : '', table: attr(tb), cap: cap ? attr(cap) : '', th: th[0] ? attr(th[0]) : '' };
    if (attrs.wrap === ' class="tbl-wrap"') delete attrs.wrap; if (attrs.table === ' class="tbl"') delete attrs.table;
    return [{ type: 'table', caption: cap ? inlineMd(cap) : '', head: th.map(inlineMd), rows: trs.map(r => r.childNodes.filter(n => n.nodeType === 1).map(inlineMd)), ...(Object.keys(attrs).length ? { attrs } : {}) }];
  }
  if (t === 'div' && only('class') && cls === 'gloss') {
    const ds = el.childNodes.filter(n => n.nodeType === 1); if (!ds.length || ds.some(d => d.tagName.toLowerCase() !== 'details' || attrsOf(d).length)) return null;
    const terms = ds.map(d => { const ch = d.childNodes.filter(n => n.nodeType === 1), sm = ch[0], gb = ch[1]; if (ch.length !== 2 || sm.tagName.toLowerCase() !== 'summary' || attrsOf(sm).length || gb.tagName.toLowerCase() !== 'div' || gb.getAttribute('class') !== 'g-body' || sm.innerHTML !== sm.text) throw new Unsupported(); return { term: dec(sm.text), def: inlineMd(gb) }; });
    return [{ type: 'gloss', terms }];
  }
  return null;
}

const ev = new Map();
export function convertElement(el) {
  let blocks = null; try { blocks = candidate(el); } catch (e) { if (!(e instanceof Unsupported)) throw e; }
  if (blocks) { try { if (canon(blocksHtml(blocks, ev)) === canon(el.outerHTML)) return { blocks, raw: false }; } catch { /* retombe en HTML */ } }
  return { blocks: [{ type: 'html', html: el.outerHTML }], raw: true };
}

/** @returns {{ shell: string, sections: any[], stats: any } | { error: string }} */
export function adopt(html) {
  const m = /(<main\b[^>]*>)([\s\S]*?)(<\/main>)/.exec(html); if (!m) return { error: 'pas de <main>' };
  if (html.indexOf('<main', m.index + 5) >= 0) return { error: 'plusieurs <main>' };
  const root = parse('<div>' + m[2] + '</div>', OPTS).firstChild, sections = [], stats = { blocks: 0, raw: 0 };
  for (const n of root.childNodes) {
    if (n.nodeType === 3) { if (n.rawText.trim()) return { error: 'texte hors section dans <main>' }; continue; }
    if (n.nodeType === 8) continue;
    if (n.tagName.toLowerCase() !== 'section') return { error: 'élément hors section dans <main> : ' + n.tagName };
    const id = n.getAttribute('id'), num = n.getAttribute('data-num'), toc = n.getAttribute('data-toc');
    if (!id || !num || !toc || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(id)) return { error: 'section sans id/num/toc valides : ' + id };
    const kids = n.childNodes.filter(c => c.nodeType === 1), mk = kids[0], h2 = kids[1];
    if (!mk || mk.tagName.toLowerCase() !== 'p' || mk.getAttribute('class') !== 'marker' || !h2 || h2.tagName.toLowerCase() !== 'h2' || attrsOf(h2).length) return { error: 'en-tête de section inattendu : ' + id };
    const sp = x => dec(x).replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim(), mtxt = dec(mk.text);
    if (!sp(mtxt).startsWith(sp(num) + ' ·')) return { error: 'marqueur sans numéro : ' + id };
    const marker = mtxt.replace(/^\s*\S+\s*·\s*/, '');
    if (h2.innerHTML !== h2.text) return { error: 'titre h2 avec balises : ' + id };
    if (attrsOf(n).some(a => !['id', 'data-num', 'data-toc', 'data-added', 'data-blocks'].includes(a))) return { error: 'attributs de section inattendus : ' + id };
    const blocks = [];
    for (const c of kids.slice(2)) { const r = convertElement(c); stats.blocks += r.blocks.length; if (r.raw) stats.raw++; blocks.push(...r.blocks); }
    sections.push({ id, kind: 'blocks', title: dec(h2.text), ...(dec(toc) !== dec(h2.text) ? { toc: dec(toc) } : {}), ...(sp(marker) !== sp(toc) ? { marker } : {}), blocks: blocks.length ? blocks : [{ type: 'p', text: '' }] });
  }
  if (!sections.length) return { error: 'aucune section' };
  return { shell: html.slice(0, m.index) + m[1] + '\n\n' + m[3] + html.slice(m.index + m[0].length), sections, stats };
}

/** compare, section par section et pour le sommaire, le HTML d'origine (déjà passé par les éditions) et le rendu du modèle de blocs */
export function verify(originalHtml, shell, sections, evMap) {
  const orig = parse(originalHtml, OPTS), page = { order: sections.map(s => s.id), hidden: [], added: sections };
  const out = parse(applyEdits(shell, page, { mode: 'public', evidence: evMap }), OPTS), problems = [];
  const os = orig.querySelectorAll('main > section'), ns = out.querySelectorAll('main > section');
  if (os.length !== ns.length) problems.push(`nombre de sections ${os.length} → ${ns.length}`);
  os.forEach((o, i) => { const n = ns[i]; if (!n) return; const strip = h => canon(h);
    if (strip(o.innerHTML) !== strip(n.innerHTML)) problems.push('contenu différent : ' + o.getAttribute('id'));
    for (const a of ['id', 'data-num', 'data-toc']) if (o.getAttribute(a) !== n.getAttribute(a)) problems.push(`attribut ${a} : ${o.getAttribute('id')}`); });
  const ot = orig.querySelector('.vra-toc ol'), nt = out.querySelector('.vra-toc ol'); if (ot && nt && canon(ot.innerHTML) !== canon(nt.innerHTML)) problems.push('sommaire différent');
  return problems;
}
