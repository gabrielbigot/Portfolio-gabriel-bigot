// Ornements dessinés des essais : petites guirlandes végétales symétriques (tige ondulée, vrilles, feuilles, rosette),
// engendrées à partir d'une graine. Un essai garde toujours les mêmes ornements ; deux essais n'ont pas les mêmes.
// Pure fonction : le serveur insère le SVG tel quel entre les sections (voir lib/articles/edits.mjs).
function hash(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const f = n => Math.round(n * 10) / 10;

// feuille pointée de longueur L, dessinée vers +x depuis l'origine
const leaf = L => `M0 0C${f(L * .25)} ${f(-L * .42)} ${f(L * .7)} ${f(-L * .42)} ${f(L)} 0C${f(L * .7)} ${f(L * .3)} ${f(L * .25)} ${f(L * .3)} 0 0Z`;
// vrille en spirale qui part de (0,0) vers +x puis s'enroule ; s = sens (+1 vers le bas, -1 vers le haut), r = rayon de départ
function curl(r, s) {
  const a = r, b = r * .62, c = r * .36;
  return `M0 0C${f(a * .6)} ${f(-s * a * .15)} ${f(a * 1.25)} ${f(-s * a * .9)} ${f(a * 1.1)} ${f(-s * a * 1.45)}C${f(a * .95)} ${f(-s * a * 1.95)} ${f(a * .2)} ${f(-s * a * 1.9)} ${f(a * .12)} ${f(-s * a * 1.35)}C${f(a * .08)} ${f(-s * a * .95)} ${f(a * .55)} ${f(-s * b * 1.05)} ${f(a * .72)} ${f(-s * c * 1.6)}`;
}
function rosette(r) { // fleur vue de face : pétales sur un cercle, cœur plein
  let petals = '';
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; petals += `<circle cx="${f(Math.cos(a) * r * .62)}" cy="${f(Math.sin(a) * r * .62)}" r="${f(r * .3)}" fill="none"/>`; }
  return `${petals}<circle r="${f(r * .3)}" fill="currentColor" stroke="none"/><circle r="${f(r * 1.12)}" fill="none" stroke-width=".8"/>`;
}
function bud(L) { // bouton : goutte avec deux sépales
  return `<path d="M0 0C${f(L * .2)} ${f(-L * .55)} ${f(L * .75)} ${f(-L * .55)} ${f(L)} 0C${f(L * .75)} ${f(L * .55)} ${f(L * .2)} ${f(L * .55)} 0 0Z" fill="currentColor" fill-opacity=".85" stroke="none"/><path d="M${f(L * .1)} ${f(L * .08)}C${f(L * .3)} ${f(L * .5)} ${f(L * .5)} ${f(L * .6)} ${f(L * .62)} ${f(L * .72)}M${f(L * .1)} ${f(-L * .08)}C${f(L * .3)} ${f(-L * .5)} ${f(L * .5)} ${f(-L * .6)} ${f(L * .62)} ${f(-L * .72)}" fill="none"/>`;
}

/**
 * @param {string} seedText  graine (adresse de l'essai + rang de l'ornement)
 * @param {{ large?: boolean }} [o]  large : ornement de fin, plus fourni
 * @returns {string} un <svg> en ligne (couleur = currentColor)
 */
export function ornamentSvg(seedText, o = {}) {
  const rand = rng(hash(seedText)), W = 400, H = o.large ? 100 : 80, cy = H / 2 + 2;
  const pick = a => a[Math.floor(rand() * a.length)];
  const amp = (o.large ? 13 : 9) + rand() * 7, stops = o.large ? 4 : (rand() < .5 ? 2 : 3);
  // moitié droite : tige qui ondule du centre vers le bord, avec vrilles, feuilles et fleur terminale
  const xs = [206]; for (let i = 1; i <= stops; i++) xs.push(206 + (i * (150 - 0)) / stops + rand() * 8);
  const ys = xs.map((_, i) => i === 0 ? cy : cy + (i % 2 ? -amp : amp) * (.7 + rand() * .5));
  let d = `M${xs[0]} ${f(ys[0])}`;
  for (let i = 1; i < xs.length; i++) { const mx = (xs[i - 1] + xs[i]) / 2; d += `C${f(mx)} ${f(ys[i - 1])} ${f(mx)} ${f(ys[i])} ${f(xs[i])} ${f(ys[i])}`; }
  let g = `<path d="${d}" fill="none"/>`;
  for (let i = 1; i < xs.length; i++) {
    const up = i % 2 === 1, s = up ? 1 : -1; // pic haut : vrille vers le haut ; creux : vers le bas
    if (rand() < .88) g += `<g transform="translate(${f(xs[i])} ${f(ys[i])}) rotate(${up ? -12 : 12})"><path d="${curl(10 + rand() * 4 + (o.large ? 3 : 0), up ? -1 : 1)}" fill="none"/></g>`;
    const mx = (xs[i - 1] + xs[i]) / 2, my = (ys[i - 1] + ys[i]) / 2;
    g += `<g transform="translate(${f(mx)} ${f(my)}) rotate(${up ? -55 : 55})"><path d="${leaf(13 + rand() * 6)}" fill="currentColor" fill-opacity=".9" stroke="none"/></g>`;
    if (rand() < .65) g += `<g transform="translate(${f(mx)} ${f(my)}) rotate(${up ? 60 : -60})"><path d="${leaf(9 + rand() * 4)}" fill="none"/></g>`;
    void s;
  }
  const endX = xs[xs.length - 1] + 14, endY = ys[ys.length - 1];
  const t = rand();
  g += `<g transform="translate(${f(endX)} ${f(endY)})">${t < .5 ? rosette(o.large ? 11 : 9) : t < .8 ? `<g transform="rotate(${f((rand() - .5) * 40)})">${bud(o.large ? 20 : 16)}</g>` : `<path d="${curl(9, endY < cy ? -1 : 1)}" fill="none"/><g transform="translate(2 0) rotate(-20)"><path d="${leaf(14)}" fill="currentColor" fill-opacity=".9" stroke="none"/></g>`}</g>`;
  // motif central : bouton de lys au centre, flanqué de deux pétales qui s'enroulent
  const L = o.large ? 24 : 19;
  const center = `<path d="M200 ${cy + L * .9}C${200 - L * .5} ${cy + L * .5} ${200 - L * .5} ${cy - L * .5} 200 ${cy - L}C${200 + L * .5} ${cy - L * .5} ${200 + L * .5} ${cy + L * .5} 200 ${cy + L * .9}Z" fill="currentColor" fill-opacity=".9" stroke="none"/>`
    + `<path d="M200 ${cy + L * .5}C${200 - L * .9} ${cy + L * .5} ${200 - L * 1.05} ${cy - L * .25} ${200 - L * .62} ${cy - L * .62}C${200 - L * .5} ${cy - L * .2} ${200 - L * .3} ${cy + L * .05} 200 ${cy + L * .25}" fill="none"/>`;
  const kind = pick(['lily', 'lily', 'rosette', 'trefoil']);
  const half = g;
  const mirrored = `<g transform="matrix(-1 0 0 1 400 0)">${half}</g>`;
  const centerMirror = `<g transform="matrix(-1 0 0 1 400 0)">${center.split('<path').slice(2).map(x => '<path' + x).join('')}</g>`;
  let mid;
  if (kind === 'rosette') mid = `<g transform="translate(200 ${cy})">${rosette(o.large ? 14 : 11)}</g>`;
  else if (kind === 'trefoil') mid = `<g transform="translate(200 ${cy + L * .5}) rotate(-90)">${bud(L * 1.25)}</g><g transform="translate(200 ${cy + L * .5}) rotate(-145)">${bud(L * .95)}</g><g transform="translate(200 ${cy + L * .5}) rotate(-35)">${bud(L * .95)}</g>`;
  else mid = center + centerMirror;
  return `<svg class="vra-orn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${half}${mirrored}${mid}</svg>`;
}
