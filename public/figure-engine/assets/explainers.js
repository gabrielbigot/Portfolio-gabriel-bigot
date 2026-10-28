/*
 * explainers.js — petites démonstrations interactives (jeux pédagogiques, sans données inventées).
 *  - data-explainer="judge" : « proposer / juger » (le moteur propose, le juge vérifie)
 *  - data-explainer="coin"  : « aller à droite » ou « aller à la pièce » (généralisation erronée d'objectif)
 * Les résultats affichés sont calculés, pas simulés : le juge évalue réellement chaque formule.
 */
(function () {
  'use strict';
  const $ = (t, a, h) => { const e = document.createElement(t); if (a) Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); if (h != null) e.innerHTML = h; return e; };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= proposer / juger ================= */
  function mountJudge(root) {
    const T = []; { let t = 5n; for (let n = 0; n <= 12; n++) { T.push(t); t = 3n * t - 4n; } }
    const POOL = [
      { f: n => 3n ** BigInt(n + 1) + 2n, s: '3^(n+1) + 2' },
      { f: n => 3n ** BigInt(n) + 4n, s: '3^n + 4' },
      { f: n => 2n * 3n ** BigInt(n) + 3n, s: '2·3^n + 3' },
      { f: n => 5n * 3n ** BigInt(n), s: '5·3^n' },
      { f: n => 3n ** BigInt(n + 1) - 2n, s: '3^(n+1) − 2' },
      { f: n => 4n * BigInt(n) + 5n, s: '4n + 5' },
      { f: n => 5n + 6n * BigInt(n), s: '5 + 6n' },
      { f: n => 3n ** BigInt(n + 1) + 2n ** BigInt(n), s: '3^(n+1) + 2^n' },
      { f: n => 3n ** BigInt(n + 1) + 2n + BigInt(n), s: '3^(n+1) + 2 + n' },
      { f: n => 6n * 2n ** BigInt(n) - 1n, s: '6·2^n − 1' }
    ];
    root.innerHTML = '';
    root.append(
      $('p', { class: 'ex-q' }, 'Problème : <code>t₀ = 5</code> et <code>tₙ₊₁ = 3·tₙ − 4</code>. Quelle formule donne <code>tₙ</code> ?'),
      $('div', { class: 'ex-bar' }, '<button type="button" class="ex-btn" data-one>Faire proposer une formule</button><button type="button" class="ex-btn ghost" data-all>Tout proposer</button><button type="button" class="ex-btn ghost" data-reset>Recommencer</button>'),
      $('div', { class: 'ex-score', 'aria-live': 'polite' }),
      $('ol', { class: 'ex-log' }),
      $('p', { class: 'ex-note' }, 'Jeu pédagogique : le « moteur » tire ici au hasard dans une liste de formules plausibles ; un vrai modèle propose des pistes bien plus ciblées. Le « juge » calcule réellement les 13 premiers termes. Lean, lui, ne vérifie pas des valeurs mais des preuves complètes, étape par étape (G1).')
    );
    const log = root.querySelector('.ex-log'), score = root.querySelector('.ex-score');
    let order = [], tried = 0, ok = 0;
    const reset = () => { order = POOL.map((p, i) => i).sort(() => Math.random() - .5); tried = 0; ok = 0; log.innerHTML = ''; draw(); };
    const judge = p => { for (let n = 0; n <= 12; n++) { const v = p.f(n); if (v !== T[n]) return { ok: false, n, got: v, want: T[n] }; } return { ok: true }; };
    const draw = () => { score.innerHTML = `<b>${tried}</b> proposition(s) · <b>${ok}</b> validée(s) par le juge · <b>${tried - ok}</b> rejetée(s)`; };
    const one = () => {
      if (!order.length) return;
      const p = POOL[order.shift()], r = judge(p); tried++; if (r.ok) ok++;
      const li = $('li', { class: r.ok ? 'ex-ok' : 'ex-ko' });
      li.innerHTML = r.ok ? `<span class="ex-tag" aria-hidden="true">✓ accepté</span> <code>tₙ = ${p.s}</code> — identique à la suite pour n = 0…12.`
        : `<span class="ex-tag" aria-hidden="true">✗ rejeté</span> <code>tₙ = ${p.s}</code> — échoue dès n = ${r.n} : la formule donne ${r.got}, la suite vaut ${r.want}.`;
      li.setAttribute('aria-label', r.ok ? 'Accepté par le juge' : 'Rejeté par le juge');
      log.appendChild(li); draw();
    };
    root.querySelector('[data-one]').addEventListener('click', one);
    root.querySelector('[data-all]').addEventListener('click', () => { while (order.length) one(); });
    root.querySelector('[data-reset]').addEventListener('click', reset);
    reset();
  }

  /* ================= la pièce ou la droite ================= */
  function mountCoin(root) {
    const COLS = 11, ROWS = 5, CELL = 38;
    root.innerHTML = '';
    const bar = $('div', { class: 'ex-bar', role: 'group', 'aria-label': 'Réglages de la démonstration' });
    bar.innerHTML = '<button type="button" class="ex-btn" aria-pressed="true" data-m="train">Entraînement : pièce au bout, à droite</button><button type="button" class="ex-btn" aria-pressed="false" data-m="test">Test : pièce déplacée</button>' +
      '<label>Ce que l’agent a appris <select data-pol aria-label="Objectif poursuivi par l’agent"><option value="right">« aller à droite » (raccourci appris)</option><option value="coin">« aller à la pièce » (intention voulue)</option></select></label><button type="button" class="ex-btn ghost" data-go>▶ Lancer</button><button type="button" class="ex-btn ghost" data-new>Autre position</button>';
    const cv = $('canvas', { width: COLS * CELL, height: ROWS * CELL, role: 'img', 'aria-label': 'Grille : un agent part à gauche ; une pièce est placée sur la grille' });
    cv.style.cssText = 'width:100%;max-width:' + (COLS * CELL) + 'px;height:auto;display:block;border:1px solid var(--vra-line);border-radius:6px;background:var(--vra-panel)';
    const out = $('p', { class: 'ex-out', 'aria-live': 'polite' }, '');
    root.append(bar, cv, out, $('p', { class: 'ex-note' }, 'Illustration inspirée de CoinRun (Langosco et al., 2022, K13) : à l’entraînement, la pièce est toujours tout à droite, donc « aller à droite » et « aller à la pièce » rapportent la même récompense. Rien ne distingue les deux objectifs avant le jour du test. Schéma simplifié, pas une reproduction de l’expérience.'));
    const ctx = cv.getContext('2d');
    let mode = 'train', coin = { c: COLS - 1, r: 2 }, agent = { c: 0, r: 2 }, trail = [], timer = null;
    const css = n => getComputedStyle(root.closest('.vra') || document.body).getPropertyValue(n).trim() || '#888';
    function place() { const rows = [0, 1, 3, 4]; coin = mode === 'train' ? { c: COLS - 1, r: 2 } : { c: 3 + Math.floor(Math.random() * (COLS - 6)), r: rows[Math.floor(Math.random() * rows.length)] }; agent = { c: 0, r: 2 }; trail = [{ ...agent }]; out.textContent = ''; draw(); }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = css('--vra-line'); ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke(); }
      for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke(); }
      ctx.fillStyle = css('--vra-c2'); ctx.globalAlpha = .18; ctx.fillRect((COLS - 1) * CELL, 0, CELL, ROWS * CELL); ctx.globalAlpha = 1;
      ctx.strokeStyle = css('--vra-c3'); ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath();
      trail.forEach((p, i) => { const x = p.c * CELL + CELL / 2, y = p.r * CELL + CELL / 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
      const cx = coin.c * CELL + CELL / 2, cy = coin.r * CELL + CELL / 2;
      ctx.fillStyle = css('--vra-c4'); ctx.beginPath(); ctx.arc(cx, cy, 11, 0, 7); ctx.fill(); ctx.strokeStyle = css('--vra-ink'); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = css('--vra-ink'); ctx.font = '700 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', cx, cy + 1);
      const ax = agent.c * CELL + CELL / 2, ay = agent.r * CELL + CELL / 2;
      ctx.fillStyle = css('--vra-c1'); ctx.beginPath(); ctx.moveTo(ax, ay - 13); ctx.lineTo(ax + 13, ay + 11); ctx.lineTo(ax - 13, ay + 11); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = css('--vra-ink'); ctx.lineWidth = 2; ctx.stroke();
    }
    function step() {
      const pol = root.querySelector('[data-pol]').value;
      if (pol === 'right') { if (agent.c < COLS - 1) agent.c++; else return true; }
      else { if (agent.c !== coin.c) agent.c += Math.sign(coin.c - agent.c); else if (agent.r !== coin.r) agent.r += Math.sign(coin.r - agent.r); else return true; }
      trail.push({ ...agent }); draw(); return pol === 'coin' && agent.c === coin.c && agent.r === coin.r;
    }
    function verdict() {
      const got = trail.some(p => p.c === coin.c && p.r === coin.r), pol = root.querySelector('[data-pol]').value;
      out.className = 'ex-out ' + (got ? 'ok' : 'ko');
      out.innerHTML = got ? '<b>Récompense obtenue.</b> ' + (pol === 'right' && mode === 'train' ? 'Vu de l’extérieur, l’agent semble parfaitement aligné : il atteint la pièce à chaque essai. Rien ne révèle qu’il suit un raccourci.' : 'L’agent a atteint la pièce.')
        : '<b>Pièce ignorée.</b> L’agent a gardé le réflexe « aller à droite » : il est arrivé au mur, à côté de la pièce. Il ne « désobéit » pas : il fait exactement ce qui était récompensé à l’entraînement. C’est un objectif <em>interne</em> (mesa-objectif) différent de l’objectif <em>donné</em>.';
    }
    function run() { clearInterval(timer); agent = { c: 0, r: 2 }; trail = [{ ...agent }]; draw(); out.textContent = '';
      if (reduce()) { let g = 0; while (!step() && g++ < 60); verdict(); return; }
      timer = setInterval(() => { if (step()) { clearInterval(timer); verdict(); } }, 260); }
    bar.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; bar.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); clearInterval(timer); place(); }));
    bar.querySelector('[data-go]').addEventListener('click', run);
    bar.querySelector('[data-new]').addEventListener('click', () => { clearInterval(timer); place(); });
    root.addEventListener('vra:theme', draw); (root.closest('.vra') || document).addEventListener('vra:theme', draw);
    place();
  }

  function boot() {
    document.querySelectorAll('[data-explainer="judge"]').forEach(mountJudge);
    document.querySelectorAll('[data-explainer="coin"]').forEach(mountCoin);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();


/* ===== Exemples supplémentaires (article « bulle IA ») : curseurs + canvas ===== */
/*
 * explainers.js — deux démonstrations interactives (calculs réels, hypothèses affichées).
 *  - data-explainer="stress" : test de résistance « et si les revenus déçoivent ? »
 *  - data-explainer="deprec" : « combien de temps vit un serveur ? » (amortissement)
 * Ce sont des modèles jouets : ils illustrent un mécanisme, ils ne prédisent rien.
 */
(function () {
  'use strict';
  const $ = (t, a, h) => { const e = document.createElement(t); if (a) Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); if (h != null) e.innerHTML = h; return e; };
  const css = (root, n) => getComputedStyle(root.closest('.vra') || document.body).getPropertyValue(n).trim() || '#888';
  const f1 = v => v.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const f0 = v => Math.round(v).toLocaleString('fr-FR');

  function slider(id, label, min, max, step, val, unit) {
    const w = $('label', { class: 'ex-slide', for: id });
    w.innerHTML = `<span>${label} : <b data-out="${id}"></b> ${unit}</span>`;
    const i = $('input', { type: 'range', id, min, max, step, value: val });
    w.appendChild(i); return w;
  }

  /* ================= test de résistance ================= */
  function mountStress(root) {
    const PLAN = [65, 65 * Math.sqrt(195 / 65), 195];            // 2026, 2027, 2028 (Md$ annualisés)
    const YEARS = ['2026', '2027', '2028'], DUE = 51.8;          // 518 Md$ ÷ 10 ans
    root.innerHTML = '';
    const box = $('div', { class: 'ex-bar ex-sliders' });
    box.append(slider('st-short', 'Retard sur le plan de revenus (2027 et 2028)', 0, 60, 5, 0, '%'), slider('st-gm', 'Marge brute', 20, 70, 5, 40, '%'));
    const cv = $('canvas', { width: 640, height: 260, role: 'img', 'aria-label': 'Barres : marge brute annuelle comparée à la charge annuelle des engagements, pour 2026, 2027 et 2028' });
    cv.style.cssText = 'width:100%;max-width:640px;height:auto;display:block;border:1px solid var(--vra-line);border-radius:6px;background:var(--vra-panel)';
    const out = $('p', { class: 'ex-out', 'aria-live': 'polite' });
    root.append(box, cv, out, $('p', { class: 'ex-note' }, 'Modèle jouet : engagements de 518 Md$ étalés à parts égales sur dix ans (51,8 Md$ par an), revenus du plan = 65 Md$ en 2026 puis croissance régulière jusqu\'à 195 Md$ en 2028 (hypothèse de modèle, pas une prévision de l\'entreprise). Le rapport affiché ne compte ni la recherche, ni les salaires, ni les intérêts, ni la trésorerie de 20 Md$. Ce n\'est pas un test de solvabilité (D11).'));
    const ctx = cv.getContext('2d');
    const read = () => ({ s: +root.querySelector('#st-short').value / 100, g: +root.querySelector('#st-gm').value / 100 });
    function draw() {
      const { s, g } = read();
      root.querySelector('[data-out="st-short"]').textContent = Math.round(s * 100);
      root.querySelector('[data-out="st-gm"]').textContent = Math.round(g * 100);
      const rev = PLAN.map((r, i) => i === 0 ? r : r * (1 - s));
      const cov = rev.map(r => g * r / DUE);
      const W = cv.width, H = cv.height, L = 50, B = 36, T = 14, iw = W - L - 20, ih = H - B - T, max = Math.max(2, ...cov) * 1.1;
      ctx.clearRect(0, 0, W, H);
      ctx.font = '11px system-ui'; ctx.textBaseline = 'middle';
      for (let v = 0; v <= max; v += 0.5) { const y = T + ih - v / max * ih; ctx.strokeStyle = css(root, '--vra-line'); ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(W - 20, y); ctx.stroke(); ctx.fillStyle = css(root, '--vra-mid'); ctx.textAlign = 'right'; ctx.fillText(String(v).replace('.', ',') + '×', L - 6, y); }
      const y1 = T + ih - 1 / max * ih; ctx.strokeStyle = css(root, '--vra-ink'); ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(L, y1); ctx.lineTo(W - 20, y1); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.fillStyle = css(root, '--vra-ink'); ctx.textAlign = 'left'; ctx.fillText('1× : la marge brute couvre la charge annuelle', L + 6, y1 - 9);
      const bw = iw / 3 * .5;
      cov.forEach((c, i) => {
        const x = L + iw / 3 * i + (iw / 3 - bw) / 2, h = c / max * ih, y = T + ih - h, ok = c >= 1;
        ctx.fillStyle = css(root, ok ? '--vra-c2' : '--vra-neg'); ctx.globalAlpha = .85; ctx.fillRect(x, y, bw, h); ctx.globalAlpha = 1;
        ctx.strokeStyle = css(root, '--vra-ink'); ctx.strokeRect(x, y, bw, h);
        ctx.fillStyle = css(root, '--vra-ink'); ctx.textAlign = 'center'; ctx.font = '600 13px ui-monospace, monospace'; ctx.fillText(f1(c).replace('.', ',') + '×', x + bw / 2, y - 10);
        ctx.font = '11.5px system-ui'; ctx.fillStyle = css(root, '--vra-mid'); ctx.fillText(YEARS[i] + ' · ' + f0(rev[i]) + ' Md$', x + bw / 2, H - 16);
      });
      const first = cov.findIndex(c => c >= 1);
      const msg = first < 0 ? 'Dans ce scénario, la marge brute ne couvre jamais la charge annuelle moyenne sur la période. Il faudrait des revenus plus élevés, une marge plus forte ou des engagements renégociés.' :
        first === 0 ? 'La charge est couverte dès 2026.' : `La marge brute ne couvre la charge annuelle moyenne qu'à partir de ${YEARS[first]}. D'ici là, le complément vient de la trésorerie, de nouveaux financements ou de renégociations.`;
      out.className = 'ex-out ' + (first < 0 ? 'ko' : 'ok');
      out.innerHTML = `<b>Lecture :</b> ${msg} <span style="opacity:.8">(retard ${Math.round(s * 100)} %, marge ${Math.round(g * 100)} %.)</span>`;
      cv.setAttribute('aria-label', 'Couverture de la charge annuelle des engagements : ' + cov.map((c, i) => YEARS[i] + ' ' + f1(c).replace('.', ',') + ' fois').join(' ; '));
    }
    root.querySelectorAll('input').forEach(i => i.addEventListener('input', draw));
    (root.closest('.vra') || document).addEventListener('vra:theme', draw);
    draw();
  }

  /* ================= durée de vie d'un serveur ================= */
  function mountDeprec(root) {
    root.innerHTML = '';
    const box = $('div', { class: 'ex-bar ex-sliders' });
    box.append(slider('dp-life', 'Durée d\'amortissement', 2, 8, 1, 6, 'ans'), slider('dp-buy', 'Achats de serveurs par an', 50, 300, 10, 100, 'Md$'));
    const cv = $('canvas', { width: 640, height: 260, role: 'img', 'aria-label': 'Barres : charge d\'amortissement annuelle sur huit ans pour un achat annuel constant' });
    cv.style.cssText = 'width:100%;max-width:640px;height:auto;display:block;border:1px solid var(--vra-line);border-radius:6px;background:var(--vra-panel)';
    const out = $('p', { class: 'ex-out', 'aria-live': 'polite' });
    root.append(box, cv, out, $('p', { class: 'ex-note' }, 'Amortissement linéaire sans valeur résiduelle, achats identiques chaque année, tous les achats amortis sur la même durée. En réalité les bâtiments, les réseaux et l\'électricité s\'amortissent sur d\'autres durées, et les achats grossissent (D10).'));
    const ctx = cv.getContext('2d');
    function draw() {
      const L = +root.querySelector('#dp-life').value, P = +root.querySelector('#dp-buy').value;
      root.querySelector('[data-out="dp-life"]').textContent = L; root.querySelector('[data-out="dp-buy"]').textContent = P;
      const N = 8, vals = Array.from({ length: N }, (_, t) => P * Math.min(t + 1, L) / L);
      const full = P, W = cv.width, H = cv.height, LM = 52, B = 34, T = 14, iw = W - LM - 20, ih = H - B - T, max = Math.max(P, ...vals) * 1.12;
      ctx.clearRect(0, 0, W, H); ctx.font = '11px system-ui'; ctx.textBaseline = 'middle';
      const step = max > 250 ? 100 : 50;
      for (let v = 0; v <= max; v += step) { const y = T + ih - v / max * ih; ctx.strokeStyle = css(root, '--vra-line'); ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(W - 20, y); ctx.stroke(); ctx.fillStyle = css(root, '--vra-mid'); ctx.textAlign = 'right'; ctx.fillText(String(v), LM - 6, y); }
      const bw = iw / N * .62;
      vals.forEach((v, i) => {
        const x = LM + iw / N * i + (iw / N - bw) / 2, h = v / max * ih, y = T + ih - h;
        ctx.fillStyle = css(root, i + 1 >= L ? '--vra-c3' : '--vra-c1'); ctx.globalAlpha = .85; ctx.fillRect(x, y, bw, h); ctx.globalAlpha = 1; ctx.strokeStyle = css(root, '--vra-ink'); ctx.strokeRect(x, y, bw, h);
        ctx.fillStyle = css(root, '--vra-ink'); ctx.textAlign = 'center'; ctx.font = '600 11.5px ui-monospace, monospace'; ctx.fillText(f0(v), x + bw / 2, y - 9);
        ctx.font = '11.5px system-ui'; ctx.fillStyle = css(root, '--vra-mid'); ctx.fillText('an ' + (i + 1), x + bw / 2, H - 14);
      });
      const first = P / L;
      out.className = 'ex-out ok';
      out.innerHTML = `<b>Lecture :</b> avec ${L} ans, un achat de ${P} Md$ pèse ${f1(first).replace('.', ',')} Md$ de charge par an ; en régime de croisière (à partir de l'an ${L}), la charge annuelle égale l'achat annuel, soit ${P} Md$. Raccourcir la durée ne change pas l'argent déjà dépensé : cela avance sa comptabilisation en charges et réduit le bénéfice affiché plus tôt.`;
    }
    root.querySelectorAll('input').forEach(i => i.addEventListener('input', draw));
    (root.closest('.vra') || document).addEventListener('vra:theme', draw);
    draw();
  }

  function boot() {
    document.querySelectorAll('[data-explainer="stress"]').forEach(mountStress);
    document.querySelectorAll('[data-explainer="deprec"]').forEach(mountDeprec);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();

/*
 * explainers.js — « sleepclock » : le réveil d'un lycéen selon l'heure de début des cours (modèle jouet, hypothèses affichées).
 */
(function () {
  'use strict';
  const $ = (t, a = {}, tx) => { const e = document.createElement(t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (tx) e.textContent = tx; return e; };
  const css = (root, n) => getComputedStyle(root.closest('.vra') || document.body).getPropertyValue(n).trim() || '#888';
  const hh = v => { const t = ((v % 24) + 24) % 24, h = Math.floor(t), m = Math.round((t - h) * 60); return String(h).padStart(2, '0') + ' h ' + String(m % 60).padStart(2, '0'); };
  const dur = v => { const h = Math.floor(v), m = Math.round((v - h) * 60); return h + ' h ' + String(m).padStart(2, '0'); };
  function slider(id, label, min, max, step, val, fmt) {
    const w = $('label', { class: 'ex-slide', for: id }); w.innerHTML = '<span>' + label + ' : <b data-out="' + id + '"></b></span>';
    const i = $('input', { type: 'range', id, min, max, step, value: val }); w.appendChild(i); w._fmt = fmt; return w;
  }
  function mount(root) {
    root.innerHTML = '';
    const box = $('div', { class: 'ex-bar ex-sliders' });
    const defs = [['sc-shift', 'Heure de coucher « naturelle »', 22, 25, 0.25, 23.5, hh], ['sc-start', 'Début des cours', 7.5, 9.5, 0.25, 8, hh], ['sc-trip', 'Trajet et préparation', 0.5, 2.5, 0.25, 1.25, dur], ['sc-need', 'Sommeil visé', 7, 10, 0.25, 9, dur]];
    defs.forEach(d => box.appendChild(slider(...d)));
    const cv = $('canvas', { width: 640, height: 150, role: 'img', 'aria-label': 'Frise de 20 h à 10 h : nuit de sommeil, réveil et début des cours' });
    cv.style.cssText = 'width:100%;max-width:640px;height:auto;display:block;border:1px solid var(--vra-line);border-radius:6px;background:var(--vra-panel)';
    const out = $('p', { class: 'ex-out', 'aria-live': 'polite' });
    root.append(box, cv, out, $('p', { class: 'ex-note' }, 'Modèle jouet, ne prédit rien : on suppose que l\'élève s\'endort à son heure « naturelle » (l\'horloge interne retarde l\'envie de dormir à l\'adolescence, K11), se lève juste à temps pour arriver au début des cours et ne rattrape rien. Le « sommeil visé » est un curseur à votre main, pas une norme sourcée dans ce dossier. Le repère de 7 h vient du constat qu\'un adolescent sur deux dort moins (K11).'));
    const ctx = cv.getContext('2d');
    const val = id => +root.querySelector('#' + id).value;
    function draw() {
      const bed = val('sc-shift'), start = val('sc-start'), trip = val('sc-trip'), need = val('sc-need');
      defs.forEach(d => { root.querySelector('[data-out="' + d[0] + '"]').textContent = d[6](val(d[0])); });
      const wake = start - trip, sleep = (wake + 24 - bed) % 24 || 24, gap = need - sleep;
      const W = cv.width, H = cv.height, L = 20, R = 20, X0 = 20, X1 = 34, iw = W - L - R, x = h => L + (((h < 20 ? h + 24 : h) - X0) / (X1 - X0)) * iw;
      ctx.clearRect(0, 0, W, H); ctx.font = '11px system-ui'; ctx.textBaseline = 'middle';
      for (let h = 20; h <= 34; h += 2) { const px = x(h % 24); ctx.strokeStyle = css(root, '--vra-line'); ctx.beginPath(); ctx.moveTo(px, 28); ctx.lineTo(px, 112); ctx.stroke(); ctx.fillStyle = css(root, '--vra-mid'); ctx.textAlign = 'center'; ctx.fillText((h % 24) + ' h', px, 126); }
      const xb = x(bed), xw = x(wake);
      ctx.fillStyle = css(root, '--vra-c1'); ctx.globalAlpha = .85; ctx.fillRect(xb, 48, xw - xb, 40); ctx.globalAlpha = 1; ctx.strokeStyle = css(root, '--vra-ink'); ctx.strokeRect(xb, 48, xw - xb, 40);
      ctx.fillStyle = css(root, '--vra-ink'); ctx.textAlign = 'center'; ctx.font = '600 12px ui-monospace, monospace'; ctx.fillText(dur(sleep) + ' de sommeil', (xb + xw) / 2, 68);
      const xs = x(start); ctx.strokeStyle = css(root, '--vra-neg'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xs, 30); ctx.lineTo(xs, 112); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = css(root, '--vra-neg'); ctx.textAlign = 'center'; ctx.font = '600 11px system-ui'; ctx.fillText('cours ' + hh(start), xs, 18);
      ctx.fillStyle = css(root, '--vra-ink'); ctx.fillText('réveil ' + hh(wake), Math.min(Math.max(xw, 50), W - 50), 100);
      const need7 = 7; ctx.setLineDash([4, 3]); ctx.strokeStyle = css(root, '--vra-mid'); const x7 = x(bed + need7); ctx.beginPath(); ctx.moveTo(x7, 44); ctx.lineTo(x7, 92); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = css(root, '--vra-mid'); ctx.font = '10.5px system-ui'; ctx.fillText('7 h', x7, 38);
      const msg = gap <= 0 ? 'Avec ces réglages, la nuit atteint le sommeil visé (' + dur(need) + ').' : 'Il manque ' + Math.round(gap * 60) + ' minutes par rapport au sommeil visé (' + dur(need) + '). Pour les combler, il faudrait soit se coucher plus tôt, soit commencer les cours plus tard (' + hh(start + gap) + ' au lieu de ' + hh(start) + ').';
      out.className = 'ex-out ' + (gap <= 0 ? 'ok' : 'ko'); out.innerHTML = '<b>Lecture :</b> réveil à ' + hh(wake) + ', soit ' + dur(sleep) + ' de sommeil. ' + msg;
      cv.setAttribute('aria-label', 'Nuit de ' + hh(bed) + ' à ' + hh(wake) + ', soit ' + dur(sleep) + ' de sommeil ; début des cours à ' + hh(start));
    }
    root.querySelectorAll('input').forEach(i => i.addEventListener('input', draw)); (root.closest('.vra') || document).addEventListener('vra:theme', draw); draw();
  }
  const boot = () => document.querySelectorAll('[data-explainer="sleepclock"]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
