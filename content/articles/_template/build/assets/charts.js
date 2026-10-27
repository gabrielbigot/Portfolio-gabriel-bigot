/*
 * charts.js — moteur de figures de l'article « Le silicium et le pouvoir ».
 * Formes dérivées de la Visual Research Library (sankey, step-line, interval-plot,
 * diverging-bar, slopegraph, gantt/milestone, dependency-graph, line) et réécrites
 * pour : états de preuve encodés de façon redondante, source drill-down, focus clavier,
 * thème clair/sombre, redimensionnement. Chaque figure est indépendante (try/catch).
 */
(function (global) {
  'use strict';
  const d3 = global.d3;
  const NS = 'http://www.w3.org/2000/svg';
  /* locale française pour les axes temporels */
  d3.timeFormatDefaultLocale({
    dateTime: '%A %e %B %Y à %X', date: '%d/%m/%Y', time: '%H:%M:%S', periods: ['AM', 'PM'],
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  });

  /* ---------- utilitaires ---------- */
  const fmt = (n, dec) => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: dec == null ? 1 : dec });
  const STATE_LABEL = {
    actual: 'Réel', estimate: 'Estimation', forecast: 'Prévision', derived: 'Calculé', claim: 'Affirmation orale', gap: 'Sources divergentes'
  };
  let _ctx;
  function measure(str, size, weight) {
    _ctx = _ctx || document.createElement('canvas').getContext('2d');
    _ctx.font = (weight || 400) + ' ' + size + 'px system-ui, sans-serif';
    return _ctx.measureText(str).width;
  }
  function trunc(str, max) { return str.length > max ? str.slice(0, max - 1).trimEnd() + '…' : str; }
  function wrapLines(str, width, size, weight) {
    const words = String(str).split(/\s+/), lines = []; let cur = '';
    words.forEach(w => {
      const t = cur ? cur + ' ' + w : w;
      if (measure(t, size, weight) > width && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function tokens(root) {
    const cs = getComputedStyle(root);
    const g = n => cs.getPropertyValue(n).trim();
    return {
      ink: g('--vra-ink'), mid: g('--vra-mid'), lo: g('--vra-lo'), line: g('--vra-line'), bg: g('--vra-bg'),
      c1: g('--vra-c1'), c2: g('--vra-c2'), c3: g('--vra-c3'), c4: g('--vra-c4'), c5: g('--vra-c5'), neg: g('--vra-neg')
    };
  }

  /* ---------- infobulle ---------- */
  let tipEl;
  function tip() {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'vra-tip'; tipEl.setAttribute('role', 'tooltip'); tipEl.hidden = true;
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }
  function showTip(html, x, y) {
    const t = tip(); t.innerHTML = html; t.hidden = false;
    const r = t.getBoundingClientRect();
    const left = Math.max(8, Math.min(innerWidth - r.width - 8, x + 14));
    let top = y - r.height - 12; if (top < 8) top = y + 18;
    t.style.left = left + 'px'; t.style.top = top + 'px';
  }
  function hideTip() { if (tipEl) tipEl.hidden = true; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* rend un élément SVG interactif : tooltip hover/focus, clic → preuve */
  function interactive(sel, info, T) {
    sel.attr('tabindex', 0).attr('role', 'img').style('cursor', 'pointer')
      .attr('data-src', d => info(d).src || null)
      .attr('aria-label', d => { const i = info(d); return [i.title, i.value, i.state ? STATE_LABEL[i.state] : '', i.src ? 'source ' + i.src : ''].filter(Boolean).join(', '); })
      .on('pointermove', (e, d) => showTip(tipHtml(info(d)), e.clientX, e.clientY))
      .on('pointerleave', hideTip)
      .on('focus', function (e, d) { const b = this.getBoundingClientRect(); showTip(tipHtml(info(d)), b.left + b.width / 2, b.top); })
      .on('blur', hideTip);
  }
  function tipHtml(i) {
    return '<strong>' + esc(i.title) + '</strong>' + (i.value ? '<span>' + esc(i.value) + '</span>' : '') +
      (i.detail ? '<em>' + esc(i.detail) + '</em>' : '') +
      '<small>' + (i.state ? esc(STATE_LABEL[i.state]) : '') + (i.src ? ' · ' + esc(i.src) + ' — cliquer pour la source' : '') + '</small>';
  }

  /* ---------- cadre SVG commun ---------- */
  function frame(el, id, h, m) {
    el.innerHTML = '';
    const w = Math.max(300, Math.floor(el.clientWidth || 640));
    const compact = w < 520;
    m = Object.assign({ t: 14, r: compact ? 10 : 22, b: 38, l: compact ? 10 : 22 }, m || {});
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('role', 'group')
      .attr('aria-label', el.getAttribute('aria-label') || '').style('display', 'block').style('overflow', 'visible');
    const defs = svg.append('defs');
    const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);
    return { svg, defs, g, w, h, m, iw: w - m.l - m.r, ih: h - m.t - m.b, compact };
  }
  function addPatterns(defs, id, T) {
    const mk = (name, color, bg) => {
      const p = defs.append('pattern').attr('id', id + '-' + name).attr('width', 7).attr('height', 7).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)');
      p.append('rect').attr('width', 7).attr('height', 7).attr('fill', bg);
      p.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 7).attr('stroke', color).attr('stroke-width', 3);
    };
    mk('forecast', T.c3, T.bg); mk('gap', T.lo, T.bg); mk('claim', T.c4, T.bg);
  }
  /* style visuel redondant par état : couleur + remplissage + contour */
  function stateStyle(state, id, T) {
    switch (state) {
      case 'forecast': return { fill: `url(#${id}-forecast)`, stroke: T.c3, dash: '5 3', sw: 1.6 };
      case 'estimate': return { fill: T.c1, fillOpacity: .5, stroke: T.c1, dash: null, sw: 1.6 };
      case 'derived': return { fill: T.c2, stroke: T.c2, dash: null, sw: 1.6, fillOpacity: .9 };
      case 'claim': return { fill: `url(#${id}-claim)`, stroke: T.c4, dash: '2 3', sw: 1.8 };
      case 'gap': return { fill: `url(#${id}-gap)`, stroke: T.lo, dash: '5 3', sw: 1.6 };
      default: return { fill: T.c1, stroke: T.c1, dash: null, sw: 1.2, fillOpacity: 1 };
    }
  }
  function applyState(sel, state, id, T) {
    sel.each(function (d) {
      const s = stateStyle(typeof state === 'function' ? state(d) : state, id, T);
      d3.select(this).attr('fill', s.fill).attr('fill-opacity', s.fillOpacity == null ? 1 : s.fillOpacity)
        .attr('stroke', s.stroke).attr('stroke-width', s.sw).attr('stroke-dasharray', s.dash);
    });
  }
  function legend(el, states) {
    const old = el.parentNode.querySelector('.fig-legend'); if (old) old.remove();
    const ul = document.createElement('ul'); ul.className = 'fig-legend'; ul.setAttribute('aria-label', 'Légende des états de preuve');
    [...new Set(states)].forEach(s => {
      const li = document.createElement('li'); li.innerHTML = '<i class="sw sw-' + s + '" aria-hidden="true"></i>' + STATE_LABEL[s]; ul.appendChild(li);
    });
    el.after(ul);
  }
  const axisStyle = (g, T) => { g.selectAll('text').attr('fill', T.mid).style('font', '11px var(--vra-sans, system-ui)'); g.selectAll('path,line').attr('stroke', T.line); };

  /* =====================================================================
   *  BARRES HORIZONTALES (bar, diverging-bar) — base zéro
   * ===================================================================== */
  function bars(el, f, T) {
    const id = el.id || 'b' + Math.random().toString(36).slice(2, 7);
    const D = f.data, comp = (el.clientWidth || 640) < 520;
    const labelW = comp ? Math.min(118, (el.clientWidth || 340) * .34) : 220;
    const band = comp ? 46 : 44, h = D.length * band + 40;
    const F = frame(el, id, h, { l: labelW, r: comp ? 52 : 70, t: 6, b: 30 }); addPatterns(F.defs, id, T);
    const div = !!f.diverging;
    const lo = div ? (f.min != null ? f.min : d3.min(D, d => d.value)) : 0, hi = div ? 0 : (f.max != null ? f.max : d3.max(D, d => d.value) * 1.1);
    const x = d3.scaleLinear([lo, hi], [0, F.iw]);
    const y = d3.scaleBand(D.map(d => d.label), [0, D.length * band]).padding(.3);
    const ax = F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(x).ticks(comp ? 4 : 6).tickFormat(v => fmt(v, 0)).tickSizeOuter(0)); axisStyle(ax, T);
    F.g.append('g').selectAll('line').data(x.ticks(comp ? 4 : 6)).join('line').attr('x1', v => x(v)).attr('x2', v => x(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .5);
    F.g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.ink).attr('stroke-width', 1.2);
    D.forEach(d => {
      const lines = wrapLines(d.label, labelW - 12, 12.5, 500);
      const t = F.g.append('text').attr('x', -10).attr('text-anchor', 'end').attr('fill', T.ink).style('font', '500 12.5px var(--vra-sans, system-ui)');
      const cy = y(d.label) + y.bandwidth() / 2 - (lines.length - 1) * 7;
      lines.slice(0, 3).forEach((ln, i) => t.append('tspan').attr('x', -10).attr('y', cy + i * 14.5 + 4).text(ln));
    });
    const rects = F.g.selectAll('rect.bar').data(D).join('rect').attr('class', 'bar')
      .attr('y', d => y(d.label)).attr('height', y.bandwidth()).attr('rx', 2)
      .attr('x', d => div ? x(d.value) : 0).attr('width', d => Math.max(2, Math.abs(x(d.value) - x(0))));
    applyState(rects, d => d.state, id, T);
    if (div) rects.attr('stroke', T.neg).attr('stroke-width', 1.4);
    interactive(rects, d => ({ title: d.label, value: fmt(d.value) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T);
    F.g.selectAll('text.val').data(D).join('text').attr('class', 'val')
      .attr('x', d => div ? x(d.value) - 6 : x(d.value) + 6).attr('y', d => y(d.label) + y.bandwidth() / 2 + 4.5)
      .attr('text-anchor', div ? 'end' : 'start').attr('fill', T.ink).style('font', '600 12.5px var(--vra-mono, ui-monospace)')
      .text(d => fmt(d.value) + (f.unit === '%' ? ' %' : ''));
    legend(el, D.map(d => d.state || 'actual'));
  }

  /* =====================================================================
   *  PLAGES (interval-plot) — fourchettes de guidance
   * ===================================================================== */
  function ranges(el, f, T) {
    const id = el.id || 'r' + Math.random().toString(36).slice(2, 7), D = f.data, comp = (el.clientWidth || 640) < 520;
    const band = D.some(d => d.label.length > 24) ? 54 : 46, labelW = D.some(d => d.label.length > 24) ? (comp ? 120 : 250) : (comp ? 84 : 120);
    const F = frame(el, id, D.length * band + 44, { l: labelW, r: comp ? 20 : 36, t: 6, b: 30 }); addPatterns(F.defs, id, T);
    const x = d3.scaleLinear([0, f.max || d3.max(D, d => d.high) * 1.1], [0, F.iw]);
    const y = d3.scaleBand(D.map(d => d.label), [0, D.length * band]).padding(.35);
    const ax = F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(x).ticks(comp ? 4 : 7).tickFormat(v => fmt(v, 0)).tickSizeOuter(0)); axisStyle(ax, T);
    F.g.append('g').selectAll('line').data(x.ticks(7)).join('line').attr('x1', v => x(v)).attr('x2', v => x(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .5);
    D.forEach(d => { const cy = y(d.label) + y.bandwidth() / 2, lines = wrapLines(d.label, labelW - 12, 12.5, 500).slice(0, 3); const t = F.g.append('text').attr('class', 'lab').attr('fill', T.ink).style('font', '500 12.5px var(--vra-sans, system-ui)'); lines.forEach((ln, i) => t.append('tspan').attr('x', -10).attr('text-anchor', 'end').attr('y', cy - (lines.length - 1) * 7 + i * 14.5 + 4).text(ln)); });
    const bars_ = F.g.selectAll('rect.rg').data(D).join('rect').attr('class', 'rg').attr('x', d => x(d.low) - (d.low === d.high ? 5 : 0)).attr('width', d => d.low === d.high ? 10 : x(d.high) - x(d.low))
      .attr('y', d => y(d.label)).attr('height', y.bandwidth()).attr('rx', 2);
    applyState(bars_, d => d.state, id, T);
    interactive(bars_, d => ({ title: d.label, value: d.low === d.high ? '≈ ' + fmt(d.low, 0) + ' ' + f.unit : fmt(d.low, 0) + '–' + fmt(d.high, 0) + ' ' + f.unit, state: d.state, src: d.src, detail: d.note }), T);
    F.g.selectAll('text.val').data(D).join('text').attr('class', 'val').attr('x', d => x(d.high) + 12).attr('y', d => y(d.label) + y.bandwidth() / 2 + 4.5)
      .attr('fill', T.ink).style('font', '600 12px var(--vra-mono, ui-monospace)').text(d => d.low === d.high ? '≈ ' + fmt(d.low, 0) : fmt(d.low, 0) + '–' + fmt(d.high, 0));
    legend(el, D.map(d => d.state));
  }

  /* =====================================================================
   *  COURBE DE RENDEMENT (line, courbe dérivée p^n)
   * ===================================================================== */
  function yieldChart(el, f, T) {
    const id = el.id || 'y', comp = (el.clientWidth || 640) < 520;
    const F = frame(el, id, comp ? 300 : 360, { l: comp ? 38 : 52, b: 52, t: 18 }); addPatterns(F.defs, id, T);
    const n = f.steps, X = d3.scaleLinear([0, 500], [0, F.iw]), Y = d3.scaleLinear([0, 100], [F.ih, 0]);
    const Yf = ppm => 100 * Math.pow(1 - ppm / 1e6, n);
    const pts = d3.range(0, 501, 5).map(p => ({ p, y: Yf(p) }));
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickFormat(v => v + ' %').tickSizeOuter(0).tickSize(-F.iw)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .5); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 5 : 10).tickSizeOuter(0)), T);
    F.g.append('text').attr('x', F.iw / 2).attr('y', F.ih + 40).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', '12px var(--vra-sans, system-ui)').text('Taux d\'échec par étape (parties par million) →  moins fiable');
    F.g.append('path').datum(pts).attr('d', d3.area().x(d => X(d.p)).y0(F.ih).y1(d => Y(d.y))).attr('fill', T.c1).attr('fill-opacity', .08);
    F.g.append('path').datum(pts).attr('d', d3.line().x(d => X(d.p)).y(d => Y(d.y))).attr('fill', 'none').attr('stroke', T.c1).attr('stroke-width', 2.4);
    const P = f.points.map(p => ({ ...p, y: Yf(p.fail_ppm), state: 'derived' }));
    P.forEach(p => {
      F.g.append('line').attr('x1', X(p.fail_ppm)).attr('x2', X(p.fail_ppm)).attr('y1', Y(p.y)).attr('y2', F.ih).attr('stroke', T.c3).attr('stroke-dasharray', '4 3');
      F.g.append('line').attr('x1', 0).attr('x2', X(p.fail_ppm)).attr('y1', Y(p.y)).attr('y2', Y(p.y)).attr('stroke', T.c3).attr('stroke-dasharray', '4 3');
    });
    const dots = F.g.selectAll('circle.pt').data(P).join('circle').attr('class', 'pt').attr('cx', d => X(d.fail_ppm)).attr('cy', d => Y(d.y)).attr('r', 7).attr('fill', T.bg).attr('stroke', T.c3).attr('stroke-width', 3);
    interactive(dots, d => ({ title: d.label, value: fmt(d.y, 1) + ' % de puces bonnes', detail: 'Rendement = p^1500', state: 'derived', src: d.src }), T);
    P.forEach((p, i) => {
      const t1 = fmt(p.y, 1) + ' % de puces bonnes', flip = X(p.fail_ppm) + 12 + Math.max(measure(t1, 13, 600), measure(p.label, 12, 400)) > F.iw;
      F.g.append('text').attr('x', X(p.fail_ppm) + (flip ? -12 : 12)).attr('text-anchor', flip ? 'end' : 'start').attr('y', Y(p.y) - 12).attr('fill', T.ink).style('font', '600 13px var(--vra-sans, system-ui)')
        .text(t1);
      F.g.append('text').attr('x', X(p.fail_ppm) + (flip ? -12 : 12)).attr('text-anchor', flip ? 'end' : 'start').attr('y', Y(p.y) + 4).attr('fill', T.mid).style('font', '12px var(--vra-sans, system-ui)').text(p.label);
    });
    legend(el, ['derived']);
  }

  /* =====================================================================
   *  COURBE EN ESCALIER (step-line)
   * ===================================================================== */
  function step(el, f, T) {
    const id = el.id || 's', comp = (el.clientWidth || 640) < 520;
    const D = f.data.map(d => ({ ...d, t: new Date(d.date) }));
    const F = frame(el, id, comp ? 300 : 360, { l: comp ? 38 : 48, t: 22, r: comp ? 20 : 34 }); addPatterns(F.defs, id, T);
    const X = d3.scaleTime([new Date(f.from || '2020-01-01'), new Date(f.to || '2027-01-01')], [0, F.iw]), Y = d3.scaleLinear([0, f.ymax || 300], [F.ih, 0]);
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .5); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(f.ticks || d3.timeYear.every(1)).tickFormat(d3.timeFormat(f.tickFormat || '%Y')).tickSizeOuter(0)), T);
    const ext = D.concat([{ t: new Date(f.to || '2026-12-31'), value: D[D.length - 1].value }]);
    F.g.append('path').datum(ext).attr('d', d3.area().curve(d3.curveStepAfter).x(d => X(d.t)).y0(F.ih).y1(d => Y(d.value))).attr('fill', T.c1).attr('fill-opacity', .08);
    F.g.append('path').datum(ext).attr('d', d3.line().curve(d3.curveStepAfter).x(d => X(d.t)).y(d => Y(d.value))).attr('fill', 'none').attr('stroke', T.c1).attr('stroke-width', 2.4);
    const dots = F.g.selectAll('circle').data(D).join('circle').attr('cx', d => X(d.t)).attr('cy', d => Y(d.value)).attr('r', 6).attr('fill', T.c1).attr('stroke', T.bg).attr('stroke-width', 2);
    interactive(dots, d => ({ title: d.label, value: fmt(d.value, 0) + ' ' + (f.unit || 'Md$'), state: d.state || 'actual', src: d.src, detail: d.note || f.detail || '' }), T);
    F.g.selectAll('text.v').data(D).join('text').attr('class', 'v').attr('x', d => X(d.t)).attr('y', d => Y(d.value) - 12).attr('text-anchor', (d, i) => i === D.length - 1 ? 'end' : 'middle').attr('fill', T.ink).style('font', '600 12.5px var(--vra-mono, ui-monospace)').text(d => fmt(d.value, 0));
    legend(el, D.map(d => d.state || 'actual'));
  }

  /* =====================================================================
   *  COURBE AVEC PRÉVISION (réel plein, prévision pointillée + marqueurs creux)
   * ===================================================================== */
  function forecastline(el, f, T) {
    const id = el.id || 'fl', comp = (el.clientWidth || 640) < 520, D = f.data;
    const F = frame(el, id, comp ? 300 : 360, { l: comp ? 44 : 56, t: 22, r: comp ? 28 : 56 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([2023, 2036], [0, F.iw]), Y = d3.scaleLinear([0, 1400], [F.ih, 0]);
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickFormat(v => fmt(v, 0)).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .5); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).tickValues([2024, 2026, 2028, 2030, 2032, 2035]).tickFormat(d3.format('d')).tickSizeOuter(0)), T);
    F.g.append('rect').attr('x', X(2030)).attr('width', X(2036) - X(2030)).attr('y', 0).attr('height', F.ih).attr('fill', T.c3).attr('fill-opacity', .05);
    F.g.append('text').attr('x', comp ? F.iw : X(2030) + 8).attr('text-anchor', comp ? 'end' : 'start').attr('y', 14).attr('fill', T.c3).style('font', '600 11px var(--vra-sans, system-ui)').text(comp ? 'Plus incertain après 2030' : 'Incertitude croissante après 2030 (AIE)');
    F.g.append('path').datum(D.slice(0, 2)).attr('d', d3.line().x(d => X(d.year)).y(d => Y(d.value))).attr('fill', 'none').attr('stroke', T.c3).attr('stroke-width', 2.4).attr('stroke-dasharray', '6 4');
    F.g.append('path').datum(D.slice(1)).attr('d', d3.line().x(d => X(d.year)).y(d => Y(d.value))).attr('fill', 'none').attr('stroke', T.c3).attr('stroke-width', 2.4).attr('stroke-dasharray', '6 4');
    const dots = F.g.selectAll('circle').data(D).join('circle').attr('cx', d => X(d.year)).attr('cy', d => Y(d.value)).attr('r', 7).attr('stroke-width', 2.6)
      .attr('fill', d => d.state === 'actual' ? T.c1 : T.bg).attr('stroke', d => d.state === 'actual' ? T.c1 : T.c3);
    interactive(dots, d => ({ title: String(d.year), value: fmt(d.value, 0) + ' TWh', state: d.state, src: d.src, detail: d.state === 'actual' ? 'Estimation de l\'AIE pour 2024' : 'Scénario de base de l\'AIE' }), T);
    F.g.selectAll('text.v').data(D).join('text').attr('class', 'v').attr('x', d => X(d.year)).attr('y', d => Y(d.value) - 14).attr('text-anchor', (d, i) => i === 0 ? 'start' : i === D.length - 1 ? 'end' : 'middle').attr('fill', T.ink).style('font', '600 13px var(--vra-mono, ui-monospace)').text(d => fmt(d.value, 0) + ' TWh');
    legend(el, ['actual', 'forecast']);
  }

  /* =====================================================================
   *  PENTE (slopegraph)
   * ===================================================================== */
  function slope(el, f, T) {
    const id = el.id || 'sl', comp = (el.clientWidth || 640) < 520, D = f.data;
    const F = frame(el, id, 260, { l: comp ? 20 : 60, r: comp ? 20 : 60, t: 40, b: 30 });
    const xl = F.iw * .22, xr = F.iw * .78, Y = d3.scaleLinear([f.min != null ? f.min : -24, f.max != null ? f.max : 0], [F.ih, 0]);
    [[xl, f.left], [xr, f.right]].forEach(([x, t]) => {
      F.g.append('line').attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.line);
      F.g.append('text').attr('x', x).attr('y', -16).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', '600 12px var(--vra-sans, system-ui)').text(t);
    });
    if (f.parity !== false) {
      F.g.append('line').attr('x1', xl - 20).attr('x2', xr + 20).attr('y1', Y(0)).attr('y2', Y(0)).attr('stroke', T.ink).attr('stroke-width', 1.2);
      F.g.append('text').attr('x', xr + 26).attr('y', Y(0) + 4).attr('fill', T.mid).style('font', '11px var(--vra-sans, system-ui)').text('parité');
    }
    D.forEach(d => {
      const ln = F.g.append('line').datum(d).attr('x1', xl).attr('x2', xr).attr('y1', Y(d.start)).attr('y2', Y(d.end)).attr('stroke', f.neutral ? T.c3 : T.neg).attr('stroke-width', 3.2).attr('stroke-dasharray', '1 0');
      interactive(ln, d => ({ title: d.label, value: d.start + ' % → ' + d.end + ' %', state: d.state, src: d.src, detail: d.note }), T);
      [[xl, d.start, 'end', -10], [xr, d.end, 'start', 10]].forEach(([x, v, a, dx]) => {
        F.g.append('circle').attr('cx', x).attr('cy', Y(v)).attr('r', 6).attr('fill', f.neutral ? T.c3 : T.neg);
        F.g.append('text').attr('x', x + dx).attr('y', Y(v) + 5).attr('text-anchor', a).attr('fill', T.ink).style('font', '700 14px var(--vra-mono, ui-monospace)').text(fmt(v, 0) + ' %');
      });
    });
    F.g.append('text').attr('x', F.iw / 2).attr('y', F.ih + 24).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', '12px var(--vra-sans, system-ui)').text(D[0].label);
    legend(el, [D[0].state || 'estimate']);
  }


  /* =====================================================================
   *  LOLLIPOP (valeurs ponctuelles, bornes basses, fourchettes) — probabilités subjectives
   * ===================================================================== */
  function lollipop(el, f, T) {
    const id = el.id || 'lp', D = f.data, comp = (el.clientWidth || 640) < 520;
    const band = comp ? 54 : 46, labelW = comp ? 120 : 250;
    const F = frame(el, id, D.length * band + 44, { l: labelW, r: comp ? 16 : 40, t: 6, b: 32 }); addPatterns(F.defs, id, T);
    const x = d3.scaleLinear([0, 100], [0, F.iw]);
    const y = d3.scaleBand(D.map(d => d.label), [0, D.length * band]).padding(.3);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(x).ticks(comp ? 5 : 10).tickFormat(v => v + ' %').tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(x.ticks(10)).join('line').attr('x1', v => x(v)).attr('x2', v => x(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .5);
    D.forEach(d => {
      const cy = y(d.label) + y.bandwidth() / 2, lines = wrapLines(d.label, labelW - 12, 12.5, 600);
      const t = F.g.append('text').attr('fill', T.ink).style('font', '600 12.5px var(--vra-sans, system-ui)');
      lines.slice(0, 3).forEach((ln, i) => t.append('tspan').attr('x', -10).attr('text-anchor', 'end').attr('y', cy - (Math.min(lines.length, 3) - 1) * 7 + i * 14.5 + 4).text(ln));
    });
    const g = F.g.selectAll('g.lp').data(D).join('g').attr('class', 'lp');
    g.each(function (d) {
      const gg = d3.select(this), cy = y(d.label) + y.bandwidth() / 2, lo = x(d.value), hi = d.high != null ? x(d.high) : lo;
      const st = stateStyle(d.state, id, T);
      gg.append('line').attr('x1', x(0)).attr('x2', hi).attr('y1', cy).attr('y2', cy).attr('stroke', T.lo).attr('stroke-width', 1.4);
      if (d.high != null) gg.append('rect').attr('x', lo).attr('width', hi - lo).attr('y', cy - 9).attr('height', 18).attr('rx', 3).attr('fill', st.fill).attr('fill-opacity', st.fillOpacity == null ? 1 : st.fillOpacity).attr('stroke', st.stroke).attr('stroke-width', st.sw).attr('stroke-dasharray', st.dash);
      else gg.append('circle').attr('cx', lo).attr('cy', cy).attr('r', 8).attr('fill', st.fill).attr('fill-opacity', st.fillOpacity == null ? 1 : st.fillOpacity).attr('stroke', st.stroke).attr('stroke-width', st.sw + .6).attr('stroke-dasharray', st.dash);
      if (d.bound === 'min') gg.append('path').attr('d', `M${lo + 12},${cy - 6}L${lo + 24},${cy}L${lo + 12},${cy + 6}`).attr('fill', 'none').attr('stroke', st.stroke).attr('stroke-width', 2);
      const txt = (d.bound === 'min' ? '≥ ' : '') + fmt(d.value, 0) + (d.high != null ? '–' + fmt(d.high, 0) : '') + ' %';
      gg.append('text').attr('x', (d.bound === 'min' ? lo + 30 : hi + 12)).attr('y', cy + 4.5).attr('fill', T.ink).style('font', '700 12.5px var(--vra-mono, ui-monospace)').text(txt);
    });
    const hit = F.g.selectAll('rect.hit').data(D).join('rect').attr('class', 'hit').attr('x', 0).attr('width', F.iw).attr('y', d => y(d.label)).attr('height', y.bandwidth()).attr('fill', 'transparent');
    interactive(hit, d => ({ title: d.label, value: (d.bound === 'min' ? '≥ ' : '') + fmt(d.value, 0) + (d.high != null ? '–' + fmt(d.high, 0) : '') + ' %', detail: d.note, state: d.state, src: d.src }), T);
    legend(el, D.map(d => d.state || 'estimate'));
  }

  /* =====================================================================
   *  QUADRANT (positionnement qualitatif sur deux axes)
   * ===================================================================== */
  function quadrant(el, f, T) {
    const id = el.id || 'qd', W = Math.max(300, el.clientWidth || 640), comp = W < 560, H = comp ? 520 : 560;
    const F = frame(el, id, H + (comp ? 24 : 0), { l: comp ? 12 : 30, r: comp ? 12 : 30, t: 26, b: comp ? 54 : 30 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([-1.1, 1.1], [0, F.iw]), Y = d3.scaleLinear([-1.1, 1.1], [F.ih, 0]);
    F.g.append('rect').attr('x', 0).attr('y', 0).attr('width', F.iw).attr('height', F.ih).attr('fill', 'none').attr('stroke', T.line);
    F.g.append('line').attr('x1', X(0)).attr('x2', X(0)).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.line).attr('stroke-dasharray', '4 4');
    F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(0)).attr('y2', Y(0)).attr('stroke', T.line).attr('stroke-dasharray', '4 4');
    const lab = (t, x, y, a, rot) => F.g.append('text').attr('x', x).attr('y', y).attr('text-anchor', a).attr('fill', T.mid).style('font', '600 10.5px var(--vra-sans, system-ui)').style('text-transform', 'uppercase').style('letter-spacing', '.06em').text(t);
    lab(comp && f.xminShort ? f.xminShort : f.xmin, 6, F.ih - 8, 'start'); lab(comp && f.xmaxShort ? f.xmaxShort : f.xmax, F.iw - 6, F.ih - 8, 'end'); lab(f.ymax, 6, 14, 'start'); lab(f.ymin, 6, F.ih - 24, 'start');
    const xl = F.g.append('text').attr('fill', T.mid).style('font', '11.5px var(--vra-sans, system-ui)');
    wrapLines(f.xlabel, F.iw - 8, 11.5, 400).forEach((ln, i) => xl.append('tspan').attr('x', F.iw / 2).attr('text-anchor', 'middle').attr('y', F.ih + 22 + i * 14).text(ln));
    const D = f.data.map(d => ({ ...d }));
    const dots = F.g.selectAll('g.pt').data(D).join('g').attr('class', 'pt').attr('transform', d => `translate(${X(d.x)},${Y(d.y)})`);
    dots.append('circle').attr('r', comp ? 6 : 7).attr('fill', d => d.cat === 'lab' ? T.c1 : d.cat === 'gov' ? T.c3 : T.c5).attr('fill-opacity', .85).attr('stroke', T.bg).attr('stroke-width', 1.6);
    const anch = d => comp ? (d.x > 0.05 ? 'end' : 'start') : (d.anchor === 'end' ? 'end' : 'start');
    dots.append('text').attr('x', d => anch(d) === 'end' ? -11 : 11).attr('y', d => (d.dy || 0) + 4).attr('text-anchor', anch).attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 3).attr('paint-order', 'stroke').style('font', '600 12px var(--vra-sans, system-ui)').text(d => d.label);
    interactive(dots, d => ({ title: d.label, detail: d.note, state: 'estimate', src: d.src }), T);
    const leg = document.createElement('ul'); leg.className = 'fig-legend';
    [['lab', 'Laboratoire ou dirigeant du secteur', T.c1], ['gov', 'Gouvernement ou élu', T.c3], ['voice', 'Autre voix', T.c5]].forEach(([k, l, c]) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="${c}"/></svg>` + l; leg.appendChild(li); });
    const old = el.parentNode.querySelector('.fig-legend'); if (old) old.remove(); el.after(leg);
  }

  /* =====================================================================
   *  SANKEY (poids réels, 3 colonnes)
   * ===================================================================== */
  function sankey(el, f, T) {
    const id = el.id || 'sk', comp = (el.clientWidth || 640) < 520;
    const F = frame(el, id, comp ? 330 : 360, { t: 30, b: 14, l: comp ? 6 : 14, r: comp ? 120 : 240 }); addPatterns(F.defs, id, T);
    const nodes = f.nodes.map(n => ({ ...n })), by = Object.fromEntries(nodes.map(n => [n.id, n]));
    f.links.forEach(l => { by[l.s].out = (by[l.s].out || 0) + l.v; by[l.t].in = (by[l.t].in || 0) + l.v; });
    nodes.forEach(n => n.val = Math.max(n.out || 0, n.in || 0));
    const cols = d3.groups(nodes, n => n.col).sort((a, b) => a[0] - b[0]), gap = 18;
    const maxCol = d3.max(cols, c => d3.sum(c[1], n => n.val) + gap * (c[1].length - 1));
    const k = (F.ih - 4) / Math.max(1, d3.max(cols, c => d3.sum(c[1], n => n.val)) + 0), nw = comp ? 12 : 16;
    const scale = Math.min(k, (F.ih - gap * 2) / d3.max(cols, c => d3.sum(c[1], n => n.val)));
    cols.forEach(([ci, arr]) => {
      let y = 0; arr.forEach(n => { n.x = ci * (F.iw - nw) / (cols.length - 1); n.y = y; n.h = Math.max(3, n.val * scale); y += n.h + gap; n.so = 0; n.to = 0; });
    });
    const links = f.links.map(l => ({ ...l, S: by[l.s], T: by[l.t], w: l.v * scale }));
    links.forEach(l => { l.sy = l.S.y + l.S.so; l.S.so += l.w; });
    links.forEach(l => { l.ty = l.T.y + l.T.to; l.T.to += l.w; });
    const path = l => { const x0 = l.S.x + nw, x1 = l.T.x, xm = (x0 + x1) / 2; return `M${x0},${l.sy}C${xm},${l.sy} ${xm},${l.ty} ${x1},${l.ty}L${x1},${l.ty + l.w}C${xm},${l.ty + l.w} ${xm},${l.sy + l.w} ${x0},${l.sy + l.w}Z`; };
    const lp = F.g.selectAll('path.lk').data(links).join('path').attr('class', 'lk').attr('d', path);
    applyState(lp, l => l.state || 'actual', id, T); lp.attr('fill-opacity', .38);
    interactive(lp, l => ({ title: l.S.label.replace(/ [\d,]+.*$/, '') + ' → ' + l.T.label.replace(/ [\d,]+.*$/, ''), value: fmt(l.v) + ' Md$', state: l.state || 'actual', src: l.src }), T);
    const rn = F.g.selectAll('rect.nd').data(nodes).join('rect').attr('class', 'nd').attr('x', n => n.x).attr('y', n => n.y).attr('width', nw).attr('height', n => n.h).attr('rx', 2);
    applyState(rn, n => n.state || 'actual', id, T); rn.attr('fill-opacity', 1);
    interactive(rn, n => ({ title: n.label, state: n.state || 'actual', src: n.src }), T);
    nodes.forEach(n => {
      const term = !n.out, right = n.col === cols.length - 1 || term;
      const lab = comp && n.short ? n.short : n.label;
      const lines = wrapLines(lab, right ? (comp ? 108 : 230) : 200, 12.5, 600);
      const t = F.g.append('text').attr('fill', T.ink).style('font', '600 12.5px var(--vra-sans, system-ui)');
      if (right) lines.forEach((ln, i) => t.append('tspan').attr('x', n.x + nw + 8).attr('y', n.y + n.h / 2 + 4 + (i - (lines.length - 1) / 2) * 14.5).text(ln));
      else t.append('tspan').attr('x', n.x).attr('y', n.y - 8).text(lab);
    });
    legend(el, links.map(l => l.state || 'actual'));
  }

  /* =====================================================================
   *  CHAÎNE DE DÉPENDANCES EN COUCHES (dependency-graph)
   * ===================================================================== */
  function layers(el, f, T) {
    const id = el.id || 'ly', W = Math.max(300, el.clientWidth || 640), comp = W < 700;
    el.innerHTML = '';
    const L = f.layers.length, nodes = f.nodes.map(n => ({ ...n })), by = Object.fromEntries(nodes.map(n => [n.id, n]));
    const links = f.links.map((l, i) => ({ ...l, i, S: by[l.s], T: by[l.t] }));
    let H; const layerY = [];
    const nh = 34;
    if (!comp) {
      const colW = (W - 24) / L, nw = Math.min(150, colW - 32), per = d3.max(f.layers.map((_, i) => nodes.filter(n => n.layer === i).length));
      H = per * 46 + 56;
      f.layers.forEach((_, li) => nodes.filter(n => n.layer === li).forEach((n, i, a) => {
        n.w = nw; n.h = nh; n.x = 12 + li * colW + (colW - nw) / 2; const span = H - 56; n.y = 40 + (span - a.length * 46) / 2 + i * 46 + 6;
      }));
    } else {
      const nw = Math.floor((W - 36) / 2), rows = f.layers.map((_, li) => Math.ceil(nodes.filter(n => n.layer === li).length / 2));
      let y = 8; f.layers.forEach((_, li) => {
        const arr = nodes.filter(n => n.layer === li); y += 24;
        arr.forEach((n, i) => { n.w = nw; n.h = nh; n.x = 12 + (i % 2) * (nw + 12); n.y = y + Math.floor(i / 2) * 44; });
        y += rows[li] * 44 + 22; layerY[li] = y;
      }); H = y;
    }
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'group').style('display', 'block').style('overflow', 'visible');
    svg.append('defs').append('marker').attr('id', id + '-ar').attr('viewBox', '0 0 8 8').attr('refX', 7).attr('refY', 4).attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto').append('path').attr('d', 'M0,0L8,4L0,8Z').attr('fill', T.mid);
    const colors = ['c1', 'c2', 'c3', 'c5'];
    if (!comp) {
      const colW = (W - 24) / L;
      f.layers.forEach((t, i) => svg.append('text').attr('x', 12 + i * colW + colW / 2).attr('y', 18).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', '600 11.5px var(--vra-sans, system-ui)').style('text-transform', 'uppercase').style('letter-spacing', '.06em').text(t));
    } else {
      let yy = 8; f.layers.forEach((t, li) => { svg.append('text').attr('x', 12).attr('y', yy + 14).attr('fill', T.mid).style('font', '600 11px var(--vra-sans, system-ui)').style('text-transform', 'uppercase').style('letter-spacing', '.06em').text(t); yy = layerY[li]; });
    }
    const gl = svg.append('g').attr('fill', 'none');
    const lp = gl.selectAll('path').data(comp ? [] : links).join('path').attr('stroke', T.mid).attr('stroke-opacity', .38).attr('stroke-width', 1.4).attr('marker-end', `url(#${id}-ar)`)
      .attr('d', l => {
        if (!comp) { const x0 = l.S.x + l.S.w, y0 = l.S.y + l.S.h / 2, x1 = l.T.x - 2, y1 = l.T.y + l.T.h / 2, xm = (x0 + x1) / 2; return `M${x0},${y0}C${xm},${y0} ${xm},${y1} ${x1},${y1}`; }
        const x0 = l.S.x + l.S.w / 2, y0 = l.S.y + l.S.h, x1 = l.T.x + l.T.w / 2, y1 = l.T.y - 2, ym = (y0 + y1) / 2; return `M${x0},${y0}C${x0},${ym} ${x1},${ym} ${x1},${y1}`;
      });
    interactive(lp, l => ({ title: l.S.label + ' → ' + l.T.label, detail: l.d }), T);
    const ng = svg.append('g').selectAll('g').data(nodes).join('g').attr('transform', n => `translate(${n.x},${n.y})`);
    const rc = ng.append('rect').attr('width', n => n.w).attr('height', n => n.h).attr('rx', 5).attr('fill', T.bg).attr('stroke', n => T[colors[n.layer]]).attr('stroke-width', 2);
    ng.append('text').attr('x', n => n.w / 2).attr('y', n => n.h / 2 + 4.5).attr('text-anchor', 'middle').attr('fill', T.ink).style('font', '600 12px var(--vra-sans, system-ui)').text(n => trunc(n.label, Math.floor(n.w / 6.6)));
    interactive(ng, n => ({ title: n.label, detail: links.filter(l => l.s === n.id || l.t === n.id).length + ' liens — survoler pour isoler', src: n.src }), T);
    const hi = n => {
      const on = new Set([n.id]); links.forEach(l => { if (l.s === n.id || l.t === n.id) { on.add(l.s); on.add(l.t); } });
      lp.attr('stroke-opacity', l => (l.s === n.id || l.t === n.id) ? .95 : .08).attr('stroke-width', l => (l.s === n.id || l.t === n.id) ? 2.4 : 1.2);
      ng.attr('opacity', m => on.has(m.id) ? 1 : .3);
    };
    const lo = () => { lp.attr('stroke-opacity', .38).attr('stroke-width', 1.4); ng.attr('opacity', 1); };
    ng.on('mouseenter.hl', (e, n) => hi(n)).on('mouseleave.hl', lo).on('focus.hl', (e, n) => hi(n)).on('blur.hl', lo);
    if (comp) {
      const ul = document.createElement('ul'); ul.className = 'fig-links'; ul.setAttribute('aria-label', 'Liens de dépendance');
      links.forEach(l => { const li = document.createElement('li'); li.innerHTML = '<b>' + esc(l.S.label) + ' → ' + esc(l.T.label) + '</b> ' + esc(l.d); ul.appendChild(li); });
      el.appendChild(ul);
    }
  }

  /* =====================================================================
   *  TOILE EN ANNEAU (réseau d'engagements)
   * ===================================================================== */
  function ring(el, f, T) {
    const id = el.id || 'rg', W = Math.max(300, el.clientWidth || 640), comp = W < 520, H = comp ? 400 : 470;
    el.innerHTML = '';
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'group').style('display', 'block').style('overflow', 'visible');
    const KIND = { capital: { c: T.c1, d: null, l: 'Capital' }, calcul: { c: T.c3, d: '7 4', l: 'Capacité de calcul' }, achat: { c: T.c4, d: '2 4', l: 'Achat de puces' }, fabrication: { c: T.c2, d: '10 3 2 3', l: 'Fabrication' }, garantie: { c: T.neg, d: '2 2', l: 'Garantie de financement' } };
    const defs = svg.append('defs');
    Object.entries(KIND).forEach(([k, v]) => defs.append('marker').attr('id', `${id}-${k}`).attr('viewBox', '0 0 8 8').attr('refX', 7).attr('refY', 4).attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto').append('path').attr('d', 'M0,0L8,4L0,8Z').attr('fill', v.c));
    const cx = W / 2, cy = H / 2 - 6, R = Math.min(W / 2 - (comp ? 62 : 96), H / 2 - 52);
    const nodes = f.nodes.map((n, i) => ({ ...n, a: -Math.PI / 2 + i * 2 * Math.PI / f.nodes.length })); nodes.forEach(n => { n.x = cx + R * Math.cos(n.a); n.y = cy + R * Math.sin(n.a); });
    const by = Object.fromEntries(nodes.map(n => [n.id, n]));
    const seen = {};
    const links = f.links.map(l => { const key = [l.s, l.t].sort().join('|'); const k = seen[key] = (seen[key] == null ? 0 : seen[key] + 1); return { ...l, k, S: by[l.s], T: by[l.t] }; });
    const NR = comp ? 24 : 30;
    const lp = svg.append('g').attr('fill', 'none').selectAll('path').data(links).join('path').attr('stroke', l => KIND[l.kind].c).attr('stroke-width', 2.2).attr('stroke-dasharray', l => KIND[l.kind].d).attr('stroke-opacity', .85).attr('marker-end', l => `url(#${id}-${l.kind})`)
      .attr('d', l => {
        const dx = l.T.x - l.S.x, dy = l.T.y - l.S.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
        const x0 = l.S.x + ux * NR, y0 = l.S.y + uy * NR, x1 = l.T.x - ux * (NR + 6), y1 = l.T.y - uy * (NR + 6);
        const sh = (l.k || 0) * 34; const mx = (x0 + x1) / 2 * .5 + cx * .5 - uy * sh, my = (y0 + y1) / 2 * .5 + cy * .5 + ux * sh; return `M${x0},${y0}Q${mx},${my} ${x1},${y1}`;
      });
    interactive(lp, l => ({ title: l.S.label + ' → ' + l.T.label, value: KIND[l.kind].l, detail: l.d, src: l.src }), T);
    lp.each(function () { d3.select(this).style('outline', 'none'); });
    const ng = svg.append('g').selectAll('g').data(nodes).join('g').attr('transform', n => `translate(${n.x},${n.y})`);
    ng.append('circle').attr('r', NR).attr('fill', T.bg).attr('stroke', T.ink).attr('stroke-width', 2);
    ng.append('text').attr('y', 4.5).attr('text-anchor', 'middle').attr('fill', T.ink).style('font', `700 ${comp ? 9.5 : 11.5}px var(--vra-sans, system-ui)`).text(n => n.label.length > 8 && comp ? n.label.slice(0, 7) + '.' : n.label);
    interactive(ng, n => ({ title: n.label, detail: links.filter(l => l.s === n.id || l.t === n.id).length + ' liens', src: n.src }), T);
    const hi = n => lp.attr('stroke-opacity', l => (l.s === n.id || l.t === n.id) ? 1 : .08);
    ng.on('mouseenter.hl', (e, n) => hi(n)).on('focus.hl', (e, n) => hi(n)).on('mouseleave.hl blur.hl', () => lp.attr('stroke-opacity', .85));
    const leg = document.createElement('ul'); leg.className = 'fig-legend';
    Object.values(KIND).forEach(k => { const li = document.createElement('li'); li.innerHTML = `<svg width="30" height="10" aria-hidden="true"><line x1="0" y1="5" x2="30" y2="5" stroke="${k.c}" stroke-width="2.4" ${k.d ? `stroke-dasharray="${k.d}"` : ''}/></svg>` + k.l; leg.appendChild(li); });
    const old = el.parentNode.querySelector('.fig-legend'); if (old) old.remove(); el.after(leg);
  }

  /* =====================================================================
   *  FRISE (gantt / milestone) avec placement anti-collision
   * ===================================================================== */
  function timeline(el, f, T) {
    const id = el.id || 'tl', W = Math.max(300, el.clientWidth || 640), comp = W < 520;
    el.innerHTML = '';
    const M = { l: comp ? 10 : 16, r: comp ? 14 : 20 }, from = new Date(f.from), to = new Date(f.to);
    const X = d3.scaleTime([from, to], [M.l, W - M.r]), fs = comp ? 11 : 12, RH = comp ? 19 : 20, maxChar = comp ? 26 : 44;
    let y = 4; const out = [];
    f.lanes.forEach(lane => {
      const items = f.items.filter(i => i.lane === lane).map(i => ({ ...i, a: new Date(i.start), b: i.end ? new Date(i.end) : null })).sort((p, q) => p.a - q.a);
      const rowsEnd = [];
      items.forEach(it => {
        it.lbl = trunc(it.label, maxChar); it.tw = measure(it.lbl, fs, 600);
        const x0 = X(it.a), x1 = it.b ? X(it.b) : x0;
        const inside = it.b && (x1 - x0) > it.tw + 14;
        let lx0, lx1, anchor;
        if (inside) { lx0 = x0 + 6; lx1 = lx0 + it.tw; anchor = 'start'; }
        else if (x1 + 8 + it.tw <= W - M.r) { lx0 = x1 + 8; lx1 = lx0 + it.tw; anchor = 'start'; }
        else { lx1 = x0 - 8; lx0 = lx1 - it.tw; anchor = 'end'; if (lx0 < M.l) { lx0 = M.l; lx1 = lx0 + it.tw; anchor = 'start'; } }
        const bx0 = Math.min(x0, lx0), bx1 = Math.max(x1, lx1);
        let r = 0; while (rowsEnd[r] != null && rowsEnd[r] > bx0 - 6) r++;
        rowsEnd[r] = bx1; it.row = r; it.lx = anchor === 'start' ? lx0 : lx1; it.anchor = anchor; it.inside = inside; it.x0 = x0; it.x1 = x1;
      });
      const nrow = Math.max(1, rowsEnd.length);
      out.push({ lane, items, y0: y, nrow }); y += 24 + nrow * RH + 10;
    });
    const H = y + 30;
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'group').style('display', 'block').style('overflow', 'visible');
    const defs = svg.append('defs'); addPatterns(defs, id, T);
    const gx = svg.append('g').attr('transform', `translate(0,${H - 28})`).call(d3.axisBottom(X).ticks(W < 520 ? 4 : 8).tickSizeOuter(0)); axisStyle(gx, T);
    const today = new Date('2026-10-01');
    if (today > from && today < to) {
      svg.append('line').attr('x1', X(today)).attr('x2', X(today)).attr('y1', 0).attr('y2', H - 28).attr('stroke', T.neg).attr('stroke-dasharray', '3 3').attr('stroke-opacity', .8);
      svg.append('text').attr('x', X(today) + 4).attr('y', H - 34).attr('fill', T.neg).style('font', '600 10.5px var(--vra-sans, system-ui)').text('Aujourd\'hui');
    }
    out.forEach((L, li) => {
      svg.append('line').attr('x1', M.l).attr('x2', W - M.r).attr('y1', L.y0 + 18).attr('y2', L.y0 + 18).attr('stroke', T.line);
      svg.append('text').attr('x', M.l).attr('y', L.y0 + 13).attr('fill', T.mid).style('font', '600 11px var(--vra-sans, system-ui)').style('text-transform', 'uppercase').style('letter-spacing', '.07em').text(L.lane);
      const g = svg.append('g');
      const rowY = it => L.y0 + 26 + it.row * RH;
      const sp = g.selectAll('rect.sp').data(L.items.filter(i => i.b)).join('rect').attr('class', 'sp').attr('x', i => i.x0).attr('width', i => Math.max(6, i.x1 - i.x0)).attr('y', i => rowY(i)).attr('height', RH - 5).attr('rx', 3);
      applyState(sp, i => i.state || 'actual', id, T);
      const ev = g.selectAll('path.ev').data(L.items.filter(i => !i.b)).join('path').attr('class', 'ev').attr('transform', i => `translate(${i.x0},${rowY(i) + (RH - 5) / 2})`).attr('d', d3.symbol().type(d3.symbolDiamond).size(170));
      applyState(ev, i => i.state || 'actual', id, T);
      const info = i => ({ title: i.label, value: i.b ? d3.timeFormat('%b %Y')(i.a) + ' → ' + d3.timeFormat('%b %Y')(i.b) : d3.timeFormat('%d %b %Y')(i.a), state: i.state || 'actual', src: i.src });
      interactive(sp, info, T); interactive(ev, info, T);
      g.selectAll('text.t').data(L.items).join('text').attr('class', 't').attr('x', i => i.lx).attr('y', i => rowY(i) + (RH - 5) / 2 + 4).attr('text-anchor', i => i.anchor)
        .attr('fill', i => (i.inside && !/^(forecast|claim|gap)$/.test(i.state || '')) ? '#fff' : T.ink).attr('stroke', i => (i.inside && !/^(forecast|claim|gap)$/.test(i.state || '')) ? 'none' : T.bg).attr('stroke-width', 3).attr('paint-order', 'stroke').style('font', `600 ${fs}px var(--vra-sans, system-ui)`).style('pointer-events', 'none').text(i => i.lbl);
    });
    const states = f.items.map(i => i.state || 'actual'); legend(el, states);
  }

  /* ---------- tables de données (accessibilité / alternative textuelle) ---------- */
  const EXTRA = { render: {}, table: {} };
  function tableFor(f) {
    const r = (h, rows) => ({ head: h, rows });
    if (EXTRA.table[f.type]) return EXTRA.table[f.type](f, r);
    switch (f.type) {
      case 'bars': case 'ranges': return r(['Élément', 'Valeur', 'État', 'Source'], f.data.map(d => [d.label, d.low != null ? (d.low === d.high ? '≈ ' + fmt(d.low, 0) : fmt(d.low, 0) + '–' + fmt(d.high, 0)) : fmt(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
      case 'step': return r(['Date', 'Valeur (Md$)', 'Source'], f.data.map(d => [d.label, fmt(d.value, 0), d.src]));
      case 'forecastline': return r(['Année', 'TWh', 'État', 'Source'], f.data.map(d => [d.year, fmt(d.value, 0), STATE_LABEL[d.state], d.src]));
      case 'lollipop': return r(['Voix', 'Valeur', 'Remarque', 'Source'], f.data.map(d => [d.label, (d.bound === 'min' ? '≥ ' : '') + fmt(d.value, 0) + (d.high != null ? '–' + fmt(d.high, 0) : '') + ' %', d.note || '', d.src]));
      case 'quadrant': return r(['Acteur', 'Frein coordonné', 'Poids ouverts', 'Source'], f.data.map(d => [d.label, d.x, d.y, d.src]));
      case 'slope': return r(['Série', f.left, f.right, 'Source'], f.data.map(d => [d.label, d.start + ' %', d.end + ' %', d.src]));
      case 'yield': return r(['Fiabilité par étape', 'Rendement calculé'], f.points.map(p => [p.label, fmt(100 * Math.pow(1 - p.fail_ppm / 1e6, f.steps), 1) + ' %']));
      case 'sankey': return r(['De', 'Vers', 'Md$', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, fmt(l.v), l.src]));
      case 'layers': case 'ring': return r(['De', 'Vers', 'Lien', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, l.d, l.src || '']));
      case 'timeline': return r(['Voie', 'Événement', 'Début', 'Fin', 'État'], f.items.map(i => [i.lane, i.label, i.start, i.end || '', STATE_LABEL[i.state] || 'Réel']));
    }
    return r([], []);
  }

  const RENDER = { bars, ranges, yield: yieldChart, step, forecastline, slope, sankey, layers, ring, timeline, lollipop, quadrant };

  global.VRACharts = {
    render(el, fig) {
      const root = el.closest('.vra') || document.documentElement;
      const T = tokens(root); const fn = RENDER[fig.type] || EXTRA.render[fig.type];
      if (!fn) throw new Error('type inconnu ' + fig.type);
      fn(el, fig, T);
    },
    tableFor, STATE_LABEL, hideTip,
    /* extension : charts-extra.js enregistre de nouvelles formes avec les mêmes utilitaires */
    helpers: { d3, fmt, wrapLines, measure, trunc, tokens, frame, addPatterns, stateStyle, applyState, legend, interactive, axisStyle, showTip, hideTip, esc, STATE_LABEL },
    register(type, render, table) { EXTRA.render[type] = render; if (table) EXTRA.table[type] = table; }
  };
})(window);
