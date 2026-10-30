// Grammaire du texte en ligne partagée (essais, éditeur d'écriture, dossiers) : **gras**, *italique*, `code`, [texte](lien), {{K12}} (pastille de source), {{note: texte}} (note en marge des essais), « \ » échappe.
export const safeHref = u => /^(https?:\/\/|mailto:|\/|#)/i.test(String(u).trim()) ? String(u).trim() : '';
function findClose(s, from, tok) { for (let j = from; j < s.length; j++) { if (s[j] === '\\') { j++; continue; } if (s.startsWith(tok, j)) return j; } return -1; }
export function parseInline(s) {
  const out = []; let buf = '', i = 0;
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\' && i + 1 < s.length) { buf += s[i + 1]; i += 2; continue; }
    if (ch === '{' && s[i + 1] === '{') { const m = /^\{\{([KDV]\d{1,4}(?:-\d{1,3})?)\}\}/.exec(s.slice(i)); if (m) { flush(); out.push({ t: 'src', k: m[1] }); i += m[0].length; continue; } if (s.startsWith('{{note:', i)) { const j = findClose(s, i + 7, '}}'); if (j > i + 7) { const raw = s.slice(i + 7, j).trim(); flush(); out.push({ t: 'note', raw, c: parseInline(raw) }); i = j + 2; continue; } } }
    if (ch === '`') { const j = s.indexOf('`', i + 1); if (j > i + 1) { flush(); out.push({ t: 'code', v: s.slice(i + 1, j) }); i = j + 1; continue; } }
    if (ch === '*' && s[i + 1] === '*') { const j = findClose(s, i + 2, '**'); if (j > i + 2) { flush(); out.push({ t: 'b', c: parseInline(s.slice(i + 2, j)) }); i = j + 2; continue; } }
    if (ch === '*') { const j = findClose(s, i + 1, '*'); if (j > i + 1) { flush(); out.push({ t: 'i', c: parseInline(s.slice(i + 1, j)) }); i = j + 1; continue; } }
    if (ch === '[') { const m = /^\[((?:\\.|[^\]\\])+)\]\(([^)\s]+)\)/.exec(s.slice(i)); if (m) { const href = safeHref(m[2]); if (href) { flush(); out.push({ t: 'a', href, c: parseInline(m[1]) }); i += m[0].length; continue; } } }
    buf += ch; i++;
  }
  flush(); return out;
}
const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Markdown en ligne → HTML (dossiers) ; `title(k)` donne l'infobulle d'une pastille de source */
export function inlineHtml(md, title) {
  const h = n => n.map(x => x.t === 'text' ? esc(x.v) : x.t === 'b' ? '<strong>' + h(x.c) + '</strong>' : x.t === 'i' ? '<em>' + h(x.c) + '</em>' : x.t === 'code' ? '<code>' + esc(x.v) + '</code>'
    : x.t === 'note' ? '<span class="sn"><sup class="sn-num"></sup><span class="sn-body">' + h(x.c) + '</span></span>'
    : x.t === 'src' ? '<a class="src" href="#src-' + x.k + '" data-src="' + x.k + '"' + (title && title(x.k) ? ' title="' + esc(title(x.k)) + '"' : '') + '>' + x.k + '</a>'
    : '<a href="' + esc(x.href) + '"' + (/^https?:/i.test(x.href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + h(x.c) + '</a>').join('');
  return h(parseInline(String(md || '')));
}
