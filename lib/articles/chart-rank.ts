// « Propose d'autres graphiques » : alternatives à la forme d'une figure, classées par le modèle de décision (voir le skill dossier-article :
// scripts/decision-model.json, chart-traits.json, history.json — copiés ici par scripts/export_chart_model.mjs).
import model from "@/lib/articles/chart-model/decision-model.json"
import traitsFile from "@/lib/articles/chart-model/chart-traits.json"
import hist from "@/lib/articles/chart-model/history.json"
import contracts from "@/lib/articles/chart-model/chart-contracts.json"

type Fig = Record<string, any>
const traits = (traitsFile as unknown as { types: Record<string, [number, number, string]> }).types
const CONTRACTS = contracts as Record<string, string>
export const contractOf = (t: string) => CONTRACTS[t] || ""
export const knownType = (t: string) => !!traits[t] && !!CONTRACTS[t]

const ARR = ["data", "items", "rows", "points", "nodes", "events", "rooms", "lines", "series", "sources", "stations", "figures"]
/** brief déduit de la figure : nombre d'éléments, valeurs négatives, états incertains (le reste vient des traits de la forme d'origine) */
export function briefOf(fig: Fig) {
  let n = 0, signed = false, soft = false
  const walk = (o: any, depth: number) => {
    if (depth > 4 || o == null) return
    if (Array.isArray(o)) { o.forEach(x => walk(x, depth + 1)); return }
    if (typeof o === "object") { for (const [k, v] of Object.entries(o)) { if (typeof v === "number" && /^(value|low|high|a|b|start|end|amount|magnitude)$/.test(k) && v < 0) signed = true; if (k === "state" && /^(estimate|forecast|claim|gap)$/.test(String(v))) soft = true; walk(v, depth + 1) } }
  }
  for (const k of ARR) if (Array.isArray(fig[k])) n = Math.max(n, fig[k].length)
  walk(fig, 0)
  const fl = (traits[fig.type] || [0, 0, ""])[2]
  return { n: n || undefined, signed, time: fl.includes("t") || undefined, hier: fl.includes("h") || undefined, xy: fl.includes("x") || undefined, sum100: fl.includes("p") || undefined, links: fl.includes("r") || undefined, geo: fl.includes("g") || undefined, uncertain: soft || fl.includes("u") || undefined }
}

type Brief = ReturnType<typeof briefOf>
function rules(t: string, B: Brief) {
  const tr = traits[t]; if (!tr) return { adj: 0, why: [] as string[], drop: null as string | null }
  const [mn, mx, fl] = tr, has = (c: string) => fl.includes(c); let adj = 0; const why: string[] = []; let drop: string | null = null
  if (B.n != null) { if (B.n < mn * .6 || B.n > mx * 1.6) drop = `${B.n} éléments : lisible entre ${mn} et ${mx}`; else if (B.n >= mn && B.n <= mx) adj += 3; else { adj -= 4; why.push(`${B.n} éléments : zone idéale ${mn}–${mx}`) } }
  if (B.signed && !has("s")) drop = drop || "valeurs négatives mal gérées"; if (B.signed && has("s")) adj += 2
  if (B.time) adj += has("t") ? 3 : -6; if (B.hier) adj += has("h") ? 3 : -4; if (B.xy) adj += has("x") ? 3 : -5; if (B.geo) adj += has("g") ? 4 : -3; if (B.links) adj += has("r") ? 3 : -5
  if (B.sum100) adj += has("p") ? 3 : -3; if (B.uncertain) adj += has("u") ? 3 : -4
  return { adj, why, drop }
}

export type Alt = { type: string; fit: number; when: string; uses: number; fresh: boolean; inLast2: boolean; score: number; why: string[]; contract: string }
export function alternatives(fig: Fig, usedHere: string[] = [], top = 6, onlyIntent?: string): { current: string; brief: Brief; alts: Alt[] } {
  const cur = String(fig.type), B = briefOf(fig)
  const arts = (hist as { articles: { figures: { type: string }[] }[] }).articles, last2 = new Set(arts.slice(-2).flatMap(a => a.figures.map(f => f.type))), use = new Map<string, number>()
  arts.forEach(a => new Set(a.figures.map(f => f.type)).forEach(t => use.set(t, (use.get(t) || 0) + 1)))
  const intents = (model as unknown as { intents: { id: string; options: [string, number, string][] }[] }).intents
  const shared = intents.filter(i => i.options.some(o => o[0] === cur)), pool = onlyIntent && intents.some(i => i.id === onlyIntent) ? intents.filter(i => i.id === onlyIntent) : shared.length ? shared : intents
  const cand = new Map<string, { fit: number; when: string }>()
  for (const i of pool) for (const [t, fit, when] of i.options) { if (t === cur || !knownType(t)) continue; const p = cand.get(t); if (!p || fit > p.fit) cand.set(t, { fit, when }) }
  const alts: Alt[] = []
  for (const [t, c] of cand) { const r = rules(t, B); if (r.drop) continue; const u = use.get(t) || 0, inLast2 = last2.has(t), here = usedHere.filter(x => x === t).length
    alts.push({ type: t, fit: c.fit, when: c.when, uses: u, fresh: u === 0, inLast2, why: r.why, contract: contractOf(t), score: c.fit * 10 + r.adj + (u === 0 ? 12 : u === 1 ? 5 : 0) - (inLast2 ? 12 : 0) - Math.min(u, 4) * 3 - here * 9 }) }
  alts.sort((a, b) => b.score - a.score); return { current: cur, brief: B, alts: alts.slice(0, top) }
}

/** nombres présents dans la figure d'origine mais absents de la nouvelle (contrôle de la conversion) */
export function missingNumbers(a: unknown, b: unknown): number[] {
  const grab = (o: unknown, s: Set<number>) => { if (typeof o === "number" && Number.isFinite(o)) s.add(Math.round(o * 1e4) / 1e4); else if (Array.isArray(o)) o.forEach(x => grab(x, s)); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!/^(min|max|from|to|today|now|unitValue|dec|max|step|width|height|columns|angle|segments)$/.test(k)) grab(v, s) }
  const A = new Set<number>(), Bn = new Set<number>(); grab(a, A); grab(b, Bn); return [...A].filter(x => !Bn.has(x))
}
