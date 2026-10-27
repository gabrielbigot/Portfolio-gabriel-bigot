// Modifications directes d'un article / sous-article (texte, ordre, masquage, sections ajoutées) — content/articles/<slug>/edits.json.
// Le calque est appliqué au HTML par lib/articles/edits.mjs ; ici : lecture et écriture dans le brouillon du studio.
import crypto from "node:crypto"
import { getStore } from "@/lib/studio/store"
import { cleanInline, ID_OK, KINDS, BLOCK_TYPES, FIG_ID, parseReportData, cleanSvg } from "@/lib/articles/edits.mjs"
import { IMG_RE } from "@/lib/articles/annotations"
import { snapshot } from "@/lib/articles/history"

export type Added = { id: string; kind: string; title: string; toc?: string; marker?: string; file?: string; caption?: string; blocks?: Block[] }
export type Block = Record<string, any>
export type Evidence = Record<string, string>
export type PageEdits = { text?: Record<string, { h: string; html: string }>; order?: string[]; hidden?: string[]; added?: Added[] }
export type Edits = { pages: Record<string, PageEdits>; figures?: Record<string, Record<string, unknown>>; evidence?: Evidence[] }

export const PAGE_RE = /^$|^[A-Za-z0-9]{3,40}(\/[A-Za-z0-9]{3,40}){0,8}$/
const file = (slug: string) => `content/articles/${slug}/edits.json`

export async function readEdits(slug: string): Promise<Edits> {
  const b = await getStore().readDraft(file(slug)); if (!b) return { pages: {} }
  try { const j = JSON.parse(b.toString("utf8")); return { pages: j.pages && typeof j.pages === "object" ? j.pages : {}, figures: j.figures && typeof j.figures === "object" ? j.figures : {}, evidence: Array.isArray(j.evidence) ? j.evidence : [] } } catch { return { pages: {} } }
}
const str = (v: unknown, n: number) => (typeof v === "string" ? v : "").slice(0, n)
/** Blocs d'une section écrite dans l'éditeur d'écriture : types connus seulement, textes bornés (le HTML est produit à l'affichage, échappé). */
export function cleanBlocks(v: unknown): Block[] {
  const out: Block[] = []
  for (const b of (Array.isArray(v) ? v : []).slice(0, 300)) {
    const t = String(b?.type); if (!BLOCK_TYPES.includes(t)) continue; const n0 = out.length
    if (t === "lede" || t === "p" || t === "h3") out.push({ type: t, text: str(b.text, 30000) })
    else if (t === "ul" || t === "ol") out.push({ type: t, items: (Array.isArray(b.items) ? b.items : []).slice(0, 60).map((x: unknown) => str(x, 8000)) })
    else if (t === "quote") out.push({ type: t, text: str(b.text, 20000), cite: str(b.cite, 2000) })
    else if (t === "callout") out.push({ type: t, variant: typeof b.variant === "string" && /^[a-z]{0,12}$/.test(b.variant) ? b.variant : "keep", title: str(b.title, 2000), text: str(b.text, 30000) })
    else if (t === "table") out.push({ type: t, caption: str(b.caption, 3000), head: (Array.isArray(b.head) ? b.head : []).slice(0, 12).map((x: unknown) => str(x, 400)), rows: (Array.isArray(b.rows) ? b.rows : []).slice(0, 200).map((r: unknown) => (Array.isArray(r) ? r : []).slice(0, 12).map((x: unknown) => str(x, 12000))), ...(b.attrs && typeof b.attrs === "object" ? { attrs: Object.fromEntries(["wrap", "table", "cap", "th"].filter(k => typeof b.attrs[k] === "string" && /^[\w\s=":;.,%#()-]{0,200}$/.test(b.attrs[k])).map(k => [k, b.attrs[k]])) } : {}) })
    else if (t === "image") { if (IMG_RE.test(String(b.file))) out.push({ type: t, file: String(b.file), caption: str(b.caption, 3000) }) }
    else if (t === "figure") { if (FIG_ID.test(String(b.fig))) out.push({ type: t, fig: String(b.fig), title: str(b.title, 3000), reading: str(b.reading, 30000), ...(b.kicker ? { kicker: str(b.kicker, 40) } : {}), ...(typeof b.ariaLabel === "string" ? { ariaLabel: str(b.ariaLabel, 600) } : {}) }) }
    else if (t === "code") out.push({ type: t, text: str(b.text, 20000) })
    else if (t === "genfig") { const svg = cleanSvg(b.svg); if (svg) out.push({ type: t, svg, title: str(b.title, 3000), reading: str(b.reading, 30000), ...(b.data && typeof b.data === "object" ? { data: { text: str(b.data.text, 6000), unit: str(b.data.unit, 20) } } : {}), ...(typeof b.request === "string" ? { request: str(b.request, 1000) } : {}), ...(typeof b.source === "string" ? { source: str(b.source, 6000) } : {}) }) }
    else if (t === "html") { const h = str(b.html, 400000); if (!/<\s*(script|iframe|object|embed|link|meta|base|form)\b|\son[a-z]+\s*=|javascript:|srcdoc\s*=/i.test(h)) out.push({ type: t, html: h }) }
    else if (t === "gloss") out.push({ type: t, terms: (Array.isArray(b.terms) ? b.terms : []).slice(0, 40).map((g: any) => ({ term: str(g?.term, 120), def: str(g?.def, 12000) })).filter((g: { term: string }) => g.term) })
    else out.push({ type: "divider" })
    // provenance d'un texte écrit par Claude (demande, texte d'avant, état de relecture) : jamais affichée dans l'article
    if (out.length > n0 && b.ai && typeof b.ai === "object" && typeof b.ai.prompt === "string") out[out.length - 1].ai = { prompt: str(b.ai.prompt, 2000), ...(typeof b.ai.before === "string" ? { before: str(b.ai.before, 30000) } : {}), ...(typeof b.ai.after === "string" ? { after: str(b.ai.after, 30000) } : {}), ...(b.ai.reviewed ? { reviewed: true } : {}), ...(typeof b.ai.at === "string" ? { at: str(b.ai.at, 40) } : {}) }
  }
  return out
}
const STATES = ["actual", "estimate", "forecast", "derived", "claim", "gap"]
const EV_FIELDS = ["fact", "value", "unit", "sourceClass", "sourceName", "publicationDate", "observationDate", "url", "formula", "limitations"]
/** clé libre suivante (K70…) d'après le registre d'origine et les sources déjà ajoutées */
export async function nextKey(slug: string, all: Edits): Promise<string> {
  let max = 0; const b = await getStore().readDraft(`content/articles/${slug}/build/data/report-data.js`)
  if (b) { try { for (const e of parseReportData(b.toString("utf8")).evidence || []) { const m = /^K(\d+)$/.exec(e.key); if (m) max = Math.max(max, +m[1]) } } catch { /* registre illisible */ } }
  for (const e of all.evidence || []) { const m = /^K(\d+)$/.exec(e.key); if (m) max = Math.max(max, +m[1]) }
  return "K" + (max + 1)
}
const ids = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).filter(x => ID_OK.test(x)).slice(0, 200) : [])

export async function editOp(slug: string, b: any): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (b?.op === "writesec" || b?.op === "layout" || b?.op === "figure" || b?.op === "evidence") await snapshot(slug, "auto").catch(() => null) // point de restauration avant une série de modifications
  if (b?.op === "figure") { // remplacement (ou rétablissement) d'une figure : le moteur la redessine avec les nouvelles données
    const fig = String(b.fig || ""); if (!/^fig-[a-z0-9-]{1,50}$/.test(fig)) return { ok: false, error: "figure" }
    const all = await readEdits(slug); const figs = { ...(all.figures || {}) }
    if (b.figure === null) delete figs[fig]
    else { const o = b.figure; if (!o || typeof o !== "object" || typeof o.type !== "string" || JSON.stringify(o).length > 80000) return { ok: false, error: "figure invalide" }; figs[fig] = o }
    await getStore().writeDraft(file(slug), JSON.stringify({ ...all, figures: figs }, null, 1) + "\n"); return { ok: true }
  }
  if (b?.op === "evidence") { // nouvelle source : clé attribuée ici (K<n>) ; apparaît dans la fiche de source et dans « Voir les données »
    const all = await readEdits(slug), e = b.entry || {}; const fact = str(e.fact, 1200).trim(); if (!fact) return { ok: false, error: "décrivez le fait ou la source" }
    const key = await nextKey(slug, all), entry: Evidence = { key }; for (const f of EV_FIELDS) entry[f] = str(e[f], f === "limitations" ? 1500 : f === "fact" ? 1200 : 400).trim(); entry.state = STATES.includes(e.state) ? e.state : "claim"; if (entry.url && !/^https?:\/\//i.test(entry.url)) entry.url = ""
    await getStore().writeDraft(file(slug), JSON.stringify({ ...all, evidence: [...(all.evidence || []), entry] }, null, 1) + "\n"); return { ok: true, id: key }
  }
  const page = String(b?.page ?? ""); if (!PAGE_RE.test(page)) return { ok: false, error: "page" }
  const all = await readEdits(slug); const pg: PageEdits = all.pages[page] || {}; let out: { ok: boolean; id?: string } = { ok: true }
  switch (b.op) {
    case "text": {
      const k = String(b.k || ""); if (!/^[a-z0-9-]{1,41}:\d{1,4}$|^(cover|foot):\d{1,4}$/.test(k) || !/^[a-z0-9]{1,10}$/.test(String(b.h))) return { ok: false, error: "clé" }
      const text = { ...(pg.text || {}) }
      if (b.reset) delete text[k]; else text[k] = { h: String(b.h), html: cleanInline(String(b.html || "")) }
      pg.text = text; break
    }
    case "layout": {
      pg.order = ids(b.order); pg.hidden = ids(b.hidden)
      const drop = new Set(ids(b.removeAdded)); if (drop.size) { pg.added = (pg.added || []).filter(a => !drop.has(a.id)); pg.order = pg.order.filter(i => !drop.has(i)); pg.hidden = pg.hidden.filter(i => !drop.has(i)); const text = { ...(pg.text || {}) }; for (const k of Object.keys(text)) if (drop.has(k.split(":")[0])) delete text[k]; pg.text = text }
      break
    }
    case "add": case "dup": {
      const id = "x-" + crypto.randomBytes(4).toString("hex"); const order = ids(b.order); const after = String(b.afterId || "")
      let entry: Added
      if (b.op === "dup") { const src = (pg.added || []).find(a => a.id === String(b.id)); if (!src) return { ok: false, error: "seules les sections ajoutées se dupliquent" }; entry = { ...src, id }; const text = { ...(pg.text || {}) }; for (const [k, v] of Object.entries(text)) if (k.startsWith(src.id + ":")) text[id + k.slice(src.id.length)] = v; pg.text = text }
      else {
        const kind = String(b.kind); if (!KINDS.includes(kind)) return { ok: false, error: "type" }
        entry = { id, kind, title: String(b.title || (kind === "image" ? "Image" : kind === "quote" ? "Citation" : kind === "list" ? "Liste" : "Nouvelle section")).slice(0, 120) }
        if (kind === "image") { if (!IMG_RE.test(String(b.file))) return { ok: false, error: "image" }; entry.file = String(b.file) }
        // nouvelles sections : toujours des sections « blocs » (modifiables dans l'éditeur d'écriture)
        entry = { id, kind: "blocks", title: entry.title, blocks: kind === "image" ? [{ type: "image", file: String(b.file), caption: "" }] : kind === "quote" ? [{ type: "quote", text: "Une citation à mettre en avant.", cite: "" }] : kind === "list" ? [{ type: "ul", items: ["Premier point", "Deuxième point", "Troisième point"] }] : [{ type: "p", text: "" }] }
      }
      pg.added = [...(pg.added || []), entry]
      const i = order.indexOf(after); order.splice(i < 0 ? order.length : i + 1, 0, id); pg.order = order; pg.hidden = ids(b.hidden ?? pg.hidden)
      out = { ok: true, id }; break
    }
    case "writesec": { // section écrite dans l'éditeur d'écriture : création ou remplacement (titre + blocs)
      const title = str(b.title, 600).trim() || "Nouvelle section", toc = typeof b.toc === "string" ? str(b.toc, 120).trim() : undefined, blocks = cleanBlocks(b.blocks); let id = String(b.id || "")
      if (id && !(pg.added || []).some(a => a.id === id)) return { ok: false, error: "section inconnue" }
      if (id) pg.added = (pg.added || []).map(a => a.id === id ? { ...a, kind: "blocks", title, ...(toc !== undefined ? { toc } : {}), blocks } : a)
      else { id = "x-" + crypto.randomBytes(4).toString("hex"); pg.added = [...(pg.added || []), { id, kind: "blocks", title, ...(toc ? { toc } : {}), blocks }]; const order = ids(b.order), i = order.indexOf(String(b.afterId || "")); order.splice(i < 0 ? order.length : i + 1, 0, id); pg.order = order; pg.hidden = ids(b.hidden ?? pg.hidden) }
      out = { ok: true, id }; break
    }
    default: return { ok: false, error: "opération" }
  }
  all.pages[page] = pg
  await getStore().writeDraft(file(slug), JSON.stringify(all, null, 1) + "\n"); return out
}
