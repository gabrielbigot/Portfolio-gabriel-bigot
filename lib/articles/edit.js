/* Édition directe d'un article ou d'un sous-article dans le studio (jamais chargé sur le site public).
 * - clic sur un texte : on le modifie, enregistré dans le brouillon (content/articles/<slug>/edits.json) à la sortie du champ ;
 * - chaque section : monter, descendre, masquer (ou supprimer si elle a été ajoutée), dupliquer (sections ajoutées), « + » pour en ajouter une après ;
 * - le mode « Édition » est exclusif du mode « Notes » (sélection de texte → note, image, sous-article). */
(function () {
  'use strict';
  var C = window.VRA_EDIT; if (!C) return;
  var forceReader = /[?&]reader=1/.test(location.search) || /[?&]embed=1/.test(location.search);
  if (forceReader) return;
  var st = document.createElement('style');
  st.textContent = [
    '.ve-on [data-ed]{outline:1px dashed transparent;outline-offset:3px;border-radius:2px;cursor:text;transition:outline-color .15s}',
    '.ve-on [data-ed]:hover{outline-color:rgba(181,83,42,.55)}',
    '.ve-on [data-ed]:focus{outline:2px solid #b5532a;background:rgba(181,83,42,.06)}',
    '.ve-on [data-ed][data-stale]{outline:1px dashed #c9a227}',
    '.ve-sec{position:relative}',
    '.ve-bar{position:absolute;top:-14px;right:0;z-index:70;display:none;gap:4px;padding:4px;background:#2b2b2d;color:#fff;border-radius:8px;font:600 12px/1 ui-sans-serif,system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.3)}',
    '.ve-on .ve-sec:hover>.ve-bar,.ve-on .ve-sec:focus-within>.ve-bar{display:flex}',
    '.ve-bar button{all:unset;cursor:pointer;padding:6px 8px;border-radius:5px}.ve-bar button:hover{background:#4a4a4d}.ve-bar button[disabled]{opacity:.35;cursor:default}',
    '.ve-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#2b2b2d;border-radius:8px;padding:4px;display:flex;flex-direction:column;min-width:170px}',
    '.ve-menu button{text-align:left}',
    '.ve-hid{margin:12px 0;padding:10px 14px;border:1px dashed #b5532a;border-radius:8px;font:500 13px ui-sans-serif,system-ui,sans-serif;display:flex;gap:10px;align-items:center;justify-content:space-between;background:rgba(181,83,42,.07)}',
    '.ve-hid button{all:unset;cursor:pointer;font-weight:700;text-decoration:underline}',
    '.ve-add{display:none;margin:18px 0;text-align:center}.ve-on .ve-add{display:block}',
    '.ve-add button{all:unset;cursor:pointer;font:600 13px ui-sans-serif,system-ui,sans-serif;color:#b5532a;border:1px dashed #b5532a;border-radius:999px;padding:8px 14px}',
    '.ve-figbtn{display:none;position:absolute;top:6px;right:6px;z-index:60;font:600 12px ui-sans-serif,system-ui,sans-serif;padding:6px 10px;border-radius:999px;border:1px solid #8b5cf6;background:rgba(139,92,246,.12);color:inherit;cursor:pointer;backdrop-filter:blur(4px)}',
    '.ve-on figure.fig:hover>.ve-figbtn,.ve-figbtn:focus{display:block}',
    '.ve-modal{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.45);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:4vh 12px}',
    '.ve-card{background:var(--vra-bg,#fff);color:var(--vra-ink,#222);border:1px solid var(--vra-line,#ccc);border-radius:12px;max-width:760px;width:100%;padding:18px 20px;font:400 14px/1.5 ui-sans-serif,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.4)}',
    '.ve-card h3{margin:0 0 4px;font:700 16px ui-sans-serif,system-ui,sans-serif}.ve-card .ve-sub{opacity:.7;font-size:12.5px;margin-bottom:12px}',
    '.ve-alt{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:10px 0;border-top:1px solid var(--vra-line,#ddd)}.ve-alt b{font:700 14px ui-monospace,monospace}.ve-alt small{opacity:.75}',
    '.ve-badge{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;font:700 10.5px ui-sans-serif,system-ui,sans-serif;background:#8b5cf6;color:#fff}.ve-badge.old{background:#8a8a93}',
    '.ve-btn{font:600 12.5px ui-sans-serif,system-ui,sans-serif;padding:7px 12px;border-radius:8px;border:1px solid var(--vra-line,#bbb);background:transparent;color:inherit;cursor:pointer}.ve-btn.pri{background:#2b2b2d;color:#fff;border-color:#2b2b2d}.ve-btn[disabled]{opacity:.45;cursor:default}',
    '.ve-prev{margin:12px 0;border:1px dashed var(--vra-line,#bbb);border-radius:8px;padding:8px;min-height:120px}.ve-warn{margin:8px 0;padding:8px 10px;border-radius:8px;background:rgba(201,162,39,.15);font-size:12.5px}',
    '.ve-writelink{display:none;font:600 12px/1 ui-sans-serif,system-ui;color:#fff;background:#b5532a;border-radius:999px;padding:6px 12px;text-decoration:none;margin-bottom:8px;width:fit-content}.ve-on .ve-writelink{display:inline-block}',
    '.ve-ai{text-decoration:underline dotted #8b5cf6 2px;text-underline-offset:4px}',
    '.ve-ai-tip{position:fixed;z-index:2147483000;width:330px;background:var(--vra-bg,#fff);color:var(--vra-ink,#222);border:1px solid var(--vra-line,#ccc);border-radius:10px;padding:10px 12px;font:400 12.5px/1.45 ui-sans-serif,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.35)}.ve-ai-tip b{font-weight:700}.ve-ai-tip .q{margin:4px 0 8px;padding:6px 8px;border-radius:6px;background:rgba(139,92,246,.12)}',
    '.ve-pill{position:fixed;left:12px;bottom:12px;z-index:90;display:flex;gap:2px;padding:3px;background:#2b2b2d;color:#fff;border-radius:999px;font:600 12px/1 ui-sans-serif,system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.3)}',
    '.ve-pill button{all:unset;cursor:pointer;padding:8px 12px;border-radius:999px}.ve-pill button[aria-pressed=true]{background:#b5532a}',
    '.ve-toast{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:95;background:#2b2b2d;color:#fff;font:600 12px ui-sans-serif,system-ui,sans-serif;padding:8px 14px;border-radius:999px}'
  ].join('');
  document.head.appendChild(st);

  var main = document.querySelector('main'); if (!main) return;
  var editing = true; try { editing = sessionStorage.getItem('ve-mode') !== 'notes'; } catch (e) { /* ignore */ }
  var toast = null, toastT = 0;
  function say(t, bad) { if (!toast) { toast = document.createElement('div'); toast.className = 've-toast'; document.body.appendChild(toast); } toast.textContent = t; toast.style.background = bad ? '#a32d2d' : '#2b2b2d'; toast.style.display = ''; clearTimeout(toastT); toastT = setTimeout(function () { toast.style.display = 'none'; }, bad ? 4500 : 1400); }
  function post(body) {
    body.page = C.page;
    return fetch(C.api + '/edits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.ok === false) throw new Error(j.error || ('Erreur ' + r.status)); return j; }); });
  }
  function reload() { try { sessionStorage.setItem('ve-scroll', String(window.scrollY)); } catch (e) { /* ignore */ } location.reload(); }
  try { var y = sessionStorage.getItem('ve-scroll'); if (y) { sessionStorage.removeItem('ve-scroll'); window.addEventListener('load', function () { setTimeout(function () { window.scrollTo(0, +y); }, 50); }); } } catch (e) { /* ignore */ }

  // ---- texte ----
  function setEditing(on) {
    editing = on; window.VRA_EDITING = on; document.documentElement.classList.toggle('ve-on', on);
    document.querySelectorAll('[data-ed]').forEach(function (el) { if (on) { el.setAttribute('contenteditable', 'true'); el.setAttribute('spellcheck', 'false'); el.querySelectorAll('a').forEach(function (a) { a.setAttribute('contenteditable', 'false'); }); } else { el.removeAttribute('contenteditable'); } });
    try { sessionStorage.setItem('ve-mode', on ? 'edit' : 'notes'); } catch (e) { /* ignore */ }
    var b = document.querySelectorAll('.ve-pill button[data-m]'); b.forEach(function (x) { x.setAttribute('aria-pressed', String((x.getAttribute('data-m') === 'edit') === on)); });
  }
  var before = new WeakMap(), beforeTxt = new WeakMap(), busyAi = false;
  // ---- assistant d'écriture (Claude) : même geste que sur le portfolio ----
  var INSTR = /^\s*(\/|(?:r[ée]écri|reformul|raccourci|r[ée]sum|d[ée]velopp|d[ée]taill|explique|[ée]cri(?:s|re)\b|r[ée]dig|ajoute|compl[eè]t|corrige|traduis|simplifi|am[ée]liore|transform|reprends|propose|g[ée]n[èe]r|rends|mets|fais|donne|trouve|allonge|enrichis|synth[ée]tise|make|rewrite|shorten|expand|translate|summari[sz]e|fix|improve|write|add|turn|give|explain)\w*)/i;
  function looksLikeInstruction(t) { var v = t.trim(); return v.length >= 8 && v.split(/\s+/).length >= 2 && INSTR.test(v); }
  var aiOn = null, traces = {};
  function jget(u) { return fetch(u).then(function (r) { return r.json(); }); }
  function jpost(u, b) { return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || ('Erreur ' + r.status)); return j; }); }); }
  jget('/api/studio/ai').then(function (j) { aiOn = !!j.enabled; }).catch(function () { aiOn = false; });
  function tid(el) { return 'art|' + C.slug + '/' + (C.page || '-') + '/' + String(el.getAttribute('data-ed')).replace(':', '_'); }
  var norm = function (t) { return String(t || '').replace(/\s+/g, ' ').trim(); };
  function markTraces() { document.querySelectorAll('[data-ed]').forEach(function (el) { var t = traces[tid(el)]; var on = !!t && t.status !== 'reviewed' && norm(t.after) === norm(el.textContent); el.classList.toggle('ve-ai', on); if (on) el.setAttribute('data-ai', t.status); else el.removeAttribute('data-ai'); }); }
  function loadTraces() { jget('/api/studio/ai-trace').then(function (j) { traces = (j && j.items) || {}; markTraces(); }).catch(function () { /* ignore */ }); }
  loadTraces();
  var chip = document.createElement('div'); chip.style.cssText = 'position:fixed;z-index:2147483000;display:none;padding:6px 10px;border-radius:999px;font:600 12px system-ui,sans-serif;background:#2b2b2d;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.35);max-width:90vw'; document.body.appendChild(chip);
  var chipEl = null;
  function refreshChip(el) {
    if (!editing || busyAi) return; var t = el.textContent, on = looksLikeInstruction(t) && norm(t) !== norm(beforeTxt.get(el)); if (!on) { chip.style.display = 'none'; chipEl = null; return; }
    chipEl = el; var r = el.getBoundingClientRect(); chip.style.display = 'block'; chip.style.left = Math.max(8, Math.min(window.innerWidth - 340, r.left)) + 'px'; chip.style.top = Math.min(window.innerHeight - 40, r.bottom + 8) + 'px';
    chip.innerHTML = el.querySelector('a.src') ? 'Ce texte contient des pastilles de source : modification manuelle seulement' : (aiOn === false ? 'IA indisponible : ANTHROPIC_API_KEY absente de ce studio' : '<span style="color:#f3d98b">✨</span> ↵ envoyer à l\'IA · <span style="opacity:.75">Échap : garder comme texte</span>');
    if (el.querySelector('a.src') || aiOn === false) chipEl = null;
  }
  document.addEventListener('input', function (e) { var el = e.target.closest && e.target.closest('[data-ed]'); if (el) refreshChip(el); });
  function runAi(el) {
    var instr = el.textContent.replace(/^\s*\//, '').trim(), orig = beforeTxt.get(el) || ''; busyAi = true; chip.textContent = '✨ Claude écrit…'; el.setAttribute('contenteditable', 'false');
    jpost('/api/studio/ai', { instruction: instr, original: orig, multiline: false, context: C.slug + ' · ' + (C.page || 'article') + ' · ' + el.tagName.toLowerCase() + ' ' + el.getAttribute('data-ed') }).then(function (r) {
      el.textContent = r.text; el._ai = { prompt: instr, before: orig, model: r.model }; busyAi = false; chip.style.display = 'none'; chipEl = null; el.setAttribute('contenteditable', 'true'); saveEl(el); // le focus a déjà été perdu (contenteditable=false) : on enregistre explicitement
    }).catch(function (er) { busyAi = false; say('Échec : ' + er.message, true); el.setAttribute('contenteditable', 'true'); el.focus(); refreshChip(el); });
  }
  document.addEventListener('focusin', function (e) { var el = e.target.closest && e.target.closest('[data-ed]'); if (el) { before.set(el, el.innerHTML); beforeTxt.set(el, el.textContent); } });
  document.addEventListener('focusout', function (e) {
    var el = e.target.closest && e.target.closest('[data-ed]'); if (!el || !editing || busyAi) return; chip.style.display = 'none'; chipEl = null; saveEl(el);
  });
  function saveEl(el) {
    var was = before.get(el); if (was === undefined || was === el.innerHTML) return; before.set(el, el.innerHTML);
    post({ op: 'text', k: el.getAttribute('data-ed'), h: el.getAttribute('data-h'), html: el.innerHTML }).then(function () {
      el.removeAttribute('data-stale'); el.setAttribute('data-edited', '1'); var id = tid(el), txt = el.textContent;
      if (el._ai) { var a = el._ai; delete el._ai; jpost('/api/studio/ai-trace', { op: 'set', id: id, entry: { prompt: a.prompt, before: a.before, after: txt, model: a.model } }).then(function () { traces[id] = { prompt: a.prompt, before: a.before, after: txt, status: 'ai' }; markTraces(); }); say('Texte généré par Claude : survolez-le pour revoir la demande'); }
      else { say('Enregistré dans le brouillon'); if (traces[id] && traces[id].status === 'ai') { jpost('/api/studio/ai-trace', { op: 'edited', id: id, after: txt }).then(function () { traces[id].status = 'edited'; traces[id].after = txt; markTraces(); }); } }
    }).catch(function (er) { say('Échec : ' + er.message, true); });
  }
  document.addEventListener('keydown', function (e) {
    var el = e.target.closest && e.target.closest('[data-ed]'); if (!el || !editing) return;
    if (e.key === 'Enter' && !(e.shiftKey && el.tagName === 'P')) { e.preventDefault(); if (chipEl === el) runAi(el); else el.blur(); }
    if (e.key === 'Escape') { el.innerHTML = before.get(el) || el.innerHTML; chip.style.display = 'none'; chipEl = null; el.blur(); }
  });
  // infobulle de provenance au survol (studio seulement)
  var tip = null, tipFor = null, tipT = 0;
  function hideTip() { if (tip) { tip.remove(); tip = null; tipFor = null; } }
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('.ve-ai'); if (!el) { if (tip && !(e.target.closest && e.target.closest('.ve-ai-tip'))) { clearTimeout(tipT); tipT = setTimeout(hideTip, 350); } return; }
    clearTimeout(tipT); if (tipFor === el) return; hideTip(); tipFor = el; var t = traces[tid(el)]; if (!t) return;
    tip = document.createElement('div'); tip.className = 've-ai-tip'; var r = el.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(window.innerWidth - 350, r.left)) + 'px'; tip.style.top = Math.min(window.innerHeight - 220, r.bottom + 8) + 'px';
    tip.innerHTML = '<b>✨ ' + (t.status === 'edited' ? 'Écrit par Claude, modifié depuis' : 'Écrit par Claude (à relire)') + '</b><div>Votre demande :</div><div class="q"></div>' + (t.before ? '<div style="opacity:.75;margin-bottom:8px">Avant : <i class="b"></i></div>' : '') + '<div><button type="button" class="ve-btn" data-undo>Annuler l\'IA</button> <button type="button" class="ve-btn" data-ok>Marquer comme relu</button></div>';
    tip.querySelector('.q').textContent = t.prompt; var bq = tip.querySelector('.b'); if (bq) bq.textContent = (t.before || '').slice(0, 140) + ((t.before || '').length > 140 ? '…' : '');
    tip.addEventListener('mouseenter', function () { clearTimeout(tipT); }); tip.addEventListener('mouseleave', function () { tipT = setTimeout(hideTip, 350); });
    tip.querySelector('[data-ok]').onclick = function () { var id = tid(el); jpost('/api/studio/ai-trace', { op: 'review', id: id }).then(function () { traces[id].status = 'reviewed'; markTraces(); hideTip(); }).catch(function (er) { say('Échec : ' + er.message, true); }); };
    tip.querySelector('[data-undo]').onclick = function () { if (!confirm('Rétablir le texte d\'avant la demande à l\'IA ?')) return; var id = tid(el), h = String(t.before).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); post({ op: 'text', k: el.getAttribute('data-ed'), h: el.getAttribute('data-h'), html: h }).then(function () { return jpost('/api/studio/ai-trace', { op: 'remove', id: id }); }).then(reload).catch(function (er) { say('Échec : ' + er.message, true); }); };
    (document.querySelector('.vra') || document.body).appendChild(tip);
  });
  document.addEventListener('paste', function (e) { var el = e.target.closest && e.target.closest('[data-ed]'); if (!el || !editing) return; e.preventDefault(); var t = (e.clipboardData || window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, t.replace(/\s*\n\s*/g, ' ')); });
  document.addEventListener('click', function (e) { if (!editing) return; var a = e.target.closest && e.target.closest('[data-ed] a'); if (a) e.preventDefault(); }, true);
  document.addEventListener('drop', function (e) { if (editing && e.target.closest && e.target.closest('[data-ed]')) e.preventDefault(); }, true);

  // ---- sections ----
  function secs() { return Array.prototype.filter.call(main.children, function (n) { return n.tagName === 'SECTION' && n.id; }); }
  function state() { var s = secs(); return { order: s.map(function (x) { return x.id; }), hidden: s.filter(function (x) { return x.getAttribute('data-hidden'); }).map(function (x) { return x.id; }) }; }
  function layout(order, hidden, extra) { var b = { op: 'layout', order: order, hidden: hidden }; if (extra) for (var k in extra) b[k] = extra[k]; return post(b).then(reload).catch(function (er) { say('Échec : ' + er.message, true); }); }
  function visible(s) { return !s.getAttribute('data-hidden'); }
  function addSection(afterId, kind) {
    var st0 = state();
    function go(file) { post({ op: 'add', kind: kind, afterId: afterId, order: st0.order, hidden: st0.hidden, file: file }).then(reload).catch(function (er) { say('Échec : ' + er.message, true); }); }
    if (kind !== 'image') return go();
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/webp,image/gif';
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; var fd = new FormData(); fd.append('file', f); fetch(C.api + '/images', { method: 'POST', body: fd }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'envoi'); return j; }); }).then(function (j) { go(j.file); }).catch(function (er) { say('Échec : ' + er.message, true); }); };
    inp.click();
  }
  function menu(host, afterId) {
    var old = host.querySelector('.ve-menu'); if (old) { old.remove(); return; }
    var m = document.createElement('div'); m.className = 've-menu';
    [['text', 'Texte'], ['image', 'Image + texte'], ['quote', 'Citation'], ['list', 'Liste']].forEach(function (k) { var b = document.createElement('button'); b.type = 'button'; b.textContent = k[1]; b.onclick = function (e) { e.stopPropagation(); addSection(afterId, k[0]); }; m.appendChild(b); });
    host.appendChild(m);
  }
  function decorate() {
    var all = secs(), st0 = state();
    all.forEach(function (s, i) {
      s.classList.add('ve-sec'); if (s.querySelector(':scope>.ve-bar')) return;
      var added = s.getAttribute('data-added'), bar = document.createElement('div'); bar.className = 've-bar'; bar.setAttribute('contenteditable', 'false');
      function btn(label, title, fn, dis) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.title = title; if (dis) b.disabled = true; b.onclick = function (e) { e.stopPropagation(); fn(); }; bar.appendChild(b); }
      var vis = all.filter(visible), vi = vis.indexOf(s);
      function move(d) { var j = all.indexOf(vis[vi + d]); var o = st0.order.slice(); var a = o.indexOf(s.id), b = o.indexOf(all[j].id); o[a] = all[j].id; o[b] = s.id; layout(o, st0.hidden); }
      btn('↑', 'Monter la section', function () { move(-1); }, vi <= 0); btn('↓', 'Descendre la section', function () { move(1); }, vi < 0 || vi >= vis.length - 1);
      btn('+ Section', 'Ajouter une section après', function () { menu(bar, s.id); });
      if (added) btn('⧉', 'Dupliquer', function () { post({ op: 'dup', id: s.id, afterId: s.id, order: st0.order, hidden: st0.hidden }).then(reload).catch(function (er) { say('Échec : ' + er.message, true); }); });
      btn(added ? 'Supprimer' : 'Masquer', added ? 'Supprimer cette section' : 'Masquer (récupérable)', function () { if (added) { if (confirm('Supprimer cette section ?')) layout(st0.order.filter(function (x) { return x !== s.id; }), st0.hidden, { removeAdded: [s.id] }); } else layout(st0.order, st0.hidden.concat([s.id])); });
      s.insertBefore(bar, s.firstChild);
    });
    // sections masquées : bandeau de restauration
    all.filter(function (s) { return s.getAttribute('data-hidden'); }).forEach(function (s) {
      var h = document.createElement('div'); h.className = 've-hid'; h.setAttribute('contenteditable', 'false');
      var t = (s.querySelector('h2') || {}).textContent || s.id; h.innerHTML = '<span>Section masquée : <strong></strong> (invisible sur le site publié)</span><button type="button">Rétablir</button>'; h.querySelector('strong').textContent = t;
      h.querySelector('button').onclick = function () { layout(st0.order, st0.hidden.filter(function (x) { return x !== s.id; })); };
      main.insertBefore(h, s);
    });
    var add = document.createElement('div'); add.className = 've-add ve-sec'; add.style.position = 'relative'; add.setAttribute('contenteditable', 'false');
    var ab = document.createElement('button'); ab.type = 'button'; ab.textContent = '+ Ajouter une section à la fin'; ab.onclick = function () { var vis = all.filter(visible); menu(add, (vis[vis.length - 1] || {}).id || ''); }; add.appendChild(ab); main.appendChild(add);
  }
  decorate();


  // ---- figures : « ✨ Autres graphiques » (modèle de décision + conversion par Claude, aperçu avant application) ----
  function apiGet(u) { return fetch(C.api + u).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('Erreur ' + r.status)); return j; }); }); }
  function apiPost(u, b) { return fetch(C.api + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('Erreur ' + r.status)); return j; }); }); }
  var modal = null;
  function closeModal() { if (modal) { modal.remove(); modal = null; } }
  function openModal(html) { closeModal(); modal = document.createElement('div'); modal.className = 've-modal'; modal.innerHTML = '<div class="ve-card" role="dialog" aria-modal="true">' + html + '</div>'; modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); }); (document.querySelector('.vra') || document.body).appendChild(modal); return modal.firstChild; }
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function openCharts(id) {
    var card = openModal('<h3>✨ Autres graphiques</h3><p class="ve-sub">Chargement…</p>');
    apiGet('/charts?fig=' + encodeURIComponent(id)).then(function (r) {
      var h = '<h3>Autres graphiques pour cette figure</h3><p class="ve-sub">Forme actuelle : <b>' + esc(r.current) + '</b>' + (r.overridden ? ' (remplacée ; forme d\'origine : ' + esc(r.originalType) + ')' : '') + (r.brief && r.brief.n ? ' · ' + r.brief.n + ' éléments' : '') + '. Classement par le modèle de décision : ajustement, nouveauté, formes déjà utilisées.</p>';
      if (r.overridden) h += '<p><button type="button" class="ve-btn" data-revert>Rétablir la figure d\'origine</button></p>';
      if (r.note) h += '<p class="ve-warn">' + esc(r.note) + '</p>';
      (r.alts || []).forEach(function (a) { h += '<div class="ve-alt"><div><b>' + esc(a.type) + '</b>' + (a.fresh ? '<span class="ve-badge">neuve</span>' : '<span class="ve-badge old">' + a.uses + '× déjà</span>') + (a.inLast2 ? '<span class="ve-badge old">2 derniers articles</span>' : '') + '<br><small>' + esc(a.when) + (a.why && a.why.length ? ' · ⚠ ' + esc(a.why.join(' ; ')) : '') + '</small></div><div><button type="button" class="ve-btn" data-prev="' + esc(a.type) + '"' + (r.ai ? '' : ' disabled title="Clé IA absente : ANTHROPIC_API_KEY"') + '>Prévisualiser</button></div></div>'; });
      if (!(r.alts || []).length && !r.note) h += '<p class="ve-warn">Aucune alternative compatible avec les données de cette figure.</p>';
      h += '<p style="margin-top:12px"><button type="button" class="ve-btn" data-close>Fermer</button></p>' + (r.ai ? '' : '<p class="ve-sub">La prévisualisation demande une clé IA (ANTHROPIC_API_KEY) dans ce studio.</p>');
      card.innerHTML = h;
      card.querySelector('[data-close]').onclick = closeModal;
      var rv = card.querySelector('[data-revert]'); if (rv) rv.onclick = function () { if (confirm('Rétablir la figure d\'origine ?')) apiPost('/edits', { op: 'figure', fig: id, figure: null }).then(reload).catch(function (e) { say('Échec : ' + e.message, true); }); };
      card.querySelectorAll('[data-prev]').forEach(function (b) { b.onclick = function () { preview(id, b.getAttribute('data-prev')); }; });
    }).catch(function (e) { card.innerHTML = '<h3>Autres graphiques</h3><p class="ve-warn">' + esc(e.message) + '</p><p><button type="button" class="ve-btn" data-close>Fermer</button></p>'; card.querySelector('[data-close]').onclick = closeModal; });
  }
  function preview(id, type) {
    var card = openModal('<h3>' + esc(type) + '</h3><p class="ve-sub">Claude convertit les mêmes données vers cette forme…</p>');
    apiPost('/charts', { fig: id, type: type }).then(function (r) {
      card.innerHTML = '<h3>Aperçu : ' + esc(type) + '</h3><p class="ve-sub">Mêmes données, convertie par Claude. Rien n\'est enregistré tant que vous n\'appliquez pas.</p><div class="ve-prev"><figure class="vra-chart" id="ve-prev-chart" style="margin:0"></figure></div>' +
        (r.missing && r.missing.length ? '<p class="ve-warn">⚠ Valeurs de l\'original non retrouvées dans la nouvelle figure : ' + esc(r.missing.slice(0, 12).join(' ; ')) + (r.missing.length > 12 ? '…' : '') + '. Vérifiez avant d\'appliquer.</p>' : '<p class="ve-sub">Toutes les valeurs numériques de l\'original sont retrouvées.</p>') +
        '<p class="ve-sub">Le texte « Lecture » sous la figure n\'est pas réécrit : relisez-le.</p><p><button type="button" class="ve-btn pri" data-apply>Appliquer ce graphique</button> <button type="button" class="ve-btn" data-back>Retour à la liste</button></p>';
      try { window.VRACharts.render(card.querySelector('#ve-prev-chart'), r.figure); } catch (e) { card.querySelector('.ve-prev').innerHTML = '<p class="ve-warn">Cette conversion ne s\'affiche pas : ' + esc(e.message) + '</p>'; card.querySelector('[data-apply]').disabled = true; }
      card.querySelector('[data-back]').onclick = function () { openCharts(id); };
      card.querySelector('[data-apply]').onclick = function () { apiPost('/edits', { op: 'figure', fig: id, figure: r.figure }).then(reload).catch(function (e) { say('Échec : ' + e.message, true); }); };
    }).catch(function (e) { card.innerHTML = '<h3>' + esc(type) + '</h3><p class="ve-warn">' + esc(e.message) + '</p><p><button type="button" class="ve-btn" data-back>Retour à la liste</button></p>'; card.querySelector('[data-back]').onclick = function () { openCharts(id); }; });
  }
  function figs() {
    document.querySelectorAll('figure.fig:not(.fig-explain) .vra-chart[data-fig]').forEach(function (ch) {
      var fg = ch.closest('figure'); if (!fg || fg.querySelector(':scope > .ve-figbtn')) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 've-figbtn'; b.textContent = '✨ Autres graphiques'; b.setAttribute('contenteditable', 'false');
      b.onclick = function () { openCharts(ch.getAttribute('data-fig')); }; if (getComputedStyle(fg).position === 'static') fg.style.position = 'relative'; fg.insertBefore(b, fg.firstChild);
    });
  }
  window.addEventListener('load', figs); figs();

  // ---- pastille de mode ----
  var pill = document.createElement('div'); pill.className = 've-pill'; pill.setAttribute('role', 'group'); pill.setAttribute('aria-label', 'Mode du studio');
  pill.innerHTML = '<button type="button" data-m="edit">✎ Éditer</button><button type="button" data-m="notes">Notes</button>' ;
  pill.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; if (b.getAttribute('data-m') === 'edit' && C.created && C.page === '') { location.href = '/studio/write/article/' + C.slug; return; } setEditing(b.getAttribute('data-m') === 'edit'); }); // article créé dans le studio : « Éditer » ouvre l'éditeur d'écriture (un seul mode)
  // dossier importé : sections d'origine modifiables en place ; sections ajoutées (blocs) : lien vers l'éditeur d'écriture
  document.querySelectorAll('section[data-blocks]').forEach(function (sec) { if (sec.querySelector('.ve-writelink')) return; var a = document.createElement('a'); a.className = 've-writelink'; a.href = '/studio/write/article/' + C.slug + '#sec-' + sec.id; a.textContent = '✎ Écrire cette section'; a.setAttribute('contenteditable', 'false'); sec.insertBefore(a, sec.firstChild); });
  document.body.appendChild(pill);
  setEditing(editing);
})();
