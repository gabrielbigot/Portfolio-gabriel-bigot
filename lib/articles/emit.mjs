// Génération des pages d'articles (HTML) — fonctions pures, sans accès disque : utilisées par le build public (scripts/articles-build.mjs)
// et par la copie privée du studio (route /api/studio/view). Les échanges avec l'IA ne sont JAMAIS publiés.
const escH = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// rendu Markdown minimal et sûr (même grammaire que annotate.js) pour les sous-articles
// - ## titres → sections numérotées (voir splitDoc) ; ### → h3 ; #### → h4 ; clés K/D/V → lien vers le registre du dossier
export function mdHtml(src, base = '') {
  const lines = escH(src).split('\n'); let html = '', list = null;
  const inline = t => t.replace(/!\[([^\]]*)\]\(annotation-images\/([a-z0-9]{6,40}\.(?:png|jpe?g|webp|gif))\)/g, (_, a, f) => '</p><figure><img src="annotation-images/' + f + '" alt="' + a + '" loading="lazy">' + (a ? '<figcaption>' + a + '</figcaption>' : '') + '</figure><p>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/(^|[^\w>"/#-])([KDV]\d{1,3})\b/g, '$1<a class="src" href="' + base + '#src-$2" target="_blank" rel="noopener">$2</a>');
  const close = () => { if (list) { html += '</' + list + '>'; list = null; } };
  for (const ln of lines) {
    let m;
    if ((m = ln.match(/^\s*[-*•]\s+(.*)/))) { if (list !== 'ul') { close(); html += '<ul class="prose">'; list = 'ul'; } html += '<li>' + inline(m[1]) + '</li>'; }
    else if ((m = ln.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); html += '<ol class="prose">'; list = 'ol'; } html += '<li>' + inline(m[1]) + '</li>'; }
    else if ((m = ln.match(/^(#{1,6})\s+(.*)/))) { close(); const h = m[1].length <= 3 ? 'h3' : 'h4'; html += '<' + h + '>' + inline(m[2]) + '</' + h + '>'; }
    else if (!ln.trim()) close();
    else { close(); html += '<p>' + inline(ln) + '</p>'; }
  }
  close(); return html.replace(/<p><\/p>/g, '');
}
const slugify = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'section';
// # et ## du texte = titres de section (comme dans les dossiers) ; ce qui précède le premier = introduction
export function splitDoc(body, base) {
  const intro = [], secs = []; let cur = null;
  for (const ln of String(body || '').split('\n')) { const m = ln.match(/^(#{1,2})\s+(.*)/); if (m) { cur = { title: m[2].trim(), lines: [] }; secs.push(cur); } else (cur ? cur.lines : intro).push(ln); }
  return { intro: mdHtml(intro.join('\n'), base), sections: secs.map((x, i) => ({ id: 's' + (i + 1) + '-' + slugify(x.title), num: String(i + 1).padStart(2, '0'), title: x.title, html: mdHtml(x.lines.join('\n'), base) })) };
}
export function subPage(slug, article, n, ids, crumbs, mode) {
  const base = '/articles/' + slug + '/';
  const t = escH(n.sub.title || 'Approfondissement');
  const parentHref = ids.length > 1 ? base + 's/' + ids.slice(0, -1).join('/s/') : base + '#sub-' + n.id;
  const nav = '<nav class="vra-crumbs" aria-label="Fil d\'Ariane"><a href="' + base + '#sub-' + ids[0] + '">' + escH(article.title) + '</a>' + crumbs.map(c => ' › <a href="' + base + 's/' + c.path.join('/s/') + '">' + escH(c.title) + '</a>').join('') + '</nav>';
  const cfg = 'window.VRA_AI=' + JSON.stringify({ slug, base, mode, path: ids, studio: mode === 'draft' }).replace(/</g, '\\u003c') + ';';
  const doc = splitDoc(n.sub.body, '/articles/' + slug + '/');
  const words = String(n.sub.body || '').split(/\s+/).filter(Boolean).length, mins = Math.max(1, Math.round(words / 200));
  const when = (n.sub.updated ? new Date(n.sub.updated) : new Date()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const toc = doc.sections.length ? '<nav class="vra-toc" aria-label="Sommaire" data-open="false"><button type="button" class="vra-toc-toggle" data-toc-toggle aria-expanded="false">Sommaire</button><small>Sommaire</small><ol>' + doc.sections.map(x => '<li><a href="#' + x.id + '">' + x.num + ' · ' + escH(x.title) + '</a></li>').join('') + '</ol></nav>' : '';
  const main = (doc.intro ? '<section id="intro" class="vra-intro">' + doc.intro + '</section>' : '') + doc.sections.map(x => '<section id="' + x.id + '" data-num="' + x.num + '" data-toc="' + escH(x.title) + '"><p class="marker">' + x.num + ' · ' + escH(x.title) + '</p><h2>' + escH(x.title) + '</h2>' + x.html + '</section>').join('');
  return '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="' + base + '">' + (mode === 'draft' ? '<meta name="robots" content="noindex,nofollow">' : '')
    + '<title>' + t + ' — ' + escH(article.title) + '</title><meta name="description" content="' + escH(n.sub.summary || '') + '"><meta name="color-scheme" content="light dark">'
    + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap"><link rel="stylesheet" href="assets/article.css">' + BACK_CSS
    + '</head><body style="margin:0"><a class="pf-back" href="' + parentHref + '">← Revenir</a>' + (mode === 'draft' ? '<span class="pf-draft">Brouillon · studio</span>' : '')
    + '<article class="vra" data-autostart data-theme="light"><div class="vra-progress" aria-hidden="true"><i></i></div>'
    + '<header class="vra-cover">' + nav + '<p class="vra-kicker">Approfondissement · ' + escH(article.title) + '</p><h1>' + t + '</h1>' + (n.sub.summary ? '<p class="vra-dek">' + escH(n.sub.summary) + '</p>' : '')
    + '<p class="vra-byline"><span>Par <strong>' + escH(article.author || 'Gabriel Bigot') + '</strong></span><span>Mis à jour le ' + when + '</span><span>≈ ' + mins + ' min de lecture</span></p>'
    + '<p class="vra-sub-from">Cet approfondissement développe le passage « ' + escH(n.quote.replace(/\s+/g, ' ').slice(0, 200)) + ' » du dossier <a href="' + base + '#sub-' + ids[0] + '">' + escH(article.title) + '</a>.</p>'
    + '<div class="vra-toolbar"><button type="button" data-theme-toggle aria-pressed="false">Thème clair / sombre</button></div></header>'
    + '<div class="vra-shell' + (doc.sections.length ? '' : ' vra-solo') + '">' + toc + '<main class="vra-main" id="contenu">' + main + '</main></div>'
    + '<footer class="vra-foot"><p>« ' + t + ' » — approfondissement du dossier « ' + escH(article.title) + ' » de ' + escH(article.author || 'Gabriel Bigot') + ', mis à jour le ' + when + '. Les clés K, D et V renvoient au registre de sources du dossier. <a href="' + parentHref + '">Revenir</a>.</p></footer></article>'
    + '<script>if(/[?&]embed=1/.test(location.search))document.documentElement.classList.add("vra-embed");</script>'
    + '<script>' + cfg + '</script><script src="assets/article.js"></script><script src="assets/annotate.js"></script></body></html>';
}

const BACK_CSS = '<style>.pf-back{position:fixed;z-index:80;top:12px;left:12px;font:600 13px/1 ui-sans-serif,system-ui,sans-serif;color:#29292b;background:rgba(244,241,234,.92);border:1px solid #d5d0c5;border-radius:999px;padding:8px 13px;text-decoration:none;backdrop-filter:blur(6px)}.pf-back:hover{background:#fff}[data-vra-theme=dark] .pf-back{color:#f7f5ef;background:rgba(74,74,77,.92);border-color:#69696c}[data-vra-theme=dark] .pf-back:hover{background:#535356}.pf-draft{position:fixed;z-index:80;top:12px;left:50%;transform:translateX(-50%);font:700 11px/1 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:#b5532a;border-radius:999px;padding:7px 12px}@media (max-width:640px){.pf-draft{display:none}}.vra-publ{font:600 12px ui-sans-serif,system-ui,sans-serif;border:1px solid currentColor;border-radius:2px;padding:4px 8px;text-decoration:none;color:inherit}</style>';
const HASH_JS = '<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest(\'a[href^="#"]\');if(!a||e.defaultPrevented)return;var id=decodeURIComponent(a.getAttribute("href").slice(1));var el=id&&document.getElementById(id);if(!el)return;e.preventDefault();el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});history.replaceState(null,"","#"+id)});</script>';

export function transformIndex(html, slug, mode) {
  const base = '/articles/' + slug + '/';
  let h = html;
  const head = '<base href="' + base + '">' + (mode === 'draft' ? '<meta name="robots" content="noindex,nofollow">' : '') + BACK_CSS;
  h = h.replace('<head>', '<head>\n' + head);
  const cfg = 'window.VRA_AI={slug:' + JSON.stringify(slug) + ',base:' + JSON.stringify(base) + ',mode:' + JSON.stringify(mode) + ',studio:' + (mode === 'draft') + '};';
  if (/<script>window\.VRA_AI=\{[^}]*\};<\/script>/.test(h)) h = h.replace(/<script>window\.VRA_AI=\{[^}]*\};<\/script>/, '<script>' + cfg + '</script>');
  else h = h.replace('</body>', '<script>' + cfg + '</script>\n<script src="assets/annotate.js"></script>\n</body>');
  const bar = '<a class="pf-back" href="/articles">← Articles</a>' + (mode === 'draft' ? '<span class="pf-draft">Brouillon · studio</span>' : '');
  h = h.replace(/<body([^>]*)>/, (m) => m + '\n' + bar);
  h = h.replace('</body>', HASH_JS + '\n</body>');
  return h;
}


const IMG = /annotation-images\/([a-z0-9]{6,40}\.(?:png|jpe?g|webp|gif))/g

// Un sous-article est un document à part entière : il a ses propres notes, images et sous-articles (récursif).
export const pubPics = list => (list || []).filter(p => p.status === 'public' && (p.images || []).length).map(p => ({ id: p.id, quote: p.quote, prefix: p.prefix || '', suffix: p.suffix || '', images: p.images.map(i => ({ file: i.file, caption: i.caption || '' })) }));
export const pubNotes = list => (list || []).filter(n => n.status === 'public').map(n => ({
  id: n.id, quote: n.quote, prefix: n.prefix || '', suffix: n.suffix || '', mode: 'note', comment: n.comment || '',
  ...(n.sub ? { sub: { title: n.sub.title, summary: n.sub.summary || '', body: n.sub.body || '', notes: pubNotes(n.sub.notes), pictures: pubPics(n.sub.pictures) } } : {}),
  thread: [], // jamais d'échange avec l'IA dans la version publique
}));
export const publicTree = ann => ({ notes: pubNotes(ann.notes), pictures: pubPics(ann.pictures) });

/** Fichiers images référencés par des éléments publics (images attachées + images insérées dans les sous-articles). */
export function usedImages(tree) {
  const used = new Set();
  const collect = (ns, pics) => { (pics || []).forEach(p => p.images.forEach(i => used.add(i.file))); (ns || []).forEach(n => { if (n.sub) { for (const m of String(n.sub.body || '').matchAll(IMG)) used.add(m[1]); collect(n.sub.notes, n.sub.pictures); } }); };
  collect(tree.notes, tree.pictures); return used;
}

/** Pages des sous-articles à tous les niveaux : [{ ids, html }] (dossier s/<a>/s/<b>/). `mode` « draft » : tous ; « public » : sous-articles publics. */
export function subPages(slug, article, notes, mode) {
  const out = [];
  const walk = (list, ids, crumbs) => { for (const n of list || []) { if (!n.sub || !(mode === 'draft' || n.status === 'public')) continue;
    const here = [...ids, n.id]; out.push({ ids: here, html: subPage(slug, article, n, here, crumbs, mode) });
    walk(n.sub.notes, here, [...crumbs, { title: n.sub.title, path: here }]); } };
  walk(notes, [], []); return out;
}
