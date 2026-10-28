// Relecture locale d'un article (sans IA) : doublons, sigles non définis, figures non commentées, chiffres sans source, affirmations très fortes, sections trop longues.
import { detectUnsourced, words } from "@/lib/studio/jev-detect"

export type RBlock = { id: string; k: string; text: string; x?: Record<string, any> }
export type RSec = { id: string; title: string; blocks: RBlock[] }
export type Issue = { sec: string; block?: string; kind: "doublon" | "sigle" | "figure" | "source" | "fort" | "long" | "vide" | "reste" | "incohérence" | "chiffre"; text: string }
const TEXTY = new Set(["p", "lede", "bullet", "number", "quote", "callout", "h3"])
const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\{\{[KDV][\d-]+\}\}|[*`\\]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
const set = (t: string) => new Set(norm(t).split(" ").filter(w => w.length > 3))
const IGNORE = new Set(["IA", "PDG", "UE", "USA", "FR", "EUR", "TVA", "ETF", "RGPD", "API", "PME", "OK", "PIB", "ONU", "UK"])
const STRONG = /\b(toujours|jamais|tous les|toutes les|aucun|aucune|prouve que|il est certain|évidemment|sans aucun doute|c['’]est faux|c['’]est vrai|personne ne|tout le monde)\b/i

const STOP = new Set(["de", "des", "du", "le", "la", "les", "un", "une", "en", "et", "a", "à", "au", "aux", "est", "sont", "pour", "par", "sur", "dans", "avec", "que", "qui", "ce", "cette", "ces", "se", "son", "sa", "ses", "plus", "moins", "environ", "près", "soit", "ont", "avait", "été"])
const UNITS = "%|points?|pts|M€|Md€|k€|€|millions?|milliards?|M\\$|\\$"
type Fact = { key: string; num: number; unit: string; shown: string; ctx: string }
const num = (t: string) => parseFloat(t.replace(/[\s\u00a0\u202f]/g, "").replace(",", "."))
/** chiffres affirmés dans un texte, avec leur « sujet » (les deux mots qui précèdent) et l'année voisine éventuelle */
export function facts(text: string): Fact[] {
  const t = text.replace(/\{\{[KDV][\d-]+\}\}|[*`\\]/g, ""), out: Fact[] = []
  for (const m of t.matchAll(new RegExp(`([\\p{L}'’-]{3,}(?:\\s+[\\p{L}'’-]{2,}){0,3})\\s*(?:de|à|est|:|=|atteint|vaut|passe à|s['’]élève à|représente)?\\s*(-?\\d+(?:[\\s\\u00a0\\u202f]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNITS})`, "giu"))) {
    const words = m[1].toLowerCase().split(/\s+/).filter(w => !STOP.has(w) && w.length >= 3); if (!words.length) continue
    const ctx = t.slice(Math.max(0, (m.index || 0) - 40), (m.index || 0) + m[0].length + 25), yr = /\b(19|20)\d{2}\b/.exec(ctx)
    out.push({ key: words.slice(-2).join(" ") + (yr ? "@" + yr[0] : ""), num: num(m[2]), unit: m[3].toLowerCase(), shown: m[0].trim().slice(-50), ctx })
  }
  return out
}
const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.05, Math.abs(b) * 0.005)
/** chiffres du texte qui contredisent un chiffre déjà donné ailleurs pour le même sujet (même unité, même année) */
export function conflictsFor(secs: RSec[], blockId: string): { sec: string; block: string; text: string }[] {
  const me = secs.flatMap(s => s.blocks.map(b => ({ s, b }))).find(x => x.b.id === blockId); if (!me) return []
  const mine = facts(me.b.text), out: { sec: string; block: string; text: string }[] = []
  if (!mine.length) return out
  for (const { s, b } of secs.flatMap(sc => sc.blocks.filter(b => TEXTY.has(b.k) && b.id !== blockId).map(b => ({ s: sc, b })))) for (const f of facts(b.text)) for (const g of mine) if (f.key === g.key && f.unit === g.unit && !close(f.num, g.num)) out.push({ sec: s.id, block: b.id, text: `« ${g.shown} » ici, mais « ${f.shown} » ailleurs (section « ${s.title.slice(0, 40)} »)` })
  return out.slice(0, 3)
}
/** valeurs d'une figure : [{ label, value }] (data / items / séries) */
function figValues(f: any): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = []
  for (const k of ["data", "items", "rows", "points"]) if (Array.isArray(f?.[k])) for (const d of f[k]) { const v = typeof d?.value === "number" ? d.value : typeof d?.b === "number" ? d.b : undefined; if (v !== undefined && typeof d.label === "string") out.push({ label: d.label, value: v }) }
  if (Array.isArray(f?.series) && Array.isArray(f?.x)) for (const sr of f.series) if (Array.isArray(sr.values)) sr.values.forEach((v: unknown, i: number) => { if (typeof v === "number") out.push({ label: String(f.x[i]), value: v }) })
  return out
}
export function review(secs: RSec[], only?: string, figs?: Record<string, any>): Issue[] {
  const out: Issue[] = [], seen = new Map<string, string>(), firstAcr = new Map<string, { sec: string; block: string; ctx: string }>()
  const todo = only ? secs.filter(s => s.id === only) : secs
  const all: { sec: RSec; b: RBlock }[] = secs.flatMap(sec => sec.blocks.filter(b => TEXTY.has(b.k) && b.text.trim()).map(b => ({ sec, b })))
  for (const { sec, b } of all) { for (const m of b.text.matchAll(/\b([A-ZÉ]{2,6})\b/g)) if (!firstAcr.has(m[1])) firstAcr.set(m[1], { sec: sec.id, block: b.id, ctx: b.text.slice(Math.max(0, (m.index || 0) - 60), (m.index || 0) + 60) }) }
  for (const sec of todo) {
    const wc = sec.blocks.reduce((n, b) => n + (TEXTY.has(b.k) ? words(b.text) : 0), 0)
    if (!sec.title.trim()) out.push({ sec: sec.id, kind: "vide", text: "Section sans titre." })
    if (wc === 0 && !sec.blocks.some(b => b.k === "figure" || b.k === "table")) out.push({ sec: sec.id, kind: "vide", text: `La section « ${sec.title || "sans titre"} » est vide.` })
    if (wc > 450) out.push({ sec: sec.id, kind: "long", text: `Section longue (${wc} mots) : la couper en deux ? (écrivez « coupe la section ici » à l'endroit voulu)` })
    const secText = norm(sec.blocks.filter(b => TEXTY.has(b.k)).map(b => b.text).join(" "))
    for (const b of sec.blocks) {
      if (/\[À compléter/i.test(b.text)) out.push({ sec: sec.id, block: b.id, kind: "reste", text: "Note « [À compléter… ] » encore présente." })
      if (b.k === "figure") { const t = set(b.x?.title || ""), hit = [...t].filter(w => secText.includes(w)).length; if (!/figure|graphique/.test(secText) && hit < 2) out.push({ sec: sec.id, block: b.id, kind: "figure", text: `La figure « ${(b.x?.title || "sans titre").slice(0, 60)} » n'est pas commentée dans le texte de la section.` }) }
      if (!TEXTY.has(b.k) || !b.text.trim()) continue
      if (words(b.text) >= 8) {
        const key = [...set(b.text)].sort().join(" "), first = [...set(b.text)]
        for (const [k, where] of seen) { const a = new Set(k.split(" ")), inter = first.filter(w => a.has(w)).length; if (first.length >= 8 && inter / Math.max(first.length, a.size) >= 0.7) { out.push({ sec: sec.id, block: b.id, kind: "doublon", text: "Ce passage ressemble beaucoup à un passage déjà écrit plus haut." }); void where; break } }
        seen.set(key, b.id)
      }
      if (b.k !== "quote" && detectUnsourced(b.text)) out.push({ sec: sec.id, block: b.id, kind: "source", text: "Chiffre affirmé sans source." })
      const st = STRONG.exec(b.text); if (st && words(b.text) < 80) out.push({ sec: sec.id, block: b.id, kind: "fort", text: `Affirmation très forte (« ${st[0]} ») : à nuancer ou à sourcer ?` })
    }
  }
  // cohérence : un même sujet, deux chiffres différents (même unité, même année)
  { const seenFacts = new Map<string, { shown: string; sec: string; num: number }>()
    for (const sec of secs) for (const b of sec.blocks) { if (!TEXTY.has(b.k)) continue; for (const f of facts(b.text)) { const k = f.key + "|" + f.unit, prev = seenFacts.get(k)
      if (prev && !close(prev.num, f.num) && prev.sec !== sec.id && (!only || sec.id === only || prev.sec === only)) out.push({ sec: sec.id, block: b.id, kind: "incohérence", text: `« ${f.shown} » ici, mais « ${prev.shown} » dans une autre section : même sujet, chiffres différents.` })
      else if (!prev) seenFacts.set(k, { shown: f.shown, sec: sec.id, num: f.num }) } } }
  // figures : chiffre du texte différent de celui de la figure pour la même étiquette
  if (figs) for (const sec of todo) for (const b of sec.blocks) { if (b.k !== "figure") continue; const f = figs[b.x?.fig]; if (!f) continue; const vals = figValues(f)
    for (const v of vals) { const lab = v.label.toLowerCase(); if (lab.length < 3) continue
      for (const s2 of secs) for (const tb of s2.blocks) { if (!TEXTY.has(tb.k)) continue; const low = tb.text.toLowerCase(), at = low.indexOf(lab); if (at < 0) continue
        const m = new RegExp(`^.{0,40}?(-?\\d+(?:[\\s\\u00a0\\u202f]\\d{3})*(?:[.,]\\d+)?)\\s*(?:${UNITS})`, "iu").exec(tb.text.slice(at + lab.length, at + lab.length + 60))
        if (m && !close(num(m[1]), v.value) && out.length < 60) out.push({ sec: s2.id, block: tb.id, kind: "chiffre", text: `Le texte donne « ${v.label} ${m[1]} » mais la figure « ${(b.x?.title || "").slice(0, 50)} » indique ${v.value}.` }) } } }
  for (const [acr, f] of firstAcr) { if (IGNORE.has(acr) || (only && f.sec !== only)) continue; if (!new RegExp(`\\(${acr}\\)|${acr}\\s*\\(`).test(f.ctx)) out.push({ sec: f.sec, block: f.block, kind: "sigle", text: `« ${acr} » apparaît sans être défini à la première occurrence.` }) }
  return out
}
