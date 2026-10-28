// Illustration ASCII d'un essai : une réaction-diffusion (Gray-Scott) dont l'état initial ne dépend que du nom de l'essai.
// Ce fichier sert deux fois : le serveur en tire le texte de départ (lib/articles/emit.mjs, page lisible sans JavaScript),
// puis article.js le charge et fait vivre la même figure, sans saut visible (même algorithme, même graine).
export const GLYPHS = '.,:;~+1#0';
const REGIMES = [
  { feed: 0.0545, k: 0.062 },  // corail
  { feed: 0.0367, k: 0.0649 }, // cellules qui se divisent
  { feed: 0.078, k: 0.061 },   // vers
  { feed: 0.029, k: 0.057 },   // labyrinthe
];
function hash(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Fait avancer le champ de n pas ; `feedShift` module lentement l'alimentation pour que la figure ne se fige jamais. */
export function stepState(st, n, feedShift = 0) {
  const { cols, rows, reg } = st, feed = reg.feed + feedShift;
  for (let s = 0; s < n; s++) {
    const { u, v, nu, nv } = st;
    for (let y = 0; y < rows; y++) {
      const up = ((y - 1 + rows) % rows) * cols, mid = y * cols, dn = ((y + 1) % rows) * cols;
      for (let x = 0; x < cols; x++) {
        const l = (x - 1 + cols) % cols, r = (x + 1) % cols, i = mid + x;
        const lu = -u[i] + 0.2 * (u[mid + l] + u[mid + r] + u[up + x] + u[dn + x]) + 0.05 * (u[up + l] + u[up + r] + u[dn + l] + u[dn + r]);
        const lv = -v[i] + 0.2 * (v[mid + l] + v[mid + r] + v[up + x] + v[dn + x]) + 0.05 * (v[up + l] + v[up + r] + v[dn + l] + v[dn + r]);
        const uvv = u[i] * v[i] * v[i];
        const a = u[i] + lu - uvv + feed * (1 - u[i]), b = v[i] + 0.5 * lv + uvv - (feed + reg.k) * v[i];
        nu[i] = a < 0 ? 0 : a > 1 ? 1 : a; nv[i] = b < 0 ? 0 : b > 1 ? 1 : b;
      }
    }
    st.u = nu; st.nu = u; st.v = nv; st.nv = v;
  }
}

/** Dépose une petite colonie en (cx, cy) : le lecteur peut ensemencer la figure avec le curseur. */
export function seedBlob(st, cx, cy, r = 1) {
  const { cols, rows } = st;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dy * dy > r * r) continue;
    const x = (Math.round(cx) + dx + cols) % cols, y = (Math.round(cy) + dy + rows) % rows, i = y * cols + x;
    st.u[i] = 0.5; st.v[i] = 0.3;
  }
}

function simulate(rand, reg, cols, rows) {
  const size = cols * rows;
  const st = { cols, rows, top: 10, reg, u: new Float32Array(size).fill(1), v: new Float32Array(size), nu: new Float32Array(size), nv: new Float32Array(size) };
  for (let b = 0; b < 16; b++) {
    const cx = Math.floor(rand() * cols), cy = Math.floor(rand() * rows), r = 1 + Math.floor(rand() * 2);
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (dx * dx + dy * dy > r * r) continue; const x = (cx + dx + cols) % cols, y = (cy + dy + rows) % rows, i = y * cols + x; st.u[i] = 0.5; st.v[i] = 0.25 + rand() * 0.1; }
  }
  stepState(st, 1500);
  return st;
}

/** Texte des `rows` lignes visibles du champ (une bande de 8 lignes seulement donnerait des colonnes uniformes : on prélève dans un champ plus haut). */
export function renderState(st, rows = 9) {
  const { cols, v, top } = st, lines = []; let filled = 0;
  for (let y = top; y < top + rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) { const val = v[y * cols + x]; if (val < 0.03) line += ' '; else { filled++; line += GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(Math.min(1, (val - 0.03) / 0.35) * 8.99))]; } }
    lines.push(line.replace(/\s+$/, ''));
  }
  return { text: lines.join('\n'), density: filled / (cols * rows) };
}

/** État de départ d'un essai : on essaie plusieurs régimes jusqu'à une densité agréable (ni vide ni saturée). */
export function buildState(seedText, cols = 72, rows = 9, simRows = 30) {
  const seed = hash(seedText), rand = rng(seed);
  let best = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    const st = simulate(rand, REGIMES[(seed + attempt) % REGIMES.length], cols, simRows);
    const { density } = renderState(st, rows);
    if (!best || Math.abs(density - 0.4) < Math.abs(best.density - 0.4)) best = { st, density };
    if (density > 0.18 && density < 0.62) break;
  }
  return best.st;
}

export function asciiArt(seedText, cols = 72, rows = 9) { return renderState(buildState(seedText, cols, rows), rows).text; }
