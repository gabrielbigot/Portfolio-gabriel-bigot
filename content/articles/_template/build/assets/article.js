/*
 * article.js — comportement de l'article. Aucune dépendance hors D3 (utilisé par charts.js).
 * Intégrable : window.VRAArticle.mount(rootElement, { standalone: false }).
 * Le texte est lisible sans ce script ; il ajoute graphiques, sources cliquables, sommaire, thème.
 */
(function (global) {
  'use strict';
  const DATA = global.VRA_DATA || { evidence: [], figures: {} };
  const EV = Object.fromEntries(DATA.evidence.map(e => [e.key, e]));
  const STATE = { actual: 'Réel', estimate: 'Estimation', forecast: 'Prévision', derived: 'Calculé', claim: 'Affirmation orale', gap: 'Lacune' };
  const CLASS = { company: 'Entreprise', official: 'Institution', paper: 'Étude', industry: 'Analyse sectorielle', secondary: 'Presse / secondaire', video: 'Vidéo analysée' };

  function mount(root, opts) {
    opts = opts || {};
    root.setAttribute('data-js', '');
    if (opts.standalone) root.setAttribute('data-standalone', '');
    initTheme(root, opts);
    initEvidence(root);
    initFigures(root);
    initNav(root);
  }

  /* ---------- thème ---------- */
  function initTheme(root, opts) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    let manual = null; try { manual = localStorage.getItem('vra-theme'); } catch (e) { /* stockage indisponible */ }
    const hostDark = () => document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
    const apply = () => {
      const folio = !!(window.VRA_AI && window.VRA_AI.base); // intégré au portfolio : clair par défaut (comme le site), sombre seulement si choisi
      const dark = manual ? manual === 'dark' : (folio ? false : (opts.standalone ? mq.matches : hostDark()));
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      if (opts.standalone) { document.documentElement.setAttribute('data-vra-theme', dark ? 'dark' : 'light'); document.documentElement.style.colorScheme = dark ? 'dark' : 'light'; document.documentElement.style.background = dark ? '#4a4a4d' : '#f4f1ea'; }
      root.dispatchEvent(new CustomEvent('vra:theme'));
    };
    apply(); mq.addEventListener && mq.addEventListener('change', apply);
    new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    const btn = root.querySelector('[data-theme-toggle]');
    if (btn) {
      if (!opts.standalone) btn.hidden = true;
      btn.addEventListener('click', () => {
        manual = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('vra-theme', manual); } catch (e) { /* ignore */ }
        apply(); btn.setAttribute('aria-pressed', manual === 'dark');
      });
    }
  }

  /* ---------- carte de preuve (source drill-down) ---------- */
  function initEvidence(root) {
    const card = root.querySelector('#vra-evidence');
    if (!card) return;
    let last = null;
    const body = card.querySelector('.ev-body');
    const close = () => { card.hidden = true; if (last && last.focus) { try { last.focus({ preventScroll: true }); } catch (e) { /* ignore */ } } };
    const open = (key, trigger) => {
      const e = EV[key]; if (!e) return;
      last = trigger;
      const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
      body.innerHTML = `<p class="ev-key"><span class="chip chip-${e.state}">${STATE[e.state] || e.state}</span> <code>${e.key}</code> <span class="ev-class">${CLASS[e.sourceClass] || ''}</span></p>
        <h3>${e.fact}</h3><p class="ev-value">${e.value}</p>
        <dl>${row('Unité / périmètre', e.unit)}${row('Source', `<a href="${e.url}" target="_blank" rel="noopener noreferrer">${e.sourceName}</a>`)}
        ${row('Publication', e.publicationDate)}${row('Observation', e.observationDate)}${row('Formule', e.formula)}${row('Limites', e.limitations)}</dl>
        <p><a class="ev-reg" href="#src-${e.key}">Voir dans le registre des sources ↓</a></p>`;
      card.hidden = false; card.querySelector('.ev-close').focus({ preventScroll: true });
    };
    root.addEventListener('click', ev => {
      const t = ev.target.closest('[data-src]');
      if (t && root.contains(t) && !t.closest('#vra-evidence')) {
        const key = t.getAttribute('data-src'); if (!EV[key]) return;
        if (t.tagName === 'A' && t.getAttribute('href') && !ev.metaKey && !ev.ctrlKey) ev.preventDefault();
        open(key, t); return;
      }
      if (ev.target.closest('.ev-close')) { close(); return; }
      if (!card.hidden && !ev.target.closest('#vra-evidence')) close();
    });
    root.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && !card.hidden) { ev.stopPropagation(); close(); return; }
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.closest && ev.target.matches('svg [data-src]')) { ev.preventDefault(); open(ev.target.getAttribute('data-src'), ev.target); }
    });
  }

  /* ---------- figures ---------- */
  function initFigures(root) {
    const charts = root.querySelectorAll('.vra-chart[data-fig]');
    charts.forEach(el => {
      const fig = DATA.figures[el.getAttribute('data-fig')];
      if (!fig) return;
      if (!el.id) el.id = 'c-' + el.getAttribute('data-fig');
      let lastW = 0, t;
      const draw = () => {
        try { global.VRACharts.render(el, fig); el.removeAttribute('data-failed'); }
        catch (err) { el.setAttribute('data-failed', ''); el.innerHTML = '<p class="fig-fallback">Cette figure n\'a pas pu s\'afficher. Les données figurent dans le tableau ci-dessous.</p>'; console.error('[VRA] figure', el.id, err); }
      };
      const redraw = () => { const w = Math.round(el.clientWidth); if (w && w !== lastW) { lastW = w; draw(); } };
      draw(); lastW = Math.round(el.clientWidth);
      if (global.ResizeObserver) new ResizeObserver(() => { clearTimeout(t); t = setTimeout(redraw, 120); }).observe(el);
      root.addEventListener('vra:theme', () => { draw(); });
      /* alternative textuelle : tableau de données */
      const fgr = el.closest('figure');
      if (fgr && !fgr.querySelector('.fig-data')) {
        const tb = global.VRACharts.tableFor(fig);
        if (tb.rows.length) {
          const d = document.createElement('details'); d.className = 'fig-data';
          d.innerHTML = '<summary>Voir les données de la figure</summary><div class="tbl-wrap"><table><thead><tr>' + tb.head.map(h => `<th scope="col">${h}</th>`).join('') + '</tr></thead><tbody>' +
            tb.rows.map(r => '<tr>' + r.map((c, i) => `<td>${/^(K|D|G|V)\d/.test(String(c)) && i === r.length - 1 ? `<a class="src" href="#src-${c}" data-src="${c}">${c}</a>` : c}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
          (fgr.querySelector('figcaption') || fgr).after(d);
        }
      }
    });
  }

  /* ---------- sommaire, progression ---------- */
  function initNav(root) {
    const bar = root.querySelector('.vra-progress i');
    const onScroll = () => { if (!bar) return; const m = document.documentElement.scrollHeight - innerHeight; bar.style.width = (m > 0 ? Math.min(100, scrollY / m * 100) : 0) + '%'; };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const links = [...root.querySelectorAll('.vra-toc a[href^="#"]')];
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.removeAttribute('aria-current')); const a = map.get(e.target.id); if (a) a.setAttribute('aria-current', 'true'); } });
    }, { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    const toggle = root.querySelector('[data-toc-toggle]'), toc = root.querySelector('.vra-toc');
    if (toggle && toc) toggle.addEventListener('click', () => { const o = toc.getAttribute('data-open') === 'true'; toc.setAttribute('data-open', String(!o)); toggle.setAttribute('aria-expanded', String(!o)); });
    links.forEach(a => a.addEventListener('click', () => { if (toc) { toc.setAttribute('data-open', 'false'); if (toggle) toggle.setAttribute('aria-expanded', 'false'); } }));
  }

  global.VRAArticle = { mount };
  if (document.querySelector('.vra[data-autostart]')) {
    const go = () => mount(document.querySelector('.vra[data-autostart]'), { standalone: true });
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
  }
})(window);
