"use client"
// Éditeur d'écriture d'un dossier (article) : même forme que les dossiers du skill « dossier-article » — couverture, sommaire automatique,
// sections numérotées (chapô, texte, tableaux, encadrés « Position de l'auteur », glossaire), sources à pastilles K et figures choisies par le
// modèle de décision. Tout s'enregistre dans le BROUILLON (content/articles/<slug>/edits.json) ; rien n'est public avant « Publier ».
import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { studioApi } from "@/components/studio/ChangesDialog"
import BlockEditor, { BASE_ITEMS, mk, type B, type Item, type Hint, type Proposal } from "@/components/studio/BlockEditor"
import { wordDiff } from "@/lib/studio/diff"
import { PlanDialog, type PlanSec } from "@/components/studio/PlanDialog"
import FigureDialog, { FigurePreview } from "@/components/studio/FigureDialog"
import { detectData, detectListData, detectUnsourced, detectEvents, detectProsCons, detectDefinition, words } from "@/lib/studio/jev-detect"
import { parseCommand, applyCommand, describe, looksFreeInstruction, refersToSel, findInMd, SEL, type Cmd } from "@/lib/studio/jev-commands"
import { review as reviewDoc, conflictsFor, type Issue } from "@/lib/studio/jev-review"

type Raw = Record<string, any>
type Sec = { id: string; title: string; toc?: string; marker?: string; blocks: B[]; state: "" | "dirty" | "saving" | "saved" }
type Alt = { type: string; fit: number; when: string; uses: number; fresh: boolean; inLast2: boolean; why: string[] }
type Ev = { key: string; fact: string }

const api = <T,>(u: string, body: unknown) => studioApi<T>(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
const fromRaw = (c: Raw[], slug: string): B[] => {
  const out: B[] = []
  for (const r of c || []) {
    const n0 = out.length
    const t = r.type
    if (t === "lede" || t === "p") out.push(mk(t, r.text || ""))
    else if (t === "code") out.push(mk("code", r.text || ""))
    else if (t === "h3") out.push(mk("h3", r.text || ""))
    else if (t === "ul" || t === "ol") for (const it of r.items || []) out.push(mk(t === "ol" ? "number" : "bullet", it))
    else if (t === "quote") out.push(mk("quote", r.text || ""))
    else if (t === "callout") out.push(mk("callout", r.text || "", { x: { variant: r.variant === undefined ? "keep" : r.variant, title: r.title || "" } }))
    else if (t === "html") out.push(mk("html", "", { x: { html: r.html || "" } }))
    else if (t === "genfig") out.push(mk("genfig", "", { x: { svg: r.svg || "", title: r.title || "", reading: r.reading || "", data: r.data, request: r.request || "", source: r.source || "" } }))
    else if (t === "table") out.push(mk("table", "", { x: { head: r.head || [], rows: r.rows || [], caption: r.caption || "", ...(r.attrs ? { attrs: r.attrs } : {}) } }))
    else if (t === "image") out.push(mk("image", r.caption || "", { src: `/articles/${slug}/annotation-images/${r.file}` }))
    else if (t === "figure") out.push(mk("figure", "", { x: { fig: r.fig, title: r.title || "", reading: r.reading || "", ...(r.kicker ? { kicker: r.kicker } : {}), ...(typeof r.ariaLabel === "string" ? { ariaLabel: r.ariaLabel } : {}) } }))
    else if (t === "gloss") out.push(mk("gloss", "", { x: { terms: r.terms || [] } }))
    else if (t === "divider") out.push(mk("divider"))
    if (r.ai && out.length > n0) out[n0].ai = r.ai // provenance : demande à Claude, texte d'avant, relu ou non
  }
  return out.length ? out : [mk("p")]
}
const toRaw = (bs: B[]): Raw[] => {
  const out: Raw[] = []
  for (const b of bs) {
    const n0 = out.length
    if (b.k === "bullet" || b.k === "number") { const last = out[out.length - 1], ty = b.k === "number" ? "ol" : "ul"; if (last && last.type === ty) last.items.push(b.text); else out.push({ type: ty, items: [b.text], ...(b.ai ? { ai: b.ai } : {}) }); continue }
    if (b.k === "p" || b.k === "lede") { if (b.text.trim()) out.push({ type: b.k, text: b.text }) }
    else if (b.k === "h2" || b.k === "h3") { if (b.text.trim()) out.push({ type: "h3", text: b.text }) }
    else if (b.k === "quote") { if (b.text.trim()) out.push({ type: "quote", text: b.text }) }
    else if (b.k === "code") { if (b.text.trim()) out.push({ type: "code", text: b.text }) }
    else if (b.k === "callout") { if (b.text.trim() || b.x?.title) out.push({ type: "callout", variant: b.x?.variant === undefined ? "keep" : b.x.variant, title: b.x?.title || "", text: b.text }) }
    else if (b.k === "html") { if (b.x?.html) out.push({ type: "html", html: b.x.html }) }
    else if (b.k === "genfig") { if (b.x?.svg) out.push({ type: "genfig", svg: b.x.svg, title: b.x.title, reading: b.x.reading, data: b.x.data, request: b.x.request, source: b.x.source }) }
    else if (b.k === "table") out.push({ type: "table", ...b.x })
    else if (b.k === "image") { const f = (b.src || "").split("/").pop() || ""; if (f) out.push({ type: "image", file: f, caption: b.text }) }
    else if (b.k === "figure") { if (b.x?.fig) out.push({ type: "figure", fig: b.x.fig, title: b.x.title, reading: b.x.reading, ...(b.x.kicker ? { kicker: b.x.kicker } : {}), ...(typeof b.x.ariaLabel === "string" ? { ariaLabel: b.x.ariaLabel } : {}) }) }
    else if (b.k === "gloss") out.push({ type: "gloss", terms: (b.x?.terms || []).filter((g: { term: string }) => g.term) })
    else if (b.k === "divider") out.push({ type: "divider" })
    if (b.ai && out.length > n0 && !out[out.length - 1].ai) out[out.length - 1].ai = b.ai
  }
  return out
}
const NORM = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ")
/** sources du registre qui ressemblent le plus à un passage (mots communs pondérés, chiffres égaux) : propositions locales, sans IA */
function rankEvidence(ev: Raw[], text: string) {
  const toks = (t: string) => new Set(NORM(t).split(/\s+/).filter(w => w.length >= 4 || /^\d{2,}$/.test(w))), me = toks(text.replace(/\{\{[KDV][\d-]+\}\}/g, "")), docs = ev.map(e => toks(`${e.fact || ""} ${e.sourceName || ""} ${e.value || ""} ${e.limitations || ""}`))
  const df = new Map<string, number>(); docs.forEach(d => d.forEach(w => df.set(w, (df.get(w) || 0) + 1)))
  return ev.map((e, i) => { let sc = 0; for (const w of me) if (docs[i].has(w)) sc += Math.log(1 + docs.length / (df.get(w) || 1)) * (/^\d/.test(w) ? 2 : 1); return { e, sc } }).filter(x => x.sc > 2).sort((a, b) => b.sc - a.sc).slice(0, 3)
}
const firstSentence = (t: string) => t.replace(/\{\{[KDV]\d+\}\}/g, "").replace(/[*`]/g, "").split(/(?<=[.!?])\s/)[0].trim().slice(0, 110)
const ITEMS: Item[] = [
  BASE_ITEMS[0], { id: "lede", label: "Chapô", hint: "réponse directe", kw: "chapo lede intro", k: "lede" }, { id: "h3", label: "Sous-titre", hint: "## ", kw: "sous-titre h3 titre", k: "h3" },
  BASE_ITEMS[3], BASE_ITEMS[4], BASE_ITEMS[5], BASE_ITEMS[6],
  { id: "keep", label: "Encadré", hint: "à retenir", kw: "encadre callout note", k: "callout" }, { id: "opinion", label: "Position de l'auteur", hint: "opinion", kw: "opinion position auteur encadre", k: "callout" }, { id: "warn", label: "Attention", hint: "limite", kw: "attention limite avertissement warn", k: "callout" },
  { id: "table", label: "Tableau", hint: "lignes × colonnes", kw: "tableau table", k: "table" }, { id: "figure", label: "Graphique", hint: "modèle de décision", kw: "graphique figure chart jev decision", act: "figure" },
  { id: "source", label: "Citer une source", hint: "pastille K", kw: "source citation pastille K reference", act: "source" }, { id: "gloss", label: "Glossaire", hint: "termes", kw: "glossaire definition termes", k: "gloss" },
  BASE_ITEMS[7], BASE_ITEMS[8], BASE_ITEMS[9],
]

export default function ArticleWriter({ slug }: { slug: string }) {
  const [meta, setMeta] = useState<null | { title: string; subtitle: string; summary: string; createdInStudio: boolean; series?: string; adopted?: boolean }>(null)
  const [secs, setSecs] = useState<Sec[]>([]); const [figs, setFigs] = useState<Record<string, Raw>>({}); const [err, setErr] = useState(""); const [ready, setReady] = useState(false)
  const [aiOn, setAiOn] = useState<boolean | null>(null); const [evidence, setEvidence] = useState<Ev[]>([]); const [intents, setIntents] = useState<{ id: string; label: string }[]>([])
  const [metaState, setMetaState] = useState(""); const [srcDlg, setSrcDlg] = useState<null | { blockId: string | null; range: Range | null; hint: string }>(null)
  const [figDlg, setFigDlg] = useState<null | { secId: string; blockId: string; mode: "replace" | "after"; prefill?: { title: string; text: string; unit: string } }>(null)
  const [hist, setHist] = useState<null | { items: { id: string; at: string; label: string; sections: number; words: number }[]; sel: string; diff: { id: string; title: string; status: string }[] | null; busy: boolean }>(null)
  const openHistory = async () => { try { const r = await studioApi<{ items: any[] }>(`${base}/history`); setHist({ items: r.items, sel: "", diff: null, busy: false }) } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } }
  const pickVersion = async (id: string) => { setHist(h => h && { ...h, sel: id, diff: null }); try { const r = await studioApi<{ diff: any[] }>(`${base}/history?id=${id}`); setHist(h => h && { ...h, diff: r.diff }) } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } }
  const restoreVersion = async () => {
    if (!hist?.sel || !window.confirm("Restaurer cette version ? L'état actuel est conservé dans l'historique (« avant restauration »).")) return
    setHist(h => h && { ...h, busy: true })
    try { for (const t of Object.values(timers.current)) clearTimeout(t); timers.current = {}; await api(`${base}/history`, { op: "restore", id: hist.sel }); location.reload() } catch (e) { setErr(e instanceof Error ? e.message : String(e)); setHist(h => h && { ...h, busy: false }) }
  }
  const manualPoint = async () => { const label = window.prompt("Nom du point de restauration :", "Avant mes modifications"); if (label === null) return; try { for (const sc of secsRef.current) await saveSec(sc.id); await api(`${base}/history`, { op: "snapshot", label }); say("Point de restauration créé.") } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } }
  // sélection épinglée : le passage sélectionné reste surligné (même si le curseur va ailleurs) jusqu'à ce que vous disiez à Jev quoi en faire (« mets ça en gras », « explique ça », « source pour ça »…)
  const [pinned, setPinned] = useState<null | { secId: string; blockId: string; text: string; range: Range }>(null); const pinnedRef = useRef(pinned); pinnedRef.current = pinned
  useEffect(() => {
    const f = () => {
      const s = getSelection(); if (!s || s.isCollapsed || !s.rangeCount) return
      const r = s.getRangeAt(0), el = (r.startContainer.nodeType === 1 ? r.startContainer as Element : r.startContainer.parentElement)?.closest("[data-bid]"), secEl = el?.closest("section.ew-sec"); if (!el || !secEl) return
      const text = s.toString().replace(/\s+/g, " ").trim(); if (text.length < 2 || parseCommand(text) || looksFreeInstruction(text)) return
      setPinned({ secId: secEl.id.replace(/^sec-/, ""), blockId: el.getAttribute("data-bid")!, text, range: r.cloneRange() })
    }
    document.addEventListener("selectionchange", f); return () => document.removeEventListener("selectionchange", f)
  }, [])
  useEffect(() => {
    const css = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights, H = (window as unknown as { Highlight?: new (r: Range) => unknown }).Highlight
    if (!css || !H) return; if (pinned && !pinned.range.collapsed) css.set("jev-pin", new H(pinned.range)); else css.delete("jev-pin"); return () => { css.delete("jev-pin") }
  }, [pinned])
  // indicateur d'attente : toute opération de Claude (texte, graphique, extraction…) affiche un état vivant
  const [working, setWorking] = useState<null | { label: string; t0: number; n: number }>(null)
  const workRef = useRef(0)
  // les graphiques ont déjà leur emplacement animé : pas de pastille en plus
  const quiet = <T,>(fn: () => Promise<T>): Promise<T> => fn()
  const track = async <T,>(label: string, fn: () => Promise<T>): Promise<T> => { workRef.current++; setWorking(w => w ? { ...w, n: workRef.current } : { label, t0: Date.now(), n: workRef.current }); try { return await fn() } finally { workRef.current--; if (workRef.current <= 0) { workRef.current = 0; setWorking(null) } else setWorking(w => w && { ...w, n: workRef.current }) } }
  // réponse directe (pas de fenêtre de confirmation) : l'écriture de Claude est appliquée tout de suite ; « Annuler » reste proposé quelques secondes, et le survol du texte violet rappelle votre demande
  const direct = (p: Proposal | null) => {
    if (!p) return; const snap = secsRef.current.map(x => ({ id: x.id, blocks: x.blocks })); const r = p.apply()
    Promise.resolve(r).then(() => say(p.list ? `Fait : ${p.list.join(" ; ")}` : "Écrit par Claude : survolez le texte violet pour revoir votre demande.", () => { setSecs(a => a.map(x => { const o = snap.find(y => y.id === x.id); return o ? { ...x, blocks: o.blocks } : x })); snap.forEach(o => touch(o.id)) }))
  }
  const setProposal = direct
  const [rev, setRev] = useState<null | { issues: Issue[]; scope: string; ai: string; busy: boolean }>(null)
  const [leads, setLeads] = useState<null | { topic: string; text: string; busy: boolean }>(null)
  const [titles, setTitles] = useState<null | { secId: string; options: string[] }>(null)
  const [toast, setToast] = useState<null | { msg: string; undo?: () => void }>(null)
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const say = (msg: string, undo?: () => void) => { setToast({ msg, undo }); if (toastT.current) clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), 9000) }
  const [plan, setPlan] = useState<null | { open: boolean; busy: boolean; sections: PlanSec[]; thesis: string; msg: string; init: string }>(null)
  const [evFull, setEvFull] = useState<Raw[]>([]); const [dark, setDark] = useState(false)
  // thème : même réglage que les dossiers (localStorage « vra-theme » : clair / sombre), sinon celui du site ou du système
  useEffect(() => { const f = () => { let m: string | null = null; try { m = localStorage.getItem("vra-theme") } catch { /* stockage indisponible */ } setDark(m ? m === "dark" : document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches) }; f(); const mo = new MutationObserver(f); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); window.addEventListener("storage", f); return () => { mo.disconnect(); window.removeEventListener("storage", f) } }, [])
  const toggleTheme = () => { const n = !dark; try { localStorage.setItem("vra-theme", n ? "dark" : "light") } catch { /* ignore */ } setDark(n) }
  useEffect(() => { if (pinned && pinned.range.collapsed) setPinned(null) }, [secs]) // eslint-disable-line react-hooks/exhaustive-deps
  const secsRef = useRef<Sec[]>([]); secsRef.current = secs; const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({}); const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const base = `/api/studio/articles/${slug}`

  const load = useCallback(async () => {
    try {
      const [m, e, f] = await Promise.all([studioApi<any>(`${base}/meta`), studioApi<any>(`${base}/edits`), studioApi<any>(`${base}/figure`)])
      setMeta(m); setFigs(e.figures || {});
      try { const t = await (await fetch(`/articles/${slug}/data/report-data.js`)).text(), d = JSON.parse(t.slice(t.indexOf("=") + 1).trim().replace(/;\s*$/, "")); setFigs(f => ({ ...(d.figures || {}), ...f })); setEvFull(d.evidence || []) } catch { /* dossier sans données */ } setIntents(f.intents || []); setAiOn(!!f.ai)
      const pg = e.pages?.[""] || {}, added: Raw[] = (pg.added || []).filter((a: Raw) => Array.isArray(a.blocks)), order: string[] = pg.order || []
      const sorted = [...added].sort((a, b) => { const x = order.indexOf(a.id), y = order.indexOf(b.id); return (x < 0 ? 1e6 : x) - (y < 0 ? 1e6 : y) })
      setSecs(sorted.map(a => ({ id: a.id, title: a.title, ...(a.toc ? { toc: a.toc } : {}), ...(a.marker ? { marker: a.marker } : {}), blocks: fromRaw(a.blocks, slug), state: "" }))); setEvidence([...(f.evidence || [])]); setReady(true)
    } catch (er) { setErr(er instanceof Error ? er.message : String(er)) }
  }, [base, slug])
  useEffect(() => { load() }, [load])

  const saveSec = useCallback(async (id: string) => {
    const s = secsRef.current.find(x => x.id === id); if (!s) return
    setSecs(a => a.map(x => x.id === id ? { ...x, state: "saving" } : x))
    try { await api(`${base}/edits`, { op: "writesec", page: "", id, title: s.title, ...(s.toc !== undefined ? { toc: s.toc } : {}), blocks: toRaw(s.blocks) }); setSecs(a => a.map(x => x.id === id ? { ...x, state: "saved" } : x)) }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }, [base])
  const touch = useCallback((id: string) => { setSecs(a => a.map(x => x.id === id ? { ...x, state: "dirty" } : x)); clearTimeout(timers.current[id]); timers.current[id] = setTimeout(() => saveSec(id), 900) }, [saveSec])
  useEffect(() => { const f = () => { for (const [id, t] of Object.entries(timers.current)) { clearTimeout(t); saveSec(id) } }; window.addEventListener("beforeunload", f); return () => window.removeEventListener("beforeunload", f) }, [saveSec])
  const change = (id: string, fn: (b: B[]) => B[]) => { setSecs(a => a.map(x => x.id === id ? { ...x, blocks: fn(x.blocks) } : x)); touch(id) }
  const setTitle = (id: string, title: string) => { setSecs(a => a.map(x => x.id === id ? { ...x, title } : x)); touch(id) }

  const saveMeta = (m: { title: string; subtitle: string; summary: string }) => { setMetaState("Modifications…"); if (metaTimer.current) clearTimeout(metaTimer.current); metaTimer.current = setTimeout(async () => { try { await api(`${base}/meta`, m); setMetaState("Enregistré") } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } }, 900) }
  const order = async (ids: string[]) => { try { await api(`${base}/edits`, { op: "layout", page: "", order: ids, hidden: [] }) } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } }
  const addSection = async (afterId: string | null) => {
    try {
      const ids = secsRef.current.map(s => s.id), r = await api<{ id: string }>(`${base}/edits`, { op: "writesec", page: "", title: "Nouvelle section", blocks: [{ type: "p", text: "" }], order: ids, afterId: afterId || ids[ids.length - 1] || "" })
      setSecs(a => { const i = afterId ? a.findIndex(x => x.id === afterId) : a.length - 1, out = a.slice(); out.splice(i + 1, 0, { id: r.id, title: "Nouvelle section", blocks: [mk("p")], state: "saved" }); return out })
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  const delSection = async (id: string) => { if (!window.confirm("Supprimer cette section et son contenu ?")) return; try { await api(`${base}/edits`, { op: "layout", page: "", order: secsRef.current.filter(s => s.id !== id).map(s => s.id), hidden: [], removeAdded: [id] }); setSecs(a => a.filter(x => x.id !== id)) } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } }
  const move = (id: string, d: number) => { const a = secsRef.current.slice(), i = a.findIndex(x => x.id === id), j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setSecs(a); order(a.map(s => s.id)) }

  // ---- Jev : consignes structurelles et consignes Claude ----
  const TEXTY = new Set(["p", "lede", "h2", "h3", "bullet", "number", "quote", "callout"])
  const articleText = () => secsRef.current.map(x => `## ${x.title}\n` + x.blocks.filter(b => b.text.trim() && TEXTY.has(b.k)).map(b => b.text).join("\n")).join("\n\n")
  const askAi = (instruction: string, original: string, multiline = true, label = "Claude écrit…") => track(label, () => api<{ text: string }>("/api/studio/ai", { instruction, original, context: `dossier « ${meta?.title} »${pinnedRef.current ? ` — SÉLECTION ÉPINGLÉE (le passage dont parle l'auteur, même s'il ne le désigne pas) : « ${pinnedRef.current.text.slice(0, 600)} »` : ""}`, multiline }).then(r => r.text))
  const setBlocks = (secId: string, fn: (b: B[]) => B[]) => change(secId, bs => { const out = fn(bs); return out.length ? out : [mk("p")] })
  const prevText = (bs: B[], blockId: string) => { const i = bs.findIndex(b => b.id === blockId); for (let j = i - 1; j >= 0; j--) if (TEXTY.has(bs[j].k) && bs[j].text.trim()) return bs[j]; return null }
  const addSectionWith = async (afterId: string, title: string, blocks: B[]) => {
    const ids = secsRef.current.map(x => x.id), r = await api<{ id: string }>(`${base}/edits`, { op: "writesec", page: "", title, blocks: toRaw(blocks), order: ids, afterId })
    setSecs(a => { const i = a.findIndex(x => x.id === afterId), out = a.slice(); out.splice(i + 1, 0, { id: r.id, title, blocks: blocks.length ? blocks : [mk("p")], state: "saved" }); return out })
    secsRef.current = (() => { const i = secsRef.current.findIndex(x => x.id === afterId), out = secsRef.current.slice(); out.splice(i + 1, 0, { id: r.id, title, blocks, state: "saved" }); return out })()
    return r.id
  }
  const splitAt = async (secId: string, blockId: string, cut: "before" | "after") => {
    const sc = secsRef.current.find(x => x.id === secId); if (!sc) return
    const i = sc.blocks.findIndex(b => b.id === blockId); if (i < 0) return
    const keep = sc.blocks.slice(0, cut === "after" ? i + 1 : i), rest = sc.blocks.slice(cut === "after" ? i + 1 : i + 1).filter(b => b.text.trim() || !TEXTY.has(b.k))
    if (!rest.length) { setErr("Rien à mettre dans la nouvelle section : écrivez d'abord la suite sous la consigne."); return }
    try { setBlocks(secId, () => keep); await addSectionWith(secId, "Nouvelle section", rest) } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  const AI_OPS: Record<string, string> = { shorten: "Raccourcis ce passage d'environ un tiers en gardant tous les faits et la voix de l'auteur.", simplify: "Simplifie ce passage : phrases plus courtes, mots courants, même sens, aucun fait ajouté.", direct: "Rends ce passage plus direct et percutant, sans changer le fond ni ajouter de faits.", fix: "Corrige uniquement l'orthographe, la grammaire et la ponctuation, sans changer le style ni le sens.", rewrite: "Reformule ce passage avec d'autres mots, même sens, même longueur, aucun fait ajouté." }
  const runJev = async (secId: string, blockId: string, cmd: Cmd, keep = false, src = "") => {
    const sc = secsRef.current.find(x => x.id === secId); if (!sc) return
    const bs = sc.blocks, prev = prevText(bs, blockId), drop = (list: B[]) => keep ? list : list.filter(b => b.id !== blockId)
    try {
      switch (cmd.kind) {
        case "convert": if (!prev) return setErr("Aucun paragraphe au-dessus."); {
          const conv = (b: B): B[] => cmd.to === "bullet" || cmd.to === "number" ? (b.text.split(/(?<=[.;!?])\s+|\n+/).map(t => t.trim()).filter(Boolean).map(t => mk(cmd.to as "bullet", t.replace(/[;]$/, "")))) : [{ ...b, k: cmd.to as B["k"], ver: b.ver + 1, x: cmd.to === "callout" ? { variant: "keep", title: "" } : undefined }]
          setBlocks(secId, l => drop(l).flatMap(b => b.id === prev.id ? conv(b) : [b])) } return
        case "unlist": { const i = bs.findIndex(b => b.id === blockId); let j = i; while (j > 0 && (bs[j - 1].k === "bullet" || bs[j - 1].k === "number")) j--; const items = bs.slice(j, i); if (!items.length) return setErr("Aucune liste au-dessus.")
          const text = items.map(b => b.text.trim()).map(t => /[.!?]$/.test(t) ? t : t + ".").join(" "); setBlocks(secId, l => drop(l).filter(b => !items.some(x => x.id === b.id) || b.id === items[0].id).map(b => b.id === items[0].id ? { ...b, k: "p", text, ver: b.ver + 1 } : b)); return }
        case "wrapAll": if (!prev) return setErr("Aucun paragraphe au-dessus."); { const m = cmd.style === "bold" ? "**" : "*"; setBlocks(secId, l => drop(l).map(b => b.id === prev.id ? { ...b, text: b.text.startsWith(m) ? b.text : `${m}${b.text}${m}`, ver: b.ver + 1 } : b)); return }
        case "move": if (!prev) return setErr("Aucun paragraphe au-dessus."); setBlocks(secId, l => { const o = drop(l), i = o.findIndex(b => b.id === prev.id), j = cmd.dir === "up" ? i - 1 : i + 1; if (j < 0 || j >= o.length) return o; const out = o.slice(); [out[i], out[j]] = [out[j], out[i]]; return out }); return
        case "merge": if (!prev) return setErr("Aucun paragraphe au-dessus."); setBlocks(secId, l => { const o = drop(l), i = o.findIndex(b => b.id === prev.id); if (i < 1 || !TEXTY.has(o[i - 1].k)) return o; return o.filter((_, k) => k !== i).map((b, k) => k === i - 1 ? { ...b, text: `${b.text} ${prev.text}`, ver: b.ver + 1 } : b) }); return
        case "splitSection": await splitAt(secId, blockId, "before"); return
        case "delSection": { const t = cmd.title.toLowerCase(), m = secsRef.current.filter(x => x.title.toLowerCase().includes(t)); if (m.length !== 1) return setErr(m.length ? "Plusieurs sections correspondent : précisez le titre." : "Section introuvable."); await delSection(m[0].id); return }
        case "delLast": { const o = bs.filter(b => b.id !== blockId), last = [...o].reverse().find(b => b.text.trim() || !TEXTY.has(b.k)); if (!last) return; setBlocks(secId, l => drop(l).filter(b => b.id !== last.id)); return }
        case "aiEdit": { if (cmd.sel || pinnedRef.current) { const pn = pinnedRef.current; if (!pn) return setErr("Sélectionnez d'abord un passage : il reste épinglé jusqu'à ce que vous disiez à Jev quoi en faire."); const ins2 = cmd.op === "translate" ? `Traduis ce passage en ${cmd.lang}, fidèlement.` : AI_OPS[cmd.op]; const t2 = (await askAi(ins2 + " Réponds UNIQUEMENT par le passage réécrit, sans guillemets.", pn.text, false)).trim()
            setProposal({ label: describe(cmd).replace(/ \(Claude\)$/, ""), before: pn.text, after: [t2], apply: () => { setBlocks(pn.secId, l => drop(l).map(b => { if (b.id !== pn.blockId) return b; const loc = findInMd(b.text, pn.text); if (!loc) return b; const text = b.text.slice(0, loc[0]) + t2 + b.text.slice(loc[1]); return { ...b, text, ver: b.ver + 1, ai: { prompt: describe(cmd).replace(/ \(Claude\)$/, "") + ` : « ${pn.text.slice(0, 60)} »`, before: b.text, after: text, at: new Date().toISOString() } } })); setPinned(null) } }); return }
          if (!prev) return setErr("Aucun paragraphe au-dessus."); const ins = cmd.op === "translate" ? `Traduis ce passage en ${cmd.lang}, fidèlement, en gardant la mise en forme (gras, liens, {{K1}}).` : AI_OPS[cmd.op]
          const before = prev.text, t = (await askAi(ins + " Garde la mise en forme en ligne (**gras**, *italique*, liens) et les pastilles {{K12}}.", before, true)).trim()
          setProposal({ label: describe(cmd).replace(/ \(Claude\)$/, ""), before, after: [t], apply: () => { setBlocks(secId, l => drop(l).map(b => b.id === prev.id ? { ...b, text: t, ver: b.ver + 1, ai: { prompt: describe(cmd).replace(/ \(Claude\)$/, ""), before, after: t, at: new Date().toISOString() } } : b)) } }); return }
        case "chart": { const pn = pinnedRef.current, topic = cmd.topic?.trim()
          // texte source : la sélection épinglée, ou — si un sujet est donné — les passages de l'article qui en parlent, sinon le paragraphe du dessus
          let src0 = topic ? "" : (pn?.text || prev?.text || "")
          if (topic) { const kw = NORM(topic).split(/\s+/).filter(w => w.length >= 4 || /^\d+$/.test(w)), all = secsRef.current.flatMap(x => x.blocks.filter(b => TEXTY.has(b.k) && b.text.trim() && b.id !== blockId))
            const hits = all.filter(b => { const n = NORM(b.text); return kw.length ? kw.some(w => n.includes(w)) : n.includes(NORM(topic)) }); src0 = hits.map(b => b.text).join("\n\n").slice(0, 3800) }
          if (!src0.trim()) return setErr(topic ? `Aucun passage de l'article ne parle de « ${topic} ».` : "Rien à mettre en graphique : sélectionnez un passage chiffré (il restera épinglé) ou écrivez sous un paragraphe qui contient des chiffres.")
          if (aiOn && !cmd.gallery) { const at0 = (!topic && pn?.blockId) || prev?.id || blockId, tsec0 = !topic && pn?.secId || secId; setBlocks(secId, l => drop(l)); setPinned(null); void drawFigure(tsec0, at0, { request: src || (topic ? `un graphique sur ${topic}` : "un graphique de ce passage"), source: src0, topic }); return }
          let title = topic ? `Chiffres de l'article : ${topic}` : firstSentence(src0), text = "", unit = ""; const hit = detectData(src0) || detectEvents(src0)
          if (hit) { text = hit.text; unit = hit.unit } else {
            if (!aiOn) return setErr("Pas assez de données lisibles sans IA : ajoutez la clé IA pour extraire les chiffres de ce passage.")
            const r = await track("Claude lit les chiffres…", () => api<{ title: string; unit: string; rows: { label: string; value: number }[] }>("/api/studio/ai/extract", { text: src0, topic })); if (r.rows.length < 2) return setErr(topic ? `Je ne trouve pas au moins deux chiffres comparables sur « ${topic} » dans l'article : rien n'est inventé, donc pas de graphique.` : "Je ne trouve pas au moins deux chiffres comparables dans ce passage : rien n'est inventé, donc pas de graphique.")
            text = r.rows.map(x => `${x.label.replace(/;/g, ",")} ; ${x.value}`).join("\n"); unit = r.unit; if (r.title) title = r.title }
          const at = (!topic && pn?.blockId) || prev?.id || blockId, tsec = !topic && pn?.secId || secId; setBlocks(secId, l => drop(l)); setPinned(null); void makeFigure(tsec, at, { title, text, unit }, { rank: !!cmd.gallery }); return }
        case "togallery": { const all = secsRef.current.flatMap(x => x.blocks.map(b => ({ sec: x.id, b }))), gens = all.filter(x => x.b.k === "genfig"), near = [...bs.slice(0, Math.max(bs.findIndex(b => b.id === blockId), 0)).reverse().filter(b => b.k === "genfig").map(b => ({ sec: secId, b })), ...gens][0]
          const forced = src.startsWith("id:") ? all.find(x => x.b.id === src.slice(3)) : null, tgt = forced || near
          if (!tgt) return setErr("Aucun graphique dessiné par Claude à remplacer."); const tx = tgt.b.x?.data?.text; if (!tx) return setErr("Ce graphique n'a pas de données chiffrées exploitables : la galerie a besoin de valeurs (« libellé ; valeur »).")
          setBlocks(secId, l => drop(l)); void makeFigure(tgt.sec, tgt.b.id, { title: tgt.b.x?.title || "Graphique", text: tx, unit: tgt.b.x?.data?.unit || "" }, { replaceId: tgt.b.id, rank: true }); return }
        case "figedit": { const near = [...bs.slice(0, Math.max(bs.findIndex(b => b.id === blockId), 0)).reverse().filter(b => b.k === "genfig").map(b => ({ sec: secId, b })), ...secsRef.current.flatMap(x => x.blocks.filter(b => b.k === "genfig").map(b => ({ sec: x.id, b })))][0]
          if (!near) return setErr("Aucun graphique dessiné par Claude à modifier."); setBlocks(secId, l => drop(l)); void editFigure(near.sec, near.b.id, cmd.instruction); return }
        case "explain": { const pn = pinnedRef.current; if (!pn) return setErr("Sélectionnez d'abord un passage : il reste épinglé jusqu'à ce que vous disiez à Jev quoi en faire."); const t = (await askAi("Explique simplement ce passage en 2 à 4 phrases, pour un lecteur non spécialiste, uniquement à partir de son contenu et du contexte ; n'ajoute aucun fait, chiffre ou source.", pn.text, true)).trim(), ai = { prompt: `« Explique ça » (sélection : « ${pn.text.slice(0, 80)} »)`, after: t, at: new Date().toISOString() }
          setProposal({ label: `Expliquer « ${pn.text.slice(0, 60)} »`, before: "", after: [t], apply: () => { setBlocks(pn.secId, l => { const o = drop(l), i = o.findIndex(b => b.id === pn.blockId), out = o.slice(); out.splice(i + 1, 0, mk("p", t, { ai })); return out }); setPinned(null) } }); return }
        case "cite": { const pn = pinnedRef.current; if (!pn) return setErr("Sélectionnez d'abord un passage : il reste épinglé jusqu'à ce que vous disiez à Jev quoi en faire."); setBlocks(secId, l => drop(l)); setSrcDlg({ blockId: null, range: pn.range.cloneRange(), hint: pn.text }); setPinned(null); return }
        case "continue": { if (!prev) return setErr("Aucun paragraphe au-dessus."); const before = prev.text, ins = "Continue ce paragraphe par une à trois phrases, dans le même ton, uniquement ce qui suit logiquement ; ne conclus pas l'article ; n'invente aucun chiffre, aucune date ni source. Réponds UNIQUEMENT par les phrases à ajouter.", add = (await askAi(ins, before, true)).trim(), full = `${before} ${add}`
          setProposal({ label: "Continuer le paragraphe", before, after: [full], apply: () => { setBlocks(secId, l => drop(l).map(b => b.id === prev.id ? { ...b, text: full, ver: b.ver + 1, ai: { prompt: "Continuer le paragraphe", before, after: full, at: new Date().toISOString() } } : b)) } }); return }
        case "insert": { const at = prev ? prev.id : blockId, t = (cmd as Extract<Cmd, { kind: "insert" }>).text.trim(); if (!t) return; const ai = { prompt: src, after: t, at: new Date().toISOString() }
          const nbs: B[] = cmd.type === "ul" ? t.split(/\n+|;\s*/).map(x => x.trim()).filter(Boolean).map(x => mk("bullet", x, { ai })) : [mk(cmd.type === "quote" ? "quote" : cmd.type === "callout" ? "callout" : "p", t, { ai, ...(cmd.type === "callout" ? { x: { variant: "keep", title: "" } } : {}) })]
          setBlocks(secId, l => { const o = drop(l), i = o.findIndex(b => b.id === at); const out = o.slice(); out.splice(i + 1, 0, ...nbs); return out }); return }
        case "titles": { const body = sc.blocks.filter(b => b.text.trim() && TEXTY.has(b.k)).map(b => b.text).join("\n"); if (!body) return setErr("La section est vide : écrivez d'abord son contenu.")
          const t = await askAi("Propose exactement 3 titres pour cette section d'un dossier : chacun est une affirmation claire (pas un thème), 12 mots maximum, sans numérotation, un par ligne, rien d'autre.", body)
          const opts = t.split(/\n+/).map(x => x.replace(/^[-*\d.)\s«"]+|[»"]+$/g, "").trim()).filter(Boolean).slice(0, 3); if (!opts.length) return setErr("Claude n'a rien proposé : réessayez."); setBlocks(secId, l => drop(l)); setTitles({ secId, options: opts }); return }
        case "summary": { const t = await askAi("Résume cet article en 3 phrases claires, fidèles au contenu : n'ajoute aucun fait, aucun chiffre, aucune opinion absents du texte.", articleText()); setBlocks(secId, l => drop(l)); setMeta(m => { if (!m) return m; const n = { ...m, summary: t.trim() }; saveMeta(n); return n }); say("Résumé placé dans le champ « Résumé » de la couverture."); return }
        case "conclusion": { const t = await askAi("Écris une conclusion « Ce qu'il faut retenir » : 3 à 5 puces, chacune une seule phrase, uniquement à partir du contenu fourni (aucun fait ni chiffre nouveau). Une puce par ligne, sans tiret.", articleText()); const items = t.split(/\n+/).map(x => x.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean).slice(0, 6)
          setBlocks(secId, l => drop(l)); const last = secsRef.current[secsRef.current.length - 1]; await addSectionWith(last.id, "Ce qu'il faut retenir", items.map(x => mk("bullet", x, { ai: { prompt: "« Ajoute une conclusion » : synthèse de l'article", after: x, at: new Date().toISOString() } }))); say("Section « Ce qu'il faut retenir » ajoutée (à relire)."); return }
        case "review": { setBlocks(secId, l => drop(l)); setRev({ issues: reviewDoc(secsRef.current, cmd.scope === "section" ? secId : undefined, figs), scope: cmd.scope === "section" ? sc.title : "tout l'article", ai: "", busy: false }); return }
        case "sources": { setBlocks(secId, l => drop(l)); setLeads({ topic: cmd.topic, text: "", busy: true })
          const t = await askAi(`Tu n'as PAS accès au web. Pour le sujet « ${cmd.topic} », propose des PISTES de recherche de sources, pas des sources : (1) types de documents à chercher et organismes susceptibles de les publier ; (2) 3 à 5 requêtes de recherche précises ; (3) ce qu'il faudra vérifier dans la source (date, méthode, périmètre). N'invente JAMAIS de titre exact, d'adresse, de chiffre ni de citation. Termine par « Rien de ceci n'est une source : à lire et vérifier avant de citer. »`, `Sujet : ${cmd.topic}\nContexte : ${meta?.title}`)
          setLeads({ topic: cmd.topic, text: t, busy: false }); return }
        case "figtype": { const ids = [...bs.filter(b => b.k === "figure").reverse(), ...secsRef.current.flatMap(x => x.blocks).filter(b => b.k === "figure")], fb = ids[0]; if (!fb) return setErr("Aucune figure à transformer."); const fid = fb.x?.fig, fig = figs[fid]; if (!fig) return setErr("Figure introuvable.")
          const r = await api<{ figure: Raw; missing: number[] }>(`${base}/figure`, { action: "convert", figure: fig, type: cmd.type }); await api(`${base}/edits`, { op: "figure", fig: fid, figure: r.figure }); setFigs(f => ({ ...f, [fid]: r.figure })); setBlocks(secId, l => drop(l)); say(r.missing?.length ? `Figure convertie, mais ${r.missing.length} valeur(s) à vérifier.` : "Figure convertie : mêmes données."); return }
      }
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  const nextSentence = async (secId: string, blockId: string) => {
    const sc = secsRef.current.find(x => x.id === secId), b = sc?.blocks.find(x => x.id === blockId); if (!sc || !b) return
    try { const add = (await askAi("Écris UNIQUEMENT la phrase suivante de ce paragraphe (une seule phrase, même ton, qui prolonge l'idée) ; n'invente aucun chiffre, date ni source.", b.text, false)).trim(), full = `${b.text} ${add}`
      setProposal({ label: "Phrase suivante (Tab)", before: b.text, after: [full], apply: () => setBlocks(secId, l => l.map(x => x.id === blockId ? { ...x, text: full, ver: x.ver + 1, ai: { prompt: "Phrase suivante (Tab)", before: b.text, after: full, at: new Date().toISOString() } } : x)) }) }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  // graphique créé directement (pas de fenêtre avant) : la figure de départ est insérée tout de suite ; « Refaire / changer de graphique » permet ensuite de modifier valeurs ou forme
  const makeFigure = async (secId: string, afterBlockId: string, prefill: { title: string; text: string; unit: string }, opts?: { replaceId?: string; rank?: boolean }) => {
    const ph = mk("loading", "", { x: { label: opts?.rank ? "Choix de la forme dans la galerie" : "Création du graphique" } })
    setBlocks(secId, bs => bs.flatMap(b => b.id === afterBlockId ? [b, ph] : [b]))
    try {
      const r = await quiet(() => api<{ figure: Raw; alts: { type: string }[] }>(`${base}/figure`, { action: "draft", title: prefill.title || "Graphique", text: prefill.text, unit: prefill.unit, state: "claim" }))
      let fig = r.figure, note = ""
      if (opts?.rank && aiOn && r.alts?.[0]) { try { fig = (await quiet(() => api<{ figure: Raw }>(`${base}/figure`, { action: "convert", figure: r.figure, type: r.alts[0].type }))).figure; note = ` (forme « ${r.alts[0].type} » choisie par le modèle de décision)` } catch { /* on garde la forme de départ */ } }
      const id = `fig-${(prefill.title || "figure").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "figure"}-${Math.random().toString(36).slice(2, 6)}`
      await api(`${base}/edits`, { op: "figure", fig: id, figure: fig }); setFigs(f => ({ ...f, [id]: fig }))
      setBlocks(secId, bs => { const out = bs.map(b => b.id === ph.id ? mk("figure", "", { x: { fig: id, title: prefill.title, reading: "" } }) : b); return opts?.replaceId ? out.filter(b => b.id !== opts.replaceId) : out })
      say(`Graphique de la galerie créé${note}. « Modifier les valeurs ou la forme » (au-dessus de la figure) permet de l'ajuster.`)
    } catch (e) { setBlocks(secId, bs => bs.filter(b => b.id !== ph.id)); setErr(e instanceof Error ? e.message : String(e)); if (!opts?.replaceId) setFigDlg({ secId, blockId: afterBlockId, mode: "after", prefill }) } // si les données ne se lisent pas : la fenêtre s'ouvre pour les corriger
  }
  // graphique dessiné par Claude (SVG) : prioritaire ; la galerie sert de repli ou sur demande
  const drawFigure = async (secId: string, afterBlockId: string, o: { request: string; source: string; topic?: string }) => {
    const ph = mk("loading", "", { x: { label: "Claude dessine le graphique" } })
    setBlocks(secId, bs => bs.flatMap(b => b.id === afterBlockId ? [b, ph] : [b]))
    try {
      const r = await quiet(() => api<{ title: string; reading: string; unit: string; rows: { label: string; value: number }[]; svg: string; unverified: string[] }>("/api/studio/ai/figure", o))
      const block = mk("genfig", "", { x: { svg: r.svg, title: r.title, reading: r.reading, request: o.request, source: o.source.slice(0, 6000), data: { text: r.rows.map(x => `${x.label.replace(/;/g, ",")} ; ${x.value}`).join("\n"), unit: r.unit } } })
      setBlocks(secId, bs => bs.map(b => b.id === ph.id ? block : b))
      say(r.unverified.length ? `Graphique dessiné par Claude. À vérifier : ${r.unverified.slice(0, 5).join(", ")} ne figure(nt) pas dans le texte (graduation ?). « Utiliser un graphique de la galerie » le remplace.` : "Graphique dessiné par Claude. S'il ne vous convient pas : « Modifier… » ou « Utiliser un graphique de la galerie ».", () => setBlocks(secId, bs => bs.filter(b => b.id !== block.id)))
    } catch (e) { setBlocks(secId, bs => bs.filter(b => b.id !== ph.id)); setErr(e instanceof Error ? e.message : String(e)) }
  }
  const editFigure = async (secId: string, blockId: string, instruction: string) => {
    const sc = secsRef.current.find(x => x.id === secId), b = sc?.blocks.find(x => x.id === blockId); if (!b?.x?.svg) return
    const setBusy = (v: boolean) => setBlocks(secId, bs => bs.map(x => x.id === blockId ? { ...x, x: { ...x.x, busy: v } } : x))
    setBusy(true)
    try {
      const r = await quiet(() => api<{ title: string; reading: string; unit: string; rows: { label: string; value: number }[]; svg: string }>("/api/studio/ai/figure", { request: b.x!.request || b.x!.title, source: b.x!.source || [b.x!.title, b.x!.reading].join("\n"), previous: b.x!.svg, instruction }))
      const before = { ...b.x, busy: false }, after = { ...b.x, busy: false, svg: r.svg, title: r.title || b.x!.title, reading: r.reading || b.x!.reading, data: r.rows.length ? { text: r.rows.map(x => `${x.label.replace(/;/g, ",")} ; ${x.value}`).join("\n"), unit: r.unit } : b.x!.data }
      setBlocks(secId, bs => bs.map(x => x.id === blockId ? { ...x, x: after } : x)); say("Graphique modifié.", () => setBlocks(secId, bs => bs.map(x => x.id === blockId ? { ...x, x: before } : x)))
    } catch (e) { setBusy(false); setErr(e instanceof Error ? e.message : String(e)) }
  }
  const figureToText = (f: Raw | undefined): string => {
    if (!f) return ""
    if (Array.isArray(f.items) && f.items[0]?.date) return f.items.map((i: Raw) => `${String(i.label).replace(/;/g, ",")} ; ${i.date}`).join("\n")
    if (Array.isArray(f.series) && Array.isArray(f.x)) return f.x.map((x: string, i: number) => [x, ...f.series.map((sr: Raw) => sr.values?.[i])].join(" ; ")).join("\n")
    const arr: Raw[] = f.data || f.items || []
    return arr.filter(d => typeof d?.label === "string").map(d => typeof d.a === "number" ? `${d.label} ; ${d.a} ; ${d.b}` : `${d.label} ; ${d.value}`).join("\n")
  }
  const interpretFree = async (secId: string, blockId: string, text: string) => {
    const sc = secsRef.current.find(x => x.id === secId); if (!sc) return
    try {
      const i = sc.blocks.findIndex(b => b.id === blockId), nearby = sc.blocks.slice(0, Math.max(i, 0)).reverse().filter(b => TEXTY.has(b.k) && b.text.trim()).map(b => b.text)
      const r = await track("Jev comprend votre demande…", () => api<{ actions: Record<string, string>[]; reason: string }>("/api/studio/ai/jev", { text, nearby, sections: secsRef.current.map(x => x.title), selection: pinnedRef.current?.text }))
      const cmds = r.actions.map(a => ({ ...a }) as unknown as Cmd)
      if (!cmds.length) { setErr(r.reason || "Jev n'a pas compris cette consigne : reformulez ou utilisez le menu « / »."); return }
      const label = (c: Cmd) => c.kind === "insert" ? `insérer sous le paragraphe du dessus : « ${c.text.slice(0, 80)} »` : describe(c)
      setProposal({ label: text, before: "", after: [], list: cmds.map(label), apply: async () => {
        for (let k = 0; k < cmds.length; k++) { const c = cmds[k], last = k === cmds.length - 1
          if (c.kind === "format" || c.kind === "link" || c.kind === "replace" || c.kind === "delete" || c.kind === "unformat") runCommand(secId, blockId, c, !last); else await runJev(secId, blockId, c, !last, text) }
        if (!cmds.some(c => c.kind === "chart" || c.kind === "togallery" || c.kind === "figedit" || c.kind === "titles" || c.kind === "summary" || c.kind === "conclusion" || c.kind === "review" || c.kind === "sources" || c.kind === "aiEdit" || c.kind === "continue" || c.kind === "figtype" || c.kind === "delSection" || c.kind === "splitSection")) dropBlock(secId, blockId)
      } })
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  const critique = async () => {
    if (!rev) return; setRev({ ...rev, busy: true })
    try { const t = await askAi("Relis ce texte d'un dossier sourcé. Liste de 3 à 8 remarques courtes et actionnables : affirmations fortes à nuancer ou sourcer, dates ou noms propres à vérifier, passages confus, raisonnements qui sautent une étape. Ne réécris rien, n'invente aucun fait, ne dis pas que quelque chose est faux sans pouvoir l'expliquer. Une remarque par ligne.", articleText()); setRev(r => r && { ...r, ai: t, busy: false }) }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); setRev(r => r && { ...r, busy: false }) }
  }
  const goto = (secId: string, blockId?: string) => { setRev(null); setTimeout(() => { const el = blockId ? document.querySelector<HTMLElement>(`[data-bid="${blockId}"]`) : document.getElementById(`sec-${secId}`); el?.scrollIntoView({ block: "center", behavior: "smooth" }); if (blockId) el?.focus() }, 50) }
  const pasteTable = (secId: string, blockId: string, text: string) => {
    const rows = text.replace(/\r/g, "").split("\n").filter(l => l.trim()).map(l => l.split("\t").map(c => c.trim())), w = Math.max(...rows.map(r => r.length)); if (rows.length < 2 || w < 2) return
    const numeric = (c: string) => /^-?\d[\d\s.,]*\s*(%|€|M€|Md€)?$/.test(c)
    const hasHead = !rows[0].slice(1).some(numeric), head = hasHead ? rows[0] : Array.from({ length: w }, (_, i) => `Colonne ${i + 1}`), body = (hasHead ? rows.slice(1) : rows).map(r => Array.from({ length: w }, (_, i) => r[i] || ""))
    setBlocks(secId, bs => { const i = bs.findIndex(b => b.id === blockId), cur = bs[i], tb = mk("table", "", { x: { head: head.slice(0, 8), rows: body.slice(0, 60).map(r => r.slice(0, 8)), caption: "" } }); const out = bs.slice(); if (cur && cur.k === "p" && !cur.text.trim()) out[i] = tb; else out.splice(i + 1, 0, tb); return out })
    say("Tableau collé inséré : le bouton « 📊 Graphique depuis ce tableau » est en bas du tableau.")
  }
  // consignes tapées (« mets le mot X en gras », « remplace A par B », « c'est quoi X ? ») : appliquées au texte le plus proche, bloc de consigne retiré
  const dropBlock = (secId: string, blockId: string) => change(secId, bs => { const out = bs.filter(b => b.id !== blockId); return out.length ? out : [mk("p")] })
  const runCommand = (secId: string, blockId: string, cmd: Cmd, keep = false) => {
    const all = secsRef.current, i0 = all.findIndex(x => x.id === secId), order = [all[i0], ...all.slice(0, i0).reverse(), ...all.slice(i0 + 1)].filter(Boolean)
    for (const sc of order) {
      const pn = pinnedRef.current, r = applyCommand(cmd, sc.blocks, sc.id === secId ? blockId : "", pn ? { blockId: pn.blockId, text: pn.text } : undefined); if (!r) continue
      setSecs(a => a.map(x => x.id === sc.id ? { ...x, blocks: r.blocks } : x)); touch(sc.id); if (!keep) dropBlock(secId, blockId); if ("target" in cmd && cmd.target === SEL || cmd.kind === "replace" && cmd.from === SEL) setPinned(null); return
    }
    setErr(("target" in cmd && cmd.target === SEL) || (cmd.kind === "replace" && cmd.from === SEL) ? "Sélectionnez d'abord un passage : il reste épinglé (surligné en violet) jusqu'à ce que vous disiez à Jev quoi en faire." : `« ${cmd.kind === "replace" ? cmd.from : "target" in cmd ? cmd.target : "ce texte"} » introuvable dans l'article`)
  }
  const addGlossDirect = (secId: string, term: string, def: string) => setBlocks(secId, bs => { const g = bs.find(b => b.k === "gloss"); if (g) return bs.map(b => b === g ? { ...b, x: { terms: [...(b.x?.terms || []).filter((t: { term: string }) => t.term), { term, def }] } } : b); return [...bs, mk("gloss", "", { x: { terms: [{ term, def }] } })] })
  const addGlossTerm = async (secId: string, blockId: string, term: string) => {
    try {
      const r = await api<{ text: string }>("/api/studio/ai", { instruction: `Définis « ${term} » simplement, en une à deux phrases, sans jargon ni chiffres inventés.`, original: "", context: `glossaire du dossier « ${meta?.title} »`, multiline: false })
      change(secId, bs => { const out = bs.filter(b => b.id !== blockId), g = out.find(b => b.k === "gloss"); if (g) return out.map(b => b === g ? { ...b, x: { terms: [...(b.x?.terms || []).filter((t: { term: string }) => t.term), { term, def: r.text }] } } : b); return [...out, mk("gloss", "", { x: { terms: [{ term, def: r.text }] } })] })
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  // Jev ambiant : ce que l'auteur écrit déclenche des propositions (graphique, source, plan) sans menu
  const suggestFor = (secId: string, b: B, all: B[]): Hint[] => {
    const out: Hint[] = []
    const cmd0 = b.k === "p" ? parseCommand(b.text) : null, pinTxt = pinnedRef.current?.text.slice(0, 120)
    const cmd = cmd0 && cmd0.kind === "define" && cmd0.term === SEL && pinTxt ? { ...cmd0, term: pinTxt } : cmd0
    if (cmd) {
      const usesSel = cmd.kind === "explain" || cmd.kind === "cite" || (cmd.kind === "aiEdit" && cmd.sel) || (cmd0 && cmd0.kind === "define" && cmd0.term === SEL) || ("target" in cmd && cmd.target === SEL) || (cmd.kind === "replace" && cmd.from === SEL)
      if (usesSel && !pinnedRef.current) { out.push({ key: "nopin", label: "📌 Jev : sélectionnez d'abord le passage concerné (il restera épinglé en violet), puis écrivez votre consigne", accept: () => {} }); return out }
      const needsAi = cmd.kind === "figedit" || cmd.kind === "explain" || cmd.kind === "aiEdit" || cmd.kind === "continue" || cmd.kind === "titles" || cmd.kind === "summary" || cmd.kind === "conclusion" || cmd.kind === "sources" || cmd.kind === "figtype"
      if (cmd.kind === "define") { if (aiOn) { out.push({ key: "def", label: `📖 Jev : répondre à « ${cmd.term} » (définition courte par Claude) ? ↵`, ai: `Définis « ${cmd.term} » simplement, en 2 à 4 phrases, sans jargon ni chiffres inventés, comme dans un article pédagogique.`, shown: b.text.trim(), enter: true }); out.push({ key: "gloss", label: `📚 ou l'ajouter au glossaire`, accept: () => addGlossTerm(secId, b.id, cmd.term) }) } }
      else if (needsAi && !aiOn) out.push({ key: "noai", label: `Jev : « ${describe(cmd)} » demande la clé IA (ANTHROPIC_API_KEY)` , accept: () => {} })
      else if (cmd.kind === "chart") out.push({ key: "cmd", label: `📊 Jev : ${describe(cmd)} ? ↵`, enter: true, accept: () => runJev(secId, b.id, cmd, false, b.text.trim()) })
      else if (cmd.kind === "format" || cmd.kind === "link" || cmd.kind === "replace" || cmd.kind === "delete" || cmd.kind === "unformat") out.push({ key: "cmd", label: `✂️ Jev : ${describe(cmd)} dans le texte ? ↵`, enter: true, accept: () => runCommand(secId, b.id, cmd) })
      else out.push({ key: "cmd", label: `${needsAi ? "✨" : "✂️"} Jev : ${describe(cmd)} ? ↵`, enter: true, accept: () => runJev(secId, b.id, cmd) })
      return out
    }
    if (b.k === "p" && aiOn) {
      const explicit = looksFreeInstruction(b.text) || (pinnedRef.current && refersToSel(b.text) && !/\?\s*$/.test(b.text.trim()) && b.text.trim().length >= 6 && words(b.text) <= 25)
      if (explicit) { out.push({ key: "free", label: "✨ Jev : interpréter cette consigne avec Claude ? ↵", enter: true, accept: () => interpretFree(secId, b.id, b.text.trim()) }); return out }
      // un passage est épinglé : une courte phrase peut être une consigne qui le concerne, même sans « ça » (« plus court », « en anglais », « avec une source »…) ; ↵ n'est pas capté
      if (pinnedRef.current && b.text.trim().length >= 6 && words(b.text) <= 14 && !/[.?!]\s*$/.test(b.text.trim())) { out.push({ key: "free2", label: "📌 Jev : c'est une consigne pour le passage épinglé ? (Claude interprète)", accept: () => interpretFree(secId, b.id, b.text.trim()) }) }
    }
    if (b.k === "p" && /\?\s*$/.test(b.text.trim()) && words(b.text) >= 3 && b.text.trim().length <= 300) { // toute question tapée : Jev propose d'y répondre
      if (aiOn) out.push({ key: "ask", label: "❓ Jev : répondre à cette question (Claude, 2 à 4 phrases) ? ↵", ai: `Réponds à cette question de façon claire et concise, en 2 à 4 phrases, dans le ton d'un article pédagogique. N'invente aucun chiffre, aucune date, aucune source ; si tu n'es pas certain d'un point, dis-le plutôt que de l'affirmer. Question : ${b.text.trim()}`, shown: b.text.trim(), enter: true })
      else out.push({ key: "noai", label: "❓ Jev pourrait répondre à cette question, mais la clé IA (ANTHROPIC_API_KEY) est absente de ce studio", accept: () => {} })
      return out
    }
    if (b.k === "p" || b.k === "lede") {
      const d = detectData(b.text)
      if (d) out.push({ key: "chart", label: `📊 Jev : ce passage ${d.shape === "time" ? "décrit une évolution" : "compare"} ${d.n} ${d.shape === "time" ? "dates" : "éléments"} chiffré${d.n > 1 ? "s" : ""} — en faire un graphique ?`, accept: () => makeFigure(secId, b.id, { title: firstSentence(b.text), text: d.text, unit: d.unit }) })
      const ev = detectEvents(b.text)
      if (ev) out.push({ key: "events", label: `🕒 Jev : ${ev.n} événements datés — en faire une frise chronologique ?`, accept: () => makeFigure(secId, b.id, { title: firstSentence(b.text), text: ev.text, unit: "" }) })
      const df = b.k === "p" ? detectDefinition(b.text) : null
      if (df) out.push({ key: "def2", label: `📚 Jev : « ${df.term} » est défini ici — l'ajouter au glossaire ?`, accept: () => addGlossDirect(secId, df.term, df.def) })
      const cf = conflictsFor(secsRef.current, b.id)[0]
      if (cf) out.push({ key: "conflit", label: `⚠️ Jev : ${cf.text}`, accept: () => goto(cf.sec, cf.block) })
      if (detectUnsourced(b.text)) out.push({ key: "src", label: "🔎 Jev : chiffre sans source — citer une source ?", accept: () => openSource(b.id) })
      const total = secsRef.current.reduce((n, x) => n + x.blocks.reduce((m, y) => m + words(y.text), 0), 0), first = secsRef.current[0]?.blocks.find(x => x.k === "p" && x.text.trim() && !/Un premier paragraphe|Comment ce dossier/.test(x.text))
      if (aiOn && first?.id === b.id && words(b.text) >= 25 && total < 320 && secsRef.current.length <= 2 && !all.some(x => x.k === "figure")) out.push({ key: "plan", label: "✨ Jev : proposer un plan du dossier (un format conseillé par partie) à partir de ce paragraphe ?", accept: () => setPlan({ open: true, busy: false, sections: [], thesis: "", msg: "", init: b.text }) })
    }
    if (b.k === "p") { // rythme et structure
      const sc = secsRef.current.find(x => x.id === secId), bs = sc?.blocks || [], i = bs.findIndex(x => x.id === b.id), isLast = bs.filter(x => x.text.trim() || !TEXTY.has(x.k)).slice(-1)[0]?.id === b.id
      if (sc && isLast) { const wc = bs.reduce((n, x) => n + (TEXTY.has(x.k) ? words(x.text) : 0), 0); if (wc > 450) { const mid = bs.filter(x => TEXTY.has(x.k) && x.text.trim()); const at = mid[Math.floor(mid.length / 2) - 1]; if (at) out.push({ key: "long", label: `✂️ Jev : section longue (${wc} mots) — la couper en deux au milieu ?`, accept: () => splitAt(secId, at.id, "after") }) } }
      if (i >= 5 && bs.slice(i - 5, i + 1).every(x => x.k === "p" && x.text.trim())) out.push({ key: "rhythm", label: "🫧 Jev : six paragraphes d'affilée — insérer un encadré « À retenir » pour aérer ?", accept: () => setBlocks(secId, l => { const j = l.findIndex(x => x.id === b.id), o = l.slice(); o.splice(j + 1, 0, mk("callout", "", { x: { variant: "keep", title: "À retenir" } })); return o }) })
      const all = secsRef.current, lastSec = all[all.length - 1], total = all.reduce((n, x) => n + x.blocks.reduce((m, y) => m + (TEXTY.has(y.k) ? words(y.text) : 0), 0), 0)
      if (aiOn && lastSec?.id === secId && isLast && all.length >= 4 && total >= 800 && !all.some(x => /retenir|conclusion/i.test(x.title))) out.push({ key: "concl", label: "✨ Jev : ajouter une section « Ce qu'il faut retenir » (générée à partir de l'article) ?", accept: () => runJev(secId, b.id, { kind: "conclusion" }) })
    }
    if (b.k === "bullet") { // dernière puce d'une série « libellé : valeur »
      const i = all.findIndex(x => x.id === b.id); if (all[i + 1]?.k !== "bullet") { let j = i; while (j > 0 && all[j - 1].k === "bullet") j--; const pc = detectProsCons(all.slice(j, i + 1).map(x => x.text)); if (pc) out.push({ key: "pc", label: "⚖️ Jev : ces lignes forment un « pour / contre » — en faire un tableau ?", accept: () => setBlocks(secId, l => { const k = l.findIndex(x => x.id === all[j].id), ids = new Set(all.slice(j, i + 1).map(x => x.id)); const o = l.filter(x => !ids.has(x.id)); o.splice(k, 0, mk("table", "", { x: { head: pc.head, rows: pc.rows, caption: "" } })); return o }) }); const d = detectListData(all.slice(j, i + 1).map(x => x.text)); if (d) out.push({ key: "chart", label: `📊 Jev : ces ${d.n} lignes chiffrées font un graphique — le créer ?`, accept: () => makeFigure(secId, b.id, { title: "Graphique", text: d.text, unit: d.unit }) }) }
    }
    return out
  }
  const runPlan = async (prompt: string) => {
    setPlan(p => p && { ...p, busy: true, msg: "" })
    try { const r = await api<{ thesis: string; sections: PlanSec[] }>("/api/studio/ai/plan", { prompt }); setPlan(p => p && { ...p, busy: false, sections: r.sections, thesis: r.thesis }) }
    catch (e) { setPlan(p => p && { ...p, busy: false, msg: e instanceof Error ? e.message : String(e) }) }
  }
  const insertPlan = async (sections: PlanSec[]) => {
    setPlan(null)
    for (const sc of sections) {
      const note = sc.format === "paragraphe" ? "" : `[À compléter : format conseillé = ${sc.format}${sc.chart ? ` (${sc.chart.label} : ${sc.chart.options.map(o => o.type).join(", ")})` : ""}${sc.needs ? ` — données à fournir : ${sc.needs}` : ""}]`
      try { const ids = secsRef.current.map(x => x.id), r = await api<{ id: string }>(`${base}/edits`, { op: "writesec", page: "", title: sc.heading, blocks: [{ type: "p", text: note }], order: ids, afterId: ids[ids.length - 1] || "" }); setSecs(a => [...a, { id: r.id, title: sc.heading, blocks: [mk("p", note)], state: "saved" }]); secsRef.current = [...secsRef.current, { id: r.id, title: sc.heading, blocks: [], state: "saved" }] }
      catch (e) { setErr(e instanceof Error ? e.message : String(e)); return }
    }
  }
  const uploader = async (f: File) => { const fd = new FormData(); fd.append("file", f); const r = await studioApi<{ file: string }>(`${base}/images`, { method: "POST", body: fd }); return `/articles/${slug}/annotation-images/${r.file}` }
  const openSource = (blockId: string | null) => { const s = getSelection(), hint = blockId ? secsRef.current.flatMap(x => x.blocks).find(b => b.id === blockId)?.text || "" : s?.toString() || (s?.anchorNode?.textContent || ""); setSrcDlg({ blockId, range: !blockId && s && s.rangeCount ? s.getRangeAt(0).cloneRange() : null, hint }) }
  const insertSource = (key: string) => {
    const d = srcDlg; setSrcDlg(null); if (!d) return
    setTimeout(() => {
      if (d.blockId) { const el = document.querySelector<HTMLElement>(`[data-bid="${d.blockId}"]`); if (el) { el.focus(); const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r) } }
      else if (d.range) { const s = getSelection(); s?.removeAllRanges(); s?.addRange(d.range); s?.collapseToEnd() }
      document.execCommand("insertHTML", false, `<a class="src" data-src="${key}" contenteditable="false">${key}</a>​`)
    }, 30)
  }
  const rawBlocks = (b: B, up: (p: Partial<B>) => void, secId: string, no?: number): React.ReactNode => {
    if (b.k === "table") return <TableEd x={b.x!} onChange={x => { up({ x }) }} onChart={pf => makeFigure(secId, b.id, { ...pf, title: pf.title || "Graphique" })} />
    if (b.k === "html") return <div className="rounded-md border border-dashed border-border p-2"><div className="mb-1 flex items-center text-xs text-muted-foreground"><span>Bloc HTML d'origine (conservé tel quel : explication interactive, schéma, registre…)</span></div><div style={{ pointerEvents: "none", opacity: .9 }} dangerouslySetInnerHTML={{ __html: b.x?.html || "" }} /></div>
    if (b.k === "loading") return <figure className="fig" aria-busy="true"><div className="fig-head"><p className="fig-kicker"><span className="ew-spin" /> {b.x?.label || "Chargement"}<Elapsed /></p></div>
      <div className="ew-skel" aria-hidden="true"><i style={{ height: "35%" }} /><i style={{ height: "62%" }} /><i style={{ height: "48%" }} /><i style={{ height: "80%" }} /><i style={{ height: "55%" }} /><i style={{ height: "70%" }} /></div></figure>
    if (b.k === "genfig") return <figure className="fig" style={{ position: "relative", opacity: b.x?.busy ? .55 : 1 }}>
      {b.x?.busy && <p style={{ position: "absolute", right: 8, top: 8, zIndex: 2, fontFamily: "var(--vra-sans)", fontSize: 12 }}><span className="ew-spin" /> Claude redessine…<Elapsed /></p>}
      <div className="fig-head"><p className="fig-kicker">Figure {no || "·"} <span style={{ fontFamily: "var(--vra-sans)", marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>✨ dessinée par Claude</span></p>
        <h3 className="fig-title"><input className="ew-h" value={b.x?.title || ""} onChange={e => up({ x: { ...b.x, title: e.target.value } })} placeholder="Titre de la figure (une affirmation)" /></h3></div>
      <div className="vra-chart" style={{ overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: b.x?.svg || "" }} />
      <figcaption><b>Lecture :</b> <textarea className="ew-h" rows={2} value={b.x?.reading || ""} onChange={e => up({ x: { ...b.x, reading: e.target.value } })} placeholder="comment lire ce graphique et ses limites" style={{ display: "inline", width: "calc(100% - 5rem)", fieldSizing: "content" } as React.CSSProperties} /></figcaption>
      <div className="ew-sectools" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6, fontFamily: "var(--vra-sans)", fontSize: 12, opacity: 1 }}>
        <input placeholder="Demander une modification (« plus simple », « change les couleurs », « ajoute une légende »…) puis Entrée" className="min-w-[16rem] flex-1 rounded-md border border-border bg-transparent px-2 py-1 outline-none" onKeyDown={e => { if (e.key === "Enter" && e.currentTarget.value.trim()) { const v = e.currentTarget.value.trim(); e.currentTarget.value = ""; void editFigure(secId, b.id, v) } }} />
        <button className="rounded-md border border-border px-2 py-1 hover:bg-muted" onClick={() => runJev(secId, b.id, { kind: "togallery" }, true, `id:${b.id}`)}>Utiliser un graphique de la galerie</button></div></figure>
    if (b.k === "gloss") return <GlossEd x={b.x!} onChange={x => up({ x })} />
    if (b.k === "figure") { const f = figs[b.x?.fig]; return <figure className="fig" style={{ position: "relative" }}>
      <div className="fig-head"><p className="fig-kicker">Figure {no || "·"} <button className="ew-sectools" style={{ fontFamily: "var(--vra-sans)", marginLeft: 8, textTransform: "none", letterSpacing: 0 }} onClick={() => setFigDlg({ secId, blockId: b.id, mode: "replace", prefill: { title: b.x?.title || "", text: figureToText(f), unit: f?.unit || "" } })}>Modifier les valeurs ou la forme ({f?.type || "?"})</button></p>
        <h3 className="fig-title"><input className="ew-h" value={b.x?.title || ""} onChange={e => up({ x: { ...b.x, title: e.target.value } })} placeholder="Titre de la figure (une affirmation)" /></h3></div>
      {f ? <FigurePreview figure={f} evidence={evFull.length ? evFull : undefined} /> : <p style={{ padding: 24, textAlign: "center", opacity: .6 }}>Figure introuvable.</p>}
      <figcaption><b>Lecture :</b> <textarea className="ew-h" rows={2} value={b.x?.reading || ""} onChange={e => up({ x: { ...b.x, reading: e.target.value } })} placeholder="comment lire ce graphique, ce qu'il montre et ses limites (pastilles {{K12}} possibles)" style={{ display: "inline", width: "calc(100% - 5rem)", fieldSizing: "content" } as React.CSSProperties} /></figcaption></figure> }
    return null
  }
  if (err && !ready) return <div className="p-10 text-center text-muted-foreground">{err}</div>
  if (!ready || !meta) return <div className="flex items-center justify-center gap-2 p-16 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement…</div>
  const imported = !meta.createdInStudio
  const figNo: Record<string, number> = {}; let fn = 0; for (const sc of secs) for (const bl of sc.blocks) if (bl.k === "figure" || bl.k === "genfig") figNo[bl.id] = ++fn
  const inpH = { fieldSizing: "content" } as React.CSSProperties
  return (
    <div className={`min-h-screen bg-background text-foreground ${dark ? "dark" : ""}`} style={dark ? { background: "#4a4a4d", color: "#f7f5ef", colorScheme: "dark" } : undefined}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" />
      <link rel="stylesheet" href="/figure-engine/assets/article.css" />
      <style>{`.ew-text:empty:before{content:attr(data-ph);opacity:.45;pointer-events:none}.ew-text[data-ph^="Écrivez"]:empty:not(:focus):before{content:none}.ew-ai{border-left:2px solid #8b5cf6;padding-left:12px;margin-left:-14px}.ew-text code{background:rgba(127,127,127,.15);border-radius:4px;padding:1px 5px;font-size:.85em}.ew-text a.src{background:rgba(139,92,246,.15);border-radius:999px;padding:0 6px;font:600 .65em ui-monospace,monospace;text-decoration:none;vertical-align:super;margin:0 1px}.ew-row:hover .ew-tools{opacity:1}.ew-h,.ew-h2{font:inherit;color:inherit;letter-spacing:inherit;background:transparent;border:0;outline:0;width:100%;resize:none;padding:0;margin:0;display:block}.ew-sec:hover .ew-sectools{opacity:1}@keyframes ewpulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes ewspin{to{transform:rotate(360deg)}}@keyframes ewbar{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1)}}.ew-shimmer{animation:ewpulse 1.1s ease-in-out infinite}.ew-spin{display:inline-block;width:11px;height:11px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:ewspin .8s linear infinite;vertical-align:-1px}.ew-skel{display:flex;align-items:flex-end;gap:14px;height:180px;padding:12px 8px;border-bottom:1px solid var(--vra-line,#ccc)}.ew-skel i{flex:1;background:var(--vra-line,#ccc);border-radius:4px 4px 0 0;transform-origin:bottom;animation:ewbar 1.2s ease-in-out infinite}.ew-skel i:nth-child(2n){animation-delay:.15s}.ew-skel i:nth-child(3n){animation-delay:.3s}::highlight(jev-pin){background-color:rgba(139,92,246,.38)}.vra .ew-text:focus,.vra .ew-text:focus-visible,.vra .ew-h:focus-visible,.vra .ew-h2:focus-visible,.vra .ew-h:focus,.vra .ew-h2:focus{outline:none!important;box-shadow:none!important}.ew-sectools{opacity:.3;transition:opacity .15s}.vra-toc ol{list-style:none;padding:0}`}</style>
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-4 py-2 text-sm backdrop-blur">
        <a href="/studio" className="rounded-md px-2 py-1 hover:bg-muted">← Studio</a>
        <span className="text-xs text-muted-foreground">Article · brouillon {metaState && `· ${metaState}`} {secs.some(s => s.state === "dirty" || s.state === "saving") ? "· enregistrement…" : secs.some(s => s.state === "saved") ? "· enregistré" : ""} · écriture sur la page : tapez « / »</span>
        <div className="flex-1" />
        <button className="rounded-md border border-border px-2.5 py-1 hover:bg-muted" onClick={openHistory} title="Versions précédentes de cet article">🕘 Historique</button>
        <button className="rounded-md border border-border px-2.5 py-1 hover:bg-muted" onClick={toggleTheme}>{dark ? "☀ Clair" : "☾ Sombre"}</button>
        <a href={`/articles/${slug}`} className="rounded-md border border-border px-2.5 py-1 hover:bg-muted">Voir le dossier (aperçu)</a>
      </header>
      <article className="vra" data-standalone data-theme={dark ? "dark" : "light"}>
        <header className="vra-cover">
          <p className="vra-kicker">{meta.series === "Essais" ? "Essai" : meta.series === "Dossiers" ? "Dossier" : "Article"}</p>
          {imported ? <h1>{meta.title}</h1> : <h1><textarea className="ew-h" rows={1} value={meta.title} onChange={e => { const m = { ...meta, title: e.target.value }; setMeta(m); saveMeta(m) }} placeholder="Titre du dossier" style={inpH} /></h1>}
          {imported ? <p className="vra-dek">{meta.subtitle}</p> : <p className="vra-dek"><textarea className="ew-h" rows={1} value={meta.subtitle} onChange={e => { const m = { ...meta, subtitle: e.target.value }; setMeta(m); saveMeta(m) }} placeholder="Chapô de couverture : la question, pourquoi maintenant, ce que ce dossier apporte" style={inpH} /></p>}
          <p className="vra-byline"><span>Par <strong>Gabriel Bigot</strong></span><span>Brouillon du studio</span></p>
          {!imported && <textarea value={meta.summary} rows={2} onChange={e => { const m = { ...meta, summary: e.target.value }; setMeta(m); saveMeta(m) }} placeholder="Résumé pour la liste des articles (2-3 phrases) — n'apparaît pas dans le dossier" className="mt-3 w-full resize-none rounded-md border border-dashed border-border bg-transparent px-3 py-2 text-sm outline-none" />}
        </header>
        <div className="vra-shell">
          <nav className="vra-toc" aria-label="Sommaire" data-open="true">
            <small>Sommaire</small>
            <ol>{secs.map((s, i) => <li key={s.id}><a href={`#sec-${s.id}`}>{String(i + 1).padStart(2, "0")} · {s.toc || s.title || "Sans titre"}</a></li>)}{evidence.length > 0 && !meta.adopted && <li><a href="#registre-apercu">{String(secs.length + 1).padStart(2, "0")} · Registre des sources</a></li>}</ol>
            <button className="mt-3 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted" onClick={() => addSection(null)}>+ Section</button>
          </nav>
          <main className="vra-main" id="contenu">
            {err && <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500" onClick={() => setErr("")}>{err}</div>}
            {imported && <p className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">Dossier importé : ses sections d&apos;origine se modifient en place sur l&apos;aperçu. Ici : les sections que vous y ajoutez (elles s&apos;affichent après les sections d&apos;origine).</p>}
            {secs.map((s, i) => (
              <section key={s.id} id={`sec-${s.id}`} className="ew-sec" data-num={String(i + 1).padStart(2, "0")} style={{ scrollMarginTop: 70 }}>
                <p className="marker" style={{ display: "flex", alignItems: "center", gap: 8 }}><span>{String(i + 1).padStart(2, "0")} · {s.marker || s.toc || s.title}</span><span style={{ flex: 1 }} />
                  <span className="ew-sectools" style={{ fontFamily: "var(--vra-sans)", fontSize: 12 }}>{!imported && <><button title="Monter" onClick={() => move(s.id, -1)}>↑</button> <button title="Descendre" onClick={() => move(s.id, 1)}>↓</button> </>}<button onClick={() => delSection(s.id)}>Supprimer</button></span></p>
                <h2><textarea className="ew-h2" rows={1} value={s.title} onChange={e => setTitle(s.id, e.target.value)} placeholder="Titre de la section (une affirmation)" style={inpH} /></h2>
                <BlockEditor skin="dossier" blocks={s.blocks} onChange={fn => change(s.id, fn)} items={ITEMS} aiContext={`dossier « ${meta.title} », section « ${s.title} »${pinned ? ` — SÉLECTION ÉPINGLÉE : « ${pinned.text.slice(0, 300)} » (« ça », « ce passage » la désignent)` : ""}`} aiOn={aiOn} onError={setErr} uploader={uploader}
                  onAction={(act, id) => { if (act === "figure") setFigDlg({ secId: s.id, blockId: id, mode: "replace" }); if (act === "source") openSource(id) }} sourceButton={() => openSource(null)} suggest={(b, all) => suggestFor(s.id, b, all)} onPasteTable={(id, text) => pasteTable(s.id, id, text)} onProposal={direct} onSuggestNext={id => nextSentence(s.id, id)}
                  special={(b, up) => rawBlocks(b, up, s.id, figNo[b.id])}
                  wrap={(b, inner, up) => b.k === "callout" ? <div className={`callout ${b.x?.variant || "keep"}`} style={{ position: "relative" }}>
                    <select value={b.x?.variant || "keep"} onChange={e => up({ x: { ...b.x, variant: e.target.value } })} style={{ position: "absolute", right: 8, top: 8, fontSize: 11 }}><option value="keep">À retenir</option><option value="opinion">Position de l&apos;auteur</option><option value="warn">Attention</option><option value="caution">Précaution</option><option value="">Neutre</option></select>
                    <h4><input className="ew-h" value={b.x?.title || ""} onChange={e => up({ x: { ...b.x, title: e.target.value } })} placeholder="Titre de l'encadré" /></h4>{inner}</div> : b.k === "quote" ? <blockquote>{inner}</blockquote> : inner} />
                <p style={{ marginTop: 8 }}><button className="rounded-md border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted" style={{ fontFamily: "var(--vra-sans)" }} onClick={() => addSection(s.id)}>+ Section ici</button></p>
              </section>
            ))}
            {!secs.length && <button className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted" onClick={() => addSection(null)}>+ Première section</button>}
            {evidence.length > 0 && !meta.adopted && <section id="registre-apercu" data-num="00"><p className="marker">Registre des sources (généré)</p><h2>Registre des sources</h2><p style={{ fontSize: 14, opacity: .7 }}>Aperçu : le registre complet est généré dans le dossier à partir des sources citées ci-dessous.</p>
              <ul className="prose">{evidence.map(e => <li key={e.key}><strong>{e.key}</strong> — {e.fact}</li>)}</ul></section>}
          </main>
        </div>
      </article>
      {hist && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6" onMouseDown={e => { if (e.target === e.currentTarget) setHist(null) }}><div className="w-full max-w-3xl rounded-xl border border-border bg-background p-5 text-foreground shadow-2xl">
        <div className="flex items-center"><h2 className="font-medium">🕘 Historique des versions</h2><div className="flex-1" /><button className="mr-2 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted" onClick={manualPoint}>+ Créer un point maintenant</button><button onClick={() => setHist(null)} className="rounded px-2 hover:bg-muted">×</button></div>
        <p className="mt-1 text-xs text-muted-foreground">Un point est créé automatiquement avant chaque série de modifications (au plus un toutes les 10 minutes) et avant chaque restauration. Les 30 derniers sont conservés.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[16rem_1fr]">
          <ul className="max-h-80 space-y-1 overflow-y-auto">{hist.items.length === 0 && <li className="text-sm text-muted-foreground">Aucun point pour l&apos;instant : il sera créé à votre prochaine modification.</li>}{hist.items.map(it => <li key={it.id}><button onClick={() => pickVersion(it.id)} className={`w-full rounded-md border px-2 py-1.5 text-left text-xs hover:bg-muted ${hist.sel === it.id ? "border-foreground bg-muted" : "border-border"}`}><div className="font-medium">{new Date(it.at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div><div className="text-muted-foreground">{it.label} · {it.sections} sections · ~{it.words} mots</div></button></li>)}</ul>
          <div className="min-h-[8rem] text-sm">{!hist.sel ? <p className="text-muted-foreground">Choisissez une version pour voir ce qui a changé depuis.</p> : !hist.diff ? <p className="text-muted-foreground">Comparaison…</p> : <>
            <ul className="max-h-64 space-y-1 overflow-y-auto">{hist.diff.filter(d => d.status !== "identique").length === 0 ? <li className="text-muted-foreground">Identique à l&apos;état actuel.</li> : hist.diff.filter(d => d.status !== "identique").map(d => <li key={d.id} className="flex gap-2"><span className={`shrink-0 rounded-full border px-2 text-xs ${d.status.startsWith("suppr") ? "border-red-500/50 text-red-600" : d.status.startsWith("ajout") ? "border-emerald-500/50 text-emerald-600" : "border-amber-500/50 text-amber-600"}`}>{d.status}</span><span>{d.title}</span></li>)}</ul>
            <button disabled={hist.busy} onClick={restoreVersion} className="mt-3 rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40">{hist.busy ? "Restauration…" : "Restaurer cette version"}</button></>}</div></div></div></div>}
      {pinned && <div style={{ position: "fixed", left: 20, bottom: 20, maxWidth: 380 }} className="z-40 flex items-start gap-2 rounded-xl border border-violet-500/50 bg-background px-3 py-2 text-xs shadow-xl"><span>📌</span><div><div className="font-medium">Sélection épinglée</div><div className="text-muted-foreground">« {pinned.text.slice(0, 90)}{pinned.text.length > 90 ? "…" : ""} »</div><div className="mt-1 text-muted-foreground">Écrivez où vous voulez : « mets ça en gras », « explique ça », « source pour ça », « raccourcis ça »…</div></div><button className="rounded px-1.5 hover:bg-muted" title="Désépingler" onClick={() => setPinned(null)}>✕</button></div>}
      {working && <WorkingPill key={working.t0} label={working.label} />}
      {toast && <div style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)" }} className="z-50 flex max-w-xl items-center gap-3 rounded-lg border border-border bg-background px-4 py-2 text-sm shadow-xl">{toast.msg}{toast.undo && <button className="rounded-md bg-foreground px-2.5 py-0.5 text-xs text-background" onClick={() => { toast.undo?.(); setToast(null) }}>Annuler</button>}</div>}
      {titles && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onMouseDown={e => { if (e.target === e.currentTarget) setTitles(null) }}><div className="w-full max-w-xl rounded-xl border border-border bg-background p-5 shadow-2xl"><h2 className="font-medium">✨ Titres proposés pour cette section</h2><ul className="mt-3 space-y-2">{titles.options.map(t => <li key={t}><button className="w-full rounded-md border border-border px-3 py-2 text-left hover:bg-muted" onClick={() => { setTitle(titles.secId, t); setTitles(null) }}>{t}</button></li>)}</ul><button className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm" onClick={() => setTitles(null)}>Garder le titre actuel</button></div></div>}
      {leads && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6" onMouseDown={e => { if (e.target === e.currentTarget) setLeads(null) }}><div className="w-full max-w-2xl rounded-xl border border-border bg-background p-5 shadow-2xl"><h2 className="font-medium">🔎 Pistes de sources : {leads.topic}</h2>
        <p className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">Claude n&apos;a pas accès au web : ce sont des <b>pistes de recherche</b>, pas des sources. Ne citez rien avant d&apos;avoir lu le document ; ajoutez-le ensuite avec « Citer une source ».</p>
        {leads.busy ? <p className="mt-4 text-sm text-muted-foreground">Claude réfléchit…</p> : <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: "inherit" }}>{leads.text}</pre>}<button className="mt-4 rounded-md border border-border px-3 py-1.5 text-sm" onClick={() => setLeads(null)}>Fermer</button></div></div>}
      {rev && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6" onMouseDown={e => { if (e.target === e.currentTarget) setRev(null) }}><div className="w-full max-w-2xl rounded-xl border border-border bg-background p-5 shadow-2xl"><div className="flex items-center"><h2 className="font-medium">Relecture : {rev.scope}</h2><div className="flex-1" /><button onClick={() => setRev(null)} className="rounded px-2 hover:bg-muted">×</button></div>
        {rev.issues.length === 0 ? <p className="mt-3 text-sm">Aucune remarque automatique.</p> : <ul className="mt-3 space-y-1.5">{rev.issues.map((it, i) => <li key={i}><button className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => goto(it.sec, it.block)}><span className="shrink-0 rounded-full border border-border px-2 text-xs">{it.kind}</span><span>{it.text}</span></button></li>)}</ul>}
        <div className="mt-4 border-t border-border pt-3"><button disabled={rev.busy || aiOn === false} onClick={critique} className="rounded-md border border-violet-500/50 px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-40">{rev.busy ? "Claude relit…" : "✨ Relecture critique par Claude"}</button>{aiOn === false && <span className="ml-2 text-xs text-red-500">clé IA absente</span>}
          {rev.ai && <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: "inherit" }}>{rev.ai}</pre>}</div></div></div>}
      {plan?.open && <PlanDialog plan={plan} aiOn={aiOn} onRun={runPlan} onInsert={insertPlan} onClose={() => setPlan(null)} initial={plan.init} autorun={!!plan.init} />}
      {srcDlg && <SourceDialog slug={slug} base={base} evidence={evidence} full={evFull} hint={srcDlg.hint} onClose={() => setSrcDlg(null)} onPick={insertSource} onAdded={e => setEvidence(v => [...v, e])} />}
      {figDlg && <FigureDialog prefill={figDlg.prefill} endpoint={`${base}/figure`} intents={intents} evidence={evidence} aiOn={aiOn} onClose={() => setFigDlg(null)} onInsert={async (fig, title, _src) => {
        const id = `fig-${(title || "figure").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "figure"}-${Math.random().toString(36).slice(2, 6)}`
        try { await api(`${base}/edits`, { op: "figure", fig: id, figure: fig }); setFigs(f => ({ ...f, [id]: fig })); const d = figDlg; setFigDlg(null); change(d.secId, bs => d.mode === "after" ? bs.flatMap(b => b.id === d.blockId ? [b, mk("figure", "", { x: { fig: id, title, reading: "" } })] : [b]) : bs.map(b => b.id === d.blockId ? { ...b, k: "figure", text: "", ver: b.ver + 1, x: { fig: id, title, reading: "" } } : b)) }
        catch (e) { setErr(e instanceof Error ? e.message : String(e)); setFigDlg(null) } }} />}
    </div>
  )
}

function Elapsed() { const [n, setN] = useState(0); useEffect(() => { const t = setInterval(() => setN(x => x + 1), 1000); return () => clearInterval(t) }, []); return <span style={{ marginLeft: 8, opacity: .7, fontFamily: "var(--vra-sans)", textTransform: "none", letterSpacing: 0 }}>{n} s{n >= 12 ? " · toujours en cours, merci de patienter" : ""}</span> }
function WorkingPill({ label }: { label: string }) { const [n, setN] = useState(0); useEffect(() => { const t = setInterval(() => setN(x => x + 1), 1000); return () => clearInterval(t) }, []); return <div style={{ position: "fixed", left: "50%", bottom: 76, transform: "translateX(-50%)" }} className="z-50 flex items-center gap-2.5 rounded-full border border-violet-500/50 bg-background px-4 py-2 text-sm shadow-xl" role="status"><span className="ew-spin" />✨ {label}<span className="text-xs text-muted-foreground">{n} s</span></div> }
function TableEd({ x, onChange, onChart }: { x: Raw; onChange: (x: Raw) => void; onChart: (p: { title: string; text: string; unit: string }) => void }) {
  const head: string[] = x.head || [], rows: string[][] = x.rows || []
  const nm = (c: string) => { const t = (c || "").replace(/\{\{[KDV]\d+\}\}|[*`\s\u00a0%€]/g, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? t : "" }
  const numCols = head.map((_, c) => c).filter(c => c > 0 && rows.length >= 2 && rows.every(r => nm(r[c])))
  const chart = () => { const cols = numCols.slice(0, 2), unit = /%/.test(rows.map(r => r.join(" ")).join(" ")) ? "%" : ""; onChart({ title: x.caption || "", unit, text: rows.map(r => [r[0].replace(/\{\{[KDV]\d+\}\}|[*`]/g, ""), ...cols.map(c => nm(r[c]))].join(" ; ")).join("\n") }) }
  const setCell = (r: number, c: number, v: string) => onChange({ ...x, rows: rows.map((row, i) => i === r ? row.map((cell, j) => j === c ? v : cell) : row) })
  return <div className="my-3 overflow-x-auto rounded-lg border border-border">
    <input value={x.caption || ""} onChange={e => onChange({ ...x, caption: e.target.value })} placeholder="Légende du tableau" className="w-full border-b border-border bg-transparent px-3 py-1.5 text-sm outline-none" />
    <table className="w-full text-sm"><thead><tr>{head.map((h, c) => <th key={c} className="border-b border-border p-0"><input value={h} onChange={e => onChange({ ...x, head: head.map((v, j) => j === c ? e.target.value : v) })} className="w-full bg-muted/40 px-3 py-1.5 font-semibold outline-none" /></th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{head.map((_, c) => <td key={c} className="border-b border-border p-0"><input value={r[c] || ""} onChange={e => setCell(i, c, e.target.value)} className="w-full bg-transparent px-3 py-1.5 outline-none" /></td>)}</tr>)}</tbody></table>
    <div className="flex gap-2 p-2 text-xs"><button className="rounded border border-border px-2 py-0.5 hover:bg-muted" onClick={() => onChange({ ...x, rows: [...rows, head.map(() => "")] })}>+ Ligne</button><button className="rounded border border-border px-2 py-0.5 hover:bg-muted" onClick={() => head.length < 8 && onChange({ ...x, head: [...head, `Colonne ${head.length + 1}`], rows: rows.map(r => [...r, ""]) })}>+ Colonne</button><button className="rounded border border-border px-2 py-0.5 hover:bg-muted" onClick={() => rows.length > 1 && onChange({ ...x, rows: rows.slice(0, -1) })}>− Ligne</button><button className="rounded border border-border px-2 py-0.5 hover:bg-muted" onClick={() => head.length > 1 && onChange({ ...x, head: head.slice(0, -1), rows: rows.map(r => r.slice(0, -1)) })}>− Colonne</button>{numCols.length > 0 && <button className="rounded border border-violet-500/50 px-2 py-0.5 hover:bg-muted" onClick={chart}>📊 Graphique depuis ce tableau</button>}<span className="ml-auto text-muted-foreground">Gras, liens et {"{{K12}}"} autorisés dans les cellules</span></div>
  </div>
}
function GlossEd({ x, onChange }: { x: Raw; onChange: (x: Raw) => void }) {
  const terms: { term: string; def: string }[] = x.terms || []
  const set = (i: number, p: Partial<{ term: string; def: string }>) => onChange({ ...x, terms: terms.map((t, j) => j === i ? { ...t, ...p } : t) })
  return <div className="my-3 space-y-2 rounded-lg border border-border p-3"><div className="text-xs uppercase tracking-wide text-muted-foreground">Glossaire</div>
    {terms.map((t, i) => <div key={i} className="grid gap-1 sm:grid-cols-[12rem_1fr]"><input value={t.term} onChange={e => set(i, { term: e.target.value })} placeholder="Terme" className="rounded border border-border bg-transparent px-2 py-1 text-sm font-medium outline-none" /><textarea value={t.def} onChange={e => set(i, { def: e.target.value })} rows={2} placeholder="Définition simple, sans jargon" className="resize-none rounded border border-border bg-transparent px-2 py-1 text-sm outline-none" /></div>)}
    <button className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted" onClick={() => onChange({ ...x, terms: [...terms, { term: "", def: "" }] })}>+ Terme</button></div>
}

function SourceDialog({ slug, base, evidence, full, hint, onClose, onPick, onAdded }: { slug: string; base: string; evidence: Ev[]; full: Raw[]; hint: string; onClose: () => void; onPick: (k: string) => void; onAdded: (e: Ev) => void }) {
  const [q, setQ] = useState(""); const [mode, setMode] = useState<"list" | "new">("list"); const [busy, setBusy] = useState(false); const [err, setErr] = useState("")
  const [f, setF] = useState({ fact: "", value: "", unit: "", sourceName: "", sourceClass: "primary", publicationDate: "", observationDate: "", url: "", state: "actual", limitations: "" })
  const sugg = rankEvidence(full.length ? full : evidence, hint)
  const [infoMsg, setInfoMsg] = useState("")
  const complete = async () => { setInfoMsg("Lecture de la page…"); try { const r = await api<{ title: string; siteName: string; author: string; description: string; date: string; sourceClass: string }>("/api/studio/source-info", { url: f.url }); setF(v => ({ ...v, sourceName: v.sourceName || r.siteName, publicationDate: v.publicationDate || r.date, sourceClass: r.sourceClass === "other" ? v.sourceClass : r.sourceClass, fact: v.fact || (r.title ? `${r.title}${r.description ? " — " + r.description : ""}`.slice(0, 600) : ""), limitations: v.limitations || "Fiche préremplie à partir des métadonnées de la page (titre, éditeur, date) : contenu non relu." })); setInfoMsg("Champs préremplis à partir de la page : à vérifier avant de citer.") } catch (e) { setInfoMsg(e instanceof Error ? e.message : String(e)) } }
  const list = evidence.filter(e => !q || (e.key + " " + e.fact).toLowerCase().includes(q.toLowerCase())).slice(0, 40)
  const add = async () => { setBusy(true); setErr(""); try { const r = await api<{ id: string }>(`${base}/edits`, { op: "evidence", entry: f }); onAdded({ key: r.id, fact: f.fact }); onPick(r.id) } catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(false) } }
  void slug
  const inp = "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none"
  return <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="w-full max-w-xl rounded-xl border border-border bg-background p-5 shadow-2xl">
      <div className="flex items-center"><h2 className="font-medium">Citer une source</h2><div className="flex-1" /><button onClick={onClose} className="rounded px-2 hover:bg-muted">×</button></div>
      <div className="mt-3 flex gap-2 text-sm"><button className={`rounded-md border px-3 py-1 ${mode === "list" ? "border-foreground" : "border-border"}`} onClick={() => setMode("list")}>Sources du dossier</button><button className={`rounded-md border px-3 py-1 ${mode === "new" ? "border-foreground" : "border-border"}`} onClick={() => setMode("new")}>+ Nouvelle source</button></div>
      {mode === "list" ? <>{sugg.length > 0 && <div className="mt-3 rounded-lg border border-violet-500/40 bg-violet-500/5 p-2"><div className="mb-1 px-1 text-xs font-medium">✨ Sources qui semblent correspondre à ce passage</div>{sugg.map(x => <button key={x.e.key} className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => onPick(String(x.e.key))}><span className="shrink-0 rounded-full bg-violet-500/15 px-2 font-mono text-xs">{String(x.e.key)}</span><span>{String(x.e.fact)}{x.e.value ? ` — ${String(x.e.value)}` : ""}</span></button>)}<div className="px-1 text-[11px] text-muted-foreground">Proposition par mots communs : vérifiez que la source dit bien cela.</div></div>}<input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher (K12, mot du fait…)" className={inp + " mt-3"} />
        <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto">{list.map(e => <li key={e.key}><button className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => onPick(e.key)}><span className="shrink-0 rounded-full bg-violet-500/15 px-2 font-mono text-xs">{e.key}</span><span>{e.fact}</span></button></li>)}{!list.length && <li className="p-3 text-sm text-muted-foreground">Aucune source : ajoutez-en une.</li>}</ul></>
        : <div className="mt-3 space-y-2 text-sm">
          <textarea value={f.fact} onChange={e => setF({ ...f, fact: e.target.value })} rows={3} placeholder="Le fait établi par cette source (une phrase, sans interprétation)" className={inp} />
          <div className="grid grid-cols-2 gap-2"><input value={f.value} onChange={e => setF({ ...f, value: e.target.value })} placeholder="Valeur clé (ex. 51 %)" className={inp} /><input value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} placeholder="Unité" className={inp} />
            <input value={f.sourceName} onChange={e => setF({ ...f, sourceName: e.target.value })} placeholder="Organisme / auteur" className={inp} />
            <select value={f.sourceClass} onChange={e => setF({ ...f, sourceClass: e.target.value })} className={inp}><option value="primary">Source primaire</option><option value="official">Officielle</option><option value="industry">Étude / secteur</option><option value="press">Presse</option><option value="other">Autre</option></select>
            <label className="text-xs text-muted-foreground">Publiée le<input type="date" value={f.publicationDate} onChange={e => setF({ ...f, publicationDate: e.target.value })} className={inp} /></label>
            <label className="text-xs text-muted-foreground">Observation (période)<input value={f.observationDate} onChange={e => setF({ ...f, observationDate: e.target.value })} placeholder="2025, T2 2026…" className={inp} /></label></div>
          <div className="flex gap-2"><input value={f.url} onChange={e => setF({ ...f, url: e.target.value })} placeholder="Adresse (https://…)" className={inp} /><button type="button" disabled={!/^https?:\/\//i.test(f.url)} onClick={complete} className="shrink-0 rounded-md border border-violet-500/50 px-3 text-xs hover:bg-muted disabled:opacity-40">Compléter</button></div>{infoMsg && <p className="text-xs text-muted-foreground">{infoMsg}</p>}
          <select value={f.state} onChange={e => setF({ ...f, state: e.target.value })} className={inp}><option value="actual">Réel (donnée observée)</option><option value="estimate">Estimation</option><option value="forecast">Prévision</option><option value="derived">Calculé</option><option value="claim">Affirmation (non vérifiée)</option></select>
          <textarea value={f.limitations} onChange={e => setF({ ...f, limitations: e.target.value })} rows={2} placeholder="Limites : ce que la source ne dit pas, ce que vous n'avez pas pu lire" className={inp} />
          {err && <p className="text-red-500">{err}</p>}
          <button disabled={busy || !f.fact.trim()} onClick={add} className="rounded-md bg-foreground px-3 py-1.5 text-background disabled:opacity-40">{busy ? "…" : "Ajouter et citer"}</button></div>}
    </div></div>
}
