/*
 * annotate.js — notes de l'auteur, images attachées à un passage et sous-articles (documents annotables à tous les niveaux).
 *
 * DEUX MODES, détectés automatiquement :
 *  - AUTEUR (copie privée du studio : window.VRA_AI.studio) : l'API /api/studio/articles/<slug>/… répond. On sélectionne un passage →
 *    « Annoter » (commentaire), « Image » (images au survol) ; une note longue peut devenir un sous-article. Tout est enregistré dans le
 *    BROUILLON (content/articles/<slug>/annotations.json). Rien n'est public avant « Publier » dans le studio.
 *  - LECTEUR (site public) : seules les notes publiques (annotations.public.json) s'affichent, en lecture seule.
 * Aucune dépendance. Les échanges avec l'IA ne font pas partie de ce moteur.
 */
(function () {
  'use strict';
  const root = document.querySelector('.vra'); if (!root) return;
  const main = root.querySelector('.vra-main'); if (!main) return;
  const CFG = window.VRA_AI || {};
  const slug = CFG.slug || document.title || location.pathname;
  const base = CFG.base || '';
  const STUDIO = !!CFG.studio; // copie privée du studio : l'API d'édition existe
  const API = '/api/studio/articles/' + encodeURIComponent(slug);
  const PATH = Array.isArray(CFG.path) ? CFG.path : []; // identifiants de notes jusqu'à ce document (vide = l'article lui-même)
  const EMBED = /[?&]embed=1/.test(location.search); // affiché dans le panneau d'un autre document
  const APIQ = API + '/annotations' + (PATH.length ? '?path=' + PATH.join('/') : '');
  if (EMBED) document.documentElement.classList.add('vra-embed');
  let author = false, published = false, notes = [], pics = [], dirty = false, subMeta = null, noteStatus = null;
  const MODES = {}; // (les actions d'assistant IA ont été retirées)
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- texte de l'article et ancrages ---------- */
  const SKIP = 'svg, script, style, .vra-card, .vra-margin, .vra-star, .vra-picmark, .vra-pop, .vra-subs, .vra-sub, .vra-ai-bar, .vra-ai-panel, .vra-chart, [aria-hidden="true"]';
  function textNodes() {
    const out = [], w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, { acceptNode(n) { return n.parentElement && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
    let off = 0, n; while ((n = w.nextNode())) { out.push({ node: n, start: off }); off += n.nodeValue.length; }
    return { list: out, total: off, text: out.map(o => o.node.nodeValue).join('') };
  }
  function offsetOf(list, node, offset) {
    for (const o of list) { if (o.node === node) return o.start + offset; }
    if (node.nodeType === 1) { const kid = node.childNodes[offset] || null; for (const o of list) { if (kid ? (kid === o.node || kid.contains(o.node) || (kid.compareDocumentPosition(o.node) & 4)) : (node.compareDocumentPosition(o.node) & 4)) return o.start; } return list.length ? list[list.length - 1].start + list[list.length - 1].node.nodeValue.length : 0; }
    return -1;
  }
  function articleText() {
    const clone = main.cloneNode(true);
    clone.querySelectorAll('script, style, svg, .vra-card, .vra-margin, .vra-star, .vra-picmark, .vra-pop, .vra-subs, .vra-sub, .vra-chart, .register, details.fig-data').forEach(e => e.remove());
    clone.querySelectorAll('mark.vra-note').forEach(m => m.replaceWith(...m.childNodes));
    const title = (root.querySelector('h1') || {}).textContent || document.title;
    const head = (root.querySelector('.vra-dek') || {}).textContent || '';
    const t = (title + '\n' + head + '\n\n' + clone.innerText).replace(/\n{3,}/g, '\n\n');
    return t.length > 170000 ? t.slice(0, 170000) : t;
  }
  function paragraphOf(range) {
    let el = range.commonAncestorContainer; el = el.nodeType === 1 ? el : el.parentElement;
    const p = el && el.closest('p, li, td, th, h2, h3, h4, figcaption, .callout, summary, .g-body');
    return p ? p.innerText.slice(0, 1800) : '';
  }

  /* ---------- notes : ancrage dans le texte ---------- */
  function wrapRange(start, end, id, kind) {
    kind = kind || 'note'; const { list } = textNodes(); const note = (kind === 'pic' ? pics : notes).find(n => n.id === id);
    for (const o of list) {
      const s = Math.max(start, o.start), e = Math.min(end, o.start + o.node.nodeValue.length);
      if (s >= e) continue;
      let node = o.node; const local = s - o.start, len = e - s;
      if (local > 0) node = node.splitText(local);
      if (len < node.nodeValue.length) node.splitText(len);
      const m = document.createElement('mark'); m.className = kind === 'pic' ? 'vra-pic' : 'vra-note'; m.dataset[kind === 'pic' ? 'pic' : 'note'] = id; if (kind !== 'pic') m.tabIndex = 0;
      m.dataset.status = note && note.status === 'public' ? 'public' : 'draft';
      node.parentNode.insertBefore(m, node); m.appendChild(node);
    }
  }
  function unwrap(id) { main.querySelectorAll('mark.vra-note[data-note="' + id + '"]').forEach(m => { const p = m.parentNode; m.replaceWith(...m.childNodes); p.normalize(); }); }
  function setMarkStatus(note) { main.querySelectorAll('mark.vra-note[data-note="' + note.id + '"]').forEach(m => { m.dataset.status = note.status === 'public' ? 'public' : 'draft'; }); }
  function anchor(note, kind) {
    const { text } = textNodes(); let i = -1;
    if (note.prefix || note.suffix) { i = text.indexOf((note.prefix || '') + note.quote + (note.suffix || '')); if (i >= 0) i += (note.prefix || '').length; }
    if (i < 0) i = text.indexOf(note.quote);
    if (i < 0) { note.lost = true; return false; }
    note.lost = false; wrapRange(i, i + note.quote.length, note.id, kind); return true;
  }
  function anchorAll() { notes.forEach(n => { if (!main.querySelector('mark.vra-note[data-note="' + n.id + '"]')) anchor(n); }); pics.forEach(p => { if (!picMarks(p.id).length) anchor(p, 'pic'); }); }

  /* ---------- mise en page : notes en marge (grand écran) ou insérées sous le paragraphe (écran étroit) ---------- */
  const layer = document.createElement('div'); layer.className = 'vra-margin'; layer.setAttribute('aria-label', 'Notes en marge'); main.appendChild(layer);
  let MODE = 'inline', colX = 0, colW = 0;
  function measure() {
    const mr = main.getBoundingClientRect(); const p = main.querySelector('section p') || main.querySelector('p');
    const textRight = p ? p.getBoundingClientRect().right : mr.right;
    const x = textRight + 30, avail = window.innerWidth - x - 16;
    const m = avail >= 230 && window.innerWidth >= 1100 ? 'margin' : 'inline';
    colX = x - mr.left; colW = Math.min(310, avail); const changed = m !== MODE; MODE = m; return changed;
  }
  function lastMark(id) { const all = main.querySelectorAll('mark.vra-note[data-note="' + id + '"]'); return all[all.length - 1] || null; }
  function firstMark(id) { return main.querySelector('mark.vra-note[data-note="' + id + '"]'); }
  function renumber() {
    main.querySelectorAll('.vra-star').forEach(e => e.remove());
    notes.map(n => ({ n, m: firstMark(n.id) })).filter(o => o.m).sort((a, b) => (a.m.compareDocumentPosition(b.m) & 4) ? -1 : 1).forEach((o, i) => {
      o.n._num = i + 1; const last = lastMark(o.n.id);
      const st = document.createElement('sup'); st.className = 'vra-star'; st.id = 'vra-n-' + o.n.id; st.dataset.note = o.n.id; st.tabIndex = 0; st.setAttribute('role', 'button'); st.setAttribute('aria-label', 'Note ' + (i + 1)); st.textContent = '*' + (i + 1);
      last.after(st);
    });
    renumberPics();
  }
  function teaserText(n) {
    const src = (n.comment && n.comment.trim()) || ((n.thread || []).find(m => m.role === 'assistant') || {}).text || '';
    return src.replace(/[*_`#>]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim().slice(0, 170);
  }
  function layoutTeasers() {
    layer.querySelectorAll('.vra-mnote').forEach(e => e.remove());
    if (MODE !== 'margin') return;
    const mr = main.getBoundingClientRect(); let last = -1e9;
    notes.map(n => ({ n, m: firstMark(n.id) })).filter(o => o.m).sort((a, b) => a.m.getBoundingClientRect().top - b.m.getBoundingClientRect().top).forEach(o => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'vra-mnote'; b.dataset.id = o.n.id; b.dataset.status = o.n.status === 'public' ? 'public' : 'draft';
      b.style.left = colX + 'px'; b.style.width = colW + 'px';
      b.innerHTML = o.n.sub ? '<span class="n">*' + (o.n._num || '') + '</span><span class="t"><b>' + esc(o.n.sub.title || 'Approfondissement') + '</b>' + (o.n.sub.summary ? ' — ' + esc(o.n.sub.summary) : '') + '</span><span class="im">Approfondissement ›</span>' : '<span class="n">*' + (o.n._num || '') + '</span><span class="t">' + esc(teaserText(o.n) || 'Note') + '</span>';
      layer.appendChild(b);
      const y = Math.max(o.m.getBoundingClientRect().top - mr.top - 2, last + 8); b.style.top = y + 'px'; last = y + b.offsetHeight;
    });
    syncTeasers();
  }
  function syncTeasers() { layer.querySelectorAll('.vra-mnote').forEach(b => b.classList.toggle('open', !!(cur && cur.note && cur.note.id === b.dataset.id && !card.hidden))); }
  function setHl(id, on) { main.querySelectorAll('mark.vra-note[data-note="' + id + '"]').forEach(m => m.classList.toggle('hl', on)); layer.querySelectorAll('.vra-mnote').forEach(b => { if (b.dataset.id === id) b.classList.toggle('on', on); }); }
  function openById(id) { const n = notes.find(x => x.id === id), m = lastMark(id); if (!n || !m) return; if (n.sub) { if (subOpen && subOpen.id === id) closeSub(); else openSub(n); return; } if (!card.hidden && cur && cur.note && cur.note.id === id) { closeCard(); return; } openNote(n, m.getBoundingClientRect(), m); }
  function relayout() { measure(); renumber(); layoutTeasers(); if (cur && !card.hidden) place(cur.rect); }
  let rlT = null; const relayoutSoon = () => { clearTimeout(rlT); rlT = setTimeout(relayout, 120); };

  /* ---------- enregistrement (mode auteur : fichier annotations.json via l'API locale) ---------- */
  let saveT = null, status = null;
  const pstrip = p => ({ id: p.id, quote: p.quote, prefix: p.prefix, suffix: p.suffix, status: p.status || 'draft', created: p.created, images: p.images || [] });
  const strip = n => ({ id: n.id, quote: n.quote, prefix: n.prefix, suffix: n.suffix, mode: n.mode, thread: n.thread, created: n.created, status: n.status || 'draft', comment: n.comment || '', includeThread: n.includeThread !== false });
  function setStatus(t) { if (status) status.textContent = t; }
  async function putNow() {
    try { const r = await fetch(APIQ, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: notes.map(strip), pictures: pics.map(pstrip) }) }); dirty = !r.ok; setStatus(r.ok ? 'Enregistré dans annotations.json' : 'Échec de l\'enregistrement'); if (r.ok) notifyParent(); return r.ok; }
    catch (e) { setStatus('Échec de l\'enregistrement'); return false; }
  }
  function save() { dirty = true; renderPanel(); renumber(); layoutTeasers(); buildSubList(); if (!author) return; setStatus('Enregistrement…'); clearTimeout(saveT); saveT = setTimeout(putNow, 450); }

  /* ---------- rendu Markdown minimal et sûr ---------- */
  function md(s, opts) {
    const sub = !!(opts && opts.sub); const lines = esc(s).split('\n'); let html = '', list = null;
    const img = t => !sub ? t : t.replace(/!\[([^\]]*)\]\(annotation-images\/([a-z0-9]{6,40}\.(?:png|jpe?g|webp|gif))\)/g, (_, a, f) => '</p><figure><img src="' + imgUrl(f) + '" alt="' + a + '" loading="lazy" data-zoom>' + (a ? '<figcaption>' + a + '</figcaption>' : '') + '</figure><p>');
    const inline = t => img(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/(^|[^\w>"/#-])([KDV]\d{1,3})\b/g, (_, a, k) => a + (sub ? '<a class="src" href="' + base + '#src-' + k + '" target="_blank" rel="noopener">' + k + '</a>' : '<span class="vra-key">' + k + '</span>')).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    const close = () => { if (list) { html += '</' + list + '>'; list = null; } };
    for (const ln of lines) {
      let m;
      if ((m = ln.match(/^\s*[-*•]\s+(.*)/))) { if (list !== 'ul') { close(); html += sub ? '<ul class="prose">' : '<ul>'; list = 'ul'; } html += '<li>' + inline(m[1]) + '</li>'; }
      else if ((m = ln.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); html += sub ? '<ol class="prose">' : '<ol>'; list = 'ol'; } html += '<li>' + inline(m[1]) + '</li>'; }
      else if ((m = ln.match(/^(#{1,4})\s+(.*)/))) { close(); const h = sub ? (m[1].length <= 3 ? 'h3' : 'h4') : 'h5'; html += '<' + h + '>' + inline(m[2]) + '</' + h + '>'; }
      else if (!ln.trim()) { close(); }
      else { close(); html += '<p>' + inline(ln) + '</p>'; }
    }
    close(); return sub ? html.replace(/<p><\/p>/g, '') : html;
  }

  /* ---------- fenêtre (marginalia) ---------- */
  const card = document.createElement('aside'); card.className = 'vra-card'; card.hidden = true; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Note');
  card.innerHTML = '<header><span class="vra-card-mode"></span><span class="vra-card-sp"></span><button type="button" data-act="pin" title="Épingler au passage">Épingler</button><button type="button" data-act="copy" title="Copier">Copier</button><button type="button" data-act="close" aria-label="Fermer">×</button></header><blockquote class="vra-card-q"></blockquote><div class="vra-card-body" aria-live="polite"></div>'
    + '<div class="vra-card-pub" hidden><div class="vra-pub-row"><span class="vra-badge"></span><button type="button" data-act="status"></button></div><label>Ma note pour les lecteurs<textarea rows="3" placeholder="Facultatif — votre commentaire, affiché sous le passage."></textarea></label><button type="button" class="vra-tosub" data-act="tosub" title="Transforme cette note en page d\'approfondissement (sous-article)">Transformer en sous-article</button></div>';
  root.appendChild(card);
  const $ = s => card.querySelector(s); let cur = null, hoverT = null, keep = false;
  function blockOf(el) {
    let b = el && el.closest ? el.closest('p, li, blockquote, h2, h3, h4, figcaption, .callout, summary, tr, dd') : null;
    if (b && b.closest('li')) b = b.closest('li').parentElement; else if (b && b.tagName === 'TR') b = b.closest('table');
    return b || main.firstElementChild;
  }
  function place() {
    card.classList.remove('mg'); card.style.left = card.style.top = card.style.width = '';
    const b = blockOf(cur && cur.anchorEl); if (b && b.nextSibling !== card) b.after(card);
  }
  function threadHtml(thread, opts) {
    return thread.map(m => m.role === 'user' ? '<p class="vra-you">' + esc(m.text) + '</p>' : (m.pending ? '<p class="vra-pending">Réflexion en cours…</p>' : m.error ? '<p class="vra-err">' + esc(m.text) + '</p>' : '<div class="vra-ans">' + md(m.text) + '</div>')).join('');
  }
  /* ---------- utilitaires images ---------- */
  const imgUrl = f => base + 'annotation-images/' + f;
  async function shrink(file) {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file;
    try {
      const bm = await createImageBitmap(file); const k = Math.min(1, 1600 / Math.max(bm.width, bm.height)); if (k === 1 && file.size < 900000) return file;
      const cv = document.createElement('canvas'); cv.width = Math.round(bm.width * k); cv.height = Math.round(bm.height * k); cv.getContext('2d').drawImage(bm, 0, 0, cv.width, cv.height);
      const blob = await new Promise(r => cv.toBlob(r, 'image/webp', .86)); return blob && blob.size < file.size ? new File([blob], 'image.webp', { type: 'image/webp' }) : file;
    } catch (e) { return file; }
  }
  function lightbox(src, cap) {
    const o = document.createElement('div'); o.className = 'vra-lightbox'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Image');
    o.innerHTML = '<figure><img src="' + esc(src) + '" alt="">' + (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') + '</figure><button type="button" aria-label="Fermer">×</button>';
    const close = () => { o.remove(); document.removeEventListener('keydown', key, true); }; const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    o.addEventListener('click', close); document.addEventListener('keydown', key, true); root.appendChild(o); o.querySelector('button').focus();
  }

  function render() {
    const n = cur.note; card.classList.toggle('ro', !author);
    $('.vra-card-mode').textContent = !author ? 'Note de l\'auteur' : n ? (n.status === 'public' ? 'Note publique' : 'Note · brouillon') : (MODES[cur.mode] ? MODES[cur.mode].label : 'Question');
    $('.vra-card-q').textContent = '« ' + (cur.text.length > 220 ? cur.text.slice(0, 220) + '…' : cur.text) + ' »';
    if (!author) {
      const ai = cur.thread.filter(m => m.text);
      $('.vra-card-body').innerHTML = (n && n.comment ? '<div class="vra-ans vra-comment">' + md(n.comment) + '</div>' : '') + (ai.length ? (n && n.comment ? '<details class="vra-more"><summary>Explication détaillée</summary>' + threadHtml(ai) + '</details>' : threadHtml(ai)) : '');
    } else $('.vra-card-body').innerHTML = threadHtml(cur.thread);
    card.querySelector('[data-act="pin"]').textContent = n ? 'Retirer' : 'Épingler';
    card.dataset.pinned = n ? '1' : '0';
    const pub = $('.vra-card-pub'); pub.hidden = !(author && n);
    if (author && n) {
      const isPub = n.status === 'public'; const b = pub.querySelector('.vra-badge'); b.textContent = isPub ? 'Publique' : 'Brouillon'; b.dataset.s = isPub ? 'public' : 'draft';
      pub.querySelector('[data-act="status"]').textContent = isPub ? 'Repasser en brouillon' : 'Rendre publique';
      const ta = pub.querySelector('textarea'); if (card.dataset.noteId !== n.id) { ta.value = n.comment || ''; card.dataset.noteId = n.id; }
    } else card.dataset.noteId = '';
  }
  function show(rect) { if (subOpen) closeSub(); if (!pcard.hidden) closePicEditor(); card.hidden = false; render(); place(rect); syncTeasers(); const r = card.getBoundingClientRect(); if (r.bottom > window.innerHeight || r.top < 0) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function closeCard() { keep = false; card.hidden = true; card.classList.remove('kept'); syncTeasers(); }
  // note sans IA : on écrit seulement un commentaire
  function createNote(s) {
    const n = { id: 'n' + Date.now().toString(36), quote: s.quote, prefix: s.prefix, suffix: s.suffix, mode: 'note', thread: [], created: new Date().toISOString(), status: 'draft', comment: '', includeThread: true };
    notes.push(n); anchor(n); save(); const m = lastMark(n.id) || s.el;
    cur = { anchorEl: m, mode: 'note', text: s.text, quote: s.quote, para: s.para, rect: s.rect, thread: [], note: n }; card.dataset.noteId = ''; show(s.rect);
    const ta = card.querySelector('textarea'); if (ta) ta.focus();
  }
  function openNote(n, rect, el) {
    cur = { anchorEl: el || lastMark(n.id), mode: n.mode, text: n.quote.replace(/\s+/g, ' ').trim(), quote: n.quote, para: '', rect, thread: (n.thread || []).map(m => ({ role: m.role, text: m.text })), note: n };
    show(rect);
  }
  card.addEventListener('click', e => {
    const b = e.target.closest('button[data-act]'); if (!b || !cur) return; const act = b.dataset.act;
    if (act === 'close') closeCard();
        if (act === 'copy') { const txt = cur.thread.filter(m => m.role === 'assistant' && !m.error).map(m => m.text).join('\n\n'); try { navigator.clipboard.writeText(txt); b.textContent = 'Copié'; setTimeout(render, 900); } catch (er) { /* ignore */ } }
    if (act === 'tosub' && cur.note) { const n = cur.note; b.disabled = true; toSub(n).then(ok => { b.disabled = false; if (ok) { closeCard(); openSub(n, true); } }); return; }
    if (act === 'status' && cur.note) { cur.note.status = cur.note.status === 'public' ? 'draft' : 'public'; setMarkStatus(cur.note); save(); render(); }
    if (act === 'pin' && author) {
      if (cur.note) { unwrap(cur.note.id); notes = notes.filter(n => n.id !== cur.note.id); cur.note = null; save(); render(); return; }
      const done = cur.thread.filter(m => !m.pending && !m.error); if (!done.some(m => m.role === 'assistant')) return;
      const n = { id: 'n' + Date.now().toString(36), quote: cur.quote, prefix: cur.prefix, suffix: cur.suffix, mode: cur.mode, thread: done.map(({ role, text }) => ({ role, text })), created: new Date().toISOString(), status: 'draft', comment: '', includeThread: true };
      notes.push(n); anchor(n); cur.note = n; save(); render(); keep = false; card.classList.remove('kept');
    }
  });
  card.querySelector('textarea').addEventListener('input', e => { if (cur && cur.note) { cur.note.comment = e.target.value; save(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !card.hidden) closeCard(); });

  /* ---------- astérisques, survol (aperçu en marge) et ouverture ---------- */
  main.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('mark.vra-note, .vra-star'); if (t) setHl(t.dataset.note, true); });
  main.addEventListener('mouseout', e => { const t = e.target.closest && e.target.closest('mark.vra-note, .vra-star'); if (t) setHl(t.dataset.note, false); });
  main.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.vra-star'); if (t) openById(t.dataset.note); });
  main.addEventListener('keydown', e => { const t = e.target.closest && e.target.closest('.vra-star'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openById(t.dataset.note); } });
  layer.addEventListener('mouseover', e => { const b = e.target.closest('.vra-mnote'); if (b) setHl(b.dataset.id, true); });
  layer.addEventListener('mouseout', e => { const b = e.target.closest('.vra-mnote'); if (b) setHl(b.dataset.id, false); });
  layer.addEventListener('click', e => { const b = e.target.closest('.vra-mnote'); if (b) openById(b.dataset.id); });


  /* ---------- images attachées à un passage (distinctes des notes) ----------
     Survol du passage (ou de son repère ▣) → l'image s'affiche juste au-dessus. Auteur : clic sur ▣ = éditeur. */
  const picById = id => pics.find(p => p.id === id);
  function picMarks(id) { return main.querySelectorAll('mark.vra-pic[data-pic="' + id + '"]'); }
  function renumberPics() {
    main.querySelectorAll('.vra-picmark').forEach(e => e.remove());
    pics.forEach(p => { const all = picMarks(p.id); const last = all[all.length - 1]; if (!last) return; const n = (p.images || []).length;
      const st = document.createElement('sup'); st.className = 'vra-picmark'; st.dataset.pic = p.id; st.tabIndex = 0; st.setAttribute('role', 'button'); st.setAttribute('aria-label', 'Image' + (n > 1 ? 's' : '') + ' liée' + (n > 1 ? 's' : '') + ' à ce passage');
      st.dataset.status = p.status === 'public' ? 'public' : 'draft'; st.textContent = '▣' + (n > 1 ? n : ''); last.after(st); });
  }
  const pop = document.createElement('div'); pop.className = 'vra-pop'; pop.hidden = true; root.appendChild(pop);
  let popPic = null, popT = null, popSticky = false;
  let popEl = null;
  function placePop() {
    const el = popEl && popEl.isConnected ? popEl : (popPic && picMarks(popPic.id)[0]); if (!el) return;
    const rs = el.getClientRects(); const r = rs.length ? rs[0] : el.getBoundingClientRect(); const w = pop.offsetWidth, h = pop.offsetHeight;
    const cx = r.left + r.width / 2; const x = Math.max(8, Math.min(window.innerWidth - w - 8, cx - w / 2));
    let y = r.top - h - 10, below = false; if (y < 8) { y = r.bottom + 10; below = true; }
    pop.style.left = x + 'px'; pop.style.top = y + 'px'; pop.style.setProperty('--cx', Math.max(12, Math.min(w - 12, cx - x)) + 'px'); pop.classList.toggle('below', below);
  }
  function showPop(p, stick, el) {
    if (!p || !(p.images || []).length) return; clearTimeout(popT); popPic = p; popSticky = !!stick; popEl = el || null;
    pop.innerHTML = '<div class="vra-pop-row">' + p.images.map(i => '<figure><img src="' + esc(imgUrl(i.file)) + '" alt="' + esc(i.caption || '') + '" data-zoom>' + (i.caption ? '<figcaption>' + esc(i.caption) + '</figcaption>' : '') + '</figure>').join('') + '</div>';
    pop.hidden = false; placePop(); pop.querySelectorAll('img').forEach(im => im.addEventListener('load', placePop));
    picMarks(p.id).forEach(m => m.classList.add('hl'));
  }
  function hidePop() { pop.hidden = true; popSticky = false; popPic = null; main.querySelectorAll('mark.vra-pic.hl').forEach(m => m.classList.remove('hl')); }
  const popLater = () => { clearTimeout(popT); popT = setTimeout(() => { if (!popSticky && !pop.matches(':hover')) hidePop(); }, 260); };
  const picTarget = e => e.target.closest && e.target.closest('mark.vra-pic, .vra-picmark');
  main.addEventListener('mouseover', e => { const t = picTarget(e); if (!t) return; clearTimeout(popT); popT = setTimeout(() => showPop(picById(t.dataset.pic), false, t), 120); });
  main.addEventListener('mouseout', e => { if (picTarget(e)) popLater(); });
  pop.addEventListener('mouseenter', () => clearTimeout(popT)); pop.addEventListener('mouseleave', popLater);
  pop.addEventListener('click', e => { const z = e.target.closest('img[data-zoom]'); if (z) lightbox(z.src, z.alt); });
  main.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.vra-picmark'); if (!t) return; if (author) { openPicEditor(t.dataset.pic); return; } if (popPic && popPic.id === t.dataset.pic && popSticky) hidePop(); else showPop(picById(t.dataset.pic), true, t); });
  main.addEventListener('keydown', e => { const t = e.target.closest && e.target.closest('.vra-picmark'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.click(); } });
  document.addEventListener('click', e => { if (popSticky && !pop.contains(e.target) && !(e.target.closest && e.target.closest('.vra-picmark'))) hidePop(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) { if (popSticky) placePop(); else hidePop(); } }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) hidePop(); });

  // éditeur (auteur) : images, légendes, statut, suppression
  const pcard = document.createElement('aside'); pcard.className = 'vra-card vra-pcard'; pcard.hidden = true; pcard.setAttribute('role', 'dialog'); pcard.setAttribute('aria-label', 'Images du passage');
  pcard.innerHTML = '<header><span class="vra-card-mode">Image · brouillon</span><span class="vra-card-sp"></span><button type="button" data-p="del" title="Supprimer ces images">Supprimer</button><button type="button" data-p="close" aria-label="Fermer">×</button></header><blockquote class="vra-card-q"></blockquote><div class="vra-card-pub"><p class="vra-pc-help">Au survol de ce passage, les images s\'affichent juste au-dessus.</p><div class="vra-imgs-ed"></div><label class="vra-addimg">+ Ajouter des images<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden></label><span class="vra-imghint">ou collez (⌘V) / glissez des images ici. Indiquez la source dans la légende.</span><div class="vra-pub-row" style="margin-top:.6rem"><span class="vra-badge"></span><button type="button" data-p="status"></button></div></div>';
  root.appendChild(pcard);
  let curPic = null;
  const pq = s => pcard.querySelector(s);
  function renderPicEd() {
    const p = curPic; if (!p) return; const isPub = p.status === 'public';
    pq('.vra-card-mode').textContent = isPub ? 'Image · publique' : 'Image · brouillon'; pq('.vra-card-q').textContent = '« ' + (p.quote.length > 200 ? p.quote.slice(0, 200).replace(/\s+/g, ' ') + '…' : p.quote.replace(/\s+/g, ' ')) + ' »';
    pq('.vra-imgs-ed').innerHTML = (p.images || []).map((i, k) => '<figure><img src="' + esc(imgUrl(i.file)) + '" alt=""><button type="button" data-rm="' + k + '" aria-label="Retirer l\'image" title="Retirer">×</button><input type="text" value="' + esc(i.caption || '') + '" placeholder="Légende / source" maxlength="400" data-cap="' + k + '"></figure>').join('');
    const b = pq('.vra-badge'); b.textContent = isPub ? 'Publique' : 'Brouillon'; b.dataset.s = isPub ? 'public' : 'draft'; pq('[data-p="status"]').textContent = isPub ? 'Repasser en brouillon' : 'Rendre publique';
  }
  function placePic() { const all = curPic && picMarks(curPic.id); const m = all && all[all.length - 1]; const b = blockOf(m); if (b && b.nextSibling !== pcard) b.after(pcard); }
  function openPicEditor(id) { const p = picById(id); if (!p) return; closeCard(); if (curPic && curPic.id !== id) closePicEditor(); curPic = p; pcard.hidden = false; renderPicEd(); placePic(); const r = pcard.getBoundingClientRect(); if (r.bottom > window.innerHeight || r.top < 0) pcard.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function dropPic(p) { (p.images || []).forEach(im => fetch(API + '/images?file=' + encodeURIComponent(im.file), { method: 'DELETE' }).catch(() => {})); main.querySelectorAll('mark.vra-pic[data-pic="' + p.id + '"]').forEach(m => { const par = m.parentNode; m.replaceWith(...m.childNodes); par.normalize(); }); pics = pics.filter(x => x.id !== p.id); }
  function closePicEditor() { const p = curPic; pcard.hidden = true; curPic = null; if (p && !(p.images || []).length) dropPic(p); save(); hidePop(); }
  async function addPicImages(files) {
    const p = curPic; if (!author || !p) return; const list = [...files].filter(f => /^image\//.test(f.type)); if (!list.length) return; setStatus('Envoi de ' + list.length + ' image(s)…');
    for (const f of list) {
      if ((p.images || []).length >= 8) break;
      try { const fd = new FormData(); fd.append('file', await shrink(f)); const r = await fetch(API + '/images', { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) { setStatus(j.error || 'Image refusée.'); continue; } (p.images = p.images || []).push({ file: j.file, caption: '' }); }
      catch (e) { setStatus('Échec de l\'envoi.'); }
    }
    save(); renderPicEd();
  }
  pcard.addEventListener('click', e => {
    const b = e.target.closest('button[data-p]'), rm = e.target.closest('[data-rm]'); const p = curPic; if (!p) return;
    if (rm) { const im = p.images.splice(+rm.dataset.rm, 1)[0]; if (im) fetch(API + '/images?file=' + encodeURIComponent(im.file), { method: 'DELETE' }).catch(() => {}); save(); renderPicEd(); return; }
    if (b && b.dataset.p === 'close') closePicEditor();
    if (b && b.dataset.p === 'del') { if (!p.images.length || window.confirm('Supprimer ces images et leur repère ?')) { dropPic(p); curPic = null; pcard.hidden = true; save(); hidePop(); } }
    if (b && b.dataset.p === 'status') { p.status = p.status === 'public' ? 'draft' : 'public'; save(); renderPicEd(); }
    const z = e.target.closest('.vra-imgs-ed img'); if (z) lightbox(z.src, '');
  });
  pcard.addEventListener('input', e => { const c = e.target.closest('[data-cap]'); if (c && curPic && curPic.images[+c.dataset.cap]) { curPic.images[+c.dataset.cap].caption = c.value; save(); } });
  pcard.querySelector('.vra-addimg input').addEventListener('change', e => { addPicImages(e.target.files); e.target.value = ''; });
  pcard.addEventListener('paste', e => { const fs = [...(e.clipboardData ? e.clipboardData.files : [])].filter(f => /^image\//.test(f.type)); if (fs.length) { e.preventDefault(); addPicImages(fs); } });
  pcard.addEventListener('dragover', e => { if ([...(e.dataTransfer.types || [])].includes('Files')) { e.preventDefault(); pcard.classList.add('drop'); } });
  pcard.addEventListener('dragleave', () => pcard.classList.remove('drop'));
  pcard.addEventListener('drop', e => { pcard.classList.remove('drop'); if (e.dataTransfer.files.length) { e.preventDefault(); addPicImages(e.dataTransfer.files); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pcard.hidden && pop.hidden && !document.querySelector('.vra-lightbox')) closePicEditor(); });
  function createPicture(s) {
    closeCard(); const p = { id: 'p' + Date.now().toString(36), quote: s.quote, prefix: s.prefix, suffix: s.suffix, status: 'draft', created: new Date().toISOString(), images: [] };
    pics.push(p); anchor(p, 'pic'); save(); openPicEditor(p.id); pcard.querySelector('.vra-addimg input').click();
  }


  /* ---------- sous-articles : chaque approfondissement est un DOCUMENT à part entière (notes, images, sous-articles…) ----------
     Article → astérisque → panneau (la page du sous-article en cadre) ; la page du sous-article embarque le même moteur : on y annote
     et on y crée d'autres sous-articles, à n'importe quel niveau. */
  const subUrl = n => base + 's/' + [...PATH, n.id].join('/s/');
  const notifyParent = () => { try { if (window.parent !== window) window.parent.postMessage({ vra: 'changed' }, location.origin); } catch (e) { /* ignore */ } };
  async function subApi(ids, noteId, action, data) {
    try { const r = await fetch(API + '/subs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: ids, noteId, action, data }) }); return r.ok; } catch (e) { return false; }
  }
  function plain(t) { return String(t || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/[*_`#>]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim(); }
  async function toSub(n) {
    const th = (n.thread || []).filter(m => m.text); const firstAns = (th.find(m => m.role === 'assistant') || {}).text || '';
    const parts = []; if (n.comment && n.comment.trim()) parts.push(n.comment.trim());
    th.forEach(m => { if (m.role === 'assistant') parts.push(m.text.trim()); else parts.push('## ' + m.text.trim()); });
    const q = plain(n.quote); const sentence = plain(firstAns).split(/(?<=[.!?])\s/)[0] || '';
    const data = { title: 'À propos de : ' + q.split(' ').slice(0, 9).join(' ') + (q.split(' ').length > 9 ? '…' : ''), summary: sentence.slice(0, 220), body: parts.join('\n\n') };
    await putNow(); // la note doit exister côté serveur avant d'y rattacher un sous-article
    if (!(await subApi(PATH, n.id, 'create', data))) { setStatus('Échec de la création du sous-article.'); return false; }
    n.sub = data; renumber(); layoutTeasers(); buildSubList(); return true;
  }
  const subEl = document.createElement('aside'); subEl.className = 'vra-sub'; subEl.hidden = true; subEl.setAttribute('role', 'dialog'); subEl.setAttribute('aria-label', 'Approfondissement');
  root.appendChild(subEl);
  let subOpen = null;
  function openSub(n, edit) {
    if (PATH.length || EMBED) { location.href = subUrl(n) + (EMBED ? '?embed=1' + (edit ? '&edit=1' : '') : (edit ? '?edit=1' : '')); return; } // dans un sous-article : on descend d'un niveau
    if (!pcard.hidden) closePicEditor(); closeCard(); hidePop(); subOpen = n; subEl.hidden = false;
    subEl.innerHTML = '<header><button type="button" data-s="close" aria-label="Fermer">←&nbsp;Fermer</button><span class="vra-card-sp"></span><a href="' + esc(subUrl(n)) + '" target="_blank" rel="noopener">Ouvrir en page&nbsp;↗</a></header><iframe class="vra-sub-frame" title="' + esc(n.sub.title) + '" src="' + esc(subUrl(n)) + '?embed=1' + (edit ? '&edit=1' : '') + '"></iframe>';
    requestAnimationFrame(() => subEl.classList.add('open')); history.replaceState(null, '', location.pathname + location.search + '#sub-' + n.id);
    layer.querySelectorAll('.vra-mnote').forEach(b => b.classList.toggle('open', b.dataset.id === n.id));
  }
  function closeSub() { subEl.classList.remove('open'); const n = subOpen; subOpen = null; setTimeout(() => { if (!subOpen) { subEl.hidden = true; subEl.innerHTML = ''; } }, 230); layer.querySelectorAll('.vra-mnote.open').forEach(b => b.classList.remove('open')); if (n && /^#sub-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); }
  subEl.addEventListener('click', e => { if (e.target.closest('button[data-s="close"]')) closeSub(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && subOpen && !document.querySelector('.vra-lightbox') && !(e.target.closest && e.target.closest('input, textarea'))) closeSub(); });
  window.addEventListener('message', e => { if (e.origin === location.origin && e.data && e.data.vra === 'changed') reloadFromServer(); });
  window.addEventListener('focus', () => reloadFromServer());
  async function reloadFromServer() {
    if (!author || dirty || document.querySelector('.vra-sub-editor:not([hidden])')) return;
    try {
      const r = await fetch(APIQ, { cache: 'no-store' }); if (!r.ok) return; const d = await r.json();
      main.querySelectorAll('mark.vra-note, mark.vra-pic').forEach(m => { const p = m.parentNode; m.replaceWith(...m.childNodes); p.normalize(); });
      notes = d.notes || []; pics = d.pictures || []; anchorAll(); renderPanel(); relayout(); buildSubList();
      if (subOpen && !notes.some(n => n.id === subOpen.id && n.sub)) closeSub();
    } catch (e) { /* hors ligne */ }
  }

  // section « Approfondissements » en bas du document
  let subList = null;
  function buildSubList() {
    const items = notes.filter(n => n.sub && (author || n.status === 'public'));
    if (subList) subList.remove(); subList = null; if (!items.length) return;
    subList = document.createElement('section'); subList.className = 'vra-subs'; subList.setAttribute('aria-label', 'Approfondissements');
    subList.innerHTML = '<h2>Approfondissements</h2><ul>' + items.map(n => '<li><a href="' + esc(subUrl(n)) + '" data-sub="' + n.id + '"><b>' + esc(n.sub.title) + '</b>' + (author ? ' <span class="vra-badge" data-s="' + (n.status === 'public' ? 'public' : 'draft') + '">' + (n.status === 'public' ? 'Public' : 'Brouillon') + '</span>' : '') + (n.sub.summary ? '<span>' + esc(n.sub.summary) + '</span>' : '') + '</a></li>').join('') + '</ul>';
    main.appendChild(subList);
  }
  main.addEventListener('click', e => { const a = e.target.closest && e.target.closest('.vra-subs a[data-sub]'); if (!a) return; e.preventDefault(); const n = notes.find(x => x.id === a.dataset.sub); if (n) openSub(n); });

  // page d'un sous-article, côté auteur : barre (statut, modifier, supprimer) et éditeur titre / résumé / texte
  // la page d'un sous-article est régénérée côté serveur à chaque enregistrement (sommaire, durée de lecture…) : on la recharge après édition
  function buildSubBar(startEditing) {
    const cover = root.querySelector('.vra-cover'), shell = root.querySelector('.vra-shell'); if (!cover || !shell || !subMeta) return;
    const parentIds = PATH.slice(0, -1), noteId = PATH[PATH.length - 1]; let editing = false, prev = false, tmr = null;
    const bar = document.createElement('div'); bar.className = 'vra-subbar'; cover.after(bar);
    const ed = document.createElement('div'); ed.className = 'vra-sub-editor'; ed.hidden = true; bar.after(ed);
    const flush = async () => { clearTimeout(tmr); tmr = null; await subApi(parentIds, noteId, 'update', { title: subMeta.title, summary: subMeta.summary, body: subMeta.body }); setStatus('Enregistré'); notifyParent(); };
    const pushSub = () => { clearTimeout(tmr); tmr = setTimeout(flush, 600); };
    function drawBar() {
      bar.innerHTML = '<span class="vra-badge" data-s="' + (noteStatus === 'public' ? 'public' : 'draft') + '">' + (noteStatus === 'public' ? 'Public' : 'Brouillon') + '</span><button type="button" data-b="status">' + (noteStatus === 'public' ? 'Repasser en brouillon' : 'Rendre public') + '</button><button type="button" data-b="edit">' + (editing ? 'Terminer' : 'Modifier le texte') + '</button><span class="vra-card-sp"></span><button type="button" class="vra-danger" data-b="delete">Supprimer</button>';
    }
    function drawEditor() {
      ed.hidden = !editing; shell.hidden = editing;
      if (!editing) { ed.innerHTML = ''; return; }
      ed.innerHTML = '<label>Titre<input type="text" data-f="title" maxlength="200" value="' + esc(subMeta.title) + '"></label><label>Résumé (affiché au survol de l\'astérisque)<input type="text" data-f="summary" maxlength="300" value="' + esc(subMeta.summary || '') + '"></label>'
        + '<label>Texte <small>Markdown : **gras**, listes, ## titres, [lien](https://…)</small><textarea data-f="body" rows="18">' + esc(subMeta.body) + '</textarea></label>'
        + '<div class="vra-sub-tools"><label class="vra-addimg">+ Insérer une image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label><button type="button" data-b="prev">' + (prev ? 'Masquer l\'aperçu' : 'Aperçu') + '</button></div>' + (prev ? '<div class="vra-sub-body vra-sub-preview">' + md(subMeta.body, { sub: true }) + '</div>' : '');
    }
    async function finishEdit() { await flush(); location.reload(); }
    bar.addEventListener('click', async e => {
      const b = e.target.closest('button[data-b]'); if (!b) return;
      if (b.dataset.b === 'status') { const to = noteStatus === 'public' ? 'draft' : 'public'; if (await subApi(parentIds, noteId, 'status', { status: to })) { noteStatus = to; drawBar(); notifyParent(); } }
      if (b.dataset.b === 'edit') { if (editing) finishEdit(); else { editing = true; drawEditor(); drawBar(); } }
      if (b.dataset.b === 'delete' && window.confirm('Supprimer ce sous-article, ses notes et ses sous-articles ? La note d\'origine est conservée.')) { if (await subApi(parentIds, noteId, 'delete')) { notifyParent(); if (PATH.length > 1) location.href = base + 's/' + parentIds.join('/s/') + (EMBED ? '?embed=1' : ''); else if (EMBED) { shell.innerHTML = '<p class="vra-sub-from">Sous-article supprimé. Vous pouvez fermer ce panneau.</p>'; shell.hidden = false; } else location.href = base; } }
    });
    ed.addEventListener('input', e => { const f = e.target.closest('[data-f]'); if (!f) return; subMeta[f.dataset.f] = f.value; pushSub(); });
    ed.addEventListener('click', e => { const b = e.target.closest('button[data-b="prev"]'); if (b) { prev = !prev; const keep = ed.querySelector('textarea') ? ed.querySelector('textarea').scrollTop : 0; drawEditor(); } });
    ed.addEventListener('change', async e => {
      const inp = e.target.closest('.vra-addimg input'); if (!inp || !inp.files.length) return; const ta = ed.querySelector('textarea[data-f="body"]'); const files = [...inp.files]; inp.value = ''; setStatus('Envoi…');
      for (const f of files) { try { const fd = new FormData(); fd.append('file', await shrink(f)); const r = await fetch(API + '/images', { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) { setStatus(j.error || 'Image refusée.'); continue; }
        const at = ta.selectionStart || ta.value.length; ta.value = ta.value.slice(0, at) + '\n\n![Légende](annotation-images/' + j.file + ')\n\n' + ta.value.slice(at); subMeta.body = ta.value; pushSub(); } catch (er) { setStatus('Échec de l\'envoi.'); } }
    });
    drawBar(); if (startEditing) { editing = true; drawEditor(); drawBar(); }
  }

  /* ---------- panneau ---------- */
  let panel = null, list = null;
  function buildPanel() {
    panel = document.createElement('div'); panel.className = 'vra-ai-panel';
    panel.innerHTML = '<button type="button" class="vra-ai-toggle" aria-expanded="false">' + (author ? 'Notes' : 'Notes de l\'auteur') + ' <span class="n">0</span></button><div class="vra-ai-list" hidden><ol></ol>'
      + (author ? '<p class="vra-ai-help">Sélectionnez un passage pour l\'annoter. ● = publique, ○ = brouillon.</p><div class="vra-ai-tools"><button type="button" data-t="import" class="alt">Importer des notes…</button><a href="/studio?changes=1" target="_blank" rel="noopener" class="vra-publ">Publier depuis le studio ›</a></div><p class="vra-ai-status" role="status"></p>' : '')
      + '</div>';
    root.appendChild(panel); list = panel.querySelector('.vra-ai-list'); status = panel.querySelector('.vra-ai-status');
    panel.querySelector('.vra-ai-toggle').addEventListener('click', e => { list.hidden = !list.hidden; e.currentTarget.setAttribute('aria-expanded', String(!list.hidden)); });
    panel.addEventListener('click', async e => {
      const ap = e.target.closest('a[data-pic]'); if (ap) { e.preventDefault(); const m = picMarks(ap.dataset.pic)[0]; if (m) { m.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => { if (author) openPicEditor(ap.dataset.pic); else showPop(picById(ap.dataset.pic), true, m); }, 450); } return; }
      const a = e.target.closest('a[data-id]'); if (a) { e.preventDefault(); const m = firstMark(a.dataset.id); if (m) { m.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => openById(a.dataset.id), 450); } return; }
      const b = e.target.closest('button[data-t]'); if (!b) return; const t = b.dataset.t;
      if (t === 'import') { importNotes(); return; }
    });
  }
  // import d'un export JSON (ancien bouton « Exporter » : { slug, notes:[…] }) ; les notes importées arrivent en brouillon
  function importNotes() {
    const f = document.createElement('input'); f.type = 'file'; f.accept = 'application/json,.json';
    f.onchange = async () => {
      try {
        const d = JSON.parse(await f.files[0].text()); const inc = (Array.isArray(d) ? d : d.notes || []).filter(n => n && n.quote && Array.isArray(n.thread));
        let added = 0; inc.forEach(n => { if (notes.some(x => x.id === n.id)) return; notes.push({ id: n.id || 'n' + Date.now().toString(36) + added, quote: n.quote, prefix: n.prefix || '', suffix: n.suffix || '', mode: n.mode || 'explain', thread: n.thread.map(m => ({ role: m.role, text: m.text })), created: n.created || new Date().toISOString(), status: 'draft', comment: n.comment || '', includeThread: true }); added++; });
        anchorAll(); save(); setStatus(added + ' note(s) importée(s) en brouillon' + (inc.length - added ? ' (' + (inc.length - added) + ' déjà présentes)' : '') + '.');
      } catch (er) { setStatus('Fichier illisible.'); }
    };
    f.click();
  }
  function renderPanel() {
    if (!panel) return;
    panel.querySelector('.n').textContent = notes.length + pics.length;
    panel.querySelector('ol').innerHTML = notes.map(n => '<li><a href="#" data-id="' + n.id + '">' + (author ? (n.status === 'public' ? '● ' : '○ ') : '') + esc(n.quote.replace(/\s+/g, ' ').slice(0, 90)) + (n.quote.length > 90 ? '…' : '') + '</a>' + (n.lost ? ' <small>(passage introuvable)</small>' : '') + '</li>').join('') + pics.map(p => '<li><a href="#" data-pic="' + p.id + '">▣ ' + (author ? (p.status === 'public' ? '● ' : '○ ') : '') + esc(p.quote.replace(/\s+/g, ' ').slice(0, 80)) + '</a>' + (p.lost ? ' <small>(passage introuvable)</small>' : '') + '</li>').join('');
  }

  /* ---------- barre de sélection (auteur) ---------- */
  function buildBar() {
    const bar = document.createElement('div'); bar.className = 'vra-ai-bar'; bar.hidden = true; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Annoter le passage');
    bar.innerHTML = Object.entries(MODES).map(([k, v]) => '<button type="button" data-mode="' + k + '">' + v.label + '</button>').join('') + '<button type="button" data-mode="note" class="alt">Annoter</button><button type="button" data-mode="image" class="alt">Image</button>';
    root.appendChild(bar);
    let sel = null;
    function readSelection() {
      if (window.VRA_EDITING) return null; // mode édition du texte : pas de barre de notes
      const s = window.getSelection(); if (!s || s.isCollapsed || !s.rangeCount) return null;
      const r = s.getRangeAt(0); const a = r.commonAncestorContainer; const el = a.nodeType === 1 ? a : a.parentElement;
      if (!el || !main.contains(el) || el.closest(SKIP)) return null;
      const q = s.toString().replace(/\s+/g, ' ').trim(); if (q.length < 3 || q.length > 1500) return null;
      const { list: tl, text } = textNodes(); const st = offsetOf(tl, r.startContainer, r.startOffset), en = offsetOf(tl, r.endContainer, r.endOffset);
      if (st < 0 || en <= st) return null;
      return { el, quote: text.slice(st, en), text: q, prefix: text.slice(Math.max(0, st - 40), st), suffix: text.slice(en, en + 40), para: paragraphOf(r), rect: r.getBoundingClientRect() };
    }
    function showBar() {
      sel = readSelection(); if (!sel) { bar.hidden = true; return; }
      bar.hidden = false; const w = bar.offsetWidth || 300; let x = sel.rect.left + sel.rect.width / 2 - w / 2, y = sel.rect.top - 46;
      if (y < 8) y = sel.rect.bottom + 10; x = Math.max(8, Math.min(window.innerWidth - w - 8, x));
      bar.style.left = x + 'px'; bar.style.top = y + 'px';
    }
    let t = null; document.addEventListener('selectionchange', () => { clearTimeout(t); t = setTimeout(showBar, 180); });
    document.addEventListener('mousedown', e => { if (!bar.contains(e.target) && !card.contains(e.target)) bar.hidden = true; });
    bar.addEventListener('mousedown', e => e.preventDefault());
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !sel) return;
      const mode = b.dataset.mode; const s = sel; bar.hidden = true;
      if (mode === 'image') createPicture(s); else if (mode === 'note') createNote(s);
      window.getSelection().removeAllRanges();
    });
  }

  /* ---------- démarrage : détection du mode ---------- */
  async function boot() {
    const forceReader = /[?&]reader=1/.test(location.search);
    if (STUDIO && !forceReader) {
      try { const r = await fetch(APIQ, { cache: 'no-store' }); if (r.ok) { const d = await r.json(); author = true; notes = d.notes || []; pics = d.pictures || []; published = !!d.published; subMeta = d.sub; noteStatus = d.noteStatus; } } catch (e) { /* mode lecteur */ }
    }
    if (!author) {
      try {
        const r = await fetch(base + 'annotations.public.json', { cache: 'no-store' });
        if (r.ok) { let d = await r.json(); for (const id of PATH) { const n = (d.notes || []).find(x => x.id === id); d = n && n.sub ? n.sub : { notes: [], pictures: [] }; }
          notes = (d.notes || []).map(n => Object.assign({}, n, { status: 'public', thread: n.thread || [] })); pics = (d.pictures || []).filter(p => p.images && p.images.length); }
      } catch (e) { notes = []; }
    }
    if (author && PATH.length && subMeta) buildSubBar(/[?&]edit=1/.test(location.search));
    if (author) buildBar();
    if (author || notes.length || pics.length) buildPanel();
    dirty = false; anchorAll(); renderPanel(); relayout(); buildSubList(); { const h = /^#sub-(.+)$/.exec(location.hash); if (h && !PATH.length && !EMBED) { const n = notes.find(x => x.id === h[1]); if (n && n.sub) setTimeout(() => { const st = document.getElementById('vra-n-' + n.id); if (st) st.scrollIntoView({ block: 'center' }); openSub(n); }, 300); } }
    window.addEventListener('resize', relayoutSoon); window.addEventListener('load', relayoutSoon); try { new ResizeObserver(relayoutSoon).observe(main); } catch (e) { /* ignore */ }
    window.VRAAnnotate = { author, notes: () => notes.slice() };
  }
  boot();
})();
