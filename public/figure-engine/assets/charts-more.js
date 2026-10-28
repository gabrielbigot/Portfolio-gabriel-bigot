/*
 * charts-more.js — 27 formes supplémentaires de la Visual Research Library, réécrites localement (aucun code Lieflat) :
 * heatmap, calendar, beeswarm, boxplot, ridgeline, histogram, scatter, radar, sunburst, circlepack, chord, alluvial, arc,
 * marimekko, donut, pareto, bump, tornado, riskmatrix, stacked (aires empilées / streamgraph), pyramid, lines (multi-courbes + bandes),
 * sparkgrid (petits multiples), parallel, cscatter (nuage connecté), forest.
 * Généré par concaténation de src-more/*.js (ne pas éditer le fichier généré : modifier les sources puis `bash build-more.sh`).
 * À charger APRÈS charts.js et charts-extra.js.
 */
(function (global) {
  'use strict';
  const C = global.VRACharts; if (!C || !C.helpers) return;
  const { d3, fmt, wrapLines, measure, frame, addPatterns, stateStyle, legend, interactive, axisStyle, STATE_LABEL } = C.helpers;
  const SANS = 'var(--vra-sans, system-ui)', MONO = 'var(--vra-mono, ui-monospace)';
  const font = (w, s, f) => `${w} ${s}px ${f || SANS}`;
  const uid = () => 'm' + Math.random().toString(36).slice(2, 7);
  const isNarrow = el => (el.clientWidth || 640) < 520;
  const PAL = T => [T.c1, T.c3, T.c4, T.c2, T.c5, T.neg];
  const col = (T, k, i) => k ? (T[k] || k) : PAL(T)[(i || 0) % 6];
  const isSoft = s => /^(forecast|claim|gap)$/.test(s || '');
  function paint(sel, T, id, getState, getColor) {
    sel.each(function (d, i) {
      const st = stateStyle(getState(d) || 'actual', id, T), c = getColor ? getColor(d, i) : null, solid = !isSoft(getState(d));
      d3.select(this).attr('fill', (c && solid) ? c : st.fill).attr('fill-opacity', st.fillOpacity == null ? 1 : st.fillOpacity)
        .attr('stroke', c || st.stroke).attr('stroke-width', st.sw).attr('stroke-dasharray', st.dash);
    });
  }
  const txt = (sel, x, y, t, o) => { o = o || {}; return sel.append('text').attr('x', x).attr('y', y).attr('text-anchor', o.a || 'start').attr('fill', o.c || 'currentColor').attr('stroke', o.halo || 'none').attr('stroke-width', o.halo ? 3 : 0).attr('paint-order', 'stroke').style('font', o.f || font(500, 12)).style('pointer-events', 'none').text(t); };
  const statesOf = (arr, k) => arr.map(d => d[k || 'state'] || 'actual');
  const num = (v, d) => fmt(v, d == null ? 1 : d);
  /* étiquettes de lignes à gauche, sur 1–3 lignes */
  function rowLabel(g, label, cy, labelW, T, size, weight) {
    const lines = wrapLines(label, labelW - 12, size || 12.5, weight || 600), t = g.append('text').attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(weight || 600, size || 12.5));
    const n = Math.min(lines.length, 3); lines.slice(0, 3).forEach((ln, k) => t.append('tspan').attr('x', -10).attr('y', cy - (n - 1) * 7 + k * 14.5 + 4).text(ln));
  }
  /* superposition d'état pour les formes dont la couleur encode une valeur */
  function softOverlay(g, sel, id, getState, geom) {
    sel.each(function (d) { if (isSoft(getState(d))) { const b = geom(d, this); g.append('rect').attr('x', b.x).attr('y', b.y).attr('width', b.w).attr('height', b.h).attr('rx', b.rx || 0).attr('fill', `url(#${id}-${getState(d)})`).attr('fill-opacity', .5).style('pointer-events', 'none'); } });
  }
  const seq = (T, t) => d3.interpolateRgb(T.bg, T.c1)(.08 + .92 * t);
  const div = (T, t) => t < .5 ? d3.interpolateRgb(T.c3, T.bg)(t * 2) : d3.interpolateRgb(T.bg, T.c1)((t - .5) * 2);
  const ink = (T, bgc) => { const c = d3.hsl(bgc); return c.l > .62 ? '#1a1a1a' : '#fff'; };
  const tableOf = (head, fn, key) => (f, r) => r(head, (f[key || 'data'] || []).map(fn));
  const REG = (type, fn, table) => C.register(type, fn, table);
  const SL = s => STATE_LABEL[s || 'actual'];
  const mkScale = (lg, dom, rng) => (lg ? d3.scaleLog() : d3.scaleLinear()).domain(dom).range(rng);

  /* ============================== HEATMAP (heatmap, correlogram) ============================== */
  function heatmap(el, f, T) {
    const id = uid(), comp = isNarrow(el), X = f.x, Y = f.y, labelW = comp ? 80 : 150, top = comp ? 64 : 40;
    const cw = Math.max(26, ((el.clientWidth || 640) - labelW - 24) / X.length), ch = comp ? 34 : 38;
    const F = frame(el, id, top + Y.length * ch + 66, { l: labelW, r: 10, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const vals = f.data.map(d => d.value), lo = f.min != null ? f.min : d3.min(vals), hi = f.max != null ? f.max : d3.max(vals), diverging = f.scheme === 'div';
    const S = d3.scaleLinear([lo, hi], [0, 1]).clamp(true), color = v => diverging ? div(T, S(v)) : seq(T, S(v));
    X.forEach((x, j) => { const t = txt(F.g, j * cw + cw / 2, top - 8, comp ? String(x).slice(0, 8) : x, { a: comp ? 'start' : 'middle', f: font(600, comp ? 11 : 12), c: T.ink }); if (comp) t.attr('transform', `rotate(-40 ${j * cw + cw / 2},${top - 8})`); });
    Y.forEach((y, i) => rowLabel(F.g, y, top + i * ch + ch / 2, labelW, T, 12, 600));
    const cells = F.g.selectAll('rect.hm').data(f.data).join('rect').attr('class', 'hm').attr('x', d => X.indexOf(d.x) * cw + 1).attr('y', d => top + Y.indexOf(d.y) * ch + 1).attr('width', cw - 2).attr('height', ch - 2).attr('rx', 3).attr('fill', d => color(d.value)).attr('stroke', T.line).attr('stroke-width', .6);
    softOverlay(F.g, cells, id, d => d.state, d => ({ x: X.indexOf(d.x) * cw + 1, y: top + Y.indexOf(d.y) * ch + 1, w: cw - 2, h: ch - 2, rx: 3 }));
    interactive(cells, d => ({ title: d.y + ' · ' + d.x, value: num(d.value, f.dec) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T);
    if (f.showValues !== false && cw > 30) F.g.selectAll('text.hv').data(f.data).join('text').attr('class', 'hv').attr('x', d => X.indexOf(d.x) * cw + cw / 2).attr('y', d => top + Y.indexOf(d.y) * ch + ch / 2 + 4).attr('text-anchor', 'middle').style('font', font(600, 11.5, MONO)).style('pointer-events', 'none').attr('fill', d => ink(T, color(d.value))).text(d => num(d.value, f.dec));
    /* échelle de couleur */
    const gy = top + Y.length * ch + 18, gid = id + '-g', gr = F.defs.append('linearGradient').attr('id', gid);
    d3.range(0, 1.01, .1).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', diverging ? div(T, t) : seq(T, t)));
    F.g.append('rect').attr('x', 0).attr('y', gy).attr('width', Math.min(240, F.iw)).attr('height', 12).attr('rx', 3).attr('fill', `url(#${gid})`).attr('stroke', T.line);
    txt(F.g, 0, gy + 28, num(lo, f.dec) + ' ' + (f.unit || ''), { f: font(500, 11), c: T.mid }); txt(F.g, Math.min(240, F.iw), gy + 28, num(hi, f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(500, 11), c: T.mid });
    legend(el, statesOf(f.data));
  }
  REG('heatmap', heatmap, tableOf(['Ligne', 'Colonne', 'Valeur', 'État', 'Source'], d => [d.y, d.x, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== CALENDRIER (calendar-heatmap) ============================== */
  function calendar(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.map(d => ({ ...d, t: new Date(d.date) })), from = d3.timeMonday.floor(new Date(f.from || d3.min(D, d => d.t))), to = new Date(f.to || d3.max(D, d => d.t));
    const weeks = d3.timeMonday.count(from, to) + 1, labelW = 30, cell = Math.max(6, Math.min(20, ((el.clientWidth || 640) - labelW - 10) / weeks)), H = 7 * cell + 90;
    const F = frame(el, id, H, { l: labelW, r: 4, t: 22, b: 4 }); addPatterns(F.defs, id, T);
    const lo = 0, hi = f.max != null ? f.max : d3.max(D, d => d.value), S = d3.scaleLinear([lo, hi], [0, 1]).clamp(true);
    ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((d, i) => { if (i % 2 === 0) txt(F.g, -6, i * cell + cell * .8, d, { a: 'end', f: font(500, 10), c: T.mid }); });
    const byDay = new Map(D.map(d => [d3.timeFormat('%Y-%m-%d')(d.t), d]));
    const days = d3.timeDays(from, d3.timeDay.offset(to, 1));
    const cells = F.g.selectAll('rect.cd').data(days).join('rect').attr('class', 'cd').attr('x', d => d3.timeMonday.count(from, d) * cell).attr('y', d => ((d.getDay() + 6) % 7) * cell).attr('width', cell - 1.5).attr('height', cell - 1.5).attr('rx', 2)
      .attr('fill', d => { const v = byDay.get(d3.timeFormat('%Y-%m-%d')(d)); return v ? seq(T, S(v.value)) : 'none'; }).attr('stroke', T.line).attr('stroke-width', .5).attr('stroke-opacity', .6);
    interactive(cells.filter(d => byDay.has(d3.timeFormat('%Y-%m-%d')(d))), d => { const v = byDay.get(d3.timeFormat('%Y-%m-%d')(d)); return { title: d3.timeFormat('%A %d %B %Y')(d), value: num(v.value, f.dec) + ' ' + (f.unit || ''), state: v.state, src: v.src, detail: v.note }; }, T);
    let last = -1; days.forEach(d => { if (d.getDate() <= 7 && d.getDay() === 1 || (d.getTime() === from.getTime())) { const m = d.getMonth(); if (m !== last) { last = m; txt(F.g, d3.timeMonday.count(from, d) * cell, -8, d3.timeFormat('%b')(d), { f: font(600, 10.5), c: T.mid }); } } });
    const gy = 7 * cell + 14, gid = id + '-g', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .1).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', seq(T, t)));
    F.g.append('rect').attr('x', 0).attr('y', gy).attr('width', 160).attr('height', 10).attr('rx', 3).attr('fill', `url(#${gid})`).attr('stroke', T.line);
    txt(F.g, 0, gy + 26, '0', { f: font(500, 11), c: T.mid }); txt(F.g, 160, gy + 26, num(hi, 0) + ' ' + (f.unit || ''), { a: 'end', f: font(500, 11), c: T.mid });
    legend(el, statesOf(D));
  }
  REG('calendar', calendar, tableOf(['Date', 'Valeur', 'État', 'Source'], d => [d.date, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== BEESWARM ============================== */
  function beeswarm(el, f, T) {
    const id = uid(), comp = isNarrow(el), G = f.groups || [...new Set(f.data.map(d => d.group))], r = comp ? 4.5 : 5.5, labelW = comp ? 90 : 170;
    const rowH = (f.rowHeight || (comp ? 74 : 84)), F = frame(el, id, G.length * rowH + 44, { l: labelW, r: 14, t: 6, b: 32 }); addPatterns(F.defs, id, T);
    const lo = f.min != null ? f.min : d3.min(f.data, d => d.value), hi = f.max != null ? f.max : d3.max(f.data, d => d.value), X = d3.scaleLinear([lo, hi], [0, F.iw]).nice();
    axisStyle(F.g.append('g').attr('transform', `translate(0,${G.length * rowH})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(v => num(v, 0) + (f.unit === '%' ? ' %' : '')).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 8)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', G.length * rowH).attr('stroke', T.line).attr('stroke-opacity', .4);
    const pts = [];
    G.forEach((g, gi) => {
      const cy = gi * rowH + rowH / 2; rowLabel(F.g, g, cy, labelW, T, 12.5, 600);
      F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', cy).attr('y2', cy).attr('stroke', T.line).attr('stroke-dasharray', '1 4');
      const placed = []; f.data.filter(d => d.group === g).sort((a, b) => a.value - b.value).forEach(d => {
        const x = X(d.value); let y = 0, k = 0;
        const clash = yy => placed.some(p => Math.hypot(p.x - x, p.y - yy) < r * 2 + .6);
        while (clash(y) && k < 60) { k++; y = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (r * 1.1); }
        placed.push({ x, y }); pts.push({ ...d, px: x, py: cy + Math.max(-rowH / 2 + r, Math.min(rowH / 2 - r, y)) });
      });
    });
    const dots = F.g.selectAll('circle.bs').data(pts).join('circle').attr('class', 'bs').attr('cx', d => d.px).attr('cy', d => d.py).attr('r', r);
    paint(dots, T, id, d => d.state, d => col(T, d.color, G.indexOf(d.group)));
    interactive(dots, d => ({ title: d.label || d.group, value: num(d.value, f.dec) + (f.unit === '%' ? ' %' : ' ' + (f.unit || '')), state: d.state, src: d.src, detail: d.note || d.group }), T);
    legend(el, statesOf(f.data));
  }
  REG('beeswarm', beeswarm, tableOf(['Groupe', 'Observation', 'Valeur', 'État', 'Source'], d => [d.group, d.label || '', num(d.value, 2), SL(d.state), d.src]));

  /* ============================== BOXPLOT (résumés) ============================== */
  function boxplot(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 54 : 56, labelW = comp ? 100 : 180;
    const F = frame(el, id, D.length * band + 44, { l: labelW, r: 16, t: 6, b: 32 }); addPatterns(F.defs, id, T);
    const lo = f.min != null ? f.min : d3.min(D, d => Math.min(d.min, ...(d.out || []))), hi = f.max != null ? f.max : d3.max(D, d => Math.max(d.max, ...(d.out || []))), X = d3.scaleLinear([lo, hi], [0, F.iw]).nice();
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(v => num(v, 0)).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 8)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .4);
    D.forEach((d, i) => {
      const cy = i * band + band / 2, h = band * .5; rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600);
      F.g.append('line').attr('x1', X(d.min)).attr('x2', X(d.max)).attr('y1', cy).attr('y2', cy).attr('stroke', T.ink).attr('stroke-width', 1.4);
      [d.min, d.max].forEach(v => F.g.append('line').attr('x1', X(v)).attr('x2', X(v)).attr('y1', cy - h / 3).attr('y2', cy + h / 3).attr('stroke', T.ink).attr('stroke-width', 1.4));
      const box = F.g.append('rect').datum(d).attr('x', X(d.q1)).attr('y', cy - h / 2).attr('width', Math.max(2, X(d.q3) - X(d.q1))).attr('height', h).attr('rx', 2); paint(box, T, id, dd => dd.state, () => col(T, d.color, 0));
      F.g.append('line').attr('x1', X(d.med)).attr('x2', X(d.med)).attr('y1', cy - h / 2).attr('y2', cy + h / 2).attr('stroke', T.bg).attr('stroke-width', 3);
      (d.out || []).forEach(o => F.g.append('circle').attr('cx', X(o)).attr('cy', cy).attr('r', 3.5).attr('fill', 'none').attr('stroke', T.ink).attr('stroke-width', 1.4));
      interactive(box, dd => ({ title: dd.label, value: `médiane ${num(dd.med, 1)} · Q1–Q3 ${num(dd.q1, 1)}–${num(dd.q3, 1)} · min–max ${num(dd.min, 1)}–${num(dd.max, 1)} ${f.unit || ''}`, state: dd.state, src: dd.src, detail: dd.note }), T);
    });
    legend(el, statesOf(D));
  }
  REG('boxplot', boxplot, tableOf(['Groupe', 'Min', 'Q1', 'Médiane', 'Q3', 'Max', 'Source'], d => [d.label, d.min, d.q1, d.med, d.q3, d.max, d.src]));

  /* ============================== RIDGELINE (densités) ============================== */
  function ridgeline(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 46 : 52, labelW = comp ? 90 : 170, overlap = 1.9;
    const F = frame(el, id, D.length * band + 52 + band * (overlap - 1), { l: labelW, r: 14, t: band * (overlap - 1) + 4, b: 34 }); addPatterns(F.defs, id, T);
    const all = D.flatMap(d => d.values), lo = f.min != null ? f.min : d3.min(all), hi = f.max != null ? f.max : d3.max(all), X = d3.scaleLinear([lo, hi], [0, F.iw]).nice(), ticks = X.ticks(60);
    const kde = vals => { const n = vals.length, sd = d3.deviation(vals) || 1, bw = f.bandwidth || 1.06 * sd * Math.pow(n, -.2); return ticks.map(t => [t, d3.mean(vals, v => Math.exp(-0.5 * Math.pow((t - v) / bw, 2)) / (bw * Math.sqrt(2 * Math.PI)))]); };
    const dens = D.map(d => kde(d.values)), mx = d3.max(dens, a => d3.max(a, p => p[1])), Yd = d3.scaleLinear([0, mx], [0, band * overlap]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(v => num(v, 0)).tickSizeOuter(0)), T);
    D.forEach((d, i) => {
      const base = (i + 1) * band, a = d3.area().x(p => X(p[0])).y0(base).y1(p => base - Yd(p[1])).curve(d3.curveBasis);
      rowLabel(F.g, d.label, base - 6, labelW, T, 12, 600);
      const sh = F.g.append('path').datum(d).attr('d', a(dens[i])); paint(sh, T, id, dd => dd.state, () => col(T, d.color, i)); sh.attr('fill-opacity', isSoft(d.state) ? 1 : .55).attr('stroke-width', 1.6);
      interactive(sh, dd => ({ title: dd.label, value: `médiane ${num(d3.median(dd.values), 1)} · n = ${dd.values.length}`, state: dd.state, src: dd.src, detail: dd.note }), T);
      F.g.append('line').attr('x1', X(d3.median(d.values))).attr('x2', X(d3.median(d.values))).attr('y1', base).attr('y2', base - Yd(d3.max(dens[i], p => p[1])) * .8).attr('stroke', T.ink).attr('stroke-dasharray', '2 3');
    });
    legend(el, statesOf(D));
  }
  REG('ridgeline', ridgeline, tableOf(['Groupe', 'n', 'Médiane', 'Source'], d => [d.label, d.values.length, num(d3.median(d.values), 2), d.src]));

  /* ============================== HISTOGRAMME ============================== */
  function histogram(el, f, T) {
    const id = uid(), comp = isNarrow(el), vals = f.values || f.data.map(d => d.value), F = frame(el, id, comp ? 290 : 340, { l: 44, t: 22, r: 16, b: 40 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear(d3.extent(vals), [0, F.iw]).nice(), bins = d3.bin().domain(X.domain()).thresholds(f.bins || 12)(vals), Y = d3.scaleLinear([0, d3.max(bins, b => b.length)], [F.ih, 0]).nice();
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .45); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 5 : 9).tickFormat(v => num(v, 0) + (f.unit === '%' ? ' %' : '')).tickSizeOuter(0)), T);
    const bars = F.g.selectAll('rect').data(bins).join('rect').attr('x', b => X(b.x0) + 1).attr('width', b => Math.max(1, X(b.x1) - X(b.x0) - 2)).attr('y', b => Y(b.length)).attr('height', b => F.ih - Y(b.length)).attr('rx', 2);
    paint(bars, T, id, () => f.state, () => T.c1);
    interactive(bars, b => ({ title: `${num(b.x0, 1)} – ${num(b.x1, 1)} ${f.unit || ''}`, value: b.length + ' observations', state: f.state, src: f.src }), T);
    (f.refs || []).forEach(r => { F.g.append('line').attr('x1', X(r.value)).attr('x2', X(r.value)).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.neg).attr('stroke-width', 2).attr('stroke-dasharray', '5 4'); txt(F.g, X(r.value) + 5, 12, r.label, { f: font(600, 11.5), c: T.neg, halo: T.bg }); });
    txt(F.g, -34, -8, 'Nombre', { f: font(500, 11), c: T.mid });
    legend(el, [f.state || 'actual']);
  }
  REG('histogram', histogram, (f, r) => r(['Valeur', 'Source'], (f.values || f.data.map(d => d.value)).map(v => [num(v, 2), f.src])));

  /* ============================== SCATTER / BUBBLE (+ tendance) ============================== */
  function scatter(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, F = frame(el, id, comp ? 330 : 420, { l: comp ? 46 : 58, t: 14, r: 18, b: 52 }); addPatterns(F.defs, id, T);
    const sc = (lg, a, b, rng) => mkScale(lg, [a, b], rng);
    const xs = D.map(d => d.x), ys = D.map(d => d.y);
    const X = sc(f.logX, f.xmin != null ? f.xmin : d3.min(xs), f.xmax != null ? f.xmax : d3.max(xs), [0, F.iw]), Y = sc(f.logY, f.ymin != null ? f.ymin : d3.min(ys), f.ymax != null ? f.ymax : d3.max(ys), [F.ih, 0]); if (!f.logX) X.nice(); if (!f.logY) Y.nice();
    F.g.append('g').call(d3.axisLeft(Y).ticks(5, f.logY ? '~s' : undefined).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .45); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 5 : 8, f.logX ? '~s' : undefined).tickSizeOuter(0)), T);
    txt(F.g, F.iw / 2, F.ih + 40, f.xLabel || '', { a: 'middle', f: font(600, 11.5), c: T.mid }); txt(F.g, -F.m.l + 6, -4, f.yLabel || '', { f: font(600, 11.5), c: T.mid });
    (f.vlines || []).forEach(l => { F.g.append('line').attr('x1', X(l.value)).attr('x2', X(l.value)).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.ink).attr('stroke-dasharray', '5 4'); txt(F.g, X(l.value) + 4, 12, l.label || '', { f: font(600, 11), c: T.ink, halo: T.bg }); });
    (f.hlines || []).forEach(l => { F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(l.value)).attr('y2', Y(l.value)).attr('stroke', T.ink).attr('stroke-dasharray', '5 4'); txt(F.g, F.iw - 4, Y(l.value) - 5, l.label || '', { a: 'end', f: font(600, 11), c: T.ink, halo: T.bg }); });
    (f.segments || []).forEach(sg => { F.g.append('line').attr('x1', X(sg.x1)).attr('y1', Y(sg.y1)).attr('x2', X(sg.x2)).attr('y2', Y(sg.y2)).attr('stroke', T.ink).attr('stroke-width', sg.width || 1.6).attr('stroke-dasharray', sg.dash === false ? null : '6 4'); if (sg.label) txt(F.g, X(sg.x2) - 4, Y(sg.y2) - 6, sg.label, { a: 'end', f: font(600, 11), c: T.ink, halo: T.bg }); });
    if (f.trend && D.length > 2) { const n = D.length, mx = d3.mean(xs), my = d3.mean(ys), b = d3.sum(D, d => (d.x - mx) * (d.y - my)) / d3.sum(D, d => (d.x - mx) ** 2), a = my - b * mx, x0 = d3.min(xs), x1 = d3.max(xs); F.g.append('line').attr('x1', X(x0)).attr('x2', X(x1)).attr('y1', Y(a + b * x0)).attr('y2', Y(a + b * x1)).attr('stroke', T.neg).attr('stroke-width', 2).attr('stroke-dasharray', '6 4'); txt(F.g, X(x1) - 4, Y(a + b * x1) - 8, 'tendance linéaire (calculée)', { a: 'end', f: font(600, 11), c: T.neg, halo: T.bg }); }
    const groups = [...new Set(D.map(d => d.group).filter(Boolean))], rr = d3.scaleSqrt([0, d3.max(D, d => d.r || 1)], [0, comp ? 18 : 26]);
    const dots = F.g.selectAll('circle.sc').data(D).join('circle').attr('class', 'sc').attr('cx', d => X(d.x)).attr('cy', d => Y(d.y)).attr('r', d => d.r != null ? Math.max(3, rr(d.r)) : (comp ? 6 : 7));
    paint(dots, T, id, d => d.state, d => col(T, d.color, groups.indexOf(d.group)));
    dots.attr('fill-opacity', d => isSoft(d.state) ? 1 : .72);
    interactive(dots, d => ({ title: d.label, value: `${f.xLabel || 'x'} : ${num(d.x, 2)} · ${f.yLabel || 'y'} : ${num(d.y, 2)}` + (d.r != null ? ` · taille : ${num(d.r, 1)}` : ''), state: d.state, src: d.src, detail: d.note }), T);
    D.filter(d => d.showLabel).forEach(d => txt(F.g, X(d.x) + (comp ? 8 : 11), Y(d.y) + 4, d.label, { f: font(600, comp ? 11 : 12), c: T.ink, halo: T.bg }));
    legend(el, statesOf(D));
    if (groups.length) { const ul = el.parentNode.querySelector('.fig-legend'); groups.forEach(g => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="${col(T, (D.find(d => d.group === g) || {}).color, groups.indexOf(g))}"/></svg>${g}`; ul.appendChild(li); }); }
  }
  REG('scatter', scatter, tableOf(['Élément', 'x ; y', 'Source'], d => [d.label, num(d.x, 2) + ' ; ' + num(d.y, 2), d.src]));

  /* ============================== RADAR ============================== */
  function radar(el, f, T) {
    const id = uid(), comp = isNarrow(el), A = f.axes, n = A.length, S = comp ? 300 : 380, R = S / 2 - (comp ? 46 : 62), max = f.max || 100;
    const F = frame(el, id, S + 20, { l: 6, r: 6, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const cx = F.iw / 2, cy = S / 2 + 6, ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = (i, v) => [cx + R * v / max * Math.cos(ang(i)), cy + R * v / max * Math.sin(ang(i))];
    [.25, .5, .75, 1].forEach(k => { F.g.append('polygon').attr('points', A.map((a, i) => pt(i, max * k).join(',')).join(' ')).attr('fill', 'none').attr('stroke', T.line); if (k < 1 || true) txt(F.g, cx + 3, cy - R * k + 11, num(max * k, 0), { f: font(500, 9.5), c: T.lo }); });
    A.forEach((a, i) => { const [x, y] = pt(i, max); F.g.append('line').attr('x1', cx).attr('y1', cy).attr('x2', x).attr('y2', y).attr('stroke', T.line); const lx = cx + (R + 12) * Math.cos(ang(i)), ly = cy + (R + 12) * Math.sin(ang(i)), anc = Math.abs(Math.cos(ang(i))) < .2 ? 'middle' : Math.cos(ang(i)) > 0 ? 'start' : 'end'; const lines = wrapLines(a, comp ? 70 : 100, 11.5, 600), t = F.g.append('text').attr('text-anchor', anc).attr('fill', T.ink).style('font', font(600, 11.5)); lines.slice(0, 2).forEach((ln, k) => t.append('tspan').attr('x', lx).attr('y', ly + 4 + k * 13 - (Math.sin(ang(i)) < -.3 ? (lines.length - 1) * 13 : 0)).text(ln)); });
    f.series.forEach((s, si) => {
      const c = col(T, s.color, si), poly = F.g.append('polygon').datum(s).attr('points', s.values.map((v, i) => pt(i, v).join(',')).join(' ')).attr('fill', isSoft(s.state) ? `url(#${id}-${s.state})` : c).attr('fill-opacity', isSoft(s.state) ? .7 : .22).attr('stroke', c).attr('stroke-width', 2.4).attr('stroke-dasharray', stateStyle(s.state || 'actual', id, T).dash);
      interactive(poly, d => ({ title: d.label, value: A.map((a, i) => `${a} ${num(d.values[i], 0)}`).join(' · '), state: d.state, src: d.src, detail: d.note }), T);
      s.values.forEach((v, i) => { const [x, y] = pt(i, v); F.g.append('circle').attr('cx', x).attr('cy', y).attr('r', 4).attr('fill', c).attr('stroke', T.bg); });
    });
    legend(el, statesOf(f.series));
    const ul = el.parentNode.querySelector('.fig-legend'); f.series.forEach((s, si) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, s.color, si)}"/></svg>${s.label}`; ul.appendChild(li); });
  }
  REG('radar', radar, (f, r) => r(['Axe', ...f.series.map(s => s.label), 'Source'], f.axes.map((a, i) => [a, ...f.series.map(s => num(s.values[i], 1)), f.series[0].src])));

  /* ============================== helpers hiérarchie ============================== */
  const hier = f => d3.hierarchy(f.root).sum(d => d.children ? 0 : d.value || 0).sort((a, b) => b.value - a.value);
  const branchOf = d => { let n = d; while (n.depth > 1) n = n.parent; return n; };

  /* ============================== SUNBURST ============================== */
  function sunburst(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W - 12, comp ? 340 : 460), R = S / 2;
    const F = frame(el, id, S + 12, { l: 0, r: 0, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const root = hier(f), P = d3.partition().size([2 * Math.PI, R])(root), branches = root.children || [];
    const arc = d3.arc().startAngle(d => d.x0).endAngle(d => d.x1).padAngle(.008).innerRadius(d => d.y0 * .98 + 2).outerRadius(d => d.y1 - 1);
    const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 6})`), nodes = root.descendants().filter(d => d.depth > 0);
    const paths = g.selectAll('path').data(nodes).join('path').attr('d', arc);
    paint(paths, T, id, d => d.data.state, d => { const b = branchOf(d), c = d3.color(col(T, b.data.color, branches.indexOf(b))); return d.depth > 1 ? c.brighter(.25 * (d.depth - 1)).formatHex() : c.formatHex(); });
    interactive(paths, d => ({ title: d.ancestors().reverse().slice(1).map(n => n.data.name).join(' › '), value: num(d.value, 1) + ' ' + (f.unit || '') + ' · ' + num(100 * d.value / root.value, 0) + ' % du total', state: d.data.state, src: d.data.src || (branchOf(d).data.src), detail: d.data.note }), T);
    nodes.filter(d => (d.x1 - d.x0) * (d.y0 + d.y1) / 2 > (comp ? 38 : 44) && d.y1 - d.y0 > 20).forEach(d => {
      const a = (d.x0 + d.x1) / 2 - Math.PI / 2, rr = (d.y0 + d.y1) / 2, rot = a * 180 / Math.PI, flip = rot > 90 || rot < -90;
      g.append('text').attr('transform', `translate(${rr * Math.cos(a)},${rr * Math.sin(a)}) rotate(${flip ? rot + 180 : rot})`).attr('text-anchor', 'middle').attr('dy', '.35em').attr('fill', '#fff').attr('stroke', 'rgba(0,0,0,.25)').attr('stroke-width', 2.5).attr('paint-order', 'stroke').style('font', font(700, 10.5)).style('pointer-events', 'none').text(String(d.data.name).slice(0, Math.floor((d.y1 - d.y0) / 6)));
    });
    txt(g, 0, -2, num(root.value, 0), { a: 'middle', f: font(700, 20, MONO), c: T.ink }); txt(g, 0, 16, f.unit || '', { a: 'middle', f: font(500, 11), c: T.mid });
    legend(el, nodes.map(d => d.data.state || 'actual'));
    const ul = el.parentNode.querySelector('.fig-legend'); branches.forEach((b, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, b.data.color, i)}"/></svg>${b.data.name}`; ul.appendChild(li); });
  }
  REG('sunburst', sunburst, (f, r) => { const rows = []; (function walk(n, path) { const p = path.concat(n.name); if (n.children) n.children.forEach(c => walk(c, p)); else rows.push([p.slice(1).join(' › '), n.value, n.src || '']); })(f.root, []); return r(['Chemin', 'Valeur', 'Source'], rows); });

  /* ============================== CIRCLE PACKING ============================== */
  function circlepack(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W - 12, comp ? 340 : 520);
    const F = frame(el, id, S + 12, { l: 0, r: 0, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const root = hier(f), P = d3.pack().size([S - 4, S - 4]).padding(4)(root), branches = root.children || [];
    const g = F.g.append('g').attr('transform', `translate(${(F.iw - S) / 2 + 2},2)`);
    const circles = g.selectAll('circle').data(root.descendants().filter(d => d.depth > 0)).join('circle').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r);
    circles.each(function (d) { const b = branchOf(d), c = col(T, b.data.color, branches.indexOf(b)); const st = stateStyle(d.data.state || 'actual', id, T); d3.select(this).attr('fill', d.children ? c : (isSoft(d.data.state) ? st.fill : c)).attr('fill-opacity', d.children ? .12 : .78).attr('stroke', c).attr('stroke-width', d.children ? 1.5 : st.sw).attr('stroke-dasharray', d.children ? null : st.dash); });
    interactive(circles, d => ({ title: d.ancestors().reverse().slice(1).map(n => n.data.name).join(' › '), value: num(d.value, 1) + ' ' + (f.unit || '') + ' · ' + num(100 * d.value / root.value, 0) + ' %', state: d.data.state, src: d.data.src || branchOf(d).data.src, detail: d.data.note }), T);
    root.leaves().filter(d => d.r > (comp ? 16 : 20)).forEach(d => { const lines = wrapLines(d.data.name, d.r * 1.7, 10.5, 700).slice(0, 2); const t = g.append('text').attr('text-anchor', 'middle').attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 2.5).attr('paint-order', 'stroke').style('font', font(700, 10.5)).style('pointer-events', 'none'); lines.forEach((ln, k) => t.append('tspan').attr('x', d.x).attr('y', d.y + 4 + (k - (lines.length - 1) / 2) * 12).text(ln)); });
    root.children.filter(b => b.r > 40).forEach((b, i) => txt(g, b.x, b.y - b.r + 14, b.data.name, { a: 'middle', f: font(700, 11.5), c: col(T, b.data.color, i), halo: T.bg }));
    legend(el, root.leaves().map(d => d.data.state || 'actual'));
  }
  REG('circlepack', circlepack, (f, r) => { const rows = []; (function walk(n, path) { const p = path.concat(n.name); if (n.children) n.children.forEach(c => walk(c, p)); else rows.push([p.slice(1).join(' › '), n.value, n.src || '']); })(f.root, []); return r(['Chemin', 'Valeur', 'Source'], rows); });

  /* ============================== CHORD ============================== */
  function chord(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W, comp ? 340 : 480), R = S / 2 - (comp ? 44 : 70), N = f.nodes, idx = Object.fromEntries(N.map((n, i) => [n.id, i]));
    const F = frame(el, id, S + 6, { l: 0, r: 0, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const M = N.map(() => N.map(() => 0)); f.links.forEach(l => { M[idx[l.s]][idx[l.t]] += l.v; });
    const ch = d3.chordDirected ? d3.chordDirected().padAngle(.06).sortSubgroups(d3.descending)(M) : d3.chord().padAngle(.06)(M);
    const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 3})`);
    const rib = (d3.ribbonArrow ? d3.ribbonArrow().radius(R - 2).padAngle(.01) : d3.ribbon().radius(R - 2));
    const links = g.append('g').selectAll('path').data(ch).join('path').attr('d', rib).each(function (d) { const L = f.links.find(l => idx[l.s] === d.source.index && idx[l.t] === d.target.index) || {}; d._l = L; const c = col(T, N[d.source.index].color, d.source.index); const st = stateStyle(L.state || 'actual', id, T); d3.select(this).attr('fill', isSoft(L.state) ? st.fill : c).attr('fill-opacity', isSoft(L.state) ? 1 : .55).attr('stroke', c).attr('stroke-width', .8).attr('stroke-dasharray', st.dash); });
    interactive(links, d => ({ title: N[d.source.index].label + ' → ' + N[d.target.index].label, value: num(d._l.v, 1) + ' ' + (f.unit || ''), state: d._l.state, src: d._l.src, detail: d._l.note || d._l.d }), T);
    const arcs = g.append('g').selectAll('path').data(ch.groups).join('path').attr('d', d3.arc().innerRadius(R).outerRadius(R + 12)).attr('fill', d => col(T, N[d.index].color, d.index));
    interactive(arcs, d => ({ title: N[d.index].label, value: num(d.value, 1) + ' ' + (f.unit || '') + ' (sortants)', src: N[d.index].src }), T);
    ch.groups.forEach(d => { const a = (d.startAngle + d.endAngle) / 2 - Math.PI / 2, rr = R + 20; const x = rr * Math.cos(a), y = rr * Math.sin(a); txt(g, x, y + 4, comp ? N[d.index].label.slice(0, 9) : N[d.index].label, { a: Math.cos(a) > .15 ? 'start' : Math.cos(a) < -.15 ? 'end' : 'middle', f: font(700, 11.5), c: T.ink }); });
    legend(el, f.links.map(l => l.state || 'actual'));
  }
  REG('chord', chord, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, num(l.v, 2), l.src || ''])));

  /* ============================== ALLUVIAL (flux multi-étapes) ============================== */
  function alluvial(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, stages = f.stages, ns = stages.length, nodeW = 14, H = comp ? 380 : 440;
    const F = frame(el, id, H, { l: 4, r: 4, t: 30, b: 8 }); addPatterns(F.defs, id, T);
    const nodes = f.nodes.map(n => ({ ...n, in: 0, out: 0 })), by = Object.fromEntries(nodes.map(n => [n.id, n])), links = f.links.map(l => ({ ...l, S: by[l.s], T: by[l.t] }));
    links.forEach(l => { l.S.out += l.v; l.T.in += l.v; }); nodes.forEach(n => n.val = Math.max(n.in, n.out));
    const gap = 12, bySt = stages.map((_, i) => nodes.filter(n => n.stage === i)), avail = F.ih, scale = d3.min(bySt, a => (avail - gap * (a.length - 1)) / (d3.sum(a, n => n.val) || 1));
    const colX = i => ns === 1 ? 0 : i * ((F.iw - nodeW) / (ns - 1));
    bySt.forEach((a, i) => { const tot = d3.sum(a, n => n.val) * scale + gap * (a.length - 1); let y = (avail - tot) / 2; a.forEach(n => { n.x = colX(i); n.y = y; n.h = Math.max(2, n.val * scale); y += n.h + gap; n.oy = n.y; n.iy = n.y; }); });
    links.sort((a, b) => a.T.y - b.T.y || a.S.y - b.S.y); const outs = {}, ins = {};
    links.forEach(l => { l.w = l.v * scale; });
    nodes.forEach(n => { n.outL = links.filter(l => l.S === n).sort((a, b) => a.T.y - b.T.y); n.inL = links.filter(l => l.T === n).sort((a, b) => a.S.y - b.S.y); let y = n.y; n.outL.forEach(l => { l.sy = y + l.w / 2; y += l.w; }); y = n.y; n.inL.forEach(l => { l.ty = y + l.w / 2; y += l.w; }); });
    const paths = F.g.append('g').selectAll('path').data(links).join('path').attr('d', l => { const x0 = l.S.x + nodeW, x1 = l.T.x, mx = (x0 + x1) / 2; return `M${x0},${l.sy}C${mx},${l.sy} ${mx},${l.ty} ${x1},${l.ty}`; }).attr('fill', 'none').attr('stroke-width', l => Math.max(1, l.w));
    paths.each(function (l) { const c = col(T, l.S.color, nodes.indexOf(l.S)), st = stateStyle(l.state || 'actual', id, T); d3.select(this).attr('stroke', isSoft(l.state) ? st.stroke : c).attr('stroke-opacity', isSoft(l.state) ? .6 : .38).attr('stroke-dasharray', isSoft(l.state) ? '6 4' : null); });
    interactive(paths, l => ({ title: l.S.label + ' → ' + l.T.label, value: num(l.v, 1) + ' ' + (f.unit || ''), state: l.state, src: l.src, detail: l.note }), T);
    const rects = F.g.append('g').selectAll('rect').data(nodes).join('rect').attr('x', n => n.x).attr('y', n => n.y).attr('width', nodeW).attr('height', n => n.h).attr('rx', 2).attr('fill', (n, i) => col(T, n.color, i)).attr('stroke', T.bg);
    interactive(rects, n => ({ title: n.label, value: num(n.val, 1) + ' ' + (f.unit || ''), src: n.src }), T);
    nodes.forEach(n => { const left = n.stage === ns - 1 && ns > 1; const lines = wrapLines(n.label, comp ? 80 : 140, 11.5, 600).slice(0, 2), t = F.g.append('text').attr('text-anchor', left ? 'end' : 'start').attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 3).attr('paint-order', 'stroke').style('font', font(600, comp ? 10.5 : 11.5)).style('pointer-events', 'none'); lines.forEach((ln, k) => t.append('tspan').attr('x', left ? n.x - 5 : n.x + nodeW + 5).attr('y', n.y + n.h / 2 + 4 + (k - (lines.length - 1) / 2) * 12).text(ln)); });
    stages.forEach((s, i) => txt(F.g, colX(i) + (i === 0 ? 0 : i === ns - 1 ? nodeW : nodeW / 2), -12, s, { a: i === 0 ? 'start' : i === ns - 1 ? 'end' : 'middle', f: font(700, 11), c: T.mid }));
    legend(el, links.map(l => l.state || 'actual'));
  }
  REG('alluvial', alluvial, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, num(l.v, 2), l.src || ''])));

  /* ============================== ARC DIAGRAM ============================== */
  function arc(el, f, T) {
    const id = uid(), comp = isNarrow(el), N = f.nodes, W = el.clientWidth || 640, H = comp ? 300 : 340, F = frame(el, id, H, { l: 16, r: 16, t: 8, b: comp ? 84 : 66 }); addPatterns(F.defs, id, T);
    const X = d3.scalePoint(N.map(n => n.id), [0, F.iw]).padding(.2), base = F.ih, vmax = d3.max(f.links, l => l.v) || 1, sw = d3.scaleLinear([0, vmax], [1.5, 9]);
    F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', base).attr('y2', base).attr('stroke', T.ink).attr('stroke-width', 1.4);
    const paths = F.g.selectAll('path.al').data(f.links).join('path').attr('class', 'al').attr('d', l => { const a = X(l.s), b = X(l.t), r = Math.abs(b - a) / 2; return `M${a},${base}A${r},${Math.min(r, base - 6)} 0 0 ${a < b ? 1 : 0} ${b},${base}`; }).attr('fill', 'none').attr('stroke-width', l => sw(l.v));
    paths.each(function (l) { const st = stateStyle(l.state || 'actual', id, T); d3.select(this).attr('stroke', col(T, (N.find(n => n.id === l.s) || {}).color, N.findIndex(n => n.id === l.s))).attr('stroke-opacity', isSoft(l.state) ? .5 : .55).attr('stroke-dasharray', st.dash); });
    interactive(paths, l => ({ title: N.find(n => n.id === l.s).label + ' ↔ ' + N.find(n => n.id === l.t).label, value: num(l.v, 1) + ' ' + (f.unit || ''), state: l.state, src: l.src, detail: l.note || l.d }), T);
    const dots = F.g.selectAll('circle.an').data(N).join('circle').attr('class', 'an').attr('cx', n => X(n.id)).attr('cy', base).attr('r', 6).attr('fill', (n, i) => col(T, n.color, i)).attr('stroke', T.bg).attr('stroke-width', 2);
    interactive(dots, n => ({ title: n.label, value: num(d3.sum(f.links.filter(l => l.s === n.id || l.t === n.id), l => l.v), 1) + ' ' + (f.unit || '') + ' (liens)', src: n.src }), T);
    N.forEach(n => { const t = txt(F.g, X(n.id), base + 18, comp ? n.label.slice(0, 10) : n.label, { a: comp ? 'end' : 'middle', f: font(600, 11.5), c: T.ink }); if (comp) t.attr('transform', `rotate(-50 ${X(n.id)},${base + 18})`); });
    legend(el, f.links.map(l => l.state || 'actual'));
  }
  REG('arc', arc, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, num(l.v, 2), l.src || ''])));

  /* ============================== MARIMEKKO ============================== */
  function marimekko(el, f, T) {
    const id = uid(), comp = isNarrow(el), C0 = f.cols, W = el.clientWidth || 640, H = comp ? 380 : 420, F = frame(el, id, H, { l: 4, r: 4, t: 22, b: 40 }); addPatterns(F.defs, id, T);
    const tot = c => d3.sum(c.parts, p => p.value), all = d3.sum(C0, tot), gap = 3, rows = [...new Set(C0.flatMap(c => c.parts.map(p => p.label)))];
    let x = 0; const avail = F.iw - gap * (C0.length - 1);
    C0.forEach(c => {
      const w = avail * tot(c) / all; let y = 0; const g = F.g.append('g');
      c.parts.forEach((p, i) => { const h = F.ih * p.value / tot(c), rc = g.append('rect').datum(p).attr('x', x).attr('y', y).attr('width', Math.max(1, w)).attr('height', Math.max(1, h - 1.5)).attr('rx', 2); paint(rc, T, id, d => d.state, () => col(T, p.color, rows.indexOf(p.label)));
        interactive(rc, d => ({ title: c.label + ' · ' + d.label, value: num(d.value, 1) + ' ' + (f.unit || '') + ' · ' + num(100 * d.value / tot(c), 0) + ' % de la colonne', state: d.state, src: d.src, detail: d.note }), T);
        if (h > 22 && w > 44) txt(g, x + w / 2, y + h / 2 + 4, num(100 * p.value / tot(c), 0) + ' %', { a: 'middle', f: font(700, 12, MONO), c: isSoft(p.state) ? T.ink : '#fff', halo: isSoft(p.state) ? T.bg : 'none' }); y += h; });
      const lines = wrapLines(c.label + ' · ' + num(tot(c), 0) + ' ' + (f.unit || ''), Math.max(w, 60), 11, 600).slice(0, 2), t = F.g.append('text').attr('text-anchor', 'middle').attr('fill', T.ink).style('font', font(600, 11));
      lines.forEach((ln, k) => t.append('tspan').attr('x', x + w / 2).attr('y', F.ih + 16 + k * 12).text(ln)); x += w + gap;
    });
    legend(el, C0.flatMap(c => statesOf(c.parts)));
    const ul = el.parentNode.querySelector('.fig-legend'); rows.forEach(r => { const p = C0.flatMap(c => c.parts).find(p => p.label === r), li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, p.color, rows.indexOf(r))}"/></svg>${r}`; ul.appendChild(li); });
  }
  REG('marimekko', marimekko, (f, r) => r(['Colonne', 'Part', 'Valeur', 'Source'], f.cols.flatMap(c => c.parts.map(p => [c.label, p.label, num(p.value, 2), p.src]))));

  /* ============================== DONUT ============================== */
  function donut(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, tot = d3.sum(D, d => d.value), S = comp ? 250 : 280, R = S / 2 - 6, H = comp ? S + D.length * 26 + 20 : S + 10;
    const F = frame(el, id, H, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const cx = comp ? F.iw / 2 : S / 2 + 10, g = F.g.append('g').attr('transform', `translate(${cx},${S / 2})`), pie = d3.pie().sort(null).value(d => d.value)(D), arcG = d3.arc().innerRadius(R * .62).outerRadius(R).padAngle(.015).cornerRadius(3);
    const paths = g.selectAll('path').data(pie).join('path').attr('d', arcG); paint(paths, T, id, d => d.data.state, (d, i) => col(T, d.data.color, i));
    interactive(paths, d => ({ title: d.data.label, value: num(d.data.value, 1) + ' ' + (f.unit || '') + ' · ' + num(100 * d.data.value / tot, 0) + ' %', state: d.data.state, src: d.data.src, detail: d.data.note }), T);
    txt(g, 0, -2, f.center || num(tot, 0), { a: 'middle', f: font(700, 22, MONO), c: T.ink }); txt(g, 0, 18, f.centerLabel || (f.unit || ''), { a: 'middle', f: font(500, 11.5), c: T.mid });
    D.forEach((d, i) => { const lx = comp ? 10 : S + 30, ly = comp ? S + 14 + i * 26 : 30 + i * 36; const sw = F.g.append('rect').attr('x', lx).attr('y', ly - 11).attr('width', 14).attr('height', 14).attr('rx', 3); paint(sw, T, id, () => d.state, () => col(T, d.color, i)); txt(F.g, lx + 22, ly, d.label, { f: font(600, 12.5), c: T.ink }); if (!comp) txt(F.g, lx + 22, ly + 16, num(d.value, 1) + ' ' + (f.unit || '') + ' · ' + num(100 * d.value / tot, 0) + ' %', { f: font(500, 11.5, MONO), c: T.mid }); });
    legend(el, statesOf(D));
  }
  REG('donut', donut, tableOf(['Part', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== PARETO ============================== */
  function pareto(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => b.value - a.value), tot = d3.sum(D, d => d.value), F = frame(el, id, comp ? 320 : 370, { l: 46, t: 22, r: 44, b: comp ? 84 : 70 }); addPatterns(F.defs, id, T);
    const X = d3.scaleBand(D.map(d => d.label), [0, F.iw]).padding(.25), Y = d3.scaleLinear([0, d3.max(D, d => d.value)], [F.ih, 0]).nice(), Y2 = d3.scaleLinear([0, 100], [F.ih, 0]); let acc = 0; D.forEach(d => { acc += d.value; d.cum = 100 * acc / tot; });
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .4); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(${F.iw},0)`).call(d3.axisRight(Y2).ticks(5).tickFormat(v => v + ' %')), T);
    const bars = F.g.selectAll('rect').data(D).join('rect').attr('x', d => X(d.label)).attr('width', X.bandwidth()).attr('y', d => Y(d.value)).attr('height', d => F.ih - Y(d.value)).attr('rx', 2); paint(bars, T, id, d => d.state, d => col(T, d.color, 0));
    interactive(bars, d => ({ title: d.label, value: num(d.value, 1) + ' ' + (f.unit || '') + ' · cumul ' + num(d.cum, 0) + ' %', state: d.state, src: d.src, detail: d.note }), T);
    F.g.append('path').datum(D).attr('d', d3.line().x(d => X(d.label) + X.bandwidth() / 2).y(d => Y2(d.cum))).attr('fill', 'none').attr('stroke', T.neg).attr('stroke-width', 2.2);
    F.g.selectAll('circle.pc').data(D).join('circle').attr('class', 'pc').attr('cx', d => X(d.label) + X.bandwidth() / 2).attr('cy', d => Y2(d.cum)).attr('r', 4).attr('fill', T.neg).attr('stroke', T.bg);
    if (f.threshold) { F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y2(f.threshold)).attr('y2', Y2(f.threshold)).attr('stroke', T.ink).attr('stroke-dasharray', '5 4'); txt(F.g, 4, Y2(f.threshold) - 5, f.threshold + ' %', { f: font(600, 11), c: T.ink, halo: T.bg }); }
    D.forEach(d => { const t = txt(F.g, X(d.label) + X.bandwidth() / 2, F.ih + 14, comp ? d.label.slice(0, 11) : d.label.slice(0, 18), { a: 'end', f: font(500, 11), c: T.mid }); t.attr('transform', `rotate(-35 ${X(d.label) + X.bandwidth() / 2},${F.ih + 14})`); });
    legend(el, statesOf(D));
  }
  REG('pareto', pareto, tableOf(['Élément', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== x temporel ou numérique ============================== */
  const isDateStr = v => typeof v === 'string' && /^\d{4}-\d{2}(-\d{2})?/.test(v);
  const xScale = (xs, w) => isDateStr(xs[0]) ? d3.scaleTime(d3.extent(xs.map(v => new Date(v))), [0, w]) : (typeof xs[0] === 'number' ? d3.scaleLinear(d3.extent(xs), [0, w]) : d3.scalePoint(xs, [0, w]).padding(.3));
  const xv = (S, v) => isDateStr(v) ? S(new Date(v)) : S(v);
  const xAxis = (S, xs, comp) => isDateStr(xs[0]) ? d3.axisBottom(S).ticks(comp ? 4 : 8).tickFormat(d3.timeFormat(comp ? '%b %y' : '%b %Y')).tickSizeOuter(0) : typeof xs[0] === 'number' ? d3.axisBottom(S).ticks(comp ? 5 : 9).tickFormat(d3.format('d')).tickSizeOuter(0) : d3.axisBottom(S).tickSizeOuter(0);

  /* ============================== LINES (multi-courbes, bandes d'incertitude, prévision pointillée) ============================== */
  function lines(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.series, xs = f.x, F = frame(el, id, comp ? 310 : 370, { l: comp ? 42 : 54, t: 18, r: comp ? 60 : 130, b: 36 }); addPatterns(F.defs, id, T);
    const X = xScale(xs, F.iw), allv = S.flatMap(s => [...s.values, ...(s.low || []), ...(s.high || [])]).filter(v => v != null && (!f.logY || v > 0)), Y = mkScale(f.logY, [f.ymin != null ? f.ymin : (f.logY ? d3.min(allv) * .8 : Math.min(0, d3.min(allv))), f.ymax != null ? f.ymax : d3.max(allv) * (f.logY ? 1.3 : 1.08)], [F.ih, 0]); if (!f.logY) Y.nice();
    F.g.append('g').call(d3.axisLeft(Y).ticks(5, f.logY ? '~s' : undefined).tickFormat(f.logY ? undefined : (v => num(v, 0) + (f.unit === '%' ? ' %' : ''))).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .45); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(xAxis(X, xs, comp)), T);
    (f.refs || []).forEach(r => { F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(r.value)).attr('y2', Y(r.value)).attr('stroke', T.ink).attr('stroke-dasharray', '5 4'); txt(F.g, 4, Y(r.value) - 5, r.label, { f: font(600, 11), c: T.ink, halo: T.bg }); });
    const labelYs = [];
    S.forEach((s, si) => {
      const c = col(T, s.color, si), pts = xs.map((x, i) => ({ x, v: s.values[i], lo: s.low && s.low[i], hi: s.high && s.high[i], i })).filter(p => p.v != null), cut = s.forecastFrom != null ? s.forecastFrom : null;
      if (s.low && s.high) F.g.append('path').datum(pts).attr('d', d3.area().x(p => xv(X, p.x)).y0(p => Y(p.lo)).y1(p => Y(p.hi))).attr('fill', c).attr('fill-opacity', .16);
      const ln = d3.line().x(p => xv(X, p.x)).y(p => Y(p.v)).curve(f.step || s.step ? d3.curveStepAfter : d3.curveLinear), solid = cut == null ? pts : pts.filter(p => p.i <= cut), dash = cut == null ? [] : pts.filter(p => p.i >= cut);
      F.g.append('path').datum(solid).attr('d', ln).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2.6).attr('stroke-dasharray', s.dash || null);
      if (dash.length > 1) F.g.append('path').datum(dash).attr('d', ln).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2.6).attr('stroke-dasharray', '6 4');
      const dots = F.g.selectAll(null).data(pts).join('circle').attr('cx', p => xv(X, p.x)).attr('cy', p => Y(p.v)).attr('r', comp ? 4 : 4.5);
      dots.each(function (p) { const soft = cut != null && p.i > cut, st = soft ? 'forecast' : (s.state || 'actual'); d3.select(this).attr('fill', soft ? T.bg : c).attr('stroke', c).attr('stroke-width', 2); });
      interactive(dots, p => ({ title: s.label + ' · ' + (isDateStr(p.x) ? d3.timeFormat('%b %Y')(new Date(p.x)) : p.x), value: num(p.v, f.dec) + (f.unit === '%' ? ' %' : ' ' + (f.unit || '')) + (p.lo != null ? ` (${num(p.lo, 0)}–${num(p.hi, 0)})` : ''), state: (cut != null && p.i > cut) ? 'forecast' : s.state, src: s.src, detail: s.note }), T);
      const last = pts[pts.length - 1]; let ly = Y(last.v); while (labelYs.some(v => Math.abs(v - ly) < 13)) ly += 13; labelYs.push(ly);
      txt(F.g, F.iw + 8, ly + 4, comp ? String(s.label).slice(0, 8) : (String(s.label).length > 18 ? String(s.label).slice(0, 17) + '…' : s.label), { f: font(700, comp ? 11 : 12), c: c });
    });
    (f.notes || []).forEach(n => { const xx = xv(X, n.x), v = n.value != null ? n.value : (S[n.series || 0].values[xs.indexOf(n.x)]); F.g.append('line').attr('x1', xx).attr('x2', xx).attr('y1', Y(v)).attr('y2', Y(v) - 22).attr('stroke', T.ink); txt(F.g, xx, Y(v) - 26, n.label, { a: 'middle', f: font(600, 11), c: T.ink, halo: T.bg }); });
    legend(el, S.map(s => s.state || 'actual'));
  }
  REG('lines', lines, (f, r) => r(['Série', ...f.x.map(String), 'Source'], f.series.map(s => [s.label, ...s.values.map(v => v == null ? '' : num(v, 2)), s.src])));

  /* ============================== STACKED / STREAMGRAPH ============================== */
  function stacked(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.series, xs = f.x, F = frame(el, id, comp ? 320 : 380, { l: comp ? 42 : 54, t: 14, r: comp ? 8 : 130, b: 36 }); addPatterns(F.defs, id, T);
    const rows = xs.map((x, i) => Object.fromEntries([['x', x], ...S.map((s, k) => ['s' + k, s.values[i]])])), keys = S.map((_, k) => 's' + k);
    const off = f.offset === 'wiggle' ? d3.stackOffsetWiggle : f.offset === 'expand' ? d3.stackOffsetExpand : d3.stackOffsetNone, stack = d3.stack().keys(keys).offset(off).order(f.offset === 'wiggle' ? d3.stackOrderInsideOut : d3.stackOrderNone)(rows);
    const X = xScale(xs, F.iw), Y = d3.scaleLinear([d3.min(stack, l => d3.min(l, d => d[0])), d3.max(stack, l => d3.max(l, d => d[1]))], [F.ih, 0]);
    if (f.offset !== 'wiggle') F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickFormat(v => f.offset === 'expand' ? Math.round(v * 100) + ' %' : num(v, 0)).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .4); a.select('.domain').remove(); });
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(xAxis(X, xs, comp)), T);
    const area = d3.area().x((d, i) => xv(X, xs[i])).y0(d => Y(d[0])).y1(d => Y(d[1])).curve(f.offset === 'wiggle' ? d3.curveBasis : d3.curveMonotoneX);
    const paths = F.g.selectAll('path.st').data(stack).join('path').attr('class', 'st').attr('d', area); paint(paths, T, id, (d, i) => S[stack.indexOf(d)].state, d => col(T, S[stack.indexOf(d)].color, stack.indexOf(d)));
    paths.attr('stroke', T.bg).attr('stroke-width', 1).attr('fill-opacity', (d, i) => isSoft(S[stack.indexOf(d)].state) ? 1 : .88);
    interactive(paths, d => { const s = S[stack.indexOf(d)]; return { title: s.label, value: 'dernier point : ' + num(s.values[s.values.length - 1], 1) + ' ' + (f.unit || ''), state: s.state, src: s.src, detail: s.note }; }, T);
    if (!comp) stack.forEach((layer, k) => { const l = layer[layer.length - 1]; txt(F.g, F.iw + 8, Y((l[0] + l[1]) / 2) + 4, S[k].label, { f: font(700, 11.5), c: col(T, S[k].color, k) }); });
    legend(el, statesOf(S));
    if (comp) { const ul = el.parentNode.querySelector('.fig-legend'); S.forEach((s, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, s.color, k)}"/></svg>${s.label}`; ul.appendChild(li); }); }
  }
  REG('stacked', stacked, (f, r) => r(['Série', ...f.x.map(String), 'Source'], f.series.map(s => [s.label, ...s.values.map(v => num(v, 2)), s.src])));

  /* ============================== BUMP CHART ============================== */
  function bump(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.data, xs = f.x, N = S.length, rowH = comp ? 36 : 40, F = frame(el, id, N * rowH + 60, { l: comp ? 64 : 140, r: comp ? 64 : 140, t: 26, b: 14 }); addPatterns(F.defs, id, T);
    const X = d3.scalePoint(xs, [0, F.iw]).padding(.05), Y = r => (r - 1) * rowH + rowH / 2;
    xs.forEach(x => txt(F.g, X(x), -10, x, { a: 'middle', f: font(700, 11.5), c: T.mid }));
    S.forEach((s, si) => {
      const c = col(T, s.color, si), pts = xs.map((x, i) => ({ x, r: s.ranks[i], i }));
      F.g.append('path').datum(pts).attr('d', d3.line().x(p => X(p.x)).y(p => Y(p.r)).curve(d3.curveBumpX)).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 4).attr('stroke-opacity', .8).attr('stroke-dasharray', stateStyle(s.state || 'actual', id, T).dash);
      const dots = F.g.selectAll(null).data(pts).join('circle').attr('cx', p => X(p.x)).attr('cy', p => Y(p.r)).attr('r', comp ? 10 : 11).attr('fill', c).attr('stroke', T.bg).attr('stroke-width', 2);
      interactive(dots, p => ({ title: s.label + ' · ' + p.x, value: 'rang ' + p.r, state: s.state, src: s.src, detail: s.note }), T);
      F.g.selectAll(null).data(pts).join('text').attr('x', p => X(p.x)).attr('y', p => Y(p.r) + 4).attr('text-anchor', 'middle').attr('fill', '#fff').style('font', font(700, 11, MONO)).style('pointer-events', 'none').text(p => p.r);
      txt(F.g, -18, Y(s.ranks[0]) + 4, s.label, { a: 'end', f: font(700, comp ? 11 : 12), c: c }); txt(F.g, F.iw + 18, Y(s.ranks[xs.length - 1]) + 4, s.label, { f: font(700, comp ? 11 : 12), c: c });
    });
    legend(el, statesOf(S));
  }
  REG('bump', bump, (f, r) => r(['Élément', ...f.x.map(String), 'Source'], f.data.map(s => [s.label, ...s.ranks, s.src])));

  /* ============================== TORNADO (sensibilité) ============================== */
  function tornado(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => (b.high - b.low) - (a.high - a.low)), band = comp ? 48 : 50, labelW = comp ? 100 : 190;
    const F = frame(el, id, D.length * band + 46, { l: labelW, r: D.some(d => d.grade) ? 56 : 30, t: 8, b: 34 }); addPatterns(F.defs, id, T);
    const lo = d3.min(D, d => d.low), hi = d3.max(D, d => d.high), X = d3.scaleLinear([Math.min(lo, f.base) - (hi - lo) * .06, Math.max(hi, f.base) + (hi - lo) * .06], [0, F.iw]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(v => num(v, f.dec != null ? f.dec : 0)).tickSizeOuter(0)), T);
    D.forEach((d, i) => {
      const cy = i * band + band / 2, h = band * .56; rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600);
      const a = F.g.append('rect').datum(d).attr('x', X(d.low)).attr('y', cy - h / 2).attr('width', Math.max(1, X(f.base) - X(d.low))).attr('height', h).attr('rx', 2); paint(a, T, id, dd => dd.state, () => T.neg);
      const b = F.g.append('rect').datum(d).attr('x', X(f.base)).attr('y', cy - h / 2).attr('width', Math.max(1, X(d.high) - X(f.base))).attr('height', h).attr('rx', 2); paint(b, T, id, dd => dd.state, () => T.c2);
      [a, b].forEach(s => interactive(s, dd => ({ title: dd.label, value: `${dd.lowLabel || 'bas'} : ${num(dd.low, 2)} · ${dd.highLabel || 'haut'} : ${num(dd.high, 2)} ${f.unit || ''}`, state: dd.state, src: dd.src, detail: dd.note }), T));
      if (d.grade) txt(F.g, F.iw + 8, cy + 4, d.grade, { f: font(700, 10.5, MONO), c: T.mid });
      txt(F.g, X(d.low) - 6, cy + 4, num(d.low, f.dec != null ? f.dec : 1), { a: 'end', f: font(700, 11.5, MONO), c: T.ink }); txt(F.g, X(d.high) + 6, cy + 4, num(d.high, f.dec != null ? f.dec : 1), { f: font(700, 11.5, MONO), c: T.ink });
    });
    F.g.append('line').attr('x1', X(f.base)).attr('x2', X(f.base)).attr('y1', -2).attr('y2', D.length * band).attr('stroke', T.ink).attr('stroke-width', 1.8);
    txt(F.g, X(f.base), -0, '', {}); legend(el, statesOf(D));
    const ul = el.parentNode.querySelector('.fig-legend'); [['bas (défavorable)', T.neg], ['haut (favorable)', T.c2]].forEach(([l, c]) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${c}"/></svg>${l}`; ul.appendChild(li); });
    if (f.baseLabel) { const li = document.createElement('li'); li.textContent = 'Trait vertical : ' + f.baseLabel + ' = ' + num(f.base, 2); ul.appendChild(li); }
  }
  REG('tornado', tornado, tableOf(['Paramètre', 'Bas', 'Haut', 'Source'], d => [d.label, num(d.low, 2), num(d.high, 2), d.src]));

  /* ============================== MATRICE DE RISQUE ============================== */
  function riskmatrix(el, f, T) {
    const id = uid(), comp = isNarrow(el), n = f.size || 5, labelW = comp ? 62 : 110, cell = Math.max(40, Math.min(comp ? 56 : 72, ((el.clientWidth || 640) - labelW - 16) / n)), H = n * cell + 44 + (f.items.length * 20) + 20;
    const F = frame(el, id, H + (comp ? 16 : 0), { l: labelW, r: 6, t: comp ? 22 : 6, b: 6 }); addPatterns(F.defs, id, T);
    const sev = (x, y) => (x * y) / (n * n), colorOf = s => s > .5 ? T.neg : s > .22 ? T.c4 : T.c2;
    for (let y = 1; y <= n; y++) for (let x = 1; x <= n; x++) F.g.append('rect').attr('x', (x - 1) * cell + 1).attr('y', (n - y) * cell + 1).attr('width', cell - 2).attr('height', cell - 2).attr('rx', 3).attr('fill', colorOf(sev(x, y))).attr('fill-opacity', .28).attr('stroke', T.line);
    const xl = f.xLabels || d3.range(1, n + 1), yl = f.yLabels || d3.range(1, n + 1);
    xl.forEach((l, i) => txt(F.g, i * cell + cell / 2, n * cell + 16, comp ? String(l).slice(0, 7) : l, { a: 'middle', f: font(600, 10.5), c: T.mid })); yl.forEach((l, i) => txt(F.g, -8, (n - 1 - i) * cell + cell / 2 + 4, comp ? String(l).slice(0, 8) : l, { a: 'end', f: font(600, 10.5), c: T.mid }));
    txt(F.g, (n * cell) / 2, n * cell + 34, (f.xLabel || 'Probabilité') + ' →', { a: 'middle', f: font(700, 11.5), c: T.ink }); if (comp) txt(F.g, -labelW + 6, -8, '↑ ' + (f.yLabel || 'Impact'), { f: font(700, 11.5), c: T.ink }); else { const yt = txt(F.g, -labelW + 12, (n * cell) / 2, (f.yLabel || 'Impact') + ' →', { a: 'middle', f: font(700, 11.5), c: T.ink }); yt.attr('transform', `rotate(-90 ${-labelW + 12},${(n * cell) / 2})`); }
    const groups = {}; f.items.forEach((it, i) => { const k = it.x + ',' + it.y; (groups[k] = groups[k] || []).push({ ...it, n: i + 1 }); });
    Object.values(groups).forEach(g => g.forEach((it, j) => { const cx = (it.x - 1) * cell + cell / 2 + (j - (g.length - 1) / 2) * 22, cy = (n - it.y) * cell + cell / 2; const c = F.g.append('circle').datum(it).attr('cx', cx).attr('cy', cy).attr('r', 11); paint(c, T, id, d => d.state, () => T.ink); c.attr('stroke', T.bg).attr('stroke-width', 2); interactive(c, d => ({ title: d.label, value: `${f.xLabel || 'probabilité'} ${d.x}/${n} · ${f.yLabel || 'impact'} ${d.y}/${n}`, state: d.state, src: d.src, detail: d.note }), T); txt(F.g, cx, cy + 4, it.n, { a: 'middle', f: font(700, 11, MONO), c: isSoft(it.state) ? T.ink : T.bg }); }));
    f.items.forEach((it, i) => txt(F.g, 0, n * cell + 60 + i * 20, `${i + 1}. ${it.label}`, { f: font(600, 12), c: T.ink }));
    legend(el, statesOf(f.items));
  }
  REG('riskmatrix', riskmatrix, tableOf(['Risque', 'Probabilité', 'Impact', 'Source'], d => [d.label, d.x, d.y, d.src], 'items'));

  /* ============================== PYRAMIDE (mirroir) ============================== */
  function pyramid(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 30 : 32, F = frame(el, id, D.length * band + 70, { l: 6, r: 6, t: 26, b: 34 }); addPatterns(F.defs, id, T);
    const mx = f.max || d3.max(D, d => Math.max(d.left, d.right)), mid = F.iw / 2, lw = comp ? 64 : 96, W = (F.iw - lw) / 2, X = d3.scaleLinear([0, mx], [0, W]), Yb = d3.scaleBand(D.map(d => d.label), [0, D.length * band]).padding(.18);
    txt(F.g, mid - lw / 2 - 4, -10, f.leftLabel || 'Gauche', { a: 'end', f: font(700, 12), c: T.c1 }); txt(F.g, mid + lw / 2 + 4, -10, f.rightLabel || 'Droite', { f: font(700, 12), c: T.c3 });
    const ax = d3.axisBottom(d3.scaleLinear([mx, 0], [0, W]).nice()).ticks(4).tickFormat(v => num(v, 0)); axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band + 4})`).call(ax), T); axisStyle(F.g.append('g').attr('transform', `translate(${mid + lw / 2},${D.length * band + 4})`).call(d3.axisBottom(X).ticks(4).tickFormat(v => num(v, 0))), T);
    D.forEach(d => { txt(F.g, mid, Yb(d.label) + Yb.bandwidth() / 2 + 4, d.label, { a: 'middle', f: font(600, comp ? 11 : 12), c: T.ink }); });
    const L = F.g.selectAll('rect.l').data(D).join('rect').attr('class', 'l').attr('x', d => mid - lw / 2 - X(d.left)).attr('y', d => Yb(d.label)).attr('width', d => X(d.left)).attr('height', Yb.bandwidth()).attr('rx', 2); paint(L, T, id, d => d.state, () => T.c1);
    const R = F.g.selectAll('rect.r').data(D).join('rect').attr('class', 'r').attr('x', mid + lw / 2).attr('y', d => Yb(d.label)).attr('width', d => X(d.right)).attr('height', Yb.bandwidth()).attr('rx', 2); paint(R, T, id, d => d.state, () => T.c3);
    interactive(L, d => ({ title: d.label + ' · ' + (f.leftLabel || 'gauche'), value: num(d.left, 1) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T); interactive(R, d => ({ title: d.label + ' · ' + (f.rightLabel || 'droite'), value: num(d.right, 1) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T);
    legend(el, statesOf(D));
  }
  REG('pyramid', pyramid, tableOf(['Catégorie', 'Gauche', 'Droite', 'Source'], d => [d.label, num(d.left, 2), num(d.right, 2), d.src]));

  /* ============================== SPARKGRID (petits multiples de courbes) ============================== */
  function sparkgrid(el, f, T) {
    const id = uid(), comp = isNarrow(el), P = f.panels, cols = comp ? 1 : (f.cols || 3), pw = ((el.clientWidth || 640) - 8) / cols - 14, ph = comp ? 110 : 120, rowsN = Math.ceil(P.length / cols);
    const F = frame(el, id, rowsN * ph + 12, { l: 2, r: 2, t: 2, b: 2 }); addPatterns(F.defs, id, T);
    const all = f.shared ? d3.extent(P.flatMap(p => p.values)) : null, xs = f.x, lines = [];
    P.forEach((p, i) => {
      const ox = (i % cols) * (pw + 14), oy = Math.floor(i / cols) * ph, g = F.g.append('g').attr('transform', `translate(${ox},${oy})`), m = { l: 4, r: 52, t: 30, b: 22 };
      const X = xScale(xs, pw - m.l - m.r), ext = all || d3.extent(p.values), Y = d3.scaleLinear([Math.min(ext[0], f.zero ? 0 : ext[0]), ext[1]], [ph - m.t - m.b, 0]), c = col(T, p.color, i);
      txt(g, 0, 14, p.label, { f: font(700, 12.5), c: T.ink });
      const inner = g.append('g').attr('transform', `translate(${m.l},${m.t})`), pts = xs.map((x, k) => ({ x, v: p.values[k], k })).filter(q => q.v != null);
      inner.append('path').datum(pts).attr('d', d3.area().x(q => xv(X, q.x)).y0(Y.range()[0]).y1(q => Y(q.v))).attr('fill', c).attr('fill-opacity', .12);
      inner.append('path').datum(pts).attr('d', d3.line().x(q => xv(X, q.x)).y(q => Y(q.v))).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2.2);
      const lastP = pts[pts.length - 1], dot = inner.append('circle').datum(p).attr('cx', xv(X, lastP.x)).attr('cy', Y(lastP.v)).attr('r', 4.5); paint(dot, T, id, d => d.state, () => c);
      interactive(dot, d => ({ title: d.label, value: `dernier : ${num(lastP.v, d.dec != null ? d.dec : 1)} ${d.unit || f.unit || ''} · min ${num(d3.min(p.values), 1)} · max ${num(d3.max(p.values), 1)}`, state: d.state, src: d.src, detail: d.note }), T);
      txt(g, m.l + (pw - m.l - m.r) + 8, m.t + Y(lastP.v) + 4, num(lastP.v, p.dec != null ? p.dec : 1) + (p.unit || f.unit || ''), { f: font(700, 12, MONO), c: T.ink });
      const fmtX = v => isDateStr(v) ? d3.timeFormat('%b %y')(new Date(v)) : v; txt(g, m.l, ph - 6, fmtX(xs[0]), { f: font(500, 10), c: T.mid }); txt(g, pw - m.r, ph - 6, fmtX(xs[xs.length - 1]), { a: 'end', f: font(500, 10), c: T.mid });
    });
    legend(el, statesOf(P));
  }
  REG('sparkgrid', sparkgrid, (f, r) => r(['Panneau', 'Début', 'Fin', 'Source'], f.panels.map(p => [p.label, num(p.values[0], 2), num(p.values[p.values.length - 1], 2), p.src])));

  /* ============================== COORDONNÉES PARALLÈLES ============================== */
  function parallel(el, f, T) {
    const id = uid(), comp = isNarrow(el), A = f.axes, D = f.data, F = frame(el, id, comp ? 340 : 400, { l: 16, r: comp ? 70 : 130, t: 36, b: 20 }); addPatterns(F.defs, id, T);
    const X = d3.scalePoint(A.map(a => a.label), [0, F.iw]).padding(0), Ys = A.map(a => d3.scaleLinear([a.min != null ? a.min : d3.min(D, d => d.values[A.indexOf(a)]), a.max != null ? a.max : d3.max(D, d => d.values[A.indexOf(a)])], a.invert ? [0, F.ih] : [F.ih, 0]).nice());
    A.forEach((a, i) => { const ax = F.g.append('g').attr('transform', `translate(${X(a.label)},0)`).call(d3.axisLeft(Ys[i]).ticks(4).tickSize(4)); axisStyle(ax, T); ax.select('.domain').attr('stroke', T.ink); const lines = wrapLines(a.label, 80, 11.5, 700); const t = F.g.append('text').attr('text-anchor', 'middle').attr('fill', T.ink).style('font', font(700, 11.5)); lines.slice(0, 2).forEach((ln, k) => t.append('tspan').attr('x', X(a.label)).attr('y', -22 + k * 12).text(ln)); });
    const line = d3.line().x((v, i) => X(A[i].label)).y((v, i) => Ys[i](v));
    const paths = F.g.selectAll('path.pc').data(D).join('path').attr('class', 'pc').attr('d', d => line(d.values)).attr('fill', 'none').attr('stroke-width', 2.8);
    paths.each(function (d, i) { const st = stateStyle(d.state || 'actual', id, T); d3.select(this).attr('stroke', col(T, d.color, i)).attr('stroke-opacity', .85).attr('stroke-dasharray', st.dash); });
    interactive(paths, d => ({ title: d.label, value: A.map((a, i) => `${a.label} ${num(d.values[i], 1)}`).join(' · '), state: d.state, src: d.src, detail: d.note }), T);
    paths.on('pointerenter.hl focus.hl', function () { paths.attr('stroke-opacity', .15); d3.select(this).attr('stroke-opacity', 1).raise(); }).on('pointerleave.hl blur.hl', () => paths.attr('stroke-opacity', .85));
    D.forEach((d, i) => txt(F.g, F.iw + 8, Ys[A.length - 1](d.values[A.length - 1]) + 4, comp ? d.label.slice(0, 9) : d.label, { f: font(700, 11.5), c: col(T, d.color, i) }));
    legend(el, statesOf(D));
  }
  REG('parallel', parallel, (f, r) => r(['Élément', ...f.axes.map(a => a.label), 'Source'], f.data.map(d => [d.label, ...d.values.map(v => num(v, 2)), d.src])));

  /* ============================== NUAGE CONNECTÉ ============================== */
  function cscatter(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, F = frame(el, id, comp ? 330 : 420, { l: comp ? 46 : 58, t: 14, r: 24, b: 52 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([f.xmin != null ? f.xmin : d3.min(D, d => d.x), f.xmax != null ? f.xmax : d3.max(D, d => d.x)], [0, F.iw]).nice(), Y = d3.scaleLinear([f.ymin != null ? f.ymin : d3.min(D, d => d.y), f.ymax != null ? f.ymax : d3.max(D, d => d.y)], [F.ih, 0]).nice();
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .45); a.select('.domain').remove(); }); axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 5 : 8).tickSizeOuter(0)), T);
    txt(F.g, F.iw / 2, F.ih + 40, f.xLabel || '', { a: 'middle', f: font(600, 11.5), c: T.mid }); txt(F.g, -F.m.l + 6, -4, f.yLabel || '', { f: font(600, 11.5), c: T.mid });
    F.g.append('path').datum(D).attr('d', d3.line().x(d => X(d.x)).y(d => Y(d.y)).curve(d3.curveCatmullRom.alpha(.5))).attr('fill', 'none').attr('stroke', T.c3).attr('stroke-width', 2.2).attr('stroke-opacity', .8);
    D.forEach((d, i) => { if (i > 0) { const p = D[i - 1], a = Math.atan2(Y(d.y) - Y(p.y), X(d.x) - X(p.x)), mx = (X(d.x) + X(p.x)) / 2, my = (Y(d.y) + Y(p.y)) / 2; F.g.append('path').attr('transform', `translate(${mx},${my}) rotate(${a * 180 / Math.PI})`).attr('d', 'M-5,-4L4,0L-5,4Z').attr('fill', T.c3); } });
    const dots = F.g.selectAll('circle.cs').data(D).join('circle').attr('class', 'cs').attr('cx', d => X(d.x)).attr('cy', d => Y(d.y)).attr('r', 6.5); paint(dots, T, id, d => d.state, () => T.c1);
    interactive(dots, d => ({ title: d.label, value: `${f.xLabel || 'x'} : ${num(d.x, 2)} · ${f.yLabel || 'y'} : ${num(d.y, 2)}`, state: d.state, src: d.src, detail: d.note }), T);
    D.forEach((d, i) => { if (!f.labelEvery || i % f.labelEvery === 0 || i === D.length - 1) txt(F.g, X(d.x) + 9, Y(d.y) - 8, d.label, { f: font(600, 11.5), c: T.ink, halo: T.bg }); });
    legend(el, statesOf(D));
  }
  REG('cscatter', cscatter, tableOf(['Point', 'x ; y', 'Source'], d => [d.label, num(d.x, 2) + ' ; ' + num(d.y, 2), d.src]));

  /* ============================== FOREST PLOT (estimations ± intervalle) ============================== */
  function forest(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 44 : 44, labelW = comp ? 110 : 220, F = frame(el, id, D.length * band + 50, { l: labelW, r: comp ? 70 : 120, t: 6, b: 34 }); addPatterns(F.defs, id, T);
    const lo = f.xmin != null ? f.xmin : d3.min(D, d => d.low), hi = f.xmax != null ? f.xmax : d3.max(D, d => d.high), X = mkScale(f.log, [lo, hi], [0, F.iw]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8, f.log ? '~g' : undefined).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 8)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .4);
    if (f.ref != null) { F.g.append('line').attr('x1', X(f.ref)).attr('x2', X(f.ref)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.ink).attr('stroke-width', 1.8).attr('stroke-dasharray', '5 4'); txt(F.g, X(f.ref), D.length * band + 30, f.refLabel || '', { a: 'middle', f: font(600, 11), c: T.ink }); }
    D.forEach((d, i) => {
      const cy = i * band + band / 2; rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600);
      const ln = F.g.append('line').attr('x1', X(d.low)).attr('x2', X(d.high)).attr('y1', cy).attr('y2', cy).attr('stroke', col(T, d.color, 0)).attr('stroke-width', 3).attr('stroke-dasharray', stateStyle(d.state || 'actual', id, T).dash);
      [d.low, d.high].forEach(v => F.g.append('line').attr('x1', X(v)).attr('x2', X(v)).attr('y1', cy - 6).attr('y2', cy + 6).attr('stroke', col(T, d.color, 0)).attr('stroke-width', 2.4));
      const sq = F.g.append('rect').datum(d).attr('x', X(d.est) - 6).attr('y', cy - 6).attr('width', 12).attr('height', 12).attr('rx', 2); paint(sq, T, id, dd => dd.state, () => col(T, d.color, 0));
      interactive(sq, dd => ({ title: dd.label, value: `${num(dd.est, 2)} [${num(dd.low, 2)} ; ${num(dd.high, 2)}] ${f.unit || ''}`, state: dd.state, src: dd.src, detail: dd.note || (dd.n ? 'n = ' + dd.n : '') }), T);
      txt(F.g, F.iw + 10, cy + 4, comp ? num(d.est, 2) : `${num(d.est, 2)} [${num(d.low, 1)}–${num(d.high, 1)}]`, { f: font(600, comp ? 10.5 : 11.5, MONO), c: T.ink });
    });
    legend(el, statesOf(D));
  }
  REG('forest', forest, tableOf(['Élément', 'Estimation', 'Intervalle', 'Source'], d => [d.label, num(d.est, 2), num(d.low, 2) + ' – ' + num(d.high, 2), d.src]));

  /* ============================================================================================
   *  LOT 3 — statistiques, séries spécialisées, courbes (xycurve), hiérarchies, réseaux
   * ============================================================================================ */
  const yAxisLeft = (F, Y, T, o) => F.g.append('g').call(d3.axisLeft(Y).ticks(5, o && o.fmt).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .45); a.select('.domain').remove(); });
  const xAxisBottom = (F, X, T, comp, tf) => axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 5 : 8, tf).tickSizeOuter(0)), T);
  const seqLegend = (F, id, T, lo, hi, y, unit, dec) => { const gid = id + '-sg', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .1).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', seq(T, t))); F.g.append('rect').attr('x', 0).attr('y', y).attr('width', Math.min(240, F.iw)).attr('height', 12).attr('rx', 3).attr('fill', `url(#${gid})`).attr('stroke', T.line); txt(F.g, 0, y + 28, num(lo, dec) + ' ' + (unit || ''), { f: font(500, 11), c: T.mid }); txt(F.g, Math.min(240, F.iw), y + 28, num(hi, dec) + ' ' + (unit || ''), { a: 'end', f: font(500, 11), c: T.mid }); };
  const kdeOf = (vals, ticks, bwf) => { const n = vals.length, sd = d3.deviation(vals) || 1, bw = bwf || 1.06 * sd * Math.pow(n, -.2); return ticks.map(t => [t, d3.mean(vals, v => Math.exp(-0.5 * Math.pow((t - v) / bw, 2)) / (bw * Math.sqrt(2 * Math.PI)))]); };
  const toDate = v => isDateStr(v) ? new Date(v) : v;

  /* ============================== BARRES GROUPÉES ============================== */
  function grouped(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, K = f.series, bh = comp ? 15 : 17, gap = 14, labelW = comp ? 100 : 180, rowH = K.length * bh + gap;
    const F = frame(el, id, D.length * rowH + 44, { l: labelW, r: comp ? 50 : 64, t: 6, b: 32 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([0, f.max || d3.max(D, d => d3.max(d.values)) * 1.1], [0, F.iw]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * rowH})`).call(d3.axisBottom(X).ticks(comp ? 4 : 6).tickFormat(v => num(v, 0)).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 6)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', D.length * rowH).attr('stroke', T.line).attr('stroke-opacity', .4);
    D.forEach((d, i) => {
      const y0 = i * rowH + gap / 2; rowLabel(F.g, d.label, y0 + K.length * bh / 2, labelW, T, 12.5, 600);
      K.forEach((k, j) => { const st = (d.states && d.states[j]) || d.state || 'actual', b = F.g.append('rect').datum({ d, k, j, v: d.values[j], st }).attr('x', 0).attr('y', y0 + j * bh).attr('width', Math.max(2, X(d.values[j]))).attr('height', bh - 2).attr('rx', 2); paint(b, T, id, x => x.st, () => col(T, k.color, j));
        interactive(b, x => ({ title: d.label + ' · ' + k.label, value: num(x.v, f.dec) + ' ' + (f.unit || ''), state: x.st, src: d.src, detail: d.note }), T); txt(F.g, X(d.values[j]) + 5, y0 + j * bh + bh - 4, num(d.values[j], f.dec), { f: font(600, 10.5, MONO), c: T.ink }); });
    });
    legend(el, D.flatMap(d => K.map((k, j) => (d.states && d.states[j]) || d.state || 'actual')));
    const ul = el.parentNode.querySelector('.fig-legend'); K.forEach((k, j) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, k.color, j)}"/></svg>${k.label}`; ul.appendChild(li); });
  }
  REG('grouped', grouped, (f, r) => r(['Catégorie', ...f.series.map(s => s.label), 'Source'], f.data.map(d => [d.label, ...d.values.map(v => num(v, 2)), d.src])));

  /* ============================== HORIZON ============================== */
  function horizon(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.series, nb = f.bands || 3, rowH = comp ? 36 : 34, F = frame(el, id, S.length * rowH + 40, { l: comp ? 80 : 150, r: 12, t: 4, b: 28 }); addPatterns(F.defs, id, T);
    const xs = f.x, X = xScale(xs, F.iw), allv = S.flatMap(s => s.values), step = (f.step || d3.max(allv.map(v => Math.abs(v - (f.base || 0)))) / nb), base = f.base || 0;
    axisStyle(F.g.append('g').attr('transform', `translate(0,${S.length * rowH})`).call(xAxis(X, xs, comp)), T);
    S.forEach((s, i) => {
      const y0 = i * rowH, g = F.g.append('g').attr('transform', `translate(0,${y0})`), h = rowH - 4, clip = id + 'c' + i; F.defs.append('clipPath').attr('id', clip).append('rect').attr('width', F.iw).attr('height', h);
      g.attr('clip-path', `url(#${clip})`);
      for (let b = 0; b < nb; b++) { [1, -1].forEach(sg => { const area = d3.area().x((v, k) => xv(X, xs[k])).y0(h).y1((v, k) => h - h * Math.max(0, Math.min(1, (sg * (v - base) - b * step) / step))); g.append('path').attr('d', area(s.values)).attr('fill', sg > 0 ? T.c1 : T.neg).attr('fill-opacity', .22 + .22 * b); }); }
      rowLabel(F.g, s.label, y0 + rowH / 2, comp ? 80 : 150, T, 12, 600); F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', y0 + h + 2).attr('y2', y0 + h + 2).attr('stroke', T.line);
      const hit = F.g.append('rect').datum(s).attr('x', 0).attr('y', y0).attr('width', F.iw).attr('height', rowH).attr('fill', 'transparent'); interactive(hit, d => ({ title: d.label, value: `min ${num(d3.min(d.values), 1)} · max ${num(d3.max(d.values), 1)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
    });
    legend(el, statesOf(S)); const ul = el.parentNode.querySelector('.fig-legend'); const li = document.createElement('li'); li.textContent = `Chaque teinte = ${num(step, 1)} ${f.unit || ''} au-dessus (bleu) ou au-dessous (rouge) de ${num(base, 0)}`; ul.appendChild(li);
  }
  REG('horizon', horizon, (f, r) => r(['Série', 'Min', 'Max', 'Source'], f.series.map(s => [s.label, num(d3.min(s.values), 2), num(d3.max(s.values), 2), s.src])));

  /* ============================== CANDLESTICK (+ volume) ============================== */
  function candlestick(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.map(d => ({ ...d, t: new Date(d.date) })), vol = D.some(d => d.volume != null), H = comp ? 330 : 400, F = frame(el, id, H, { l: comp ? 44 : 56, t: 12, r: 14, b: 34 }); addPatterns(F.defs, id, T);
    const ph = vol ? F.ih * .72 : F.ih, X = d3.scaleBand(D.map(d => d.date), [0, F.iw]).padding(.25), Y = d3.scaleLinear([d3.min(D, d => d.low) * .99, d3.max(D, d => d.high) * 1.01], [ph, 0]);
    F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .45); a.select('.domain').remove(); });
    const every = Math.ceil(D.length / (comp ? 4 : 8)); D.forEach((d, i) => { if (i % every === 0) txt(F.g, X(d.date) + X.bandwidth() / 2, F.ih + 18, d3.timeFormat(comp ? '%d %b' : '%d %b %y')(d.t), { a: 'middle', f: font(500, 10.5), c: T.mid }); });
    const up = d => d.close >= d.open;
    D.forEach(d => { const cx = X(d.date) + X.bandwidth() / 2, c = up(d) ? T.c2 : T.neg; F.g.append('line').attr('x1', cx).attr('x2', cx).attr('y1', Y(d.high)).attr('y2', Y(d.low)).attr('stroke', c).attr('stroke-width', 1.6); });
    const bodies = F.g.selectAll('rect.cb').data(D).join('rect').attr('class', 'cb').attr('x', d => X(d.date)).attr('width', X.bandwidth()).attr('y', d => Y(Math.max(d.open, d.close))).attr('height', d => Math.max(2, Math.abs(Y(d.open) - Y(d.close)))).attr('rx', 1.5);
    paint(bodies, T, id, d => d.state, d => up(d) ? T.c2 : T.neg); interactive(bodies, d => ({ title: d3.timeFormat('%d %B %Y')(d.t), value: `O ${num(d.open, 2)} · H ${num(d.high, 2)} · B ${num(d.low, 2)} · C ${num(d.close, 2)}` + (d.volume != null ? ` · vol. ${num(d.volume, 0)}` : ''), state: d.state, src: d.src, detail: d.note }), T);
    if (vol) { const Yv = d3.scaleLinear([0, d3.max(D, d => d.volume)], [F.ih, ph + 16]); F.g.selectAll('rect.cv').data(D).join('rect').attr('class', 'cv').attr('x', d => X(d.date)).attr('width', X.bandwidth()).attr('y', d => Yv(d.volume)).attr('height', d => F.ih - Yv(d.volume)).attr('fill', d => up(d) ? T.c2 : T.neg).attr('fill-opacity', .45); txt(F.g, 0, ph + 12, 'Volume', { f: font(600, 10.5), c: T.mid }); }
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); [['Hausse (clôture ≥ ouverture)', T.c2], ['Baisse', T.neg]].forEach(([l, c]) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${c}"/></svg>${l}`; ul.appendChild(li); });
  }
  REG('candlestick', candlestick, tableOf(['Date', 'Ouv.', 'Haut', 'Bas', 'Clôt.', 'Source'], d => [d.date, d.open, d.high, d.low, d.close, d.src]));

  /* ============================== DENSITY (courbes de densité superposées) ============================== */
  function density(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.series || [{ label: f.label, values: f.values, state: f.state, src: f.src }], all = S.flatMap(s => s.values), F = frame(el, id, comp ? 290 : 340, { l: 20, t: 14, r: 14, b: 40 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([f.min != null ? f.min : d3.min(all), f.max != null ? f.max : d3.max(all)], [0, F.iw]).nice(), ticks = X.ticks(80), dens = S.map(s => kdeOf(s.values, ticks, f.bandwidth)), Y = d3.scaleLinear([0, d3.max(dens, a => d3.max(a, p => p[1])) * 1.1], [F.ih, 0]);
    xAxisBottom(F, X, T, comp);
    S.forEach((s, i) => { const c = col(T, s.color, i); const a = F.g.append('path').datum(s).attr('d', d3.area().x(p => X(p[0])).y0(F.ih).y1(p => Y(p[1])).curve(d3.curveBasis)(dens[i])); paint(a, T, id, d => d.state, () => c); a.attr('fill-opacity', isSoft(s.state) ? 1 : .3).attr('stroke-width', 2.2);
      interactive(a, d => ({ title: d.label, value: `médiane ${num(d3.median(d.values), 1)} · n = ${d.values.length}`, state: d.state, src: d.src, detail: d.note }), T);
      s.values.forEach(v => F.g.append('line').attr('x1', X(v)).attr('x2', X(v)).attr('y1', F.ih).attr('y2', F.ih - 6).attr('stroke', c).attr('stroke-opacity', .5)); });
    (f.refs || []).forEach(r => { F.g.append('line').attr('x1', X(r.value)).attr('x2', X(r.value)).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.ink).attr('stroke-dasharray', '5 4'); txt(F.g, X(r.value) + 5, 12, r.label, { f: font(600, 11), c: T.ink, halo: T.bg }); });
    legend(el, statesOf(S)); const ul = el.parentNode.querySelector('.fig-legend'); S.forEach((s, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, s.color, i)}"/></svg>${s.label}`; ul.appendChild(li); });
  }
  REG('density', density, (f, r) => r(['Série', 'n', 'Médiane', 'Source'], (f.series || [{ label: f.label, values: f.values, src: f.src }]).map(s => [s.label, s.values.length, num(d3.median(s.values), 2), s.src])));

  /* ============================== VIOLIN ============================== */
  function violin(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 64 : 72, labelW = comp ? 90 : 170, F = frame(el, id, D.length * band + 44, { l: labelW, r: 14, t: 6, b: 34 }); addPatterns(F.defs, id, T);
    const all = D.flatMap(d => d.values), X = d3.scaleLinear([f.min != null ? f.min : d3.min(all), f.max != null ? f.max : d3.max(all)], [0, F.iw]).nice(), ticks = X.ticks(70), dens = D.map(d => kdeOf(d.values, ticks, f.bandwidth)), mx = d3.max(dens, a => d3.max(a, p => p[1])), W = d3.scaleLinear([0, mx], [0, band * .44]);
    xAxisBottom({ ...F, g: F.g, ih: D.length * band }, X, T, comp);
    D.forEach((d, i) => {
      const cy = i * band + band / 2; rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600);
      const sh = F.g.append('path').datum(d).attr('d', d3.area().x(p => X(p[0])).y0(p => cy - W(p[1])).y1(p => cy + W(p[1])).curve(d3.curveBasis)(dens[i])); paint(sh, T, id, dd => dd.state, () => col(T, d.color, i)); sh.attr('fill-opacity', isSoft(d.state) ? 1 : .5);
      interactive(sh, dd => ({ title: dd.label, value: `médiane ${num(d3.median(dd.values), 1)} · Q1–Q3 ${num(d3.quantile(dd.values, .25), 1)}–${num(d3.quantile(dd.values, .75), 1)} · n = ${dd.values.length}`, state: dd.state, src: dd.src, detail: dd.note }), T);
      const q1 = d3.quantile(d.values, .25), q3 = d3.quantile(d.values, .75), md = d3.median(d.values);
      F.g.append('line').attr('x1', X(q1)).attr('x2', X(q3)).attr('y1', cy).attr('y2', cy).attr('stroke', T.ink).attr('stroke-width', 5).attr('stroke-linecap', 'round'); F.g.append('circle').attr('cx', X(md)).attr('cy', cy).attr('r', 4).attr('fill', T.bg);
    });
    legend(el, statesOf(D));
  }
  REG('violin', violin, tableOf(['Groupe', 'n', 'Médiane', 'Source'], d => [d.label, d.values.length, num(d3.median(d.values), 2), d.src]));

  /* ============================== HEXBIN + densité 2D (contours) ============================== */
  function hexbinChart(el, f, T, contours) {
    const id = uid(), comp = isNarrow(el), D = f.data, F = frame(el, id, (comp ? 330 : 420) + 56, { l: comp ? 46 : 58, t: 10, r: 16, b: 52 }); addPatterns(F.defs, id, T); F.svg.attr('viewBox', `0 0 ${F.w} ${F.h}`);
    const ph = F.ih - 56, xe = d3.extent(D, d => d.x), ye = d3.extent(D, d => d.y), X = d3.scaleLinear([f.xmin != null ? f.xmin : xe[0], f.xmax != null ? f.xmax : xe[1]], [0, F.iw]).nice(), Y = d3.scaleLinear([f.ymin != null ? f.ymin : ye[0], f.ymax != null ? f.ymax : ye[1]], [ph, 0]).nice();
    yAxisLeft({ ...F, ih: ph }, Y, T); axisStyle(F.g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(X).ticks(comp ? 5 : 8).tickSizeOuter(0)), T);
    txt(F.g, F.iw / 2, ph + 40, f.xLabel || '', { a: 'middle', f: font(600, 11.5), c: T.mid }); txt(F.g, -F.m.l + 6, -2, f.yLabel || '', { f: font(600, 11.5), c: T.mid });
    if (contours) {
      const cd = d3.contourDensity().x(d => X(d.x)).y(d => Y(d.y)).weight(d => d.weight || 1).size([F.iw, ph]).bandwidth(f.bandwidth || 22).thresholds(f.levels || 8)(D), mx = d3.max(cd, c => c.value);
      F.g.selectAll('path.dc').data(cd).join('path').attr('class', 'dc').attr('d', d3.geoPath()).attr('fill', c => seq(T, c.value / mx)).attr('fill-opacity', .85).attr('stroke', T.c1).attr('stroke-width', .8);
      F.g.selectAll('circle.dp').data(D.length < 400 ? D : []).join('circle').attr('class', 'dp').attr('cx', d => X(d.x)).attr('cy', d => Y(d.y)).attr('r', 1.6).attr('fill', T.ink).attr('fill-opacity', .35);
      seqLegend({ ...F, g: F.g }, id, T, 0, mx, ph + 52, 'densité', 3);
    } else {
      const R = f.size || (comp ? 14 : 18), dx = R * Math.sqrt(3), dy = R * 1.5, bins = new Map();
      D.forEach(d => { const px = X(d.x), py = Y(d.y); let r = Math.round(py / dy), off = (r % 2) ? dx / 2 : 0, c = Math.round((px - off) / dx); const k = r + ',' + c; const b = bins.get(k) || { cx: c * dx + ((r % 2) ? dx / 2 : 0), cy: r * dy, n: 0, w: 0 }; b.n++; b.w += d.weight || 1; bins.set(k, b); });
      const B = [...bins.values()].filter(b => b.cx >= -R && b.cx <= F.iw + R && b.cy >= -R && b.cy <= ph + R), mx = d3.max(B, b => b.w), hex = d3.range(6).map(i => [R * .94 * Math.cos(Math.PI / 6 + i * Math.PI / 3), R * .94 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]);
      const cells = F.g.selectAll('path.hx').data(B).join('path').attr('class', 'hx').attr('transform', b => `translate(${b.cx},${b.cy})`).attr('d', 'M' + hex.map(p => p.join(',')).join('L') + 'Z').attr('fill', b => seq(T, b.w / mx)).attr('stroke', T.line).attr('stroke-width', .6);
      interactive(cells, b => ({ title: 'Cellule', value: b.n + ' observations' + (f.unit ? ' · ' + num(b.w, 1) + ' ' + f.unit : ''), state: f.state, src: f.src }), T); seqLegend(F, id, T, 0, mx, ph + 52, f.unit || 'obs.', 0);
    }
    legend(el, [f.state || 'actual']);
  }
  REG('hexbin', (el, f, T) => hexbinChart(el, f, T, false), (f, r) => r(['x', 'y', 'Poids'], f.data.slice(0, 200).map(d => [num(d.x, 2), num(d.y, 2), d.weight || 1])));
  REG('contours', (el, f, T) => hexbinChart(el, f, T, true), (f, r) => r(['x', 'y', 'Poids'], f.data.slice(0, 200).map(d => [num(d.x, 2), num(d.y, 2), d.weight || 1])));

  /* ============================== DIFFERENCE RIBBON ============================== */
  function diffribbon(el, f, T) {
    const id = uid(), comp = isNarrow(el), xs = f.x, A = f.a, B = f.b, F = frame(el, id, comp ? 300 : 360, { l: comp ? 42 : 54, t: 14, r: comp ? 70 : 130, b: 34 }); addPatterns(F.defs, id, T);
    const X = xScale(xs, F.iw), all = [...A.values, ...B.values], Y = d3.scaleLinear([f.ymin != null ? f.ymin : d3.min(all) * .95, f.ymax != null ? f.ymax : d3.max(all) * 1.05], [F.ih, 0]).nice();
    yAxisLeft(F, Y, T); axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(xAxis(X, xs, comp)), T);
    const pts = xs.map((x, i) => ({ x, a: A.values[i], b: B.values[i] }));
    /* zones où A > B (couleur A) et B > A (couleur B), bornes lissées sur le croisement */
    const cross = []; pts.forEach((p, i) => { if (i) { const q = pts[i - 1], d0 = q.a - q.b, d1 = p.a - p.b; if (d0 * d1 < 0) { const t = d0 / (d0 - d1), xx = d3.interpolate(isDateStr(q.x) ? +new Date(q.x) : q.x, isDateStr(p.x) ? +new Date(p.x) : p.x)(t); cross.push({ i, t, xx, y: q.a + (p.a - q.a) * t }); } } });
    const bands = []; let cur = null; pts.forEach((p, i) => { const s = p.a >= p.b ? 'a' : 'b'; const prev = pts[i - 1]; if (!cur) cur = { s, pts: [p] }; else if (cur.s !== s && prev) { const cr = cross.find(c => c.i === i), mid = { x: isDateStr(p.x) ? new Date(cr.xx).toISOString() : cr.xx, a: cr.y, b: cr.y }; cur.pts.push(mid); bands.push(cur); cur = { s, pts: [mid, p] }; } else cur.pts.push(p); }); if (cur) bands.push(cur);
    bands.forEach(b => F.g.append('path').attr('d', d3.area().x(p => xv(X, p.x)).y0(p => Y(p.b)).y1(p => Y(p.a))(b.pts)).attr('fill', b.s === 'a' ? col(T, A.color, 0) : col(T, B.color, 1)).attr('fill-opacity', .28));
    [[A, 0], [B, 1]].forEach(([s, i]) => { const c = col(T, s.color, i); F.g.append('path').datum(pts).attr('d', d3.line().x(p => xv(X, p.x)).y(p => Y(i ? p.b : p.a))).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2.6).attr('stroke-dasharray', stateStyle(s.state || 'actual', id, T).dash);
      const dots = F.g.selectAll(null).data(pts).join('circle').attr('cx', p => xv(X, p.x)).attr('cy', p => Y(i ? p.b : p.a)).attr('r', 4).attr('fill', c).attr('stroke', T.bg); interactive(dots, p => ({ title: s.label + ' · ' + (isDateStr(p.x) ? d3.timeFormat('%b %Y')(new Date(p.x)) : p.x), value: num(i ? p.b : p.a, f.dec) + ' ' + (f.unit || '') + ' · écart ' + num(p.a - p.b, f.dec), state: s.state, src: s.src, detail: s.note }), T);
      const l = pts[pts.length - 1]; txt(F.g, F.iw + 8, Y(i ? l.b : l.a) + (i && Math.abs(l.a - l.b) < (Y.domain()[1] - Y.domain()[0]) * .05 ? 14 : 4), comp ? s.label.slice(0, 8) : s.label, { f: font(700, 12), c }); });
    legend(el, [A.state || 'actual', B.state || 'actual']); const ul = el.parentNode.querySelector('.fig-legend'); const li = document.createElement('li'); li.textContent = 'La surface colorée désigne la courbe en tête ; sa hauteur est l\'écart.'; ul.appendChild(li);
  }
  REG('diffribbon', diffribbon, (f, r) => r(['Date', f.a.label, f.b.label, 'Écart'], f.x.map((x, i) => [x, num(f.a.values[i], 2), num(f.b.values[i], 2), num(f.a.values[i] - f.b.values[i], 2)])));

  /* ============================== CHAMP DE VECTEURS ============================== */
  function vectorfield(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, F = frame(el, id, comp ? 330 : 420, { l: comp ? 40 : 52, t: 10, r: 14, b: 48 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear(d3.extent(D, d => d.x), [14, F.iw - 14]).nice(), Y = d3.scaleLinear(d3.extent(D, d => d.y), [F.ih - 14, 14]).nice(), mag = d => d.mag != null ? d.mag : Math.hypot(d.dx, d.dy), mx = d3.max(D, mag);
    yAxisLeft(F, Y, T); xAxisBottom(F, X, T, comp); txt(F.g, F.iw / 2, F.ih + 38, f.xLabel || '', { a: 'middle', f: font(600, 11.5), c: T.mid }); txt(F.g, -F.m.l + 6, -2, f.yLabel || '', { f: font(600, 11.5), c: T.mid });
    const cell = Math.min(F.iw / (new Set(D.map(d => d.x)).size || 8), F.ih / (new Set(D.map(d => d.y)).size || 8)) * .85, k = (f.scale || 1) * cell / mx;
    const arrows = F.g.selectAll('g.va').data(D).join('g').attr('class', 'va').attr('transform', d => `translate(${X(d.x)},${Y(d.y)})`);
    arrows.append('line').attr('x1', d => -d.dx * k / 2).attr('y1', d => d.dy * k / 2).attr('x2', d => d.dx * k / 2).attr('y2', d => -d.dy * k / 2).attr('stroke', d => seq(T, .35 + .65 * mag(d) / mx)).attr('stroke-width', 2.4).attr('stroke-linecap', 'round');
    arrows.append('path').attr('d', 'M-4,-3.5L4,0L-4,3.5Z').attr('fill', d => seq(T, .35 + .65 * mag(d) / mx)).attr('transform', d => `translate(${d.dx * k / 2},${-d.dy * k / 2}) rotate(${-Math.atan2(d.dy, d.dx) * 180 / Math.PI})`);
    interactive(arrows, d => ({ title: `(${num(d.x, 1)} ; ${num(d.y, 1)})`, value: `dx ${num(d.dx, 2)} · dy ${num(d.dy, 2)} · intensité ${num(mag(d), 2)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
    legend(el, statesOf(D));
  }
  REG('vectorfield', vectorfield, tableOf(['x', 'y', 'dx', 'dy', 'Source'], d => [num(d.x, 1), num(d.y, 1), num(d.dx, 2), num(d.dy, 2), d.src]));

  /* ============================== XYCURVE (ROC, PR, calibration, dose-réponse, frontière, Kaplan-Meier, baignoire) ============================== */
  function xycurve(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.series, F = frame(el, id, comp ? 340 : 420, { l: comp ? 46 : 58, t: 16, r: comp ? 16 : 24, b: 52 }); addPatterns(F.defs, id, T);
    const allx = S.flatMap(s => s.points.map(p => p[0])).concat((f.points || []).map(p => p.x)), ally = S.flatMap(s => s.points.map(p => p[1])).concat((f.points || []).map(p => p.y), S.flatMap(s => [...(s.low || []), ...(s.high || [])]));
    const X = mkScale(f.logX, [f.xmin != null ? f.xmin : d3.min(allx), f.xmax != null ? f.xmax : d3.max(allx)], [0, F.iw]), Y = mkScale(f.logY, [f.ymin != null ? f.ymin : d3.min(ally), f.ymax != null ? f.ymax : d3.max(ally)], [F.ih, 0]); if (!f.logX) X.nice(); if (!f.logY) Y.nice();
    (f.phases || []).forEach((ph, i) => { F.g.append('rect').attr('x', X(ph.from)).attr('width', X(ph.to) - X(ph.from)).attr('y', 0).attr('height', F.ih).attr('fill', col(T, ph.color, i + 1)).attr('fill-opacity', .08); txt(F.g, (X(ph.from) + X(ph.to)) / 2, 14, ph.label, { a: 'middle', f: font(700, 11), c: T.mid }); });
    yAxisLeft(F, Y, T, { fmt: f.logY ? '~s' : undefined }); xAxisBottom(F, X, T, comp, f.logX ? '~s' : undefined);
    txt(F.g, F.iw / 2, F.ih + 40, f.xLabel || '', { a: 'middle', f: font(600, 11.5), c: T.mid }); txt(F.g, -F.m.l + 6, -4, f.yLabel || '', { f: font(600, 11.5), c: T.mid });
    if (f.diagonal) { const lo = Math.max(X.domain()[0], Y.domain()[0]), hi = Math.min(X.domain()[1], Y.domain()[1]); F.g.append('line').attr('x1', X(lo)).attr('y1', Y(lo)).attr('x2', X(hi)).attr('y2', Y(hi)).attr('stroke', T.lo).attr('stroke-width', 1.6).attr('stroke-dasharray', '6 4'); txt(F.g, X(hi) - 6, Y(hi) + 16, f.diagonal.label || '', { a: 'end', f: font(500, 11), c: T.mid, halo: T.bg }); }
    (f.vlines || []).forEach(l => { F.g.append('line').attr('x1', X(l.value)).attr('x2', X(l.value)).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.ink).attr('stroke-dasharray', '5 4'); txt(F.g, X(l.value) + 4, F.ih - 6, l.label || '', { f: font(600, 11), c: T.ink, halo: T.bg }); });
    (f.hlines || []).forEach(l => { F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(l.value)).attr('y2', Y(l.value)).attr('stroke', T.ink).attr('stroke-dasharray', '5 4'); txt(F.g, F.iw - 4, Y(l.value) - 5, l.label || '', { a: 'end', f: font(600, 11), c: T.ink, halo: T.bg }); });
    S.forEach((s, si) => {
      const c = col(T, s.color, si), line = d3.line().x(p => X(p[0])).y(p => Y(p[1])).curve(s.step ? d3.curveStepAfter : (s.smooth ? d3.curveMonotoneX : d3.curveLinear));
      if (s.low && s.high) F.g.append('path').attr('d', d3.area().x((p, i) => X(s.points[i][0])).y0((p, i) => Y(s.low[i])).y1((p, i) => Y(s.high[i])).curve(s.step ? d3.curveStepAfter : d3.curveMonotoneX)(s.points)).attr('fill', c).attr('fill-opacity', .16);
      if (s.area) F.g.append('path').attr('d', d3.area().x(p => X(p[0])).y0(Y(Math.max(Y.domain()[0], 0))).y1(p => Y(p[1])).curve(s.step ? d3.curveStepAfter : d3.curveLinear)(s.points)).attr('fill', c).attr('fill-opacity', .12);
      const st = stateStyle(s.state || 'actual', id, T), path = F.g.append('path').datum(s).attr('d', line(s.points)).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2.8).attr('stroke-dasharray', st.dash); interactive(path, d => ({ title: d.label, value: d.auc != null ? 'AUC = ' + num(d.auc, 2) : (d.points.length + ' points'), state: d.state, src: d.src, detail: d.note }), T);
      if (s.censors) s.censors.forEach(p => F.g.append('line').attr('x1', X(p[0])).attr('x2', X(p[0])).attr('y1', Y(p[1]) - 5).attr('y2', Y(p[1]) + 5).attr('stroke', c).attr('stroke-width', 1.6));
      const l = s.points[s.points.length - 1]; if (!comp || S.length < 3) txt(F.g, Math.min(F.iw - 4, X(l[0]) + 6), Y(l[1]) + 4 + (S.length > 1 && l[1] >= Y.domain()[1] * .95 ? (si + 1) * 14 : 0), s.label + (s.auc != null ? ' · AUC ' + num(s.auc, 2) : ''), { a: X(l[0]) > F.iw - 100 ? 'end' : 'start', f: font(700, 11.5), c, halo: T.bg });
    });
    if (f.points) { const dots = F.g.selectAll('circle.xp').data(f.points).join('circle').attr('class', 'xp').attr('cx', d => X(d.x)).attr('cy', d => Y(d.y)).attr('r', 6.5); paint(dots, T, id, d => d.state, d => col(T, d.color, 3)); interactive(dots, d => ({ title: d.label, value: `${num(d.x, 2)} ; ${num(d.y, 2)}`, state: d.state, src: d.src, detail: d.note }), T); f.points.filter(d => d.showLabel).forEach(d => txt(F.g, X(d.x) + 10, Y(d.y) - 8, d.label, { f: font(600, 11.5), c: T.ink, halo: T.bg })); }
    (f.notes || []).forEach(n => txt(F.g, X(n.x), Y(n.y), n.label, { a: n.anchor || 'start', f: font(600, 11), c: T.ink, halo: T.bg }));
    legend(el, [...S.map(s => s.state || 'actual'), ...(f.points || []).map(p => p.state || 'actual')]);
  }
  REG('xycurve', xycurve, (f, r) => r(['Série', 'Points', 'Source'], f.series.map(s => [s.label, s.points.length, s.src])));

  /* ============================== BARRES + COURBE À DEUX AXES ============================== */
  function dualaxis(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, F = frame(el, id, comp ? 330 : 390, { l: comp ? 44 : 56, t: 24, r: comp ? 44 : 56, b: comp ? 70 : 54 }); addPatterns(F.defs, id, T);
    const X = d3.scaleBand(D.map(d => d.label), [0, F.iw]).padding(.3), Y = d3.scaleLinear([0, d3.max(D, d => d.magnitude) * 1.1], [F.ih, 0]).nice(), Y2 = d3.scaleLinear([f.rateMin != null ? f.rateMin : 0, f.rateMax != null ? f.rateMax : d3.max(D, d => d.rate) * 1.15], [F.ih, 0]).nice();
    yAxisLeft(F, Y, T); axisStyle(F.g.append('g').attr('transform', `translate(${F.iw},0)`).call(d3.axisRight(Y2).ticks(5).tickFormat(v => num(v, 0) + (f.rateUnit || ''))), T);
    txt(F.g, 0, -10, f.magLabel || '', { f: font(700, 11), c: T.c1 }); txt(F.g, F.iw, -10, f.rateLabel || '', { a: 'end', f: font(700, 11), c: T.neg });
    const bars = F.g.selectAll('rect').data(D).join('rect').attr('x', d => X(d.label)).attr('width', X.bandwidth()).attr('y', d => Y(d.magnitude)).attr('height', d => F.ih - Y(d.magnitude)).attr('rx', 2); paint(bars, T, id, d => d.state, () => T.c1);
    interactive(bars, d => ({ title: d.label, value: `${num(d.magnitude, 1)} ${f.unit || ''} · taux ${num(d.rate, 1)}${f.rateUnit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
    F.g.append('path').datum(D).attr('d', d3.line().x(d => X(d.label) + X.bandwidth() / 2).y(d => Y2(d.rate))).attr('fill', 'none').attr('stroke', T.neg).attr('stroke-width', 2.6); F.g.selectAll('circle.da').data(D).join('circle').attr('class', 'da').attr('cx', d => X(d.label) + X.bandwidth() / 2).attr('cy', d => Y2(d.rate)).attr('r', 4.5).attr('fill', T.neg).attr('stroke', T.bg).attr('stroke-width', 1.5);
    D.forEach(d => { const t = txt(F.g, X(d.label) + X.bandwidth() / 2, F.ih + 14, comp ? d.label.slice(0, 10) : d.label.slice(0, 18), { a: comp ? 'end' : 'middle', f: font(500, 11), c: T.mid }); if (comp) t.attr('transform', `rotate(-40 ${X(d.label) + X.bandwidth() / 2},${F.ih + 14})`); });
    legend(el, statesOf(D));
  }
  REG('dualaxis', dualaxis, tableOf(['Catégorie', 'Grandeur', 'Taux', 'Source'], d => [d.label, num(d.magnitude, 2), num(d.rate, 2), d.src]));

  /* ============================================================================================
   *  LOT 4 — hiérarchies, réseaux, formes polaires, jauge, pictogrammes
   * ============================================================================================ */

  /* ============================== ICICLE ============================== */
  function icicle(el, f, T) {
    const id = uid(), comp = isNarrow(el), root = hier(f), depth = root.height, rowH = comp ? 44 : 52, H = (depth + 1) * rowH + 20, F = frame(el, id, H, { l: 2, r: 2, t: 4, b: 16 }); addPatterns(F.defs, id, T);
    d3.partition().size([F.iw, depth * rowH + rowH])(root); const branches = root.children || [];
    const nodes = root.descendants(); const rects = F.g.selectAll('rect').data(nodes).join('rect').attr('x', d => d.x0).attr('y', d => d.y0).attr('width', d => Math.max(1, d.x1 - d.x0 - 1)).attr('height', d => d.y1 - d.y0 - 2).attr('rx', 2);
    paint(rects, T, id, d => d.data.state, d => { if (!d.parent) return T.lo; const b = branchOf(d), c = d3.color(col(T, b.data.color, branches.indexOf(b))); return c.brighter(.22 * (d.depth - 1)).formatHex(); });
    interactive(rects, d => ({ title: d.ancestors().reverse().map(n => n.data.name).join(' › '), value: num(d.value, 1) + ' ' + (f.unit || '') + ' · ' + num(100 * d.value / root.value, 0) + ' %', state: d.data.state, src: d.data.src || (d.parent ? branchOf(d).data.src : undefined), detail: d.data.note }), T);
    nodes.filter(d => d.x1 - d.x0 > 46).forEach(d => { const lines = wrapLines(d.data.name, d.x1 - d.x0 - 10, 11.5, 700).slice(0, 2), t = F.g.append('text').attr('fill', '#fff').attr('stroke', 'rgba(0,0,0,.28)').attr('stroke-width', 2.4).attr('paint-order', 'stroke').style('font', font(700, 11.5)).style('pointer-events', 'none'); lines.forEach((ln, k) => t.append('tspan').attr('x', d.x0 + 6).attr('y', d.y0 + 16 + k * 13).text(ln)); txt(F.g, d.x0 + 6, d.y1 - 8, num(d.value, 0), { f: font(600, 10.5, MONO), c: '#fff', halo: 'rgba(0,0,0,.28)' }); });
    legend(el, nodes.map(d => d.data.state || 'actual'));
  }
  REG('icicle', icicle, (f, r) => { const rows = []; (function walk(n, p) { const q = p.concat(n.name); if (n.children) n.children.forEach(c => walk(c, q)); else rows.push([q.slice(1).join(' › '), n.value, n.src || '']); })(f.root, []); return r(['Chemin', 'Valeur', 'Source'], rows); });

  /* ============================== ARBRES (orthogonal / radial / verdict) ============================== */
  function tree(el, f, T, radial) {
    const id = uid(), comp = isNarrow(el), root = d3.hierarchy(f.root), W = el.clientWidth || 640, leaves = root.leaves().length;
    if (!radial) {
      const rowH = comp ? 34 : 28, H = leaves * rowH + 20, F = frame(el, id, H, { l: 10, r: comp ? 150 : 190, t: 8, b: 8 }); addPatterns(F.defs, id, T);
      d3.cluster().size([H - 36, F.iw])(root);
      F.g.selectAll('path').data(root.links()).join('path').attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x)).attr('fill', 'none').attr('stroke', T.lo).attr('stroke-width', 1.5);
      const g = F.g.selectAll('g.tn').data(root.descendants()).join('g').attr('class', 'tn').attr('transform', d => `translate(${d.y},${d.x})`);
      const c = g.append('circle').attr('r', d => d.children ? 6 : 5.5); paint(c, T, id, d => d.data.state, d => d.depth === 0 ? T.ink : d.children ? T.c3 : col(T, d.data.color, 0)); c.attr('stroke', T.bg).attr('stroke-width', 1.5);
      interactive(g, d => ({ title: d.ancestors().reverse().map(n => n.data.name).join(' › '), value: d.data.value != null ? num(d.data.value, 1) + ' ' + (f.unit || '') : (d.children ? d.leaves().length + ' feuilles' : ''), state: d.data.state, src: d.data.src, detail: d.data.note || d.data.verdict }), T);
      g.each(function (d) { const lines = wrapLines(d.data.name + (d.data.verdict ? ' — ' + d.data.verdict : ''), d.children ? 150 : (comp ? 140 : 220), comp ? 10.5 : 12, d.children ? 700 : 500).slice(0, 2), t = d3.select(this).append('text').attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 3).attr('paint-order', 'stroke').style('font', font(d.children ? 700 : 500, comp ? 11 : 12)).style('pointer-events', 'none'); lines.forEach((ln, k) => t.append('tspan').attr('x', d.children && d.depth ? -9 : 10).attr('text-anchor', d.children && d.depth ? 'end' : 'start').attr('y', 4 + (k - (lines.length - 1) / 2) * 12).text(ln)); });
    } else {
      const S = Math.min(W, comp ? 360 : 560), R = S / 2 - (comp ? 70 : 110), F = frame(el, id, S, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T); d3.cluster().size([2 * Math.PI, R])(root);
      const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2})`), pt = d => [d.y * Math.cos(d.x - Math.PI / 2), d.y * Math.sin(d.x - Math.PI / 2)];
      g.selectAll('path').data(root.links()).join('path').attr('d', d3.linkRadial().angle(d => d.x).radius(d => d.y)).attr('fill', 'none').attr('stroke', T.lo).attr('stroke-width', 1.3);
      const n = g.selectAll('g.tn').data(root.descendants()).join('g').attr('class', 'tn').attr('transform', d => `translate(${pt(d)})`);
      const c = n.append('circle').attr('r', d => d.children ? 5.5 : 4.5); paint(c, T, id, d => d.data.state, d => d.depth === 0 ? T.ink : d.children ? T.c3 : col(T, d.data.color, 0)); c.attr('stroke', T.bg);
      interactive(n, d => ({ title: d.ancestors().reverse().map(x => x.data.name).join(' › '), value: d.data.value != null ? num(d.data.value, 1) + ' ' + (f.unit || '') : '', state: d.data.state, src: d.data.src, detail: d.data.note }), T);
      root.leaves().concat(root.descendants().filter(d => d.depth === 1)).forEach(d => { const a = d.x - Math.PI / 2, [x, y] = pt(d), right = Math.cos(a) >= 0, r = d.depth === 1 && d.children ? 0 : 1; if (!r) return; txt(g, x + (right ? 8 : -8), y + 4, comp ? d.data.name.slice(0, 11) : d.data.name, { a: right ? 'start' : 'end', f: font(500, comp ? 10.5 : 11.5), c: T.ink, halo: T.bg }); });
      root.children && root.children.forEach(b => { if (b.children) { const [x, y] = pt(b); txt(g, x, y - 9, b.data.name, { a: 'middle', f: font(700, 11.5), c: T.c3, halo: T.bg }); } });
    }
    legend(el, root.descendants().map(d => d.data.state || 'actual'));
  }
  const treeTable = (f, r) => { const rows = []; (function walk(n, p) { const q = p.concat(n.name); if (n.children) n.children.forEach(c => walk(c, q)); else rows.push([q.join(' › '), n.value != null ? n.value : (n.verdict || ''), n.src || '']); })(f.root, []); return r(['Chemin', 'Valeur / verdict', 'Source'], rows); };
  REG('tree', (el, f, T) => tree(el, f, T, false), treeTable); REG('radialtree', (el, f, T) => tree(el, f, T, true), treeTable);

  /* ============================== RÉSEAU À FORCES (communautés, hubs) ============================== */
  function force(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, H = comp ? 380 : 460, F = frame(el, id, H, { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const nodes = f.nodes.map((n, i) => ({ ...n, i })), by = Object.fromEntries(nodes.map(n => [n.id, n])), links = f.links.map(l => ({ ...l, source: by[l.s], target: by[l.t] })), cats = [...new Set(nodes.map(n => n.category))];
    nodes.forEach(n => n.deg = links.filter(l => l.source === n || l.target === n).length);
    const r = d3.scaleSqrt([0, d3.max(nodes, n => n.value || n.deg)], [5, comp ? 16 : 22]); const sim = d3.forceSimulation(nodes).force('link', d3.forceLink(links).distance(comp ? 60 : 86).strength(.5)).force('charge', d3.forceManyBody().strength(-170)).force('center', d3.forceCenter(F.iw / 2, F.ih / 2)).force('collide', d3.forceCollide(d => r(d.value || d.deg) + 6)).stop();
    for (let i = 0; i < 260; i++) sim.tick();
    nodes.forEach(n => { n.x = Math.max(24, Math.min(F.iw - 24, n.x)); n.y = Math.max(20, Math.min(F.ih - 20, n.y)); });
    const ln = F.g.selectAll('line').data(links).join('line').attr('x1', l => l.source.x).attr('y1', l => l.source.y).attr('x2', l => l.target.x).attr('y2', l => l.target.y).attr('stroke', T.lo).attr('stroke-opacity', .6).attr('stroke-width', l => 1 + (l.v || 1) * .5).attr('stroke-dasharray', l => stateStyle(l.state || 'actual', id, T).dash); interactive(ln, l => ({ title: l.source.label + ' — ' + l.target.label, value: l.v != null ? num(l.v, 1) + ' ' + (f.unit || '') : '', state: l.state, src: l.src, detail: l.note || l.d }), T);
    const nd = F.g.selectAll('circle').data(nodes).join('circle').attr('cx', n => n.x).attr('cy', n => n.y).attr('r', n => r(n.value || n.deg)); paint(nd, T, id, n => n.state, n => col(T, n.color, cats.indexOf(n.category))); nd.attr('stroke', T.bg).attr('stroke-width', 1.8);
    interactive(nd, n => ({ title: n.label, value: n.deg + ' liens' + (n.value != null ? ' · ' + num(n.value, 1) + ' ' + (f.unit || '') : ''), state: n.state, src: n.src, detail: n.category }), T);
    nodes.filter(n => n.deg >= 3 || n.showLabel || nodes.length < 14).forEach(n => txt(F.g, n.x, n.y - r(n.value || n.deg) - 5, n.label, { a: 'middle', f: font(600, comp ? 10.5 : 11.5), c: T.ink, halo: T.bg }));
    legend(el, [...nodes.map(n => n.state || 'actual'), ...links.map(l => l.state || 'actual')]); const ul = el.parentNode.querySelector('.fig-legend'); cats.forEach((c, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="${col(T, (nodes.find(n => n.category === c) || {}).color, i)}"/></svg>${c}`; ul.appendChild(li); });
  }
  REG('force', force, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, l.v != null ? num(l.v, 2) : '', l.src || ''])));

  /* ============================== BOUCLES CAUSALES ============================== */
  function causal(el, f, T) {
    const id = uid(), comp = isNarrow(el), N = f.nodes, W = el.clientWidth || 640, S = Math.min(W, comp ? 360 : 520), R = S / 2 - (comp ? 64 : 88), F = frame(el, id, S + 20, { l: 0, r: 0, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const cx = F.iw / 2, cy = S / 2 + 6; N.forEach((n, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N.length; n.x = cx + R * Math.cos(a); n.y = cy + R * Math.sin(a); n.a = a; }); const by = Object.fromEntries(N.map(n => [n.id, n]));
    ['pos', 'neg'].forEach(k => F.defs.append('marker').attr('id', id + k).attr('viewBox', '0 0 8 8').attr('refX', 7).attr('refY', 4).attr('markerWidth', 8).attr('markerHeight', 8).attr('orient', 'auto').append('path').attr('d', 'M0,0L8,4L0,8Z').attr('fill', k === 'pos' ? T.c2 : T.neg));
    const NR = comp ? 24 : 30, links = f.links.map(l => ({ ...l, S: by[l.s], T: by[l.t] }));
    const lp = F.g.selectAll('path.cl').data(links).join('path').attr('class', 'cl').attr('fill', 'none').attr('stroke-width', 2.6).attr('stroke', l => l.sign < 0 ? T.neg : T.c2).attr('stroke-dasharray', l => stateStyle(l.state || 'actual', id, T).dash).attr('marker-end', l => `url(#${id}${l.sign < 0 ? 'neg' : 'pos'})`)
      .attr('d', l => { const dx = l.T.x - l.S.x, dy = l.T.y - l.S.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, x0 = l.S.x + ux * NR, y0 = l.S.y + uy * NR, x1 = l.T.x - ux * (NR + 8), y1 = l.T.y - uy * (NR + 8), mx = (x0 + x1) / 2 * .55 + cx * .45, my = (y0 + y1) / 2 * .55 + cy * .45; l.mx = mx; l.my = my; return `M${x0},${y0}Q${mx},${my} ${x1},${y1}`; });
    interactive(lp, l => ({ title: l.S.label + ' → ' + l.T.label, value: l.sign < 0 ? 'effet inverse (−)' : 'effet dans le même sens (+)', state: l.state, src: l.src, detail: l.d }), T);
    links.forEach(l => { txt(F.g, l.mx, l.my + 4, l.sign < 0 ? '−' : '+', { a: 'middle', f: font(800, 18), c: l.sign < 0 ? T.neg : T.c2, halo: T.bg }); });
    const ng = F.g.selectAll('g.cn').data(N).join('g').attr('class', 'cn').attr('transform', n => `translate(${n.x},${n.y})`); ng.append('circle').attr('r', NR).attr('fill', T.bg).attr('stroke', T.ink).attr('stroke-width', 2);
    ng.each(function (n) { const lines = wrapLines(n.label, NR * 1.7, comp ? 9.5 : 10.5, 700).slice(0, 3), t = d3.select(this).append('text').attr('text-anchor', 'middle').attr('fill', T.ink).style('font', font(700, comp ? 9.5 : 10.5)); lines.forEach((ln, k) => t.append('tspan').attr('x', 0).attr('y', 3 + (k - (lines.length - 1) / 2) * 11).text(ln)); });
    interactive(ng, n => ({ title: n.label, detail: n.d, src: n.src }), T);
    (f.loops || []).forEach((lp2, i) => txt(F.g, cx, cy + (i - (f.loops.length - 1) / 2) * 18, lp2.label, { a: 'middle', f: font(800, 13), c: lp2.type === 'B' ? T.neg : T.c2 }));
    legend(el, links.map(l => l.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'); [['+ même sens', T.c2], ['− sens inverse', T.neg]].forEach(([l, c]) => { const li = document.createElement('li'); li.innerHTML = `<svg width="22" height="10" aria-hidden="true"><line x1="0" y1="5" x2="22" y2="5" stroke="${c}" stroke-width="3"/></svg>${l}`; ul.appendChild(li); });
  }
  REG('causal', causal, (f, r) => r(['Cause', 'Effet', 'Sens', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, l.sign < 0 ? '−' : '+', l.src || ''])));

  /* ============================== CHEMIN CRITIQUE (réseau d'activités) ============================== */
  function critical(el, f, T) {
    const id = uid(), comp = isNarrow(el), N = f.nodes.map(n => ({ ...n, dur: n.dur || 0 })), by = Object.fromEntries(N.map(n => [n.id, n])), L = f.links;
    /* calcul : début au plus tôt / fin au plus tôt, puis marge */
    const pre = n => L.filter(l => l.t === n.id).map(l => by[l.s]); const order = []; const seen = new Set(); (function visit(n) { if (seen.has(n.id)) return; seen.add(n.id); pre(n).forEach(visit); order.push(n); })(N[N.length - 1]); N.forEach(n => visit2(n)); function visit2(n) { if (!seen.has(n.id)) { seen.add(n.id); pre(n).forEach(visit2); order.push(n); } }
    order.forEach(n => { n.es = d3.max(pre(n), p => p.ef) || 0; n.ef = n.es + n.dur; }); const end = d3.max(N, n => n.ef); [...order].reverse().forEach(n => { const succ = L.filter(l => l.s === n.id).map(l => by[l.t]); n.lf = succ.length ? d3.min(succ, s => s.ls) : end; n.ls = n.lf - n.dur; n.slack = Math.round((n.ls - n.es) * 100) / 100; n.crit = n.slack <= 1e-6; });
    const stage = {}; order.forEach(n => { stage[n.id] = pre(n).length ? 1 + d3.max(pre(n), p => stage[p.id]) : 0; }); const ns = d3.max(Object.values(stage)) + 1, bySt = d3.range(ns).map(s => N.filter(n => stage[n.id] === s));
    const rowH = comp ? 64 : 70, H = d3.max(bySt, a => a.length) * rowH + 30, F = frame(el, id, H, { l: 6, r: 6, t: 10, b: 14 }); addPatterns(F.defs, id, T);
    const nw = comp ? Math.max(50, Math.floor((F.iw - 10 * (ns - 1)) / ns)) : 110, nh = 52, tiny = comp && nw < 76; N.forEach(n => { const a = bySt[stage[n.id]]; n.x = ns === 1 ? 0 : stage[n.id] * ((F.iw - nw) / (ns - 1)); n.y = (H - 24 - a.length * rowH) / 2 + a.indexOf(n) * rowH + 8; });
    F.defs.append('marker').attr('id', id + 'ar').attr('viewBox', '0 0 8 8').attr('refX', 7).attr('refY', 4).attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto').append('path').attr('d', 'M0,0L8,4L0,8Z').attr('fill', T.ink);
    const links = L.map(l => ({ ...l, S: by[l.s], T: by[l.t] })), lp = F.g.selectAll('path').data(links).join('path').attr('d', l => `M${l.S.x + nw},${l.S.y + nh / 2}C${(l.S.x + nw + l.T.x) / 2},${l.S.y + nh / 2} ${(l.S.x + nw + l.T.x) / 2},${l.T.y + nh / 2} ${l.T.x - 2},${l.T.y + nh / 2}`).attr('fill', 'none').attr('stroke', l => l.S.crit && l.T.crit ? T.neg : T.lo).attr('stroke-width', l => l.S.crit && l.T.crit ? 3 : 1.6).attr('marker-end', `url(#${id}ar)`);
    interactive(lp, l => ({ title: l.S.label + ' → ' + l.T.label, detail: l.d, src: l.src }), T);
    const g = F.g.selectAll('g.cp').data(N).join('g').attr('class', 'cp').attr('transform', n => `translate(${n.x},${n.y})`), rc = g.append('rect').attr('width', nw).attr('height', nh).attr('rx', 6); paint(rc, T, id, n => n.state, n => n.crit ? T.neg : T.c1); rc.attr('fill-opacity', n => isSoft(n.state) ? 1 : .2).attr('stroke-width', 2);
    g.each(function (n) { const t = d3.select(this).append('text').attr('fill', T.ink).style('font', font(700, tiny ? 9.5 : (comp ? 10.5 : 11.5))); wrapLines(n.label, nw - 8, tiny ? 9.5 : (comp ? 10.5 : 11.5), 700).slice(0, 2).forEach((ln, k) => t.append('tspan').attr('x', 4).attr('y', 14 + k * 12).text(ln)); d3.select(this).append('text').attr('x', 4).attr('y', nh - 7).attr('fill', T.mid).style('font', font(600, tiny ? 9 : 10.5, MONO)).text(tiny ? `${num(n.dur, 0)} j · m.${num(n.slack, 0)}` : `${num(n.dur, 0)} j · marge ${num(n.slack, 0)}`); });
    interactive(g, n => ({ title: n.label, value: `durée ${num(n.dur, 1)} · début au plus tôt ${num(n.es, 1)} · marge ${num(n.slack, 1)}`, state: n.state, src: n.src, detail: n.crit ? 'Sur le chemin critique' : '' }), T);
    legend(el, N.map(n => n.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'); const li = document.createElement('li'); li.innerHTML = `<svg width="22" height="10" aria-hidden="true"><line x1="0" y1="5" x2="22" y2="5" stroke="${T.neg}" stroke-width="3"/></svg>Chemin critique : durée totale ${num(end, 0)}`; ul.appendChild(li);
  }
  REG('critical', critical, (f, r) => r(['Activité', 'Durée', 'Source'], f.nodes.map(n => [n.label, n.dur, n.src || ''])));

  /* ============================== SANKEY VERTICAL ============================== */
  function vsankey(el, f, T) {
    const id = uid(), comp = isNarrow(el), ns = f.stages.length, nodeH = 14, H = comp ? 460 : 540, F = frame(el, id, H, { l: 8, r: 8, t: 22, b: 8 }); addPatterns(F.defs, id, T);
    const nodes = f.nodes.map(n => ({ ...n, in: 0, out: 0 })), by = Object.fromEntries(nodes.map(n => [n.id, n])), links = f.links.map(l => ({ ...l, S: by[l.s], T: by[l.t] }));
    links.forEach(l => { l.S.out += l.v; l.T.in += l.v; }); nodes.forEach(n => n.val = Math.max(n.in, n.out));
    const gap = 10, bySt = f.stages.map((_, i) => nodes.filter(n => n.stage === i)), scale = d3.min(bySt, a => (F.iw - gap * (a.length - 1)) / (d3.sum(a, n => n.val) || 1)), rowY = i => ns === 1 ? 0 : i * ((F.ih - nodeH) / (ns - 1));
    bySt.forEach((a, i) => { const tot = d3.sum(a, n => n.val) * scale + gap * (a.length - 1); let x = (F.iw - tot) / 2; a.forEach(n => { n.x = x; n.w = Math.max(2, n.val * scale); n.y = rowY(i); x += n.w + gap; }); });
    nodes.forEach(n => { n.outL = links.filter(l => l.S === n).sort((a, b) => a.T.x - b.T.x); n.inL = links.filter(l => l.T === n).sort((a, b) => a.S.x - b.S.x); let x = n.x; n.outL.forEach(l => { l.sx = x + l.v * scale / 2; x += l.v * scale; }); x = n.x; n.inL.forEach(l => { l.tx = x + l.v * scale / 2; x += l.v * scale; }); });
    const paths = F.g.append('g').selectAll('path').data(links).join('path').attr('d', l => { const y0 = l.S.y + nodeH, y1 = l.T.y, my = (y0 + y1) / 2; return `M${l.sx},${y0}C${l.sx},${my} ${l.tx},${my} ${l.tx},${y1}`; }).attr('fill', 'none').attr('stroke-width', l => Math.max(1, l.v * scale));
    paths.each(function (l) { const c = col(T, l.S.color, nodes.indexOf(l.S)), st = stateStyle(l.state || 'actual', id, T); d3.select(this).attr('stroke', isSoft(l.state) ? st.stroke : c).attr('stroke-opacity', isSoft(l.state) ? .6 : .38).attr('stroke-dasharray', isSoft(l.state) ? '6 4' : null); });
    interactive(paths, l => ({ title: l.S.label + ' → ' + l.T.label, value: num(l.v, 1) + ' ' + (f.unit || ''), state: l.state, src: l.src, detail: l.note }), T);
    const rects = F.g.append('g').selectAll('rect').data(nodes).join('rect').attr('x', n => n.x).attr('y', n => n.y).attr('width', n => n.w).attr('height', nodeH).attr('rx', 2).attr('fill', (n, i) => col(T, n.color, i)).attr('stroke', T.bg); interactive(rects, n => ({ title: n.label, value: num(n.val, 1) + ' ' + (f.unit || ''), src: n.src }), T);
    nodes.forEach(n => { const first = n.stage === 0; txt(F.g, n.x + n.w / 2, first ? n.y - 5 : n.y + nodeH + 13, n.w > 40 || !comp ? (comp ? n.label.slice(0, 10) : n.label) : '', { a: 'middle', f: font(600, comp ? 10 : 11.5), c: T.ink, halo: T.bg }); });
    f.stages.forEach((s, i) => txt(F.g, 0, rowY(i) + nodeH + (i === 0 ? -6 : 0) - (i === 0 ? 16 : -26), '', {}));
    legend(el, links.map(l => l.state || 'actual'));
  }
  REG('vsankey', vsankey, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, num(l.v, 2), l.src || ''])));

  /* ============================== POLAIRES : radialbar / rose / polarstack (rose des vents) / polarscatter ============================== */
  function polar(el, f, T, mode) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W - 8, comp ? 340 : 480), R = S / 2 - (comp ? 34 : 44), F = frame(el, id, S + 10, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 4})`);
    if (mode === 'radialbar') {
      const D = f.data.slice().sort((a, b) => b.value - a.value), mx = f.max || d3.max(D, d => d.value) * 1.05, rw = Math.min(22, (R - 26) / D.length - 4), ang = d3.scaleLinear([0, mx], [0, 1.5 * Math.PI]);
      [.25, .5, .75, 1].forEach(k => g.append('path').attr('d', d3.arc().innerRadius(0).outerRadius(R).startAngle(0).endAngle(1.5 * Math.PI * k)()).attr('fill', 'none').attr('stroke', T.line).attr('stroke-opacity', .5));
      D.forEach((d, i) => { const r1 = R - i * (rw + 4), p = g.append('path').datum(d).attr('d', d3.arc().innerRadius(r1 - rw).outerRadius(r1).startAngle(0).endAngle(ang(d.value)).cornerRadius(3)()); paint(p, T, id, dd => dd.state, () => col(T, d.color, i)); interactive(p, dd => ({ title: dd.label, value: num(dd.value, 1) + ' ' + (f.unit || ''), state: dd.state, src: dd.src, detail: dd.note }), T); txt(g, -6, -(r1 - rw / 2) + 4, d.label + ' · ' + num(d.value, 0), { a: 'end', f: font(600, comp ? 10 : 11), c: T.ink, halo: T.bg }); });
    } else if (mode === 'rose') {
      const D = f.data, n = D.length, rr = d3.scaleSqrt([0, d3.max(D, d => d.value)], [0, R]), band = 2 * Math.PI / n;
      [.33, .66, 1].forEach(k => g.append('circle').attr('r', R * Math.sqrt(k)).attr('fill', 'none').attr('stroke', T.line).attr('stroke-opacity', .6));
      D.forEach((d, i) => { const p = g.append('path').datum(d).attr('d', d3.arc().innerRadius(0).outerRadius(rr(d.value)).startAngle(i * band + .02).endAngle((i + 1) * band - .02).cornerRadius(2)()); paint(p, T, id, dd => dd.state, () => col(T, d.color, i)); interactive(p, dd => ({ title: dd.label, value: num(dd.value, 1) + ' ' + (f.unit || ''), state: dd.state, src: dd.src, detail: dd.note }), T); const a = (i + .5) * band - Math.PI / 2, lr = R + 14; txt(g, lr * Math.cos(a), lr * Math.sin(a) + 4, comp ? d.label.slice(0, 9) : d.label, { a: Math.cos(a) > .2 ? 'start' : Math.cos(a) < -.2 ? 'end' : 'middle', f: font(600, comp ? 10 : 11.5), c: T.ink }); });
    } else if (mode === 'polarstack') {
      const dirs = f.dirs || [...new Set(f.data.map(d => d.dir))], K = f.series, tot = dirs.map(dn => d3.sum(K, (k, j) => (f.data.find(d => d.dir === dn) || { values: [] }).values[j] || 0)), rr = d3.scaleLinear([0, d3.max(tot)], [18, R]), band = 2 * Math.PI / dirs.length;
      [.25, .5, .75, 1].forEach(k => g.append('circle').attr('r', rr(d3.max(tot) * k)).attr('fill', 'none').attr('stroke', T.line).attr('stroke-opacity', .6));
      dirs.forEach((dn, i) => { const row = f.data.find(d => d.dir === dn) || { values: [] }; let acc = 0; K.forEach((k, j) => { const v = row.values[j] || 0, r0 = rr(acc), r1 = rr(acc + v); acc += v; const p = g.append('path').datum({ dn, k, v, row }).attr('d', d3.arc().innerRadius(r0).outerRadius(r1).startAngle(i * band + .03).endAngle((i + 1) * band - .03)()); paint(p, T, id, d => d.row.state, () => col(T, k.color, j)); interactive(p, d => ({ title: dn + ' · ' + k.label, value: num(d.v, 1) + ' ' + (f.unit || ''), state: row.state, src: row.src, detail: row.note }), T); });
        const a = (i + .5) * band - Math.PI / 2, lr = R + 14; txt(g, lr * Math.cos(a), lr * Math.sin(a) + 4, dn, { a: Math.cos(a) > .2 ? 'start' : Math.cos(a) < -.2 ? 'end' : 'middle', f: font(700, 11.5), c: T.ink }); });
      legend(el, f.data.map(d => d.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'); K.forEach((k, j) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, k.color, j)}"/></svg>${k.label}`; ul.appendChild(li); }); return;
    } else {
      const D = f.data, groups = [...new Set(D.map(d => d.group))], rr = d3.scaleLinear([0, f.max || d3.max(D, d => d.radius) * 1.05], [0, R]), max = f.angleMax || 360;
      [.25, .5, .75, 1].forEach(k => { g.append('circle').attr('r', R * k).attr('fill', 'none').attr('stroke', T.line).attr('stroke-opacity', .6); txt(g, 3, -R * k + 11, num((f.max || d3.max(D, d => d.radius) * 1.05) * k, 0), { f: font(500, 9.5), c: T.lo }); });
      d3.range(0, 360, 45).forEach(a => { const r = (a - 90) * Math.PI / 180; g.append('line').attr('x2', R * Math.cos(r)).attr('y2', R * Math.sin(r)).attr('stroke', T.line).attr('stroke-opacity', .5); txt(g, (R + 14) * Math.cos(r), (R + 14) * Math.sin(r) + 4, Math.round(a / 360 * max) + (f.angleUnit || '°'), { a: 'middle', f: font(500, 10), c: T.mid }); });
      const dots = g.selectAll('circle.ps').data(D).join('circle').attr('class', 'ps').attr('cx', d => rr(d.radius) * Math.cos((d.angle / max * 360 - 90) * Math.PI / 180)).attr('cy', d => rr(d.radius) * Math.sin((d.angle / max * 360 - 90) * Math.PI / 180)).attr('r', comp ? 5 : 6);
      paint(dots, T, id, d => d.state, d => col(T, d.color, groups.indexOf(d.group))); dots.attr('fill-opacity', d => isSoft(d.state) ? 1 : .75);
      interactive(dots, d => ({ title: d.label || d.group, value: `angle ${num(d.angle, 0)}${f.angleUnit || '°'} · rayon ${num(d.radius, 1)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note || d.group }), T);
      legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); groups.forEach((gn, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="${col(T, (D.find(d => d.group === gn) || {}).color, i)}"/></svg>${gn}`; ul.appendChild(li); }); return;
    }
    legend(el, statesOf(f.data));
  }
  const tb = (f, r) => r(['Élément', 'Valeur', 'Source'], (f.data || []).map(d => [d.label || d.dir || d.group, d.value != null ? num(d.value, 2) : (d.values ? d.values.map(v => num(v, 1)).join(' / ') : num(d.radius, 2)), d.src]));
  REG('radialbar', (el, f, T) => polar(el, f, T, 'radialbar'), tb); REG('rose', (el, f, T) => polar(el, f, T, 'rose'), tb); REG('polarstack', (el, f, T) => polar(el, f, T, 'polarstack'), tb); REG('polarscatter', (el, f, T) => polar(el, f, T, 'scatter'), tb);

  /* ============================== JAUGE À CADRAN ============================== */
  function gauge(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W - 16, comp ? 320 : 420), R = S / 2 - 10, F = frame(el, id, R + 70, { l: 0, r: 0, t: 6, b: 4 }); addPatterns(F.defs, id, T);
    const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${R + 16})`), A = d3.scaleLinear([f.min, f.max], [-Math.PI / 2, Math.PI / 2]), zones = f.zones || [{ to: f.max, label: '', color: 'c2' }]; let from = f.min;
    zones.forEach((z, i) => { const p = g.append('path').datum(z).attr('d', d3.arc().innerRadius(R * .68).outerRadius(R).startAngle(A(from)).endAngle(A(z.to)).padAngle(.01)()).attr('fill', col(T, z.color, i)).attr('fill-opacity', .55); interactive(p, d => ({ title: d.label || 'Zone', value: `${num(from, 0)} – ${num(d.to, 0)} ${f.unit || ''}`, src: f.src, state: f.state }), T); const m = (A(from) + A(z.to)) / 2 - Math.PI / 2; txt(g, (R * .84) * Math.cos(m), (R * .84) * Math.sin(m) + 4, z.label || '', { a: 'middle', f: font(700, comp ? 10 : 11), c: T.ink }); from = z.to; });
    d3.range(f.min, f.max + 1e-6, (f.max - f.min) / 5).forEach(v => { const a = A(v) - Math.PI / 2; txt(g, (R + 12) * Math.cos(a), (R + 12) * Math.sin(a) + 4, num(v, 0), { a: 'middle', f: font(500, 10.5), c: T.mid }); });
    const a = A(f.value) - Math.PI / 2, nx = R * .86 * Math.cos(a), ny = R * .86 * Math.sin(a); const needle = g.append('line').datum(f).attr('x1', 0).attr('y1', 0).attr('x2', nx).attr('y2', ny).attr('stroke', T.ink).attr('stroke-width', 4).attr('stroke-linecap', 'round'); g.append('circle').attr('r', 8).attr('fill', T.ink);
    interactive(needle, d => ({ title: d.label || 'Valeur', value: num(d.value, 1) + ' ' + (d.unit || ''), state: d.state, src: d.src, detail: d.note }), T);
    (f.targets || []).forEach(t => { const ta = A(t.value) - Math.PI / 2; g.append('line').attr('x1', R * .62 * Math.cos(ta)).attr('y1', R * .62 * Math.sin(ta)).attr('x2', (R + 4) * Math.cos(ta)).attr('y2', (R + 4) * Math.sin(ta)).attr('stroke', T.neg).attr('stroke-width', 3); });
    txt(g, 0, 36, num(f.value, 1) + ' ' + (f.unit || ''), { a: 'middle', f: font(800, 22, MONO), c: T.ink }); txt(g, 0, 54, f.label || '', { a: 'middle', f: font(600, 12), c: T.mid });
    legend(el, [f.state || 'actual']);
  }
  REG('gauge', gauge, (f, r) => r(['Indicateur', 'Valeur', 'Min', 'Max', 'Source'], [[f.label, num(f.value, 2), f.min, f.max, f.src]]));

  /* ============================== BARRES PICTOGRAMMES ============================== */
  function pictorial(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, per = f.perSymbol || 1, labelW = comp ? 90 : 180, band = comp ? 44 : 46, S = comp ? 16 : 20;
    const F = frame(el, id, D.length * band + 40, { l: labelW, r: 70, t: 6, b: 30 }); addPatterns(F.defs, id, T);
    const SH = { square: d3.symbolSquare, circle: d3.symbolCircle, diamond: d3.symbolDiamond, triangle: d3.symbolTriangle, cross: d3.symbolCross, star: d3.symbolStar }, sym = SH[f.symbol] || d3.symbolSquare, maxN = Math.max(...D.map(d => Math.ceil(d.value / per))), cw = Math.min(S + 4, (F.iw - 10) / maxN);
    D.forEach((d, i) => {
      const cy = i * band + band / 2; rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600); const full = Math.floor(d.value / per), part = d.value / per - full, g = F.g.append('g');
      for (let k = 0; k < full + (part > .05 ? 1 : 0); k++) { const frac = k < full ? 1 : part, p = g.append('path').datum(d).attr('transform', `translate(${k * cw + cw / 2},${cy}) scale(${.55 + .45 * frac})`).attr('d', d3.symbol().type(sym).size(S * S * .9)()); paint(p, T, id, dd => dd.state, () => col(T, d.color, 0)); p.attr('fill-opacity', k < full ? (isSoft(d.state) ? 1 : .9) : .45); }
      g.datum(d); interactive(g, dd => ({ title: dd.label, value: num(dd.value, 1) + ' ' + (f.unit || ''), state: dd.state, src: dd.src, detail: dd.note }), T); txt(F.g, (full + (part > .05 ? 1 : 0)) * cw + 8, cy + 4.5, num(d.value, f.dec), { f: font(700, 12.5, MONO), c: T.ink });
    });
    txt(F.g, 0, D.length * band + 20, `1 symbole = ${num(per, f.dec != null ? f.dec : 1)} ${f.unit || ''}`, { f: font(500, 11), c: T.mid }); legend(el, statesOf(D));
  }
  REG('pictorial', pictorial, tableOf(['Élément', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================================================================================
   *  LOT 5 — formes interactives, cartes (fond de carte facultatif), formes « dossier »
   * ============================================================================================ */
  const hasReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const srcPill = k => k ? `<a class="src" href="#src-${k}" data-src="${k}">${k}</a>` : '';
  const escH = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ============================== PLAYER : scénario jouable ============================== */
  function player(el, f, T) {
    const id = uid(), comp = isNarrow(el), K = f.categories, Fr = f.frames, bandH = comp ? 36 : 40, labelW = comp ? 100 : 180;
    const keepIdx = el.__idx != null ? el.__idx : 0; let idx = Math.min(keepIdx, Fr.length - 1), timer = null;
    const bar = document.createElement('div'); bar.className = 'ex-bar'; bar.innerHTML = '<button type="button" class="ex-btn" data-play aria-label="Lancer ou mettre en pause">▶ Lecture</button><label class="ex-slide" style="flex:1;min-width:180px"><span data-lab></span><input type="range" min="0" max="' + (Fr.length - 1) + '" step="1" value="' + idx + '" aria-label="Période"></label>';
    const F = frame(el, id, K.length * bandH + 44, { l: labelW, r: comp ? 56 : 70, t: 6, b: 30 }); addPatterns(F.defs, id, T); el.insertAdjacentElement('afterbegin', bar);
    const mx = f.max || d3.max(Fr, fr => d3.max(fr.values)) * 1.08, X = d3.scaleLinear([0, mx], [0, F.iw]); axisStyle(F.g.append('g').attr('transform', `translate(0,${K.length * bandH})`).call(d3.axisBottom(X).ticks(comp ? 4 : 6).tickFormat(v => num(v, 0)).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 6)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', K.length * bandH).attr('stroke', T.line).attr('stroke-opacity', .4);
    K.forEach((k, i) => rowLabel(F.g, k.label, i * bandH + bandH / 2, labelW, T, 12.5, 600));
    const rects = F.g.selectAll('rect.pl').data(K).join('rect').attr('class', 'pl').attr('x', 0).attr('y', (k, i) => i * bandH + bandH * .16).attr('height', bandH * .68).attr('rx', 2), vals = F.g.selectAll('text.pv').data(K).join('text').attr('class', 'pv').attr('fill', T.ink).style('font', font(700, 12.5, MONO));
    const lab = bar.querySelector('[data-lab]'), rng = bar.querySelector('input'), btn = bar.querySelector('[data-play]');
    function draw(i, anim) { idx = i; el.__idx = i; const fr = Fr[i]; lab.innerHTML = `${escH(f.periodLabel || 'Période')} : <b>${escH(fr.period)}</b>`; rng.value = i; rects.each(function (k, j) { const st = fr.state || 'actual'; const s = stateStyle(st, id, T); d3.select(this).attr('fill', isSoft(st) ? s.fill : col(T, k.color, j)).attr('fill-opacity', s.fillOpacity == null ? 1 : s.fillOpacity).attr('stroke', col(T, k.color, j)).attr('stroke-width', s.sw).attr('stroke-dasharray', s.dash); });
      (anim ? rects.transition().duration(350) : rects).attr('width', (k, j) => Math.max(2, X(fr.values[j]))); (anim ? vals.transition().duration(350) : vals).attr('x', (k, j) => X(fr.values[j]) + 6).attr('y', (k, j) => j * bandH + bandH / 2 + 4.5).text((k, j) => num(fr.values[j], f.dec) + ' ' + (f.unit === '%' ? '%' : ''));
      rects.each(function (k, j) { d3.select(this).datum({ k, j, fr }); }); }
    draw(idx, false); interactive(rects, d => ({ title: d.k.label + ' · ' + d.fr.period, value: num(d.fr.values[d.j], f.dec) + ' ' + (f.unit || ''), state: d.fr.state, src: d.fr.src || f.src, detail: d.fr.note }), T);
    rng.addEventListener('input', () => { stop(); draw(+rng.value, !hasReducedMotion()); });
    function stop() { clearInterval(timer); timer = null; btn.textContent = '▶ Lecture'; } function start() { if (idx >= Fr.length - 1) draw(0, false); btn.textContent = '❚❚ Pause'; timer = setInterval(() => { if (idx >= Fr.length - 1) return stop(); draw(idx + 1, true); }, 900); }
    btn.addEventListener('click', () => timer ? stop() : (hasReducedMotion() ? draw(Fr.length - 1, false) : start()));
    legend(el, Fr.map(fr => fr.state || 'actual'));
  }
  REG('player', player, (f, r) => r(['Période', ...f.categories.map(k => k.label), 'Source'], f.frames.map(fr => [fr.period, ...fr.values.map(v => num(v, 2)), fr.src || f.src])));

  /* ============================== LINKED : deux vues liées du même jeu d'observations ============================== */
  function linked(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, P = f.panels, cols = comp ? 1 : 2, pw = ((el.clientWidth || 640) - 8) / cols - 12, ph = comp ? 250 : 300, rowsN = Math.ceil(P.length / cols), groups = [...new Set(D.map(d => d.group).filter(Boolean))];
    const F = frame(el, id, rowsN * ph + 36, { l: 2, r: 2, t: 2, b: 2 }); addPatterns(F.defs, id, T); const dots = [];
    P.forEach((p, pi) => { const ox = (pi % cols) * (pw + 12), oy = Math.floor(pi / cols) * ph, g = F.g.append('g').attr('transform', `translate(${ox},${oy})`), m = { l: 40, r: 10, t: 26, b: 38 }, X = d3.scaleLinear(d3.extent(D, d => d['x' + p.key]), [0, pw - m.l - m.r]).nice(), Y = d3.scaleLinear(d3.extent(D, d => d['y' + p.key]), [ph - m.t - m.b, 0]).nice(), inner = g.append('g').attr('transform', `translate(${m.l},${m.t})`);
      txt(g, 0, 14, p.title || '', { f: font(700, 12.5), c: T.ink }); inner.append('g').call(d3.axisLeft(Y).ticks(4).tickSize(-(pw - m.l - m.r)).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .4); a.select('.domain').remove(); }); axisStyle(inner.append('g').attr('transform', `translate(0,${ph - m.t - m.b})`).call(d3.axisBottom(X).ticks(4).tickSizeOuter(0)), T);
      txt(inner, (pw - m.l - m.r) / 2, ph - m.t - 4, p.xLabel || '', { a: 'middle', f: font(600, 11), c: T.mid }); txt(inner, -m.l + 4, -8, p.yLabel || '', { f: font(600, 11), c: T.mid });
      const c = inner.selectAll('circle').data(D).join('circle').attr('cx', d => X(d['x' + p.key])).attr('cy', d => Y(d['y' + p.key])).attr('r', 6); paint(c, T, id, d => d.state, d => col(T, d.color, groups.indexOf(d.group))); c.attr('fill-opacity', d => isSoft(d.state) ? 1 : .8); dots.push(c);
      interactive(c, d => ({ title: d.label, value: `${p.xLabel || 'x'} ${num(d['x' + p.key], 1)} · ${p.yLabel || 'y'} ${num(d['y' + p.key], 1)}`, state: d.state, src: d.src, detail: d.group }), T); });
    const hl = d => dots.forEach(c => c.attr('r', x => x === d ? 10 : 6).attr('stroke-width', x => x === d ? 3 : 1.2).attr('opacity', x => d && x !== d ? .35 : 1));
    dots.forEach(c => c.on('pointerenter.link focus.link', (e, d) => hl(d)).on('pointerleave.link blur.link', () => hl(null)));
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); groups.forEach((gn, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="${col(T, (D.find(d => d.group === gn) || {}).color, i)}"/></svg>${gn}`; ul.appendChild(li); }); const li = document.createElement('li'); li.textContent = 'Survolez un point : il s\'allume dans les deux vues.'; ul.appendChild(li);
  }
  REG('linked', linked, tableOf(['Observation', 'Groupe', 'Source'], d => [d.label, d.group || '', d.src]));

  /* ============================== BRUSHSCATTER : sélection par pinceau + composition ============================== */
  function brushscatter(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, groups = [...new Set(D.map(d => d.group))], F = frame(el, id, (comp ? 300 : 360) + 20 + groups.length * 26 + 30, { l: comp ? 44 : 56, t: 10, r: 14, b: 50 }); addPatterns(F.defs, id, T);
    const ph = comp ? 240 : 300, X = d3.scaleLinear(d3.extent(D, d => d.x), [0, F.iw]).nice(), Y = d3.scaleLinear(d3.extent(D, d => d.y), [ph, 0]).nice();
    yAxisLeft({ ...F, ih: ph }, Y, T); axisStyle(F.g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(X).ticks(comp ? 5 : 8).tickSizeOuter(0)), T); txt(F.g, F.iw / 2, ph + 38, f.xLabel || '', { a: 'middle', f: font(600, 11.5), c: T.mid }); txt(F.g, -F.m.l + 6, -2, f.yLabel || '', { f: font(600, 11.5), c: T.mid });
    const dots = F.g.selectAll('circle').data(D).join('circle').attr('cx', d => X(d.x)).attr('cy', d => Y(d.y)).attr('r', 5.5); paint(dots, T, id, d => d.state, d => col(T, d.color, groups.indexOf(d.group))); dots.attr('fill-opacity', .8); interactive(dots, d => ({ title: d.label, value: `${f.xLabel || 'x'} ${num(d.x, 1)} · ${f.yLabel || 'y'} ${num(d.y, 1)}`, state: d.state, src: d.src, detail: d.group }), T);
    const sy = ph + 64, sumG = F.g.append('g'), SX = d3.scaleLinear([0, 1], [0, F.iw - 150]), rowH = 26; txt(sumG, 0, sy - 10, comp ? 'Composition de la sélection' : 'Composition de la sélection (tous les points si rien n\'est sélectionné)', { f: font(700, 11.5), c: T.ink });
    const bars = sumG.selectAll('rect').data(groups).join('rect').attr('x', 110).attr('y', (g, i) => sy + i * rowH).attr('height', rowH - 8).attr('rx', 2).attr('fill', (g, i) => col(T, (D.find(d => d.group === g) || {}).color, i)), lbl = sumG.selectAll('text.gl').data(groups).join('text').attr('class', 'gl').attr('x', 104).attr('y', (g, i) => sy + i * rowH + 12).attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(600, 12)).text(g => g), cnt = sumG.selectAll('text.gc').data(groups).join('text').attr('class', 'gc').attr('y', (g, i) => sy + i * rowH + 12).attr('fill', T.ink).style('font', font(700, 11.5, MONO));
    function upd(sel) { const set = sel || D, n = set.length || 1; bars.attr('width', g => Math.max(0, SX(set.filter(d => d.group === g).length / n))); cnt.attr('x', g => 114 + SX(set.filter(d => d.group === g).length / n)).text(g => `${set.filter(d => d.group === g).length} (${Math.round(100 * set.filter(d => d.group === g).length / n)} %)`); dots.attr('opacity', d => !sel || sel.includes(d) ? 1 : .2); }
    upd(null); const brush = d3.brush().extent([[0, 0], [F.iw, ph]]).on('brush end', e => { if (!e.selection) return upd(null); const [[x0, y0], [x1, y1]] = e.selection; upd(D.filter(d => X(d.x) >= x0 && X(d.x) <= x1 && Y(d.y) >= y0 && Y(d.y) <= y1)); }); F.g.append('g').attr('class', 'brush').call(brush).select('.selection').attr('fill', T.c1).attr('fill-opacity', .15).attr('stroke', T.c1);
    legend(el, statesOf(D));
  }
  REG('brushscatter', brushscatter, tableOf(['Observation', 'Groupe', 'x ; y', 'Source'], d => [d.label, d.group, num(d.x, 1) + ' ; ' + num(d.y, 1), d.src]));

  /* ============================== ZOOMLINE : aperçu + détail ============================== */
  function zoomline(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.series, xs = f.x.map(v => isDateStr(v) ? +new Date(v) : v), isD = isDateStr(f.x[0]), H1 = comp ? 230 : 280, H2 = 60, F = frame(el, id, H1 + H2 + 70, { l: comp ? 44 : 56, t: 10, r: comp ? 60 : 120, b: 20 }); addPatterns(F.defs, id, T);
    const allv = S.flatMap(s => s.values), Y = d3.scaleLinear([f.ymin != null ? f.ymin : Math.min(0, d3.min(allv)), d3.max(allv) * 1.05], [H1, 0]).nice(), Y2 = d3.scaleLinear(Y.domain(), [H2, 0]), X2 = (isD ? d3.scaleTime : d3.scaleLinear)(d3.extent(xs).map(v => isD ? new Date(v) : v), [0, F.iw]), X = X2.copy();
    const clip = id + 'clip'; F.defs.append('clipPath').attr('id', clip).append('rect').attr('width', F.iw).attr('height', H1 + 4).attr('y', -2);
    const gy = yAxisLeft({ ...F, ih: H1 }, Y, T), gx = F.g.append('g').attr('transform', `translate(0,${H1})`), main = F.g.append('g').attr('clip-path', `url(#${clip})`), ov = F.g.append('g').attr('transform', `translate(0,${H1 + 40})`);
    const mk = (S0, Yy) => d3.line().x((v, i) => S0(isD ? new Date(xs[i]) : xs[i])).y(v => Yy(v)), lines = S.map((s, i) => main.append('path').datum(s.values).attr('fill', 'none').attr('stroke', col(T, s.color, i)).attr('stroke-width', 2.4).attr('stroke-dasharray', stateStyle(s.state || 'actual', id, T).dash));
    S.forEach((s, i) => ov.append('path').datum(s.values).attr('d', mk(X2, Y2)(s.values)).attr('fill', 'none').attr('stroke', col(T, s.color, i)).attr('stroke-width', 1.4)); axisStyle(ov.append('g').attr('transform', `translate(0,${H2})`).call(d3.axisBottom(X2).ticks(comp ? 4 : 8).tickSizeOuter(0)), T);
    function redraw() { lines.forEach((l, i) => l.attr('d', mk(X, Y)(S[i].values))); axisStyle(gx.call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickSizeOuter(0)), T); }
    redraw(); S.forEach((s, i) => { const last = s.values[s.values.length - 1]; txt(F.g, F.iw + 8, Y(last) + 4, comp ? s.label.slice(0, 8) : s.label, { f: font(700, 12), c: col(T, s.color, i) }); });
    const brush = d3.brushX().extent([[0, 0], [F.iw, H2]]).on('brush end', e => { if (!e.selection) { X.domain(X2.domain()); } else X.domain(e.selection.map(X2.invert)); redraw(); }); ov.append('g').call(brush).call(brush.move, [F.iw * .55, F.iw]).select('.selection').attr('fill', T.c1).attr('fill-opacity', .18).attr('stroke', T.c1);
    txt(F.g, 0, H1 + 34, comp ? 'Aperçu : glissez la zone pour zoomer' : 'Aperçu : faites glisser ou redimensionnez la zone pour zoomer', { f: font(600, 11), c: T.mid }); legend(el, statesOf(S));
  }
  REG('zoomline', zoomline, (f, r) => r(['Série', 'Début', 'Fin', 'Source'], f.series.map(s => [s.label, num(s.values[0], 2), num(s.values[s.values.length - 1], 2), s.src])));

  /* ============================== CARTES : fond de carte, symboles, flux, trajets, hexagones ============================== */
  let _land = null;
  function topoFeature(topo, name) {
    const o = topo.objects[name], tr = topo.transform, arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(p => { x += p[0]; y += p[1]; return tr ? [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]] : [x, y]; }); });
    const ring = idx => { const out = []; idx.forEach(i => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; a.forEach((p, k) => { if (k || !out.length) out.push(p); }); }); return out; };
    const geom = g => g.type === 'Polygon' ? { type: 'Polygon', coordinates: g.arcs.map(ring) } : { type: 'MultiPolygon', coordinates: g.arcs.map(poly => poly.map(ring)) };
    return { type: 'FeatureCollection', features: (o.geometries || [o]).map(g => ({ type: 'Feature', properties: g.properties || {}, geometry: geom(g) })) };
  }
  function loadLand() { if (!_land) _land = fetch((global.VRA_VENDOR || 'vendor/') + 'land-110m.json').then(r => r.json()).then(t => topoFeature(t, 'land')).catch(() => null); return _land; }
  const proj = (f, w, h, pts) => { const kind = { mercator: d3.geoMercator, equirect: d3.geoEquirectangular, ortho: d3.geoOrthographic }[f.projection] || d3.geoNaturalEarth1, p = kind(); const box = f.bbox ? { type: 'MultiPoint', coordinates: [[f.bbox[0][0], f.bbox[0][1]], [f.bbox[1][0], f.bbox[0][1]], [f.bbox[1][0], f.bbox[1][1]], [f.bbox[0][0], f.bbox[1][1]]] } : (f.geojson || (pts && pts.length > 1 && f.fit !== 'world' ? { type: 'MultiPoint', coordinates: pts } : { type: 'Sphere' })); return p.fitExtent([[10, 10], [w - 10, h - 10]], box); };
  function geomap(el, f, T, mode) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, H = comp ? 280 : Math.round(W * .52), F = frame(el, id, H, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T);
    const D = f.data, pts = mode === 'flow' || mode === 'arc' ? D.flatMap(d => [[d.sourceLon, d.sourceLat], [d.targetLon, d.targetLat]]) : mode === 'trip' ? D.map(d => [d.x, d.y]) : D.map(d => [d.longitude != null ? d.longitude : d.x, d.latitude != null ? d.latitude : d.y]).filter(p => p[0] != null);
    const P = proj(f, F.iw, H, f.fit === 'world' ? null : pts), path = d3.geoPath(P); F.g.append('path').attr('d', path({ type: 'Sphere' })).attr('fill', 'none').attr('stroke', T.line); const base = F.g.append('g');
    if (f.base !== false && (mode !== 'arc' || f.base)) loadLand().then(land => { if (land) base.append('path').attr('d', path(land)).attr('fill', T.line).attr('fill-opacity', .55).attr('stroke', T.bg).attr('stroke-width', .5); });
    const mk = F.g.append('g'); const states = [];
    if (mode === 'symbol') { const r = d3.scaleSqrt([0, d3.max(D, d => d.value)], [3, comp ? 18 : 26]), c = mk.selectAll('circle').data(D).join('circle').attr('cx', d => P([d.longitude, d.latitude])[0]).attr('cy', d => P([d.longitude, d.latitude])[1]).attr('r', d => r(d.value)); paint(c, T, id, d => d.state, d => col(T, d.color, 0)); c.attr('fill-opacity', d => isSoft(d.state) ? 1 : .6); interactive(c, d => ({ title: d.label, value: num(d.value, 1) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T); D.filter(d => d.showLabel).forEach(d => txt(mk, P([d.longitude, d.latitude])[0] + r(d.value) + 3, P([d.longitude, d.latitude])[1] + 4, d.label, { f: font(600, 11), c: T.ink, halo: T.bg })); }
    if (mode === 'flow' || mode === 'arc') { const w = d3.scaleLinear([0, d3.max(D, d => d.value)], [1.2, 9]); const lp = mk.selectAll('path').data(D).join('path').attr('d', d => { const a = P([d.sourceLon, d.sourceLat]), b = P([d.targetLon, d.targetLat]); if (mode === 'arc') { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * .3; return `M${a},Q${mx},${my} ${b}`; } return path({ type: 'LineString', coordinates: [[d.sourceLon, d.sourceLat], [d.targetLon, d.targetLat]] }); }).attr('fill', 'none').attr('stroke-width', d => w(d.value)).attr('stroke-linecap', 'round'); lp.each(function (d, i) { const st = stateStyle(d.state || 'actual', id, T); d3.select(this).attr('stroke', col(T, d.color, 1)).attr('stroke-opacity', isSoft(d.state) ? .7 : .55).attr('stroke-dasharray', st.dash); }); interactive(lp, d => ({ title: (d.source || 'Origine') + ' → ' + (d.target || 'Destination'), value: num(d.value, 1) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T);
      const nodes = new Map(); D.forEach(d => { nodes.set(d.source + '|' + d.sourceLon, [d.source, d.sourceLon, d.sourceLat]); nodes.set(d.target + '|' + d.targetLon, [d.target, d.targetLon, d.targetLat]); }); [...nodes.values()].forEach(([n, lo, la]) => { const p = P([lo, la]); mk.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', 4).attr('fill', T.ink).attr('stroke', T.bg); if (n && f.labels !== false) txt(mk, p[0] + 6, p[1] - 5, n, { f: font(600, comp ? 10 : 11), c: T.ink, halo: T.bg }); }); }
    if (mode === 'trip') { const trips = d3.group(D, d => d.trip); [...trips.entries()].forEach(([tn, steps], i) => { steps.sort((a, b) => a.step - b.step); const lp = mk.append('path').datum({ trip: tn, steps }).attr('d', d3.line().curve(d3.curveCatmullRom.alpha(.5))(steps.map(s => P([s.x, s.y])))).attr('fill', 'none').attr('stroke', col(T, steps[0].color, i)).attr('stroke-width', 3).attr('stroke-opacity', .85); interactive(lp, d => ({ title: String(d.trip), value: d.steps.length + ' étapes', state: d.steps[0].state, src: d.steps[0].src }), T); steps.forEach((s, k) => { const p = P([s.x, s.y]); mk.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', k === 0 ? 5.5 : 3).attr('fill', col(T, s.color, i)).attr('stroke', T.bg); if (k === steps.length - 1) { const q = P([steps[k - 1].x, steps[k - 1].y]), a = Math.atan2(p[1] - q[1], p[0] - q[0]) * 180 / Math.PI; mk.append('path').attr('transform', `translate(${p}) rotate(${a})`).attr('d', 'M-6,-5L6,0L-6,5Z').attr('fill', col(T, s.color, i)); } if (s.label) txt(mk, p[0] + 7, p[1] - 6, s.label, { f: font(600, 10.5), c: T.ink, halo: T.bg }); }); states.push(steps[0].state || 'actual'); }); }
    if (mode === 'hexagg') { const R = f.size || (comp ? 12 : 16), dx = R * Math.sqrt(3), dy = R * 1.5, bins = new Map(); D.forEach(d => { const p = P([d.x, d.y]); if (!p) return; const r = Math.round(p[1] / dy), off = (r % 2) ? dx / 2 : 0, c = Math.round((p[0] - off) / dx), k = r + ',' + c, b = bins.get(k) || { cx: c * dx + off, cy: r * dy, w: 0, n: 0 }; b.w += d.weight || 1; b.n++; bins.set(k, b); }); const B = [...bins.values()].filter(b => b.cx >= 0 && b.cx <= F.iw && b.cy >= 0 && b.cy <= H), mxw = d3.max(B, b => b.w), hex = d3.range(6).map(i => [R * .94 * Math.cos(Math.PI / 6 + i * Math.PI / 3), R * .94 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]); const c = mk.selectAll('path').data(B).join('path').attr('transform', b => `translate(${b.cx},${b.cy})`).attr('d', 'M' + hex.map(p => p.join(',')).join('L') + 'Z').attr('fill', b => seq(T, b.w / mxw)).attr('fill-opacity', .88).attr('stroke', T.bg).attr('stroke-width', .6); interactive(c, b => ({ title: 'Cellule hexagonale', value: b.n + ' points · poids ' + num(b.w, 1) + ' ' + (f.unit || ''), state: f.state, src: f.src }), T); }
    legend(el, mode === 'trip' ? states : (mode === 'hexagg' ? [f.state || 'actual'] : D.map(d => d.state || 'actual')));
  }
  REG('symbolmap', (el, f, T) => geomap(el, f, T, 'symbol'), tableOf(['Lieu', 'Valeur', 'Source'], d => [d.label, num(d.value, 2), d.src]));
  REG('flowmap', (el, f, T) => geomap(el, f, T, 'flow'), tableOf(['Origine', 'Destination', 'Valeur', 'Source'], d => [d.source, d.target, num(d.value, 2), d.src]));
  REG('arcflow', (el, f, T) => geomap(el, f, T, 'arc'), tableOf(['Origine', 'Destination', 'Valeur', 'Source'], d => [d.source, d.target, num(d.value, 2), d.src]));
  REG('triptrail', (el, f, T) => geomap(el, f, T, 'trip'), tableOf(['Trajet', 'Étape', 'Lieu', 'Source'], d => [d.trip, d.step, d.label || num(d.x, 2) + ' ; ' + num(d.y, 2), d.src]));
  REG('hexagg', (el, f, T) => geomap(el, f, T, 'hexagg'), (f, r) => r(['x', 'y', 'Poids'], f.data.slice(0, 200).map(d => [num(d.x, 2), num(d.y, 2), d.weight || 1])));

  /* ============================== CHOROPLÈTHE (GeoJSON fourni) ============================== */
  /* d3 attend des anneaux extérieurs horaires ; la plupart des GeoJSON (RFC 7946) sont antihoraires : on les redresse */
  const rewindFC = fc => ({ ...fc, features: fc.features.map(ft => { const g = ft.geometry, fix = rings => rings.map((r, i) => { const big = d3.geoArea({ type: 'Polygon', coordinates: [r] }) > 2 * Math.PI; return (i === 0 ? big : !big && d3.geoArea({ type: 'Polygon', coordinates: [r.slice().reverse()] }) > 2 * Math.PI) ? r.slice().reverse() : r; }); return { ...ft, geometry: g.type === 'Polygon' ? { ...g, coordinates: fix(g.coordinates) } : g.type === 'MultiPolygon' ? { ...g, coordinates: g.coordinates.map(fix) } : g }; }) });
  function choropleth(el, f, T) {
    f = { ...f, geojson: rewindFC(f.geojson) };
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, H = comp ? 300 : Math.round(W * .55), F = frame(el, id, H + 56, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T);
    const key = f.key || 'name', by = new Map(f.data.map(d => [d.geo, d])), P = proj(f, F.iw, H, null), path = d3.geoPath(P), lo = f.min != null ? f.min : d3.min(f.data, d => d.value), hi = f.max != null ? f.max : d3.max(f.data, d => d.value), S = d3.scaleLinear([lo, hi], [0, 1]).clamp(true);
    const shapes = F.g.selectAll('path').data(f.geojson.features).join('path').attr('d', path).attr('fill', ft => { const d = by.get(ft.properties[key]); return d ? seq(T, S(d.value)) : T.line; }).attr('stroke', T.bg).attr('stroke-width', 1);
    shapes.each(function (ft) { const d = by.get(ft.properties[key]); if (d && isSoft(d.state)) { d3.select(this).attr('stroke', T.c3).attr('stroke-dasharray', '4 3').attr('stroke-width', 1.6); } });
    interactive(shapes, ft => { const d = by.get(ft.properties[key]) || {}; return { title: ft.properties[key], value: d.value != null ? num(d.value, f.dec) + ' ' + (f.unit || '') : 'pas de donnée', state: d.state, src: d.src, detail: d.note }; }, T);
    F.g.selectAll('text').data(f.geojson.features.length < 20 ? f.geojson.features : []).join('text').attr('x', ft => path.centroid(ft)[0]).attr('y', ft => path.centroid(ft)[1] + 4).attr('text-anchor', 'middle').attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 2.5).attr('paint-order', 'stroke').style('font', font(600, 10.5)).style('pointer-events', 'none').text(ft => ft.properties[key]);
    seqLegend({ ...F, g: F.g }, id, T, lo, hi, H + 12, f.unit || '', f.dec); legend(el, statesOf(f.data));
  }
  REG('choropleth', choropleth, tableOf(['Unité', 'Valeur', 'État', 'Source'], d => [d.geo, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== CARTE EN TUILES HEXAGONALES ============================== */
  function hexmap(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, W = el.clientWidth || 640, qs = d3.extent(D, d => d.q), rs = d3.extent(D, d => d.r), nq = qs[1] - qs[0] + 1 + (rs[1] - rs[0]) / 2, R = Math.min(34, (W - 20) / (nq * Math.sqrt(3) + 1)), dx = R * Math.sqrt(3), dy = R * 1.5, H = (rs[1] - rs[0] + 1) * dy + R * 1.6 + 56, F = frame(el, id, H, { l: 6, r: 6, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const lo = f.min != null ? f.min : d3.min(D, d => d.value), hi = f.max != null ? f.max : d3.max(D, d => d.value), S = d3.scaleLinear([lo, hi], [0, 1]).clamp(true), hex = d3.range(6).map(i => [R * .95 * Math.cos(Math.PI / 6 + i * Math.PI / 3), R * .95 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]), pos = d => [(d.q - qs[0]) * dx + (d.r - rs[0]) * dx / 2 + dx / 2 + (F.iw - nq * dx) / 2, (d.r - rs[0]) * dy + R + 4];
    const cells = F.g.selectAll('g.hm').data(D).join('g').attr('class', 'hm').attr('transform', d => `translate(${pos(d)})`); const hp = cells.append('path').attr('d', 'M' + hex.map(p => p.join(',')).join('L') + 'Z').attr('fill', d => seq(T, S(d.value))).attr('stroke', T.bg).attr('stroke-width', 1.2);
    cells.each(function (d) { if (isSoft(d.state)) d3.select(this).append('path').attr('d', 'M' + hex.map(p => p.join(',')).join('L') + 'Z').attr('fill', `url(#${id}-${d.state})`).attr('fill-opacity', .45).style('pointer-events', 'none'); });
    cells.append('text').attr('text-anchor', 'middle').attr('y', -1).attr('fill', d => ink(T, seq(T, S(d.value)))).style('font', font(700, Math.max(9, R * .36))).style('pointer-events', 'none').text(d => d.label); cells.append('text').attr('text-anchor', 'middle').attr('y', R * .42).attr('fill', d => ink(T, seq(T, S(d.value)))).style('font', font(600, Math.max(8.5, R * .32), MONO)).style('pointer-events', 'none').text(d => num(d.value, f.dec));
    interactive(cells, d => ({ title: d.name || d.label, value: num(d.value, f.dec) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T); seqLegend(F, id, T, lo, hi, H - 44, f.unit || '', f.dec); legend(el, statesOf(D));
  }
  REG('hexmap', hexmap, tableOf(['Région', 'Valeur', 'État', 'Source'], d => [d.name || d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== LIFELINES : naissance, rachat, fermeture ============================== */
  function lifelines(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, band = comp ? 38 : 40, labelW = comp ? 96 : 170, F = frame(el, id, D.length * band + 50, { l: labelW, r: comp ? 20 : 120, t: 8, b: 32 }); addPatterns(F.defs, id, T);
    const toN = v => isDateStr(v) ? +new Date(v) : v, from = toN(f.from != null ? f.from : d3.min(D, d => toN(d.start))), to = toN(f.to != null ? f.to : d3.max(D, d => toN(d.end != null ? d.end : f.today || d.start))), isD = isDateStr(f.from || D[0].start), X = (isD ? d3.scaleTime : d3.scaleLinear)([isD ? new Date(from) : from, isD ? new Date(to) : to], [0, F.iw]), xv2 = v => X(isD ? new Date(toN(v)) : toN(v));
    axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(isD ? d3.timeFormat('%Y') : d3.format('d')).tickSizeOuter(0)), T);
    F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 8)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .4);
    const FATE = { alive: { c: 'c2', l: 'En activité' }, acquired: { c: 'c3', l: 'Rachetée' }, closed: { c: 'neg', l: 'Fermée' }, ipo: { c: 'c1', l: 'Cotée' } };
    D.forEach((d, i) => { const cy = i * band + band / 2, x0 = xv2(d.start), x1 = d.end != null ? xv2(d.end) : F.iw, fate = FATE[d.fate || (d.end != null ? 'closed' : 'alive')], c = T[fate.c]; rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600);
      const ln = F.g.append('line').datum(d).attr('x1', x0).attr('x2', x1).attr('y1', cy).attr('y2', cy).attr('stroke', c).attr('stroke-width', 6).attr('stroke-linecap', 'round').attr('stroke-opacity', isSoft(d.state) ? .5 : .9).attr('stroke-dasharray', stateStyle(d.state || 'actual', id, T).dash); interactive(ln, dd => ({ title: dd.label, value: `${dd.start} → ${dd.end != null ? dd.end : 'aujourd\'hui'} · ${fate.l}`, state: dd.state, src: dd.src, detail: dd.note }), T);
      F.g.append('circle').attr('cx', x0).attr('cy', cy).attr('r', 5).attr('fill', T.bg).attr('stroke', c).attr('stroke-width', 2.2);
      if (d.end != null) { if ((d.fate || 'closed') === 'closed') F.g.append('path').attr('transform', `translate(${x1},${cy})`).attr('d', 'M-6,-6L6,6M6,-6L-6,6').attr('stroke', c).attr('stroke-width', 3).attr('fill', 'none'); else F.g.append('path').attr('transform', `translate(${x1},${cy})`).attr('d', d3.symbol().type(d3.symbolDiamond).size(160)()).attr('fill', c).attr('stroke', T.bg); }
      (d.events || []).forEach(e => { const ex = xv2(e.date), s = F.g.append('path').datum(e).attr('transform', `translate(${ex},${cy})`).attr('d', d3.symbol().type(d3.symbolTriangle).size(110)()).attr('fill', T.ink).attr('stroke', T.bg); interactive(s, ee => ({ title: ee.label, value: String(ee.date), src: d.src }), T); });
      if (!comp) txt(F.g, x1 + 12, cy + 4, d.end != null ? FATE[d.fate || 'closed'].l + ' · ' + d.end : FATE[d.fate || 'alive'].l, { f: font(600, 11), c: T.mid }); });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); [['Naissance (cercle creux)', null], ['Événement (triangle)', null]].forEach(([l]) => { const li = document.createElement('li'); li.textContent = l; ul.appendChild(li); });
  }
  REG('lifelines', lifelines, tableOf(['Entité', 'Début', 'Fin', 'Source'], d => [d.label, d.start, d.end != null ? d.end : '', d.src]));

  /* ============================== LAGBARS : décalage entre deux dates ============================== */
  function lagbars(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.map(d => ({ ...d, ta: new Date(d.a), tb: new Date(d.b) })), band = comp ? 44 : 46, labelW = comp ? 100 : 190, F = frame(el, id, D.length * band + 46, { l: labelW, r: comp ? 70 : 110, t: 8, b: 32 }); addPatterns(F.defs, id, T);
    const X = d3.scaleTime([d3.min(D, d => d.ta), d3.max(D, d => d.tb)], [0, F.iw]).nice(); axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(d3.timeFormat(comp ? '%b %y' : '%b %Y')).tickSizeOuter(0)), T); F.g.append('g').selectAll('line').data(X.ticks(comp ? 4 : 8)).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', D.length * band).attr('stroke', T.line).attr('stroke-opacity', .4);
    D.forEach((d, i) => { const cy = i * band + band / 2, days = Math.round((d.tb - d.ta) / 864e5); rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600); F.g.append('line').attr('x1', X(d.ta)).attr('x2', X(d.tb)).attr('y1', cy).attr('y2', cy).attr('stroke', T.neg).attr('stroke-width', 4).attr('stroke-linecap', 'round').attr('stroke-opacity', .5);
      [[d.ta, f.aLabel || 'Début', T.c3], [d.tb, f.bLabel || 'Fin', T.c1]].forEach(([t, l, c], k) => { const dot = F.g.append('circle').datum(d).attr('cx', X(t)).attr('cy', cy).attr('r', 8); paint(dot, T, id, dd => dd.state, () => c); interactive(dot, dd => ({ title: dd.label + ' · ' + l, value: d3.timeFormat('%d %B %Y')(t), state: dd.state, src: dd.src, detail: dd.note }), T); });
      txt(F.g, X(d.tb) + 14, cy + 4.5, days >= 90 ? `${num(days / 30.4, 0)} mois` : `${days} j`, { f: font(700, 12.5, MONO), c: T.ink }); });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); [[f.aLabel || 'Début', T.c3], [f.bLabel || 'Fin', T.c1]].forEach(([l, c]) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="${c}"/></svg>${l}`; ul.appendChild(li); });
  }
  REG('lagbars', lagbars, tableOf(['Élément', 'Début', 'Fin', 'Source'], d => [d.label, d.a, d.b, d.src]));

  /* ============================== MIRROR : deux phases en miroir autour d'un axe ============================== */
  function mirror(el, f, T) {
    const id = uid(), comp = isNarrow(el), xs = f.x, U = f.up, Dn = f.down, F = frame(el, id, comp ? 320 : 380, { l: comp ? 44 : 56, t: 14, r: comp ? 70 : 130, b: 36 }); addPatterns(F.defs, id, T);
    const X = xScale(xs, F.iw), mx = Math.max(d3.max(U.values), d3.max(Dn.values)) * 1.1, Y = d3.scaleLinear([-mx, mx], [F.ih, 0]);
    F.g.append('g').call(d3.axisLeft(Y).ticks(6).tickFormat(v => num(Math.abs(v), 0)).tickSize(-F.iw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .4); a.select('.domain').remove(); }); axisStyle(F.g.append('g').attr('transform', `translate(0,${Y(0)})`).call(xAxis(X, xs, comp)), T);
    (f.phases || []).forEach((ph, i) => { const x0 = xv(X, ph.from), x1 = xv(X, ph.to); F.g.append('rect').attr('x', x0).attr('width', x1 - x0).attr('y', 0).attr('height', F.ih).attr('fill', col(T, ph.color, i + 2)).attr('fill-opacity', .09); txt(F.g, (x0 + x1) / 2, 12, ph.label, { a: 'middle', f: font(700, 11), c: T.mid }); });
    [[U, 1, T.c1], [Dn, -1, T.neg]].forEach(([s, sg, c]) => { const a = F.g.append('path').datum(s).attr('d', d3.area().x((v, i) => xv(X, xs[i])).y0(Y(0)).y1(v => Y(sg * v)).curve(d3.curveMonotoneX)(s.values)); paint(a, T, id, d => d.state, () => col(T, s.color, sg > 0 ? 0 : 5)); a.attr('fill-opacity', isSoft(s.state) ? 1 : .5).attr('stroke-width', 2); interactive(a, d => ({ title: d.label, value: 'max ' + num(d3.max(d.values), 1) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T); txt(F.g, F.iw + 8, Y(sg * s.values[s.values.length - 1]) + (sg > 0 ? -2 : 12), comp ? s.label.slice(0, 8) : s.label, { f: font(700, 12), c: sg > 0 ? T.c1 : T.neg }); });
    F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(0)).attr('y2', Y(0)).attr('stroke', T.ink).attr('stroke-width', 1.4); legend(el, [U.state || 'actual', Dn.state || 'actual']);
  }
  REG('mirror', mirror, (f, r) => r(['Période', f.up.label, f.down.label], f.x.map((x, i) => [x, num(f.up.values[i], 2), num(f.down.values[i], 2)])));

  /* ============================== ATLAS : grille lignée × génération ============================== */
  function atlas(el, f, T) {
    const id = uid(), comp = isNarrow(el), R = f.rows, Cc = f.cols, W = el.clientWidth || 640, labelW = comp ? 86 : 150, cw = Math.max(70, (W - labelW - 16) / Cc.length), ch = comp ? 64 : 70, top = 30, F = frame(el, id, top + R.length * ch + 10, { l: labelW, r: 6, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    Cc.forEach((c, j) => txt(F.g, j * cw + cw / 2, top - 10, c, { a: 'middle', f: font(700, 11.5), c: T.mid })); R.forEach((r, i) => rowLabel(F.g, r, top + i * ch + ch / 2, labelW, T, 12.5, 700));
    const cells = F.g.selectAll('g.at').data(f.cells).join('g').attr('class', 'at').attr('transform', d => `translate(${Cc.indexOf(d.col) * cw + 2},${top + R.indexOf(d.row) * ch + 2})`), rc = cells.append('rect').attr('width', cw - 4).attr('height', ch - 4).attr('rx', 6); paint(rc, T, id, d => d.state, d => col(T, d.color, R.indexOf(d.row))); rc.attr('fill-opacity', d => isSoft(d.state) ? 1 : .22).attr('stroke-width', 1.8);
    cells.each(function (d) { const t = d3.select(this).append('text').attr('fill', T.ink).style('font', font(700, comp ? 10.5 : 11.5)).style('pointer-events', 'none'); wrapLines(d.label, cw - 16, comp ? 10.5 : 11.5, 700).slice(0, 3).forEach((ln, k) => t.append('tspan').attr('x', 8).attr('y', 17 + k * 13).text(ln)); if (d.sub) d3.select(this).append('text').attr('x', 8).attr('y', ch - 12).attr('fill', T.mid).style('font', font(600, 10, MONO)).text(d.sub); });
    interactive(cells, d => ({ title: d.row + ' · ' + d.col, value: d.label + (d.sub ? ' — ' + d.sub : ''), state: d.state, src: d.src, detail: d.note }), T); legend(el, statesOf(f.cells));
  }
  REG('atlas', atlas, tableOf(['Lignée', 'Génération', 'Produit', 'Source'], d => [d.row, d.col, d.label, d.src], 'cells'));

  /* ============================== GATES : contraintes classées + voies de contournement ============================== */
  function gates(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => b.rigidity - a.rigidity), band = comp ? 62 : 54, labelW = comp ? 110 : 200, F = frame(el, id, D.length * band + 40, { l: labelW, r: comp ? 10 : 230, t: 6, b: 30 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear([0, 100], [0, F.iw]); axisStyle(F.g.append('g').attr('transform', `translate(0,${D.length * band})`).call(d3.axisBottom(X).ticks(5).tickFormat(v => v + '').tickSizeOuter(0)), T);
    D.forEach((d, i) => { const cy = i * band + band / 2; rowLabel(F.g, d.label, cy - (comp ? 8 : 0), labelW, T, 12.5, 700); const b = F.g.append('rect').datum(d).attr('x', 0).attr('y', cy - 11 - (comp ? 8 : 0)).attr('width', Math.max(2, X(d.rigidity))).attr('height', 22).attr('rx', 3); paint(b, T, id, dd => dd.state, () => d.rigidity > 66 ? T.neg : d.rigidity > 33 ? T.c4 : T.c2); interactive(b, dd => ({ title: dd.label, value: 'rigidité ' + num(dd.rigidity, 0) + ' / 100', state: dd.state, src: dd.src, detail: 'Contournement : ' + (dd.bypass || '—') }), T); txt(F.g, X(d.rigidity) + 6, cy + 4.5 - (comp ? 8 : 0), num(d.rigidity, 0), { f: font(700, 12.5, MONO), c: T.ink });
      if (d.bypass) { const t = F.g.append('text').attr('fill', T.mid).style('font', font(500, comp ? 10.5 : 11.5)).style('pointer-events', 'none'); wrapLines('↪ ' + d.bypass, comp ? F.iw : 215, comp ? 10.5 : 11.5, 500).slice(0, 2).forEach((ln, k) => t.append('tspan').attr('x', comp ? 0 : F.iw + 12).attr('y', comp ? cy + 18 + k * 12 : cy - 2 + k * 13).text(ln)); } });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); const li = document.createElement('li'); li.textContent = 'Plus la barre est longue, plus la contrainte est rigide ; ↪ = voie de contournement.'; ul.appendChild(li);
  }
  REG('gates', gates, tableOf(['Contrainte', 'Rigidité', 'Contournement', 'Source'], d => [d.label, d.rigidity, d.bypass || '', d.src]));

  /* ============================== CHAIN : des hypothèses qui se multiplient en résultat ============================== */
  function chain(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.steps, W = el.clientWidth || 640, op = f.op || '×', compute = (arr) => op === '×' ? arr.reduce((a, b) => a * b, 1) : arr.reduce((a, b) => a + b, 0), res = compute(S.map(s => s.value));
    const bw = comp ? W - 20 : Math.min(150, (W - 20 - (S.length) * 34) / (S.length + 1)), bh = comp ? 54 : 90, gap = comp ? 28 : 34, H = comp ? (S.length + 1) * (bh + gap) : bh + 70, F = frame(el, id, H, { l: 4, r: 4, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    const items = S.concat([{ label: f.resultLabel || 'Résultat', value: res, unit: f.resultUnit || '', state: 'derived', src: f.src, result: true }]);
    items.forEach((s, i) => { const x = comp ? 0 : i * (bw + gap), y = comp ? i * (bh + gap) : 10, g = F.g.append('g').attr('transform', `translate(${x},${y})`); const r = g.append('rect').datum(s).attr('width', bw).attr('height', bh).attr('rx', 8); paint(r, T, id, d => d.state, () => s.result ? T.c2 : T.c1); r.attr('fill-opacity', d => isSoft(d.state) ? 1 : .18).attr('stroke-width', s.result ? 3 : 1.8);
      txt(g, bw / 2, comp ? 22 : 30, num(s.value, s.dec != null ? s.dec : (Math.abs(s.value) < 10 ? 2 : 0)) + (s.unit ? ' ' + s.unit : ''), { a: 'middle', f: font(800, comp ? 17 : 19, MONO), c: T.ink, halo: T.bg }); const t = g.append('text').attr('text-anchor', 'middle').attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 3).attr('paint-order', 'stroke').style('font', font(600, comp ? 11 : 11.5)).style('pointer-events', 'none'); wrapLines(s.label, bw - 12, comp ? 11 : 11.5, 600).slice(0, 3).forEach((ln, k) => t.append('tspan').attr('x', bw / 2).attr('y', (comp ? 38 : 52) + k * 13).text(ln));
      interactive(r, d => ({ title: d.label, value: num(d.value, 3) + ' ' + (d.unit || ''), state: d.state, src: d.src, detail: d.note || (d.result ? 'Produit calculé des étapes précédentes' : '') }), T);
      if (i < items.length - 1) txt(F.g, comp ? bw / 2 : x + bw + gap / 2, comp ? y + bh + gap / 2 + 8 : y + bh / 2 + 8, i === items.length - 2 ? '=' : op, { a: 'middle', f: font(800, 22), c: T.ink }); });
    legend(el, items.map(s => s.state || 'actual'));
  }
  REG('chain', chain, (f, r) => r(['Étape', 'Valeur', 'Source'], f.steps.map(s => [s.label, num(s.value, 3) + ' ' + (s.unit || ''), s.src])));

  /* ============================== DOSSIERS : fiches dépliables (HTML) ============================== */
  function dossiers(el, f, T) {
    el.innerHTML = ''; const wrap = document.createElement('div'); wrap.className = 'gloss';
    f.data.forEach(d => { const det = document.createElement('details'), rows = (d.rows || []).map(([k, v]) => `<tr><th scope="row" style="text-align:left;padding:.25rem .8rem .25rem 0;color:var(--vra-mid);font-weight:600">${escH(k)}</th><td>${escH(v)}</td></tr>`).join(''); det.innerHTML = `<summary>${escH(d.label)}${d.headline ? ' — <span style="font-weight:500;color:var(--vra-mid)">' + escH(d.headline) + '</span>' : ''}</summary><div class="g-body"><p>${escH(d.summary || '')} ${srcPill(d.src)} <span class="chip chip-${d.state || 'actual'}">${SL(d.state)}</span></p><table style="border-collapse:collapse;font-size:.88rem">${rows}</table></div>`; wrap.appendChild(det); }); el.appendChild(wrap);
  }
  REG('dossiers', dossiers, (f, r) => r(['Entité', 'Résumé', 'Source'], f.data.map(d => [d.label, d.summary || '', d.src])));

  /* ============================== BASISTABLE : tableau qui impose le dénominateur ============================== */
  function basistable(el, f, T) {
    el.innerHTML = ''; const head = f.head, tb = document.createElement('div'); tb.className = 'tbl-wrap';
    const rows = f.rows.map(r => `<tr${r.flag ? ' style="background:color-mix(in srgb,var(--vra-neg) 10%,transparent)"' : ''}>${r.cells.map((c, i) => `<td${i === 0 ? ' style="font-weight:600"' : ''}>${escH(c)}</td>`).join('')}<td>${r.flag ? '<span class="pill ko">Dénominateur différent</span>' : '<span class="pill ok">Base identique</span>'} ${srcPill(r.src)}</td></tr>`).join('');
    tb.innerHTML = `<table><caption class="sr-only" style="position:absolute;left:-9999px">${escH(f.label || '')}</caption><thead><tr>${head.map(h => `<th scope="col">${escH(h)}</th>`).join('')}<th scope="col">Contrôle</th></tr></thead><tbody>${rows}</tbody></table>`; el.appendChild(tb);
    if (f.note) { const p = document.createElement('p'); p.style.cssText = 'font:400 .84rem/1.5 var(--vra-sans);color:var(--vra-mid);margin:.4rem 0 0'; p.textContent = f.note; el.appendChild(p); }
  }
  REG('basistable', basistable, (f, r) => r(f.head, f.rows.map(x => x.cells)));

  /* ============================== LIEFLAT : modèle Lieflat Charts intégré en iframe ============================== */
  /* Licence PolyForm Noncommercial 1.0.0 — usage non commercial uniquement (accord du 2026-10-02). Le fichier lieflat/<slug>.html
     doit être une COPIE adaptée (données et textes modifiés) placée à côté de l'article ; il conserve l'avis de licence. */
  /* Thématisation : toute la palette Lieflat est un dégradé de gris chauds (33 teintes). On les remappe, par luminosité, sur le dégradé
     encre → fond de l'article (donc clair/sombre suivent le thème), avec option `accent` (ex. "c1") pour teinter les gris intermédiaires. */
  function lfTheme(html, T, f) {
    const ink = d3.color(T.ink), bg = d3.color(T.bg), acc = f.accent ? d3.color(T[f.accent] || f.accent) : null, L0 = d3.hsl('#1c1c1a').l, L1 = d3.hsl('#f0efeb').l;
    const mix = (a, b, t) => d3.interpolateRgb(a, b)(t);
    const map = h => { const l = d3.hsl(h).l, t = Math.max(0, Math.min(1, (l - L0) / (L1 - L0))); return (acc && t > .12 && t < .88) ? d3.color(mix(acc, bg, (t - .12) / .76)).formatHex() : d3.color(mix(ink, bg, t)).formatHex(); };
    let out = html.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, m => map(m));
    out = out.replace(/rgba\(\s*28\s*,\s*28\s*,\s*26\s*,/g, `rgba(${Math.round(ink.r)},${Math.round(ink.g)},${Math.round(ink.b)},`).replace(/rgba\(\s*240\s*,\s*239\s*,\s*235\s*,/g, `rgba(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)},`);
    if (f.font !== false) out = out.replace(/family=Inter:/g, 'family=Geist:').replace(/\bInter\b/g, 'Geist');
    out = out.replace('<head>', '<head><meta name="color-scheme" content="light dark"><style>html{background:transparent}</style>');
    return out;
  }
  function lieflat(el, f, T) {
    el.innerHTML = ''; const fr = document.createElement('iframe');
    fr.title = f.label || 'Graphique Lieflat'; fr.loading = 'lazy'; fr.setAttribute('scrolling', 'no');
    fr.style.cssText = `width:100%;height:${f.height || 460}px;border:0;display:block;border-radius:8px;background:transparent`;
    const slug = (f.file || '').split('/').pop().replace(/\.html.*$/, '');
    const onMsg = e => { if (e.source === fr.contentWindow && e.data && e.data.lieflat === slug && e.data.h) fr.style.height = Math.max(200, Math.min(1400, e.data.h + 4)) + 'px'; };
    global.addEventListener('message', onMsg); el.appendChild(fr);
    if (f.theme === false) fr.src = f.file;
    else fetch(f.file).then(r => { if (!r.ok) throw 0; return r.text(); }).then(t => { fr.srcdoc = lfTheme(t, T, f); }).catch(() => { fr.src = f.file; });
    const p = document.createElement('p'); p.style.cssText = 'font:500 .72rem/1.4 var(--vra-sans);color:var(--vra-mid);margin:.3rem 0 0';
    p.innerHTML = 'Données et textes adaptés pour ce dossier. ' + (f.src ? srcPill(f.src) : ''); el.appendChild(p);
  }
  REG('lieflat', lieflat, (f, r) => f.table ? r(f.table.head, f.table.rows) : r(['Graphique', 'Fichier', 'Source'], [[f.label || '', f.file || '', f.src || '']]));

  /* ============================================================================================
   *  LOT 6 — FORMES ORIGINALES (conçues pour ce skill, pas dans la bibliothèque d'origine)
   *  lorenz · maturitywall · contagion · sourcespread · hemicycle · magnitudes · sparktable · ledger
   *  probtree · fuzzytimeline · ringcalendar · verdictboard · crossing
   * ============================================================================================ */
  const cssv = n => `var(--vra-${n})`;
  const chipHtml = s => `<span class="chip chip-${s || 'actual'}">${SL(s)}</span>`;
  const mkNode = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };

  /* ============================== 1. LORENZ — qui concentre quoi ? ============================== */
  function lorenz(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => a.value - b.value), tot = d3.sum(D, d => d.value), n = D.length, W = el.clientWidth || 640;
    const k = Math.min(f.topK || 2, n - 1), S = comp ? W - 28 : Math.min(360, W * .5), barW = comp ? 0 : Math.max(120, W - S - 70), H = comp ? S + 146 : S + 72;
    const F = frame(el, id, H, { l: 46, r: 8, t: 30, b: 40 }); addPatterns(F.defs, id, T);
    const ps = S - 46 - 8, X = d3.scaleLinear([0, 1], [0, ps]), Y = d3.scaleLinear([0, 1], [ps, 0]);
    let c = 0; const pts = [{ x: 0, y: 0 }].concat(D.map((d, i) => { c += d.value; return { x: (i + 1) / n, y: c / tot, d, i }; }));
    let area = 0; for (let i = 1; i < pts.length; i++) area += (pts[i - 1].y + pts[i].y) / 2 * (1 / n); const gini = 1 - 2 * area;
    [0, .25, .5, .75, 1].forEach(v => { F.g.append('line').attr('x1', 0).attr('x2', ps).attr('y1', Y(v)).attr('y2', Y(v)).attr('stroke', T.line).attr('stroke-opacity', .5); txt(F.g, -6, Y(v) + 4, Math.round(v * 100) + ' %', { a: 'end', f: font(500, 10.5), c: T.mid }); txt(F.g, X(v), ps + 16, Math.round(v * 100) + ' %', { a: 'middle', f: font(500, 10.5), c: T.mid }); });
    txt(F.g, ps / 2, ps + 34, f.xLabel || 'part cumulée des entités (de la plus petite à la plus grande)', { a: 'middle', f: font(600, 11), c: T.mid }); txt(F.g, -40, -14, f.yLabel || 'part cumulée du total', { f: font(600, 11), c: T.mid });
    F.g.append('line').attr('x1', X(0)).attr('y1', Y(0)).attr('x2', X(1)).attr('y2', Y(1)).attr('stroke', T.ink).attr('stroke-dasharray', '5 4').attr('stroke-width', 1.4); txt(F.g, ps * .55, Y(.58) - 10, 'égalité parfaite', { a: 'middle', f: font(500, 10.5), c: T.mid, halo: T.bg }).attr('transform', `rotate(-45 ${ps * .55},${Y(.58) - 10})`);
    F.g.append('path').datum(pts).attr('d', d3.area().x(p => X(p.x)).y0(p => Y(p.x)).y1(p => Y(p.y)).curve(d3.curveLinear)).attr('fill', T.c3).attr('fill-opacity', .2);
    F.g.append('path').datum(pts).attr('d', d3.line().x(p => X(p.x)).y(p => Y(p.y))).attr('fill', 'none').attr('stroke', T.c1).attr('stroke-width', 2.8);
    const dots = F.g.selectAll('circle.lz').data(pts.slice(1)).join('circle').attr('class', 'lz').attr('cx', p => X(p.x)).attr('cy', p => Y(p.y)).attr('r', 4.8); paint(dots, T, id, p => p.d.state, p => (p.i >= n - k) ? T.neg : T.c1);
    interactive(dots, p => ({ title: p.d.label, value: `${num(p.d.value, f.dec)} ${f.unit || ''} · ${num(100 * p.d.value / tot, 1)} % du total · cumul ${num(100 * p.y, 0)} %`, state: p.d.state, src: p.d.src, detail: p.d.note }), T);
    const topShare = d3.sum(D.slice(n - k), d => d.value) / tot, xk = (n - k) / n, yk = 1 - topShare;
    F.g.append('line').attr('x1', X(xk)).attr('x2', X(xk)).attr('y1', Y(yk)).attr('y2', Y(1)).attr('stroke', T.neg).attr('stroke-width', 2.4); F.g.append('line').attr('x1', X(xk)).attr('x2', X(1)).attr('y1', Y(1)).attr('y2', Y(1)).attr('stroke', T.neg).attr('stroke-width', 2.4).attr('stroke-opacity', .0);
    const tl = `Les ${k} plus gros = ${num(100 * topShare, 0)} % du total`; if (comp) txt(F.g, 8, 42, tl, { f: font(700, 11), c: T.neg, halo: T.bg }); else txt(F.g, X(xk) - 8, Y(.5 + (1 - yk) / 2), tl, { a: 'end', f: font(700, 12), c: T.neg, halo: T.bg });
    txt(F.g, 8, 24, 'Gini = ' + num(gini, 2).replace('.', ','), { f: font(800, 15, MONO), c: T.ink });
    /* barre de parts */
    const G = F.g.append('g'), desc = D.slice().sort((a, b) => b.value - a.value);
    if (!comp) { const bx = S - 46 + 18, bw = 34; let y = 0; desc.forEach((d, i) => { const h = ps * d.value / tot, r = G.append('rect').datum(d).attr('x', bx).attr('y', y).attr('width', bw).attr('height', Math.max(1, h - 1.5)).attr('rx', 2); paint(r, T, id, dd => dd.state, () => i < k ? T.neg : T.c1); r.attr('fill-opacity', i < k ? .85 : .45 + .4 * (1 - i / n)); interactive(r, dd => ({ title: dd.label, value: num(100 * dd.value / tot, 1) + ' % du total', state: dd.state, src: dd.src }), T); if (h > 14) txt(G, bx + bw + 8, y + h / 2 + 4, `${d.label} · ${num(100 * d.value / tot, 0)} %`, { f: font(600, 11), c: T.ink }); y += h; }); txt(G, bx, -4, 'parts du total', { f: font(600, 10.5), c: T.mid }); }
    else { const by = ps + 64; let x = 0; desc.forEach((d, i) => { const w = (ps) * d.value / tot, r = G.append('rect').datum(d).attr('x', x).attr('y', by).attr('width', Math.max(1, w - 1.5)).attr('height', 28).attr('rx', 2); paint(r, T, id, dd => dd.state, () => i < k ? T.neg : T.c1); r.attr('fill-opacity', i < k ? .85 : .45); interactive(r, dd => ({ title: dd.label, value: num(100 * dd.value / tot, 1) + ' % du total', state: dd.state, src: dd.src }), T); if (w > 40) txt(G, x + w / 2, by + 18, num(100 * d.value / tot, 0) + ' %', { a: 'middle', f: font(700, 11, MONO), c: '#fff' }); x += w; }); txt(G, 0, by - 6, 'parts du total (du plus gros au plus petit)', { f: font(600, 10.5), c: T.mid }); }
    legend(el, statesOf(D));
  }
  REG('lorenz', lorenz, tableOf(['Entité', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== 2. MATURITYWALL — le mur d'échéances ============================== */
  function maturitywall(el, f, T) {
    const id = uid(), comp = isNarrow(el), Ys = f.years, S = f.series, F = frame(el, id, comp ? 340 : 400, { l: comp ? 42 : 54, t: 26, r: 14, b: 40 }); addPatterns(F.defs, id, T);
    const stackTot = Ys.map((y, i) => d3.sum(S, s => s.values[i])), cov = f.coverage, X = d3.scaleBand(Ys.map(String), [0, F.iw]).padding(.28), mx = Math.max(d3.max(stackTot), cov ? d3.max(cov.values) : 0) * 1.12, Y = d3.scaleLinear([0, mx], [F.ih, 0]).nice();
    yAxisLeft(F, Y, T); Ys.forEach(y => txt(F.g, X(String(y)) + X.bandwidth() / 2, F.ih + 18, y, { a: 'middle', f: font(600, 11.5), c: T.mid }));
    txt(F.g, 0, -10, f.unit || '', { f: font(600, 11), c: T.mid });
    Ys.forEach((yr, i) => { let acc = 0; S.forEach((s, k) => { const v = s.values[i], r = F.g.append('rect').datum({ s, v, yr }).attr('x', X(String(yr))).attr('width', X.bandwidth()).attr('y', Y(acc + v)).attr('height', Math.max(0, Y(acc) - Y(acc + v))).attr('rx', 1.5); paint(r, T, id, d => d.s.state, () => col(T, s.color, k)); interactive(r, d => ({ title: d.s.label + ' · ' + d.yr, value: num(d.v, f.dec) + ' ' + (f.unit || ''), state: d.s.state, src: d.s.src, detail: d.s.note }), T); acc += v; });
      txt(F.g, X(String(yr)) + X.bandwidth() / 2, Y(stackTot[i]) - 6, num(stackTot[i], f.dec != null ? f.dec : 0), { a: 'middle', f: font(700, 11.5, MONO), c: T.ink }); });
    if (cov) {
      const xs = i => X(String(Ys[i])) + X.bandwidth() / 2, pts = Ys.map((y, i) => [xs(i), Y(cov.values[i])]);
      Ys.forEach((yr, i) => { if (stackTot[i] > cov.values[i]) { const h = Y(cov.values[i]) - Y(stackTot[i]); F.g.append('rect').attr('x', X(String(yr)) - 2).attr('width', X.bandwidth() + 4).attr('y', Y(stackTot[i])).attr('height', h).attr('fill', `url(#${id}-gap)`).attr('stroke', T.neg).attr('stroke-width', 1.6).attr('stroke-dasharray', '4 3').attr('fill-opacity', .9).style('pointer-events', 'none'); txt(F.g, X(String(yr)) + X.bandwidth() / 2, Y(stackTot[i]) - 20, `manque ${num(stackTot[i] - cov.values[i], f.dec != null ? f.dec : 0)}`, { a: 'middle', f: font(700, 10.5), c: T.neg, halo: T.bg }); } });
      F.g.append('path').attr('d', d3.line().curve(d3.curveMonotoneX)(pts)).attr('fill', 'none').attr('stroke', T.ink).attr('stroke-width', 2.6);
      const dots = F.g.selectAll('circle.cv').data(Ys).join('circle').attr('class', 'cv').attr('cx', (y, i) => xs(i)).attr('cy', (y, i) => Y(cov.values[i])).attr('r', 5); paint(dots, T, id, () => cov.state, () => T.ink); interactive(dots, (y, i) => ({ title: cov.label + ' · ' + y, value: num(cov.values[Ys.indexOf(y)], f.dec) + ' ' + (f.unit || ''), state: cov.state, src: cov.src, detail: cov.note }), T);
      txt(F.g, F.iw, Y(cov.values[Ys.length - 1]) - 12, cov.label, { a: 'end', f: font(700, 11), c: T.ink, halo: T.bg });
    }
    legend(el, [...statesOf(S), ...(cov ? [cov.state || 'actual'] : [])]); const ul = el.parentNode.querySelector('.fig-legend'); S.forEach((s, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" rx="2" fill="${col(T, s.color, k)}"/></svg>${s.label}`; ul.appendChild(li); }); const li = document.createElement('li'); li.textContent = 'Zone hachurée rouge : échéance au-dessus de la capacité de paiement'; ul.appendChild(li);
  }
  REG('maturitywall', maturitywall, (f, r) => r(['Année', ...f.series.map(s => s.label), f.coverage ? f.coverage.label : '', 'Source'], f.years.map((y, i) => [y, ...f.series.map(s => num(s.values[i], 2)), f.coverage ? num(f.coverage.values[i], 2) : '', f.series[0].src])));

  /* ============================== 3. CONTAGION — que tombe-t-il si X tombe ? (interactif) ============================== */
  function contagion(el, f, T) {
    const id = uid(), comp = isNarrow(el), N = f.nodes.map(n => ({ ...n })), by = Object.fromEntries(N.map(n => [n.id, n])), L = f.links.map(l => ({ ...l, S: by[l.s], T: by[l.t] })), W = el.clientWidth || 640, S0 = Math.min(W, comp ? 360 : 520), R = S0 / 2 - (comp ? 52 : 80);
    el.innerHTML = ''; const bar = mkNode('div', 'display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin:0 0 .5rem', ''); const msg = mkNode('p', 'font:600 .9rem/1.45 var(--vra-sans);margin:.3rem 0 0;min-height:2.6em'); msg.setAttribute('aria-live', 'polite');
    const rst = mkNode('button', '', 'Réinitialiser'); rst.type = 'button'; rst.className = 'ex-btn ghost'; const hint = mkNode('span', 'font:500 .82rem var(--vra-sans);color:var(--vra-mid)', 'Cliquez (ou Entrée) sur une entreprise pour la faire tomber ; recliquez pour la rétablir.'); bar.append(rst, hint); el.appendChild(bar);
    const holder = mkNode('div', ''); el.appendChild(holder); el.appendChild(msg);
    const F = frame(holder, id, S0 + 14, { l: 0, r: 0, t: 6, b: 6 }); addPatterns(F.defs, id, T); const cx = F.iw / 2, cy = S0 / 2 + 4;
    N.forEach((n, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N.length; n.x = cx + R * Math.cos(a); n.y = cy + R * Math.sin(a); n.a = a; });
    F.defs.append('marker').attr('id', id + 'ar').attr('viewBox', '0 0 8 8').attr('refX', 7).attr('refY', 4).attr('markerUnits', 'userSpaceOnUse').attr('markerWidth', 9).attr('markerHeight', 9).attr('orient', 'auto').append('path').attr('d', 'M0,0L8,4L0,8Z').attr('fill', T.lo);
    const NR = comp ? 22 : 28, wv = d3.scaleSqrt([0, d3.max(L, l => l.v) || 1], [1.2, 7]);
    const lp = F.g.append('g').selectAll('path').data(L).join('path').attr('fill', 'none').attr('stroke-linecap', 'round').attr('d', l => { const dx = l.T.x - l.S.x, dy = l.T.y - l.S.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, x0 = l.S.x + ux * NR, y0 = l.S.y + uy * NR, x1 = l.T.x - ux * (NR + 9), y1 = l.T.y - uy * (NR + 9), mx = (x0 + x1) / 2 * .5 + cx * .5, my = (y0 + y1) / 2 * .5 + cy * .5; return `M${x0},${y0}Q${mx},${my} ${x1},${y1}`; }).attr('marker-end', `url(#${id}ar)`);
    interactive(lp, l => ({ title: l.S.label + ' est exposé à ' + l.T.label, value: num(l.v, f.dec) + ' ' + (f.unit || ''), state: l.state, src: l.src, detail: l.note }), T);
    const ng = F.g.append('g').selectAll('g').data(N).join('g').attr('transform', n => `translate(${n.x},${n.y})`).style('cursor', 'pointer').attr('tabindex', 0).attr('role', 'button');
    const circ = ng.append('circle').attr('r', NR).attr('stroke-width', 2.4), buf = ng.append('path').attr('fill', 'none').attr('stroke-width', 4).attr('stroke-linecap', 'round'), mark = ng.append('text').attr('text-anchor', 'middle').attr('y', 5).style('font', font(800, 15)).attr('fill', '#fff').style('pointer-events', 'none');
    ng.each(function (n) { const lines = wrapLines(n.label, 80, comp ? 10 : 11, 700).slice(0, 2), lx = Math.cos(n.a) * (NR + 8), ly = Math.sin(n.a) * (NR + 8); const t = d3.select(this).append('text').attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 3).attr('paint-order', 'stroke').attr('text-anchor', Math.cos(n.a) > .25 ? 'start' : Math.cos(n.a) < -.25 ? 'end' : 'middle').style('font', font(700, comp ? 10 : 11)).style('pointer-events', 'none'); lines.forEach((ln, k) => t.append('tspan').attr('x', lx).attr('y', ly + (Math.sin(n.a) > .3 ? 14 : Math.sin(n.a) < -.3 ? -6 - (lines.length - 1) * 12 : 4) + k * 12).text(ln)); });
    const failed = new Set(f.start || []);
    function simulate() { const round = {}; [...failed].forEach(i => round[i] = 0); let r = 0, changed = true; const loss = {}; while (changed && r < 20) { changed = false; r++; N.forEach(n => { if (round[n.id] != null) return; const ls = d3.sum(L.filter(l => l.S === n && round[l.t] != null && round[l.t] < r), l => l.v); loss[n.id] = ls; if (ls > 0 && ls >= (n.buffer != null ? n.buffer : Infinity)) { round[n.id] = r; changed = true; } }); } N.forEach(n => { if (loss[n.id] == null) loss[n.id] = d3.sum(L.filter(l => l.S === n && round[l.t] != null), l => l.v); }); return { round, loss }; }
    function draw() {
      const { round, loss } = simulate(), fails = N.filter(n => round[n.id] != null), exp = d3.sum(L.filter(l => round[l.t] != null), l => l.v);
      circ.attr('fill', n => round[n.id] != null ? T.neg : T.bg).attr('stroke', n => round[n.id] != null ? T.neg : (loss[n.id] > 0 ? T.c4 : T.ink)); mark.text(n => round[n.id] != null ? (round[n.id] === 0 ? '✕' : round[n.id]) : '');
      buf.attr('d', n => { if (round[n.id] != null || !(n.buffer > 0) || !(loss[n.id] > 0)) return ''; const a0 = -Math.PI / 2, a1 = a0 + 2 * Math.PI * Math.min(1, loss[n.id] / n.buffer), r = NR + 5; return d3.arc().innerRadius(r).outerRadius(r).startAngle(a0 + Math.PI / 2).endAngle(a1 + Math.PI / 2)(); }).attr('stroke', T.c4);
      lp.attr('stroke', l => round[l.T.id] != null ? T.neg : T.lo).attr('stroke-width', l => wv(l.v)).attr('stroke-opacity', l => round[l.T.id] != null ? .9 : .45).attr('stroke-dasharray', l => stateStyle(l.state || 'actual', id, T).dash);
      ng.attr('aria-label', n => `${n.label}${round[n.id] != null ? ', en défaut' : ''}`).attr('aria-pressed', n => String(round[n.id] === 0));
      const direct = failed.size, casc = fails.length - direct;
      msg.innerHTML = direct === 0 ? 'Aucune entreprise ne tombe. Choisissez-en une.' : `<span style="color:var(--vra-neg)">${direct} en défaut au départ → ${casc} de plus par contagion (${fails.length} sur ${N.length})</span> · exposition cumulée aux entités en défaut : <b>${num(exp, f.dec)} ${escH(f.unit || '')}</b>.${casc === 0 ? ' La chute reste isolée : chacun a de quoi absorber la perte.' : ''}`;
    }
    ng.on('click', (e, n) => { failed.has(n.id) ? failed.delete(n.id) : failed.add(n.id); draw(); }).on('keydown', (e, n) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); failed.has(n.id) ? failed.delete(n.id) : failed.add(n.id); draw(); } });
    ng.on('pointerenter.t focus.t', function (e, n) { showTipFor(this, n); }).on("pointerleave.t blur.t", C.helpers.hideTip);
    function showTipFor(node, n) { const b = node.getBoundingClientRect(); C.helpers.showTip(`<strong>${C.helpers.esc(n.label)}</strong><span>capacité d'absorption : ${num(n.buffer, f.dec)} ${C.helpers.esc(f.unit || '')}</span><small>${n.src || ''}</small>`, b.left + b.width / 2, b.top); }
    rst.onclick = () => { failed.clear(); (f.start || []).forEach(i => failed.add(i)); draw(); };
    draw(); const lg = mkNode('p', 'font:500 .78rem/1.5 var(--vra-sans);color:var(--vra-mid);margin:.2rem 0 0', 'Une flèche A → B signifie « A est exposé à B » : si B tombe, A perd le montant indiqué. Un anneau orange mesure la perte subie rapportée à la capacité d’absorption ; il devient rouge (✕ = défaut initial, 1, 2… = vague de contagion) quand elle est dépassée. Modèle simplifié et illustratif.'); el.appendChild(lg);
  }
  REG('contagion', contagion, (f, r) => r(['Exposé', 'À', 'Montant', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, num(l.v, 2), l.src || ''])));

  /* ============================== 4. SOURCESPREAD — où les sources divergent ============================== */
  function sourcespread(el, f, T) {
    const id = uid(), comp = isNarrow(el), I = f.items, rowH = comp ? 96 : 84, labelW = comp ? 100 : 190, F = frame(el, id, I.length * rowH + 14, { l: labelW, r: comp ? 56 : 86, t: 10, b: 4 }); addPatterns(F.defs, id, T);
    I.forEach((it, i) => {
      const vals = it.sources.map(s => s.value), lo = d3.min(vals), hi = d3.max(vals), pad = (hi - lo) * .22 || Math.abs(hi) * .02 || 1, X = d3.scaleLinear([lo - pad, hi + pad], [0, F.iw]), cy = i * rowH + rowH * .56, med = d3.median(vals), spread = med ? (hi - lo) / Math.abs(med) : 0;
      rowLabel(F.g, it.label, cy, labelW, T, 12.5, 700); F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', cy).attr('y2', cy).attr('stroke', T.line).attr('stroke-width', 1.5);
      F.g.append('rect').attr('x', X(lo)).attr('width', Math.max(2, X(hi) - X(lo))).attr('y', cy - 9).attr('height', 18).attr('rx', 9).attr('fill', T.c3).attr('fill-opacity', .18);
      F.g.append('line').attr('x1', X(med)).attr('x2', X(med)).attr('y1', cy - 13).attr('y2', cy + 13).attr('stroke', T.ink).attr('stroke-width', 2).attr('stroke-dasharray', '2 2');
      const sorted = it.sources.map((s, k) => ({ ...s, k })).sort((a, b) => a.value - b.value), lastX = { up: -1e9, dn: -1e9 };
      sorted.forEach((s, j) => { const x = X(s.value), up = j % 2 === 0, w = measure(s.name, comp ? 10.5 : 11.5, 600) + 6, side = up ? 'up' : 'dn'; let tx = Math.max(w / 2, Math.min(F.iw - w / 2, x)); if (tx - w / 2 < lastX[side] + 4) tx = lastX[side] + 4 + w / 2; lastX[side] = tx + w / 2;
        const dot = F.g.append('circle').datum(s).attr('cx', x).attr('cy', cy).attr('r', 7); paint(dot, T, id, d => d.state, () => it.pick === s.k ? T.ink : T.c1); if (it.pick === s.k) dot.attr('stroke', T.ink).attr('stroke-width', 2.4);
        interactive(dot, d => ({ title: it.label + ' · ' + d.name, value: num(d.value, f.dec) + ' ' + (it.unit || f.unit || ''), state: d.state, src: d.src, detail: d.note || (it.pick === d.k ? 'Valeur retenue dans le dossier' : '') }), T);
        txt(F.g, tx, cy + (up ? -16 : 25), s.name, { a: 'middle', f: font(600, comp ? 10.5 : 11.5), c: T.ink, halo: T.bg }); txt(F.g, tx, cy + (up ? -30 : 38), num(s.value, f.dec), { a: 'middle', f: font(700, 11, MONO), c: T.mid, halo: T.bg }); });
      txt(F.g, F.iw + 10, cy - 2, 'écart', { f: font(500, 10), c: T.mid }); txt(F.g, F.iw + 10, cy + 14, num(100 * spread, spread < .1 ? 1 : 0).replace('.', ',') + ' %', { f: font(800, 14, MONO), c: spread > .25 ? T.neg : T.ink });
    });
    legend(el, I.flatMap(it => it.sources.map(s => s.state || 'actual'))); const ul = el.parentNode.querySelector('.fig-legend'); const li = document.createElement('li'); li.textContent = 'Chaque ligne a sa propre échelle · trait pointillé = médiane · cercle cerclé de noir = valeur retenue'; ul.appendChild(li);
  }
  REG('sourcespread', sourcespread, (f, r) => r(['Grandeur', 'Source', 'Valeur', 'Clé'], f.items.flatMap(it => it.sources.map(s => [it.label, s.name, num(s.value, 2), s.src]))));

  /* ============================== 5. HEMICYCLE — qui détient quoi (parts, droits de vote) ============================== */
  function seatsLayout(N, Ro, Ri) {
    const rows = Math.max(2, Math.round(Math.sqrt(N) / 1.55)), radii = d3.range(rows).map(k => Ri + (Ro - Ri) * (rows === 1 ? 1 : k / (rows - 1))), arcLen = radii.map(r => r * Math.PI), totL = d3.sum(arcLen), per = arcLen.map(l => N * l / totL), cnt = per.map(Math.floor); let rem = N - d3.sum(cnt); per.map((p, i) => [p - Math.floor(p), i]).sort((a, b) => b[0] - a[0]).slice(0, rem).forEach(([, i]) => cnt[i]++);
    const seats = []; radii.forEach((r, k) => { const m = cnt[k]; for (let j = 0; j < m; j++) { const a = Math.PI - (m === 1 ? Math.PI / 2 : j * Math.PI / (m - 1)); seats.push({ a, r, x: r * Math.cos(a), y: -r * Math.sin(a) }); } });
    seats.sort((p, q) => (q.a - p.a) || (p.r - q.r)); return { seats, spacing: Math.min((Ro - Ri) / Math.max(1, rows - 1), Math.PI * Ro / Math.max(...cnt)) };
  }
  function hemicycle(el, f, T) {
    const id = uid(), comp = isNarrow(el), P = f.panels || [{ title: f.title, data: f.data, center: f.center }], W = el.clientWidth || 640, cols = comp ? 1 : Math.min(2, P.length), pw = (W - 8) / cols - 8, Ro = Math.min(pw / 2 - 10, 190), Ri = Ro * .38, ph = Ro + 62 + P.reduce((m, q) => Math.max(m, Math.min(5, q.data.length)), 0) * 15, rowsN = Math.ceil(P.length / cols), N = f.seats || 100;
    const F = frame(el, id, rowsN * ph + (f.footnote ? 18 : 6), { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T); const { seats, spacing } = seatsLayout(N, Ro, Ri), r = spacing * .4;
    P.forEach((p, pi) => { const g = F.g.append('g').attr('transform', `translate(${(pi % cols) * (pw + 8) + pw / 2},${Math.floor(pi / cols) * ph + Ro + 30})`), tot = d3.sum(p.data, d => d.value), raw = p.data.map(d => d.value / tot * N), cnt = raw.map(Math.floor); let rem = N - d3.sum(cnt); raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).slice(0, rem).forEach(([, i]) => cnt[i]++);
      txt(g, 0, -Ro - 14, p.title || '', { a: 'middle', f: font(700, 12.5), c: T.ink }); let k = 0; p.data.forEach((d, di) => { const grp = g.append('g').datum(d); for (let j = 0; j < cnt[di]; j++, k++) { const s = seats[k], c = grp.append('circle').attr('cx', s.x).attr('cy', s.y).attr('r', r); paint(c, T, id, () => d.state, () => col(T, d.color, di)); } interactive(grp, dd => ({ title: dd.label, value: `${num(dd.value, f.dec)} ${f.unit || ''} · ${num(100 * dd.value / tot, 1)} %`, state: dd.state, src: dd.src, detail: dd.note }), T); });
      txt(g, 0, -4, p.center || '', { a: 'middle', f: font(800, comp ? 18 : 22, MONO), c: T.ink }); txt(g, 0, 15, p.centerLabel || '', { a: 'middle', f: font(500, 10.5), c: T.mid });
      p.data.forEach((d, di) => { const y = 42 + di * 15; if (di < 5) { g.append('circle').attr('cx', -Ro * .55).attr('cy', y - 4).attr('r', 4.5).attr('fill', col(T, d.color, di)); txt(g, -Ro * .55 + 10, y, `${d.label} · ${num(100 * d.value / tot, 0)} %`, { f: font(600, 11), c: T.ink }); } }); });
    if (f.footnote) txt(F.g, 4, rowsN * ph + 6, f.footnote, { f: font(500, 11), c: T.mid });
    legend(el, P.flatMap(p => statesOf(p.data)));
  }
  REG('hemicycle', hemicycle, (f, r) => r(['Panneau', 'Titulaire', 'Valeur', 'Source'], (f.panels || [{ title: f.title, data: f.data }]).flatMap(p => p.data.map(d => [p.title || '', d.label, num(d.value, 2), d.src]))));

  /* ============================== 6. MAGNITUDES — règle logarithmique des ordres de grandeur ============================== */
  function magnitudes(el, f, T) {
    const id = uid(), comp = isNarrow(el), I = f.items.slice().sort((a, b) => a.value - b.value), W = el.clientWidth || 640, e0 = f.min != null ? f.min : Math.floor(Math.log10(d3.min(I, d => d.value))), e1 = f.max != null ? f.max : Math.ceil(Math.log10(d3.max(I, d => d.value))), fs = comp ? 10.5 : 11.5;
    const X = d3.scaleLog([10 ** e0, 10 ** e1], [0, 100]); const F0 = frame(el, id, 10, { l: 16, r: 16 }); const iw = F0.iw; X.range([0, iw]);
    const tiers = { up: [], dn: [] }; I.forEach((d, i) => { d.x = X(d.value); const w = measure(d.label, fs, 700) + 10, side = i % 2 ? 'dn' : 'up', left = Math.max(0, Math.min(iw - w, d.x - w / 2)), T2 = tiers[side]; let t = 0; while (T2[t] && T2[t].some(r => !(left + w + 4 < r[0] || left - 4 > r[1]))) t++; (T2[t] = T2[t] || []).push([left, left + w]); d.tier = t; d.side = side; d.left = left; d.w = w; });
    const th = comp ? 30 : 32, nUp = Math.max(1, tiers.up.length), nDn = tiers.dn.length, cmp = f.compare || [], arcH = cmp.length ? 48 : 0, ay = arcH + 22 + nUp * th + 8, H = ay + 30 + nDn * th + 40;
    const F = frame(el, id, H, { l: 16, r: 16, t: 0, b: 0 }); addPatterns(F.defs, id, T); const g = F.g;
    g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', ay).attr('y2', ay).attr('stroke', T.ink).attr('stroke-width', 2);
    d3.range(e0, e1 + 1).forEach(e => { const x = X(10 ** e); g.append('line').attr('x1', x).attr('x2', x).attr('y1', ay - 8).attr('y2', ay + 8).attr('stroke', T.ink).attr('stroke-width', 1.6); txt(g, x, ay + 24, f.tickLabel ? f.tickLabel(e) : '10' + String(e).replace(/-/g, '⁻').replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]), { a: 'middle', f: font(600, 11, MONO), c: T.mid }); if (e < e1) for (let m = 2; m < 10; m++) { const xm = X(m * 10 ** e); g.append('line').attr('x1', xm).attr('x2', xm).attr('y1', ay - 3.5).attr('y2', ay + 3.5).attr('stroke', T.lo).attr('stroke-width', 1); } });
    txt(g, 0, H - 4, `échelle logarithmique (${f.unit || ''}) · chaque graduation = ×10`, { a: 'start', f: font(500, 10.5), c: T.mid });
    I.forEach((d, i) => { const up = d.side === 'up', y = up ? ay - 22 - d.tier * th : ay + 40 + (d.tier + 1) * th - 4; g.append('line').attr('x1', d.x).attr('x2', d.x).attr('y1', ay).attr('y2', up ? y + 6 : y - 14).attr('stroke', col(T, d.color, 0)).attr('stroke-opacity', .6);
      const dot = g.append('circle').datum(d).attr('cx', d.x).attr('cy', ay).attr('r', 7); paint(dot, T, id, dd => dd.state, () => col(T, d.color, d.group ? [...new Set(I.map(q => q.group))].indexOf(d.group) : 0)); interactive(dot, dd => ({ title: dd.label, value: num(dd.value, 4) + ' ' + (f.unit || ''), state: dd.state, src: dd.src, detail: dd.note }), T);
      txt(g, d.left + d.w / 2, y, d.label, { a: 'middle', f: font(700, fs), c: T.ink, halo: T.bg }); txt(g, d.left + d.w / 2, y + (up ? -13 : 13), num(d.value, d.value < 10 ? 2 : 0), { a: 'middle', f: font(600, 10.5, MONO), c: T.mid, halo: T.bg }); });
    cmp.forEach((c, k) => { const a = I.find(d => d.label === c.from), b = I.find(d => d.label === c.to); if (!a || !b) return; const x0 = a.x, x1 = b.x, ratio = b.value / a.value, top = ay - 22 - nUp * th - 6 - k * 0; const path = `M${x0},${ay - 16}C${x0},${top - arcH} ${x1},${top - arcH} ${x1},${ay - 16}`; g.append('path').attr('d', path).attr('fill', 'none').attr('stroke', T.neg).attr('stroke-width', 2).attr('stroke-dasharray', '5 3'); txt(g, (x0 + x1) / 2, top - arcH * .62 + 6, c.label || ('× ' + num(ratio, ratio < 10 ? 1 : 0).replace('.', ',')), { a: 'middle', f: font(800, 14, MONO), c: T.neg, halo: T.bg }); });
    legend(el, statesOf(I));
  }
  REG('magnitudes', magnitudes, tableOf(['Élément', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 4), SL(d.state), d.src], 'items'));

  /* ============================== 7. SPARKTABLE — tableau à sparklines (HTML) ============================== */
  function sparktable(el, f, T) {
    el.innerHTML = ''; const H = f.head || {}, rows = f.rows, wrap = mkNode('div', 'overflow-x:auto'); wrap.className = 'tbl-wrap';
    const tb = mkNode('table', 'border-collapse:collapse;width:100%;font-size:.9rem'); tb.innerHTML = `<thead><tr><th scope="col" style="text-align:left">${escH(H.label || 'Élément')}</th><th scope="col">${escH(H.series || 'Évolution')}</th><th scope="col" style="text-align:right">${escH(H.value || 'Valeur')}</th><th scope="col" style="text-align:right">${escH(H.delta || 'Δ')}</th>${f.showShare ? `<th scope="col">${escH(H.share || 'Part')}</th>` : ''}<th scope="col">${escH(H.src || 'Source')}</th></tr></thead>`;
    const body = mkNode('tbody'); const mxShare = d3.max(rows, r => r.share) || 100;
    rows.forEach((r, i) => { const tr = mkNode('tr', 'border-top:1px solid var(--vra-line)'); tr.tabIndex = 0; const good = (f.goodWhen || 'up') === 'up' ? r.delta >= 0 : r.delta <= 0, dc = r.delta == null ? 'var(--vra-mid)' : good ? 'var(--vra-c2)' : 'var(--vra-neg)';
      tr.innerHTML = `<th scope="row" style="text-align:left;padding:.55rem .6rem .55rem 0;font-weight:600">${escH(r.label)}${r.note ? `<br><small style="font-weight:400;color:var(--vra-mid)">${escH(r.note)}</small>` : ''}</th><td data-spark style="padding:.3rem .6rem;min-width:130px"></td><td style="text-align:right;font:700 .95rem var(--vra-mono)">${escH(r.valueLabel != null ? r.valueLabel : num(r.value, f.dec))} <small style="font-weight:500;color:var(--vra-mid)">${escH(r.unit || f.unit || '')}</small></td><td style="text-align:right;font:700 .88rem var(--vra-mono);color:${dc}">${r.delta == null ? '' : (r.delta > 0 ? '▲ +' : r.delta < 0 ? '▼ ' : '■ ') + num(r.delta, f.deltaDec != null ? f.deltaDec : 1).replace('.', ',') + (f.deltaUnit || ' %')}</td>${f.showShare ? `<td style="min-width:90px"><div style="height:10px;border-radius:5px;background:color-mix(in srgb,var(--vra-line) 70%,transparent)"><div style="height:10px;border-radius:5px;width:${Math.round(100 * (r.share || 0) / mxShare)}%;background:var(--vra-c1)"></div></div><small style="font:600 .72rem var(--vra-mono);color:var(--vra-mid)">${num(r.share, 0)} %</small></td>` : ''}<td style="font-size:.78rem">${srcPill(r.src)} ${chipHtml(r.state)}</td>`; body.appendChild(tr);
      const cell = tr.querySelector('[data-spark]'), W2 = 130, H2 = 30, s = r.series || [], X = d3.scaleLinear([0, Math.max(1, s.length - 1)], [3, W2 - 6]), Y = d3.scaleLinear(d3.extent(s), [H2 - 4, 4]); const svg = d3.select(cell).append('svg').attr('width', W2).attr('height', H2).attr('viewBox', `0 0 ${W2} ${H2}`).attr('role', 'img').attr('aria-label', `${r.label} : de ${num(s[0], 1)} à ${num(s[s.length - 1], 1)}`);
      svg.append('path').datum(s).attr('d', d3.area().x((v, k) => X(k)).y0(H2 - 2).y1(v => Y(v)).curve(d3.curveMonotoneX)).attr('fill', T.c1).attr('fill-opacity', .14); svg.append('path').datum(s).attr('d', d3.line().x((v, k) => X(k)).y(v => Y(v)).curve(d3.curveMonotoneX)).attr('fill', 'none').attr('stroke', T.c1).attr('stroke-width', 1.8).attr('stroke-dasharray', stateStyle(r.state || 'actual', id0(), T).dash);
      const mi = s.indexOf(d3.min(s)), ma = s.indexOf(d3.max(s)); [[mi, T.neg], [ma, T.c2]].forEach(([k, c]) => svg.append('circle').attr('cx', X(k)).attr('cy', Y(s[k])).attr('r', 2.4).attr('fill', c)); svg.append('circle').attr('cx', X(s.length - 1)).attr('cy', Y(s[s.length - 1])).attr('r', 3.4).attr('fill', T.ink); });
    tb.appendChild(body); wrap.appendChild(tb); el.appendChild(wrap); const cap = mkNode('p', 'font:500 .75rem/1.4 var(--vra-sans);color:var(--vra-mid);margin:.4rem 0 0', 'Sparkline : tendance sur la période · point noir = dernier relevé, vert = plus haut, rouge = plus bas.'); el.appendChild(cap);
  }
  const id0 = () => 'st';
  REG('sparktable', sparktable, (f, r) => r(['Élément', 'Valeur', 'Variation', 'Source'], f.rows.map(x => [x.label, x.valueLabel != null ? x.valueLabel : num(x.value, 2), x.delta == null ? '' : num(x.delta, 1), x.src])));

  /* ============================== 8. LEDGER — le ticket de caisse (HTML) ============================== */
  function ledger(el, f, T) {
    el.innerHTML = ''; const cur = f.currency || f.unit || '', fm = v => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('fr-FR', { minimumFractionDigits: f.dec != null ? f.dec : 2, maximumFractionDigits: f.dec != null ? f.dec : 2 }) + (cur ? ' ' + cur : '');
    const box = mkNode('div', `max-width:${comp0(el) ? '100%' : '460px'};margin:0 auto;padding:1.1rem 1.2rem 1.4rem;background:color-mix(in srgb,var(--vra-panel) 88%,var(--vra-bg));border:1px solid var(--vra-line);border-radius:3px 3px 0 0;font:500 .86rem/1.5 var(--vra-mono);color:var(--vra-ink);position:relative;box-shadow:0 1px 0 var(--vra-line)`);
    let h = `<div style="text-align:center;font-weight:800;letter-spacing:.14em;text-transform:uppercase">${escH(f.title || 'Ticket')}</div>${f.subtitle ? `<div style="text-align:center;color:var(--vra-mid);font-size:.78rem">${escH(f.subtitle)}</div>` : ''}<div style="border-top:2px dashed var(--vra-lo);margin:.7rem 0 .5rem"></div>`;
    f.lines.forEach(l => { const k = l.kind || 'item', st = l.state || 'actual', pre = st === 'forecast' ? '~ ' : st === 'claim' ? '? ' : '', sty = st === 'forecast' ? 'font-style:italic;' : st === 'claim' ? 'text-decoration:underline dotted;' : '';
      if (k === 'note') h += `<div style="color:var(--vra-mid);font-size:.76rem;margin:.25rem 0">${escH(l.label)} ${srcPill(l.src)}</div>`;
      else if (k === 'rule') h += '<div style="border-top:1px solid var(--vra-ink);margin:.35rem 0"></div>';
      else h += `<div style="display:flex;align-items:baseline;gap:.4rem;${k === 'total' ? 'font-size:1.12rem;font-weight:800;margin-top:.2rem;' : k === 'sub' ? 'font-weight:700;' : ''}${sty}" title="${escH(SL(st))}"><span>${escH(l.label)}</span><span style="flex:1;border-bottom:1px dotted var(--vra-lo);transform:translateY(-3px)"></span><span>${pre}${l.text != null ? escH(l.text) : fm(l.amount)}</span> ${srcPill(l.src)}</div>${k === 'sub' || k === 'total' ? `<div style="border-top:${k === 'total' ? '3px double' : '1px solid'} var(--vra-ink);margin:.2rem 0 .45rem"></div>` : ''}`; });
    h += `<div style="border-top:2px dashed var(--vra-lo);margin:.8rem 0 .4rem"></div><div style="text-align:center;color:var(--vra-mid);font-size:.74rem">${escH(f.footer || '~ prévision · ? affirmation non vérifiée')}</div>`;
    box.innerHTML = h; const tear = mkNode('div', 'height:9px;max-width:' + (comp0(el) ? '100%' : '460px') + ';margin:0 auto;background:linear-gradient(-45deg,transparent 6px,color-mix(in srgb,var(--vra-panel) 88%,var(--vra-bg)) 0),linear-gradient(45deg,transparent 6px,color-mix(in srgb,var(--vra-panel) 88%,var(--vra-bg)) 0);background-size:12px 9px;background-repeat:repeat-x;background-position:0 0,6px 0'); el.append(box, tear);
  }
  const comp0 = el => (el.clientWidth || 640) < 520;
  REG('ledger', ledger, (f, r) => r(['Ligne', 'Montant', 'État', 'Source'], f.lines.filter(l => l.amount != null || l.text).map(l => [l.label, l.text != null ? l.text : num(l.amount, 2), SL(l.state), l.src || ''])));

  /* ============================== 9. PROBTREE — arbre de probabilités et espérance ============================== */
  function probtree(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, root = d3.hierarchy(f.root, d => d.children), leaves = root.leaves(), depth = root.height, rowH = comp ? 44 : 46, H = leaves.length * rowH + 74, F = frame(el, id, H, { l: 8, r: 8, t: 8, b: 56 }); addPatterns(F.defs, id, T);
    root.each(n => { n.pp = n.parent ? n.parent.pp * (n.data.p != null ? n.data.p : 1) : 1; }); const valueW = comp ? 96 : 150, treeW = F.iw - valueW - 8, leafW = comp ? 96 : 170, colW = (treeW - leafW - 30) / Math.max(1, depth); leaves.forEach((l, i) => { l.y = 24 + i * rowH; }); root.eachAfter(n => { if (n.children) n.y = d3.mean(n.children, c => c.y); }); root.each(n => { n.x = 30 + n.depth * colW; });
    const vpos = d3.max(leaves, l => Math.max(0, l.data.value || 0)) || 0, vneg = d3.max(leaves, l => Math.max(0, -(l.data.value || 0))) || 0, kk = (valueW - 40) / ((vpos + vneg) || 1), bw = v => v * kk, zx = F.iw - valueW + 10 + vneg * kk, ev = d3.sum(leaves, l => l.pp * (l.data.value || 0)), lw = p => 1.8 + p * 16;
    root.links().forEach(l => { const st = stateStyle(l.target.data.state || 'actual', id, T); F.g.append('path').attr('d', `M${l.source.x},${l.source.y}C${(l.source.x + l.target.x) / 2},${l.source.y} ${(l.source.x + l.target.x) / 2},${l.target.y} ${l.target.x},${l.target.y}`).attr('fill', 'none').attr('stroke', T.c1).attr('stroke-opacity', .5).attr('stroke-width', lw(l.target.data.p != null ? l.target.pp : 0)).attr('stroke-dasharray', st.dash);
      txt(F.g, l.target.x - 12, l.target.y - 7, num(100 * (l.target.data.p != null ? l.target.data.p : 1), 0) + ' %', { a: 'end', f: font(700, 10.5, MONO), c: T.ink, halo: T.bg }); });
    const nodes = F.g.selectAll('g.pn').data(root.descendants()).join('g').attr('class', 'pn').attr('transform', n => `translate(${n.x},${n.y})`); const cc = nodes.append('circle').attr('r', n => n.children ? 6 : 5.5); paint(cc, T, id, n => n.data.state, n => n.depth === 0 ? T.ink : T.c1); cc.attr('stroke', T.bg).attr('stroke-width', 1.6); interactive(nodes, n => ({ title: n.data.label, value: n.depth ? `probabilité du chemin : ${num(100 * n.pp, 1)} %` : 'point de départ', state: n.data.state, src: n.data.src, detail: n.data.note }), T);
    nodes.each(function (n) { const t = d3.select(this).append('text').attr('fill', T.ink).attr('stroke', T.bg).attr('stroke-width', 3).attr('paint-order', 'stroke').style('font', font(n.children ? 700 : 600, comp ? 10.5 : 12)).style('pointer-events', 'none'); const lines = wrapLines(n.data.label, n.children ? colW - 24 : (comp ? 100 : 160), comp ? 10.5 : 12, 700).slice(0, 2); lines.forEach((ln, k) => t.append('tspan').attr('x', n.children ? (n.depth ? -9 : 0) : 10).attr('text-anchor', n.children ? (n.depth ? 'end' : 'middle') : 'start').attr('y', (n.children ? (n.depth ? -11 : -14) : 4) + k * 13).text(ln)); });
    leaves.forEach(l => { const v = l.data.value || 0, x0 = F.iw - valueW, y = l.y; F.g.append('line').attr('x1', l.x + 6).attr('x2', x0 - 6).attr('y1', y).attr('y2', y).attr('stroke', T.line).attr('stroke-dasharray', '2 4'); F.g.append('line').attr('x1', zx).attr('x2', zx).attr('y1', y - 13).attr('y2', y + 13).attr('stroke', T.ink);
      const r = F.g.append('rect').datum(l).attr('x', v >= 0 ? zx : zx - bw(-v)).attr('y', y - 9).attr('width', Math.max(2, bw(Math.abs(v)))).attr('height', 18).attr('rx', 2); paint(r, T, id, d => d.data.state, () => v >= 0 ? T.c2 : T.neg); interactive(r, d => ({ title: d.data.label, value: `valeur ${num(v, f.dec)} ${f.unit || ''} × probabilité ${num(100 * d.pp, 1)} % = ${num(v * d.pp, 2)}`, state: d.data.state, src: d.data.src }), T);
      txt(F.g, v >= 0 ? zx + bw(v) + 4 : zx + 4, y + 4, `${num(v, f.dec)}`, { f: font(700, 11, MONO), c: T.ink, halo: T.bg }); txt(F.g, x0 + 10, y + 22, `p ${num(100 * l.pp, 0)} %`, { f: font(500, 9.5), c: T.mid }); });
    const ey = H - 40; F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', ey - 8).attr('y2', ey - 8).attr('stroke', T.ink).attr('stroke-width', 2).attr('stroke-dasharray', '1 0'); txt(F.g, 0, ey + 12, 'Espérance (Σ probabilité × valeur) :', { f: font(600, comp ? 11 : 12.5), c: T.mid }); txt(F.g, F.iw, ey + 14, `${ev < 0 ? '−' : ''}${num(Math.abs(ev), f.dec != null ? f.dec : 1)} ${f.unit || ''}`, { a: 'end', f: font(800, comp ? 17 : 20, MONO), c: ev >= 0 ? T.c2 : T.neg });
    legend(el, root.descendants().map(n => n.data.state || 'actual'));
  }
  REG('probtree', probtree, (f, r) => { const rows = []; (function walk(n, path, pp) { const p = pp * (n.p != null ? n.p : 1), q = path.concat(n.label); if (n.children) n.children.forEach(c => walk(c, q, p)); else rows.push([q.join(' › '), num(100 * p, 1) + ' %', n.value, n.src || '']); })(f.root, [], 1); return r(['Chemin', 'Probabilité', 'Valeur', 'Source'], rows); });

  /* ============================== 10. FUZZYTIMELINE — des dates qui ne sont pas certaines ============================== */
  function fuzzytimeline(el, f, T) {
    const id = uid(), comp = isNarrow(el), I = f.items.map(d => ({ ...d, t: new Date(d.date), a: new Date(d.earliest || d.date), b: new Date(d.latest || d.date) })).sort((a, b) => a.t - b.t), labelW = comp ? 110 : 210, rowH = comp ? 46 : 46, F = frame(el, id, I.length * rowH + 52, { l: labelW, r: 16, t: 8, b: 36 }); addPatterns(F.defs, id, T);
    const from = new Date(f.from || d3.min(I, d => d.a)), to = new Date(f.to || d3.max(I, d => d.b)), X = d3.scaleTime([from, to], [0, F.iw]).nice(); const shortSpan = (X.domain()[1] - X.domain()[0]) / 864e5 < 130, tk = shortSpan ? X.ticks(d3.timeWeek.every(comp ? 2 : 1)) : X.ticks(comp ? 4 : 8); axisStyle(F.g.append('g').attr('transform', `translate(0,${I.length * rowH})`).call(d3.axisBottom(X).tickValues(tk).tickFormat(d3.timeFormat(shortSpan ? '%d %b' : comp ? '%b %y' : '%b %Y')).tickSizeOuter(0)), T); F.g.append('g').selectAll('line').data(tk).join('line').attr('x1', v => X(v)).attr('x2', v => X(v)).attr('y1', 0).attr('y2', I.length * rowH).attr('stroke', T.line).attr('stroke-opacity', .4);
    if (f.today) { const t = new Date(f.today); F.g.append('line').attr('x1', X(t)).attr('x2', X(t)).attr('y1', 0).attr('y2', I.length * rowH).attr('stroke', T.neg).attr('stroke-dasharray', '4 3').attr('stroke-width', 1.6); txt(F.g, X(t) + 4, 10, "aujourd'hui", { f: font(700, 10.5), c: T.neg, halo: T.bg }); }
    I.forEach((d, i) => { const cy = i * rowH + rowH / 2, gid = id + 'g' + i; rowLabel(F.g, d.label, cy, labelW, T, 12.5, 600); const wide = Math.max(1, X(d.b) - X(d.a)), pk = wide > 1 ? (X(d.t) - X(d.a)) / wide : .5, gr = F.defs.append('linearGradient').attr('id', gid).attr('x1', 0).attr('x2', 1); gr.append('stop').attr('offset', '0%').attr('stop-color', T.c1).attr('stop-opacity', 0); gr.append('stop').attr('offset', (pk * 100) + '%').attr('stop-color', T.c1).attr('stop-opacity', .85); gr.append('stop').attr('offset', '100%').attr('stop-color', T.c1).attr('stop-opacity', 0);
      if (wide > 2) { F.g.append('rect').attr('x', X(d.a)).attr('width', wide).attr('y', cy - 9).attr('height', 18).attr('rx', 9).attr('fill', `url(#${gid})`); [d.a, d.b].forEach(t => F.g.append('line').attr('x1', X(t)).attr('x2', X(t)).attr('y1', cy - 6).attr('y2', cy + 6).attr('stroke', T.c1).attr('stroke-width', 1.5)); }
      const mk = F.g.append('path').datum(d).attr('transform', `translate(${X(d.t)},${cy})`).attr('d', d3.symbol().type(d3.symbolDiamond).size(190)()); paint(mk, T, id, dd => dd.state, () => T.ink); mk.attr('stroke', T.bg).attr('stroke-width', 1.8); interactive(mk, dd => ({ title: dd.label, value: `${d3.timeFormat('%d %b %Y')(dd.t)}` + (wide > 2 ? ` (entre ${d3.timeFormat('%b %Y')(dd.a)} et ${d3.timeFormat('%b %Y')(dd.b)})` : ''), state: dd.state, src: dd.src, detail: dd.note }), T);
      txt(F.g, X(d.t) + 12, cy - 12, d3.timeFormat(comp ? '%b %y' : '%d %b %Y')(d.t), { f: font(700, 10.5, MONO), c: T.mid, halo: T.bg }); });
    legend(el, statesOf(I)); const ul = el.parentNode.querySelector('.fig-legend'); const li = document.createElement('li'); li.textContent = 'Losange = date la plus probable · halo = fourchette de dates possibles'; ul.appendChild(li);
  }
  REG('fuzzytimeline', fuzzytimeline, tableOf(['Événement', 'Date la plus probable', 'Entre', 'Source'], d => [d.label, d.date, (d.earliest || d.date) + ' → ' + (d.latest || d.date), d.src], 'items'));

  /* ============================== 11. RINGCALENDAR — l'année en couronnes ============================== */
  function ringcalendar(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W - 8, comp ? 360 : 520), D = f.data.map(d => ({ ...d, t: new Date(d.date) })), years = [...new Set(D.map(d => d.t.getFullYear()))].sort(), Rmax = S / 2 - (comp ? 26 : 36), ringW = Math.min(80, Rmax * .6 / years.length), mx = d3.max(D, d => d.value), F = frame(el, id, S + 6, { l: 0, r: 0, t: 2, b: 2 }); addPatterns(F.defs, id, T);
    const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 2})`), doy = t => (t - new Date(t.getFullYear(), 0, 1)) / 864e5, ang = t => -Math.PI / 2 + doy(t) / (((t.getFullYear() % 4 === 0) ? 366 : 365)) * 2 * Math.PI;
    ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'].forEach((m, i) => { const a = -Math.PI / 2 + (i + .5) / 12 * 2 * Math.PI, rr = Rmax + 14; txt(g, rr * Math.cos(a), rr * Math.sin(a) + 4, m, { a: 'middle', f: font(600, comp ? 9.5 : 10.5), c: T.mid }); const a0 = -Math.PI / 2 + i / 12 * 2 * Math.PI; g.append('line').attr('x1', (Rmax - ringW * years.length - 4) * Math.cos(a0)).attr('y1', (Rmax - ringW * years.length - 4) * Math.sin(a0)).attr('x2', Rmax * Math.cos(a0)).attr('y2', Rmax * Math.sin(a0)).attr('stroke', T.line).attr('stroke-opacity', .8); });
    years.forEach((y, yi) => { const r0 = Rmax - ringW * (years.length - yi), r1 = r0 + ringW; g.append('circle').attr('r', r0).attr('fill', 'none').attr('stroke', T.line); txt(g, 0, -(r0 + 4), y, { a: 'middle', f: font(700, 9.5, MONO), c: T.lo, halo: T.bg });
      const bars = g.selectAll(null).data(D.filter(d => d.t.getFullYear() === y)).join('line').attr('x1', d => r0 * Math.cos(ang(d.t))).attr('y1', d => r0 * Math.sin(ang(d.t))).attr('x2', d => (r0 + (ringW - 3) * d.value / mx) * Math.cos(ang(d.t))).attr('y2', d => (r0 + (ringW - 3) * d.value / mx) * Math.sin(ang(d.t))).attr('stroke-linecap', 'round').attr('stroke-width', Math.max(3, (2 * Math.PI * r0 / 365) * .9)); bars.each(function (d) { const st = stateStyle(d.state || 'actual', id, T); d3.select(this).attr('stroke', d.value > mx * .75 ? T.neg : T.c1).attr('stroke-opacity', isSoft(d.state) ? .55 : .9).attr('stroke-dasharray', st.dash && !isSoft(d.state) ? st.dash : null); });
      interactive(bars, d => ({ title: d3.timeFormat('%A %d %B %Y')(d.t), value: num(d.value, f.dec) + ' ' + (f.unit || ''), state: d.state, src: d.src, detail: d.note }), T); });
    const top = D.slice().sort((a, b) => b.value - a.value)[0]; txt(g, 0, -4, num(d3.sum(D, d => d.value), 0), { a: 'middle', f: font(800, comp ? 20 : 26, MONO), c: T.ink }); txt(g, 0, 16, f.centerLabel || (f.unit || ''), { a: 'middle', f: font(500, 10.5), c: T.mid }); if (top) txt(g, 0, 32, 'pic : ' + d3.timeFormat('%d %b')(top.t), { a: 'middle', f: font(600, 10.5), c: T.neg });
    legend(el, statesOf(D));
  }
  REG('ringcalendar', ringcalendar, tableOf(['Date', 'Valeur', 'État', 'Source'], d => [d.date, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== 12. VERDICTBOARD — le tableau des verdicts (HTML) ============================== */
  function verdictboard(el, f, T) {
    el.innerHTML = ''; const V = f.verdicts || [{ key: 'confirmed', label: 'Confirmé', color: 'c2' }, { key: 'nuanced', label: 'À nuancer', color: 'c4' }, { key: 'notfound', label: 'Non retrouvé', color: 'neg' }, { key: 'unverified', label: 'Non vérifié', color: 'lo' }, { key: 'opinion', label: 'Opinion', color: 'c5' }], D = f.data, total = D.length, comp = isNarrow(el);
    const cs = v => `var(--vra-${v.color || 'lo'})`; const sum = mkNode('div', 'display:flex;height:14px;border-radius:7px;overflow:hidden;margin:0 0 .8rem;gap:2px'); sum.setAttribute('role', 'img'); sum.setAttribute('aria-label', V.map(v => `${v.label} : ${D.filter(d => d.verdict === v.key).length}`).join(', '));
    V.forEach(v => { const n = D.filter(d => d.verdict === v.key).length; if (n) sum.appendChild(mkNode('div', `flex:${n};background:${cs(v)};opacity:.9`, '')).title = `${v.label} : ${n}`; }); el.appendChild(sum);
    const grid = mkNode('div', `display:grid;gap:.7rem;grid-template-columns:${comp ? '1fr' : `repeat(${V.filter(v => D.some(d => d.verdict === v.key) || f.showEmpty).length},minmax(0,1fr))`}`);
    V.forEach(v => { const items = D.filter(d => d.verdict === v.key); if (!items.length && !f.showEmpty) return; const col = mkNode('div', `border-top:4px solid ${cs(v)};padding-top:.45rem;min-width:0`); col.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:baseline;font:700 .82rem var(--vra-sans);letter-spacing:.04em;text-transform:uppercase;margin-bottom:.45rem"><span style="color:${cs(v)}">${escH(v.label)}</span><span style="font:800 1rem var(--vra-mono)">${items.length}</span></div>`;
      items.forEach(d => { const card = mkNode('div', `background:color-mix(in srgb,var(--vra-panel) 80%,transparent);border:1px solid var(--vra-line);border-left:3px solid ${cs(v)};border-radius:4px;padding:.5rem .6rem;margin-bottom:.45rem;font:500 .84rem/1.4 var(--vra-sans)`); card.tabIndex = 0; card.innerHTML = `<div>${escH(d.claim)}</div>${d.note ? `<div style="color:var(--vra-mid);font-size:.76rem;margin-top:.25rem">${escH(d.note)}</div>` : ''}<div style="margin-top:.3rem;font-size:.74rem">${srcPill(d.ref || d.src)}${d.src && d.ref ? ' ' + srcPill(d.src) : ''}</div>`; col.appendChild(card); }); grid.appendChild(col); }); el.appendChild(grid);
  }
  REG('verdictboard', verdictboard, (f, r) => r(['Affirmation', 'Verdict', 'Source'], f.data.map(d => [d.claim, (f.verdicts || [{ key: 'confirmed', label: 'Confirmé' }, { key: 'nuanced', label: 'À nuancer' }, { key: 'notfound', label: 'Non retrouvé' }, { key: 'unverified', label: 'Non vérifié' }, { key: 'opinion', label: 'Opinion' }]).find(v => v.key === d.verdict)?.label || d.verdict, d.ref || d.src || ''])));

  /* ============================== 13. CROSSING — quand la courbe franchit le seuil ============================== */
  function crossing(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.series, xs = f.x, th = f.threshold, F = frame(el, id, comp ? 320 : 380, { l: comp ? 42 : 54, t: 24, r: comp ? 20 : 120, b: 36 }); addPatterns(F.defs, id, T);
    const X = xScale(xs, F.iw), all = S.flatMap(s => s.values).concat(th.value), Y = d3.scaleLinear([Math.min(0, d3.min(all)), d3.max(all) * 1.1], [F.ih, 0]).nice(); yAxisLeft(F, Y, T); axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(xAxis(X, xs, comp)), T);
    const above = (th.dir || 'above') === 'above', zy0 = above ? 0 : Y(th.value), zh = above ? Y(th.value) : F.ih - Y(th.value); F.g.append('rect').attr('x', 0).attr('width', F.iw).attr('y', above ? 0 : Y(th.value)).attr('height', above ? Y(th.value) : F.ih - Y(th.value)).attr('fill', T.neg).attr('fill-opacity', .07);
    F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(th.value)).attr('y2', Y(th.value)).attr('stroke', T.neg).attr('stroke-width', 2).attr('stroke-dasharray', '6 4'); txt(F.g, 6, Y(th.value) + (above ? 15 : -7), th.label, { f: font(700, 11.5), c: T.neg, halo: T.bg });
    const xnum = v => isDateStr(v) ? new Date(v).getTime() : (typeof v === 'number' ? v : xs.indexOf(v)); const labs = [];
    S.forEach((s, si) => { const c = col(T, s.color, si), pts = xs.map((x, i) => ({ x, v: s.values[i], i })).filter(p => p.v != null), path = F.g.append('path').datum(pts).attr('d', d3.line().x(p => xv(X, p.x)).y(p => Y(p.v))).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2.8).attr('stroke-dasharray', stateStyle(s.state || 'actual', id, T).dash); interactive(path, d => ({ title: s.label, value: 'franchit : ' + (d.cross ? d.cross.label : 'jamais sur la période'), state: s.state, src: s.src, detail: s.note }), T);
      const dots = F.g.selectAll(null).data(pts).join('circle').attr('cx', p => xv(X, p.x)).attr('cy', p => Y(p.v)).attr('r', 3.6).attr('fill', c).attr('stroke', T.bg); interactive(dots, p => ({ title: s.label + ' · ' + (isDateStr(p.x) ? d3.timeFormat('%b %Y')(new Date(p.x)) : p.x), value: num(p.v, f.dec) + ' ' + (f.unit || ''), state: s.state, src: s.src }), T);
      let cross = null; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], da = above ? a.v - th.value : th.value - a.v, db = above ? b.v - th.value : th.value - b.v; if (da < 0 && db >= 0) { const t = da / (da - db), xa = xv(X, a.x), xb = xv(X, b.x), cx = xa + (xb - xa) * t, lx = isDateStr(a.x) ? new Date(+new Date(a.x) + (new Date(b.x) - new Date(a.x)) * t) : (typeof a.x === 'number' ? a.x + (b.x - a.x) * t : b.x); cross = { cx, cy: Y(th.value), label: isDateStr(a.x) ? d3.timeFormat('%b %Y')(lx) : (typeof a.x === 'number' ? 'vers ' + num(lx, 1) : String(b.x)) }; break; } }
      pts.cross = cross; path.datum(Object.assign(pts, { cross })); if (cross) { F.g.append('line').attr('x1', cross.cx).attr('x2', cross.cx).attr('y1', cross.cy).attr('y2', F.ih).attr('stroke', c).attr('stroke-dasharray', '3 3').attr('stroke-width', 1.8); F.g.append('circle').attr('cx', cross.cx).attr('cy', cross.cy).attr('r', 7).attr('fill', T.bg).attr('stroke', c).attr('stroke-width', 3); let ly = F.ih - 8 - si * 16; txt(F.g, cross.cx + 8, ly, `${s.label} : ${cross.label}`, { f: font(700, comp ? 10.5 : 11.5), c, halo: T.bg }); } else txt(F.g, F.iw - 4, F.ih - 8 - si * 16, `${s.label} : ne franchit pas le seuil`, { a: 'end', f: font(700, comp ? 10.5 : 11.5), c, halo: T.bg }); if (!comp) txt(F.g, F.iw + 8, Y(pts[pts.length - 1].v) + 4, s.label, { f: font(700, 11.5), c }); });
    legend(el, statesOf(S));
  }
  REG('crossing', crossing, (f, r) => r(['Série', ...f.x.map(String), 'Source'], f.series.map(s => [s.label, ...s.values.map(v => v == null ? '' : num(v, 2)), s.src])));

  /* ============================================================================================
   *  LOT 7 — FORMES ORIGINALES (suite), inspirées de catalogues de formes rares (xeno.graphics, Data Viz Project,
   *  d3 graph gallery, blocks) — redessinées de zéro, aucun code copié.
   *  upset · raincloud · ternary · dorling · edgebundle · stackedbump · scatterpies · fishbone · euler
   *  cycleplot · spiralheat · hiveplot · doublewaterfall · lexis · splitflap · sunicicle
   * ============================================================================================ */
  const trunc = C.helpers.trunc;
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const hl = (sel, items, on) => { items.on('pointerenter.hl focus.hl', function (e, d) { sel.attr('stroke-opacity', k => on(d, k) ? .95 : .08).attr('opacity', k => on(d, k) ? 1 : .35); }).on('pointerleave.hl blur.hl', () => sel.attr('stroke-opacity', null).attr('opacity', null)); };

  /* ============================== UPSET — intersections d'ensembles ============================== */
  function upset(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.sets, C0 = f.combos.slice().sort((a, b) => b.value - a.value).slice(0, comp ? 8 : 14), n = C0.length, labelW = comp ? 82 : 150, barW = comp ? 60 : 96, topH = comp ? 110 : 150, rowH = comp ? 28 : 30;
    const F = frame(el, id, topH + S.length * rowH + 30, { l: 0, r: 6, t: 10, b: 6 }); addPatterns(F.defs, id, T); const mx = F.iw - labelW - barW - 6, cw = mx / n, x0 = labelW + barW + 6, mxv = d3.max(C0, d => d.value), Y = d3.scaleLinear([0, mxv], [topH - 24, 14]);
    const size = Object.fromEntries(S.map(s => [s.id, d3.sum(C0.concat(f.combos.filter(c => !C0.includes(c))), c => c.sets.includes(s.id) ? c.value : 0)])), bw = d3.scaleLinear([0, d3.max(Object.values(size))], [0, barW - 30]);
    S.forEach((s, i) => { const cy = topH + i * rowH + rowH / 2; if (i % 2 === 0) F.g.append('rect').attr('x', 0).attr('y', cy - rowH / 2).attr('width', F.iw).attr('height', rowH).attr('fill', T.line).attr('fill-opacity', .25);
      const t = F.g.append('text').attr('x', labelW - 6).attr('y', cy + 4).attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(600, comp ? 11 : 12.5)).text(comp ? trunc(s.label, 13) : s.label);
      const b = F.g.append('rect').datum(s).attr('x', labelW + barW - bw(size[s.id])).attr('y', cy - 7).attr('width', bw(size[s.id])).attr('height', 14).attr('rx', 2); paint(b, T, id, d => d.state, () => T.c3); interactive(b, d => ({ title: d.label, value: `${num(size[d.id], f.dec)} ${f.unit || ''} au total (somme des intersections)`, state: d.state, src: d.src }), T); txt(F.g, labelW + barW - bw(size[s.id]) - 3, cy + 4, num(size[s.id], f.dec), { a: 'end', f: font(600, 10, MONO), c: T.mid, halo: T.bg }); });
    C0.forEach((c, j) => { const cx = x0 + j * cw + cw / 2, multi = c.sets.length > 1, rows = c.sets.map(s => S.findIndex(q => q.id === s)).filter(i => i >= 0).sort((a, b) => a - b);
      const bar = F.g.append('rect').datum(c).attr('x', cx - Math.min(cw * .7, 26) / 2).attr('width', Math.min(cw * .7, 26)).attr('y', 18 + Y(c.value)).attr('height', Math.max(1, topH - 24 - Y(c.value))).attr('rx', 2); paint(bar, T, id, d => d.state, () => multi ? T.c4 : T.c1);
      interactive(bar, d => ({ title: d.sets.map(s => S.find(q => q.id === s).label).join(' ∩ '), value: `${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T); txt(F.g, cx, 14 + Y(c.value), num(c.value, f.dec), { a: 'middle', f: font(700, 10.5, MONO), c: T.ink });
      if (rows.length > 1) F.g.append('line').attr('x1', cx).attr('x2', cx).attr('y1', topH + rows[0] * rowH + rowH / 2).attr('y2', topH + rows[rows.length - 1] * rowH + rowH / 2).attr('stroke', T.ink).attr('stroke-width', 3);
      S.forEach((s, i) => F.g.append('circle').attr('cx', cx).attr('cy', topH + i * rowH + rowH / 2).attr('r', 5.2).attr('fill', c.sets.includes(s.id) ? T.ink : T.line).attr('fill-opacity', c.sets.includes(s.id) ? 1 : .8)); });
    txt(F.g, x0, 10, comp ? (f.unit || 'valeur') : (f.title || 'Taille de chaque intersection'), { f: font(600, 10.5), c: T.mid }); legend(el, statesOf(C0.concat(S)));
  }
  REG('upset', upset, (f, r) => r(['Intersection', 'Valeur', 'État', 'Source'], f.combos.map(c => [c.sets.map(s => (f.sets.find(q => q.id === s) || {}).label || s).join(' ∩ '), num(c.value, 2), SL(c.state), c.src || ''])));

  /* ============================== RAINCLOUD — nuage + boîte + pluie ============================== */
  function raincloud(el, f, T) {
    const id = uid(), comp = isNarrow(el), G = f.groups, labelW = comp ? 92 : 170, rowH = comp ? 92 : 104, F = frame(el, id, G.length * rowH + 40, { l: labelW, r: 14, t: 6, b: 30 }); addPatterns(F.defs, id, T);
    const all = G.flatMap(g => g.values), pad = (d3.max(all) - d3.min(all)) * .06, X = d3.scaleLinear([d3.min(all) - pad, d3.max(all) + pad], [0, F.iw]).nice(); xAxisBottom({ g: F.g, ih: G.length * rowH - 6 }, X, T, comp);
    G.forEach((g, gi) => { const base = gi * rowH + 56, c = col(T, g.color, gi), v = g.values.slice().sort(d3.ascending), q = [.25, .5, .75].map(p => d3.quantile(v, p)), ticks = d3.range(X.domain()[0], X.domain()[1], (X.domain()[1] - X.domain()[0]) / 80), k = kdeOf(v, ticks), my = d3.max(k, d => d[1]), H = d3.scaleLinear([0, my], [0, 44]);
      rowLabel(F.g, g.label, base - 14, labelW, T, comp ? 11.5 : 12.5, 700);
      const cloud = F.g.append('path').datum(g).attr('d', d3.area().x(d => X(d[0])).y0(base).y1(d => base - H(d[1])).curve(d3.curveBasis)(k)); paint(cloud, T, id, d => d.state, () => c); cloud.attr('fill-opacity', isSoft(g.state) ? .9 : .55);
      interactive(cloud, d => ({ title: d.label, value: `n = ${v.length} · médiane ${num(q[1], f.dec)} · IQR ${num(q[0], f.dec)}–${num(q[2], f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
      F.g.append('rect').attr('x', X(q[0])).attr('width', Math.max(2, X(q[2]) - X(q[0]))).attr('y', base + 6).attr('height', 11).attr('fill', T.bg).attr('stroke', T.ink).attr('stroke-width', 1.4).attr('rx', 2); F.g.append('line').attr('x1', X(q[1])).attr('x2', X(q[1])).attr('y1', base + 4).attr('y2', base + 19).attr('stroke', T.neg).attr('stroke-width', 2.6);
      F.g.append('line').attr('x1', X(v[0])).attr('x2', X(q[0])).attr('y1', base + 11.5).attr('y2', base + 11.5).attr('stroke', T.ink); F.g.append('line').attr('x1', X(q[2])).attr('x2', X(v[v.length - 1])).attr('y1', base + 11.5).attr('y2', base + 11.5).attr('stroke', T.ink);
      F.g.selectAll(null).data(v).join('circle').attr('cx', d => X(d)).attr('cy', (d, i) => base + 24 + rnd(i + gi * 31) * 18).attr('r', 2.6).attr('fill', c).attr('fill-opacity', .75).style('pointer-events', 'none'); txt(F.g, X(q[1]), base + 50, num(q[1], f.dec), { a: 'middle', f: font(700, 10.5, MONO), c: T.neg, halo: T.bg }); });
    txt(F.g, F.iw, G.length * rowH + 24, f.unit || '', { a: 'end', f: font(600, 11), c: T.mid }); legend(el, statesOf(G));
  }
  REG('raincloud', raincloud, (f, r) => r(['Groupe', 'n', 'Médiane', 'Min', 'Max', 'Source'], f.groups.map(g => { const v = g.values.slice().sort(d3.ascending); return [g.label, v.length, num(d3.median(v), 2), num(v[0], 2), num(v[v.length - 1], 2), g.src || '']; })));

  /* ============================== TERNARY — trois parts qui font 100 % ============================== */
  function ternary(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, s = Math.min(W - 60, comp ? 340 : 500), h = s * Math.sqrt(3) / 2, F = frame(el, id, h + 70, { l: 0, r: 0, t: 26, b: 22 }); addPatterns(F.defs, id, T);
    const ox = (F.iw - s) / 2, V = [[ox + s / 2, 0], [ox, h], [ox + s, h]], P = d => { const t = (d.a || 0) + (d.b || 0) + (d.c || 0) || 1, a = d.a / t, b = d.b / t, c = d.c / t; return [a * V[0][0] + b * V[1][0] + c * V[2][0], a * V[0][1] + b * V[1][1] + c * V[2][1]]; };
    F.g.append('path').attr('d', `M${V.map(p => p.join(',')).join('L')}Z`).attr('fill', T.line).attr('fill-opacity', .18).attr('stroke', T.ink).attr('stroke-width', 1.6);
    [.2, .4, .6, .8].forEach(k => { [[0, 1, 2], [1, 2, 0], [2, 0, 1]].forEach(([i, j, l], q) => { const p1 = [0, 0, 0], p2 = [0, 0, 0]; p1[i] = k; p1[j] = 1 - k; p2[i] = k; p2[l] = 1 - k; const a = P({ a: p1[0], b: p1[1], c: p1[2] }), b = P({ a: p2[0], b: p2[1], c: p2[2] }); F.g.append('line').attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]).attr('stroke', T.line).attr('stroke-opacity', .8);
      if (q === 0) txt(F.g, a[0] - 6, a[1] + 3, Math.round(k * 100) + '', { a: 'end', f: font(500, 9.5, MONO), c: T.mid }); if (q === 1) txt(F.g, b[0], b[1] + 14, Math.round(k * 100) + '', { a: 'middle', f: font(500, 9.5, MONO), c: T.mid }); if (q === 2) txt(F.g, a[0] + 6, a[1] + 3, Math.round(k * 100) + '', { f: font(500, 9.5, MONO), c: T.mid }); }); });
    const A = f.axes; txt(F.g, V[0][0], -10, A[0], { a: 'middle', f: font(700, 12.5), c: T.ink }); txt(F.g, V[1][0], h + 30, A[1], { a: 'start', f: font(700, 12.5), c: T.ink }).attr('transform', `translate(-6,0)`); txt(F.g, V[2][0], h + 30, A[2], { a: 'end', f: font(700, 12.5), c: T.ink }).attr('transform', 'translate(6,0)');
    const vmax = d3.max(f.data, d => d.value || 1), R = d3.scaleSqrt([0, vmax], [4, comp ? 11 : 15]); const dots = F.g.selectAll('circle.tp').data(f.data).join('circle').attr('class', 'tp').attr('cx', d => P(d)[0]).attr('cy', d => P(d)[1]).attr('r', d => d.value ? R(d.value) : 7); paint(dots, T, id, d => d.state, (d, i) => col(T, d.color, i)); dots.attr('stroke', T.bg).attr('stroke-width', 1.4);
    const tot = d => (d.a + d.b + d.c) || 1; interactive(dots, d => ({ title: d.label, value: `${A[0]} ${num(100 * d.a / tot(d), 0)} % · ${A[1]} ${num(100 * d.b / tot(d), 0)} % · ${A[2]} ${num(100 * d.c / tot(d), 0)} %`, state: d.state, src: d.src, detail: d.note }), T);
    if (f.data.length <= (comp ? 8 : 14)) f.data.forEach(d => { const p = P(d); txt(F.g, p[0] + (d.value ? R(d.value) : 7) + 4, p[1] + 4, d.label, { f: font(600, comp ? 10.5 : 11.5), c: T.ink, halo: T.bg }); }); legend(el, statesOf(f.data));
  }
  REG('ternary', ternary, (f, r) => r(['Élément', ...f.axes, 'Source'], f.data.map(d => [d.label, num(d.a, 1), num(d.b, 1), num(d.c, 1), d.src || ''])));

  /* ============================== DORLING — cartogramme à cercles ============================== */
  function dorling(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, W = el.clientWidth || 640, ih = Math.round(Math.min(W * (comp ? .95 : .56), 520)), F = frame(el, id, ih, { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const groups = [...new Set(D.map(d => d.group || d.label))], mR = comp ? 44 : 72, R = d3.scaleSqrt([0, d3.max(D, d => d.value)], [3, mR]), pts = { type: 'MultiPoint', coordinates: D.map(d => [d.lon, d.lat]) }, pr = d3.geoNaturalEarth1().fitExtent([[mR * .8, mR * .8], [F.iw - mR * .8, ih - mR * .8 - 8]], pts);
    D.forEach(d => { const p = pr([d.lon, d.lat]); d.ox = p[0]; d.oy = p[1]; d.x = p[0]; d.y = p[1]; d.r = R(d.value); });
    const sim = d3.forceSimulation(D).force('x', d3.forceX(d => d.ox).strength(.35)).force('y', d3.forceY(d => d.oy).strength(.35)).force('c', d3.forceCollide(d => d.r + 1.5).iterations(3)).stop(); for (let i = 0; i < 320; i++) sim.tick();
    D.forEach(d => { d.x = Math.max(d.r, Math.min(F.iw - d.r, d.x)); d.y = Math.max(d.r, Math.min(ih - 8 - d.r, d.y)); });
    F.g.append('g').selectAll('line').data(D.filter(d => Math.hypot(d.x - d.ox, d.y - d.oy) > d.r * .6)).join('line').attr('x1', d => d.ox).attr('y1', d => d.oy).attr('x2', d => d.x).attr('y2', d => d.y).attr('stroke', T.mid).attr('stroke-opacity', .5).attr('stroke-dasharray', '2 3'); F.g.append('g').selectAll('circle.o').data(D).join('circle').attr('class', 'o').attr('cx', d => d.ox).attr('cy', d => d.oy).attr('r', 2.2).attr('fill', T.mid);
    const cs = F.g.append('g').selectAll('circle.dc').data(D).join('circle').attr('class', 'dc').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r); paint(cs, T, id, d => d.state, d => col(T, d.color, groups.indexOf(d.group || d.label))); cs.attr('stroke', T.bg).attr('stroke-width', 1.6);
    interactive(cs, d => ({ title: d.label, value: `${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
    D.forEach(d => { if (d.r > (comp ? 15 : 19)) txt(F.g, d.x, d.y + 4, d.short || d.label, { a: 'middle', f: font(700, Math.min(12, Math.max(9.5, d.r / 3.4))), c: ink(T, d3.color(col(T, d.color, groups.indexOf(d.group || d.label))).formatHex()), halo: 'none' }); else txt(F.g, d.x, d.y + d.r + 11, d.short || d.label, { a: 'middle', f: font(600, 10), c: T.ink, halo: T.bg }); });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); if (groups.length > 1 && D.some(d => d.group)) groups.forEach((g, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="6" fill="${col(T, (D.find(d => d.group === g) || {}).color, k)}"/></svg>${g}`; ul.appendChild(li); }); const li = document.createElement('li'); li.textContent = 'Surface du cercle = valeur · point = position réelle'; ul.appendChild(li);
  }
  REG('dorling', dorling, tableOf(['Lieu', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== EDGEBUNDLE — liens regroupés par famille ============================== */
  function edgebundle(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W, comp ? 380 : 620), labW = comp ? 74 : 112, R = S / 2 - labW, groups = [...new Set(f.nodes.map(n => n.group))];
    const nodes = f.nodes.slice().sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group)), n = nodes.length, gap = .12, step = (2 * Math.PI - gap * groups.length) / n; let a = -Math.PI / 2; const gc = {};
    nodes.forEach((nd, i) => { if (i && nd.group !== nodes[i - 1].group) a += gap; nd.a = a + step / 2; a += step; (gc[nd.group] = gc[nd.group] || []).push(nd.a); }); const ga = Object.fromEntries(groups.map(g => [g, d3.mean(gc[g])])), by = Object.fromEntries(nodes.map(nd => [nd.id, nd])), pol = (ang, r) => [Math.cos(ang) * r, Math.sin(ang) * r];
    const F = frame(el, id, S + 10, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T); const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 4})`), wv = d3.scaleSqrt([0, d3.max(f.links, l => l.v) || 1], [1, 5.5]);
    const line = d3.line().curve(d3.curveBundle.beta(f.beta != null ? f.beta : .82));
    const links = g.append('g').attr('fill', 'none').selectAll('path').data(f.links).join('path').attr('d', l => { const s = by[l.s], t = by[l.t], pts = s.group === t.group ? [pol(s.a, R), pol(ga[s.group], R * .62), pol(t.a, R)] : [pol(s.a, R), pol(ga[s.group], R * .5), [0, 0], pol(ga[t.group], R * .5), pol(t.a, R)]; return line(pts); })
      .attr('stroke', l => col(T, null, groups.indexOf(by[l.s].group))).attr('stroke-width', l => wv(l.v)).attr('stroke-opacity', .5).attr('stroke-linecap', 'round').each(function (l) { const st = stateStyle(l.state || 'actual', id, T); if (st.dash) d3.select(this).attr('stroke-dasharray', st.dash); });
    interactive(links, l => ({ title: `${by[l.s].label} → ${by[l.t].label}`, value: `${num(l.v, f.dec)} ${f.unit || ''}`, state: l.state, src: l.src, detail: l.note }), T);
    const dots = g.append('g').selectAll('circle').data(nodes).join('circle').attr('cx', d => pol(d.a, R)[0]).attr('cy', d => pol(d.a, R)[1]).attr('r', 5.5).attr('fill', d => col(T, null, groups.indexOf(d.group))).attr('stroke', T.bg).attr('stroke-width', 1.6); interactive(dots, d => ({ title: d.label, value: d.group + ' · ' + num(d3.sum(f.links.filter(l => l.s === d.id || l.t === d.id), l => l.v), f.dec) + ' ' + (f.unit || '') + ' de liens', src: d.src }), T);
    hl(links, dots, (d, l) => l.s === d.id || l.t === d.id);
    nodes.forEach(d => { const p = pol(d.a, R + 11), right = Math.cos(d.a) >= 0, deg = d.a * 180 / Math.PI; g.append('text').attr('transform', `translate(${p[0]},${p[1]}) rotate(${right ? deg : deg + 180})`).attr('text-anchor', right ? 'start' : 'end').attr('dy', '.32em').attr('fill', T.ink).style('font', font(600, comp ? 9.5 : 11)).style('pointer-events', 'none').text(trunc(d.label, comp ? 13 : 20)); });
    groups.forEach((gr, k) => { const r0 = R + (comp ? 10 : 12) + labW * .5, p = pol(ga[gr], R * .22); g.append('path').attr('d', d3.arc().innerRadius(R + 4).outerRadius(R + 7).startAngle(d3.min(gc[gr]) - step / 2 + Math.PI / 2).endAngle(d3.max(gc[gr]) + step / 2 + Math.PI / 2)()).attr('fill', col(T, null, k)); });
    legend(el, statesOf(f.links)); const ul = el.parentNode.querySelector('.fig-legend'); groups.forEach((gr, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" rx="2" fill="${col(T, null, k)}"/></svg>${gr}`; ul.appendChild(li); });
  }
  REG('edgebundle', edgebundle, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, num(l.v, 2), l.src || ''])));

  /* ============================== STACKEDBUMP — rangs ET poids ============================== */
  function stackedbump(el, f, T) {
    const id = uid(), comp = isNarrow(el), xs = f.x, S = f.series, labW = comp ? 70 : 130, F = frame(el, id, comp ? 380 : 440, { l: 8, r: labW, t: 24, b: 30 }); addPatterns(F.defs, id, T);
    const pad = 4, tot = xs.map((x, i) => d3.sum(S, s => s.values[i])), mx = d3.max(tot), sc = (F.ih - pad * (S.length - 1)) / mx, X = xs.length > 1 ? d3.scalePoint(xs, [0, F.iw]) : () => 0;
    const lay = S.map(() => []); xs.forEach((x, i) => { let y = 0; S.map((s, k) => ({ k, v: s.values[i] })).sort((a, b) => b.v - a.v).forEach((o, rank) => { lay[o.k][i] = { y0: y, y1: y + o.v * sc, rank: rank + 1, v: o.v }; y += o.v * sc + pad; }); });
    xs.forEach(x => { F.g.append('line').attr('x1', X(x)).attr('x2', X(x)).attr('y1', -8).attr('y2', F.ih).attr('stroke', T.line); txt(F.g, X(x), F.ih + 20, x, { a: 'middle', f: font(600, 11.5), c: T.mid }); });
    const area = d3.area().x((d, i) => X(xs[i])).y0(d => d.y0).y1(d => d.y1).curve(d3.curveBumpX);
    const bands = F.g.selectAll('path.sb').data(S.map((s, k) => ({ s, k, pts: lay[k] }))).join('path').attr('class', 'sb').attr('d', d => area(d.pts)); paint(bands, T, id, d => d.s.state, d => col(T, d.s.color, d.k)); bands.attr('fill-opacity', d => isSoft(d.s.state) ? 1 : .82).attr('stroke', T.bg).attr('stroke-width', 1);
    interactive(bands, d => ({ title: d.s.label, value: xs.map((x, i) => `${x} : #${d.pts[i].rank} (${num(d.pts[i].v, f.dec)})`).join(' · '), state: d.s.state, src: d.s.src, detail: d.s.note }), T);
    S.forEach((s, k) => { const L = lay[k], last = L[xs.length - 1], first = L[0]; txt(F.g, F.iw + 8, (last.y0 + last.y1) / 2 + 4, `${s.label}`, { f: font(700, comp ? 10.5 : 12), c: col(T, s.color, k), halo: T.bg }); xs.forEach((x, i) => { const b = L[i]; if (b.y1 - b.y0 > 15) txt(F.g, X(x), (b.y0 + b.y1) / 2 + 4, '#' + b.rank, { a: i === 0 ? 'start' : i === xs.length - 1 ? 'end' : 'middle', f: font(800, 10.5, MONO), c: ink(T, d3.color(col(T, s.color, k)).formatHex()) }); }); });
    txt(F.g, 0, -10, 'Épaisseur = valeur · ordre vertical = rang', { f: font(500, 10.5), c: T.mid }); legend(el, statesOf(S));
  }
  REG('stackedbump', stackedbump, (f, r) => r(['Série', ...f.x.map(String), 'Source'], f.series.map(s => [s.label, ...s.values.map(v => num(v, 2)), s.src || ''])));

  /* ============================== SCATTERPIES — composition sur chaque point ============================== */
  function scatterpies(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, K = f.keys, F = frame(el, id, comp ? 360 : 440, { l: comp ? 42 : 56, t: 16, r: 22, b: 44 }); addPatterns(F.defs, id, T);
    const mxr = comp ? 22 : 30, X = d3.scaleLinear(d3.extent(D, d => d.x), [mxr, F.iw - mxr]).nice(), Y = d3.scaleLinear(d3.extent(D, d => d.y), [F.ih - mxr, mxr]).nice(), Rr = d3.scaleSqrt([0, d3.max(D, d => d.size || 1)], [6, mxr]); yAxisLeft(F, Y, T); xAxisBottom(F, X, T, comp);
    txt(F.g, F.iw / 2, F.ih + 36, f.xLabel || '', { a: 'middle', f: font(600, 11), c: T.mid }); txt(F.g, -comp ? 34 : -48, -4, f.yLabel || '', { f: font(600, 11), c: T.mid }); const pie = d3.pie().sort(null).value(p => p.value);
    D.forEach((d, di) => { const r = Rr(d.size || 1), g = F.g.append('g').datum(d).attr('transform', `translate(${X(d.x)},${Y(d.y)})`), kc = k => col(T, (K.find(q => q.k === k) || {}).color, K.findIndex(q => q.k === k)); g.selectAll('path').data(pie(d.parts)).join('path').attr('d', d3.arc().innerRadius(0).outerRadius(r)).attr('fill', p => kc(p.data.k)).attr('stroke', T.bg).attr('stroke-width', 1.2).attr('fill-opacity', isSoft(d.state) ? .55 : .95);
      const ring = g.append('circle').attr('r', r + 1.6).attr('fill', 'none').attr('stroke', T.ink).attr('stroke-width', 1.2).attr('stroke-dasharray', stateStyle(d.state || 'actual', id, T).dash); interactive(g, dd => ({ title: dd.label, value: dd.parts.map(p => `${(K.find(q => q.k === p.k) || {}).label || p.k} ${num(100 * p.value / d3.sum(dd.parts, q => q.value), 0)} %`).join(' · '), state: dd.state, src: dd.src, detail: dd.note }), T);
      if (D.length <= (comp ? 7 : 14)) txt(F.g, X(d.x), Y(d.y) - r - 5, d.label, { a: 'middle', f: font(700, 10.5), c: T.ink, halo: T.bg }); });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); K.forEach((k, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" rx="6" fill="${col(T, k.color, i)}"/></svg>${k.label}`; ul.appendChild(li); });
  }
  REG('scatterpies', scatterpies, (f, r) => r(['Élément', 'x', 'y', 'Composition', 'Source'], f.data.map(d => [d.label, num(d.x, 1), num(d.y, 1), d.parts.map(p => p.k + ' ' + num(p.value, 0)).join(' / '), d.src || ''])));

  /* ============================== FISHBONE — arêtes de poisson (causes) ============================== */
  function fishbone(el, f, T) {
    const id = uid(), comp = isNarrow(el), B = f.bones, top = B.filter((b, i) => i % 2 === 0), bot = B.filter((b, i) => i % 2 === 1), maxC = d3.max(B, b => b.causes.length), fs = comp ? 10 : 11.5, half = 46 + maxC * (comp ? 27 : 24), headW = comp ? 92 : 150, F = frame(el, id, half * 2 + 30, { l: 6, r: 6, t: 12, b: 12 }); addPatterns(F.defs, id, T);
    const cy = half + 10, spineEnd = F.iw - headW, cols = Math.max(top.length, bot.length), sp = (spineEnd - 20) / cols;
    F.g.append('line').attr('x1', 4).attr('x2', spineEnd).attr('y1', cy).attr('y2', cy).attr('stroke', T.ink).attr('stroke-width', 3.5).attr('stroke-linecap', 'round'); F.g.append('path').attr('d', `M${spineEnd},${cy - 24}L${F.iw},${cy - 24}L${F.iw},${cy + 24}L${spineEnd},${cy + 24}L${spineEnd + 12},${cy}Z`).attr('fill', T.neg).attr('fill-opacity', .14).attr('stroke', T.neg).attr('stroke-width', 2);
    const eff = wrapLines(f.effect, headW - 24, comp ? 11 : 12.5, 800).slice(0, 4); eff.forEach((ln, i) => txt(F.g, spineEnd + 18, cy - (eff.length - 1) * 7 + i * 14.5 + 4, ln, { f: font(800, comp ? 11 : 12.5), c: T.ink }));
    const side = (arr, dir) => arr.forEach((b, i) => { const xe = 20 + (i + 1) * sp - 6, xs = xe - sp * .45, ye = cy + dir * (half - 8), g = F.g.append('g'); g.append('line').attr('x1', xs).attr('y1', ye).attr('x2', xe).attr('y2', cy).attr('stroke', T.ink).attr('stroke-width', 2.2);
      const lab = wrapLines(b.label, sp - 8, fs + .5, 800).slice(0, 2), bx = xs - 2; lab.forEach((ln, k) => txt(F.g, bx, ye + dir * (12 + k * 13) + (dir > 0 ? 4 : 0), ln, { a: 'middle', f: font(800, fs + .5), c: T.c1 }));
      b.causes.forEach((c, j) => { const t = (j + 1) / (b.causes.length + 1), py = ye + (cy - ye) * t * .96, px = xs + (xe - xs) * t * .96, tw = sp * .42, dot = F.g.append('g').datum(c); const st = stateStyle(c.state || 'actual', id, T); dot.append('line').attr('x1', px - tw).attr('x2', px).attr('y1', py).attr('y2', py).attr('stroke', c.state === 'claim' ? T.c4 : T.mid).attr('stroke-width', 1.5).attr('stroke-dasharray', st.dash);
        const ln = wrapLines(c.label, tw + sp * .3, fs, 600).slice(0, 2); ln.forEach((l2, k) => txt(F.g, px - tw - 3, py + 3.5 - (ln.length - 1) * 5.5 + k * 11, l2, { a: 'end', f: font(600, fs), c: T.ink, halo: T.bg })); const hit = F.g.append('circle').datum(c).attr('cx', px).attr('cy', py).attr('r', 4.6); paint(hit, T, id, d => d.state, () => T.c1); interactive(hit, d => ({ title: d.label, value: b.label, state: d.state, src: d.src, detail: d.note }), T); }); });
    side(top, -1); side(bot, 1); legend(el, B.flatMap(b => statesOf(b.causes)));
  }
  REG('fishbone', fishbone, (f, r) => r(['Catégorie', 'Cause', 'État', 'Source'], f.bones.flatMap(b => b.causes.map(c => [b.label, c.label, SL(c.state), c.src || '']))));

  /* ============================== EULER — diagramme de Venn proportionnel ============================== */
  function euler(el, f, T) {
    const id = uid(), comp = isNarrow(el), S = f.sets, W = el.clientWidth || 640, H = Math.round(Math.min(W * (comp ? .85 : .6), 440)), F = frame(el, id, H, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T);
    const rad = s => Math.sqrt(s.size / Math.PI), lens = (r1, r2, d) => { if (d >= r1 + r2) return 0; if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2; const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)), b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2)); return a + b - .5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)); };
    const dist = (a, b) => { const o = (f.overlaps || []).find(q => q.sets.includes(a.id) && q.sets.includes(b.id)), r1 = rad(a), r2 = rad(b); if (!o || !o.size) return r1 + r2 + Math.max(r1, r2) * .15; let lo = Math.abs(r1 - r2), hi = r1 + r2; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; lens(r1, r2, m) > o.size ? lo = m : hi = m; } return (lo + hi) / 2; };
    const pos = [[0, 0]]; if (S.length > 1) pos.push([dist(S[0], S[1]), 0]); if (S.length > 2) { const dab = pos[1][0], dac = dist(S[0], S[2]), dbc = dist(S[1], S[2]), x = (dab * dab + dac * dac - dbc * dbc) / (2 * dab), y = Math.sqrt(Math.max(0, dac * dac - x * x)); pos.push([x, -y]); }
    const minx = d3.min(S, (s, i) => pos[i][0] - rad(s)), maxx = d3.max(S, (s, i) => pos[i][0] + rad(s)), miny = d3.min(S, (s, i) => pos[i][1] - rad(s)), maxy = d3.max(S, (s, i) => pos[i][1] + rad(s)), k = Math.min((F.iw - 20) / (maxx - minx), (H - 50) / (maxy - miny)), ox = (F.iw - (maxx - minx) * k) / 2 - minx * k, oy = (H - (maxy - miny) * k) / 2 - miny * k;
    const P = S.map((s, i) => ({ s, x: pos[i][0] * k + ox, y: pos[i][1] * k + oy, r: rad(s) * k, i }));
    const cs = F.g.selectAll('circle.ec').data(P).join('circle').attr('class', 'ec').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r).style('mix-blend-mode', 'multiply'); cs.each(function (d) { const st = stateStyle(d.s.state || 'actual', id, T), c = col(T, d.s.color, d.i); d3.select(this).attr('fill', c).attr('fill-opacity', isSoft(d.s.state) ? .22 : .38).attr('stroke', c).attr('stroke-width', 2.2).attr('stroke-dasharray', st.dash); });
    interactive(cs, d => ({ title: d.s.label, value: `${num(d.s.size, f.dec)} ${f.unit || ''}`, state: d.s.state, src: d.s.src, detail: d.s.note }), T);
    const cen = [d3.mean(P, d => d.x), d3.mean(P, d => d.y)]; P.forEach(d => { const vx = d.x - cen[0], vy = d.y - cen[1], L = Math.hypot(vx, vy) || 1, ux = S.length === 1 ? 0 : vx / L, uy = S.length === 1 ? -1 : vy / L; txt(F.g, d.x + ux * d.r * .45, d.y + uy * d.r * .45 - 4, d.s.label, { a: 'middle', f: font(800, comp ? 11.5 : 13.5), c: T.ink, halo: T.bg }); txt(F.g, d.x + ux * d.r * .45, d.y + uy * d.r * .45 + 12, num(d.s.size, f.dec) + ' ' + (f.unit || ''), { a: 'middle', f: font(600, 11, MONO), c: T.mid, halo: T.bg }); });
    (f.overlaps || []).forEach(o => { const a = P.find(p => p.s.id === o.sets[0]), b = P.find(p => p.s.id === o.sets[1]); if (!a || !b || !o.size) return; const d = Math.hypot(a.x - b.x, a.y - b.y), t = (a.r * a.r - b.r * b.r + d * d) / (2 * d), mx = a.x + (b.x - a.x) * (t / d + (a.r + b.r - d) / 2 / d * 0), my = a.y + (b.y - a.y) * (t / d); const lx = a.x + (b.x - a.x) / d * ((a.r + (d - b.r)) / 2), ly = a.y + (b.y - a.y) / d * ((a.r + (d - b.r)) / 2); txt(F.g, lx + (S.length > 2 ? (lx - cen[0]) * .0 : 0), ly + 4, num(o.size, f.dec), { a: 'middle', f: font(800, 12, MONO), c: T.neg, halo: T.bg }); });
    if (f.triple != null && S.length > 2) txt(F.g, cen[0], cen[1] + 4, 'tous : ' + num(f.triple, f.dec), { a: 'middle', f: font(800, 11, MONO), c: T.ink, halo: T.bg }); legend(el, statesOf(S));
  }
  REG('euler', euler, (f, r) => r(['Ensemble', 'Taille', 'État', 'Source'], f.sets.map(s => [s.label, num(s.size, 2), SL(s.state), s.src || ''])));

  /* ============================== CYCLEPLOT — chaque saison a son petit graphique ============================== */
  function cycleplot(el, f, T) {
    const id = uid(), comp = isNarrow(el), Cy = f.cycles, Ys = f.years, V = f.values, n = Cy.length, F = frame(el, id, comp ? 260 : 320, { l: comp ? 38 : 50, t: 18, r: 8, b: comp ? 58 : 44 }); addPatterns(F.defs, id, T);
    const all = V.flat(), Y = d3.scaleLinear([Math.min(f.zero ? 0 : d3.min(all), d3.min(all)), d3.max(all)], [F.ih, 0]).nice(), pw = F.iw / n, X = d3.scaleLinear([0, Ys.length - 1], [3, pw - 3]); yAxisLeft(F, Y, T);
    Cy.forEach((c, ci) => { const x0 = ci * pw, vals = V.map(r => r[ci]), mean = d3.mean(vals); if (ci % 2 === 0) F.g.append('rect').attr('x', x0).attr('width', pw).attr('y', 0).attr('height', F.ih).attr('fill', T.line).attr('fill-opacity', .2);
      F.g.append('line').attr('x1', x0 + 2).attr('x2', x0 + pw - 2).attr('y1', Y(mean)).attr('y2', Y(mean)).attr('stroke', T.neg).attr('stroke-dasharray', '3 2').attr('stroke-width', 1.5); F.g.append('path').attr('d', d3.line().x((v, i) => x0 + X(i)).y(v => Y(v))(vals)).attr('fill', 'none').attr('stroke', T.c1).attr('stroke-width', 2);
      const dots = F.g.selectAll(null).data(vals.map((v, i) => ({ v, i, c, state: (f.states || [])[i] || 'actual' }))).join('circle').attr('cx', d => x0 + X(d.i)).attr('cy', d => Y(d.v)).attr('r', (d, i) => i === Ys.length - 1 ? 4 : 2.8); paint(dots, T, id, d => d.state, (d, i) => i === Ys.length - 1 ? T.neg : T.c1); interactive(dots, d => ({ title: `${d.c} · ${Ys[d.i]}`, value: `${num(d.v, f.dec)} ${f.unit || ''} (moyenne du cycle ${num(mean, f.dec)})`, state: d.state, src: f.src }), T); txt(F.g, x0 + pw / 2, F.ih + 16, c, { a: 'middle', f: font(700, comp ? 9.5 : 11.5), c: T.ink }); });
    wrapLines(`${Ys[0]} → ${Ys[Ys.length - 1]} dans chaque case · tiret rouge = moyenne du cycle · point rouge = dernière année`, F.iw, 10.5, 500).forEach((ln, k) => txt(F.g, 0, F.ih + 34 + k * 13, ln, { f: font(500, 10.5), c: T.mid })); legend(el, [...(f.states || ['actual']), 'actual']);
  }
  REG('cycleplot', cycleplot, (f, r) => r(['Année', ...f.cycles, 'Source'], f.years.map((y, i) => [y, ...f.values[i].map(v => num(v, 2)), f.src || ''])));

  /* ============================== SPIRALHEAT — le temps en spirale ============================== */
  function spiralheat(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.map((d, i) => ({ ...d, i, t: new Date(d.date + (d.date.length === 7 ? '-01' : '')) })), W = el.clientWidth || 640, S = Math.min(W - 8, comp ? 360 : 520), F = frame(el, id, S + 54, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const turns = Math.ceil(D.length / 12), R = S / 2 - 22, r0 = R * .22, dr = (R - r0) / (turns + .02), g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 4})`), vals = D.map(d => d.value), cs = d3.scaleSequential(t => seq(T, t)).domain([d3.min(vals), d3.max(vals)]), month0 = D[0].t.getMonth(), rad = u => r0 + u * dr, ang = u => -Math.PI / 2 + (((u % 12) + 12) % 12) / 12 * 2 * Math.PI, P = (u, w) => [Math.cos(ang(u)) * rad(u / 12 + w), Math.sin(ang(u)) * rad(u / 12 + w)];
    const cell = d => { const u0 = d.i + month0, u1 = u0 + .96, pts = [], N = 6; for (let k = 0; k <= N; k++) pts.push(P(u0 + (u1 - u0) * k / N, 0)); for (let k = N; k >= 0; k--) pts.push(P(u0 + (u1 - u0) * k / N, .94)); return 'M' + pts.map(p => p.join(',')).join('L') + 'Z'; };
    const cells = g.selectAll('path').data(D).join('path').attr('d', cell).attr('fill', d => cs(d.value)).attr('stroke', T.bg).attr('stroke-width', .8); interactive(cells, d => ({ title: d3.timeFormat('%B %Y')(d.t), value: `${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
    g.selectAll('path.ov').data(D.filter(d => isSoft(d.state))).join('path').attr('class', 'ov').attr('d', cell).attr('fill', d => `url(#${id}-${d.state})`).attr('fill-opacity', .6).style('pointer-events', 'none');
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].forEach((m, i) => { const a = -Math.PI / 2 + (i + .5) / 12 * 2 * Math.PI; txt(g, Math.cos(a) * (R + 14), Math.sin(a) * (R + 14) + 4, m, { a: 'middle', f: font(700, 10.5), c: T.mid }); g.append('line').attr('x1', Math.cos(a - Math.PI / 12) * (r0 - 4)).attr('y1', Math.sin(a - Math.PI / 12) * (r0 - 4)).attr('x2', Math.cos(a - Math.PI / 12) * (R + 4)).attr('y2', Math.sin(a - Math.PI / 12) * (R + 4)).attr('stroke', T.line).attr('stroke-opacity', .6).style('pointer-events', 'none'); });
    txt(g, 0, -2, D[0].t.getFullYear() + '', { a: 'middle', f: font(800, 14, MONO), c: T.ink }); txt(g, 0, 14, '→ ' + D[D.length - 1].t.getFullYear(), { a: 'middle', f: font(700, 12, MONO), c: T.mid });
    const lw = Math.min(260, F.iw - 20), ly = S + 24, gid = id + 'sg', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .25).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', seq(T, t))); F.g.append('rect').attr('x', (F.iw - lw) / 2).attr('y', ly).attr('width', lw).attr('height', 9).attr('rx', 4).attr('fill', `url(#${gid})`);
    txt(F.g, (F.iw - lw) / 2, ly + 22, num(d3.min(vals), f.dec), { f: font(600, 10.5, MONO), c: T.mid }); txt(F.g, (F.iw + lw) / 2, ly + 22, num(d3.max(vals), f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(600, 10.5, MONO), c: T.mid }); legend(el, statesOf(D));
  }
  REG('spiralheat', spiralheat, tableOf(['Mois', 'Valeur', 'État', 'Source'], d => [d.date, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== HIVEPLOT — réseau sur axes radiaux ============================== */
  function hiveplot(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W, comp ? 380 : 560), R = S / 2 - (comp ? 56 : 80), r0 = R * .14, A = f.axes, ang = i => -Math.PI / 2 + i * 2 * Math.PI / A.length, F = frame(el, id, S + 10, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T); const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 6})`);
    const byA = i => f.nodes.filter(n => n.axis === A[i].id), nodes = f.nodes.map(n => ({ ...n })), by = Object.fromEntries(nodes.map(n => [n.id, n]));
    A.forEach((a, i) => { const ns = nodes.filter(n => n.axis === a.id), sc = d3.scaleLinear(d3.extent(ns, n => n.pos != null ? n.pos : n.value).concat([]).length ? [Math.min(0, d3.min(ns, n => n.pos != null ? n.pos : n.value)), d3.max(ns, n => n.pos != null ? n.pos : n.value)] : [0, 1], [r0, R]); ns.forEach(n => { n.a = ang(i); n.r = sc(n.pos != null ? n.pos : n.value); }); });
    A.forEach((a, i) => { const t = ang(i); g.append('line').attr('x1', Math.cos(t) * r0).attr('y1', Math.sin(t) * r0).attr('x2', Math.cos(t) * R).attr('y2', Math.sin(t) * R).attr('stroke', T.ink).attr('stroke-width', 2.4); const lp = [Math.cos(t) * (R + 16), Math.sin(t) * (R + 16)]; txt(g, lp[0] + Math.cos(t) * 14, lp[1] + 4 + Math.sin(t) * 12, a.label, { a: Math.cos(t) > .3 ? 'start' : Math.cos(t) < -.3 ? 'end' : 'middle', f: font(800, comp ? 11 : 13), c: T.ink }); });
    const wv = d3.scaleSqrt([0, d3.max(f.links, l => l.v) || 1], [1, 6]), P = (a, r) => [Math.cos(a) * r, Math.sin(a) * r], link = l => { const s = by[l.s], t = by[l.t], sa = s.a, ta = t.a; let da = ta - sa; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; if (Math.abs(da) < 1e-6) { const p = P(sa, s.r), q = P(ta, t.r), c = P(sa + .5, (s.r + t.r) / 2); return `M${p}Q${c} ${q}`; } const p = P(sa, s.r), q = P(ta, t.r), c1 = P(sa + da * .3, s.r * .98), c2 = P(sa + da * .7, t.r * .98); return `M${p}C${c1} ${c2} ${q}`; };
    const links = g.append('g').attr('fill', 'none').selectAll('path').data(f.links).join('path').attr('d', link).attr('stroke', l => col(T, null, A.findIndex(a => a.id === by[l.s].axis))).attr('stroke-width', l => wv(l.v)).attr('stroke-opacity', .5).attr('stroke-linecap', 'round').each(function (l) { const st = stateStyle(l.state || 'actual', id, T); if (st.dash) d3.select(this).attr('stroke-dasharray', st.dash); });
    interactive(links, l => ({ title: `${by[l.s].label} → ${by[l.t].label}`, value: `${num(l.v, f.dec)} ${f.unit || ''}`, state: l.state, src: l.src, detail: l.note }), T);
    const dots = g.append('g').selectAll('circle').data(nodes).join('circle').attr('cx', n => P(n.a, n.r)[0]).attr('cy', n => P(n.a, n.r)[1]).attr('r', 5.5).attr('fill', n => col(T, null, A.findIndex(a => a.id === n.axis))).attr('stroke', T.bg).attr('stroke-width', 1.6); interactive(dots, n => ({ title: n.label, value: `${A.find(a => a.id === n.axis).label} · ${num(n.value, f.dec)} ${f.unit || ''}`, src: n.src }), T);
    hl(links, dots, (n, l) => l.s === n.id || l.t === n.id); if (nodes.length <= (comp ? 12 : 22)) nodes.forEach(n => { const p = P(n.a, n.r), side = Math.cos(n.a) >= 0 ? 1 : -1; txt(g, p[0] + (Math.abs(Math.cos(n.a)) < .3 ? 8 : side * 8), p[1] + 3.5, trunc(n.label, comp ? 11 : 18), { a: Math.abs(Math.cos(n.a)) < .3 ? 'start' : side > 0 ? 'start' : 'end', f: font(600, comp ? 9.5 : 10.5), c: T.ink, halo: T.bg }); });
    legend(el, statesOf(f.links));
  }
  REG('hiveplot', hiveplot, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.links.map(l => [f.nodes.find(n => n.id === l.s).label, f.nodes.find(n => n.id === l.t).label, num(l.v, 2), l.src || ''])));

  /* ============================== DOUBLEWATERFALL — deux ponts, une échelle ============================== */
  function doublewaterfall(el, f, T) {
    const id = uid(), comp = isNarrow(el), P = f.panels, cols = comp ? 1 : P.length, ph = comp ? 250 : 340, F = frame(el, id, (comp ? P.length : 1) * ph + 40, { l: comp ? 40 : 54, t: 26, r: 10, b: 34 }); addPatterns(F.defs, id, T);
    const ends = P.map(p => { let v = p.start.value; const rows = [{ label: p.start.label, a: 0, b: v, tot: true, state: p.start.state || 'actual', src: p.start.src }]; p.steps.forEach(s => { rows.push({ label: s.label, a: v, b: v + s.value, d: s.value, state: s.state, src: s.src, note: s.note }); v += s.value; }); rows.push({ label: p.end ? p.end.label : 'Total', a: 0, b: v, tot: true, state: (p.end && p.end.state) || 'derived', src: p.end && p.end.src }); return { rows, end: v }; });
    const all = ends.flatMap(e => e.rows.flatMap(r => [r.a, r.b])), Y = d3.scaleLinear([Math.min(0, d3.min(all)), d3.max(all) * 1.08], [ph - 74, 0]).nice(), pw = (F.iw - (cols - 1) * 22) / cols;
    P.forEach((p, pi) => { const ox = (comp ? 0 : pi * (pw + 22)), oy = comp ? pi * ph : 0, g = F.g.append('g').attr('transform', `translate(${ox},${oy})`), rows = ends[pi].rows, X = d3.scaleBand(rows.map((r, i) => i), [0, pw]).padding(.22);
      txt(g, 0, -10, p.title, { f: font(800, 12.5), c: T.ink }); g.append('g').call(d3.axisLeft(Y).ticks(4).tickSize(-pw).tickSizeOuter(0)).call(a => { axisStyle(a, T); a.selectAll('line').attr('stroke-opacity', .35); }); if (!comp || pi >= 0) null;
      rows.forEach((r, i) => { const lo = Math.min(r.a, r.b), hi = Math.max(r.a, r.b), rect = g.append('rect').datum(r).attr('x', X(i)).attr('width', X.bandwidth()).attr('y', Y(hi)).attr('height', Math.max(1.5, Y(lo) - Y(hi))).attr('rx', 1.5); paint(rect, T, id, d => d.state, d => d.tot ? T.ink : (d.d >= 0 ? T.c2 : T.neg)); interactive(rect, d => ({ title: d.label, value: d.tot ? `${num(d.b, f.dec)} ${f.unit || ''}` : `${d.d >= 0 ? '+' : ''}${num(d.d, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
        txt(g, X(i) + X.bandwidth() / 2, Y(hi) - 5, r.tot ? num(r.b, f.dec) : (r.d >= 0 ? '+' : '') + num(r.d, f.dec), { a: 'middle', f: font(700, 10.5, MONO), c: T.ink, halo: T.bg }); const t = g.append('text').attr('transform', `translate(${X(i) + X.bandwidth() / 2},${ph - 66}) rotate(${comp ? -35 : -30})`).attr('text-anchor', 'end').attr('fill', T.ink).style('font', font(600, comp ? 9.5 : 10.5)).text(trunc(r.label, comp ? 14 : 16)); if (i < rows.length - 1) g.append('line').attr('x1', X(i) + X.bandwidth()).attr('x2', X(i + 1)).attr('y1', Y(r.b)).attr('y2', Y(r.b)).attr('stroke', T.mid).attr('stroke-dasharray', '2 2'); }); });
    if (P.length === 2) { const dlt = ends[1].end - ends[0].end; txt(F.g, F.iw, -10, `Écart entre les totaux : ${dlt >= 0 ? '+' : ''}${num(dlt, f.dec)} ${f.unit || ''}`, { a: 'end', f: font(800, comp ? 11 : 12.5, MONO), c: dlt >= 0 ? T.c2 : T.neg }); } legend(el, ends.flatMap(e => e.rows.map(r => r.state || 'actual')));
  }
  REG('doublewaterfall', doublewaterfall, (f, r) => r(['Panneau', 'Étape', 'Valeur', 'Source'], f.panels.flatMap(p => [[p.title, p.start.label, num(p.start.value, 2), p.start.src || '']].concat(p.steps.map(s => [p.title, s.label, num(s.value, 2), s.src || ''])))));

  /* ============================== LEXIS — cohortes dans le plan temps × âge ============================== */
  function lexis(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, now = f.now, F = frame(el, id, comp ? 380 : 440, { l: comp ? 40 : 52, t: 14, r: comp ? 70 : 110, b: 40 }); addPatterns(F.defs, id, T);
    const t0 = f.from != null ? f.from : d3.min(D, d => d.birth), t1 = f.to != null ? f.to : (now != null ? now : d3.max(D, d => d.end)), X = d3.scaleLinear([t0, t1], [0, F.iw]), maxAge = d3.max(D, d => (d.end != null ? d.end : t1) - d.birth), Y = d3.scaleLinear([0, maxAge * 1.05], [F.ih, 0]).nice(); yAxisLeft(F, Y, T); xAxisBottom(F, X, T, comp, 'd');
    for (let b = Math.ceil(t0 / (f.step || 5)) * (f.step || 5) - maxAge; b <= t1; b += f.step || 5) { const a = [X(Math.max(b, t0)), Y(Math.max(b, t0) - b)], z = [X(Math.min(b + Y.domain()[1], t1)), Y(Math.min(b + Y.domain()[1], t1) - b)]; F.g.append('line').attr('x1', a[0]).attr('y1', Math.min(F.ih, a[1])).attr('x2', z[0]).attr('y2', Math.max(0, z[1])).attr('stroke', T.line).attr('stroke-opacity', .7); }
    (f.events || []).forEach(e => { F.g.append('line').attr('x1', X(e.x)).attr('x2', X(e.x)).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.neg).attr('stroke-dasharray', '4 3').attr('stroke-width', 1.5); txt(F.g, X(e.x) + 4, 10, e.label, { f: font(700, 10.5), c: T.neg, halo: T.bg }); });
    D.forEach((d, i) => { const end = d.end != null ? d.end : t1, c = col(T, d.color, i), p0 = [X(d.birth), Y(0)], p1 = [X(end), Y(end - d.birth)], line = F.g.append('line').datum(d).attr('x1', p0[0]).attr('y1', p0[1]).attr('x2', p1[0]).attr('y2', p1[1]).attr('stroke', c).attr('stroke-width', 3).attr('stroke-linecap', 'round').attr('stroke-dasharray', stateStyle(d.state || 'actual', id, T).dash);
      interactive(line, dd => ({ title: dd.label, value: `né en ${dd.birth}` + (dd.end != null ? ` · fin ${dd.end} (durée ${dd.end - dd.birth})` : ` · toujours actif (âge ${num(end - dd.birth, 0)})`), state: dd.state, src: dd.src, detail: dd.note }), T); F.g.append('circle').attr('cx', p0[0]).attr('cy', p0[1]).attr('r', 3.4).attr('fill', c);
      F.g.append('circle').attr('cx', p1[0]).attr('cy', p1[1]).attr('r', 5).attr('fill', d.end != null ? c : T.bg).attr('stroke', c).attr('stroke-width', 2.4).style('pointer-events', 'none'); txt(F.g, p1[0] + 8, p1[1] + 4, d.label, { f: font(700, comp ? 10 : 11.5), c, halo: T.bg }); });
    txt(F.g, F.iw / 2, F.ih + 34, f.xLabel || 'année calendaire', { a: 'middle', f: font(600, 11), c: T.mid }); txt(F.g, -comp ? 34 : -46, -2, f.yLabel || 'âge (années)', { f: font(600, 11), c: T.mid }); legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); const li = document.createElement('li'); li.textContent = 'Chaque trait part de la naissance (âge 0) et monte d’un an par an · cercle plein = terminé, creux = toujours actif'; ul.appendChild(li);
  }
  REG('lexis', lexis, tableOf(['Cohorte', 'Naissance', 'Fin', 'Source'], d => [d.label, d.birth, d.end != null ? d.end : 'en cours', d.src]));

  /* ============================== SPLITFLAP — panneau d'affichage de gare (HTML) ============================== */
  function splitflap(el, f, T) {
    el.innerHTML = ''; if (!document.getElementById('vra-flap-css')) { const st = document.createElement('style'); st.id = 'vra-flap-css'; st.textContent = '.flap{display:inline-block;width:1.15em;height:1.7em;margin:0 .07em;background:var(--vra-ink);color:var(--vra-bg);border-radius:3px;text-align:center;line-height:1.7em;position:relative;font-weight:800;overflow:hidden;box-shadow:0 1px 0 rgba(0,0,0,.25)}.flap:after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:var(--vra-bg);opacity:.35}.flap i{font-style:normal;display:block;animation:flapin .5s both}@keyframes flapin{0%{transform:rotateX(90deg);transform-origin:50% 0}60%{transform:rotateX(-12deg)}100%{transform:rotateX(0)}}@media(prefers-reduced-motion:reduce){.flap i{animation:none}}'; document.head.appendChild(st); }
    const board = document.createElement('div'); board.style.cssText = 'background:color-mix(in srgb,var(--vra-panel) 90%,var(--vra-ink));border:1px solid var(--vra-line);border-radius:6px;padding:.6rem .8rem;max-width:760px'; if (f.title) { const h = document.createElement('div'); h.style.cssText = 'font:800 .78rem var(--vra-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--vra-mid);padding:.1rem 0 .5rem;border-bottom:2px solid var(--vra-ink);margin-bottom:.4rem;display:flex;justify-content:space-between;gap:.5rem'; h.innerHTML = `<span>${escH(f.title)}</span><span>${escH(f.head || '')}</span>`; board.appendChild(h); }
    f.rows.forEach((r, ri) => { const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:.6rem;flex-wrap:wrap;padding:.4rem 0;border-bottom:1px dashed var(--vra-line)'; row.tabIndex = 0; const txtv = String(r.display != null ? r.display : num(r.value, f.dec)), size = (el.clientWidth || 640) < 520 ? '.95rem' : '1.15rem';
      const flaps = [...txtv].map((ch, i) => `<span class="flap" style="font-size:${size};font-family:var(--vra-mono)" aria-hidden="true"><i style="animation-delay:${(ri * 90 + i * 55)}ms">${ch === ' ' ? '&nbsp;' : escH(ch)}</i></span>`).join('');
      row.innerHTML = `<div style="min-width:0;flex:1 1 9rem"><div style="font:700 .92rem var(--vra-sans)">${escH(r.label)}</div>${r.note ? `<div style="font:500 .75rem var(--vra-sans);color:var(--vra-mid)">${escH(r.note)}</div>` : ''}</div><div role="img" aria-label="${escH(r.label)} : ${escH(txtv)} ${escH(r.unit || f.unit || '')}" style="white-space:nowrap">${flaps}<span style="font:700 .8rem var(--vra-mono);color:var(--vra-mid);margin-left:.35rem">${escH(r.unit || f.unit || '')}</span></div><div style="font-size:.75rem;min-width:5.5rem;text-align:right">${srcPill(r.src)} ${chipHtml(r.state)}</div>`; board.appendChild(row); }); el.appendChild(board);
  }
  REG('splitflap', splitflap, (f, r) => r(['Indicateur', 'Valeur', 'État', 'Source'], f.rows.map(x => [x.label, x.display != null ? x.display : num(x.value, 2), SL(x.state), x.src || ''])));

  /* ============================== SUNICICLE — du soleil à l'icicle, en morphing ============================== */
  function sunicicle(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W - 4, comp ? 380 : 560); el.innerHTML = ''; const bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:.5rem;align-items:center;margin:0 0 .4rem;flex-wrap:wrap'; const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ex-btn'; const hint = document.createElement('span'); hint.style.cssText = 'font:500 .8rem var(--vra-sans);color:var(--vra-mid)'; hint.textContent = 'Bascule entre deux lectures du même arbre : rayonnante (soleil) et à plat (icicle).'; bar.append(btn, hint); el.appendChild(bar); const holder = document.createElement('div'); el.appendChild(holder);
    const F = frame(holder, id, S + 6, { l: 0, r: 0, t: 2, b: 2 }); addPatterns(F.defs, id, T); const root = d3.hierarchy(f.root).sum(d => d.children ? 0 : d.value).sort((a, b) => b.value - a.value); d3.partition().size([1, 1])(root); const h = root.height, nodes = root.descendants().filter(n => n.depth > 0), r1 = 1 / (h + 1);
    nodes.forEach(n => { n.u0 = (n.y0 - r1) / (1 - r1); n.u1 = (n.y1 - r1) / (1 - r1); n.top = n.ancestors().find(a => a.depth === 1); }); const tops = root.children.map(c => c.data.label), ox = (F.iw - S) / 2;
    const rin = S * .08, Rr = S / 2 - 2, pol = (x, u) => { const a = -Math.PI / 2 + x * 2 * Math.PI * .9995, r = rin + u * (Rr - rin); return [S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r]; }, cart = (x, u) => [x * S, u * (S - 4) + 2];
    const path = (n, t) => { const N = Math.max(2, Math.ceil((n.x1 - n.x0) * 70)), pts = []; const mix = (x, u) => { const a = cart(x, u), b = pol(x, u); return [a[0] * (1 - t) + b[0] * t, a[1] * (1 - t) + b[1] * t]; }; for (let k = 0; k <= N; k++) pts.push(mix(n.x0 + (n.x1 - n.x0) * k / N, n.u0 + .002)); for (let k = N; k >= 0; k--) pts.push(mix(n.x0 + (n.x1 - n.x0) * k / N, n.u1 - .002)); return 'M' + pts.map(p => p.join(',')).join('L') + 'Z'; };
    const g = F.g.append('g').attr('transform', `translate(${ox},0)`), ps = g.selectAll('path').data(nodes).join('path').attr('d', n => path(n, 1)).attr('stroke', T.bg).attr('stroke-width', 1.2); paint(ps, T, id, n => n.data.state, n => d3.color(col(T, n.top.data.color, tops.indexOf(n.top.data.label))).copy({ opacity: 1 }).brighter((n.depth - 1) * .35).formatHex());
    interactive(ps, n => ({ title: n.ancestors().reverse().slice(1).map(a => a.data.label).join(' › '), value: `${num(n.value, f.dec)} ${f.unit || ''} · ${num(100 * n.value / root.value, 1)} % du total`, state: n.data.state, src: n.data.src, detail: n.data.note }), T);
    const labs = g.append('g').style('pointer-events', 'none'); let mode = 0; const place = () => { labs.selectAll('*').remove(); nodes.forEach(n => { const big = mode ? (n.x1 - n.x0) * S > (comp ? 46 : 62) && (n.u1 - n.u0) * S > 16 : (n.x1 - n.x0) * 2 * Math.PI * (rin + ((n.u0 + n.u1) / 2) * (Rr - rin)) > (comp ? 48 : 64) && (n.u1 - n.u0) * (Rr - rin) > 16; if (!big) return; const c = mode ? cart((n.x0 + n.x1) / 2, (n.u0 + n.u1) / 2) : pol((n.x0 + n.x1) / 2, (n.u0 + n.u1) / 2), bg = d3.color(col(T, n.top.data.color, tops.indexOf(n.top.data.label))).brighter((n.depth - 1) * .35).formatHex(); txt(labs, c[0], c[1] + 4, trunc(n.data.label, comp ? 9 : 14), { a: 'middle', f: font(700, comp ? 9.5 : 10.5), c: ink(T, bg) }); }); };
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, setLabel = () => { btn.textContent = mode ? 'Afficher en soleil ◐' : 'Afficher en icicle ▤'; }; setLabel(); place();
    btn.onclick = () => { const to = 1 - mode; mode = to; labs.selectAll('*').remove(); setLabel(); const done = () => { ps.attr('d', n => path(n, to ? 0 : 1)); place(); }; if (reduce) { ps.attr('d', n => path(n, to ? 0 : 1)); place(); return; } ps.transition().duration(950).ease(d3.easeCubicInOut).attrTween('d', n => t => path(n, to ? 1 - t : t)).on('end', (d, i) => { if (i === 0) place(); }); };
    if (f.start === 'icicle') { mode = 1; ps.attr('d', n => path(n, 0)); setLabel(); place(); }
    legend(holder, nodes.map(n => n.data.state || 'actual'));
  }
  REG('sunicicle', sunicicle, (f, r) => { const rows = []; (function w(n, p) { const q = p.concat(n.label); if (n.children) n.children.forEach(c => w(c, q)); else rows.push([q.join(' › '), num(n.value, 2), SL(n.state), n.src || '']); })(f.root, []); return r(['Chemin', 'Valeur', 'État', 'Source'], rows); });

  /* ============================================================================================
   *  LOT 8 — FORMES ORIGINALES (suite 2) : swimlane · isotype · bubbletimeline · ownership · maturity
   *  bubblematrix · stripes · sourcepyramid · nestedcircles · logtimeline · arrowplot · tally · probwords · bracket · voronoi
   * ============================================================================================ */
  const mark = (F, id, T, c) => { F.defs.append('marker').attr('id', id + 'mk').attr('viewBox', '0 0 8 8').attr('refX', 7).attr('refY', 4).attr('markerUnits', 'userSpaceOnUse').attr('markerWidth', 9).attr('markerHeight', 9).attr('orient', 'auto').append('path').attr('d', 'M0,0L8,4L0,8Z').attr('fill', c || T.ink); return `url(#${id}mk)`; };

  /* ============================== SWIMLANE — qui fait quoi, dans quel ordre ============================== */
  function swimlane(el, f, T) {
    const id = uid(), comp = isNarrow(el), L = f.lanes, St = f.steps, ncol = d3.max(St, s => s.col) + 1, labW = comp ? 58 : 110, laneH = comp ? 84 : 92, F = frame(el, id, L.length * laneH + 8, { l: labW, r: 6, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const cw = F.iw / ncol, bw = cw - (comp ? 8 : 18), bh = comp ? 60 : 56, by = Object.fromEntries(St.map(s => [s.id, s])), ar = mark(F, id, T, T.ink);
    L.forEach((l, i) => { F.g.append('rect').attr('x', -labW).attr('width', F.iw + labW).attr('y', i * laneH).attr('height', laneH).attr('fill', T.line).attr('fill-opacity', i % 2 ? 0 : .22); const t = F.g.append('text').attr('x', -labW + 6).attr('y', i * laneH + laneH / 2).attr('fill', col(T, l.color, i)).style('font', font(800, comp ? 10.5 : 12.5)); wrapLines(l.label, labW - 10, comp ? 10.5 : 12.5, 800).slice(0, 3).forEach((ln, k, a) => t.append('tspan').attr('x', -labW + 6).attr('dy', k === 0 ? (-(a.length - 1) * .55 + .35) + 'em' : '1.1em').text(ln)); });
    const pos = s => ({ x: s.col * cw + (cw - bw) / 2, y: L.findIndex(l => l.id === s.lane) * laneH + (laneH - bh) / 2 });
    (f.flows || []).forEach(fl => { const a = by[fl.s], b = by[fl.t], pa = pos(a), pb = pos(b), x0 = pa.x + bw, y0 = pa.y + bh / 2, x1 = pb.x, y1 = pb.y + bh / 2, mx = (x0 + x1) / 2; const path = a.col === b.col ? `M${pa.x + bw / 2},${pa.y + (pb.y > pa.y ? bh : 0)}L${pb.x + bw / 2},${pb.y + (pb.y > pa.y ? 0 : bh) + (pb.y > pa.y ? -1 : 1)}` : `M${x0},${y0}C${mx},${y0} ${mx},${y1} ${x1 - 1},${y1}`; const p = F.g.append('path').datum(fl).attr('d', path).attr('fill', 'none').attr('stroke', T.ink).attr('stroke-width', 1.6).attr('marker-end', ar).attr('stroke-dasharray', stateStyle(fl.state || 'actual', id, T).dash); interactive(p, d => ({ title: `${a.label} → ${b.label}`, value: d.label || '', state: d.state, src: d.src }), T); });
    St.forEach(s => { const p = pos(s), g = F.g.append('g').datum(s).attr('transform', `translate(${p.x},${p.y})`), lane = L.findIndex(l => l.id === s.lane), c = col(T, L[lane].color, lane), r = g.append('rect').attr('width', bw).attr('height', bh).attr('rx', 5); paint(r, T, id, d => d.state, () => c); r.attr('fill-opacity', isSoft(s.state) ? 1 : .2).attr('stroke-width', 2); const tx = g.append('text').attr('fill', T.ink).style('font', font(700, comp ? 9.5 : 11)).style('pointer-events', 'none'); const ls = wrapLines(s.label, bw - 10, comp ? 9.5 : 11, 700).slice(0, comp ? 4 : 3); ls.forEach((ln, k) => tx.append('tspan').attr('x', bw / 2).attr('text-anchor', 'middle').attr('y', bh / 2 + 4 - (ls.length - 1) * 6.2 + k * 12.4).text(ln)); interactive(g, d => ({ title: d.label, value: L[lane].label + (s.when ? ' · ' + s.when : ''), state: d.state, src: d.src, detail: d.note }), T); });
    legend(el, statesOf(St));
  }
  REG('swimlane', swimlane, (f, r) => r(['Étape', 'Acteur', 'Ordre', 'Source'], f.steps.map(s => [s.label, f.lanes.find(l => l.id === s.lane).label, s.col + 1, s.src || ''])));

  /* ============================== ISOTYPE — une icône = N unités ============================== */
  function isotype(el, f, T) {
    const id = uid(), comp = isNarrow(el), R = f.rows, u = f.unitValue || 1, ic = comp ? 18 : 27, labW = comp ? 92 : 170, valW = comp ? 44 : 70, per = Math.max(4, Math.floor((el.clientWidth - labW - valW - 8) / ic)); const lines = R.map(r => Math.max(1, Math.ceil(Math.round(r.value / u * 2) / 2 / per)));
    const F = frame(el, id, d3.sum(lines, n => n * ic + 14) + 28, { l: labW, r: valW, t: 4, b: 4 }); addPatterns(F.defs, id, T); const glyph = f.glyph || 'person'; let y = 4;
    const draw = (g, x, yy, frac, c, state) => { const cid = id + 'c' + Math.random().toString(36).slice(2, 6), st = stateStyle(state || 'actual', id, T); g.append('clipPath').attr('id', cid).append('rect').attr('x', x).attr('y', yy).attr('width', ic * frac).attr('height', ic); const gg = g.append('g').attr('clip-path', frac < 1 ? `url(#${cid})` : null); const s = ic - 4; const fill = isSoft(state) ? st.fill : c, stroke = c;
      if (glyph === 'square') gg.append('rect').attr('x', x + 2).attr('y', yy + 2).attr('width', s).attr('height', s).attr('rx', 3).attr('fill', fill).attr('stroke', stroke).attr('stroke-dasharray', st.dash); else if (glyph === 'dot') gg.append('circle').attr('cx', x + ic / 2).attr('cy', yy + ic / 2).attr('r', s / 2).attr('fill', fill).attr('stroke', stroke).attr('stroke-dasharray', st.dash); else { gg.append('circle').attr('cx', x + ic / 2).attr('cy', yy + 4.5).attr('r', 3.6).attr('fill', fill).attr('stroke', stroke).attr('stroke-dasharray', st.dash); gg.append('path').attr('d', `M${x + 3.5},${yy + ic - 1}v-5.5a${ic / 2 - 3.5},5 0 0 1 ${ic - 7},0v5.5z`).attr('fill', fill).attr('stroke', stroke).attr('stroke-dasharray', st.dash); } if (frac < 1) g.append('rect').attr('x', x + ic * frac).attr('y', yy + 1).attr('width', ic * (1 - frac)).attr('height', ic - 2).attr('fill', c).attr('fill-opacity', .08).attr('rx', 2); };
    R.forEach((r, ri) => { const n = r.value / u, full = Math.floor(n), part = n - full, c = col(T, r.color, ri), g = F.g.append('g').datum(r), h = lines[ri] * ic; rowLabel(g, r.label, y + Math.min(h, ic * 2) / 2, labW, T, comp ? 11 : 12.5, 700); for (let k = 0; k < full + (part > .1 ? 1 : 0); k++) draw(g, (k % per) * ic, y + Math.floor(k / per) * ic, k < full ? 1 : part, c, r.state); const hit = g.insert('rect', ':first-child').attr('x', 0).attr('y', y).attr('width', per * ic).attr('height', h).attr('fill', 'transparent'); interactive(hit, () => ({ title: r.label, value: `${num(r.value, f.dec)} ${f.unit || ''} ≈ ${num(n, 1)} icônes`, state: r.state, src: r.src, detail: r.note }), T); txt(F.g, Math.min(per, Math.round(n + .49)) * ic + 10, y + ic * .75, num(r.value, f.dec), { f: font(800, comp ? 12 : 14, MONO), c: T.ink }); y += h + 14; });
    txt(F.g, 0, y + 6, `1 icône = ${num(u, u < 1 ? 2 : 0)} ${f.unit || ''}${f.unitNote ? ' · ' + f.unitNote : ''}`, { f: font(600, 11), c: T.mid }); legend(el, statesOf(R));
  }
  REG('isotype', isotype, (f, r) => r(['Ligne', 'Valeur', 'État', 'Source'], f.rows.map(x => [x.label, num(x.value, 2), SL(x.state), x.src || ''])));

  /* ============================== BUBBLETIMELINE — événements pesés, par couloir ============================== */
  function bubbletimeline(el, f, T) {
    const id = uid(), comp = isNarrow(el), L = f.lanes, D = f.items.map(d => ({ ...d, t: new Date(d.date) })), labW = comp ? 70 : 130, laneH = comp ? 74 : 86, F = frame(el, id, L.length * laneH + 34, { l: labW, r: 14, t: 4, b: 30 }); addPatterns(F.defs, id, T);
    const X = d3.scaleTime([new Date(f.from || d3.min(D, d => d.t)), new Date(f.to || d3.max(D, d => d.t))], [10, F.iw - 10]).nice(), R = d3.scaleSqrt([0, d3.max(D, d => d.value)], [4, laneH * .42]); axisStyle(F.g.append('g').attr('transform', `translate(0,${L.length * laneH})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickFormat(d3.timeFormat(comp ? '%y' : '%b %Y')).tickSizeOuter(0)), T);
    L.forEach((l, i) => { F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', i * laneH + laneH / 2).attr('y2', i * laneH + laneH / 2).attr('stroke', T.line); rowLabel(F.g, l.label, i * laneH + laneH / 2, labW, T, comp ? 11 : 12.5, 700); const ds = D.filter(d => d.lane === l.id).sort((a, b) => b.value - a.value); ds.forEach(d => { d.x = X(d.t); d.y = i * laneH + laneH / 2; d.r = R(d.value); });
      const sim = d3.forceSimulation(ds).force('x', d3.forceX(d => d.x).strength(1)).force('y', d3.forceY(i * laneH + laneH / 2).strength(.08)).force('c', d3.forceCollide(d => d.r + 1)).stop(); for (let k = 0; k < 120; k++) sim.tick(); ds.forEach(d => { d.y = Math.max(i * laneH + d.r, Math.min((i + 1) * laneH - d.r, d.y)); }); });
    const cs = F.g.selectAll('circle.bt').data(D).join('circle').attr('class', 'bt').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r); paint(cs, T, id, d => d.state, d => col(T, (L.find(l => l.id === d.lane) || {}).color, L.findIndex(l => l.id === d.lane))); cs.attr('stroke', T.bg).attr('stroke-width', 1.4).attr('fill-opacity', d => isSoft(d.state) ? 1 : .8);
    interactive(cs, d => ({ title: d.label, value: `${d3.timeFormat('%d %b %Y')(d.t)} · ${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T); D.forEach(d => { if (d.r > (comp ? 16 : 20)) txt(F.g, d.x, d.y + 4, d.short || trunc(d.label, 9), { a: 'middle', f: font(700, 10), c: ink(T, d3.color(col(T, (L.find(l => l.id === d.lane) || {}).color, L.findIndex(l => l.id === d.lane))).formatHex()) }); else if (D.length <= 14) txt(F.g, d.x, d.y - d.r - 4, trunc(d.label, comp ? 10 : 18), { a: 'middle', f: font(600, 10), c: T.ink, halo: T.bg }); }); legend(el, statesOf(D));
  }
  REG('bubbletimeline', bubbletimeline, tableOf(['Événement', 'Date', 'Valeur', 'Source'], d => [d.label, d.date, num(d.value, 2), d.src], 'items'));

  /* ============================== OWNERSHIP — qui détient qui ============================== */
  function ownership(el, f, T) {
    const id = uid(), comp = isNarrow(el), N = f.nodes.map(n => ({ ...n })), by = Object.fromEntries(N.map(n => [n.id, n])), E = f.stakes.map(e => ({ ...e, o: by[e.from], t: by[e.to] })); N.forEach(n => n.layer = 0); for (let k = 0; k < N.length; k++) E.forEach(e => { e.t.layer = Math.max(e.t.layer, e.o.layer + 1); });
    const nl = d3.max(N, n => n.layer) + 1, rows = d3.range(nl).map(l => N.filter(n => n.layer === l)), bw = comp ? 80 : 128, bh = comp ? 42 : 46, vg = comp ? 74 : 88, F = frame(el, id, nl * vg + 6, { l: 4, r: 4, t: 6, b: 6 }); addPatterns(F.defs, id, T);
    rows.forEach((r, li) => r.forEach((n, i) => { n.x = F.iw * (i + .5) / r.length; n.y = li * vg + bh / 2; })); const wv = d3.scaleLinear([0, 100], [1.2, 9]);
    const links = F.g.append('g').attr('fill', 'none').selectAll('path').data(E).join('path').attr('d', e => { const y0 = e.o.y + bh / 2, y1 = e.t.y - bh / 2, my = (y0 + y1) / 2; return `M${e.o.x},${y0}C${e.o.x},${my} ${e.t.x},${my} ${e.t.x},${y1}`; }).attr('stroke', T.c1).attr('stroke-opacity', .55).attr('stroke-width', e => wv(e.pct)).attr('stroke-dasharray', e => stateStyle(e.state || 'actual', id, T).dash); interactive(links, e => ({ title: `${e.o.label} détient ${e.t.label}`, value: `${num(e.pct, 0)} % du capital` + (e.votes != null ? ` · ${num(e.votes, 0)} % des votes` : ''), state: e.state, src: e.src, detail: e.note }), T);
    E.forEach(e => { const y0 = e.o.y + bh / 2, y1 = e.t.y - bh / 2, my0 = (y0 + y1) / 2, tt = .3, bz = (a, b, c, d) => (1 - tt) ** 3 * a + 3 * (1 - tt) ** 2 * tt * b + 3 * (1 - tt) * tt * tt * c + tt ** 3 * d, mx = bz(e.o.x, e.o.x, e.t.x, e.t.x), my = bz(y0, my0, my0, y1); const g = F.g.append('g'); const lab = `${num(e.pct, 0)} %` + (!comp && e.votes != null && e.votes !== e.pct ? ` · ${num(e.votes, 0)} v.` : ''); const w = measure(lab, 10.5, 800) + 8; g.append('rect').attr('x', mx - w / 2).attr('y', my - 9).attr('width', w).attr('height', 17).attr('rx', 8).attr('fill', T.bg).attr('stroke', T.c1).attr('stroke-width', 1.2); txt(g, mx, my + 4, lab, { a: 'middle', f: font(800, 10.5, MONO), c: T.ink }); });
    const nodes = F.g.selectAll('g.on').data(N).join('g').attr('class', 'on').attr('transform', n => `translate(${n.x - bw / 2},${n.y - bh / 2})`), rc = nodes.append('rect').attr('width', bw).attr('height', bh).attr('rx', 6); paint(rc, T, id, n => n.state, n => n.kind === 'person' ? T.c4 : n.kind === 'public' ? T.c5 : T.c1); rc.attr('fill-opacity', n => isSoft(n.state) ? 1 : .18).attr('stroke-width', 2);
    nodes.each(function (n) { const t = d3.select(this).append('text').attr('fill', T.ink).style('font', font(700, comp ? 10 : 11.5)).style('pointer-events', 'none'); const ls = wrapLines(n.label, bw - 8, comp ? 10 : 11.5, 700).slice(0, 2); ls.forEach((ln, k) => t.append('tspan').attr('x', bw / 2).attr('text-anchor', 'middle').attr('y', bh / 2 + 4 - (ls.length - 1) * 6.5 + k * 13).text(ln)); }); interactive(nodes, n => ({ title: n.label, value: n.note || '', state: n.state, src: n.src }), T); hl(links, nodes, (n, e) => e.o === n || e.t === n); legend(el, statesOf(N));
  }
  REG('ownership', ownership, (f, r) => r(['Détenteur', 'Détenu', '% capital', 'Source'], f.stakes.map(e => [f.nodes.find(n => n.id === e.from).label, f.nodes.find(n => n.id === e.to).label, num(e.pct, 0), e.src || ''])));

  /* ============================== MATURITY — échelle de maturité ============================== */
  function maturity(el, f, T) {
    const id = uid(), comp = isNarrow(el), Lv = f.levels, I = f.items, labW = comp ? 92 : 170, rowH = comp ? 36 : 40, topH = comp ? 58 : 50, F = frame(el, id, I.length * rowH + topH + 10, { l: labW, r: 6, t: 4, b: 6 }); addPatterns(F.defs, id, T);
    const cw = F.iw / Lv.length; Lv.forEach((l, i) => { const x = i * cw + cw / 2, t = F.g.append('text').attr('x', x).attr('y', 14).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', font(700, comp ? 9.5 : 11)); wrapLines(l, cw - 4, comp ? 9.5 : 11, 700).slice(0, 3).forEach((ln, k) => t.append('tspan').attr('x', x).attr('dy', k ? '1.1em' : 0).text(ln)); txt(F.g, x, topH - 8, i, { a: 'middle', f: font(800, 11, MONO), c: T.lo }); });
    I.forEach((it, ri) => { const y = topH + ri * rowH; rowLabel(F.g, it.label, y + rowH / 2 - 2, labW, T, comp ? 11 : 12.5, 700); Lv.forEach((l, i) => { const cur = i <= it.level, tg = it.target != null && i <= it.target && i > it.level, r = F.g.append('rect').datum({ it, i }).attr('x', i * cw + 2).attr('y', y + 4).attr('width', cw - 4).attr('height', rowH - 10).attr('rx', 4); if (cur) { paint(r, T, id, d => d.it.state, () => col(T, it.color, ri)); r.attr('fill-opacity', isSoft(it.state) ? 1 : .55 + .45 * (i / Math.max(1, Lv.length - 1))); } else if (tg) r.attr('fill', `url(#${id}-forecast)`).attr('stroke', T.c3).attr('stroke-dasharray', '4 3').attr('stroke-width', 1.4); else r.attr('fill', T.line).attr('fill-opacity', .35); }); const dot = F.g.append('g').datum(it).attr('transform', `translate(${it.level * cw + cw - 10},${y + rowH / 2 - 1})`); dot.append('circle').attr('r', 5.5).attr('fill', T.bg).attr('stroke', T.ink).attr('stroke-width', 2); interactive(dot, d => ({ title: d.label, value: `niveau ${d.level} : ${Lv[d.level]}` + (d.target != null ? ` → cible ${d.target} : ${Lv[d.target]}` : ''), state: d.state, src: d.src, detail: d.note }), T); });
    legend(el, statesOf(I)); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = 'Plein = niveau atteint · hachuré = cible annoncée · cercle = position actuelle'; ul.appendChild(li);
  }
  REG('maturity', maturity, (f, r) => r(['Élément', 'Niveau', 'Cible', 'Source'], f.items.map(i => [i.label, f.levels[i.level], i.target != null ? f.levels[i.target] : '', i.src || ''])));

  /* ============================== BUBBLEMATRIX — punchcard ============================== */
  function bubblematrix(el, f, T) {
    const id = uid(), comp = isNarrow(el), Xs = f.x, Ys = f.y, labW = comp ? 80 : 130, cw = Math.min(70, ((el.clientWidth || 640) - labW - 54) / Xs.length), rowH = Math.max(comp ? 34 : 38, cw * .8), F = frame(el, id, Ys.length * rowH + 62, { l: labW, r: 46, t: 34, b: 6 }); addPatterns(F.defs, id, T);
    const R = d3.scaleSqrt([0, d3.max(f.data, d => d.value)], [2, Math.min(rowH, cw) / 2 - 1.5]); Xs.forEach((x, i) => { const t = F.g.append('text').attr('x', i * cw + cw / 2).attr('y', -10).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', font(700, comp ? 10 : 11.5)).text(trunc(x, comp ? 7 : 10)); F.g.append('line').attr('x1', i * cw + cw / 2).attr('x2', i * cw + cw / 2).attr('y1', 0).attr('y2', Ys.length * rowH).attr('stroke', T.line).attr('stroke-opacity', .5); });
    Ys.forEach((y, j) => { rowLabel(F.g, y, j * rowH + rowH / 2, labW, T, comp ? 11 : 12.5, 700); F.g.append('line').attr('x1', 0).attr('x2', Xs.length * cw).attr('y1', j * rowH + rowH / 2).attr('y2', j * rowH + rowH / 2).attr('stroke', T.line).attr('stroke-opacity', .5); txt(F.g, Xs.length * cw + 8, j * rowH + rowH / 2 + 4, num(d3.sum(f.data.filter(d => d.y === y), d => d.value), f.dec), { f: font(700, 10.5, MONO), c: T.mid }); }); txt(F.g, Xs.length * cw + 8, -10, 'Σ', { f: font(700, 11), c: T.mid });
    const cs = F.g.selectAll('circle.bm').data(f.data).join('circle').attr('class', 'bm').attr('cx', d => Xs.indexOf(d.x) * cw + cw / 2).attr('cy', d => Ys.indexOf(d.y) * rowH + rowH / 2).attr('r', d => R(d.value)); paint(cs, T, id, d => d.state, d => d.value >= d3.quantile(f.data.map(q => q.value).sort(d3.ascending), .85) ? T.neg : T.c1); interactive(cs, d => ({ title: `${d.y} · ${d.x}`, value: `${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T); legend(el, statesOf(f.data));
  }
  REG('bubblematrix', bubblematrix, tableOf(['Ligne', 'Colonne', 'Valeur', 'Source'], d => [d.y, d.x, num(d.value, 2), d.src]));

  /* ============================== STRIPES — codes-barres de couleur ============================== */
  function stripes(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, F = frame(el, id, comp ? 210 : 260, { l: 0, r: 0, t: 30, b: 56 }); addPatterns(F.defs, id, T); const base = f.baseline != null ? f.baseline : d3.mean(D, d => d.value), mx = d3.max(D, d => Math.abs(d.value - base)) || 1, cs = v => { const t = (v - base) / mx; return t >= 0 ? d3.interpolateRgb(T.bg, T.neg)(Math.min(1, .15 + .85 * t)) : d3.interpolateRgb(T.bg, T.c1)(Math.min(1, .15 + .85 * -t)); }, w = F.iw / D.length;
    const r = F.g.selectAll('rect.st').data(D).join('rect').attr('class', 'st').attr('x', (d, i) => i * w).attr('width', w + .6).attr('y', 0).attr('height', F.ih).attr('fill', d => cs(d.value)); interactive(r, d => ({ title: d.label, value: `${num(d.value, f.dec)} ${f.unit || ''} (${d.value >= base ? '+' : ''}${num(d.value - base, f.dec)} vs référence)`, state: d.state, src: d.src, detail: d.note }), T);
    F.g.selectAll('rect.ov').data(D.filter(d => isSoft(d.state))).join('rect').attr('class', 'ov').attr('x', d => D.indexOf(d) * w).attr('width', w + .6).attr('y', 0).attr('height', F.ih).attr('fill', d => `url(#${id}-${d.state})`).attr('fill-opacity', .55).style('pointer-events', 'none');
    const step = Math.max(1, Math.ceil(D.length / (comp ? 5 : 9))); D.forEach((d, i) => { if (i % step === 0 || i === D.length - 1) txt(F.g, Math.min(F.iw, Math.max(0, i * w + w / 2)), F.ih + 16, d.label, { a: i === 0 ? 'start' : i === D.length - 1 ? 'end' : 'middle', f: font(600, 10.5, MONO), c: T.mid }); });
    const lw = Math.min(280, F.iw - 20), gid = id + 'gr', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .1).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', cs(base + (t * 2 - 1) * mx))); F.g.append('rect').attr('x', (F.iw - lw) / 2).attr('y', F.ih + 28).attr('width', lw).attr('height', 9).attr('rx', 4).attr('fill', `url(#${gid})`); txt(F.g, (F.iw - lw) / 2, F.ih + 52, num(base - mx, f.dec), { f: font(600, 10.5, MONO), c: T.mid }); txt(F.g, F.iw / 2, F.ih + 52, 'référence ' + num(base, f.dec), { a: 'middle', f: font(600, 10.5, MONO), c: T.ink }); txt(F.g, (F.iw + lw) / 2, F.ih + 52, num(base + mx, f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(600, 10.5, MONO), c: T.mid });
    if (f.title) txt(F.g, 0, -10, f.title, { f: font(700, 12), c: T.ink }); legend(el, statesOf(D));
  }
  REG('stripes', stripes, tableOf(['Période', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== SOURCEPYRAMID — la pyramide des preuves ============================== */
  function sourcepyramid(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, n = D.length, lh = comp ? 68 : 58, W = el.clientWidth || 640, F = frame(el, id, n * lh + 14, { l: 4, r: 4, t: 6, b: 6 }); addPatterns(F.defs, id, T); const pw = Math.min(F.iw * (comp ? .4 : .45), 320), cx = pw / 2 + 6, tot = d3.sum(D, d => d.count || 0) || 1, mc = d3.max(D, d => d.count || 0) || 1, bx = pw + 18, bwid = F.iw - bx - 44;
    D.forEach((d, i) => { const y0 = i * lh, y1 = y0 + lh - 3, w0 = pw * (i / n) + 3, w1 = pw * ((i + 1) / n) - 1, pts = i === 0 ? [[cx, y0], [cx + w1 / 2, y1], [cx - w1 / 2, y1]] : [[cx - w0 / 2, y0], [cx + w0 / 2, y0], [cx + w1 / 2, y1], [cx - w1 / 2, y1]]; const p = F.g.append('path').datum(d).attr('d', 'M' + pts.map(q => q.join(',')).join('L') + 'Z'); paint(p, T, id, dd => dd.state, () => col(T, d.color, i)); p.attr('fill-opacity', isSoft(d.state) ? 1 : .35 + .5 * (1 - i / n)); interactive(p, dd => ({ title: dd.label, value: `${num(dd.count || 0, 0)} source${(dd.count || 0) > 1 ? 's' : ''} (${num(100 * (dd.count || 0) / tot, 0)} %)`, state: dd.state, src: dd.src, detail: dd.note || dd.desc }), T);
      txt(F.g, cx, y0 + lh / 2 + 2, (i === 0 ? '' : ''), { a: 'middle', f: font(700, 11), c: T.ink }); F.g.append('line').attr('x1', cx + w1 / 2 + 2).attr('x2', bx - 6).attr('y1', y0 + lh / 2 - 2).attr('y2', y0 + lh / 2 - 2).attr('stroke', T.line).attr('stroke-dasharray', '2 3'); const lab = wrapLines(d.label, bwid + 40, comp ? 11 : 12.5, 800).slice(0, comp ? 3 : 2); lab.forEach((ln, k) => txt(F.g, bx, y0 + 14 + k * 13, ln, { f: font(800, comp ? 11 : 12.5), c: T.ink })); if (d.desc && !comp) txt(F.g, bx, y0 + 16 + lab.length * 14, trunc(d.desc, 60), { f: font(500, 11), c: T.mid }); const bw2 = Math.max(2, bwid * (d.count || 0) / mc); F.g.append('rect').attr('x', bx).attr('y', y0 + lh - 15).attr('width', bw2).attr('height', 7).attr('rx', 3).attr('fill', col(T, d.color, i)).attr('fill-opacity', .8); txt(F.g, bx + bw2 + 5, y0 + lh - 8, num(d.count || 0, 0), { f: font(800, 10.5, MONO), c: T.ink }); });
    txt(F.g, 6, n * lh + 8, '▲ preuve la plus forte', { f: font(600, 10), c: T.mid }); legend(el, statesOf(D));
  }
  REG('sourcepyramid', sourcepyramid, tableOf(['Niveau de preuve', 'Sources', 'Source'], d => [d.label, d.count || 0, d.src || '']));

  /* ============================== NESTEDCIRCLES — cercles imbriqués ============================== */
  function nestedcircles(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => b.value - a.value), W = el.clientWidth || 640, S = Math.min(W - 8, comp ? 340 : 520), F = frame(el, id, S * .82 + 8, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T); const R = d3.scaleSqrt([0, D[0].value], [0, S * (comp ? .3 : .4)]), cx = comp ? S * .32 : S * .38, base = S * .8; const lx = cx + R(D[0].value) + 14;
    D.forEach((d, i) => { const r = R(d.value), c = F.g.append('circle').datum(d).attr('cx', cx).attr('cy', base - r).attr('r', r); paint(c, T, id, dd => dd.state, () => col(T, d.color, i)); c.attr('fill-opacity', isSoft(d.state) ? 1 : .22).attr('stroke-width', 2.2); interactive(c, dd => ({ title: dd.label, value: `${num(dd.value, f.dec)} ${f.unit || ''}` + (i ? ` · ${num(100 * dd.value / D[0].value, 0)} % de ${D[0].label}` : ''), state: dd.state, src: dd.src, detail: dd.note }), T); const ty = base - 2 * r; F.g.append('line').attr('x1', cx).attr('x2', lx + 6).attr('y1', ty).attr('y2', ty).attr('stroke', col(T, d.color, i)).attr('stroke-dasharray', '2 3'); wrapLines(`${d.label} · ${num(d.value, f.dec)}`, F.iw - lx - 14, comp ? 10.5 : 12, 700).slice(0, 3).forEach((ln, k) => txt(F.g, lx + 10, ty + 4 + k * 13, ln, { f: font(700, comp ? 10.5 : 12), c: T.ink, halo: T.bg })); });
    txt(F.g, cx, base + 2, '', {}); txt(F.g, 0, S * .82, f.unit ? 'Aire proportionnelle à la valeur (' + f.unit + ')' : 'Aire proportionnelle à la valeur', { f: font(500, 10.5), c: T.mid }); legend(el, statesOf(D));
  }
  REG('nestedcircles', nestedcircles, tableOf(['Élément', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== LOGTIMELINE — le temps à l'échelle logarithmique ============================== */
  function logtimeline(el, f, T) {
    const id = uid(), comp = isNarrow(el), now = new Date(f.now || Date.now()), D = f.items.map(d => ({ ...d, age: Math.max(f.minAge || .02, (now - new Date(d.date)) / 31557600000) })).sort((a, b) => b.age - a.age), fs = comp ? 10.5 : 11.5;
    const maxE = Math.ceil(Math.log10(d3.max(D, d => d.age))), minE = Math.floor(Math.log10(d3.min(D, d => d.age))), F0 = frame(el, id, 10, { l: 16, r: 22 }), iw = F0.iw, X = d3.scaleLog([10 ** maxE, 10 ** minE], [0, iw]);
    const tiers = { up: [], dn: [] }; D.forEach((d, i) => { d.x = X(d.age); const w = measure(d.label, fs, 700) + 10, side = i % 2 ? 'dn' : 'up', left = Math.max(0, Math.min(iw - w, d.x - w / 2)), T2 = tiers[side]; let t = 0; while (T2[t] && T2[t].some(r => !(left + w + 4 < r[0] || left - 4 > r[1]))) t++; (T2[t] = T2[t] || []).push([left, left + w]); d.tier = t; d.side = side; d.left = left; d.w = w; });
    const th = comp ? 30 : 32, nUp = Math.max(1, tiers.up.length), nDn = tiers.dn.length, ay = 22 + nUp * th + 8, H = ay + 36 + nDn * th + 26, F = frame(el, id, H + (comp ? 14 : 0), { l: 16, r: 22, t: 0, b: 0 }); addPatterns(F.defs, id, T); const g = F.g;
    g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', ay).attr('y2', ay).attr('stroke', T.ink).attr('stroke-width', 2); const lab = e => e === 0 ? '1 an' : e < 0 ? (e === -1 ? '≈ 5 semaines' : '≈ ' + Math.round(10 ** e * 365) + ' jours') : `${10 ** e} ans`; d3.range(minE, maxE + 1).forEach(e => { const x = X(10 ** e); g.append('line').attr('x1', x).attr('x2', x).attr('y1', ay - 8).attr('y2', ay + 8).attr('stroke', T.ink).attr('stroke-width', 1.6); txt(g, x, ay + 24, comp ? lab(e).replace('≈ ', '').replace(' semaines', ' sem.').replace(' jours', ' j') : 'il y a ' + lab(e), { a: x < 50 ? 'start' : x > iw - 50 ? 'end' : 'middle', f: font(600, 10.5, MONO), c: T.mid }); });
    txt(g, iw, ay - 14, 'maintenant', { a: 'end', f: font(800, 10.5), c: T.neg }); g.append('line').attr('x1', iw).attr('x2', iw).attr('y1', ay - 10).attr('y2', ay + 10).attr('stroke', T.neg).attr('stroke-width', 2.4);
    D.forEach(d => { const up = d.side === 'up', y = up ? ay - 22 - d.tier * th : ay + 40 + (d.tier + 1) * th - 4; g.append('line').attr('x1', d.x).attr('x2', d.x).attr('y1', ay).attr('y2', up ? y + 6 : y - 14).attr('stroke', T.mid).attr('stroke-opacity', .6); const dot = g.append('circle').datum(d).attr('cx', d.x).attr('cy', ay).attr('r', 6.5); paint(dot, T, id, dd => dd.state, () => T.c1); interactive(dot, dd => ({ title: dd.label, value: d3.timeFormat('%d %b %Y')(new Date(dd.date)) + ` (il y a ${num(dd.age, dd.age < 2 ? 1 : 0)} an${dd.age >= 2 ? 's' : ''})`, state: dd.state, src: dd.src, detail: dd.note }), T); txt(g, d.left + d.w / 2, y, d.label, { a: 'middle', f: font(700, fs), c: T.ink, halo: T.bg }); });
    wrapLines('Échelle logarithmique, lue vers la gauche : « il y a… » ; chaque graduation = ×10', iw, 10.5, 500).forEach((ln, k) => txt(g, 0, H - 4 + k * 13, ln, { f: font(500, 10.5), c: T.mid })); legend(el, statesOf(D));
  }
  REG('logtimeline', logtimeline, tableOf(['Événement', 'Date', 'État', 'Source'], d => [d.label, d.date, SL(d.state), d.src], 'items'));

  /* ============================== ARROWPLOT — d'où l'on part, où l'on arrive ============================== */
  function arrowplot(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, F = frame(el, id, comp ? 380 : 450, { l: comp ? 42 : 56, t: 14, r: 18, b: 44 }); addPatterns(F.defs, id, T); const xs = D.flatMap(d => [d.x0, d.x1]), ys = D.flatMap(d => [d.y0, d.y1]), X = d3.scaleLinear(d3.extent(xs), [14, F.iw - 14]).nice(), Y = d3.scaleLinear(d3.extent(ys), [F.ih - 14, 14]).nice(); yAxisLeft(F, Y, T); xAxisBottom(F, X, T, comp);
    txt(F.g, F.iw / 2, F.ih + 36, f.xLabel || '', { a: 'middle', f: font(600, 11), c: T.mid }); txt(F.g, comp ? -34 : -48, -2, f.yLabel || '', { f: font(600, 11), c: T.mid }); if (f.refX != null) F.g.append('line').attr('x1', X(f.refX)).attr('x2', X(f.refX)).attr('y1', 0).attr('y2', F.ih).attr('stroke', T.mid).attr('stroke-dasharray', '4 3'); if (f.refY != null) F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(f.refY)).attr('y2', Y(f.refY)).attr('stroke', T.mid).attr('stroke-dasharray', '4 3');
    D.forEach((d, i) => { const c = col(T, d.color, i), mk = mark(F, id + i, T, c), len = Math.hypot(X(d.x1) - X(d.x0), Y(d.y1) - Y(d.y0)), l = F.g.append('line').datum(d).attr('x1', X(d.x0)).attr('y1', Y(d.y0)).attr('x2', X(d.x1)).attr('y2', Y(d.y1)).attr('stroke', c).attr('stroke-width', 2.6).attr('marker-end', mk).attr('stroke-dasharray', stateStyle(d.state || 'actual', id, T).dash); interactive(l, dd => ({ title: dd.label, value: `${f.xLabel || 'x'} ${num(dd.x0, f.dec)} → ${num(dd.x1, f.dec)} · ${f.yLabel || 'y'} ${num(dd.y0, f.dec)} → ${num(dd.y1, f.dec)}`, state: dd.state, src: dd.src, detail: dd.note }), T); F.g.append('circle').attr('cx', X(d.x0)).attr('cy', Y(d.y0)).attr('r', 3.8).attr('fill', T.bg).attr('stroke', c).attr('stroke-width', 2).style('pointer-events', 'none'); txt(F.g, X(d.x1) + (X(d.x1) >= X(d.x0) ? 8 : -8), Y(d.y1) + 4, d.label, { a: X(d.x1) >= X(d.x0) ? 'start' : 'end', f: font(700, comp ? 10.5 : 11.5), c, halo: T.bg }); });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = 'Cercle creux = situation de départ · pointe = situation d’arrivée'; ul.appendChild(li);
  }
  REG('arrowplot', arrowplot, tableOf(['Élément', 'Départ', 'Arrivée', 'Source'], d => [d.label, `${num(d.x0, 1)} ; ${num(d.y0, 1)}`, `${num(d.x1, 1)} ; ${num(d.y1, 1)}`, d.src]));

  /* ============================== TALLY — le décompte à la craie ============================== */
  function tally(el, f, T) {
    const id = uid(), comp = isNarrow(el), R = f.rows, labW = comp ? 92 : 170, gw = comp ? 30 : 38, gh = comp ? 30 : 34, per = Math.max(2, Math.floor(((el.clientWidth || 640) - labW - 50) / gw)), lines = R.map(r => Math.max(1, Math.ceil(Math.ceil(r.value / 5) / per))), F = frame(el, id, d3.sum(lines, n => n * (gh + 8) + 10) + 14, { l: labW, r: 40, t: 6, b: 6 }); addPatterns(F.defs, id, T); let y = 4;
    R.forEach((r, ri) => { const g = F.g.append('g').datum(r), c = col(T, r.color, ri), ngr = Math.ceil(r.value / 5), st = stateStyle(r.state || 'actual', id, T); rowLabel(g, r.label, y + gh / 2, labW, T, comp ? 11 : 12.5, 700);
      for (let k = 0; k < ngr; k++) { const gx = (k % per) * gw, gy = y + Math.floor(k / per) * (gh + 8), cnt = Math.min(5, r.value - k * 5); for (let j = 0; j < Math.min(4, cnt); j++) { const x = gx + 4 + j * 6 + rnd(k * 9 + j) * 1.2; g.append('line').attr('x1', x).attr('x2', x + rnd(k * 5 + j) * 1.6 - .8).attr('y1', gy + 1).attr('y2', gy + gh - 1).attr('stroke', c).attr('stroke-width', 2.6).attr('stroke-linecap', 'round').attr('stroke-dasharray', isSoft(r.state) ? '1 4' : null).attr('stroke-opacity', isSoft(r.state) ? .9 : 1); } if (cnt === 5) g.append('line').attr('x1', gx - 1).attr('x2', gx + 27).attr('y1', gy + gh - 3).attr('y2', gy + 3).attr('stroke', c).attr('stroke-width', 2.6).attr('stroke-linecap', 'round').attr('stroke-dasharray', isSoft(r.state) ? '1 4' : null); }
      const hit = g.insert('rect', ':first-child').attr('x', 0).attr('y', y).attr('width', per * gw).attr('height', lines[ri] * (gh + 8)).attr('fill', 'transparent'); interactive(hit, () => ({ title: r.label, value: `${num(r.value, 0)} ${f.unit || ''}`, state: r.state, src: r.src, detail: r.note }), T); txt(F.g, Math.min(per, ngr) * gw + 8, y + gh / 2 + 5, num(r.value, 0), { f: font(800, comp ? 12 : 14, MONO), c: T.ink }); y += lines[ri] * (gh + 8) + 10; }); legend(el, statesOf(R));
  }
  REG('tally', tally, tableOf(['Élément', 'Décompte', 'État', 'Source'], d => [d.label, d.value, SL(d.state), d.src], 'rows'));

  /* ============================== PROBWORDS — ce que « probable » veut dire ============================== */
  function probwords(el, f, T) {
    const id = uid(), comp = isNarrow(el), I = f.items, labW = comp ? 100 : 190, rowH = comp ? 40 : 42, F = frame(el, id, I.length * rowH + 52, { l: labW, r: 14, t: 22, b: 28 }); addPatterns(F.defs, id, T); const X = d3.scaleLinear([0, 100], [0, F.iw]), bands = f.bands || [[0, 5, 'quasi impossible'], [5, 20, 'peu probable'], [20, 45, 'incertain'], [45, 55, 'pile ou face'], [55, 80, 'probable'], [80, 95, 'très probable'], [95, 100, 'quasi certain']];
    bands.forEach((b, i) => { F.g.append('rect').attr('x', X(b[0])).attr('width', X(b[1]) - X(b[0])).attr('y', 0).attr('height', I.length * rowH).attr('fill', i % 2 ? T.line : T.bg).attr('fill-opacity', .35); if (X(b[1]) - X(b[0]) > measure(b[2], comp ? 8.5 : 10, 600) + 6) { const t = F.g.append('text').attr('x', X((b[0] + b[1]) / 2)).attr('y', -8).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', font(600, comp ? 8.5 : 10)); t.text(b[2]); } });
    [0, 25, 50, 75, 100].forEach(v => txt(F.g, X(v), I.length * rowH + 16, v + ' %', { a: v === 0 ? 'start' : v === 100 ? 'end' : 'middle', f: font(600, 10.5, MONO), c: T.mid }));
    I.forEach((d, i) => { const cy = i * rowH + rowH / 2; rowLabel(F.g, d.label, cy, labW, T, comp ? 11 : 12.5, 700); F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', cy).attr('y2', cy).attr('stroke', T.line).attr('stroke-opacity', .6); const r = F.g.append('rect').datum(d).attr('x', X(d.lo)).attr('width', Math.max(4, X(d.hi) - X(d.lo))).attr('y', cy - 9).attr('height', 18).attr('rx', 9); paint(r, T, id, dd => dd.state, (dd) => col(T, dd.color, i)); r.attr('fill-opacity', isSoft(d.state) ? 1 : .6); interactive(r, dd => ({ title: dd.label, value: `${num(dd.lo, 0)} % – ${num(dd.hi, 0)} %` + (dd.med != null ? ` (médiane ${num(dd.med, 0)} %)` : ''), state: dd.state, src: dd.src, detail: dd.note }), T); if (d.med != null) F.g.append('line').attr('x1', X(d.med)).attr('x2', X(d.med)).attr('y1', cy - 12).attr('y2', cy + 12).attr('stroke', T.ink).attr('stroke-width', 2.6); });
    legend(el, statesOf(I));
  }
  REG('probwords', probwords, tableOf(['Expression', 'De', 'À', 'Source'], d => [d.label, num(d.lo, 0) + ' %', num(d.hi, 0) + ' %', d.src], 'items'));

  /* ============================== BRACKET — tableau à élimination avec probabilités ============================== */
  function bracket(el, f, T) {
    const id = uid(), comp = isNarrow(el), Rd = f.rounds, nR = Rd.length, first = Rd[0].matches.length, mh = comp ? 46 : 52, H = first * mh * 2 + 30, F = frame(el, id, H, { l: 4, r: 4, t: 22, b: 4 }); addPatterns(F.defs, id, T); const cw = F.iw / nR, bw = cw - (comp ? 10 : 22), th = (comp ? 20 : 22);
    Rd.forEach((r, ri) => { txt(F.g, ri * cw + bw / 2, -8, r.label, { a: 'middle', f: font(800, comp ? 10 : 11.5), c: T.mid }); r.matches.forEach((m, mi) => { const span = (H - 30) / r.matches.length, cy = mi * span + span / 2, y = cy - th, g = F.g.append('g').datum(m).attr('transform', `translate(${ri * cw},${y})`); m.cy = cy; m.x = ri * cw;
      [m.a, m.b].forEach((t, k) => { const win = m.winner === t.label, rc = g.append('rect').attr('y', k * th).attr('width', bw).attr('height', th - 1.5).attr('rx', 3); paint(rc, T, id, () => m.state, () => win ? T.c2 : T.c1); rc.attr('fill-opacity', isSoft(m.state) ? 1 : (win ? .45 : .14)).attr('stroke-width', win ? 2 : 1.2); txt(g, 6, k * th + th / 2 + 3.5, trunc(t.label, comp ? 11 : 18), { f: font(win ? 800 : 600, comp ? 10 : 11.5), c: T.ink }); if (t.p != null) txt(g, bw - 5, k * th + th / 2 + 3.5, num(t.p, 0) + '%', { a: 'end', f: font(800, comp ? 9.5 : 10.5, MONO), c: T.mid }); });
      interactive(g, d => ({ title: `${d.a.label} contre ${d.b.label}`, value: (d.a.p != null ? `${d.a.label} ${num(d.a.p, 0)} % · ${d.b.label} ${num(d.b.p, 0)} %` : '') + (d.winner ? ` · vainqueur : ${d.winner}` : ''), state: d.state, src: d.src, detail: d.note }), T); if (ri < nR - 1) { const nx = Rd[ri + 1].matches[Math.floor(mi / 2)], ncy = ((H - 30) / Rd[ri + 1].matches.length) * (Math.floor(mi / 2) + .5); F.g.append('path').attr('d', `M${ri * cw + bw},${cy}H${ri * cw + bw + (cw - bw) / 2}V${ncy}H${(ri + 1) * cw}`).attr('fill', 'none').attr('stroke', T.mid).attr('stroke-width', 1.4); } }); });
    legend(el, Rd.flatMap(r => r.matches.map(m => m.state || 'actual')));
  }
  REG('bracket', bracket, (f, r) => r(['Tour', 'Duel', 'Vainqueur', 'Source'], f.rounds.flatMap(rd => rd.matches.map(m => [rd.label, m.a.label + ' / ' + m.b.label, m.winner || '', m.src || '']))));

  /* ============================== VORONOI — territoires d'influence ============================== */
  function voronoi(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, W = el.clientWidth || 640, H = Math.round(Math.min(W * (comp ? .95 : .6), 480)), F = frame(el, id, H, { l: 2, r: 2, t: 2, b: 2 }); addPatterns(F.defs, id, T); const X = d3.scaleLinear(d3.extent(D, d => d.x), [40, F.iw - 40]), Y = d3.scaleLinear(d3.extent(D, d => d.y), [H - 40, 40]), pts = D.map(d => [X(d.x), Y(d.y)]), del = d3.Delaunay.from(pts), vor = del.voronoi([0, 0, F.iw, H]), cs = d3.scaleSequential(t => seq(T, t)).domain([0, d3.max(D, d => d.value)]);
    const cells = F.g.selectAll('path.vc').data(D).join('path').attr('class', 'vc').attr('d', (d, i) => vor.renderCell(i) && vor.cellPolygon(i) ? 'M' + vor.cellPolygon(i).map(p => p.join(',')).join('L') + 'Z' : '').attr('fill', d => cs(d.value)).attr('stroke', T.bg).attr('stroke-width', 2); interactive(cells, d => ({ title: d.label, value: `${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
    F.g.selectAll('path.vo').data(D.map((d, i) => ({ d, i })).filter(o => isSoft(o.d.state))).join('path').attr('class', 'vo').attr('d', o => 'M' + vor.cellPolygon(o.i).map(p => p.join(',')).join('L') + 'Z').attr('fill', o => `url(#${id}-${o.d.state})`).attr('fill-opacity', .5).style('pointer-events', 'none');
    D.forEach((d, i) => { const bg = cs(d.value), c = ink(T, d3.color(bg).formatHex()); F.g.append('circle').attr('cx', pts[i][0]).attr('cy', pts[i][1]).attr('r', 3).attr('fill', c).style('pointer-events', 'none'); txt(F.g, pts[i][0], pts[i][1] - 8, trunc(d.label, comp ? 10 : 16), { a: 'middle', f: font(700, comp ? 10 : 11.5), c }); txt(F.g, pts[i][0], pts[i][1] + 14, num(d.value, f.dec), { a: 'middle', f: font(600, 10, MONO), c }); }); legend(el, statesOf(D));
  }
  REG('voronoi', voronoi, tableOf(['Zone', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================================================================================
   *  LOT 9 — FORMES ORIGINALES (suite 3), inspirées des blocs de Bostock / Bremer / Davies / Veltman et de dataviz-inspiration.com
   *  bichord · petalglyphs · sunflower · clock24 · clusterhulls · daystrips · tailshift · likert · sizeddonuts · marey · pedigree · tilegrid
   * ============================================================================================ */

  /* ============================== BICHORD — accords étirés (deux moitiés) ============================== */
  function bichord(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W, comp ? 380 : 600), labW = comp ? 74 : 110, R = S / 2 - labW - 6, L = f.left, Rt = f.right, Fl = f.flows, F = frame(el, id, S + 10, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T);
    const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 4})`), gap = .07, pad = .03, tl = d => d3.sum(Fl.filter(x => x.s === d.id), x => x.v), tr = d => d3.sum(Fl.filter(x => x.t === d.id), x => x.v), totL = d3.sum(L, tl), totR = d3.sum(Rt, tr);
    const kL = (Math.PI - 2 * gap - pad * (L.length - 1)) / totL, kR = (Math.PI - 2 * gap - pad * (Rt.length - 1)) / totR; let a = 2 * Math.PI - gap; const arcs = {}; L.forEach(d => { const w = tl(d) * kL; arcs[d.id] = { a1: a, a0: a - w, side: 'L', d }; a -= w + pad; }); a = gap; Rt.forEach(d => { const w = tr(d) * kR; arcs[d.id] = { a0: a, a1: a + w, side: 'R', d }; a += w + pad; });
    const cur = {}; Object.values(arcs).forEach(o => cur[o.d.id] = o.side === 'L' ? o.a1 : o.a0); const rb = d3.ribbon().radius(R - 3);
    const segs = Fl.map(x => { const sa = arcs[x.s], ta = arcs[x.t], sw = x.v * kL, tw = x.v * kR, s0 = cur[x.s] - sw, t0 = cur[x.t]; cur[x.s] -= sw; cur[x.t] += tw; return { x, source: { startAngle: s0, endAngle: s0 + sw }, target: { startAngle: t0, endAngle: t0 + tw } }; });
    const rib = g.append('g').selectAll('path').data(segs).join('path').attr('d', d => rb(d)); rib.each(function (d) { const c = col(T, arcs[d.x.s].d.color, L.indexOf(arcs[d.x.s].d)), st = stateStyle(d.x.state || 'actual', id, T); d3.select(this).attr('fill', isSoft(d.x.state) ? st.fill : c).attr('fill-opacity', isSoft(d.x.state) ? .9 : .5).attr('stroke', c).attr('stroke-width', .9).attr('stroke-dasharray', st.dash); });
    interactive(rib, d => ({ title: `${arcs[d.x.s].d.label} → ${arcs[d.x.t].d.label}`, value: `${num(d.x.v, f.dec)} ${f.unit || ''}`, state: d.x.state, src: d.x.src, detail: d.x.note }), T);
    Object.values(arcs).forEach(o => { const c = o.side === 'L' ? col(T, o.d.color, L.indexOf(o.d)) : T.ink; g.append('path').attr('d', d3.arc().innerRadius(R).outerRadius(R + 7).startAngle(o.a0).endAngle(o.a1)()).attr('fill', c); const am = (o.a0 + o.a1) / 2 - Math.PI / 2, lx = Math.cos(am) * (R + 14), ly = Math.sin(am) * (R + 14), right = Math.cos(am) > 0, lines = wrapLines(o.d.label, labW, comp ? 10 : 11.5, 700).slice(0, 2); const t = g.append('text').attr('x', lx).attr('y', ly - (lines.length - 1) * 6 + 4).attr('text-anchor', right ? 'start' : 'end').attr('fill', T.ink).style('font', font(700, comp ? 10 : 11.5)); lines.forEach((ln, k) => t.append('tspan').attr('x', lx).attr('dy', k ? '1.1em' : 0).text(ln)); });
    txt(g, -F.iw / 2 + 4, S / 2 - 6, f.leftTitle || '', { a: 'start', f: font(800, comp ? 10 : 11), c: T.mid }); txt(g, F.iw / 2 - 4, S / 2 - 6, f.rightTitle || '', { a: 'end', f: font(800, comp ? 10 : 11), c: T.mid }); hl(rib, g.selectAll('path:not(:first-child)'), () => false); legend(el, statesOf(Fl));
  }
  REG('bichord', bichord, (f, r) => r(['De', 'Vers', 'Valeur', 'Source'], f.flows.map(x => [f.left.find(d => d.id === x.s).label, f.right.find(d => d.id === x.t).label, num(x.v, 2), x.src || ''])));

  /* ============================== PETALGLYPHS — une fleur par élément ============================== */
  function petalglyphs(el, f, T) {
    const id = uid(), comp = isNarrow(el), I = f.items, Dm = f.dims, n = Dm.length, W = el.clientWidth || 640, cols = Math.max(1, Math.floor(W / (comp ? 150 : 200))), cell = W / cols, rows = Math.ceil(I.length / cols), R = Math.min(cell / 2 - 14, comp ? 60 : 78), H = rows * (R * 2 + 52) + 36, F = frame(el, id, H, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T); const mx = f.max || d3.max(I.flatMap(d => d.values));
    I.forEach((it, ii) => { const cx = (ii % cols) * cell + cell / 2, cy = Math.floor(ii / cols) * (R * 2 + 52) + R + 8, g = F.g.append('g').datum(it).attr('transform', `translate(${cx},${cy})`);
      [.5, 1].forEach(k => g.append('circle').attr('r', R * k).attr('fill', 'none').attr('stroke', T.line).attr('stroke-dasharray', k < 1 ? '2 3' : null)); const pw = Math.PI * 2 / n;
      it.values.forEach((v, k) => { const a = k * pw - Math.PI / 2, L = R * Math.sqrt(v / mx), w = Math.min(R * .5, L * .55), p = g.append('path').datum({ it, k, v }).attr('d', `M0,0C${Math.cos(a - .5) * L * .5},${Math.sin(a - .5) * L * .5} ${Math.cos(a - .28) * L * 1.02},${Math.sin(a - .28) * L * 1.02} ${Math.cos(a) * L},${Math.sin(a) * L}C${Math.cos(a + .28) * L * 1.02},${Math.sin(a + .28) * L * 1.02} ${Math.cos(a + .5) * L * .5},${Math.sin(a + .5) * L * .5} 0,0Z`); paint(p, T, id, d => d.it.state, d => col(T, null, d.k)); p.attr('fill-opacity', isSoft(it.state) ? 1 : .75); interactive(p, d => ({ title: `${it.label} · ${Dm[d.k]}`, value: `${num(d.v, f.dec)} ${f.unit || ''}`, state: it.state, src: it.src, detail: it.note }), T); });
      g.append('circle').attr('r', 3).attr('fill', T.ink); txt(g, 0, R + 18, it.label, { a: 'middle', f: font(700, comp ? 11 : 12.5), c: T.ink }); });
    legend(el, statesOf(I)); const ul = el.parentNode.querySelector('.fig-legend'); Dm.forEach((d, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" rx="6" fill="${col(T, null, k)}"/></svg>${d}`; ul.appendChild(li); });
  }
  REG('petalglyphs', petalglyphs, (f, r) => r(['Élément', ...f.dims, 'Source'], f.items.map(d => [d.label, ...d.values.map(v => num(v, 1)), d.src || ''])));

  /* ============================== SUNFLOWER — un point = une unité, en phyllotaxie ============================== */
  function sunflower(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, W = el.clientWidth || 640, u = f.unitValue || 1, N = d3.sum(D, d => Math.round(d.value / u)), S = Math.min(W, comp ? 330 : 440), c = (S / 2 - 6) / Math.sqrt(N), dr = c * .44, ga = Math.PI * (3 - Math.sqrt(5)), ls = comp ? 0 : 190, F = frame(el, id, S + (comp ? 40 + D.length * 44 : 8), { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const g = F.g.append('g').attr('transform', `translate(${comp ? F.iw / 2 : (F.iw - ls) / 2},${S / 2 + 4})`); let i = 0;
    D.forEach((d, di) => { const n = Math.round(d.value / u), pts = d3.range(n).map(k => { const j = i + k + 1, r = c * Math.sqrt(j), a = j * ga; return { x: r * Math.cos(a), y: r * Math.sin(a) }; }); i += n; const cs = g.append('g').datum(d).selectAll('circle').data(pts).join('circle').attr('cx', p => p.x).attr('cy', p => p.y).attr('r', dr); paint(cs, T, id, () => d.state, () => col(T, d.color, di)); cs.attr('stroke', T.bg).attr('stroke-width', .6).style('cursor', 'pointer');
      interactive(cs, () => ({ title: d.label, value: `${num(d.value, f.dec)} ${f.unit || ''} (${n} points)`, state: d.state, src: d.src, detail: d.note }), T); });
    const lx = comp ? 8 : F.iw - ls + 4, ly0 = comp ? S + 16 : S / 2 - D.length * 11;
    let yy = ly0; D.forEach((d, di) => { const lines = wrapLines(`${d.label} · ${num(d.value, f.dec)}${f.unit === '%' ? ' %' : ''}`, (comp ? F.iw - 40 : ls - 28), comp ? 11 : 12, 700).slice(0, 3); F.g.append('circle').attr('cx', lx + 6).attr('cy', yy).attr('r', 6).attr('fill', col(T, d.color, di)); lines.forEach((ln, k) => txt(F.g, lx + 18, yy + 4 + k * 14, ln, { f: font(700, comp ? 11 : 12), c: T.ink })); yy += lines.length * 14 + 10; });
    txt(F.g, comp ? 8 : F.iw - ls + 4, yy + 4, `1 point = ${num(u, u < 1 ? 2 : 0)} ${f.unit || ''}`, { f: font(500, 10.5), c: T.mid }); legend(el, statesOf(D));
  }
  REG('sunflower', sunflower, tableOf(['Catégorie', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== CLOCK24 — l'horloge de 24 heures, un anneau par série ============================== */
  function clock24(el, f, T) {
    const id = uid(), comp = isNarrow(el), S0 = f.series, W = el.clientWidth || 640, S = Math.min(W - 6, comp ? 350 : 500), F = frame(el, id, S + 56, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T); const g = F.g.append('g').attr('transform', `translate(${F.iw / 2},${S / 2 + 4})`), R = S / 2 - 22, r0 = R * .3, rw = (R - r0) / S0.length, vals = S0.flatMap(s => s.values), cs = d3.scaleSequential(t => seq(T, t)).domain([d3.min(vals), d3.max(vals)]), ang = h => h / 24 * 2 * Math.PI;
    g.append('path').attr('d', d3.arc().innerRadius(r0 - 4).outerRadius(R + 4).startAngle(ang(f.nightFrom != null ? f.nightFrom : 22)).endAngle(ang(24))()).attr('fill', T.ink).attr('fill-opacity', .05); g.append('path').attr('d', d3.arc().innerRadius(r0 - 4).outerRadius(R + 4).startAngle(0).endAngle(ang(f.nightTo != null ? f.nightTo : 6))()).attr('fill', T.ink).attr('fill-opacity', .05);
    S0.forEach((s, si) => { const ri = r0 + si * rw, cells = s.values.map((v, h) => ({ s, v, h })), a = g.append('g').selectAll('path').data(cells).join('path').attr('d', d => d3.arc().innerRadius(ri + 1).outerRadius(ri + rw - 1).startAngle(ang(d.h) + .008).endAngle(ang(d.h + 1) - .008)()).attr('fill', d => cs(d.v)).attr('stroke', T.bg).attr('stroke-width', .5); interactive(a, d => ({ title: `${s.label} · ${String(d.h).padStart(2, '0')}h`, value: `${num(d.v, f.dec)} ${f.unit || ''}`, state: s.state, src: s.src, detail: s.note }), T); if (isSoft(s.state)) g.append('path').attr('d', d3.arc().innerRadius(ri + 1).outerRadius(ri + rw - 1).startAngle(0).endAngle(2 * Math.PI)()).attr('fill', `url(#${id}-${s.state})`).attr('fill-opacity', .35).style('pointer-events', 'none'); txt(g, 0, -(ri + rw / 2) + 3, '', {}); txt(g, -4, -(ri + rw * .3), s.label, { a: 'end', f: font(700, comp ? 8.5 : 9.5), c: T.ink, halo: T.bg }); });
    [0, 6, 12, 18].forEach(h => { const a = ang(h) - Math.PI / 2; txt(g, Math.cos(a) * (R + 14), Math.sin(a) * (R + 14) + 4, h + ' h', { a: 'middle', f: font(700, 11, MONO), c: T.mid }); g.append('line').attr('x1', Math.cos(a) * (r0 - 4)).attr('y1', Math.sin(a) * (r0 - 4)).attr('x2', Math.cos(a) * (R + 4)).attr('y2', Math.sin(a) * (R + 4)).attr('stroke', T.mid).attr('stroke-opacity', .5); }); txt(g, 0, -2, f.centerTop || '24 h', { a: 'middle', f: font(800, 14, MONO), c: T.ink }); txt(g, 0, 14, f.centerBottom || '', { a: 'middle', f: font(500, 10.5), c: T.mid });
    const lw = Math.min(260, F.iw - 20), gid = id + 'gr', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .25).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', seq(T, t))); F.g.append('rect').attr('x', (F.iw - lw) / 2).attr('y', S + 18).attr('width', lw).attr('height', 9).attr('rx', 4).attr('fill', `url(#${gid})`); txt(F.g, (F.iw - lw) / 2, S + 42, num(d3.min(vals), f.dec), { f: font(600, 10.5, MONO), c: T.mid }); txt(F.g, (F.iw + lw) / 2, S + 42, num(d3.max(vals), f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(600, 10.5, MONO), c: T.mid }); legend(el, statesOf(S0));
  }
  REG('clock24', clock24, (f, r) => r(['Série', ...d3.range(24).map(h => h + 'h'), 'Source'], f.series.map(s => [s.label, ...s.values.map(v => num(v, 1)), s.src || ''])));

  /* ============================== CLUSTERHULLS — nuage avec territoires ============================== */
  function clusterhulls(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, groups = [...new Set(D.map(d => d.group))], F = frame(el, id, comp ? 380 : 450, { l: comp ? 42 : 56, t: 14, r: 16, b: 44 }); addPatterns(F.defs, id, T); const X = d3.scaleLinear(d3.extent(D, d => d.x), [18, F.iw - 18]).nice(), Y = d3.scaleLinear(d3.extent(D, d => d.y), [F.ih - 18, 18]).nice(); yAxisLeft(F, Y, T); xAxisBottom(F, X, T, comp); txt(F.g, F.iw / 2, F.ih + 36, f.xLabel || '', { a: 'middle', f: font(600, 11), c: T.mid }); txt(F.g, comp ? -34 : -48, -2, f.yLabel || '', { f: font(600, 11), c: T.mid });
    groups.forEach((gr, k) => { const pts = D.filter(d => d.group === gr).map(d => [X(d.x), Y(d.y)]), c = col(T, (D.find(d => d.group === gr) || {}).color, k); let hull = pts.length >= 3 ? d3.polygonHull(pts) : null; if (!hull) { const m = [d3.mean(pts, p => p[0]), d3.mean(pts, p => p[1])]; hull = d3.range(8).map(i => [m[0] + Math.cos(i * Math.PI / 4) * 22, m[1] + Math.sin(i * Math.PI / 4) * 22]); } const cen = d3.polygonCentroid(hull), grow = hull.map(p => { const dx = p[0] - cen[0], dy = p[1] - cen[1], L = Math.hypot(dx, dy) || 1; return [p[0] + dx / L * 16, p[1] + dy / L * 16]; });
      F.g.append('path').attr('d', d3.line().curve(d3.curveCatmullRomClosed.alpha(.6))(grow)).attr('fill', c).attr('fill-opacity', .12).attr('stroke', c).attr('stroke-width', 1.8).attr('stroke-dasharray', '5 3'); txt(F.g, cen[0], Math.min(...grow.map(p => p[1])) - 5, gr, { a: 'middle', f: font(800, comp ? 11 : 12.5), c, halo: T.bg }); });
    const R = d3.scaleSqrt([0, d3.max(D, d => d.size || 1)], [4, comp ? 11 : 15]); const dots = F.g.selectAll('circle.ch').data(D).join('circle').attr('class', 'ch').attr('cx', d => X(d.x)).attr('cy', d => Y(d.y)).attr('r', d => R(d.size || 1)); paint(dots, T, id, d => d.state, d => col(T, d.color, groups.indexOf(d.group))); dots.attr('stroke', T.bg).attr('stroke-width', 1.4); interactive(dots, d => ({ title: d.label, value: `${d.group} · ${f.xLabel || 'x'} ${num(d.x, f.dec)} · ${f.yLabel || 'y'} ${num(d.y, f.dec)}`, state: d.state, src: d.src, detail: d.note }), T);
    if (D.length <= (comp ? 10 : 22)) D.forEach(d => txt(F.g, X(d.x) + R(d.size || 1) + 4, Y(d.y) + 4, d.label, { f: font(600, comp ? 9.5 : 10.5), c: T.ink, halo: T.bg })); legend(el, statesOf(D));
  }
  REG('clusterhulls', clusterhulls, tableOf(['Élément', 'Groupe', 'x', 'y', 'Source'], d => [d.label, d.group, num(d.x, 1), num(d.y, 1), d.src]));

  /* ============================== DAYSTRIPS — actogramme : des journées en bandes ============================== */
  function daystrips(el, f, T) {
    const id = uid(), comp = isNarrow(el), Dy = f.days, E = f.events, labW = comp ? 54 : 90, rowH = comp ? 24 : 28, F = frame(el, id, Dy.length * rowH + 52, { l: labW, r: 10, t: 22, b: 22 }); addPatterns(F.defs, id, T); const X = d3.scaleLinear([0, 24], [0, F.iw]);
    F.g.append('rect').attr('x', 0).attr('width', X(6)).attr('y', 0).attr('height', Dy.length * rowH).attr('fill', T.ink).attr('fill-opacity', .06); F.g.append('rect').attr('x', X(22)).attr('width', X(24) - X(22)).attr('y', 0).attr('height', Dy.length * rowH).attr('fill', T.ink).attr('fill-opacity', .06);
    d3.range(0, 25, comp ? 6 : 3).forEach(h => { F.g.append('line').attr('x1', X(h)).attr('x2', X(h)).attr('y1', 0).attr('y2', Dy.length * rowH).attr('stroke', T.line); txt(F.g, X(h), -8, h + 'h', { a: 'middle', f: font(600, 10.5, MONO), c: T.mid }); });
    Dy.forEach((d, i) => { F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', i * rowH + rowH).attr('y2', i * rowH + rowH).attr('stroke', T.line).attr('stroke-opacity', .5); txt(F.g, -8, i * rowH + rowH / 2 + 4, d, { a: 'end', f: font(700, comp ? 10.5 : 12), c: T.ink }); });
    const bars = F.g.selectAll('rect.ds').data(E).join('rect').attr('class', 'ds').attr('x', d => X(d.start)).attr('width', d => Math.max(3, X(d.end) - X(d.start))).attr('y', d => Dy.indexOf(d.day) * rowH + 4).attr('height', rowH - 8).attr('rx', 3); paint(bars, T, id, d => d.state, (d, i) => col(T, d.color, 0)); interactive(bars, d => ({ title: `${d.day} · ${d.label || ''}`, value: `${fmtH(d.start)} → ${fmtH(d.end)}`, state: d.state, src: d.src, detail: d.note }), T); legend(el, statesOf(E));
    function fmtH(h) { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return String(hh).padStart(2, '0') + 'h' + String(mm).padStart(2, '0'); }
  }
  REG('daystrips', daystrips, (f, r) => r(['Jour', 'Début', 'Fin', 'Libellé', 'Source'], f.events.map(d => [d.day, d.start, d.end, d.label || '', d.src || ''])));

  /* ============================== TAILSHIFT — la cloche qui se déplace, et sa queue ============================== */
  function tailshift(el, f, T) {
    const id = uid(), comp = isNarrow(el), C = f.curves, th = f.threshold, F = frame(el, id, comp ? 320 : 380, { l: 12, r: 12, t: 28, b: 40 }); addPatterns(F.defs, id, T); const lo = d3.min(C, c => c.mean - 3.6 * c.sd), hi = d3.max(C, c => c.mean + 3.6 * c.sd), X = d3.scaleLinear([lo, hi], [0, F.iw]), pdf = (c, x) => Math.exp(-.5 * ((x - c.mean) / c.sd) ** 2) / (c.sd * Math.sqrt(2 * Math.PI)), my = d3.max(C, c => pdf(c, c.mean)), Y = d3.scaleLinear([0, my * 1.1], [F.ih, 0]), xs = d3.range(lo, hi, (hi - lo) / 200), cdf = (c, x) => .5 * (1 + erf((x - c.mean) / (c.sd * Math.SQRT2)));
    function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + .3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x)); }
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 5 : 9).tickSizeOuter(0)), T); txt(F.g, F.iw / 2, F.ih + 34, f.xLabel || '', { a: 'middle', f: font(600, 11), c: T.mid });
    const above = (th.dir || 'above') === 'above'; C.forEach((c, i) => { const cc = col(T, c.color, i), tail = xs.filter(x => above ? x >= th.value : x <= th.value); const area = d3.area().x(x => X(x)).y0(F.ih).y1(x => Y(pdf(c, x))); const p = F.g.append('path').datum(c).attr('d', area(xs)).attr('fill', cc).attr('fill-opacity', .12).attr('stroke', cc).attr('stroke-width', 2.4).attr('stroke-dasharray', stateStyle(c.state || 'actual', id, T).dash); interactive(p, d => ({ title: d.label, value: `moyenne ${num(d.mean, f.dec)} · écart-type ${num(d.sd, f.dec)} · ${num(100 * (above ? 1 - cdf(d, th.value) : cdf(d, th.value)), 1)} % au-delà du seuil`, state: d.state, src: d.src, detail: d.note }), T);
      if (tail.length) F.g.append('path').attr('d', area(tail)).attr('fill', cc).attr('fill-opacity', .55).style('pointer-events', 'none'); F.g.append('line').attr('x1', X(c.mean)).attr('x2', X(c.mean)).attr('y1', Y(pdf(c, c.mean))).attr('y2', F.ih).attr('stroke', cc).attr('stroke-dasharray', '3 3'); const prob = 100 * (above ? 1 - cdf(c, th.value) : cdf(c, th.value)); txt(F.g, X(c.mean), Y(pdf(c, c.mean)) - 8, c.label, { a: 'middle', f: font(800, comp ? 10.5 : 12), c: cc, halo: T.bg }); txt(F.g, X(th.value) + (above ? 6 : -6), 14 + i * 16, `${c.label} : ${num(prob, prob < 10 ? 1 : 0)} %`, { a: above ? 'start' : 'end', f: font(800, comp ? 10.5 : 12, MONO), c: cc, halo: T.bg }); });
    F.g.append('line').attr('x1', X(th.value)).attr('x2', X(th.value)).attr('y1', -4).attr('y2', F.ih).attr('stroke', T.neg).attr('stroke-width', 2).attr('stroke-dasharray', '6 4'); txt(F.g, X(th.value), -10, th.label, { a: 'middle', f: font(800, 11), c: T.neg });
    if (C.length === 2) { const a = C[0], b = C[1], y = Y(my * .55); F.g.append('line').attr('x1', X(a.mean)).attr('x2', X(b.mean)).attr('y1', y).attr('y2', y).attr('stroke', T.ink).attr('stroke-width', 1.6).attr('marker-end', mark(F, id, T, T.ink)); txt(F.g, (X(a.mean) + X(b.mean)) / 2, y - 6, (b.mean >= a.mean ? '+' : '') + num(b.mean - a.mean, f.dec) + ' ' + (f.unit || ''), { a: 'middle', f: font(800, 11, MONO), c: T.ink, halo: T.bg }); } legend(el, statesOf(C));
  }
  const mark2 = null; REG('tailshift', tailshift, (f, r) => r(['Courbe', 'Moyenne', 'Écart-type', 'Source'], f.curves.map(c => [c.label, num(c.mean, 2), num(c.sd, 2), c.src || ''])));

  /* ============================== LIKERT — barres divergentes empilées ============================== */
  function likert(el, f, T) {
    const id = uid(), comp = isNarrow(el), Sc = f.scale, k = Sc.length, mid = (k - 1) / 2, R = f.rows, labW = comp ? 100 : 200, rowH = comp ? 40 : 42, F = frame(el, id, R.length * rowH + 56, { l: labW, r: 10, t: 6, b: 50 }); addPatterns(F.defs, id, T);
    const pc = R.map(r => { const t = d3.sum(r.counts); return r.counts.map(c => 100 * c / t); }), neg = pc.map(p => d3.sum(p.slice(0, Math.floor(mid))) + (k % 2 ? p[Math.floor(mid)] / 2 : 0)), pos = pc.map(p => d3.sum(p.slice(Math.ceil(mid) + (k % 2 ? 1 : 0))) + (k % 2 ? p[Math.floor(mid)] / 2 : 0)), mx = Math.max(d3.max(neg), d3.max(pos)) * 1.05, X = d3.scaleLinear([-mx, mx], [0, F.iw]), cc = i => { const t = i / (k - 1); return t < .5 ? d3.interpolateRgb(T.neg, T.lo)(t * 2) : d3.interpolateRgb(T.lo, T.c1)((t - .5) * 2); };
    F.g.append('line').attr('x1', X(0)).attr('x2', X(0)).attr('y1', 0).attr('y2', R.length * rowH).attr('stroke', T.ink).attr('stroke-width', 1.5); [-1, -.5, .5, 1].forEach(q => { const v = q * mx; F.g.append('line').attr('x1', X(v)).attr('x2', X(v)).attr('y1', 0).attr('y2', R.length * rowH).attr('stroke', T.line).attr('stroke-opacity', .6); txt(F.g, X(v), R.length * rowH + 14, Math.abs(Math.round(v)) + ' %', { a: 'middle', f: font(600, 10.5, MONO), c: T.mid }); });
    R.forEach((r, ri) => { const p = pc[ri], y = ri * rowH + 6; rowLabel(F.g, r.label, ri * rowH + rowH / 2, labW, T, comp ? 11 : 12.5, 700); let xl = -neg[ri]; p.forEach((v, i) => { const x0 = xl, x1 = xl + v, rect = F.g.append('rect').datum({ r, i, v }).attr('x', X(x0)).attr('width', Math.max(0, X(x1) - X(x0))).attr('y', y).attr('height', rowH - 12).attr('rx', 1); paint(rect, T, id, d => d.r.state, () => cc(i)); interactive(rect, d => ({ title: `${r.label} · ${Sc[i]}`, value: `${num(d.v, 0)} % (${num(r.counts[i], 0)})`, state: r.state, src: r.src, detail: r.note }), T); if (X(x1) - X(x0) > 26) txt(F.g, (X(x0) + X(x1)) / 2, y + (rowH - 12) / 2 + 4, num(v, 0), { a: 'middle', f: font(700, 10.5, MONO), c: ink(T, d3.color(cc(i)).formatHex()) }); xl = x1; }); });
    const lw = F.iw / k; Sc.forEach((s, i) => { F.g.append('rect').attr('x', i * lw + 2).attr('y', R.length * rowH + 26).attr('width', lw - 4).attr('height', 7).attr('rx', 3).attr('fill', cc(i)); const t = F.g.append('text').attr('x', i * lw + lw / 2).attr('y', R.length * rowH + 46).attr('text-anchor', 'middle').attr('fill', T.mid).style('font', font(600, comp ? 8.5 : 10.5)).text(trunc(s, comp ? 9 : 16)); }); legend(el, statesOf(R));
  }
  REG('likert', likert, (f, r) => r(['Question', ...f.scale, 'Source'], f.rows.map(x => [x.label, ...x.counts, x.src || ''])));

  /* ============================== SIZEDDONUTS — des anneaux dont la taille dit le total ============================== */
  function sizeddonuts(el, f, T) {
    const id = uid(), comp = isNarrow(el), I = f.items, K = f.keys, W = el.clientWidth || 640, cols = Math.max(1, Math.floor(W / (comp ? 150 : 190))), cell = W / cols, maxR = Math.min(cell / 2 - 12, comp ? 62 : 80), rows = Math.ceil(I.length / cols), F = frame(el, id, rows * (maxR * 2 + 44) + 12, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T); const R = d3.scaleSqrt([0, d3.max(I, d => d.total != null ? d.total : d3.sum(d.parts, p => p.value))], [0, maxR]), pie = d3.pie().sort(null).value(p => p.value);
    I.forEach((it, ii) => { const tot = it.total != null ? it.total : d3.sum(it.parts, p => p.value), r = R(tot), cx = (ii % cols) * cell + cell / 2, cy = Math.floor(ii / cols) * (maxR * 2 + 44) + maxR + 4, g = F.g.append('g').datum(it).attr('transform', `translate(${cx},${cy})`), arcs = g.selectAll('path').data(pie(it.parts)).join('path').attr('d', d3.arc().innerRadius(r * .55).outerRadius(r).padAngle(.012)).attr('fill', p => col(T, (K.find(q => q.k === p.data.k) || {}).color, K.findIndex(q => q.k === p.data.k))).attr('fill-opacity', isSoft(it.state) ? .55 : .92).attr('stroke', T.bg).attr('stroke-width', 1); g.append('circle').attr('r', r + 2).attr('fill', 'none').attr('stroke', T.ink).attr('stroke-width', 1.2).attr('stroke-dasharray', stateStyle(it.state || 'actual', id, T).dash); interactive(g, d => ({ title: d.label, value: `${num(tot, f.dec)} ${f.unit || ''} · ` + d.parts.map(p => `${(K.find(q => q.k === p.k) || {}).label || p.k} ${num(100 * p.value / d3.sum(d.parts, q => q.value), 0)} %`).join(' · '), state: d.state, src: d.src, detail: d.note }), T);
      txt(g, 0, 4, num(tot, f.dec), { a: 'middle', f: font(800, Math.max(10, Math.min(15, r * .3)), MONO), c: T.ink }); txt(g, 0, maxR + 22 - (maxR - r) * 0, it.label, { a: 'middle', f: font(700, comp ? 11 : 12.5), c: T.ink }); });
    legend(el, statesOf(I)); const ul = el.parentNode.querySelector('.fig-legend'); K.forEach((k, i) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" rx="6" fill="${col(T, k.color, i)}"/></svg>${k.label}`; ul.appendChild(li); }); const li = document.createElement('li'); li.textContent = 'Surface de l’anneau = total'; ul.appendChild(li);
  }
  REG('sizeddonuts', sizeddonuts, (f, r) => r(['Élément', 'Total', 'Composition', 'Source'], f.items.map(d => [d.label, num(d.total != null ? d.total : d3.sum(d.parts, p => p.value), 1), d.parts.map(p => p.k + ' ' + num(p.value, 0)).join(' / '), d.src || ''])));

  /* ============================== MAREY — graphique espace-temps (trajectoires entre étapes) ============================== */
  function marey(el, f, T) {
    const id = uid(), comp = isNarrow(el), St = f.stages, Tr = f.trips, labW = comp ? 80 : 140, rowH = comp ? 44 : 50, F = frame(el, id, St.length * rowH + 50, { l: labW, r: comp ? 70 : 120, t: 10, b: 30 }); addPatterns(F.defs, id, T); const isD = typeof Tr[0].points[0].t === 'string', tv = t => isD ? new Date(t) : t, all = Tr.flatMap(t => t.points.map(p => tv(p.t))), X = isD ? d3.scaleTime(d3.extent(all), [0, F.iw]).nice() : d3.scaleLinear(d3.extent(all), [0, F.iw]).nice(), Y = s => St.indexOf(s) * rowH + rowH / 2;
    St.forEach((s, i) => { F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', Y(s)).attr('y2', Y(s)).attr('stroke', T.line); rowLabel(F.g, s, Y(s), labW, T, comp ? 11 : 12.5, 700); }); axisStyle(F.g.append('g').attr('transform', `translate(0,${St.length * rowH})`).call((isD ? d3.axisBottom(X).ticks(Math.max(2, Math.floor(F.iw / 95))).tickFormat(d3.timeFormat(comp ? '%b %y' : '%b %Y')) : d3.axisBottom(X).ticks(comp ? 5 : 9, 'd')).tickSizeOuter(0)), T);
    Tr.forEach((t, i) => { const c = col(T, t.color, i), pts = t.points.map(p => [X(tv(p.t)), Y(p.stage)]), path = F.g.append('path').datum(t).attr('d', d3.line()(pts)).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2.8).attr('stroke-linejoin', 'round').attr('stroke-dasharray', stateStyle(t.state || 'actual', id, T).dash); interactive(path, d => ({ title: d.label, value: d.points.map(p => `${p.stage} (${isD ? d3.timeFormat('%b %Y')(new Date(p.t)) : p.t})`).join(' → '), state: d.state, src: d.src, detail: d.note }), T); F.g.selectAll(null).data(pts).join('circle').attr('cx', p => p[0]).attr('cy', p => p[1]).attr('r', 3.6).attr('fill', c).attr('stroke', T.bg).style('pointer-events', 'none'); const last = pts[pts.length - 1]; txt(F.g, last[0] + 8, last[1] + 4, t.label, { f: font(700, comp ? 10 : 11.5), c, halo: T.bg }); });
    legend(el, statesOf(Tr));
  }
  REG('marey', marey, (f, r) => r(['Trajectoire', 'Étapes (date)', 'Source'], f.trips.map(t => [t.label, t.points.map(p => p.stage + ' ' + p.t).join(' → '), t.src || ''])));

  /* ============================== PEDIGREE — arbre généalogique (filiation) ============================== */
  function pedigree(el, f, T) {
    const id = uid(), comp = isNarrow(el), root = d3.hierarchy(f.root, d => d.parents), depth = root.height, leaves = root.leaves().length, bh = comp ? 46 : 46, rowH = bh + 10, bw0 = (el.clientWidth || 640) / (depth + 1) - (comp ? 12 : 26), F = frame(el, id, leaves * rowH + 8, { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T); const cw = F.iw / (depth + 1), bw = Math.max(70, cw - (comp ? 12 : 26));
    let i = 0; root.eachAfter(n => { n.yy = n.children ? d3.mean(n.children, c => c.yy) : (i++) * rowH + bh / 2; }); root.each(n => n.xx = n.depth * cw);
    root.links().forEach(l => F.g.append('path').attr('d', `M${l.source.xx + bw},${l.source.yy}H${l.source.xx + bw + (cw - bw) / 2}V${l.target.yy}H${l.target.xx}`).attr('fill', 'none').attr('stroke', T.mid).attr('stroke-width', 1.6).attr('stroke-dasharray', stateStyle(l.target.data.state || 'actual', id, T).dash));
    const nodes = F.g.selectAll('g.pg').data(root.descendants()).join('g').attr('class', 'pg').attr('transform', n => `translate(${n.xx},${n.yy - bh / 2})`), r = nodes.append('rect').attr('width', bw).attr('height', bh).attr('rx', 5); paint(r, T, id, n => n.data.state, n => col(T, n.data.color, n.depth)); r.attr('fill-opacity', n => isSoft(n.data.state) ? 1 : .2).attr('stroke-width', 2);
    nodes.each(function (n) { const ls = wrapLines(n.data.label, bw - 10, comp ? 10 : 11.5, 700).slice(0, 2), t = d3.select(this).append('text').attr('fill', T.ink).style('font', font(700, comp ? 10 : 11.5)).style('pointer-events', 'none'); ls.forEach((ln, k) => t.append('tspan').attr('x', bw / 2).attr('text-anchor', 'middle').attr('y', bh / 2 + 4 - (ls.length - 1) * 6.2 + k * 12.4 - (n.data.year ? 3 : 0)).text(ln)); if (n.data.year) txt(d3.select(this), bw / 2, bh - 4, n.data.year, { a: 'middle', f: font(600, 9.5, MONO), c: T.mid }); }); interactive(nodes, n => ({ title: n.data.label, value: (n.data.year ? n.data.year + ' · ' : '') + (n.data.note || ''), state: n.data.state, src: n.data.src }), T);
    (f.genLabels || []).forEach((g, k) => txt(F.g, k * cw + bw / 2, -0, '', {})); legend(el, root.descendants().map(n => n.data.state || 'actual'));
  }
  REG('pedigree', pedigree, (f, r) => { const rows = []; (function w(n, d) { rows.push(['·'.repeat(d) + ' ' + n.label, n.year || '', n.src || '']); (n.parents || []).forEach(p => w(p, d + 1)); })(f.root, 0); return r(['Élément (parents indentés)', 'Année', 'Source'], rows); });

  /* ============================== TILEGRID — une case par pays / État, positions libres ============================== */
  function tilegrid(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.tiles, nc = d3.max(D, d => d.col) + 1, nr = d3.max(D, d => d.row) + 1, W = el.clientWidth || 640, ts = Math.min(comp ? 46 : 64, Math.floor((W - 8) / nc)), F = frame(el, id, nr * ts + 64, { l: Math.max(0, (W - nc * ts) / 2), r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T); const vals = D.map(d => d.value), cs = d3.scaleSequential(t => seq(T, t)).domain([d3.min(vals), d3.max(vals)]);
    const g = F.g.selectAll('g.tg').data(D).join('g').attr('class', 'tg').attr('transform', d => `translate(${d.col * ts},${d.row * ts})`), r = g.append('rect').attr('x', 1.5).attr('y', 1.5).attr('width', ts - 3).attr('height', ts - 3).attr('rx', 5).attr('fill', d => cs(d.value)).attr('stroke', d => d.highlight ? T.ink : 'none').attr('stroke-width', 2.4); interactive(g, d => ({ title: d.name || d.label, value: `${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T);
    g.filter(d => isSoft(d.state)).append('rect').attr('x', 1.5).attr('y', 1.5).attr('width', ts - 3).attr('height', ts - 3).attr('rx', 5).attr('fill', d => `url(#${id}-${d.state})`).attr('fill-opacity', .55).style('pointer-events', 'none');
    g.append('text').attr('x', ts / 2).attr('y', ts / 2 - 1).attr('text-anchor', 'middle').attr('fill', d => ink(T, d3.color(cs(d.value)).formatHex())).style('font', font(800, comp ? 11 : 13)).style('pointer-events', 'none').text(d => d.label); g.append('text').attr('x', ts / 2).attr('y', ts / 2 + (comp ? 11 : 13)).attr('text-anchor', 'middle').attr('fill', d => ink(T, d3.color(cs(d.value)).formatHex())).style('font', font(600, comp ? 9 : 10.5, MONO)).style('pointer-events', 'none').text(d => num(d.value, f.dec));
    const lw = Math.min(260, nc * ts), gid = id + 'gr', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .25).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', seq(T, t))); const ly = nr * ts + 18; F.g.append('rect').attr('x', 0).attr('y', ly).attr('width', lw).attr('height', 9).attr('rx', 4).attr('fill', `url(#${gid})`); txt(F.g, 0, ly + 24, num(d3.min(vals), f.dec), { f: font(600, 10.5, MONO), c: T.mid }); txt(F.g, lw, ly + 24, num(d3.max(vals), f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(600, 10.5, MONO), c: T.mid }); legend(el, statesOf(D));
  }
  REG('tilegrid', tilegrid, tableOf(['Zone', 'Valeur', 'État', 'Source'], d => [d.name || d.label, num(d.value, 2), SL(d.state), d.src], 'tiles'));

  /* ============================================================================================
   *  LOT 10 — FORMES SPÉCIALISÉES (ex-« priorité 3 ») : piper · durov · hovmoller · muller · taylor · chernoff · isobars · scatter3d
   * ============================================================================================ */

  /* ---- hydrochimie : pourcentages ioniques ---- */
  const ionPct = s => { const c = (s.ca || 0) + (s.mg || 0) + (s.na || 0) || 1, a = (s.cl || 0) + (s.so4 || 0) + (s.hco3 || 0) || 1; return { ca: 100 * (s.ca || 0) / c, mg: 100 * (s.mg || 0) / c, na: 100 * (s.na || 0) / c, cl: 100 * (s.cl || 0) / a, so4: 100 * (s.so4 || 0) / a, hco3: 100 * (s.hco3 || 0) / a }; };
  const triPts = (cx, base, s) => [[cx - s / 2, base], [cx + s / 2, base], [cx, base - s * Math.sqrt(3) / 2]];   // BL, BR, TOP
  const triDraw = (g, T, V, labs, ticks) => {
    g.append('path').attr('d', `M${V.map(p => p.join(',')).join('L')}Z`).attr('fill', T.line).attr('fill-opacity', .18).attr('stroke', T.ink).attr('stroke-width', 1.5);
    for (let k = 20; k < 100; k += 20) { const t = k / 100;[[0, 1, 2], [1, 2, 0], [2, 0, 1]].forEach(([i, j, l]) => { const a = [0, 0, 0], b = [0, 0, 0]; a[i] = t; a[j] = 1 - t; b[i] = t; b[l] = 1 - t; const P = w => [w[0] * V[0][0] + w[1] * V[1][0] + w[2] * V[2][0], w[0] * V[0][1] + w[1] * V[1][1] + w[2] * V[2][1]], pa = P(a), pb = P(b); g.append('line').attr('x1', pa[0]).attr('y1', pa[1]).attr('x2', pb[0]).attr('y2', pb[1]).attr('stroke', T.line).attr('stroke-opacity', .8); }); }
    txt(g, V[2][0], V[2][1] - 7, labs[2], { a: 'middle', f: font(800, 11), c: T.ink }); txt(g, V[0][0] - 2, V[0][1] + 15, labs[0], { a: 'start', f: font(800, 11), c: T.ink }); txt(g, V[1][0] + 2, V[1][1] + 15, labs[1], { a: 'end', f: font(800, 11), c: T.ink });
  };
  const triPos = (V, a, b, c) => [(a * V[0][0] + b * V[1][0] + c * V[2][0]) / 100, (a * V[0][1] + b * V[1][1] + c * V[2][1]) / 100];

  /* ============================== PIPER ============================== */
  function piper(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, s = Math.min((W - 24) / 2.2, 230), h = s * Math.sqrt(3) / 2, H = h + s * Math.sqrt(3) + 70, F = frame(el, id, H, { l: 8, r: 8, t: 18, b: 24 }); addPatterns(F.defs, id, T);
    const base = H - 18 - 24 - 10, cL = s / 2 + 2, cR = F.iw - s / 2 - 2, VL = triPts(cL, base, s), VR = triPts(cR, base, s), mid = F.iw / 2, dBot = base - h * .9, side = s * .98, dx = side * Math.cos(Math.PI / 6), dy = side * Math.sin(Math.PI / 6), Bt = [mid, dBot], Rv = [mid + dx, dBot - dy], Lv = [mid - dx, dBot - dy], Tp = [mid, dBot - 2 * dy];
    triDraw(F.g, T, VL, ['Ca', 'Na+K', 'Mg'], 0); triDraw(F.g, T, VR, ['HCO₃+CO₃', 'Cl', 'SO₄'], 0); txt(F.g, cL, base + 32, 'Cations (% meq)', { a: 'middle', f: font(600, 10.5), c: T.mid }); txt(F.g, cR, base + 32, 'Anions (% meq)', { a: 'middle', f: font(600, 10.5), c: T.mid });
    F.g.append('path').attr('d', `M${[Bt, Rv, Tp, Lv].map(p => p.join(',')).join('L')}Z`).attr('fill', T.line).attr('fill-opacity', .18).attr('stroke', T.ink).attr('stroke-width', 1.5);
    for (let k = 20; k < 100; k += 20) { const t = k / 100;[[Bt, Rv, Lv], [Bt, Lv, Rv]].forEach(([o, a, b]) => { const p1 = [o[0] + (a[0] - o[0]) * t, o[1] + (a[1] - o[1]) * t], p2 = [p1[0] + (b[0] - o[0]), p1[1] + (b[1] - o[1])]; F.g.append('line').attr('x1', p1[0]).attr('y1', p1[1]).attr('x2', p2[0]).attr('y2', p2[1]).attr('stroke', T.line).attr('stroke-opacity', .8); }); }
    txt(F.g, Rv[0] + 6, Rv[1] + 4, 'Na+K ↗', { f: font(700, 10), c: T.mid }); txt(F.g, Lv[0] - 6, Lv[1] + 4, '↖ Cl+SO₄', { a: 'end', f: font(700, 10), c: T.mid }); txt(F.g, Tp[0], Tp[1] - 6, 'Na+K + Cl+SO₄ élevés', { a: 'middle', f: font(600, 9.5), c: T.lo }); txt(F.g, Bt[0], Bt[1] + 14, 'Ca+Mg et HCO₃ dominants', { a: 'middle', f: font(600, 9.5), c: T.lo });
    const D = f.samples.map(sm => ({ ...sm, p: ionPct(sm) })), R = d3.scaleSqrt([0, d3.max(D, d => d.size || 1)], [3.5, comp ? 8 : 10]), groups = [...new Set(D.map(d => d.group || d.label))];
    D.forEach((d, i) => { const c = col(T, d.color, groups.indexOf(d.group || d.label)), pc = triPos(VL, d.p.ca, d.p.na, d.p.mg), pa = triPos(VR, d.p.hco3, d.p.cl, d.p.so4), cc = d.p.na / 100, aa = (d.p.cl + d.p.so4) / 100, pd = [Bt[0] + cc * (Rv[0] - Bt[0]) + aa * (Lv[0] - Bt[0]), Bt[1] + cc * (Rv[1] - Bt[1]) + aa * (Lv[1] - Bt[1])]; const g = F.g.append('g').datum(d), r = R(d.size || 1);
      [pc, pa, pd].forEach(p => { const k = g.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', r); paint(k, T, id, () => d.state, () => c); k.attr('stroke', T.bg).attr('stroke-width', 1.2).attr('fill-opacity', isSoft(d.state) ? 1 : .8); }); interactive(g, dd => ({ title: dd.label, value: `Ca ${num(dd.p.ca, 0)} · Mg ${num(dd.p.mg, 0)} · Na+K ${num(dd.p.na, 0)} % | HCO₃ ${num(dd.p.hco3, 0)} · Cl ${num(dd.p.cl, 0)} · SO₄ ${num(dd.p.so4, 0)} %`, state: dd.state, src: dd.src, detail: dd.note }), T); });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); if (groups.length > 1) groups.forEach((g, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="6" fill="${col(T, (D.find(d => d.group === g) || {}).color, k)}"/></svg>${g}`; ul.appendChild(li); });
  }
  REG('piper', piper, (f, r) => r(['Échantillon', 'Ca', 'Mg', 'Na+K', 'HCO₃', 'Cl', 'SO₄', 'Source'], f.samples.map(s => [s.label, s.ca, s.mg, s.na, s.hco3, s.cl, s.so4, s.src || ''])));

  /* ============================== DUROV ============================== */
  function durov(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, s = Math.min((W - 24) / 2.1, 220), h = s * Math.sqrt(3) / 2, rh = comp ? 150 : 190, H = h + rh + 130, F = frame(el, id, H, { l: 8, r: 8, t: 30, b: 8 }); addPatterns(F.defs, id, T);
    const D = f.samples.map(sm => ({ ...sm, p: ionPct(sm) })), groups = [...new Set(D.map(d => d.group || d.label))], cL = s / 2, cR = F.iw - s / 2, VL = triPts(cL, h + 4, s), VR = triPts(cR, h + 4, s);
    triDraw(F.g, T, VL, ['Ca', 'Na+K', 'Mg'], 0); triDraw(F.g, T, VR, ['HCO₃', 'Cl', 'SO₄'], 0); txt(F.g, cL, -14, 'Cations', { a: 'middle', f: font(700, 11), c: T.mid }); txt(F.g, cR, -14, 'Anions', { a: 'middle', f: font(700, 11), c: T.mid });
    const y0 = h + 52, pw = (F.iw - 30) / 2, rect = (x, title, xl, yl, yd, ylog) => { const g = F.g.append('g').attr('transform', `translate(${x},${y0})`); g.append('rect').attr('width', pw).attr('height', rh).attr('fill', T.line).attr('fill-opacity', .18).attr('stroke', T.ink).attr('stroke-width', 1.2); const Y = (ylog ? d3.scaleLog() : d3.scaleLinear()).domain(yd).range([rh, 0]); [0, .25, .5, .75, 1].forEach(t => { g.append('line').attr('x1', t * pw).attr('x2', t * pw).attr('y1', 0).attr('y2', rh).attr('stroke', T.line); }); (ylog ? [1, 10, 100, 1000, 10000, 100000].filter(v => v >= yd[0] && v <= yd[1]) : Y.ticks(4)).forEach(v => { g.append('line').attr('x1', 0).attr('x2', pw).attr('y1', Y(v)).attr('y2', Y(v)).attr('stroke', T.line); txt(g, -4, Y(v) + 3, ylog ? d3.format('~s')(v) : v, { a: 'end', f: font(500, 9.5, MONO), c: T.mid }); }); txt(g, pw / 2, rh + 14, xl, { a: 'middle', f: font(600, 10.5), c: T.mid }); txt(g, 0, -6, title, { f: font(700, 11), c: T.ink }); return { g, Y }; };
    const tdsR = d3.extent(D, d => d.tds), phR = d3.extent(D, d => d.ph), A = rect(8, `Minéralisation totale (${f.tdsUnit || 'mg/L'}) selon Na+K`, '% Na+K →', '', [Math.max(1, tdsR[0] * .6), tdsR[1] * 1.6], true), B = rect(pw + 22, 'pH selon Cl', '% Cl →', '', [Math.floor(phR[0] - .5), Math.ceil(phR[1] + .5)], false);
    D.forEach((d, i) => { const c = col(T, d.color, groups.indexOf(d.group || d.label)), pts = [[F.g, triPos(VL, d.p.ca, d.p.na, d.p.mg)], [F.g, triPos(VR, d.p.hco3, d.p.cl, d.p.so4)], [A.g, [d.p.na / 100 * pw, A.Y(d.tds)]], [B.g, [d.p.cl / 100 * pw, B.Y(d.ph)]]], gg = F.g.append('g').datum(d); pts.forEach(([g, p]) => { const k = g.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', comp ? 4.2 : 5.2); paint(k, T, id, () => d.state, () => c); k.attr('stroke', T.bg).attr('stroke-width', 1.2); interactive(k, () => ({ title: d.label, value: `Na+K ${num(d.p.na, 0)} % · Cl ${num(d.p.cl, 0)} % · TDS ${num(d.tds, 0)} ${f.tdsUnit || 'mg/L'} · pH ${num(d.ph, 1)}`, state: d.state, src: d.src, detail: d.note }), T); }); });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'); if (groups.length > 1) groups.forEach((g, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="6" fill="${col(T, (D.find(d => d.group === g) || {}).color, k)}"/></svg>${g}`; ul.appendChild(li); });
  }
  REG('durov', durov, (f, r) => r(['Échantillon', 'Ca', 'Mg', 'Na+K', 'HCO₃', 'Cl', 'SO₄', 'TDS', 'pH', 'Source'], f.samples.map(s => [s.label, s.ca, s.mg, s.na, s.hco3, s.cl, s.so4, s.tds, s.ph, s.src || ''])));

  /* ============================== HOVMOLLER ============================== */
  function hovmoller(el, f, T) {
    const id = uid(), comp = isNarrow(el), X = f.x, Tm = f.t, Z = f.z, labW = comp ? 54 : 80, F = frame(el, id, comp ? 380 : 440, { l: labW, r: 14, t: 12, b: 70 }); addPatterns(F.defs, id, T); const cw = F.iw / X.length, rh = F.ih / Tm.length, c0 = f.center != null ? f.center : 0, mx = d3.max(Z.flat(), v => Math.abs(v - c0)) || 1, cs = v => { const t = (v - c0) / mx; return t >= 0 ? d3.interpolateRgb(T.bg, T.neg)(Math.min(1, .08 + .92 * t)) : d3.interpolateRgb(T.bg, T.c1)(Math.min(1, .08 + .92 * -t)); };
    const cells = []; Tm.forEach((t, ti) => X.forEach((x, xi) => cells.push({ t, x, ti, xi, v: Z[ti][xi], state: (f.states || [])[ti] || 'actual' })));
    const r = F.g.selectAll('rect.hv').data(cells).join('rect').attr('class', 'hv').attr('x', d => d.xi * cw).attr('y', d => d.ti * rh).attr('width', cw + .6).attr('height', rh + .6).attr('fill', d => cs(d.v)); interactive(r, d => ({ title: `${f.xLabel || 'x'} ${d.x} · ${f.yLabel || 't'} ${d.t}`, value: `${num(d.v, f.dec)} ${f.unit || ''}`, state: d.state, src: f.src, detail: f.note }), T);
    F.g.selectAll('rect.ho').data(cells.filter(d => isSoft(d.state))).join('rect').attr('class', 'ho').attr('x', d => d.xi * cw).attr('y', d => d.ti * rh).attr('width', cw + .6).attr('height', rh + .6).attr('fill', d => `url(#${id}-${d.state})`).attr('fill-opacity', .4).style('pointer-events', 'none');
    const sx = Math.max(1, Math.ceil(X.length / (comp ? 5 : 10))), sy = Math.max(1, Math.ceil(Tm.length / (comp ? 8 : 12))); X.forEach((x, i) => { if (i % sx === 0) txt(F.g, i * cw + cw / 2, F.ih + 16, x, { a: 'middle', f: font(600, 10.5, MONO), c: T.mid }); }); Tm.forEach((t, i) => { if (i % sy === 0) txt(F.g, -6, i * rh + rh / 2 + 4, t, { a: 'end', f: font(600, 10.5, MONO), c: T.mid }); });
    txt(F.g, F.iw / 2, F.ih + 32, f.xLabel || '', { a: 'middle', f: font(700, 11), c: T.mid }); txt(F.g, -labW + 4, -2, (f.yLabel || '') + ' ↓', { f: font(700, 11), c: T.mid });
    (f.slopes || []).forEach(sl => { const xi0 = X.indexOf(sl.x0), xi1 = X.indexOf(sl.x1), ti0 = Tm.indexOf(sl.t0), ti1 = Tm.indexOf(sl.t1); const a = [xi0 * cw + cw / 2, ti0 * rh + rh / 2], b = [xi1 * cw + cw / 2, ti1 * rh + rh / 2]; F.g.append('line').attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]).attr('stroke', T.ink).attr('stroke-width', 2.4).attr('stroke-dasharray', '6 4').attr('marker-end', mark(F, id + sl.label, T, T.ink)); txt(F.g, (a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2 - 6, sl.label, { f: font(800, comp ? 10.5 : 12), c: T.ink, halo: T.bg }); });
    const lw = Math.min(280, F.iw - 20), gid = id + 'gr', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .1).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', cs(c0 + (t * 2 - 1) * mx))); F.g.append('rect').attr('x', (F.iw - lw) / 2).attr('y', F.ih + 46).attr('width', lw).attr('height', 9).attr('rx', 4).attr('fill', `url(#${gid})`); txt(F.g, (F.iw - lw) / 2, F.ih + 68, num(c0 - mx, f.dec), { f: font(600, 10.5, MONO), c: T.mid }); txt(F.g, F.iw / 2, F.ih + 68, num(c0, f.dec), { a: 'middle', f: font(600, 10.5, MONO), c: T.ink }); txt(F.g, (F.iw + lw) / 2, F.ih + 68, num(c0 + mx, f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(600, 10.5, MONO), c: T.mid }); legend(el, cells.map(d => d.state));
  }
  REG('hovmoller', hovmoller, (f, r) => r([f.yLabel || 'Temps', ...f.x.map(String)], f.t.map((t, i) => [t, ...f.z[i].map(v => num(v, 2))])));

  /* ============================== MULLER ============================== */
  function muller(el, f, T) {
    const id = uid(), comp = isNarrow(el), Tm = f.times, C = f.clones.map(c => ({ ...c })), by = Object.fromEntries(C.map(c => [c.id, c])), labW = comp ? 80 : 130, F = frame(el, id, comp ? 360 : 420, { l: 8, r: labW, t: 14, b: 34 }); addPatterns(F.defs, id, T);
    C.forEach(c => { c.kids = C.filter(k => k.parent === c.id); }); const tot = id2 => { const c = by[id2]; return c.values.map((v, i) => v + d3.sum(c.kids, k => tot(k.id)[i])); }; C.forEach(c => c.tot = tot(c.id)); const roots = C.filter(c => !c.parent), norm = Tm.map((t, i) => d3.sum(roots, r => r.tot[i]) || 1);
    const X = Tm.length > 1 ? d3.scalePoint(Tm.map(String), [0, F.iw]) : () => 0, Y = d3.scaleLinear([0, 1], [F.ih, 0]); C.forEach(c => { c.y0 = []; c.y1 = []; });
    const place = (c, base, i) => { const T0 = c.tot[i] / norm[i]; c.y0[i] = base; c.y1[i] = base + T0; let y = base + c.values[i] / norm[i]; c.kids.forEach(k => { place(k, y, i); y += k.tot[i] / norm[i]; }); }; Tm.forEach((t, i) => { let y = 0; roots.forEach(r => { place(r, y, i); y += r.tot[i] / norm[i]; }); });
    const order = []; (function walk(c) { order.push(c); c.kids.forEach(walk); })({ kids: roots, id: '__' }); const nodes = order.filter(c => c.id !== '__'); const area = d3.area().x((d, i) => X(String(Tm[i]))).y0(d => Y(d[0])).y1(d => Y(d[1])).curve(d3.curveBasis);
    nodes.forEach((c, k) => { const dat = Tm.map((t, i) => [c.y0[i], c.y1[i]]), p = F.g.append('path').datum(c).attr('d', area(dat)); paint(p, T, id, d => d.state, d => col(T, d.color, k)); p.attr('fill-opacity', isSoft(c.state) ? 1 : .88).attr('stroke', T.bg).attr('stroke-width', 1); interactive(p, d => ({ title: d.label + (d.parent ? ' (descend de ' + by[d.parent].label + ')' : ''), value: Tm.map((t, i) => `${t} : ${num(100 * d.values[i] / norm[i], 0)} %`).join(' · '), state: d.state, src: d.src, detail: d.note }), T); });
    nodes.forEach(c => { const i = Tm.length - 1, h = (c.y1[i] - c.y0[i]) * F.ih, own = c.values[i] / norm[i] * F.ih; if (own > 9) txt(F.g, F.iw + 8, Y((c.y0[i] + c.y0[i] + c.values[i] / norm[i]) / 2) + 4, comp ? trunc(c.label, 12) : c.label, { f: font(700, comp ? 10 : 11.5), c: col(T, c.color, nodes.indexOf(c)), halo: T.bg }); });
    Tm.forEach((t, i) => { if (i % Math.max(1, Math.ceil(Tm.length / (comp ? 5 : 10))) === 0 || i === Tm.length - 1) txt(F.g, X(String(t)), F.ih + 18, t, { a: i === 0 ? 'start' : i === Tm.length - 1 ? 'end' : 'middle', f: font(600, 10.5, MONO), c: T.mid }); }); txt(F.g, 0, -2, (comp ? 'Part (%) · lignée dans son ancêtre' : 'Part de la population (%) · chaque lignée est dessinée à l’intérieur de celle dont elle descend'), { f: font(500, 10), c: T.mid }); legend(el, statesOf(nodes));
  }
  REG('muller', muller, (f, r) => r(['Lignée', 'Descend de', ...f.times.map(String), 'Source'], f.clones.map(c => [c.label, c.parent ? (f.clones.find(k => k.id === c.parent) || {}).label : '—', ...c.values.map(v => num(v, 2)), c.src || ''])));

  /* ============================== TAYLOR ============================== */
  function taylor(el, f, T) {
    const id = uid(), comp = isNarrow(el), W = el.clientWidth || 640, S = Math.min(W - 20, comp ? 360 : 520), F = frame(el, id, S * .86 + 40, { l: 34, r: 14, t: 14, b: 34 }); addPatterns(F.defs, id, T); const ref = f.refStd != null ? f.refStd : 1, mxS = f.maxStd || Math.ceil(Math.max(ref, d3.max(f.models, m => m.std)) * 1.1 * 4) / 4, R = Math.min(F.iw - 46, F.ih * .94), sc = d3.scaleLinear([0, mxS], [0, R]), O = [0, F.ih * .98], P = (r, th) => [O[0] + sc(r) * Math.cos(th), O[1] - sc(r) * Math.sin(th)];
    d3.range(.25, mxS + .001, .25).forEach(r => { F.g.append('path').attr('d', d3.arc().innerRadius(sc(r)).outerRadius(sc(r)).startAngle(0).endAngle(Math.PI / 2)()).attr('transform', `translate(${O[0]},${O[1]})`).attr('fill', 'none').attr('stroke', T.line); txt(F.g, O[0] + sc(r), O[1] + 14, num(r, 2), { a: 'middle', f: font(600, 9.5, MONO), c: T.mid }); txt(F.g, O[0] - 4, O[1] - sc(r) + 3, num(r, 2), { a: 'end', f: font(600, 9.5, MONO), c: T.mid }); });
    [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, .95, .99, 1].forEach(c => { const th = Math.acos(c), a = P(0, th), b = P(mxS, th); F.g.append('line').attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]).attr('stroke', c % .5 === 0 ? T.mid : T.line).attr('stroke-dasharray', c > .8 ? '2 3' : null); const lp = P(mxS * 1.04, th); txt(F.g, lp[0], lp[1] + 3, c === 1 ? '1' : c, { a: 'start', f: font(600, 9.5, MONO), c: T.mid }); });
    F.g.append('path').attr('d', d3.arc().innerRadius(sc(mxS)).outerRadius(sc(mxS)).startAngle(0).endAngle(Math.PI / 2)()).attr('transform', `translate(${O[0]},${O[1]})`).attr('fill', 'none').attr('stroke', T.ink).attr('stroke-width', 1.6);
    const rp = P(ref, 0); [.25, .5, .75, 1].forEach(q => { const r = q * ref; F.g.append('circle').attr('cx', rp[0]).attr('cy', rp[1]).attr('r', sc(r)).attr('fill', 'none').attr('stroke', T.neg).attr('stroke-opacity', .5).attr('stroke-dasharray', '3 3').attr('clip-path', `url(#${id}cl)`); }); F.defs.append('clipPath').attr('id', id + 'cl').append('path').attr('d', `M${O[0]},${O[1]}L${O[0] + sc(mxS)},${O[1]}A${sc(mxS)},${sc(mxS)} 0 0 0 ${O[0]},${O[1] - sc(mxS)}Z`);
    txt(F.g, F.iw * .55, F.ih + 28, 'Écart-type (même unité que la référence)', { a: 'middle', f: font(600, 10.5), c: T.mid }); { const cl = P(mxS * 1.2, Math.PI / 4); txt(F.g, cl[0], cl[1], 'Corrélation', { a: 'start', f: font(700, 11), c: T.mid }); }
    F.g.append('path').attr('d', 'M0,0').attr('opacity', 0); const rr = F.g.append('g'); rr.append('circle').attr('cx', rp[0]).attr('cy', rp[1]).attr('r', 6).attr('fill', T.ink); txt(rr, rp[0], rp[1] + 16, f.refLabel || 'Référence', { a: 'middle', f: font(800, 11), c: T.ink });
    f.models.forEach((m, i) => { const p = P(m.std, Math.acos(Math.max(-1, Math.min(1, m.corr)))), c = col(T, m.color, i), k = F.g.append('circle').datum(m).attr('cx', p[0]).attr('cy', p[1]).attr('r', 7); paint(k, T, id, d => d.state, () => c); k.attr('stroke', T.bg).attr('stroke-width', 1.6); const rms = Math.sqrt(m.std * m.std + ref * ref - 2 * m.std * ref * m.corr); interactive(k, d => ({ title: d.label, value: `écart-type ${num(d.std, 2)} · corrélation ${num(d.corr, 2)} · erreur centrée (RMS) ${num(rms, 2)}`, state: d.state, src: d.src, detail: d.note }), T); txt(F.g, p[0] + 10, p[1] + 4, m.label, { f: font(700, comp ? 10.5 : 11.5), c, halo: T.bg }); });
    legend(el, statesOf(f.models)); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = 'Plus un point est proche de la référence, meilleur est le modèle · cercles pointillés rouges = erreur centrée'; ul.appendChild(li);
  }
  REG('taylor', taylor, (f, r) => r(['Modèle', 'Écart-type', 'Corrélation', 'Source'], f.models.map(m => [m.label, num(m.std, 2), num(m.corr, 2), m.src || ''])));

  /* ============================== CHERNOFF ============================== */
  function chernoff(el, f, T) {
    const id = uid(), comp = isNarrow(el), I = f.items, Ft = f.features, W = el.clientWidth || 640, cols = Math.max(2, Math.floor(W / (comp ? 112 : 140))), cell = W / cols, R = Math.min(cell / 2 - 10, comp ? 40 : 52), rows = Math.ceil(I.length / cols), keyH = Ft.length * 16 + 14, F = frame(el, id, rows * (R * 2 + 36) + keyH + 10, { l: 0, r: 0, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const sc = {}; Ft.forEach(ft => { const vals = I.map(d => d.values[ft.v]); sc[ft.v] = d3.scaleLinear([ft.min != null ? ft.min : d3.min(vals), ft.max != null ? ft.max : d3.max(vals)], [0, 1]).clamp(true); });
    const get = (d, feat) => { const ft = Ft.find(q => q.feature === feat); return ft ? sc[ft.v](d.values[ft.v]) : .5; };
    I.forEach((d, i) => { const cx = (i % cols) * cell + cell / 2, cy = Math.floor(i / cols) * (R * 2 + 36) + R + 6, g = F.g.append('g').datum(d).attr('transform', `translate(${cx},${cy})`), c = col(T, d.color, 0), fw = R * (.72 + .28 * get(d, 'face')), fh = R * .96, ex = R * (.26 + .14 * get(d, 'eyedist')), er = R * (.1 + .12 * get(d, 'eyes')), mw = R * (.28 + .3 * get(d, 'mouthwidth')), mc = (get(d, 'mouth') - .5) * R * .9, nl = R * (.12 + .22 * get(d, 'nose')), bs = (get(d, 'brow') - .5) * R * .36, pr = er * (.35 + .4 * get(d, 'pupil'));
      const face = g.append('ellipse').attr('rx', fw).attr('ry', fh); paint(face, T, id, () => d.state, () => c); face.attr('fill-opacity', isSoft(d.state) ? 1 : .22).attr('stroke-width', 2.2); [-1, 1].forEach(s => { g.append('ellipse').attr('cx', s * ex).attr('cy', -R * .2).attr('rx', er * 1.15).attr('ry', er).attr('fill', T.bg).attr('stroke', T.ink).attr('stroke-width', 1.4); g.append('circle').attr('cx', s * ex).attr('cy', -R * .2).attr('r', pr).attr('fill', T.ink); g.append('line').attr('x1', s * (ex - er * 1.3)).attr('x2', s * (ex + er * 1.3)).attr('y1', -R * .2 - er * 1.7 + s * bs * -1).attr('y2', -R * .2 - er * 1.7 + s * bs).attr('stroke', T.ink).attr('stroke-width', 2.2).attr('stroke-linecap', 'round'); });
      g.append('path').attr('d', `M0,${-R * .02}v${nl}`).attr('stroke', T.ink).attr('stroke-width', 1.6).attr('fill', 'none').attr('stroke-linecap', 'round'); g.append('path').attr('d', `M${-mw},${R * .5}Q0,${R * .5 + mc * 2} ${mw},${R * .5}`).attr('stroke', T.neg).attr('stroke-width', 2.6).attr('fill', 'none').attr('stroke-linecap', 'round');
      interactive(g, dd => ({ title: dd.label, value: Ft.map(ft => `${ft.label} ${num(dd.values[ft.v], f.dec)}`).join(' · '), state: dd.state, src: dd.src, detail: dd.note }), T); txt(g, 0, R + 22, d.label, { a: 'middle', f: font(700, comp ? 11 : 12.5), c: T.ink }); });
    const ky = rows * (R * 2 + 36) + 8; Ft.forEach((ft, k) => txt(F.g, 6, ky + k * 16 + 10, `${({ face: 'largeur du visage', eyes: 'taille des yeux', eyedist: 'écart des yeux', mouth: 'sourire (↑) / moue (↓)', mouthwidth: 'largeur de la bouche', brow: 'sourcils relevés', nose: 'longueur du nez', pupil: 'pupilles' })[ft.feature] || ft.feature} = ${ft.label}`, { f: font(600, 11), c: T.mid })); legend(el, statesOf(I));
  }
  REG('chernoff', chernoff, (f, r) => r(['Élément', ...f.features.map(ft => ft.label), 'Source'], f.items.map(d => [d.label, ...f.features.map(ft => num(d.values[ft.v], 2)), d.src || ''])));

  /* ============================== ISOBARS — barres isométriques ============================== */
  function isobars(el, f, T) {
    const id = uid(), comp = isNarrow(el), Xs = f.x, Ys = f.y, D = f.data, W = el.clientWidth || 640, nx = Xs.length, ny = Ys.length, mx = d3.max(D, d => d.value), cw = Math.min(70, (W - 40) / ((nx + ny) * .87)), cos = Math.cos(Math.PI / 6), sin = .5, zH = Math.min(220, cw * 3.2 * (nx + ny) / 4), H = (nx + ny) * cw * sin + zH + 70, F = frame(el, id, H, { l: 0, r: 0, t: 6, b: 6 }); addPatterns(F.defs, id, T); const ox = F.iw / 2 + (ny - nx) * cw * cos / 2, oy = zH + 24, iso = (x, y, z) => [ox + (x - y) * cw * cos, oy + (x + y) * cw * sin - z * zH / mx], cs = d3.scaleSequential(t => seq(T, t)).domain([0, mx]);
    for (let i = 0; i <= nx; i++) { const a = iso(i, 0, 0), b = iso(i, ny, 0); F.g.append('line').attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]).attr('stroke', T.line); } for (let j = 0; j <= ny; j++) { const a = iso(0, j, 0), b = iso(nx, j, 0); F.g.append('line').attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]).attr('stroke', T.line); }
    Xs.forEach((x, i) => { const p = iso(i + .5, ny, 0); txt(F.g, p[0] + 6, p[1] + 14, trunc(x, comp ? 5 : 9), { f: font(700, comp ? 9.5 : 11), c: T.mid }); }); Ys.forEach((y, j) => { const p = iso(nx, j + .5, 0); txt(F.g, p[0] + 8, p[1] + 4, trunc(y, comp ? 6 : 12), { f: font(700, comp ? 9.5 : 11), c: T.mid }); });
    const bars = D.map(d => ({ d, i: Xs.indexOf(d.x), j: Ys.indexOf(d.y) })).sort((a, b) => (a.i + a.j) - (b.i + b.j)), g = F.g.append('g'), m = .12;
    bars.forEach(b => { const x0 = b.i + m, x1 = b.i + 1 - m, y0 = b.j + m, y1 = b.j + 1 - m, z = b.d.value, c = cs(z), top = [iso(x0, y0, z), iso(x1, y0, z), iso(x1, y1, z), iso(x0, y1, z)], left = [iso(x0, y1, z), iso(x1, y1, z), iso(x1, y1, 0), iso(x0, y1, 0)], right = [iso(x1, y0, z), iso(x1, y1, z), iso(x1, y1, 0), iso(x1, y0, 0)], poly = pts => 'M' + pts.map(p => p.join(',')).join('L') + 'Z', grp = g.append('g').datum(b.d);
      [[left, d3.color(c).darker(.7)], [right, d3.color(c).darker(1.3)], [top, d3.color(c).brighter(.25)]].forEach(([pts, cc]) => grp.append('path').attr('d', poly(pts)).attr('fill', cc.formatHex()).attr('stroke', T.bg).attr('stroke-width', .8)); if (isSoft(b.d.state)) grp.append('path').attr('d', poly(top)).attr('fill', `url(#${id}-${b.d.state})`).attr('fill-opacity', .7); interactive(grp, d => ({ title: `${d.y} · ${d.x}`, value: `${num(d.value, f.dec)} ${f.unit || ''}`, state: d.state, src: d.src, detail: d.note }), T); });
    const lw = Math.min(260, F.iw - 20), gid = id + 'gr', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .25).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', seq(T, t))); F.g.append('rect').attr('x', (F.iw - lw) / 2).attr('y', H - 34).attr('width', lw).attr('height', 8).attr('rx', 4).attr('fill', `url(#${gid})`); txt(F.g, (F.iw - lw) / 2, H - 10, '0', { f: font(600, 10.5, MONO), c: T.mid }); txt(F.g, (F.iw + lw) / 2, H - 10, num(mx, f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(600, 10.5, MONO), c: T.mid }); legend(el, statesOf(D));
  }
  REG('isobars', isobars, tableOf(['Ligne', 'Colonne', 'Valeur', 'Source'], d => [d.y, d.x, num(d.value, 2), d.src]));

  /* ============================== SCATTER3D — nuage 3D, que l'on fait pivoter ============================== */
  function scatter3d(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, groups = [...new Set(D.map(d => d.group || 'a'))]; el.innerHTML = ''; const bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin:0 0 .4rem'; const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ex-btn ghost'; btn.textContent = 'Réinitialiser la vue'; const hint = document.createElement('span'); hint.style.cssText = 'font:500 .8rem var(--vra-sans);color:var(--vra-mid)'; hint.textContent = 'Glissez pour faire pivoter (ou flèches du clavier après un clic).'; bar.append(btn, hint); el.appendChild(bar); const holder = document.createElement('div'); el.appendChild(holder);
    const F = frame(holder, id, comp ? 340 : 440, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T); const svg = d3.select(holder).select('svg').attr('tabindex', 0).style('cursor', 'grab').style('touch-action', 'none'), S = Math.min(F.iw, F.ih) * (comp ? .24 : .29), cx = F.iw / 2, cy = F.ih / 2 + 4;
    const ext = k => d3.extent(D, d => d[k]), nrm = (k, v) => { const e = ext(k); return (v - e[0]) / ((e[1] - e[0]) || 1) * 2 - 1; }; let yaw = -.6, pitch = .42; const v0 = [yaw, pitch];
    const proj = (x, y, z) => { const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), x1 = x * cyw - y * syw, y1 = x * syw + y * cyw, y2 = y1 * cp - z * sp, z2 = y1 * sp + z * cp, k = 1 / (1 - z2 * .18); return [cx + x1 * S * k * 1.15, cy - y2 * S * k * 1.15, z2]; };
    const g = F.g, edgesG = g.append('g'), ptsG = g.append('g'), labG = g.append('g'), edges = [[-1, -1, -1, 1, -1, -1], [-1, -1, -1, -1, 1, -1], [-1, -1, -1, -1, -1, 1], [1, -1, -1, 1, 1, -1], [1, -1, -1, 1, -1, 1], [-1, 1, -1, 1, 1, -1], [-1, 1, -1, -1, 1, 1], [-1, -1, 1, 1, -1, 1], [-1, -1, 1, -1, 1, 1], [1, 1, -1, 1, 1, 1], [1, -1, 1, 1, 1, 1], [-1, 1, 1, 1, 1, 1]];
    const R = d3.scaleSqrt([0, d3.max(D, d => d.size || 1)], [3, comp ? 8 : 10]), items = D.map(d => ({ d, x: nrm('x', d.x), y: nrm('y', d.y), z: nrm('z', d.z) }));
    const el1 = edgesG.selectAll('line').data(edges).join('line').attr('stroke', T.mid).attr('stroke-opacity', .55), floor = []; for (let k = -1; k <= 1.01; k += .5) { floor.push([k, -1, -1, k, 1, -1]); floor.push([-1, k, -1, 1, k, -1]); } const fl = edgesG.selectAll('line.fl').data(floor).join('line').attr('class', 'fl').attr('stroke', T.line).attr('stroke-opacity', .8);
    const pts = ptsG.selectAll('circle').data(items).join('circle'); pts.each(function (it) { const d = it.d; const st = stateStyle(d.state || 'actual', id, T), c = col(T, d.color, groups.indexOf(d.group || 'a')); d3.select(this).attr('fill', isSoft(d.state) ? st.fill : c).attr('stroke', c).attr('stroke-width', 1.4).attr('stroke-dasharray', st.dash).attr('fill-opacity', .88); }); interactive(pts, it => ({ title: it.d.label, value: `${f.xLabel || 'x'} ${num(it.d.x, f.dec)} · ${f.yLabel || 'y'} ${num(it.d.y, f.dec)} · ${f.zLabel || 'z'} ${num(it.d.z, f.dec)}`, state: it.d.state, src: it.d.src, detail: it.d.note }), T);
    const axLab = [['x', [1, -1, -1], f.xLabel], ['y', [-1, 1, -1], f.yLabel], ['z', [-1, -1, 1], f.zLabel]].map(([k, p, t]) => ({ p, t })), labs = labG.selectAll('text').data(axLab).join('text').attr('fill', T.ink).style('font', font(800, comp ? 11 : 12.5)).style('pointer-events', 'none').attr('text-anchor', 'middle').text(d => d.t);
    function draw() { el1.each(function (e) { const a = proj(e[0], e[1], e[2]), b = proj(e[3], e[4], e[5]); d3.select(this).attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]); }); fl.each(function (e) { const a = proj(e[0], e[1], e[2]), b = proj(e[3], e[4], e[5]); d3.select(this).attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]); }); items.forEach(it => { it.q = proj(it.x, it.y, it.z); }); pts.sort((a, b) => a.q[2] - b.q[2]).attr('cx', it => it.q[0]).attr('cy', it => it.q[1]).attr('r', it => R(it.d.size || 1) * (1 + it.q[2] * .22)); labs.attr('x', d => proj(d.p[0] * 1.12, d.p[1] * 1.12, d.p[2] * 1.12)[0]).attr('y', d => proj(d.p[0] * 1.12, d.p[1] * 1.12, d.p[2] * 1.12)[1] + 4); }
    let drag = null; svg.on('pointerdown', e => { drag = [e.clientX, e.clientY]; svg.style('cursor', 'grabbing'); try { svg.node().setPointerCapture(e.pointerId); } catch (x) { } }).on('pointermove', e => { if (!drag) return; yaw += (e.clientX - drag[0]) * .008; pitch = Math.max(-1.45, Math.min(1.45, pitch + (e.clientY - drag[1]) * .008)); drag = [e.clientX, e.clientY]; draw(); }).on('pointerup pointercancel', () => { drag = null; svg.style('cursor', 'grab'); }).on('keydown', e => { const k = { ArrowLeft: [-.12, 0], ArrowRight: [.12, 0], ArrowUp: [0, -.12], ArrowDown: [0, .12] }[e.key]; if (k) { e.preventDefault(); yaw += k[0]; pitch = Math.max(-1.45, Math.min(1.45, pitch + k[1])); draw(); } });
    btn.onclick = () => { yaw = v0[0]; pitch = v0[1]; draw(); }; draw(); legend(holder, statesOf(D)); const ul = holder.parentNode.querySelector('.fig-legend'); if (groups.length > 1 && D.some(d => d.group)) groups.forEach((gr, k) => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="6" fill="${col(T, (D.find(d => d.group === gr) || {}).color, k)}"/></svg>${gr}`; ul.appendChild(li); });
  }
  REG('scatter3d', scatter3d, tableOf(['Élément', 'x', 'y', 'z', 'Source'], d => [d.label, num(d.x, 2), num(d.y, 2), num(d.z, 2), d.src]));

  /* ============================================================================================
   *  LOT 6 — TEXTURES, POINTILLÉ ET MATIÈRE (inspirés du stippling de Veltman, des cartes topographiques, du ciel étoilé…)
   *  stippletiles · stipple · isolines · delaunaymosaic · treerings · constellation · orbits · seismogram
   *  Idées d'origine : « Stippling #2 » (Jim Vallandingham / Veltman, rejet + relaxation de Lloyd), cartes de niveau, low-poly, dendrochronologie.
   *  Code entièrement réécrit ici (aucune ligne copiée) ; chaque forme garde un encodage honnête (la légende dit ce qui est décoratif).
   * ============================================================================================ */
  const lcg = seed => d3.randomLcg(seed || 0.5);
  const niceUnit = v => { if (!(v > 0)) return 1; const e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; };
  /* relaxation de Lloyd dans un rectangle : répartit n points de façon régulière */
  function relaxRect(n, x0, y0, x1, y1, rnd, iters) {
    let P = Array.from({ length: n }, () => [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)]);
    if (n < 4) return P.map((p, i) => n === 1 ? [(x0 + x1) / 2, (y0 + y1) / 2] : [x0 + (i + 1) * (x1 - x0) / (n + 1), (y0 + y1) / 2]);
    for (let k = 0; k < iters; k++) { const v = d3.Delaunay.from(P).voronoi([x0, y0, x1, y1]); P = P.map((p, i) => { const c = v.cellPolygon(i); return c ? d3.polygonCentroid(c) : p; }); }
    return P;
  }

  /* ============================== STIPPLETILES — la teinte = la valeur (pointillé par tuiles) ============================== */
  function stippletiles(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.items, W = el.clientWidth || 640, cols = comp ? 2 : Math.min(3, D.length), rows = Math.ceil(D.length / cols), gap = 14, F0 = frame(el, id, 10, { l: 4, r: 4, t: 4, b: 4 });
    const tw = (F0.iw - gap * (cols - 1)) / cols, th = Math.min(tw * .74, 170), uv = f.unitValue || niceUnit(d3.max(D, d => d.value) / (comp ? 90 : 150)), cnt = D.map(d => Math.max(1, Math.round(d.value / uv))), mx = d3.max(cnt);
    const F = frame(el, id, rows * (th + 46) + 8, { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const rad = Math.max(1.4, Math.min(5.2, .34 * Math.sqrt(tw * th / mx))), rnd = lcg(.37);
    const tiles = F.g.selectAll('g.tile').data(D.map((d, i) => ({ ...d, i, n: cnt[i] }))).join('g').attr('class', 'tile').attr('transform', d => `translate(${(d.i % cols) * (tw + gap)},${Math.floor(d.i / cols) * (th + 46)})`);
    interactive(tiles, d => ({ title: d.label, value: `${num(d.value, f.dec)} ${f.unit || ''}`.trim(), detail: `${d.n} points (1 point ≈ ${num(uv, uv < 1 ? 2 : 0)} ${f.unit || ''}). ${d.note || ''}`.trim(), state: d.state, src: d.src }), T);
    tiles.each(function (d) {
      const g = d3.select(this), st = stateStyle(d.state || 'actual', id, T), c = col(T, d.color, d.i);
      g.append('rect').attr('width', tw).attr('height', th).attr('rx', 8).attr('fill', T.line).attr('fill-opacity', .13).attr('stroke', isSoft(d.state) ? st.stroke : T.line).attr('stroke-dasharray', isSoft(d.state) ? st.dash : null).attr('stroke-width', 1.4);
      relaxRect(d.n, 7, 7, tw - 7, th - 7, rnd, 14).forEach(p => g.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', rad).attr('fill', c).attr('fill-opacity', isSoft(d.state) ? .62 : .92));
      if (isSoft(d.state)) g.append('rect').attr('width', tw).attr('height', th).attr('rx', 8).attr('fill', `url(#${id}-${d.state})`).attr('fill-opacity', .35).style('pointer-events', 'none');
      txt(g, 2, th + 17, trunc(d.label, comp ? 20 : 34), { f: font(700, comp ? 11.5 : 12.5), c: T.ink }); txt(g, 2, th + 34, `${num(d.value, f.dec)} ${f.unit || ''} · ${d.n} points`.trim(), { f: font(600, 11, MONO), c: T.mid });
    });
    legend(el, statesOf(D)); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = `Même surface par tuile : plus la tuile est dense, plus la valeur est forte · 1 point ≈ ${num(uv, uv < 1 ? 2 : 0)} ${f.unit || ''}`; ul.appendChild(li);
  }
  REG('stippletiles', stippletiles, tableOf(['Tuile', 'Valeur', 'État', 'Source'], d => [d.label, num(d.value, 2), SL(d.state), d.src], 'items'));

  /* ============================== STIPPLE — pointillé de densité (rejet + Lloyd pondéré, dessiné à la main de zéro) ============================== */
  function densityField(P, X, Y, iw, ih, nx, ny, bw) {
    const d = new Float32Array(nx * ny), dx = iw / nx, dy = ih / ny, px = P.map(p => [X(p.x), Y(p.y), p.w == null ? 1 : p.w]), two = 2 * bw * bw; let mx = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const gx = (i + .5) * dx, gy = (j + .5) * dy; let s = 0; for (const q of px) { const ex = gx - q[0], ey = gy - q[1], r2 = ex * ex + ey * ey; if (r2 < 9 * bw * bw) s += q[2] * Math.exp(-r2 / two); } d[j * nx + i] = s; if (s > mx) mx = s; }
    return { d, mx: mx || 1, nx, ny, dx, dy };
  }
  function stipple(el, f, T) {
    const id = uid(), comp = isNarrow(el), P = f.points, W = el.clientWidth || 640, H = Math.round(Math.min(W * (comp ? .85 : .58), 460)), F = frame(el, id, H, { l: 44, r: 14, t: 10, b: 38 }); addPatterns(F.defs, id, T);
    const ext = (k, pad) => { const e = d3.extent(P, p => p[k]), s = (e[1] - e[0]) || 1; return f[k + 'Domain'] || [e[0] - s * pad, e[1] + s * pad]; }, X = d3.scaleLinear(ext('x', .06), [0, F.iw]), Y = d3.scaleLinear(ext('y', .08), [F.ih, 0]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 4 : 7).tickSizeOuter(0)), T); axisStyle(F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickSizeOuter(0)), T);
    if (f.xLabel) txt(F.g, F.iw, F.ih + 32, f.xLabel, { a: 'end', f: font(600, 11), c: T.mid }); if (f.yLabel) txt(F.g, -38, -2, f.yLabel, { f: font(600, 11), c: T.mid });
    const nx = comp ? 64 : 100, ny = Math.max(20, Math.round(nx * F.ih / F.iw)), bw = (f.bandwidth || .07) * F.iw, fld = densityField(P, X, Y, F.iw, F.ih, nx, ny, bw), rnd = lcg(.61), N = f.dots || (comp ? 380 : 800);
    let pts = [], tries = 0; while (pts.length < N && tries++ < N * 400) { const x = rnd() * F.iw, y = rnd() * F.ih, v = fld.d[Math.min(ny - 1, Math.floor(y / fld.dy)) * nx + Math.min(nx - 1, Math.floor(x / fld.dx))]; if (rnd() < Math.pow(v / fld.mx, .85)) pts.push([x, y]); }
    for (let it = 0; it < 22 && pts.length > 3; it++) { const del = d3.Delaunay.from(pts), sx = new Float64Array(pts.length), sy = new Float64Array(pts.length), sw = new Float64Array(pts.length); let h = 0;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const w = fld.d[j * nx + i]; if (w < fld.mx * .004) continue; const gx = (i + .5) * fld.dx, gy = (j + .5) * fld.dy; h = del.find(gx, gy, h); sx[h] += w * gx; sy[h] += w * gy; sw[h] += w; }
      pts = pts.map((p, i) => sw[i] > 0 ? [Math.max(1, Math.min(F.iw - 1, sx[i] / sw[i])), Math.max(1, Math.min(F.ih - 1, sy[i] / sw[i]))] : p); }
    const del2 = d3.Delaunay.from(pts), dens = p => fld.d[Math.min(ny - 1, Math.floor(p[1] / fld.dy)) * nx + Math.min(nx - 1, Math.floor(p[0] / fld.dx))] / fld.mx, c = col(T, f.color, 0);
    pts.forEach((p, i) => { let nn = 1e9; for (const j of del2.neighbors(i)) nn = Math.min(nn, Math.hypot(p[0] - pts[j][0], p[1] - pts[j][1])); const r = Math.max(.9, Math.min(.46 * nn, 1.1 + 3.4 * Math.sqrt(dens(p)))); F.g.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', r).attr('fill', c).attr('fill-opacity', isSoft(f.state) ? .65 : .88); });
    const hit = F.g.append('rect').attr('width', F.iw).attr('height', F.ih).attr('fill', 'transparent').attr('tabindex', 0).attr('role', 'img').attr('aria-label', (f.label || 'Pointillé de densité') + ' : survolez pour compter les observations proches');
    const near = (mx, my) => { const R = .1 * F.iw; let s = 0, n = 0; for (const p of P) { if (Math.hypot(X(p.x) - mx, Y(p.y) - my) <= R) { s += p.w == null ? 1 : p.w; n++; } } return { s, n }; };
    hit.on('pointermove', e => { const b = hit.node().getBoundingClientRect(), mx = e.clientX - b.left, my = e.clientY - b.top, r = near(mx, my); C.helpers.showTip(`<strong>${num(X.invert(mx), 1)} ; ${num(Y.invert(my), 1)}</strong><span>${r.n} observation(s) à moins de ${num(.1 * (X.domain()[1] - X.domain()[0]), 1)} (unité de x) · poids ${num(r.s, 1)}</span><small>${SL(f.state)}${f.src ? ' · ' + f.src : ''}</small>`, e.clientX, e.clientY); }).on('pointerleave', C.helpers.hideTip);
    legend(el, [f.state || 'actual']); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = `${pts.length} points : plus ils sont serrés et gros, plus la densité d'observations est forte (rejet + relaxation de Lloyd pondérée). La position exacte d'un point n'est pas une donnée.`; ul.appendChild(li);
  }
  REG('stipple', stipple, (f, r) => r(['x', 'y', 'Poids', 'État', 'Source'], f.points.map(p => [num(p.x, 2), num(p.y, 2), p.w == null ? 1 : p.w, SL(p.state || f.state), p.src || f.src || ''])));

  /* ============================== ISOLINES — carte de niveaux d'une densité ============================== */
  function isolines(el, f, T) {
    const id = uid(), comp = isNarrow(el), P = f.points, W = el.clientWidth || 640, H = Math.round(Math.min(W * (comp ? .85 : .58), 460)), F = frame(el, id, H, { l: 44, r: 14, t: 10, b: 38 }); addPatterns(F.defs, id, T);
    const ext = (k, pad) => { const e = d3.extent(P, p => p[k]), s = (e[1] - e[0]) || 1; return f[k + 'Domain'] || [e[0] - s * pad, e[1] + s * pad]; }, X = d3.scaleLinear(ext('x', .08), [0, F.iw]), Y = d3.scaleLinear(ext('y', .1), [F.ih, 0]);
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 4 : 7).tickSizeOuter(0)), T); axisStyle(F.g.append('g').call(d3.axisLeft(Y).ticks(5).tickSizeOuter(0)), T);
    if (f.xLabel) txt(F.g, F.iw, F.ih + 32, f.xLabel, { a: 'end', f: font(600, 11), c: T.mid }); if (f.yLabel) txt(F.g, -38, -2, f.yLabel, { f: font(600, 11), c: T.mid });
    const n = f.levels || 8, cd = d3.contourDensity().x(p => X(p.x)).y(p => Y(p.y)).weight(p => p.w == null ? 1 : p.w).size([F.iw, F.ih]).bandwidth((f.bandwidth || .06) * F.iw).thresholds(n)(P), top = d3.max(cd, c => c.value) || 1, path = d3.geoPath();
    F.g.selectAll('path.iso').data(cd).join('path').attr('class', 'iso').attr('d', path).attr('fill', (c, i) => seq(T, .1 + .85 * i / cd.length)).attr('fill-opacity', .22).attr('stroke', T.ink).attr('stroke-width', (c, i) => i % 3 === 2 ? 1.5 : .7).attr('stroke-opacity', (c, i) => .35 + .5 * i / cd.length).attr('stroke-linejoin', 'round');
    cd.forEach((c, i) => { if (i % 3 !== 2 || !c.coordinates.length) return; const ring = c.coordinates.map(m => m[0]).sort((a, b) => b.length - a.length)[0]; if (!ring) return; const p = ring.reduce((m, q) => q[1] < m[1] ? q : m, ring[0]); txt(F.g, p[0], p[1] - 3, Math.round(100 * c.value / top) + ' %', { a: 'middle', f: font(700, 9.5, MONO), c: T.ink, halo: T.bg }); });
    const lab = P.filter(p => p.label).sort((a, b) => (b.w || 1) - (a.w || 1)).slice(0, comp ? 4 : 8), dots = F.g.selectAll('circle.pt').data(P).join('circle').attr('class', 'pt').attr('cx', p => X(p.x)).attr('cy', p => Y(p.y)).attr('r', p => p.label ? 3.6 : 1.8).attr('fill', T.ink).attr('fill-opacity', p => p.label ? .9 : .45);
    interactive(dots.filter(p => p.label), p => ({ title: p.label, value: `x ${num(p.x, 1)} · y ${num(p.y, 1)} · poids ${num(p.w == null ? 1 : p.w, 1)}`, state: p.state || f.state, src: p.src || f.src, detail: p.note }), T);
    lab.forEach(p => txt(F.g, X(p.x) + 6, Y(p.y) - 6, trunc(p.label, comp ? 12 : 22), { f: font(700, comp ? 10 : 11.5), c: T.ink, halo: T.bg }));
    legend(el, [f.state || 'actual']); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = `Courbes de niveau de la densité d'observations (lissage gaussien) : chaque trait épais indique un % du pic. Les points sont les observations.`; ul.appendChild(li);
  }
  REG('isolines', isolines, (f, r) => r(['Observation', 'x', 'y', 'Poids', 'Source'], f.points.map(p => [p.label || '', num(p.x, 2), num(p.y, 2), p.w == null ? 1 : p.w, p.src || f.src || ''])));

  /* ============================== DELAUNAYMOSAIC — mosaïque triangulée (low-poly) ============================== */
  function delaunaymosaic(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data, W = el.clientWidth || 640, H = Math.round(Math.min(W * (comp ? .9 : .6), 470)), F = frame(el, id, H, { l: 6, r: 6, t: 6, b: 34 }); addPatterns(F.defs, id, T);
    const X = d3.scaleLinear(d3.extent(D, d => d.x), [24, F.iw - 24]), Y = d3.scaleLinear(d3.extent(D, d => d.y), [F.ih - 24, 24]), pts = D.map(d => [X(d.x), Y(d.y)]), del = d3.Delaunay.from(pts), tri = del.triangles, T3 = [];
    for (let k = 0; k < tri.length; k += 3) { const a = tri[k], b = tri[k + 1], c = tri[k + 2], e = [Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]), Math.hypot(pts[b][0] - pts[c][0], pts[b][1] - pts[c][1]), Math.hypot(pts[c][0] - pts[a][0], pts[c][1] - pts[a][1])]; T3.push({ a, b, c, longest: Math.max(...e), v: (D[a].value + D[b].value + D[c].value) / 3, soft: [a, b, c].some(i => isSoft(D[i].state)), state: [a, b, c].map(i => D[i].state).find(isSoft) || 'actual' }); }
    const med = d3.median(T3, t => t.longest), keep = f.trim === false ? T3 : T3.filter(t => t.longest <= med * 2.6), ex = d3.extent(D, d => d.value), cs = d3.scaleSequential(t => seq(T, t)).domain(ex);
    const cells = F.g.selectAll('path.tr').data(keep).join('path').attr('class', 'tr').attr('d', t => `M${pts[t.a]}L${pts[t.b]}L${pts[t.c]}Z`).attr('fill', t => cs(t.v)).attr('stroke', T.bg).attr('stroke-width', 1.3).attr('stroke-linejoin', 'round');
    interactive(cells, t => ({ title: `${D[t.a].label} · ${D[t.b].label} · ${D[t.c].label}`, value: `≈ ${num(t.v, f.dec)} ${f.unit || ''}`.trim(), detail: 'Moyenne des trois sommets : interpolation, pas une mesure.', state: t.soft ? t.state : 'derived', src: D[t.a].src }), T);
    F.g.selectAll('path.so').data(keep.filter(t => t.soft)).join('path').attr('d', t => `M${pts[t.a]}L${pts[t.b]}L${pts[t.c]}Z`).attr('fill', t => `url(#${id}-${t.state})`).attr('fill-opacity', .45).style('pointer-events', 'none');
    const top = new Set(D.map((d, i) => [d.value, i]).sort((p, q) => q[0] - p[0]).slice(0, comp ? 4 : 8).map(p => p[1]));
    D.forEach((d, i) => { const c = ink(T, d3.color(cs(d.value)).formatHex()); F.g.append('circle').attr('cx', pts[i][0]).attr('cy', pts[i][1]).attr('r', 3.4).attr('fill', c).attr('stroke', T.bg).attr('stroke-width', 1); if (top.has(i) || D.length <= 12) txt(F.g, pts[i][0], pts[i][1] - 8, trunc(d.label, comp ? 9 : 16), { a: 'middle', f: font(700, comp ? 9.5 : 11), c: T.ink, halo: T.bg }); });
    const gid = id + 'cb', gr = F.defs.append('linearGradient').attr('id', gid); d3.range(0, 1.01, .2).forEach(t => gr.append('stop').attr('offset', t * 100 + '%').attr('stop-color', seq(T, t)));
    F.g.append('rect').attr('x', F.iw - 150).attr('y', F.ih + 12).attr('width', 130).attr('height', 8).attr('fill', `url(#${gid})`).attr('stroke', T.line); txt(F.g, F.iw - 154, F.ih + 20, num(ex[0], f.dec), { a: 'end', f: font(600, 10, MONO), c: T.mid }); txt(F.g, F.iw - 16, F.ih + 31, num(ex[1], f.dec) + ' ' + (f.unit || ''), { a: 'end', f: font(600, 10, MONO), c: T.mid });
    legend(el, D.map(d => d.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = 'Chaque triangle prend la moyenne de ses trois sommets : seuls les points sont des mesures, le remplissage est une interpolation.'; ul.appendChild(li);
  }
  REG('delaunaymosaic', delaunaymosaic, tableOf(['Point', 'x', 'y', 'Valeur', 'État', 'Source'], d => [d.label, num(d.x, 2), num(d.y, 2), num(d.value, 2), SL(d.state), d.src]));

  /* ============================== TREERINGS — cernes d'arbre (une année = un cerne, épaisseur = valeur) ============================== */
  function treerings(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.data.slice().sort((a, b) => a.year - b.year), W = el.clientWidth || 640, S = Math.min(W - 8, comp ? 340 : 520), F = frame(el, id, S + 8, { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const cx = F.iw / 2, cy = S / 2 + 2, R = S / 2 - 22, r0 = R * .05, tot = d3.sum(D, d => d.value), k = (R - r0) / tot, wob = th => R * .013 * (.6 * Math.sin(3 * th + 1.3) + .4 * Math.sin(5 * th + .4)), SEG = 140;
    let acc = r0; const rings = D.map((d, i) => { const inner = i ? acc : 0, outer = (acc += d.value * k); return { ...d, i, inner, outer, mid: (inner + outer) / 2 }; });
    const ringPath = (r) => d3.range(SEG + 1).map(j => { const th = j / SEG * 2 * Math.PI, rr = r + wob(th); return [cx + rr * Math.cos(th - Math.PI / 2), cy + rr * Math.sin(th - Math.PI / 2)]; });
    const line = d3.line().curve(d3.curveCatmullRomClosed.alpha(.5));
    const shapes = F.g.selectAll('path.ring').data(rings).join('path').attr('class', 'ring').attr('fill-rule', 'evenodd').attr('d', r => line(ringPath(r.outer)) + (r.inner ? line(ringPath(r.inner)) : '')).attr('fill', r => d3.interpolateRgb(T.bg, col(T, f.color, 0))(r.i % 2 ? .32 : .62)).attr('stroke', T.ink).attr('stroke-opacity', .5).attr('stroke-width', .7);
    interactive(shapes, r => ({ title: String(r.year), value: `${num(r.value, f.dec)} ${f.unit || ''}`.trim(), detail: `${r.note || ''} Épaisseur du cerne = valeur de l'année.`.trim(), state: r.state, src: r.src }), T);
    F.g.selectAll('path.rs').data(rings.filter(r => isSoft(r.state))).join('path').attr('fill-rule', 'evenodd').attr('d', r => line(ringPath(r.outer)) + (r.inner ? line(ringPath(r.inner)) : '')).attr('fill', r => `url(#${id}-${r.state})`).attr('fill-opacity', .5).style('pointer-events', 'none');
    F.g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 2.2).attr('fill', T.ink);
    const marks = new Map((f.mark || []).map(m => [m.year, m.label])); let lastY = -99; const lab = [];
    const markX = rings.filter(r => marks.has(r.year)).map(r => cx + r.mid + wob(Math.PI / 2));
    rings.forEach((r, i) => { const x = cx + r.mid + wob(Math.PI / 2), isMark = marks.has(r.year), need = isMark || i === rings.length - 1, ok = x - lastY >= (comp ? 32 : 40) && markX.every(mx => Math.abs(mx - x) > (comp ? 30 : 38)); if (need || (i === 0 && ok) || ok) { lab.push(r); lastY = x; } });
    F.g.append('line').attr('x1', cx).attr('y1', cy).attr('x2', cx + R + 10).attr('y2', cy).attr('stroke', T.ink).attr('stroke-opacity', .25).attr('stroke-dasharray', '2 3');
    lab.forEach(r => { const x = cx + r.mid + wob(Math.PI / 2); F.g.append('circle').attr('cx', x).attr('cy', cy).attr('r', 2).attr('fill', T.ink); txt(F.g, x, cy + (marks.has(r.year) ? -20 : 15), String(r.year), { a: 'middle', f: font(700, 10, MONO), c: T.ink, halo: T.bg }); if (marks.has(r.year)) txt(F.g, x, cy - 8, trunc(marks.get(r.year), 14), { a: 'middle', f: font(600, 9.5), c: T.mid, halo: T.bg }); });
    legend(el, D.map(d => d.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = "Du centre vers l'extérieur : du plus ancien au plus récent. L'épaisseur de chaque cerne = la valeur de l'année (exacte) ; l'ondulation du contour est décorative et identique pour tous les cernes."; ul.appendChild(li);
  }
  REG('treerings', treerings, tableOf(['Année', 'Valeur', 'État', 'Source'], d => [d.year, num(d.value, 2), SL(d.state), d.src]));

  /* ============================== CONSTELLATION — carte du ciel (position, éclat, liens) ============================== */
  function constellation(el, f, T) {
    const id = uid(), comp = isNarrow(el), N = f.nodes, W = el.clientWidth || 640, H = Math.round(Math.min(W * (comp ? .95 : .62), 500)), F = frame(el, id, H, { l: 0, r: 0, t: 0, b: 0 }); addPatterns(F.defs, id, T);
    const NAVY = '#0f1222', STAR = '#e9ecff'; F.g.append('rect').attr('width', F.iw).attr('height', H).attr('rx', 10).attr('fill', NAVY);
    const rnd = lcg(.83); for (let i = 0; i < (comp ? 40 : 90); i++) F.g.append('circle').attr('cx', rnd() * F.iw).attr('cy', rnd() * H).attr('r', .5 + rnd() * .8).attr('fill', STAR).attr('fill-opacity', .12 + rnd() * .18);
    const X = d3.scaleLinear(d3.extent(N, d => d.x), [38, F.iw - 38]), Y = d3.scaleLinear(d3.extent(N, d => d.y), [H - 36, 36]), pos = N.map(d => [X(d.x), Y(d.y)]), idx = Object.fromEntries(N.map((d, i) => [d.id == null ? d.label : d.id, i]));
    let links = (f.links || []).map(l => [idx[l.s], idx[l.t]]).filter(l => l[0] != null && l[1] != null);
    if (!links.length) { const inT = new Set([0]), dist = (a, b) => Math.hypot(pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]); while (inT.size < N.length) { let best = null; for (const a of inT) for (let b = 0; b < N.length; b++) if (!inT.has(b)) { const dd = dist(a, b); if (!best || dd < best[2]) best = [a, b, dd]; } links.push([best[0], best[1]]); inT.add(best[1]); } }
    F.g.selectAll('line.lk').data(links).join('line').attr('class', 'lk').attr('x1', l => pos[l[0]][0]).attr('y1', l => pos[l[0]][1]).attr('x2', l => pos[l[1]][0]).attr('y2', l => pos[l[1]][1]).attr('stroke', STAR).attr('stroke-opacity', .3).attr('stroke-width', 1);
    const groups = [...new Set(N.map(d => d.group || ''))], mx = d3.max(N, d => d.value), R = v => 3 + (comp ? 8 : 11) * Math.sqrt(v / mx), tint = (d) => d3.color(col(T, d.color, groups.indexOf(d.group || ''))).brighter(1.2).formatHex();
    const gl = F.defs.append('radialGradient').attr('id', id + 'gl'); gl.append('stop').attr('offset', '0%').attr('stop-color', '#fff').attr('stop-opacity', .85); gl.append('stop').attr('offset', '100%').attr('stop-color', '#fff').attr('stop-opacity', 0);
    F.g.selectAll('circle.halo').data(N).join('circle').attr('class', 'halo').attr('cx', (d, i) => pos[i][0]).attr('cy', (d, i) => pos[i][1]).attr('r', d => R(d.value) * 2.6).attr('fill', `url(#${id}gl)`).attr('fill-opacity', .28).style('pointer-events', 'none');
    const stars = F.g.selectAll('circle.star').data(N).join('circle').attr('class', 'star').attr('cx', (d, i) => pos[i][0]).attr('cy', (d, i) => pos[i][1]).attr('r', d => R(d.value)).attr('fill', tint).attr('fill-opacity', d => isSoft(d.state) ? .55 : 1).attr('stroke', STAR).attr('stroke-width', d => isSoft(d.state) ? 1.6 : 0).attr('stroke-dasharray', d => isSoft(d.state) ? '3 3' : null);
    interactive(stars, d => ({ title: d.label, value: `${num(d.value, f.dec)} ${f.unit || ''}`.trim(), detail: `${d.group ? 'Groupe : ' + d.group + '. ' : ''}${d.note || ''}`.trim(), state: d.state, src: d.src }), T);
    const top = new Set(N.map((d, i) => [d.value, i]).sort((a, b) => b[0] - a[0]).slice(0, comp ? 5 : 9).map(p => p[1]));
    N.forEach((d, i) => { if (top.has(i)) txt(F.g, pos[i][0] + R(d.value) + 5, pos[i][1] + 4, trunc(d.label, comp ? 12 : 22), { f: font(700, comp ? 10 : 11.5), c: STAR, halo: NAVY }); });
    if (f.xLabel) txt(F.g, F.iw - 10, H - 10, f.xLabel + ' →', { a: 'end', f: font(600, 10.5), c: '#b9c0e8' }); if (f.yLabel) txt(F.g, 10, 18, '↑ ' + f.yLabel, { f: font(600, 10.5), c: '#b9c0e8' });
    legend(el, N.map(d => d.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'); groups.filter(Boolean).forEach(g => { const li = document.createElement('li'); li.innerHTML = `<svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="6" fill="${tint(N.find(d => (d.group || '') === g))}"/></svg>${g}`; ul.appendChild(li); });
    const li = document.createElement('li'); li.textContent = 'Position = les deux mesures ; éclat = valeur ; traits = liens indiqués (ou voisins les plus proches). Le fond étoilé est décoratif.'; ul.appendChild(li);
  }
  REG('constellation', constellation, tableOf(['Étoile', 'Groupe', 'x', 'y', 'Éclat', 'État', 'Source'], d => [d.label, d.group || '', num(d.x, 2), num(d.y, 2), num(d.value, 2), SL(d.state), d.src], 'nodes'));

  /* ============================== ORBITS — distance au centre (angle sans signification) ============================== */
  function orbits(el, f, T) {
    const id = uid(), comp = isNarrow(el), D = f.items.slice().sort((a, b) => a.value - b.value), W = el.clientWidth || 640, S = Math.min(W - 8, comp ? 360 : 560), F = frame(el, id, S, { l: 4, r: 4, t: 4, b: 4 }); addPatterns(F.defs, id, T);
    const cx = F.iw / 2, cy = S / 2, Rm = S / 2 - 34, r0 = 24, mxv = f.max || d3.max(D, d => d.value) * 1.08, rv = v => r0 + (Rm - r0) * v / mxv, szMax = d3.max(D, d => d.size || 1);
    d3.scaleLinear([0, mxv], [0, 1]).ticks(4).filter(t => t > 0).forEach(t => { F.g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', rv(t)).attr('fill', 'none').attr('stroke', T.line).attr('stroke-opacity', .9); txt(F.g, cx, cy - rv(t) - 3, `${num(t, f.dec)} ${f.unit || ''}`.trim(), { a: 'middle', f: font(600, 9.5, MONO), c: T.mid, halo: T.bg }); });
    F.g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r0 - 4).attr('fill', T.ink).attr('fill-opacity', .92); txt(F.g, cx, cy + 4, trunc(f.centerLabel || 'cible', 8), { a: 'middle', f: font(800, 9.5), c: T.bg });
    const pl = D.map((d, i) => { const th = -Math.PI / 2 + i * 2.399963, r = rv(d.value); return { ...d, i, x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), r, rs: 5 + (comp ? 6 : 9) * Math.sqrt((d.size == null ? 1 : d.size) / szMax) }; });
    pl.forEach(d => F.g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', d.r).attr('fill', 'none').attr('stroke', col(T, d.color, d.i)).attr('stroke-opacity', .35).attr('stroke-dasharray', isSoft(d.state) ? '4 3' : null));
    const ps = F.g.selectAll('circle.pl').data(pl).join('circle').attr('class', 'pl').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.rs); paint(ps, T, id, d => d.state, d => col(T, d.color, d.i)); ps.attr('stroke', T.bg).attr('stroke-width', 1.4);
    interactive(ps, d => ({ title: d.label, value: `${num(d.value, f.dec)} ${f.unit || ''}`.trim(), detail: `${d.size != null ? 'Taille : ' + num(d.size, 1) + (f.sizeUnit ? ' ' + f.sizeUnit : '') + '. ' : ''}${d.note || ''}`.trim(), state: d.state, src: d.src }), T);
    pl.forEach(d => { const right = d.x >= cx; txt(F.g, d.x + (right ? 1 : -1) * (d.rs + 5), d.y + 4, trunc(d.label, comp ? 11 : 20), { a: right ? 'start' : 'end', f: font(700, comp ? 10 : 11.5), c: T.ink, halo: T.bg }); });
    legend(el, D.map(d => d.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = "Seule la distance au centre porte la valeur ; l'angle de chaque astre n'a aucune signification (angle d'or, pour éviter les superpositions)." + (f.size === false ? '' : ' La taille de l\'astre = ' + (f.sizeLabel || 'une seconde mesure') + '.'); ul.appendChild(li);
  }
  REG('orbits', orbits, tableOf(['Astre', 'Distance (valeur)', 'Taille', 'État', 'Source'], d => [d.label, num(d.value, 2), d.size == null ? '' : num(d.size, 2), SL(d.state), d.src], 'items'));

  /* ============================== SEISMOGRAM — chocs datés, amplitude = magnitude ============================== */
  function seismogram(el, f, T) {
    const id = uid(), comp = isNarrow(el), E = f.events.map(e => ({ ...e, t: new Date(e.date) })).sort((a, b) => a.t - b.t), W = el.clientWidth || 640, H = comp ? 250 : 310, F = frame(el, id, H, { l: 10, r: 14, t: 18, b: 34 }); addPatterns(F.defs, id, T);
    const from = new Date(f.from || d3.min(E, e => e.t)), to = new Date(f.to || d3.max(E, e => e.t)), X = d3.scaleTime([from, to], [0, F.iw]).nice(), mid = F.ih / 2, mxm = f.max || d3.max(E, e => e.magnitude), A = d3.scaleLinear([0, mxm], [0, mid - 14]), tau = comp ? 16 : 24, om = .8;
    axisStyle(F.g.append('g').attr('transform', `translate(0,${F.ih})`).call(d3.axisBottom(X).ticks(comp ? 4 : 8).tickSizeOuter(0)), T);
    F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', mid).attr('y2', mid).attr('stroke', T.line);
    if (f.threshold != null) { [-1, 1].forEach(s => F.g.append('line').attr('x1', 0).attr('x2', F.iw).attr('y1', mid + s * A(f.threshold)).attr('y2', mid + s * A(f.threshold)).attr('stroke', T.neg).attr('stroke-dasharray', '5 4').attr('stroke-opacity', .8)); txt(F.g, 2, mid - A(f.threshold) - 4, f.thresholdLabel || `seuil ${f.threshold}`, { f: font(700, 10), c: T.neg, halo: T.bg }); }
    const rnd = lcg(.29), xs = E.map(e => X(e.t)), pts = []; for (let px = 0; px <= F.iw; px += 1.25) { let y = (rnd() - .5) * 1.2; E.forEach((e, k) => { const dt = px - xs[k]; if (dt >= 0) y += A(e.magnitude) * Math.exp(-dt / tau) * Math.cos(om * dt); }); pts.push([px, mid - Math.max(-(mid - 3), Math.min(mid - 3, y))]); }
    F.g.append('path').attr('d', d3.line().curve(d3.curveLinear)(pts)).attr('fill', 'none').attr('stroke', T.ink).attr('stroke-width', 1.15).attr('stroke-linejoin', 'round');
    const hits = F.g.selectAll('g.ev').data(E).join('g').attr('class', 'ev'); hits.append('line').attr('x1', (e, i) => xs[i]).attr('x2', (e, i) => xs[i]).attr('y1', mid - 6).attr('y2', mid + 6).attr('stroke', (e, i) => col(T, e.color, 0)).attr('stroke-width', 2);
    const dots = hits.append('circle').attr('cx', (e, i) => xs[i]).attr('cy', e => mid - A(e.magnitude)).attr('r', 5); paint(dots, T, id, e => e.state, e => col(T, e.color, 0)); dots.attr('stroke', T.bg).attr('stroke-width', 1.4);
    interactive(dots, e => ({ title: e.label || d3.timeFormat('%d %b %Y')(e.t), value: `${num(e.magnitude, f.dec)} ${f.unit || ''}`.trim(), detail: `${d3.timeFormat('%d %b %Y')(e.t)}. ${e.note || ''}`.trim(), state: e.state, src: e.src }), T);
    E.map((e, i) => ({ e, i })).sort((a, b) => b.e.magnitude - a.e.magnitude).slice(0, comp ? 3 : 6).forEach(o => txt(F.g, xs[o.i] + 7, mid - A(o.e.magnitude) - 6, trunc(o.e.label || num(o.e.magnitude, f.dec), comp ? 12 : 22), { f: font(700, comp ? 10 : 11.5), c: T.ink, halo: T.bg }));
    legend(el, E.map(e => e.state || 'actual')); const ul = el.parentNode.querySelector('.fig-legend'), li = document.createElement('li'); li.textContent = "L'amplitude du premier pic de chaque secousse = sa magnitude ; l'oscillation qui suit et le bruit de fond sont décoratifs. Les chocs rapprochés s'additionnent."; ul.appendChild(li);
  }
  REG('seismogram', seismogram, (f, r) => r(['Date', 'Événement', 'Magnitude', 'État', 'Source'], f.events.map(e => [e.date, e.label || '', num(e.magnitude, 2), SL(e.state), e.src])));

})(window);
