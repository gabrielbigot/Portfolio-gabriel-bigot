// Données collées par l'auteur → figure de base du moteur de graphiques (aucune donnée inventée : tout vient du texte fourni).
export type Parsed = { shape: "values" | "twostates" | "time" | "events"; rows: { label: string; v: number[]; src?: string; date?: string }[]; headers: string[] }
const num = (t: string) => { const s = t.replace(/[\s %€$£]/g, "").replace(/−/g, "-").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN }
export function parseData(text: string): Parsed {
  const rows: Parsed["rows"] = []; let headers: string[] = []
  for (const raw of text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 200)) {
    let cells: string[]
    if (/[\t;|]/.test(raw)) cells = raw.split(/\t|;|\|/).map(c => c.trim())
    else { const m = /^(.*?)[\s:=]+(-?[\d][\d\s.,]*\s*%?)(?:\s+(K\d{1,4}))?$/.exec(raw); cells = m ? [m[1].trim(), m[2].trim(), ...(m[3] ? [m[3]] : [])] : raw.split(",").map(c => c.trim()) }
    if (cells.length < 2) continue
    let src: string | undefined; const vals: number[] = []
    for (const c of cells.slice(1)) { const k = /^K\d{1,4}$/.exec(c); if (k) { src = c; continue } const n = num(c); if (!Number.isNaN(n)) vals.push(n) }
    const dt = cells.slice(1).find(c => /^\d{4}-\d{2}-\d{2}$/.test(c)); if (dt) { rows.push({ label: cells[0].slice(0, 80), v: [], date: dt, src }); continue }
    if (!vals.length) { if (!rows.length && !headers.length) headers = cells; continue }
    rows.push({ label: cells[0].slice(0, 80), v: vals.slice(0, 6), src })
  }
  if (rows.length < 2) throw new Error("collez au moins deux lignes « libellé ; valeur » (ex. : France ; 12,5)")
  if (rows.every(r => r.date)) return { shape: "events", rows, headers }
  const cols = Math.min(...rows.map(r => r.v.length))
  const isTime = rows.length >= 3 && rows.every(r => /^(\d{4}([-/]\d{1,2})?|T[1-4] \d{4}|\d{1,2}\/\d{4})$/.test(r.label))
  return { shape: isTime ? "time" : cols === 2 ? "twostates" : "values", rows, headers }
}
const nice = (v: number) => { if (v <= 0) return 0; const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p }
const bounds = (vals: number[]) => { const hi = Math.max(...vals), lo = Math.min(...vals); return { min: lo < 0 ? -nice(-lo) : 0, max: hi > 0 ? nice(hi) : 0 } }
/** figure de départ : valeurs → dotplot, avant/après → dumbbell, série datée → lines */
export function baseFigure(p: Parsed, o: { title: string; unit: string; state: string; src: string }) {
  const st = (r: { src?: string }) => (r.src || o.src ? (o.state === "claim" ? "actual" : o.state) : o.state), sr = (r: { src?: string }) => r.src || o.src || undefined
  if (p.shape === "events") { const ds = p.rows.map(r => r.date!).sort(); return { type: "fuzzytimeline", label: o.title, from: ds[0], to: ds[ds.length - 1], today: ds[ds.length - 1], items: p.rows.map(r => ({ label: r.label, date: r.date, state: st(r), ...(sr(r) ? { src: sr(r) } : {}) })) } }
  if (p.shape === "time") {
    const ncol = Math.min(...p.rows.map(r => r.v.length)), names = p.headers.length > 1 ? p.headers.slice(1) : []
    const bl = bounds(p.rows.flatMap(r => r.v.slice(0, ncol))); return { type: "lines", label: o.title, ymin: bl.min, ymax: bl.max, x: p.rows.map(r => r.label), dec: 1, series: Array.from({ length: ncol }, (_, i) => ({ label: names[i] || (ncol > 1 ? `Série ${i + 1}` : o.title), values: p.rows.map(r => r.v[i]), state: st(p.rows[0]), ...(sr(p.rows[0]) ? { src: sr(p.rows[0]) } : {}) })) }
  }
  if (p.shape === "twostates") return { type: "dumbbell", label: o.title, unit: o.unit, ...bounds(p.rows.flatMap(r => r.v.slice(0, 2))), aLabel: p.headers[1] || "Avant", bLabel: p.headers[2] || "Après", data: p.rows.map(r => ({ label: r.label, a: r.v[0], b: r.v[1], state: st(r), ...(sr(r) ? { src: sr(r) } : {}) })) }
  return { type: "dotplot", label: o.title, desc: o.title, unit: o.unit, ...bounds(p.rows.map(r => r.v[0])), order: "desc", data: p.rows.map(r => ({ label: r.label, value: r.v[0], state: st(r), ...(sr(r) ? { src: sr(r) } : {}) })) }
}
