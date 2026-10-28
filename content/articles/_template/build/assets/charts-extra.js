/*
 * charts-extra.js — formes supplémentaires dérivées de la Visual Research Library
 * (waterfall, treemap, waffle, fan-chart, dumbbell, bullet, facet-small-multiples,
 * adjacency-matrix, stacked-bar 100 %, gauge-progress-rings, strip-plot, funnel,
 * bubble, dot-plot, timeline fractionnée, timeline verticale), réécrites localement
 * (aucun code Lieflat / PolyForm). Mêmes règles que charts.js : état de preuve encodé
 * par couleur + remplissage + contour, tooltip, focus clavier, source drill-down, thème.
 * Doit être chargé APRÈS charts.js.
 */
(function (global) {
  'use strict';
  const C = global.VRACharts; if (!C || !C.helpers) return;
  const { d3, fmt, wrapLines, measure, frame, addPatterns, stateStyle, applyState, legend, interactive, axisStyle, STATE_LABEL } = C.helpers;
  const SANS = 'var(--vra-sans, system-ui)', MONO = 'var(--vra-mono, ui-monospace)';
  const font = (w, s, f) => `${w} ${s}px ${f || SANS}`;
  const uid = () => 'x' + Math.random().toString(36).slice(2, 7);
  const isNarrow = el => (el.clientWidth || 640) < 520;
  const PAL = T => [T.c1, T.c3, T.c4, T.c2, T.c5, T.neg];
  const col = (T, k, i) => k ? (T[k] || k) : PAL(T)[(i || 0) % 6];
  /* remplissage d'un élément : couleur de catégorie (si fournie) + habillage de l'état de preuve */
  function paint(sel, T, id, getState, getColor) {
    sel.each(function (d, i) {
      const st = stateStyle(getState(d) || 'actual', id, T), c = getColor ? getColor(d, i) : null;
      const solid = !/^(forecast|claim|gap)$/.test(getState(d) || '');
      d3.select(this).attr('fill', (c && solid) ? c : st.fill).attr('fill-opacity', st.fillOpacity == null ? 1 : st.fillOpacity)
        .attr('stroke', c || st.stroke).attr('stroke-width', st.sw).attr('stroke-dasharray', st.dash);
    });
  }
  const txt = (sel, x, y, t, o) => { o = o || {}; return sel.append('text').attr('x', x).attr('y', y).attr('text-anchor', o.a || 'start').attr('fill', o.c || 'currentColor').attr('stroke', o.halo || 'none').attr('stroke-width', o.halo ? 3 : 0).attr('paint-order', 'stroke').style('font', o.f || font(500, 12)).style('pointer-events', 'none').text(t); };
  const statesOf = (arr, k) => arr.map(d => d[k || 'state'] || 'actual');
  const rows = (head, list) => ({ head, rows: list });

  /* ============================== WATERFALL ============================== */
  function waterfall(el, f, T) {
    const id = uid(), D = f.data.map(d => ({ ...d })), comp = isNarrow(el), dec = f.dec == null ? 1 : f.dec;
    let run = 0; D.forEach(d => { if (d.kind === 'delta') { d.y0 = run; run += d.value; d.y1 = run; } else if (d.kind === 'total') { d.y0 = 0; d.y1 = run; d.value = run; } else { run = d.value; d.y0 = 0; d.y1 = run; } });
    const H = comp ? 320 : 360, F = frame(el, id, H, { l: comp ? 40 : 52, b: 74, t: 26 }); addPatterns(F.defs, id, T);
    const lo = Math.min(0, ...D.map(d => Math.min(d.y0, d.y1))), hi = Math.max(0, ...D.map(d => Math.max(d.y0, d.y1)));
    const pad = (hi - lo) * .12, Y = d3.scaleLinear([lo - (lo < 0 ? pad : 0), hi + pad], [F.ih, 0]);
    const X = d3.scaleBand(D.map((d, i) => i), [0, F.iw]).padding(.28);
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickFormat(v => fmt(v, dec)).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .5); a.select('.domain').remove(); });
    F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(0)).attr('y2', Y(0)).attr('stroke', T.ink).attr('stroke-width', 1.2);
    D.forEach((d, i) => { if (i < D.length - 1) { const nx = D[i + 1]; F.g.append('line').attr('x1', X(i) + X.bandwidth()).attr('x2', X(i + 1)).attr('y1', Y(d.y1)).attr('y2', Y(d.y1)).attr('stroke', T.lo).attr('stroke-dasharray', '3 3'); } });
    const bars = F.g.selectAll('rect.wf').data(D).join('rect').attr('class', 'wf').attr('x', (d, i) => X(i)).attr('width', X.bandwidth()).attr('rx', 2)
      .attr('y', d => Y(Math.max(d.y0, d.y1))).attr('height', d => Math.max(2, Math.abs(Y(d.y0) - Y(d.y1))));
    paint(bars, T, id, d => d.state, d => d.color ? T[d.color] : (d.kind === 'delta' ? (d.value < 0 ? T.neg : T.c2) : T.c1));
    interactive(bars, d => ({ title: d.label, value: (d.kind === 'delta' ? (d.value > 0 ? '+' : '') : '') + fmt(d.value, 2) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T);
    F.g.selectAll('text.v').data(D).join('text').attr('class', 'v').attr('x', (d, i) => X(i) + X.bandwidth() / 2).attr('text-anchor', 'middle')
      .attr('y', d => (d.kind === 'delta' && d.value < 0) || (d.kind !== 'delta' && d.y1 < 0) ? Y(Math.min(d.y0, d.y1)) + 16 : Y(Math.max(d.y0, d.y1)) - 7)
      .attr('fill', T.ink).style('font', font(700, 12.5, MONO)).text(d => (d.kind === 'delta' && d.value > 0 ? '+' : '') + fmt(d.value, 2));
    D.forEach((d, i) => { const lines = wrapLines(d.label, X.bandwidth() + 14, 11.5, 500).slice(0, 4); const t = F.g.append('text').attr('fill', T.mid).attr('text-anchor', 'middle').style('font', font(500, 11.5)); lines.forEach((ln, k) => t.append('tspan').attr('x', X(i) + X.bandwidth() / 2).attr('y', F.ih + 18 + k * 13).text(ln)); });
    legend(el, statesOf(D));
  }

  /* ============================== TREEMAP ============================== */
  function treemap(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, H = comp ? 340 : 380;
    const F = frame(el, id, H, { l: 0, r: 0, t: 0, b: 6 }); addPatterns(F.defs, id, T);
    const root = d3.hierarchy({ children: D.map(d => ({ ...d })) }).sum(d => d.value || 0).sort((a, b) => b.value - a.value);
    d3.treemap().size([F.iw, F.ih - 6]).paddingInner(3).round(true)(root);
    const cells = F.g.selectAll('g.tm').data(root.leaves()).join('g').attr('class', 'tm').attr('transform', d => `translate(${d.x0},${d.y0})`);
    const rects = cells.append('rect').attr('width', d => d.x1 - d.x0).attr('height', d => d.y1 - d.y0).attr('rx', 3);
    paint(rects, T, id, d => d.data.state, (d, i) => col(T, d.data.color, i));
    rects.attr('fill-opacity', function (d) { return /^(forecast|claim|gap)$/.test(d.data.state || '') ? 1 : .86; });
    cells.each(function (d) {
      const w = d.x1 - d.x0, h = d.y1 - d.y0, g = d3.select(this), light = /^(forecast|claim|gap)$/.test(d.data.state || '');
      const lines = wrapLines(d.data.label, w - 14, 12.5, 700);
      if (w > 62 && h > 40) {
        const t = g.append('text').style('font', font(700, 12.5)).attr('fill', light ? T.ink : '#fff').attr('stroke', light ? T.bg : 'none').attr('stroke-width', 3).attr('paint-order', 'stroke').style('pointer-events', 'none');
        lines.slice(0, Math.max(1, Math.floor((h - 26) / 15))).forEach((ln, k) => t.append('tspan').attr('x', 8).attr('y', 20 + k * 15).text(ln));
        g.append('text').attr('x', 8).attr('y', Math.min(h - 8, 20 + Math.min(lines.length, Math.max(1, Math.floor((h - 26) / 15))) * 15 + 4)).attr('fill', light ? T.ink : '#fff').attr('stroke', light ? T.bg : 'none').attr('stroke-width', 3).attr('paint-order', 'stroke').style('font', font(600, 12, MONO)).style('pointer-events', 'none').text(fmt(d.data.value, 1) + ' ' + (f.unit || ''));
      }
    });
    interactive(rects, d => ({ title: d.data.label, value: fmt(d.data.value, 1) + ' ' + (f.unit || '') + ' · ' + fmt(100 * d.data.value / root.value, 0) + ' % du total', state: d.data.state, src: d.data.src, detail: d.data.note }), T);
    legend(el, statesOf(D));
  }

  /* ============================== WAFFLE ============================== */
  function waffle(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, N = f.cells || 100, cols = f.cols || 10, rowsN = Math.ceil(N / cols);
    const total = d3.sum(D, d => d.value);
    /* attribution par plus fort reste */
    const raw = D.map(d => d.value / total * N), cnt = raw.map(Math.floor); let left = N - d3.sum(cnt);
    raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, i]) => cnt[i]++);
    const size = Math.min(comp ? el.clientWidth - 24 : 330, 360), cell = size / cols, gap = 3;
    const legW = comp ? 0 : Math.max(180, (el.clientWidth || 640) - size - 40);
    const H = comp ? size * rowsN / cols + D.length * 40 + 26 : Math.max(size * rowsN / cols + 10, D.length * 56 + 20);
    const F = frame(el, id, H, { l: 6, r: 6, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    let k = 0;
    D.forEach((d, di) => {
      const g = F.g.append('g').datum(d).attr('class', 'wf-cat'); const fill = col(T, d.color, di);
      for (let j = 0; j < cnt[di]; j++, k++) {
        const r = Math.floor(k / cols), c = k % cols;
        const rc = g.append('rect').attr('x', c * cell + gap / 2).attr('y', r * cell + gap / 2).attr('width', cell - gap).attr('height', cell - gap).attr('rx', 3);
        paint(rc, T, id, () => d.state, () => fill);
      }
      interactive(g, dd => ({ title: dd.label, value: fmt(dd.value, 1) + ' ' + (f.unit || '') + ' · ' + cnt[di] + ' cases sur ' + N, state: dd.state, src: dd.src, detail: dd.note }), T);
      /* ligne de légende */
      const ly = comp ? size * rowsN / cols + 24 + di * 40 : 20 + di * 56, lx = comp ? 4 : size + 28;
      const sw = F.g.append('rect').attr('x', lx).attr('y', ly - 12).attr('width', 16).attr('height', 16).attr('rx', 3); paint(sw, T, id, () => d.state, () => fill);
      txt(F.g, lx + 24, ly, d.label, { f: font(600, 12.5), c: T.ink });
      txt(F.g, lx + 24, ly + 18, f.unit === '%' ? fmt(d.value, 0) + ' %' : fmt(d.value, 1) + ' ' + (f.unit || '') + ' · ' + fmt(100 * d.value / total, 0) + ' %', { f: font(500, 12, MONO), c: T.mid });
    });
    if (f.perCell) txt(F.g, comp ? 4 : size + 28, H - 8, f.perCell, { f: font(500, 11.5), c: T.mid });
    legend(el, statesOf(D));
  }

  /* ============================== FAN CHART ============================== */
  function fan(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, S = f.series || { high: 'Haut', mid: 'Milieu', low: 'Bas' };
    const F = frame(el, id, comp ? 300 : 360, { l: comp ? 44 : 56, t: 24, r: comp ? 22 : 150 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear(d3.extent(D, d => d.x), [0, F.iw]), ymax = f.ymax || d3.max(D, d => d.high) * 1.15, Y = d3.scaleLinear([0, ymax], [F.ih, 0]);
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickFormat(v => fmt(v, 0) + (f.unit === '%' ? ' %' : '')).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .5); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).tickValues(D.map(d => d.x)).tickFormat(d3.format('d')).tickSizeOuter(0)), T);
    F.g.append('path').datum(D).attr('d', d3.area().x(d => X(d.x)).y0(d => Y(d.low)).y1(d => Y(d.high))).attr('fill', T.c2).attr('fill-opacity', .16);
    if (f.ref) {
      F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(f.ref.value)).attr('y2', Y(f.ref.value)).attr('stroke', T.ink).attr('stroke-width', 1.6).attr('stroke-dasharray', '6 4');
      txt(F.g, 6, Y(f.ref.value) - 7, comp && f.ref.short ? f.ref.short : f.ref.label, { f: font(600, 11.5), c: T.ink });
    }
    const line = k => d3.line().x(d => X(d.x)).y(d => Y(d[k]));
    [['high', null, 2.6], ['mid', '6 4', 2], ['low', '2 4', 2.2]].forEach(([k, dash, w]) => {
      F.g.append('path').datum(D).attr('d', line(k)).attr('fill', 'none').attr('stroke', k === 'low' ? T.neg : k === 'high' ? T.c2 : T.c3).attr('stroke-width', w).attr('stroke-dasharray', dash);
      const last = D[D.length - 1];
      if (!comp) txt(F.g, F.iw + 8, Y(last[k]) + 4, S[k] + ' · ' + fmt(last[k], 0) + (f.unit === '%' ? ' %' : ''), { f: font(600, 11.5), c: k === 'low' ? T.neg : T.ink });
    });
    const pts = []; D.forEach(d => ['high', 'mid', 'low'].forEach(k => pts.push({ x: d.x, k, v: d[k], state: d.state || 'derived', src: d.src, note: d.note })));
    const dots = F.g.selectAll('circle.fp').data(pts).join('circle').attr('class', 'fp').attr('cx', d => X(d.x)).attr('cy', d => Y(d.v)).attr('r', 5.5);
    paint(dots, T, id, d => d.state, d => d.k === 'low' ? T.neg : d.k === 'high' ? T.c2 : T.c3);
    interactive(dots, d => ({ title: S[d.k] + ' · ' + d.x, value: fmt(d.v, 0) + (f.unit === '%' ? ' %' : ' ' + (f.unit || '')), state: d.state, src: d.src, detail: d.note }), T);
    legend(el, statesOf(D));
    if (comp) { const ul = el.parentNode.querySelector('.fig-legend'); if (ul) { const li = document.createElement('li'); li.textContent = 'Du haut vers le bas : ' + [S.high, S.mid, S.low].join(' · '); ul.appendChild(li); } }
  }

  /* ============================== DUMBBELL ============================== */
  function dumbbell(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 50 : 46, labelW = comp ? Math.min(120, (el.clientWidth || 340) * .34) : 220;
    const F = frame(el, id, D.length * band + 46, { l: labelW, r: comp ? 40 : 70, t: 8, b: 32 }); addPatterns(F.defs, id, T);
    const lo = f.min != null ? f.min : 0, hi = f.max != null ? f.max : d3.max(D, d => Math.max(d.a, d.b)) * 1.1, X = d3.scaleLinear([lo, hi], [0, F.iw]);
    const Y = d3.scaleBand(D.map(d => d.label), [0, D.length * band]).padding(.3);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 6).tickFormat(v => fmt(v, 0)).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 6)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .5);
    if (lo < 0) F.g.append('line').attr('x1', X(0)).attr('x2', X(0)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.ink);
    D.forEach(d => { const lines = wrapLines(d.label, labelW - 12, 12.5, 500); const t = F.g.append('text').attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(500, 12.5)); const cy = Y(d.label) + Y.bandwidth() / 2 - (Math.min(lines.length, 3) - 1) * 7; lines.slice(0, 3).forEach((ln, i) => t.append('tspan').attr('x', -10).attr('y', cy + i * 14.5 + 4).text(ln)); });
    D.forEach(d => {
      const cy = Y(d.label) + Y.bandwidth() / 2, same = d.a === d.b;
      if (!same) F.g.append('line').attr('x1', X(d.a)).attr('x2', X(d.b)).attr('y1', cy).attr('y2', cy).attr('stroke', T.lo).attr('stroke-width', 3);
      [['a', d.a, d.aState || d.state, T.c3], ['b', d.b, d.bState || d.state, T.c1]].forEach(([k, v, st, c]) => {
        if (same && k === 'b') return;
        const dot = F.g.append('circle').datum({ ...d, k, v, st }).attr('cx', X(v)).attr('cy', cy).attr('r', 8.5); paint(dot, T, id, () => st, () => c);
        interactive(dot, dd => ({ title: dd.label + ' · ' + (dd.k === 'a' ? f.aLabel : f.bLabel), value: fmt(dd.v, 1) + ' ' + (f.unit || ''), state: dd.st, src: dd.src, detail: dd.note }), T);
      });
      const label = same ? fmt(d.a, 0) : (f.join === 'arrow' ? fmt(d.a, 0) + ' → ' + fmt(d.b, 0) : fmt(Math.min(d.a, d.b), 0) + '–' + fmt(Math.max(d.a, d.b), 0));
      txt(F.g, X(Math.max(d.a, d.b)) + 14, cy + 4.5, label, { f: font(700, 12.5, MONO), c: T.ink });
      if (d.tag) txt(F.g, (X(d.a) + X(d.b)) / 2, cy - 14, d.tag, { a: 'middle', f: font(700, 11.5), c: T.neg, halo: T.bg });
    });
    legend(el, D.flatMap(d => [d.aState || d.state || 'actual', d.bState || d.state || 'actual']));
    if (f.aLabel) { const ul = el.parentNode.querySelector('.fig-legend'); if (ul) { [['a', T.c3, f.aLabel], ['b', T.c1, f.bLabel]].forEach(([, c, l]) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="${c}"/></svg>` + l; ul.appendChild(li); }); } }
  }

  /* ============================== BULLET ============================== */
  function bullet(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 92 : 84, labelW = comp ? Math.min(130, (el.clientWidth || 340) * .36) : 230;
    const F = frame(el, id, D.length * band + 44, { l: labelW, r: comp ? 16 : 36, t: 8, b: 32 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([0, f.max], [0, F.iw]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(v => fmt(v, 0) + (f.unit === '%' ? ' %' : '')).tickSizeOuter(0)), T);
    D.forEach((d, i) => {
      const y0 = i * band + 10, h = band - 22, g = F.g.append('g');
      const lines = wrapLines(d.label, labelW - 12, 12.5, 600), t = g.append('text').attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(600, 12.5));
      lines.slice(0, 3).forEach((ln, k) => t.append('tspan').attr('x', -10).attr('y', y0 + h / 2 - (Math.min(lines.length, 3) - 1) * 7 + k * 14.5 + 4).text(ln));
      const bandRect = g.append('rect').attr('x', 0).attr('y', y0).attr('width', X(d.bandTo || f.max)).attr('height', h).attr('rx', 2).attr('fill', T.line).attr('fill-opacity', .55);
      if (d.bandTo) { txt(g, X(d.bandTo) - 6, y0 + 13, d.bandLabel || '', { a: 'end', f: font(600, 11), c: T.mid }); }
      const bar = g.append('rect').datum(d).attr('x', 0).attr('y', y0 + h * .3).attr('width', Math.max(2, X(d.value))).attr('height', h * .4).attr('rx', 2); paint(bar, T, id, dd => dd.state, () => d.color ? T[d.color] : T.c1);
      interactive(bar, dd => ({ title: dd.label, value: fmt(dd.value, 2) + ' ' + (f.unit || ''), state: dd.state, src: dd.src, detail: dd.note }), T);
      if (d.marker != null) {
        const mk = g.append('line').datum(d).attr('x1', X(d.marker)).attr('x2', X(d.marker)).attr('y1', y0 + h * .12).attr('y2', y0 + h * .88).attr('stroke', T.ink).attr('stroke-width', 3.2);
        interactive(mk, dd => ({ title: dd.markerLabel || 'Repère', value: fmt(dd.marker, 2) + ' ' + (f.unit || ''), state: dd.markerState || 'actual', src: dd.markerSrc || dd.src }), T);
        txt(g, X(d.marker), y0 + h + 13, (d.markerLabel || 'repère') + ' · ' + fmt(d.marker, 1), { a: X(d.marker) > F.iw - 150 ? 'end' : 'start', f: font(600, 11), c: T.ink });
      }
      txt(g, X(d.value) + 8, y0 + h * .5 + 4.5, fmt(d.value, 2) + (f.unit === '%' ? ' %' : ' ' + (f.unit || '')), { f: font(700, 12.5, MONO), c: T.ink, halo: T.bg });
    });
    legend(el, statesOf(D));
  }

  /* ============================== FACETS (petits multiples) ============================== */
  function facets(el, f, T) {
    const id = uid(), comp = isNarrow(el), P = f.panels, cols = comp ? 1 : Math.min(2, P.length), pw = (el.clientWidth || 640) / cols - 14, ph = comp ? 190 : 230;
    const rowsN = Math.ceil(P.length / cols), F = frame(el, id, rowsN * ph + 16, { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    P.forEach((p, i) => {
      const ox = (i % cols) * (pw + 14), oy = Math.floor(i / cols) * ph, g = F.g.append('g').attr('transform', `translate(${ox},${oy})`), m = { l: 46, r: 16, t: 34, b: 34 };
      const Y = d3.scaleLinear([p.min, p.max], [ph - m.t - m.b, 0]), xa = m.l + 24, xb = pw - m.r - 24 - 4;
      txt(g, 0, 14, p.title, { f: font(700, 13), c: T.ink });
      axisStyle(g.append('g').attr('transform', `translate(${m.l - 6},${m.t})`).call(d3.axisLeft(Y).ticks(4).tickFormat(v => fmt(v, 0)).tickSize(-(pw - m.l - m.r + 6)).tickSizeOuter(0)), T);
      g.selectAll('.domain').remove(); g.selectAll('.tick line').attr('stroke-opacity', .45);
      g.append('line').attr('x1', xa).attr('x2', xb).attr('y1', m.t + Y(p.a.value)).attr('y2', m.t + Y(p.b.value)).attr('stroke', T.c3).attr('stroke-width', 3);
      [p.a, p.b].forEach((q, k) => {
        const x = k ? xb : xa, y = m.t + Y(q.value), dot = g.append('circle').datum(q).attr('cx', x).attr('cy', y).attr('r', 8); paint(dot, T, id, d => d.state, () => k ? T.c1 : T.c3);
        interactive(dot, d => ({ title: p.title + ' · ' + d.label, value: fmt(d.value, 1) + ' ' + (p.unit || ''), state: d.state, src: d.src, detail: d.note }), T);
        txt(g, x, y + (q.value >= (p.a.value + p.b.value) / 2 ? -14 : 24), fmt(q.value, 1) + (p.unit === '%' ? ' %' : ''), { a: 'middle', f: font(700, 12.5, MONO), c: T.ink, halo: T.bg });
        txt(g, x, ph - 8, q.label, { a: 'middle', f: font(500, 11.5), c: T.mid });
      });
    });
    legend(el, P.flatMap(p => [p.a.state || 'actual', p.b.state || 'actual']));
  }

  /* ============================== MATRICE D'ADJACENCE ============================== */
  const KIND = { capital: { l: 'Capital', s: d3.symbolCircle, c: 'c1' }, calcul: { l: 'Capacité de calcul', s: d3.symbolSquare, c: 'c3' }, achat: { l: 'Achat de puces', s: d3.symbolTriangle, c: 'c4' }, fabrication: { l: 'Fabrication', s: d3.symbolDiamond, c: 'c2' }, garantie: { l: 'Garantie de financement', s: d3.symbolCross, c: 'neg' } };
  function matrix(el, f, T) {
    const id = uid(), comp = isNarrow(el), srcIds = [...new Set(f.links.map(l => l.s))], tgtIds = [...new Set(f.links.map(l => l.t))];
    const nm = Object.fromEntries(f.nodes.map(n => [n.id, n.label])), W = el.clientWidth || 640;
    const rowW = comp ? 74 : 120, cw = Math.max(54, Math.min(comp ? 70 : 110, (W - rowW - 20) / tgtIds.length)), ch = comp ? 56 : 60, top = comp ? 64 : 48;
    const F = frame(el, id, top + srcIds.length * ch + 16, { l: rowW, r: 6, t: 4, b: 6 });
    const groups = {};
    f.links.forEach(l => { (groups[l.s + '|' + l.t] = groups[l.s + '|' + l.t] || []).push(l); });
    tgtIds.forEach((t, j) => { const tx = txt(F.g, j * cw + cw / 2, top - 12, nm[t], { a: comp ? 'start' : 'middle', f: font(700, comp ? 11 : 12.5), c: T.ink }); if (comp) tx.attr('transform', `rotate(-40 ${j * cw + cw / 2},${top - 12})`); });
    srcIds.forEach((s, i) => { txt(F.g, -8, top + i * ch + ch / 2 + 4, nm[s], { a: 'end', f: font(700, 12.5), c: T.ink }); F.g.append('line').attr('x1', 0).attr('x2', tgtIds.length * cw).attr('y1', top + i * ch).attr('y2', top + i * ch).attr('stroke', T.line); });
    F.g.append('line').attr('x1', 0).attr('x2', tgtIds.length * cw).attr('y1', top + srcIds.length * ch).attr('y2', top + srcIds.length * ch).attr('stroke', T.line);
    const hl = F.g.append('rect').attr('fill', T.c1).attr('fill-opacity', .08).attr('visibility', 'hidden').attr('pointer-events', 'none');
    srcIds.forEach((s, i) => tgtIds.forEach((t, j) => {
      const L = groups[s + '|' + t]; F.g.append('rect').attr('x', j * cw + 1).attr('y', top + i * ch + 1).attr('width', cw - 2).attr('height', ch - 2).attr('fill', L ? T.line : 'none').attr('fill-opacity', L ? .18 : 0).attr('rx', 3);
      if (!L) return;
      const n = L.length, step = Math.min(26, (cw - 8) / n);
      L.forEach((l, k) => {
        const cx = j * cw + cw / 2 + (k - (n - 1) / 2) * step, cy = top + i * ch + ch / 2 - (l.v ? 6 : 0), K = KIND[l.kind] || KIND.capital;
        const sym = F.g.append('path').datum(l).attr('transform', `translate(${cx},${cy})`).attr('d', d3.symbol().type(K.s).size(n > 1 ? 150 : 230)()).attr('fill', T[K.c]).attr('stroke', T.bg).attr('stroke-width', 1.4);
        interactive(sym, d => ({ title: nm[d.s] + ' → ' + nm[d.t], value: KIND[d.kind].l + (d.v ? ' · ' + fmt(d.v, 1) + ' ' + (f.unit || '') : ''), detail: d.d, src: d.src }), T);
        sym.on('pointerenter.hl focus.hl', () => hl.attr('visibility', 'visible').attr('x', 0).attr('y', top + i * ch).attr('width', tgtIds.length * cw).attr('height', ch)).on('pointerleave.hl blur.hl', () => hl.attr('visibility', 'hidden'));
        if (l.v) txt(F.g, cx, cy + 22, fmt(l.v, 0), { a: 'middle', f: font(700, 11.5, MONO), c: T.ink });
      });
    }));
    const ul = document.createElement('ul'); ul.className = 'fig-legend';
    Object.entries(KIND).filter(([k]) => f.links.some(l => l.kind === k)).forEach(([k, K]) => { const li = document.createElement('li'); li.innerHTML = `<svg width="16" height="16" aria-hidden="true"><path transform="translate(8,8)" d="${d3.symbol().type(K.s).size(120)()}" fill="${T[K.c]}"/></svg>` + K.l; ul.appendChild(li); });
    const old = el.parentNode.querySelector('.fig-legend'); if (old) old.remove(); el.after(ul);
  }

  /* ============================== BARRES 100 % ============================== */
  function stack100(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 74 : 62, labelW = comp ? Math.min(110, (el.clientWidth || 340) * .3) : 200;
    const F = frame(el, id, D.length * band + 40, { l: labelW, r: 10, t: 6, b: 30 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([0, 100], [0, F.iw]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(5).tickFormat(v => v + ' %').tickSizeOuter(0)), T);
    D.forEach((row, i) => {
      const y0 = i * band + 10, h = band - 24; let acc = 0;
      const lines = wrapLines(row.label, labelW - 12, 12.5, 600), t = F.g.append('text').attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(600, 12.5));
      lines.slice(0, 3).forEach((ln, k) => t.append('tspan').attr('x', -10).attr('y', y0 + h / 2 - (Math.min(lines.length, 3) - 1) * 7 + k * 14.5 + 4).text(ln));
      row.parts.forEach((p, k) => {
        const rc = F.g.append('rect').datum(p).attr('x', X(acc)).attr('y', y0).attr('width', Math.max(1, X(p.value))).attr('height', h).attr('rx', 2); paint(rc, T, id, d => d.state, (d) => col(T, d.color, k));
        rc.attr('stroke', T.bg).attr('stroke-width', 1.5);
        interactive(rc, d => ({ title: row.label + ' · ' + d.label, value: fmt(d.value, 0) + ' %', state: d.state, src: d.src, detail: d.note }), T);
        const w = X(p.value); if (w > 54) txt(F.g, X(acc) + w / 2, y0 + h / 2 + 4.5, fmt(p.value, 0) + ' %', { a: 'middle', f: font(700, 12.5, MONO), c: /^(forecast|claim|gap)$/.test(p.state || '') ? T.ink : '#fff', halo: /^(forecast|claim|gap)$/.test(p.state || '') ? T.bg : 'none' });
        acc += p.value;
      });
    });
    legend(el, D.flatMap(r => statesOf(r.parts)));
    const ul = el.parentNode.querySelector('.fig-legend'); if (ul && f.partKeys) f.partKeys.forEach((pk, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, pk.color, k)}"/></svg>` + pk.label; ul.appendChild(li); });
  }

  /* ============================== ANNEAUX DE PROGRESSION ============================== */
  function rings(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, S = comp ? 250 : 280, rw = 18, gapR = 8, R0 = S / 2 - 6;
    const F = frame(el, id, S + 10, { l: 6, r: 6, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const cx = comp ? F.iw / 2 : S / 2 + 10, cy = S / 2;
    const g = F.g.append('g').attr('transform', `translate(${cx},${cy})`);
    D.forEach((d, i) => {
      const r1 = R0 - i * (rw + gapR), r0 = r1 - rw, arc = d3.arc().innerRadius(r0).outerRadius(r1).cornerRadius(3);
      g.append('path').attr('d', arc({ startAngle: 0, endAngle: 2 * Math.PI })).attr('fill', T.line).attr('fill-opacity', .4);
      const p = g.append('path').datum(d).attr('d', arc({ startAngle: 0, endAngle: 2 * Math.PI * d.value / 100 })); paint(p, T, id, dd => dd.state, () => col(T, d.color, i));
      interactive(p, dd => ({ title: dd.label, value: fmt(dd.value, 0) + ' %', state: dd.state, src: dd.src, detail: dd.note }), T);
      const ang = 2 * Math.PI * d.value / 100 - Math.PI / 2;
      if (!comp) { const lx = (r0 + rw / 2) * Math.cos(ang), ly = (r0 + rw / 2) * Math.sin(ang); g.append('circle').attr('cx', lx).attr('cy', ly).attr('r', 3.2).attr('fill', T.bg).style('pointer-events', 'none'); }
      txt(g, -6, -(r0 + rw / 2) + 4.5, d.short || '', { a: 'end', f: font(700, 11, MONO), c: T.ink, halo: T.bg });
    });
    if (f.center) txt(g, 0, 6, f.center, { a: 'middle', f: font(700, 14), c: T.mid });
    const lx = comp ? 6 : S + 30, ly0 = comp ? S + 4 : 40;
    const lg = F.g.append('g');
    if (comp) F.svg.attr('viewBox', `0 0 ${F.w} ${S + 10 + D.length * 44}`);
    D.forEach((d, i) => {
      const y = comp ? ly0 + i * 44 : ly0 + i * 52, sw = lg.append('rect').attr('x', lx).attr('y', y - 12).attr('width', 16).attr('height', 16).attr('rx', 3); paint(sw, T, id, () => d.state, () => col(T, d.color, i));
      const t = lg.append('text').attr('fill', T.ink).style('font', font(600, 12.5)); wrapLines(d.label, comp ? F.iw - 30 : F.iw - S - 60, 12.5, 600).slice(0, 2).forEach((ln, k) => t.append('tspan').attr('x', lx + 24).attr('y', y + k * 14).text(ln));
      txt(lg, lx + 24, y + 30, fmt(d.value, 0) + ' %', { f: font(700, 12.5, MONO), c: T.mid });
    });
    legend(el, statesOf(D));
  }

  /* ============================== STRIP PLOT À ÉTIQUETTES ============================== */
  function strip(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => a.value - b.value), tier = comp ? 40 : 34;
    const F = frame(el, id, D.length * tier + 70, { l: comp ? 14 : 24, r: comp ? 14 : 24, t: 8, b: 40 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([0, 100], [0, F.iw]), ay = F.ih;
    axisStyle(F.g.append('g').attr('transform', `translate(0,${ay})`).call(d3.axisBottom(X).ticks(comp ? 5 : 10).tickFormat(v => v + ' %').tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(10)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', ay).attr('stroke', T.line).attr('stroke-opacity', .35);
    D.forEach((d, i) => {
      const y = 12 + i * tier, x = X(d.value), x2 = d.high != null ? X(d.high) : x, c = col(T, d.color, 0);
      F.g.append('line').attr('x1', x).attr('x2', x).attr('y1', y + 6).attr('y2', ay).attr('stroke', T.lo).attr('stroke-dasharray', '2 3');
      const shape = d.high != null ? F.g.append('rect').datum(d).attr('x', x).attr('y', ay - 9).attr('width', Math.max(6, x2 - x)).attr('height', 18).attr('rx', 3) : F.g.append('circle').datum(d).attr('cx', x).attr('cy', ay).attr('r', 8);
      paint(shape, T, id, dd => dd.state, () => c);
      interactive(shape, dd => ({ title: dd.label, value: (dd.bound === 'min' ? '≥ ' : '') + fmt(dd.value, 0) + (dd.high != null ? '–' + fmt(dd.high, 0) : '') + ' %', state: dd.state, src: dd.src, detail: dd.note }), T);
      if (d.bound === 'min') F.g.append('path').attr('d', `M${x + 11},${ay - 6}L${x + 22},${ay}L${x + 11},${ay + 6}`).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2);
      const lbl = (d.bound === 'min' ? '≥ ' : '') + fmt(d.value, 0) + (d.high != null ? '–' + fmt(d.high, 0) : '') + ' % · ' + (d.short || d.label), w = measure(lbl, comp ? 11.5 : 12, 600) + 6, left = Math.max(0, Math.min(x + 6, F.iw - w));
      txt(F.g, left, y + 2, lbl, { a: 'start', f: font(600, comp ? 11.5 : 12), c: T.ink, halo: T.bg });
    });
    legend(el, statesOf(D));
  }

  /* ============================== ENTONNOIR ============================== */
  function funnel(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, bh = comp ? 64 : 58, gapY = 16, F = frame(el, id, D.length * (bh + gapY) + 10, { l: 6, r: 6, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const max = f.max || D[0].value, cx = F.iw * (comp ? .5 : .42), full = F.iw * (comp ? .9 : .72), W = v => v / max * full;
    D.forEach((d, i) => {
      const y = i * (bh + gapY), w = W(d.value), nx = D[i + 1] ? W(D[i + 1].value) : null;
      if (nx != null) F.g.append('path').attr('d', `M${cx - w / 2},${y + bh}L${cx + w / 2},${y + bh}L${cx + nx / 2},${y + bh + gapY}L${cx - nx / 2},${y + bh + gapY}Z`).attr('fill', T.lo).attr('fill-opacity', .22);
      const rc = F.g.append('rect').datum(d).attr('x', cx - w / 2).attr('y', y).attr('width', w).attr('height', bh).attr('rx', 3); paint(rc, T, id, dd => dd.state, () => col(T, d.color, i));
      interactive(rc, dd => ({ title: dd.label, value: fmt(dd.value, 0) + ' ' + (f.unit || ''), state: dd.state, src: dd.src, detail: dd.note }), T);
      const light = /^(forecast|claim|gap)$/.test(d.state || '');
      txt(F.g, cx, y + bh / 2 - 3, fmt(d.value, 0), { a: 'middle', f: font(700, 20, MONO), c: light ? T.ink : '#fff', halo: light ? T.bg : 'none' });
      txt(F.g, cx, y + bh / 2 + 15, d.label, { a: 'middle', f: font(600, comp ? 11 : 12), c: light ? T.ink : '#fff', halo: light ? T.bg : 'none' });
      if (nx != null) txt(F.g, cx + (comp ? w / 2 - 6 : full / 2 + 18), y + bh + gapY / 2 + 4, '− ' + fmt(d.value - D[i + 1].value, 0) + ' (' + fmt(100 * (1 - D[i + 1].value / d.value), 0) + ' %)', { a: comp ? 'end' : 'start', f: font(600, 11.5, MONO), c: T.mid });
    });
    legend(el, statesOf(D));
  }

  /* ============================== BULLES PROPORTIONNELLES (aires) ============================== */
  function bubbles(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, W = el.clientWidth || 640, vmax = d3.max(D, d => d.value);
    const Rmax = Math.min(comp ? (W - 20) / (D.length * 2) * 1.0 : 120, 130), H = Rmax * 2 + 70, F = frame(el, id, H, { l: 4, r: 4, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const slot = F.iw / D.length, base = Rmax * 2 + 6;
    D.forEach((d, i) => {
      const r = Math.max(5, Rmax * Math.sqrt(d.value / vmax)), cx = slot * i + slot / 2;
      const c = F.g.append('circle').datum(d).attr('cx', cx).attr('cy', base - r).attr('r', r); paint(c, T, id, dd => dd.state, () => col(T, d.color, i));
      interactive(c, dd => ({ title: dd.label, value: fmt(dd.value, 1) + ' ' + (f.unit || ''), state: dd.state, src: dd.src, detail: dd.note }), T);
      txt(F.g, cx, base + 18, fmt(d.value, 1) + ' ' + (f.unit || ''), { a: 'middle', f: font(700, 13, MONO), c: T.ink });
      const t = F.g.append('text').attr('text-anchor', 'middle').attr('fill', T.mid).style('font', font(500, 11.5)); wrapLines(d.label, slot - 8, 11.5, 500).slice(0, 2).forEach((ln, k) => t.append('tspan').attr('x', cx).attr('y', base + 34 + k * 13).text(ln));
    });
    if (f.ratio) txt(F.g, F.iw / 2, 14, f.ratio, { a: 'middle', f: font(700, 13), c: T.neg, halo: T.bg });
    F.svg.attr('viewBox', `0 0 ${F.w} ${H + 14}`);
    legend(el, statesOf(D));
    const ul = el.parentNode.querySelector('.fig-legend'); if (ul) { const li = document.createElement('li'); li.textContent = 'La surface de chaque disque est proportionnelle à la valeur.'; ul.appendChild(li); }
  }

  /* ============================== DOT PLOT (Cleveland) ============================== */
  function dotplot(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => f.order === 'asc' ? a.value - b.value : b.value - a.value), band = comp ? 44 : 40, labelW = comp ? Math.min(110, (el.clientWidth || 340) * .3) : 190;
    const F = frame(el, id, D.length * band + 42, { l: labelW, r: comp ? 56 : 80, t: 6, b: 32 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([f.min, f.max], [0, F.iw]), Y = d3.scaleBand(D.map(d => d.label), [0, D.length * band]).padding(.2);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 7).tickFormat(v => fmt(v, 0) + (f.unit === '%' ? ' %' : '')).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(D).join('line').attr('x1', 0).attr('x2', F.iw).attr('y1', d => Y(d.label) + Y.bandwidth() / 2).attr('y2', d => Y(d.label) + Y.bandwidth() / 2).attr('stroke', T.line).attr('stroke-dasharray', '1 4');
    F.g.append('line').attr('x1', X(0)).attr('x2', X(0)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.ink).attr('stroke-width', 1.3);
    D.forEach(d => { const lines = wrapLines(d.label, labelW - 12, 12.5, 600), t = F.g.append('text').attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(600, 12.5)); const cy = Y(d.label) + Y.bandwidth() / 2 - (Math.min(lines.length, 2) - 1) * 7; lines.slice(0, 2).forEach((ln, k) => t.append('tspan').attr('x', -10).attr('y', cy + k * 14.5 + 4).text(ln)); });
    const dots = F.g.selectAll('circle.dp').data(D).join('circle').attr('class', 'dp').attr('cx', d => X(d.value)).attr('cy', d => Y(d.label) + Y.bandwidth() / 2).attr('r', 9);
    paint(dots, T, id, d => d.state, d => d.color ? T[d.color] : (d.value < 0 ? T.neg : T.c1));
    interactive(dots, d => ({ title: d.label, value: fmt(d.value, 1) + (f.unit === '%' ? ' %' : ' ' + (f.unit || '')), state: d.state, src: d.src, detail: d.note }), T);
    F.g.selectAll('text.v').data(D).join('text').attr('class', 'v').attr('x', d => X(d.value) + (d.value < 0 ? -15 : 15)).attr('text-anchor', d => d.value < 0 ? 'end' : 'start').attr('y', d => Y(d.label) + Y.bandwidth() / 2 + 4.5).attr('fill', T.ink).style('font', font(700, 12.5, MONO)).text(d => fmt(d.value, 1) + (f.unit === '%' ? ' %' : ''));
    legend(el, statesOf(D));
  }

  /* ============================== TIMELINE FRACTIONNÉE (axe central) ============================== */
  function splitline(el, f, T) {
    const id = uid(), comp = isNarrow(el), from = new Date(f.from), to = new Date(f.to), W = el.clientWidth || 640, M = { l: 14, r: 14 };
    const lanes = f.lanes, SHAPES = [d3.symbolCircle, d3.symbolSquare, d3.symbolDiamond, d3.symbolTriangle], LC = [T.c1, T.c3, T.c4, T.c2];
    const X = d3.scaleTime([from, to], [M.l + 6, W - M.r - 6]), fs = comp ? 11 : 12, th = comp ? 20 : 22;
    const items = f.items.map(i => ({ ...i, a: new Date(i.start), li: lanes.findIndex(l => l.name === i.lane) })).sort((a, b) => a.a - b.a);
    const tiersBySide = { up: [], down: [], axis: [] };
    items.forEach(it => {
      const side = lanes[it.li].side, w = measure(it.label, fs, 600) + 14, x = X(it.a); it.x = x; it.w = w; it.side = side;
      it.left = Math.max(M.l, Math.min(x + 6, W - M.r - w)); const x0 = it.left, x1 = it.left + w; const T2 = tiersBySide[side === 'axis' ? 'up' : side]; let t = 0; while (T2[t] && T2[t].some(r => !(x1 + 6 < r[0] || x0 - 6 > r[1]))) t++; (T2[t] = T2[t] || []).push([x0, x1]); it.tier = t;
    });
    const nUp = Math.max(1, tiersBySide.up.length), nDown = Math.max(tiersBySide.down.length, 0), axisY = 20 + nUp * th + 10, H = axisY + 18 + nDown * th + 34;
    const F = frame(el, id, H, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T); const g = F.g;
    g.append('line').attr('x1', M.l).attr('x2', W - M.r).attr('y1', axisY).attr('y2', axisY).attr('stroke', T.ink).attr('stroke-width', 1.6);
    X.ticks(comp ? 4 : d3.timeMonth.every(1)).forEach(t => { g.append('line').attr('x1', X(t)).attr('x2', X(t)).attr('y1', axisY - 4).attr('y2', axisY + 4).attr('stroke', T.ink); });
    const fmtT = d3.timeFormat(f.tickFormat || '%b %Y');
    (comp ? X.ticks(4) : X.ticks(d3.timeMonth.every(f.monthStep || 1))).forEach(t => txt(g, X(t), axisY + 20, fmtT(t), { a: 'middle', f: font(500, 11), c: T.mid }));
    const base = (it) => it.side === 'down' ? axisY + 34 + it.tier * th : axisY - 18 - it.tier * th;
    items.forEach(it => {
      const y = base(it), c = LC[it.li % 4], g2 = g.append('g');
      g2.append('line').attr('x1', it.x).attr('x2', it.x).attr('y1', axisY).attr('y2', it.side === 'down' ? y - 12 : y + 4).attr('stroke', c).attr('stroke-opacity', .6).attr('stroke-width', 1.2);
      const mk = g2.append('path').datum(it).attr('transform', `translate(${it.x},${axisY})`).attr('d', d3.symbol().type(SHAPES[it.li % 4]).size(120)()); paint(mk, T, id, d => d.state, () => c); mk.attr('stroke', T.bg).attr('stroke-width', 1.6);
      interactive(mk, d => ({ title: d.label, value: d3.timeFormat('%d %B %Y')(d.a), state: d.state || 'actual', src: d.src, detail: d.lane }), T);
      txt(g2, it.left, y, it.label, { a: 'start', f: font(600, fs), c: T.ink, halo: T.bg });
    });
    if (f.today) { const t = new Date(f.today); if (t > from && t < to) { g.append('line').attr('x1', X(t)).attr('x2', X(t)).attr('y1', 4).attr('y2', H - 28).attr('stroke', T.neg).attr('stroke-dasharray', '3 3'); txt(g, X(t) > W - 90 ? X(t) - 4 : X(t) + 4, H - 14, 'Aujourd\'hui', { a: X(t) > W - 90 ? 'end' : 'start', f: font(600, 10.5), c: T.neg }); } }
    const ul = document.createElement('ul'); ul.className = 'fig-legend'; lanes.forEach((l, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="16" height="16" aria-hidden="true"><path transform="translate(8,8)" d="${d3.symbol().type(SHAPES[i % 4]).size(110)()}" fill="${LC[i % 4]}"/></svg>${l.name} (${l.side === 'up' ? 'au-dessus' : l.side === 'down' ? 'au-dessous' : 'sur l\'axe'})`; ul.appendChild(li); });
    const old = el.parentNode.querySelector('.fig-legend'); if (old) old.remove(); el.after(ul);
  }

  /* ============================== TIMELINE VERTICALE ============================== */
  function vtimeline(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, lanes = f.lanes, SHAPES = [d3.symbolCircle, d3.symbolSquare, d3.symbolDiamond, d3.symbolTriangle], LC = [T.c1, T.c3, T.c4, T.c2];
    const items = f.items.map(i => ({ ...i, a: new Date(i.start), li: lanes.indexOf(i.lane) })).sort((a, b) => a.a - b.a), dateW = comp ? 62 : 88, tw = W - dateW - 36;
    let y = 10; items.forEach(it => { it.lines = wrapLines(it.label, tw - 4, comp ? 12.5 : 13.5, 600); it.h = Math.max(30, it.lines.length * 16 + 12); it.y = y; y += it.h; });
    const F = frame(el, id, y + 14, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T);
    const ax = dateW + 10; F.g.append('line').attr('x1', ax).attr('x2', ax).attr('y1', 2).attr('y2', y).attr('stroke', T.line).attr('stroke-width', 2);
    const fd = d3.timeFormat(comp ? '%d %b' : '%d %b %Y'); let lastMonth = '';
    items.forEach(it => {
      const cy = it.y + it.h / 2, g = F.g.append('g'), mon = d3.timeFormat('%Y-%m')(it.a);
      if (mon !== lastMonth) { g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', it.y).attr('y2', it.y).attr('stroke', T.line).attr('stroke-opacity', .6).attr('stroke-dasharray', '2 4'); lastMonth = mon; }
      txt(g, dateW, cy + 4, fd(it.a), { a: 'end', f: font(600, 11.5, MONO), c: T.mid });
      const mk = g.append('path').datum(it).attr('transform', `translate(${ax},${cy})`).attr('d', d3.symbol().type(SHAPES[it.li % 4]).size(150)()); paint(mk, T, id, d => d.state, () => LC[it.li % 4]); mk.attr('stroke', T.bg).attr('stroke-width', 1.8);
      interactive(mk, d => ({ title: d.label, value: d3.timeFormat('%d %B %Y')(d.a), state: d.state || 'actual', src: d.src, detail: d.lane }), T);
      const t = g.append('text').attr('fill', T.ink).style('font', font(600, comp ? 12.5 : 13.5)).style('pointer-events', 'none'); it.lines.forEach((ln, k) => t.append('tspan').attr('x', ax + 18).attr('y', cy - (it.lines.length - 1) * 8 + k * 16 + 4).text(ln));
    });
    const ul = document.createElement('ul'); ul.className = 'fig-legend'; lanes.forEach((l, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="16" height="16" aria-hidden="true"><path transform="translate(8,8)" d="${d3.symbol().type(SHAPES[i % 4]).size(110)()}" fill="${LC[i % 4]}"/></svg>${l}`; ul.appendChild(li); });
    const old = el.parentNode.querySelector('.fig-legend'); if (old) old.remove(); el.after(ul);
  }

  /* ---------- tables de secours (accessibilité) ---------- */
  const T_DATA = (head, fn) => (f, r) => r(head, f.data.map(fn));
  const nf = v => fmt(v, 2);
  C.register('waterfall', waterfall, T_DATA(['Étape', 'Valeur', 'État', 'Source'], d => [d.label, nf(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
  C.register('treemap', treemap, T_DATA(['Élément', 'Valeur', 'État', 'Source'], d => [d.label, nf(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
  C.register('waffle', waffle, T_DATA(['Catégorie', 'Valeur', 'État', 'Source'], d => [d.label, nf(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
  C.register('fan', fan, (f, r) => r(['Année', f.series.high, f.series.mid, f.series.low, 'Source'], f.data.map(d => [d.x, nf(d.high), nf(d.mid), nf(d.low), d.src])));
  C.register('dumbbell', dumbbell, (f, r) => r(['Élément', f.aLabel || 'Début', f.bLabel || 'Fin', 'Source'], f.data.map(d => [d.label, nf(d.a), nf(d.b), d.src])));
  C.register('bullet', bullet, T_DATA(['Élément', 'Valeur', 'Repère', 'Source'], d => [d.label, nf(d.value), d.marker != null ? (d.markerLabel || '') + ' ' + nf(d.marker) : '', d.src]));
  C.register('facets', facets, (f, r) => r(['Panneau', 'Début', 'Fin', 'Source'], f.panels.map(p => [p.title, p.a.label + ' : ' + nf(p.a.value), p.b.label + ' : ' + nf(p.b.value), p.a.src + ' ' + p.b.src])));
  C.register('matrix', matrix, (f, r) => r(['De', 'Vers', 'Lien', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, KIND[l.kind].l + ' — ' + (l.d || ''), l.src || ''])));
  C.register('stack100', stack100, (f, r) => r(['Ligne', 'Parts (%)', 'Source'], f.data.map(d => [d.label, d.parts.map(p => p.label + ' ' + nf(p.value)).join(' · '), d.parts.map(p => p.src).join(' ')])));
  C.register('rings', rings, T_DATA(['Série', 'Valeur (%)', 'État', 'Source'], d => [d.label, nf(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
  C.register('strip', strip, T_DATA(['Voix', 'Valeur (%)', 'État', 'Source'], d => [d.label, (d.bound === 'min' ? '≥ ' : '') + nf(d.value) + (d.high != null ? '–' + nf(d.high) : ''), STATE_LABEL[d.state] || 'Réel', d.src]));
  C.register('funnel', funnel, T_DATA(['Étape', 'Valeur', 'État', 'Source'], d => [d.label, nf(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
  C.register('bubbles', bubbles, T_DATA(['Élément', 'Valeur', 'État', 'Source'], d => [d.label, nf(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
  C.register('dotplot', dotplot, T_DATA(['Élément', 'Valeur', 'État', 'Source'], d => [d.label, nf(d.value), STATE_LABEL[d.state] || 'Réel', d.src]));
  const tl = (f, r) => r(['Voie', 'Événement', 'Date', 'État'], f.items.map(i => [i.lane, i.label, i.start, STATE_LABEL[i.state] || 'Réel']));
  C.register('splitline', splitline, tl); C.register('vtimeline', vtimeline, tl);
})(window);
