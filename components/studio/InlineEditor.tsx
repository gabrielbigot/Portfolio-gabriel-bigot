"use client"
// Édition directe sur le site : cliquez sur un texte pour le modifier ; survolez un bloc pour le dupliquer / supprimer / déplacer ;
// cliquez sur une image pour la remplacer. Les modifications vont dans le BROUILLON (rien n'est public avant « Publier »).
// Ce qui est modifiable : tout texte signé (voir lib/studio/stega.ts), les champs de liaison (société, catégorie, étiquettes, dates…)
// retrouvés par leur valeur, les textes d'attributs (alt, title, placeholder, aria-label) et les images (données ou fichiers statiques).
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Check, ChevronUp, ChevronDown, Copy, ExternalLink, EyeOff, Eye, GripHorizontal, ImagePlus, Loader2, Moon, Sun, Palette, Pencil, Plus, Settings2, Trash2, Type, Upload, X, FileText, Rows3, CopyPlus, ClipboardPaste } from "lucide-react"
import { MARK_RE, decodePayload, isMarkable, blockedAncestorOf } from "@/lib/studio/stega"
import { humanize, itemTitle, type Json } from "@/lib/studio/json-utils"
import { CONTENT } from "@/lib/site-content-registry"
import { ChangesDialog, studioApi, useStudioChanges } from "@/components/studio/ChangesDialog"
import { AiPromptDialog, PagesPanel, SectionLibrary, SectionPicker, SectionSettings, ThemePanel, type Clip, type Rule } from "@/components/studio/EditorPanels"
import { snapshotElement } from "@/lib/studio/html-safe"
import { BLOCK_TYPES, newId } from "@/lib/studio/block-templates"

type Cand = { key: string; path: string[] }
// kind « mark » : texte signé ; « value » : texte non signé (champ de liaison : société, catégorie, étiquette, date…) retrouvé par sa valeur
type Hit = { node: Text; start: number; end: number; marker: string; key: string; path: string[]; kind: "mark" | "value" | "html"; cands?: Cand[] }
type AttrTarget = { el: Element; attr: string; marker: string; key: string; path: string[] }
type Rect = { left: number; top: number; width: number; height: number }
type Editing = { rects: Rect[]; value: string; multiline: boolean; targets: Cand[]; all: Cand[]; scope: "one" | "all"; title: string; apply: (v: string) => void; custom?: (v: string) => Promise<void> }

type AiTrace = { prompt: string; before: string; after: string; at: string; model: string; status: "ai" | "reviewed" | "edited" }
const traceOk = (t: { after: string }, h: { node: Text; start: number; end: number }) => { const x = (h.node.nodeValue || "").slice(h.start, h.end).replace(/\s+/g, " ").trim(), a = t.after.replace(/\s+/g, " ").replace(/[*\[\]]/g, ""); return !!x && (a === x || a.includes(x)) } // une trace n'est affichée que si le texte actuel en vient encore (positions décalées, texte modifié ailleurs)
const traceId = (c: { key: string; path: string[] }) => `${c.key}|${c.path.join("/")}`
// consigne probable : commence par « / » ou par un verbe d'ordre (la pastille demande toujours confirmation avant tout envoi à l'IA)
const INSTR = /^\s*(\/|(?:r[ée]écri|reformul|raccourci|r[ée]sum|d[ée]velopp|d[ée]taill|explique|[ée]cri(?:s|re)\b|r[ée]dig|ajoute|compl[eè]t|corrige|traduis|simplifi|am[ée]liore|transform|reprends|propose|g[ée]n[èe]r|rends|mets|fais|donne|trouve|allonge|enrichis|synth[ée]tise|make|rewrite|shorten|expand|translate|summari[sz]e|fix|improve|write|add|turn|give|explain)\w*)/i
const looksLikeInstruction = (t: string) => { const v = t.trim(); return v.length >= 8 && v.split(/\s+/).length >= 2 && INSTR.test(v) }
const ATTRS = ["alt", "title", "placeholder", "aria-label"]
const isIdx = (s: string) => /^\d+$/.test(s)
const post = (url: string, body: unknown) => studioApi(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
const toRect = (r: DOMRect | Rect): Rect => ({ left: r.left, top: r.top, width: r.width, height: r.height })
const union = (rs: Rect[]): Rect | null => { if (!rs.length) return null; const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), rr = Math.max(...rs.map(r => r.left + r.width)), b = Math.max(...rs.map(r => r.top + r.height)); return { left: l, top: t, width: rr - l, height: b - t } }
const getAt = (data: Json | undefined, path: string[]): Json | undefined => { let c: any = data; for (const s of path) { if (c === null || typeof c !== "object") return undefined; c = c[s] } return c }
const norm = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase()
const DATE_KEYS = new Set(["date", "startdate", "enddate", "birthdate", "publishedat", "updatedat", "createdat"])
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
const MONTHS_EN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
function dateVariants(v: string): string[] {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(v); if (!m) return []
  const [y, mo, d] = [m[1], m[2] ? +m[2] : 0, m[3] ? +m[3] : 0]; const out = [y]
  if (mo) out.push(`${MONTHS_FR[mo - 1]} ${y}`, `${MONTHS_EN[mo - 1]} ${y}`, `${String(mo).padStart(2, "0")}/${y}`)
  if (mo && d) out.push(`${d} ${MONTHS_FR[mo - 1]} ${y}`, `${d === 1 ? "1er" : d} ${MONTHS_FR[mo - 1]} ${y}`, `${MONTHS_EN[mo - 1]} ${d}, ${y}`, `${d} ${MONTHS_EN[mo - 1]} ${y}`, `${String(d).padStart(2, "0")}/${String(mo).padStart(2, "0")}/${y}`)
  return out
}
const STATIC_IMG = /^\/(about|projects|companies|portfolio|newsletters)\/([A-Za-z0-9._-]+\/){0,3}[A-Za-z0-9._ -]+\.(png|jpe?g|webp|gif|avif)$/i

function textNodes(): Text[] {
  const out: Text[] = []
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode(n) { const p = n.parentElement; if (!p || p.closest("[data-studio-ui],script,style,noscript,textarea")) return NodeFilter.FILTER_REJECT; return /\p{L}|\d/u.test(n.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT } })
  let n: Node | null; while ((n = w.nextNode())) out.push(n as Text)
  return out
}
function rectsOf(h: Hit): Rect[] { try { const r = document.createRange(); r.setStart(h.node, h.start); r.setEnd(h.node, h.end); return [...r.getClientRects()].filter(x => x.width > 0).map(toRect) } catch { return [] } }
const near = (rs: Rect[], x: number, y: number, tol = 3) => rs.some(r => x >= r.left - tol && x <= r.left + r.width + tol && y >= r.top - tol && y <= r.top + r.height + tol)
function attrOf(el: Element | null): AttrTarget | null {
  for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
    if (e.closest("[data-studio-ui]")) return null
    for (const a of ATTRS) { const v = e.getAttribute(a); if (v && v.includes("⁠")) { const m = [...v.matchAll(MARK_RE)][0]; const payload = m && decodePayload(m[0]); if (payload) { const [key, ...path] = payload.split("|"); return { el: e, attr: a, marker: m[0], key, path } } } }
    if (e.tagName === "BODY") break
  }
  return null
}

const routeKey = () => (location.pathname || "/").replace(/(.)\/$/, "$1")
const mainEl = () => document.querySelector("main") as HTMLElement | null
const blockEls = () => [...(mainEl()?.children || [])].filter((e): e is HTMLElement => e instanceof HTMLElement && !["STYLE", "SCRIPT", "TEMPLATE"].includes(e.tagName) && !e.hasAttribute("data-studio-ui"))
const selOf = (el: HTMLElement) => (el.dataset.cb ? `[data-cb="${el.dataset.cb}"]` : el.id ? `#${CSS.escape(el.id)}` : `:nth-child(${[...el.parentElement!.children].indexOf(el) + 1})`)
const blockName = (el: HTMLElement) => { const h = el.querySelector("h1,h2,h3") || el; const t = (h.textContent || "").replace(/[\u2060\u200c\u200d]/g, "").trim(); return (t.slice(0, 48) || el.id || el.tagName.toLowerCase()) }

export default function InlineEditor() {
  const router = useRouter()
  const [on, setOn] = useState(false); const [ready, setReady] = useState(false)
  const [hover, setHover] = useState<{ hit: Hit; rects: Rect[]; cand: Cand } | null>(null)
  const [level, setLevel] = useState<number | null>(null)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [imgHover, setImgHover] = useState<{ el: HTMLImageElement; rect: Rect; paths: Cand[]; asset: string | null; alt: AttrTarget | null; inHtml: boolean } | null>(null)
  const [chip, setChip] = useState<{ t: AttrTarget; rect: Rect } | null>(null)
  const [busy, setBusy] = useState(""); const [toast, setToast] = useState(""); const [showChanges, setShowChanges] = useState(false)
  const hits = useRef<Hit[]>([]); const byNode = useRef(new Map<Text, Hit[]>()); const cache = useRef(new Map<string, Json>())
  const imgIndex = useRef(new Map<string, Cand[]>()); const valueIndex = useRef(new Map<string, Cand[]>()); const sameValue = useRef(new Map<string, Cand[]>())
  const inlineRef = useRef<((h: Hit, cand: Cand, x: number, y: number) => Promise<boolean>) | null>(null)
  const [aiDlg, setAiDlg] = useState<{ el: HTMLElement; rect: { left: number; top: number } } | null>(null)
  const [traces, setTraces] = useState<Record<string, AiTrace>>({}); const [aiOn, setAiOn] = useState<boolean | null>(null); const [aiTick, setAiTick] = useState(0)
  const keepToolbar = useRef(false); const clearT = useRef<ReturnType<typeof setTimeout> | null>(null); const fileRef = useRef<HTMLInputElement>(null)
  const chg = useStudioChanges()
  const createBlank = async (kind: "article") => {
    const title = window.prompt("Titre du nouvel article (modifiable ensuite) :", "Nouvel article"); if (title === null) return
    setBusy("Création de l'article…")
    try { const r = await post(`/api/studio/new/${kind}`, { title }) as { slug: string }; location.href = `/studio/write/article/${r.slug}` }
    catch (e) { setBusy(""); setToast(e instanceof Error ? e.message : String(e)) }
  }
  const [dark, setDark] = useState(false)
  useEffect(() => { let m: string | null = null; try { m = localStorage.getItem("site-mode") } catch { /* stockage indisponible */ } if (m) document.documentElement.classList.toggle("dark", m === "dark"); setDark(document.documentElement.classList.contains("dark")) }, [])
  const toggleMode = () => { const n = !dark; document.documentElement.classList.toggle("dark", n); try { localStorage.setItem("site-mode", n ? "dark" : "light") } catch { /* ignore */ } setDark(n) }
  const [panel, setPanel] = useState<null | "theme" | "pages" | "sections">(null)
  const [blk, setBlk] = useState<{ el: HTMLElement; rect: Rect } | null>(null)
  const [settings, setSettings] = useState<{ el: HTMLElement; sel: string; rule: Rule; rect: Rect } | null>(null)
  const [picker, setPicker] = useState<{ el: HTMLElement; rect: Rect } | null>(null)
  const [clip, setClip] = useState<Clip | null>(null)
  const [library, setLibrary] = useState<{ el: HTMLElement; rect: Rect } | null>(null)
  const [sections, setSections] = useState<{ el: HTMLElement; sel: string; name: string; hidden: boolean; custom: boolean }[]>([])

  useEffect(() => { studioApi<{ enabled: boolean }>("/api/studio/ai").then(r => setAiOn(!!r.enabled)).catch(() => setAiOn(false)); studioApi<{ items: Record<string, AiTrace> }>("/api/studio/ai-trace").then(r => setTraces(r.items || {})).catch(() => {}) }, [])
  useEffect(() => { try { setOn(localStorage.getItem("studio-edit") !== "0") } catch { /* ignore */ } setReady(true) }, [])
  useEffect(() => { const load = () => { try { const c = localStorage.getItem("studio-clip"); setClip(c ? JSON.parse(c) : null) } catch { /* ignore */ } }; load(); window.addEventListener("storage", load); return () => window.removeEventListener("storage", load) }, [])
  const toggle = () => { const v = !on; setOn(v); setHover(null); setEditing(null); setChip(null); setImgHover(null); try { localStorage.setItem("studio-edit", v ? "1" : "0") } catch { /* ignore */ } }

  const content = useCallback(async (key: string): Promise<Json | undefined> => {
    if (cache.current.has(key)) return cache.current.get(key)
    const r = await studioApi<{ draft: Json }>(`/api/studio/content/${key}?draftOnly=1`); cache.current.set(key, r.draft); return r.draft
  }, [])

  // index des valeurs : images (chemins), champs de liaison / dates (retrouvés par leur valeur ; une valeur peut venir de plusieurs champs)
  const buildIndexes = useCallback(async () => {
    const img = new Map<string, Cand[]>(), val = new Map<string, Cand[]>(), same = new Map<string, Cand[]>()
    await Promise.all(CONTENT.map(async d => {
      try {
        const data = await content(d.key)
        const walk = (v: Json | undefined, path: string[]) => {
          if (typeof v === "string") {
            const c = { key: d.key, path }
            if (/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(v) || /^\/uploads\//.test(v)) { img.set(v, [...(img.get(v) || []), c]); return }
            if (d.key !== "strings" && !isMarkable(d.key, path, v, blockedAncestorOf(path)) && !/^(https?:)?\/\//.test(v) && !v.startsWith("/") && v.length > 1) {
              const leaf = [...path].reverse().find(s => !isIdx(s))?.toLowerCase() ?? ""
              const keys = DATE_KEYS.has(leaf) ? [v, ...dateVariants(v)] : [v]
              for (const k of keys) { const n = norm(k); val.set(n, [...(val.get(n) || []), c]) }
              same.set(`${leaf}\u0000${v}`, [...(same.get(`${leaf}\u0000${v}`) || []), c])
            }
          } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...path, String(i)]))
          else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x as Json, [...path, k]))
        }
        walk(data, [])
      } catch { /* contenu absent */ }
    }))
    imgIndex.current = img; valueIndex.current = val; sameValue.current = same
  }, [content])

  // repérage : textes signés + textes non signés dont la valeur correspond à un champ de liaison
  const rescan = useCallback(() => {
    const out: Hit[] = []
    for (const n of textNodes()) {
      const v = n.nodeValue || ""
      if (v.includes("⁠")) {
        let prevEnd = 0
        for (const m of v.matchAll(MARK_RE)) { const payload = decodePayload(m[0]); if (!payload) continue; const [key, ...path] = payload.split("|"); out.push({ node: n, start: prevEnd, end: m.index!, marker: m[0], key, path, kind: "mark" }); prevEnd = m.index! + m[0].length }
      } else if (n.parentElement?.closest("[data-html]")) {
        const lead = v.length - v.trimStart().length; const trimmed = v.trim(); if (!/\p{L}|\d/u.test(trimmed)) continue
        out.push({ node: n, start: lead, end: lead + trimmed.length, marker: "", key: "pages", path: [], kind: "html" })
      } else {
        const cands = valueIndex.current.get(norm(v)); if (!cands) continue
        const lead = v.length - v.trimStart().length; const trimmed = v.trim()
        out.push({ node: n, start: lead, end: lead + trimmed.length, marker: "", key: cands[0].key, path: cands[0].path, kind: "value", cands })
      }
    }
    setAiTick(t => t + 1); hits.current = out; const m = new Map<Text, Hit[]>(); for (const h of out) m.set(h.node, [...(m.get(h.node) || []), h]); byNode.current = m
    // couverture : textes visibles qui ne sont reliés à aucun champ (aide au diagnostic : window.__studioAudit())
    ;(window as any).__studioAudit = () => textNodes().filter(n => !m.has(n) && /\p{L}{2}/u.test(n.nodeValue || '') && (n.parentElement?.getClientRects().length ?? 0) > 0).map(n => (n.nodeValue || '').trim().slice(0, 80))
  }, [])

  useEffect(() => {
    if (!on) return
    let t: ReturnType<typeof setTimeout> | null = null; let live = true
    buildIndexes().then(() => { if (live) rescan() }); rescan()
    const mo = new MutationObserver(() => { if (t) clearTimeout(t); t = setTimeout(rescan, 250) }); mo.observe(document.body, { childList: true, subtree: true, characterData: true })
    document.documentElement.classList.add("studio-editing")
    return () => { live = false; mo.disconnect(); if (t) clearTimeout(t); document.documentElement.classList.remove("studio-editing") }
  }, [on, rescan, buildIndexes])

  // un texte non signé peut correspondre à plusieurs champs : on choisit celui du même bloc (projet, expérience…) que les textes signés voisins
  const resolveCand = useCallback((h: Hit): Cand => {
    if (h.kind === "html") return { key: "pages", path: [] }
    if (!h.cands || h.cands.length === 1) return h.cands?.[0] ?? { key: h.key, path: h.path }
    let el: Element | null = h.node.parentElement
    for (let i = 0; el && i < 12; i++, el = el.parentElement) {
      let best: { c: Cand; n: number } | null = null
      for (const o of hits.current) {
        if (o.kind !== "mark" || !el.contains(o.node)) continue
        for (const c of h.cands) { if (c.key !== o.key) continue; let n = 0; while (n < c.path.length && n < o.path.length && c.path[n] === o.path[n]) n++; if (n > 0 && (!best || n > best.n)) best = { c, n } }
      }
      if (best) return best.c
    }
    return h.cands[0]
  }, [])

  const hitAt = useCallback((x: number, y: number): { hit: Hit; rects: Rect[] } | null => {
    const d: any = document; let node: Node | null = null, off = 0
    if (d.caretRangeFromPoint) { const r = d.caretRangeFromPoint(x, y); if (r) { node = r.startContainer; off = r.startOffset } }
    else if (d.caretPositionFromPoint) { const p = d.caretPositionFromPoint(x, y); if (p) { node = p.offsetNode; off = p.offset } }
    if (!node || node.nodeType !== 3) return null
    for (const h of byNode.current.get(node as Text) || []) if (off >= h.start && off <= h.end) { const rects = rectsOf(h); if (near(rects, x, y)) return { hit: h, rects } }
    return null
  }, [])

  const openText = useCallback(async (key: string, path: string[], rects: Rect[], extra: { all?: Cand[]; apply: (v: string) => void; title: string }) => {
    const data = await content(key); const raw = getAt(data, path)
    if (typeof raw !== "string") { setToast("Ce champ n'est pas du texte simple (voir le formulaire)."); return }
    const leaf = [...path].reverse().find(s => !isIdx(s)) || ""
    const all = (extra.all && extra.all.length > 1) ? extra.all : (sameValue.current.get(`${leaf.toLowerCase()}\u0000${raw}`) || [])
    const linking = /^(company|category|categories|tags|technologies|name|type)$/i.test(leaf) || all.length > 1
    setEditing({ rects, value: raw, multiline: raw.includes("\n") || raw.length > 90, targets: [{ key, path }], all: all.filter(c => !(c.key === key && c.path.join("|") === path.join("|"))), scope: linking && all.length > 1 ? "all" : "one", title: extra.title, apply: extra.apply })
  }, [content])

  // survol / clic
  useEffect(() => {
    if (!on) return
    const move = (e: PointerEvent) => {
      const t = e.target as Element | null; if (t?.closest?.("[data-studio-ui]") || document.querySelector("[data-studio-inline]")) return
      const h = hitAt(e.clientX, e.clientY)
      if (h) { if (clearT.current) clearTimeout(clearT.current); setImgHover(null); setChip(null); setHover(prev => (prev && prev.hit.node === h.hit.node && prev.hit.start === h.hit.start ? { ...prev, rects: h.rects } : (setLevel(null), { ...h, cand: resolveCand(h.hit) }))); return }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el instanceof HTMLImageElement) {
        const src = el.getAttribute("src") || ""; const rel = src.replace(location.origin, "").split("?")[0]
        const inHtml = !!el.closest("[data-html]"); const paths = inHtml ? [] : (imgIndex.current.get(src) || imgIndex.current.get(rel) || []); const asset = !inHtml && STATIC_IMG.test(rel) ? rel : null; const alt = attrOf(el)
        if (paths.length || asset || alt || inHtml) { setHover(null); setChip(null); setImgHover({ el, rect: toRect(el.getBoundingClientRect()), paths, asset, alt, inHtml }); return }
      }
      const a = attrOf(el); if (a) { setHover(null); setImgHover(null); setChip({ t: a, rect: toRect(a.el.getBoundingClientRect()) }); return }
      setChip(prev => (prev && !keepToolbar.current ? null : prev)); setImgHover(prev => (prev && !keepToolbar.current ? null : prev))
      if (!keepToolbar.current) { if (clearT.current) clearTimeout(clearT.current); clearT.current = setTimeout(() => { if (!keepToolbar.current) setHover(null) }, 400) }
    }
    const click = async (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      const t = e.target as Element | null; if (t?.closest?.("[data-studio-ui],[data-studio-inline]")) return
      const h = hitAt(e.clientX, e.clientY)
      if (h) {
        e.preventDefault(); e.stopPropagation()
        if (await inlineRef.current?.(h.hit, h.hit.kind === "html" ? { key: "pages", path: [] } : resolveCand(h.hit), e.clientX, e.clientY)) return // modification directement dans la page
        if (h.hit.kind === "html") { openHtmlText(h.hit, h.rects); return }
        const cand = resolveCand(h.hit); const { node, start, end, marker } = h.hit
        try {
          await openText(cand.key, cand.path, h.rects, { all: h.hit.cands, title: `${humanize(cand.key)} · ${cand.path.filter(s => !isIdx(s)).map(humanize).join(" › ")}`, apply: v => { const cur = node.nodeValue || ""; node.nodeValue = cur.slice(0, start) + v + marker + cur.slice(end + marker.length) } })
        } catch (err) { setToast(err instanceof Error ? err.message : String(err)) }
        return
      }
      // clic sur un lien hors de son texte (marge, icône) : en édition on ne quitte pas la page ; un lien qui ne porte qu'un texte s'édite
      const link = t?.closest?.("a[href]") as HTMLAnchorElement | null
      if (link) {
        e.preventDefault(); e.stopPropagation()
        const inside = hits.current.filter(x => link.contains(x.node)); const only = inside.length === 1 ? inside[0] : null
        if (only) { const rs = rectsOf(only); await inlineRef.current?.(only, only.kind === "html" ? { key: "pages", path: [] } : resolveCand(only), rs[0] ? rs[0].left + rs[0].width / 2 : e.clientX, rs[0] ? rs[0].top + rs[0].height / 2 : e.clientY); return }
        return
      }
      // champs de formulaire : en édition on modifie leur texte d'aide (placeholder) au lieu de saisir
      const a = attrOf(t); if (a && (a.el instanceof HTMLInputElement || a.el instanceof HTMLTextAreaElement)) { e.preventDefault(); e.stopPropagation(); openAttr(a) }
    }
    const moveBlock2 = (e: PointerEvent) => {
      const m = mainEl(); if (!m) return; const t = e.target as Element | null; if (t?.closest?.("[data-studio-ui]")) return
      let el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null); while (el && el.parentElement !== m) el = el.parentElement
      if (el && el !== m && !["STYLE", "SCRIPT"].includes(el.tagName)) setBlk(prev => (prev && prev.el === el ? prev : { el, rect: toRect(el.getBoundingClientRect()) }))
      else if (!keepToolbar.current) setBlk(prev => (prev ? null : prev))
    }
    const scroll = () => { setHover(null); setImgHover(null); setChip(null); setBlk(null) }
    document.addEventListener("pointermove", moveBlock2, { passive: true }); document.addEventListener("pointermove", move, { passive: true }); document.addEventListener("click", click, true); window.addEventListener("scroll", scroll, { passive: true })
    return () => { document.removeEventListener("pointermove", moveBlock2); document.removeEventListener("pointermove", move); document.removeEventListener("click", click, true); window.removeEventListener("scroll", scroll) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, hitAt, resolveCand, openText])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 4500); return () => clearTimeout(t) }, [toast])

  const openAttr = (a: AttrTarget) => { inlineAttr(a).catch(e => setToast(String(e))) }

  // niveaux d'éléments (listes) du texte survolé
  const levels = useMemo(() => {
    if (!hover) return [] as { prefix: string[]; label: string }[]
    const { key, path } = hover.cand; const out: { prefix: string[]; label: string }[] = []
    path.forEach((s, i) => { if (isIdx(s)) out.push({ prefix: path.slice(0, i + 1), label: humanize(path[i - 1] ?? key) }) })
    return out
  }, [hover])
  const cur = levels.length ? levels[Math.min(level ?? levels.length - 1, levels.length - 1)] : null
  const itemRect = useMemo(() => {
    if (!hover || !cur) return null
    const key = hover.cand.key; const rs: Rect[] = []
    for (const h of hits.current) { if (h.kind === "mark" && h.key === key && cur.prefix.every((s, i) => h.path[i] === s)) { rs.push(...rectsOf(h)); if (rs.length > 120) break } }
    return union(rs) ?? hover.rects[0] ?? null
  }, [hover, cur])
  const [itemTitleText, setItemTitleText] = useState("")
  useEffect(() => { let off = false; setItemTitleText(""); if (hover && cur) content(hover.cand.key).then(d => { const it = getAt(d, cur.prefix); if (!off && it !== undefined) setItemTitleText(itemTitle(it, +cur.prefix[cur.prefix.length - 1])) }).catch(() => {}); return () => { off = true } }, [hover, cur, content])

  // modification directement dans la page : le texte devient éditable à sa place (Entrée ou clic ailleurs : enregistrer ; Échap : annuler).
  // Le texte est isolé dans un <span> temporaire (le nœud d'origine est mis de côté puis rendu à React tel quel) : fonctionne aussi dans un bouton, un lien, une étiquette ou un élément mêlant texte et icônes.
  inlineRef.current = async (h, cand, x, y) => {
    const { node, start, end, marker } = h; const parent = node.parentElement
    if (!parent || parent.closest("select,textarea,input,[contenteditable],[data-studio-ui]")) return false
    let raw: string; let others: Cand[] = []
    if (h.kind === "html") raw = (node.nodeValue || "").slice(start, end)
    else {
      const v = getAt(await content(cand.key), cand.path); if (typeof v !== "string") return false
      const leaf = [...cand.path].reverse().find(q => !isIdx(q)) || ""; const all = (h.cands && h.cands.length > 1) ? h.cands : (sameValue.current.get(`${leaf.toLowerCase()}\u0000${v}`) || [])
      others = all.filter(c => !(c.key === cand.key && c.path.join("|") === cand.path.join("|"))); raw = v
    }
    const original = node.nodeValue || ""; const multi = raw.includes("\n"); const tid = traceId(cand); let aiMeta: { prompt: string; before: string; model: string } | null = null; let aiBusy = false
    const before = document.createTextNode(original.slice(0, start)), after = document.createTextNode(original.slice(end)), span = document.createElement("span")
    span.textContent = raw; span.setAttribute("data-studio-inline", ""); span.setAttribute("contenteditable", "plaintext-only"); span.setAttribute("spellcheck", "false")
    span.style.cssText = "outline:2px solid #a87c12;outline-offset:3px;border-radius:2px;cursor:text;min-width:1ch;display:inline" + (multi ? ";white-space:pre-wrap" : "")
    setHover(null); node.replaceWith(before, span, after); span.focus()
    try { const d: any = document; const r: Range | null = d.caretRangeFromPoint ? d.caretRangeFromPoint(x, y) : null; const sel = window.getSelection(); if (sel) { if (r && span.contains(r.startContainer)) { sel.removeAllRanges(); sel.addRange(r) } else { const rg = document.createRange(); rg.selectNodeContents(span); rg.collapse(false); sel.removeAllRanges(); sel.addRange(rg) } } } catch { /* ignore */ }
    return await new Promise<boolean>(resolve => {
      let done = false
      // pastille d'assistance : apparaît quand le texte ressemble à une consigne ; Entrée l'envoie à Claude, Échap la garde comme texte
      const chip = document.createElement("div"); chip.setAttribute("data-studio-ui", ""); chip.style.cssText = "position:fixed;z-index:2147483000;display:none;padding:6px 10px;border-radius:999px;font:600 12px system-ui,sans-serif;background:#2b2b2d;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.35);max-width:90vw"; document.body.appendChild(chip)
      let chipOn = false
      const place = () => { const r = span.getBoundingClientRect(); chip.style.left = Math.max(8, Math.min(window.innerWidth - 330, r.left)) + "px"; chip.style.top = Math.min(window.innerHeight - 40, r.bottom + 10) + "px" }
      const refreshChip = () => { if (aiBusy || h.kind === "html") return; const t = (span.textContent || "").replace(MARK_RE, ""); chipOn = looksLikeInstruction(t) && t.trim() !== raw.trim(); if (!chipOn) { chip.style.display = "none"; return }
        chip.style.display = "block"; place(); chip.innerHTML = aiOn === false ? "IA indisponible : ANTHROPIC_API_KEY absente de ce studio" : `<span style="color:#f3d98b">✨</span> ${multi ? "⌘/Ctrl + ↵" : "↵"} envoyer à l'IA · <span style="opacity:.75">Échap : garder comme texte</span>` }
      const runAi = async () => {
        if (!chipOn || aiOn === false) return false; aiBusy = true; const instr = (span.textContent || "").replace(MARK_RE, "").replace(/\u2060/g, "").replace(/^\s*\//, "").trim()
        chip.style.display = "block"; place(); chip.textContent = "✨ Claude écrit…"; span.setAttribute("contenteditable", "false")
        try {
          const r = await studioApi<{ text: string; model: string }>("/api/studio/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instruction: instr, original: raw, multiline: multi, context: `${routeKey()} · ${humanize(cand.key)} › ${cand.path.filter(q => !isIdx(q)).map(humanize).join(" › ")}` }) })
          span.textContent = r.text; aiMeta = { prompt: instr, before: raw, model: r.model }; aiBusy = false; chip.style.display = "none"; finish(true)
        } catch (e) { aiBusy = false; setToast(e instanceof Error ? e.message : String(e)); span.setAttribute("contenteditable", "plaintext-only"); span.focus(); refreshChip() }
        return true
      }
      span.addEventListener("input", refreshChip)
      const finish = async (save: boolean) => {
        if (done || aiBusy) return; done = true; chip.remove(); span.removeEventListener("input", refreshChip)
        span.removeEventListener("keydown", key); span.removeEventListener("keyup", keyup); span.removeEventListener("blur", blur); span.removeEventListener("paste", paste); span.removeEventListener("click", stop)
        const value = (span.textContent || "").replace(MARK_RE, "").replace(/\u2060/g, "")
        span.replaceWith(node); before.remove(); after.remove(); node.nodeValue = original // on rend à React son nœud tel qu'il l'avait
        if (save && value !== raw) {
          let scope: Cand[] = []
          if (others.length && window.confirm(`Cette valeur sert aussi à ${others.length} autre(s) endroit(s) (société, catégorie, étiquette…).\n\nOK : la changer partout.\nAnnuler : la changer seulement ici.`)) scope = others
          setBusy("Enregistrement…")
          try {
            if (h.kind === "html") { const root = parent.closest("[data-html]") as HTMLElement; node.nodeValue = original.slice(0, start) + value + original.slice(end); await saveHtml(root) }
            else { for (const c of [cand, ...scope]) { await post("/api/studio/patch", { key: c.key, op: "set", path: c.path, value }); cache.current.delete(c.key) } node.nodeValue = original.slice(0, start) + value + marker + original.slice(end + marker.length); router.refresh() }
            if (h.kind !== "html") {
              if (aiMeta) { const am = aiMeta as { prompt: string; before: string; model: string }; await post("/api/studio/ai-trace", { op: "set", id: tid, entry: { prompt: am.prompt, before: am.before, after: value, model: am.model } }); setTraces(t => ({ ...t, [tid]: { prompt: am.prompt, before: am.before, after: value, at: new Date().toISOString(), model: am.model, status: "ai" } })) }
              else if (traces[tid] && traces[tid].status === "ai") { await post("/api/studio/ai-trace", { op: "edited", id: tid, after: value }).catch(() => {}); setTraces(t => ({ ...t, [tid]: { ...t[tid], status: "edited", after: value } })) }
            }
            chg.refresh(); setToast(aiMeta ? "Texte généré par Claude : survolez-le pour revoir la demande" : "Brouillon enregistré"); setTimeout(rescan, 800)
          } catch (e) { node.nodeValue = original; setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
        }
        resolve(true)
      }
      const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); finish(false) } else if (e.key === "Enter") { if (!multi || e.metaKey || e.ctrlKey) { e.preventDefault(); if (chipOn && aiOn !== false) runAi(); else finish(true) } else if (parent.closest("button,a")) e.stopPropagation() } else if (e.key === " ") e.stopPropagation() }
      const keyup = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation() } } // pas de « clic » involontaire sur un bouton ou un lien
      const stop = (e: Event) => { e.preventDefault(); e.stopPropagation() }
      const blur = () => { if (aiBusy) return; finish(true) }
      const paste = (e: ClipboardEvent) => { e.preventDefault(); document.execCommand("insertText", false, (e.clipboardData?.getData("text/plain") || "").replace(multi ? /$^/ : /\s*\n\s*/g, " ")) }
      span.addEventListener("keydown", key); span.addEventListener("keyup", keyup); span.addEventListener("blur", blur); span.addEventListener("paste", paste); span.addEventListener("click", stop)
    })
  }

  // texte d'attribut (alt, title, placeholder, aria-label) : invisible dans la page, donc petit champ posé sur l'élément, même gestes (Entrée / Échap / clic ailleurs)
  const inlineAttr = async (a: AttrTarget) => {
    const data = await content(a.key); const raw = getAt(data, a.path); if (typeof raw !== "string") { setToast("Ce champ n'est pas du texte simple (voir le formulaire)."); return }
    const r = a.el.getBoundingClientRect(); const inp = document.createElement("input"); inp.setAttribute("data-studio-ui", ""); inp.value = raw; inp.setAttribute("aria-label", "Texte " + a.attr)
    inp.style.cssText = `position:fixed;z-index:2147483000;left:${Math.max(8, Math.min(window.innerWidth - 328, r.left))}px;top:${Math.max(8, Math.min(window.innerHeight - 44, r.top + Math.min(r.height, 40) / 2 - 14))}px;width:${Math.min(420, Math.max(240, r.width))}px;max-width:calc(100vw - 16px);padding:6px 10px;font:14px system-ui,sans-serif;border:2px solid #a87c12;border-radius:8px;background:#fff;color:#111;box-shadow:0 6px 24px rgba(0,0,0,.3)`
    document.body.appendChild(inp); setChip(null); setImgHover(null); setHover(null); inp.focus(); inp.select()
    let done = false
    const finish = async (save: boolean) => {
      if (done) return; done = true; const v = inp.value; inp.remove()
      if (!save || v === raw) return
      setBusy("Enregistrement…")
      try { await post("/api/studio/patch", { key: a.key, op: "set", path: a.path, value: v }); cache.current.delete(a.key); a.el.setAttribute(a.attr, v + a.marker); chg.refresh(); setToast("Brouillon enregistré"); router.refresh() }
      catch (e) { setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
    }
    inp.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); finish(true) } else if (e.key === "Escape") { e.preventDefault(); finish(false) } })
    inp.addEventListener("blur", () => { finish(true) })
  }

  const saveText = async () => {
    if (!editing) return; const { value, targets, all, scope, apply, custom } = editing; setBusy("Enregistrement…")
    try {
      if (custom) { await custom(value); setEditing(null); setHover(null); setToast("Brouillon enregistré"); setTimeout(rescan, 400); return }
      for (const c of [...targets, ...(scope === "all" ? all : [])]) { await post("/api/studio/patch", { key: c.key, op: "set", path: c.path, value }); cache.current.delete(c.key) }
      apply(value); setEditing(null); setHover(null); chg.refresh(); setToast("Brouillon enregistré"); router.refresh() // l'aperçu immédiat est recalé par le rendu du serveur (majuscules, troncatures…)
      setTimeout(rescan, 800)
    } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }
  // traces de l'IA : annuler / marquer comme relu (studio seulement)
  const undoAi = async (c: Cand) => {
    const id = traceId(c), t = traces[id]; if (!t) return; if (!window.confirm("Rétablir le texte d'avant la demande à l'IA ?")) return; setBusy("…")
    try { await post("/api/studio/patch", { key: c.key, op: "set", path: c.path, value: t.before }); cache.current.delete(c.key); await post("/api/studio/ai-trace", { op: "remove", id }); setTraces(x => { const n = { ...x }; delete n[id]; return n }); chg.refresh(); router.refresh(); setHover(null); setTimeout(rescan, 800) }
    catch (e) { setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }
  const reviewAi = async (c: Cand) => { const id = traceId(c); try { await post("/api/studio/ai-trace", { op: "review", id }); setTraces(x => ({ ...x, [id]: { ...x[id], status: "reviewed" } })) } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } }
  const aiHits = useMemo(() => { void aiTick; if (!Object.keys(traces).length) return [] as { rects: Rect[]; status: string }[]; const out: { rects: Rect[]; status: string }[] = []; for (const h of hits.current) { if (h.kind === "html") continue; const t = traces[traceId(resolveCand(h))]; if (t && t.status !== "reviewed" && traceOk(t, h)) out.push({ rects: rectsOf(h), status: t.status }) } return out }, [traces, aiTick, resolveCand])
  const itemOp = async (op: "duplicate" | "remove" | "up" | "down") => {
    if (!hover || !cur) return
    if (op === "remove" && !window.confirm(`Supprimer « ${itemTitleText || "cet élément"} » ?`)) return
    setBusy("…"); const i = +cur.prefix[cur.prefix.length - 1]
    try {
      if (op === "up" || op === "down") await post("/api/studio/patch", { key: hover.cand.key, op: "move", path: cur.prefix, to: op === "up" ? i - 1 : i + 1 })
      else await post("/api/studio/patch", { key: hover.cand.key, op: op === "remove" ? "remove" : "duplicate", path: cur.prefix })
      location.reload()
    } catch (e) { setToast(e instanceof Error ? e.message : String(e)); setBusy("") }
  }
  const replaceImage = async (file: File) => {
    if (!imgHover) return; setBusy("Envoi de l'image…")
    try {
      if (imgHover.inHtml) { // image d'une section copiée : le HTML de la section est mis à jour
        const fd = new FormData(); fd.append("file", file); const up = await studioApi<{ path: string }>("/api/studio/upload", { method: "POST", body: fd })
        const root = imgHover.el.closest("[data-html]") as HTMLElement; imgHover.el.setAttribute("src", up.path); imgHover.el.removeAttribute("srcset"); await saveHtml(root); setImgHover(null); setBusy(""); return
      }
      if (imgHover.paths.length) { // image référencée par les données : nouvelle image, chemins mis à jour
        const fd = new FormData(); fd.append("file", file); const up = await studioApi<{ path: string }>("/api/studio/upload", { method: "POST", body: fd })
        for (const p of imgHover.paths) await post("/api/studio/patch", { key: p.key, op: "set", path: p.path, value: up.path })
      } else if (imgHover.asset) { // image fixe du site : même chemin, nouveau fichier
        const fd = new FormData(); fd.append("file", file); await studioApi(`/api/studio/upload?replace=${encodeURIComponent(imgHover.asset)}`, { method: "POST", body: fd })
      }
      location.reload()
    } catch (e) { setToast(e instanceof Error ? e.message : String(e)); setBusy("") }
  }

  // ---------- sections : ordre, masquage, réglages, ajout, suppression ----------
  const loadRules = async (): Promise<{ route: string; rules: Record<string, Rule>; hasRoute: boolean }> => {
    const l = await studioApi<{ draft: { rules: Record<string, Record<string, Rule>> } }>("/api/studio/content/layout?draftOnly=1"); const route = routeKey()
    return { route, rules: l.draft.rules[route] || {}, hasRoute: route in l.draft.rules }
  }
  const putRule = async (route: string, hasRoute: boolean, sel: string, rule: Rule) => {
    if (!hasRoute) await post("/api/studio/patch", { key: "layout", op: "put", path: ["rules", route], value: {} })
    if (Object.keys(rule).length) await post("/api/studio/patch", { key: "layout", op: "put", path: ["rules", route, sel], value: rule })
    else await post("/api/studio/patch", { key: "layout", op: "remove", path: ["rules", route, sel] }).catch(() => {})
  }
  const effectiveOrder = (rules: Record<string, Rule>, els: HTMLElement[]) => els.map((el, i) => ({ el, sel: selOf(el), order: rules[selOf(el)]?.order ?? (i + 1) * 10, i })).sort((a, b) => a.order - b.order || a.i - b.i)
  const writeOrders = async (route: string, rules: Record<string, Rule>, hasRoute: boolean, list: { sel: string }[]) => {
    let has = hasRoute
    for (let k = 0; k < list.length; k++) { await putRule(route, has, list[k].sel, { ...(rules[list[k].sel] || {}), order: (k + 1) * 10 }); has = true }
  }
  const afterBlockChange = (keepUi = false) => { chg.refresh(); router.refresh(); setTimeout(() => { if (!keepUi) { setBlk(null); setSettings(null); setPicker(null) } refreshSections() }, 700) }
  const refreshSections = useCallback(() => { setSections(blockEls().map(el => ({ el, sel: selOf(el), name: blockName(el), hidden: getComputedStyle(el).display === "none", custom: !!el.dataset.cb }))) }, [])
  const moveBlock = async (el: HTMLElement, dir: -1 | 1) => {
    setBusy("…")
    try {
      const { route, rules, hasRoute } = await loadRules(); const list = effectiveOrder(rules, blockEls()); const i = list.findIndex(x => x.el === el); const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) { setBusy(""); return }
      ;[list[i], list[j]] = [list[j], list[i]]; await writeOrders(route, rules, hasRoute, list); afterBlockChange()
    } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }
  const setRule = async (el: HTMLElement, patch: (r: Rule) => Rule, keepUi = false) => {
    try { const { route, rules, hasRoute } = await loadRules(); const sel = selOf(el); await putRule(route, hasRoute, sel, patch(rules[sel] || {})); afterBlockChange(keepUi) } catch (e) { setToast(e instanceof Error ? e.message : String(e)) }
  }
  type PagesData = { pages: { slug: string; blocks: { id: string; [k: string]: unknown }[] }[]; extras: Record<string, { id: string; [k: string]: unknown }[]> }
  const loadPages = async () => (await studioApi<{ draft: PagesData }>("/api/studio/content/pages?draftOnly=1")).draft
  const findBlock = async (id: string) => {
    const pages = await loadPages(); const route = routeKey(); const custom = route.match(/^\/p\/([^/]+)$/)
    if (custom) { const pi = pages.pages.findIndex(p => p.slug === custom[1]); const bi = pages.pages[pi]?.blocks.findIndex(b => b.id === id); return bi >= 0 ? { path: ["pages", String(pi), "blocks", String(bi)], block: pages.pages[pi].blocks[bi] } : null }
    const bi = pages.extras[route]?.findIndex(b => b.id === id); return bi >= 0 ? { path: ["extras", route, String(bi)], block: pages.extras[route][bi] } : null
  }
  const saveHtml = async (root: HTMLElement) => { const f = await findBlock(root.dataset.cb || ""); if (!f) throw new Error("Section introuvable"); await post("/api/studio/patch", { key: "pages", op: "set", path: [...f.path, "html"], value: root.innerHTML }); chg.refresh() }
  const openHtmlText = (hit: Hit, rects: Rect[]) => {
    const root = hit.node.parentElement?.closest("[data-html]") as HTMLElement | null; if (!root) return; const raw = (hit.node.nodeValue || "").slice(hit.start, hit.end)
    setEditing({ rects, value: raw, multiline: raw.length > 90, targets: [], all: [], scope: "one", title: "Texte de la section copiée", apply: () => {}, custom: async v => { const cur = hit.node.nodeValue || ""; hit.node.nodeValue = cur.slice(0, hit.start) + v + cur.slice(hit.end); await saveHtml(root) } })
  }
  // insertion d'une section (vierge, copiée ou reprise d'une autre page) après un bloc, avec renumérotation de l'ordre
  const insertBlock = async (after: HTMLElement, block: Record<string, unknown>) => {
    setPicker(null); setLibrary(null); setBusy("Ajout de la section…")
    try {
      const id = String(block.id); const route = routeKey(); const pages = await loadPages(); const custom = route.match(/^\/p\/([^/]+)$/)
      if (custom) { const idx = pages.pages.findIndex(p => p.slug === custom[1]); if (idx < 0) throw new Error("Page introuvable"); await post("/api/studio/patch", { key: "pages", op: "insert", path: ["pages", String(idx), "blocks"], value: block }) }
      else { if (!(route in pages.extras)) await post("/api/studio/patch", { key: "pages", op: "put", path: ["extras", route], value: [] }); await post("/api/studio/patch", { key: "pages", op: "insert", path: ["extras", route], value: block }) }
      const { rules, hasRoute } = await loadRules(); const list = effectiveOrder(rules, blockEls()).map(x => ({ sel: x.sel, el: x.el })); const at = list.findIndex(x => x.el === after)
      list.splice(at + 1, 0, { sel: `[data-cb="${id}"]`, el: null as any }); await writeOrders(route, rules, hasRoute, list); afterBlockChange()
      setTimeout(() => { if (!document.querySelector(`[data-cb="${id}"]`)) setToast("La section est enregistrée mais cette page ne sait pas encore l'afficher.") }, 3500)
    } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }
  const addSection = (after: HTMLElement, type: string) => insertBlock(after, BLOCK_TYPES.find(b => b.type === type)!.make(newId()))
  // section écrite par Claude : la demande part à l'IA, le bloc validé est inséré, chaque texte garde sa trace (demande + « à relire »)
  const generateSection = async (after: HTMLElement, prompt: string, type: string) => {
    setBusy("Claude écrit la section…")
    try {
      const prev = (after.innerText || "").replace(/[\u2060\u200b-\u200d]/g, "").replace(/\s+/g, " ").slice(0, 600)
      const r = await studioApi<{ block: Record<string, unknown>; model: string }>("/api/studio/ai/section", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, type, context: `${routeKey()} · section précédente : ${prev}` }) })
      const block = { id: newId(), ...r.block }; setAiDlg(null); await insertBlock(after, block)
      const f = await findBlock(String(block.id)); if (!f) return
      const items: { id: string; entry: { prompt: string; before: string; after: string; model: string } }[] = []
      const SKIP = new Set(["id", "type", "image", "side", "columns", "link", "alt"])
      const walkB = (o: unknown, pre: string[]) => { if (typeof o === "string") { if (o.trim()) items.push({ id: traceId({ key: "pages", path: [...f.path, ...pre] }), entry: { prompt, before: "", after: o, model: r.model } }) } else if (Array.isArray(o)) o.forEach((x, i) => walkB(x, [...pre, String(i)])); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!SKIP.has(k)) walkB(v, [...pre, k]) }
      walkB(r.block, [])
      await post("/api/studio/ai-trace", { op: "setMany", items }); setTraces(t => { const n = { ...t }; for (const it of items) n[it.id] = { ...it.entry, at: new Date().toISOString(), status: "ai" }; return n }); setToast("Section écrite par Claude : à relire (soulignée en violet)"); setTimeout(() => { cache.current.delete("pages"); buildIndexes().then(() => rescan()) }, 1800) // les nouveaux textes entrent dans l'index des valeurs
    } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }
  // copier / coller : une section déjà affichée est reprise telle quelle (même HTML, mêmes classes) ; une section ajoutée est clonée avec ses données
  const buildClip = async (el: HTMLElement): Promise<Clip> => {
    const label = `${blockName(el)} · ${routeKey()}`
    if (el.hasAttribute("data-html")) return { kind: "html", label, html: snapshotElement(el).replace(/^<div>([\s\S]*)<\/div>$/, "$1") }
    if (el.dataset.cb) { const f = await findBlock(el.dataset.cb); if (f) return { kind: "data", label, block: f.block } }
    return { kind: "html", label, html: snapshotElement(el) }
  }
  const clipToBlock = (c: Clip): Record<string, unknown> => c.kind === "data" ? { ...(c.block as object), id: newId() } : { id: newId(), type: "html", html: c.html, source: c.label }
  const copySection = async (el: HTMLElement) => { try { const c = await buildClip(el); localStorage.setItem("studio-clip", JSON.stringify(c)); setClip(c); setToast("Section copiée — « Coller » dans la barre « Section » ou la pastille, sur n'importe quelle page") } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } }
  const pasteAfter = (el: HTMLElement, c: Clip | null = clip) => { if (!c) { setToast("Rien à coller : copiez d'abord une section."); return } return insertBlock(el, clipToBlock(c)) }
  const duplicateSection = async (el: HTMLElement) => { try { await pasteAfter(el, await buildClip(el)) } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } }
  const deleteBlock = async (el: HTMLElement) => {
    if (!el.dataset.cb || !window.confirm("Supprimer cette section ?")) return
    setBusy("…")
    try {
      const id = el.dataset.cb; const route = routeKey(); const pages = (await studioApi<{ draft: { pages: { slug: string; blocks: { id: string }[] }[]; extras: Record<string, { id: string }[]> } }>("/api/studio/content/pages?draftOnly=1")).draft
      const custom = route.match(/^\/p\/([^/]+)$/)
      if (custom) { const pi = pages.pages.findIndex(p => p.slug === custom[1]); const bi = pages.pages[pi]?.blocks.findIndex(b => b.id === id); if (pi >= 0 && bi >= 0) await post("/api/studio/patch", { key: "pages", op: "remove", path: ["pages", String(pi), "blocks", String(bi)] }) }
      else { const bi = pages.extras[route]?.findIndex(b => b.id === id); if (bi >= 0) await post("/api/studio/patch", { key: "pages", op: "remove", path: ["extras", route, String(bi)] }) }
      const { route: r, hasRoute } = await loadRules(); if (hasRoute) await post("/api/studio/patch", { key: "layout", op: "remove", path: ["rules", r, selOf(el)] }).catch(() => {})
      afterBlockChange()
    } catch (e) { setToast(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }

  if (!ready) return null
  const ui = (
    <div data-studio-ui className="studio-ui" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2147483000, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {on && hover && hover.rects.map((r, i) => <div key={i} style={{ position: "fixed", left: r.left - 2, top: r.top - 1, width: r.width + 4, height: r.height + 2, background: "rgba(168,124,18,.14)", outline: "1px dashed #a87c12", borderRadius: 2 }} />)}
      {on && aiHits.flatMap((a, i) => a.rects.map((r, k) => <div key={`ai${i}-${k}`} data-studio-ui style={{ position: "fixed", left: r.left, top: r.top + r.height - 1, width: r.width, height: 0, borderBottom: `2px dotted ${a.status === "edited" ? "#8a8a93" : "#8b5cf6"}`, pointerEvents: "none", zIndex: 40 }} />))}
      {on && hover && !editing && traces[traceId(hover.cand)] && traceOk(traces[traceId(hover.cand)], hover.hit) && (() => { const c = hover.cand, t = traces[traceId(c)], r = hover.rects[0]; if (!r) return null; return (
        <div data-studio-ui onMouseEnter={() => { keepToolbar.current = true }} onMouseLeave={() => { keepToolbar.current = false }} style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 360, r.left)), top: Math.min(window.innerHeight - 200, r.top + r.height + 8), width: 340, zIndex: 2147483000 }} className="rounded-lg border border-border bg-background p-3 text-xs shadow-xl">
          <div className="mb-1 font-semibold">✨ {t.status === "ai" ? "Écrit par Claude (à relire)" : t.status === "edited" ? "Écrit par Claude, modifié depuis" : "Écrit par Claude, relu"}</div>
          <div className="text-muted-foreground">Votre demande :</div><div className="mb-2 rounded bg-muted p-2">{t.prompt}</div>
          {t.before && <div className="mb-2 text-muted-foreground">Avant : <span className="italic">{t.before.slice(0, 140)}{t.before.length > 140 ? "…" : ""}</span></div>}
          <div className="flex gap-2"><button className="rounded-md border border-border px-2 py-1 hover:border-foreground/50" onClick={() => undoAi(c)}>Annuler l&apos;IA</button>{t.status !== "reviewed" && <button className="rounded-md border border-border px-2 py-1 hover:border-foreground/50" onClick={() => reviewAi(c)}>Marquer comme relu</button>}</div>
        </div>) })()}
      {on && hover && itemRect && cur && !editing && (
        <>
          <div style={{ position: "fixed", left: itemRect.left - 6, top: itemRect.top - 6, width: itemRect.width + 12, height: itemRect.height + 12, border: "1px dashed rgba(31,93,110,.55)", borderRadius: 6 }} />
          <div onPointerEnter={() => { keepToolbar.current = true; if (clearT.current) clearTimeout(clearT.current) }} onPointerLeave={() => { keepToolbar.current = false }} style={{ position: "fixed", left: Math.max(8, itemRect.left - 6), top: Math.max(8, itemRect.top - 40), pointerEvents: "auto" }}
            className="flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-1 text-xs text-foreground shadow-lg">
            {levels.length > 1 && <button className="rounded px-1 hover:bg-muted" title="Choisir le niveau" onClick={() => setLevel((level ?? levels.length - 1) > 0 ? (level ?? levels.length - 1) - 1 : levels.length - 1)}>↰</button>}
            <span className="max-w-[160px] truncate px-1 font-medium">{cur.label}{itemTitleText ? ` · ${itemTitleText}` : ""}</span>
            <button className="rounded p-1 hover:bg-muted" title="Monter" onClick={() => itemOp("up")}><ChevronUp className="h-3.5 w-3.5" /></button>
            <button className="rounded p-1 hover:bg-muted" title="Descendre" onClick={() => itemOp("down")}><ChevronDown className="h-3.5 w-3.5" /></button>
            <button className="rounded p-1 hover:bg-muted" title="Dupliquer (ajouter une copie)" onClick={() => itemOp("duplicate")}><Copy className="h-3.5 w-3.5" /></button>
            <button className="rounded p-1 text-red-500 hover:bg-muted" title="Supprimer" onClick={() => itemOp("remove")}><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </>
      )}
      {on && imgHover && !editing && (
        <div onPointerEnter={() => { keepToolbar.current = true }} onPointerLeave={() => { keepToolbar.current = false; setImgHover(null) }} style={{ position: "fixed", left: Math.max(8, imgHover.rect.left + imgHover.rect.width - 200), top: imgHover.rect.top + 8, pointerEvents: "auto" }} className="flex gap-1.5">
          {(imgHover.paths.length > 0 || imgHover.asset || imgHover.inHtml) && <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs shadow-lg hover:border-foreground/50" onClick={() => fileRef.current?.click()}><ImagePlus className="h-3.5 w-3.5" />Remplacer l&apos;image</button>}
          {imgHover.alt && <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs shadow-lg hover:border-foreground/50" onClick={() => openAttr(imgHover.alt!)}><Type className="h-3.5 w-3.5" />Texte alternatif</button>}
          <input ref={fileRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) replaceImage(f) }} />
        </div>
      )}
      {on && chip && !editing && (
        <div onPointerEnter={() => { keepToolbar.current = true }} onPointerLeave={() => { keepToolbar.current = false; setChip(null) }} style={{ position: "fixed", left: Math.max(8, chip.rect.left), top: Math.max(8, chip.rect.top - 26), pointerEvents: "auto" }}>
          <button className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] shadow-lg hover:border-foreground/50" onClick={() => openAttr(chip.t)}><Pencil className="h-3 w-3" />{chip.t.attr === "alt" ? "texte alternatif" : chip.t.attr === "placeholder" ? "texte d'aide" : chip.t.attr === "title" ? "info-bulle" : "libellé accessible"}</button>
        </div>
      )}
      {on && blk && !editing && !settings && !picker && !library && blk.rect.top + blk.rect.height > 30 && blk.rect.top + blk.rect.height < window.innerHeight - 10 && (
        <div onPointerEnter={() => { keepToolbar.current = true }} onPointerLeave={() => { keepToolbar.current = false }} style={{ position: "fixed", left: blk.rect.left, width: blk.rect.width, top: blk.rect.top + blk.rect.height - 12, height: 24, pointerEvents: "auto" }} className="group flex items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-foreground/30" />
          <button className="relative inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium shadow-lg hover:bg-muted" onClick={() => setPicker({ el: blk.el, rect: { left: blk.rect.left + blk.rect.width / 2 - 155, top: blk.rect.top + blk.rect.height - 330, width: 0, height: 0 } })}><Plus className="h-3.5 w-3.5" />Ajouter une section ici</button>
        </div>)}
      {on && blk && !editing && !settings && !picker && !library && (() => { const r = blk.rect; const custom = !!blk.el.dataset.cb; return (
        <div onPointerEnter={() => { keepToolbar.current = true }} onPointerLeave={() => { keepToolbar.current = false }} style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 230, r.left + r.width - 226)), top: Math.max(8, Math.min(r.top + 6, r.top + r.height - 34)), pointerEvents: "auto" }}
          className="flex items-center gap-0.5 rounded-md border border-border bg-background px-1 py-0.5 text-foreground shadow-lg">
          <GripHorizontal className="mx-1 h-3.5 w-3.5 text-muted-foreground" /><span className="mr-1 text-[11px] text-muted-foreground">Section</span>
          <button className="rounded p-1 hover:bg-muted" title="Réglages : fond, espacement, largeur, alignement" onClick={async () => { const { rules } = await loadRules(); setSettings({ el: blk.el, sel: selOf(blk.el), rule: rules[selOf(blk.el)] || {}, rect: { left: r.left + r.width - 270, top: r.top, width: 0, height: 0 } }) }}><Settings2 className="h-3.5 w-3.5" /></button>
          <button className="rounded p-1 hover:bg-muted" title="Monter la section" onClick={() => moveBlock(blk.el, -1)}><ArrowUp className="h-3.5 w-3.5" /></button>
          <button className="rounded p-1 hover:bg-muted" title="Descendre la section" onClick={() => moveBlock(blk.el, 1)}><ArrowDown className="h-3.5 w-3.5" /></button>
          <button className="rounded p-1 hover:bg-muted" title="Copier cette section (à coller sur n'importe quelle page)" onClick={() => copySection(blk.el)}><Copy className="h-3.5 w-3.5" /></button>
          <button className="rounded p-1 hover:bg-muted" title="Dupliquer cette section juste après" onClick={() => duplicateSection(blk.el)}><CopyPlus className="h-3.5 w-3.5" /></button>
          {clip && <button className="rounded p-1 hover:bg-muted" title={`Coller après celle-ci : ${clip.label}`} onClick={() => pasteAfter(blk.el)}><ClipboardPaste className="h-3.5 w-3.5" /></button>}
          <button className="rounded p-1 hover:bg-muted" title="Masquer la section (réversible depuis « Sections »)" onClick={() => setRule(blk.el, x => ({ ...x, hidden: true }))}><EyeOff className="h-3.5 w-3.5" /></button>
          <button className="inline-flex items-center gap-0.5 rounded bg-foreground px-1.5 py-0.5 text-[11px] text-background" title="Ajouter une section après celle-ci" onClick={() => setPicker({ el: blk.el, rect: { left: r.left + r.width - 320, top: r.top, width: 0, height: 0 } })}><Plus className="h-3 w-3" />Section</button>
          {custom && <button className="rounded p-1 text-red-500 hover:bg-muted" title="Supprimer cette section" onClick={() => deleteBlock(blk.el)}><Trash2 className="h-3.5 w-3.5" /></button>}
        </div>) })()}
      {settings && <SectionSettings rule={settings.rule} rect={settings.rect} onClose={() => setSettings(null)} onChange={r => { setSettings({ ...settings, rule: r }); setRule(settings.el, () => r, true) }} />}
      {picker && <SectionPicker rect={picker.rect} clip={clip} onClose={() => setPicker(null)} onPick={t => addSection(picker.el, t)} onPaste={() => pasteAfter(picker.el)} onLibrary={() => { setLibrary({ el: picker.el, rect: picker.rect }); setPicker(null) }} onAi={aiOn === false ? undefined : () => { setAiDlg({ el: picker.el, rect: picker.rect }); setPicker(null) }} />}
      {aiDlg && <AiPromptDialog rect={aiDlg.rect} title="Écrire une section avec Claude" hint="Ex. : une section « Ce que j'ai appris du hockey » en trois cartes, ton direct" withType busy={!!busy} onSubmit={(pr, ty) => generateSection(aiDlg.el, pr, ty)} onClose={() => setAiDlg(null)} />}
      {library && <SectionLibrary rect={library.rect} onClose={() => setLibrary(null)} onPick={(html, label) => insertBlock(library.el, { id: newId(), type: "html", html, source: label })} />}
      {panel === "theme" && <ThemePanel onClose={() => setPanel(null)} onSaved={() => chg.refresh()} />}
      {panel === "pages" && <PagesPanel onClose={() => setPanel(null)} onChanged={g => { chg.refresh(); if (g) location.href = g; else router.refresh() }} />}
      {panel === "sections" && (
        <div data-studio-ui style={{ position: "fixed", right: 14, bottom: 64, width: 320, maxHeight: "70vh", pointerEvents: "auto" }} className="flex flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-sm font-medium">Sections de cette page<button onClick={() => setPanel(null)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button></div>
          <div className="space-y-1 overflow-y-auto p-2">{sections.length === 0 && <p className="p-2 text-xs text-muted-foreground">Aucune section détectée sur cette page.</p>}
            {sections.map(sx => (<div key={sx.sel} className={`flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs ${sx.hidden ? "opacity-50" : ""}`}><span className="flex-1 truncate">{sx.name}{sx.custom ? " ·ajoutée" : ""}</span>
              <button className="rounded p-1 hover:bg-muted" onClick={() => moveBlock(sx.el, -1)} title="Monter"><ArrowUp className="h-3.5 w-3.5" /></button><button className="rounded p-1 hover:bg-muted" onClick={() => moveBlock(sx.el, 1)} title="Descendre"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button className="rounded p-1 hover:bg-muted" onClick={() => setRule(sx.el, x => ({ ...x, hidden: !sx.hidden }))} title={sx.hidden ? "Afficher" : "Masquer"}>{sx.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button></div>))}</div>
        </div>
      )}
      {editing && (
        <div style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 440, editing.rects[0]?.left ?? 40)), top: Math.min(window.innerHeight - 250, (editing.rects[editing.rects.length - 1]?.top ?? 80) + (editing.rects[editing.rects.length - 1]?.height ?? 20) + 8), width: 430, pointerEvents: "auto" }}
          className="rounded-lg border border-border bg-background p-3 shadow-2xl" onKeyDown={e => { if (e.key === "Escape") setEditing(null) }}>
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground"><span className="truncate">{editing.title}</span>
            <a className="inline-flex items-center gap-1 underline" href="/studio" target="_blank" rel="noreferrer">formulaire <ExternalLink className="h-3 w-3" /></a></div>
          <textarea autoFocus className="w-full resize-y rounded-md border border-border bg-background px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-foreground/60" rows={editing.multiline ? 6 : 2} value={editing.value}
            onChange={e => setEditing({ ...editing, value: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter" && (!editing.multiline || e.metaKey || e.ctrlKey)) { e.preventDefault(); saveText() } }} />
          {editing.all.length > 0 && (
            <label className="mt-2 flex items-start gap-2 text-[11px] text-muted-foreground"><input type="checkbox" className="mt-0.5" checked={editing.scope === "all"} onChange={e => setEditing({ ...editing, scope: e.target.checked ? "all" : "one" })} />
              <span>Appliquer aussi aux {editing.all.length} autre(s) occurrence(s) de cette valeur (société, catégorie, étiquette… : ce champ sert aussi de lien entre les contenus).</span></label>
          )}
          <div className="mt-2 flex items-center gap-2"><button className="inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-50" disabled={!!busy} onClick={saveText}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}Enregistrer</button>
            <button className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs" onClick={() => setEditing(null)}><X className="h-3.5 w-3.5" />Annuler</button>
            <span className="ml-auto text-[11px] text-muted-foreground">{editing.multiline ? "⌘/Ctrl + Entrée" : "Entrée"} pour enregistrer</span></div>
        </div>
      )}
      <div style={{ position: "fixed", right: 14, bottom: 14, pointerEvents: "auto" }} className="flex items-center gap-1.5 rounded-full border border-border bg-background py-1.5 pl-2 pr-2 text-xs shadow-lg">
        <button className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium ${on ? "bg-foreground text-background" : "hover:bg-muted"}`} onClick={toggle} title="Activer / désactiver l'édition directe"><Pencil className="h-3.5 w-3.5" />{on ? "Édition active" : "Éditer le site"}</button>
        <button className="rounded-full px-2.5 py-1.5 hover:bg-muted" onClick={() => { chg.refresh(); setShowChanges(true) }}>{chg.changes.length ? <><span className="mr-1 inline-block rounded-full bg-amber-500 px-1.5 text-[10px] text-white">{chg.changes.length}</span>à publier</> : "Aucune modification"}</button>
        <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted disabled:opacity-40" disabled={!chg.changes.length} onClick={() => { chg.refresh(); setShowChanges(true) }}><Upload className="h-3.5 w-3.5" />Publier</button>
        <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted" title="Ajouter une section à la fin de la page" onClick={() => { const bl = blockEls(); const last = [...bl].reverse().find(e => e.tagName !== "FOOTER") || bl[bl.length - 1]; if (!last) { setToast("Cette page n'a pas de zone de sections."); return } setPicker({ el: last, rect: { left: window.innerWidth - 330, top: window.innerHeight - 440, width: 0, height: 0 } }) }}><Plus className="h-3.5 w-3.5" />Section</button>
        {clip && <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted" title={`Coller à la fin de la page : ${clip.label}`} onClick={() => { const bl = blockEls(); const last = [...bl].reverse().find(e => e.tagName !== "FOOTER") || bl[bl.length - 1]; if (last) pasteAfter(last) }}><ClipboardPaste className="h-3.5 w-3.5" />Coller</button>}
        <button className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted ${panel === "theme" ? "bg-muted" : ""}`} onClick={() => setPanel(panel === "theme" ? null : "theme")} title="Couleurs, arrondi, police"><Palette className="h-3.5 w-3.5" />Thème</button>
        <button className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted ${panel === "sections" ? "bg-muted" : ""}`} onClick={() => { refreshSections(); setPanel(panel === "sections" ? null : "sections") }} title="Ordre et affichage des sections"><Rows3 className="h-3.5 w-3.5" />Sections</button>
        <button className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted ${panel === "pages" ? "bg-muted" : ""}`} onClick={() => setPanel(panel === "pages" ? null : "pages")} title="Créer et gérer des pages"><FileText className="h-3.5 w-3.5" />Pages</button>
        
        <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted" onClick={toggleMode} title="Basculer clair / sombre (aperçu dans le studio)">{dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}{dark ? "Clair" : "Sombre"}</button>
        <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-muted" onClick={() => createBlank("article")} title="Créer un article vierge (avec ou sans sources)">+ Article</button>
        <a className="rounded-full px-2.5 py-1.5 text-muted-foreground hover:bg-muted" href="/studio" title="Éditeur par formulaires">Formulaires</a>
      </div>
      {on && !editing && <div style={{ position: "fixed", left: "50%", top: 10, transform: "translateX(-50%)", pointerEvents: "none" }} className="rounded-full border border-border bg-background/95 px-3 py-1 text-[11px] text-muted-foreground shadow">Cliquez sur un texte pour le modifier · survolez un bloc pour le dupliquer ou le supprimer · survolez une section (barre « Section » en haut à droite, « + Ajouter une section ici » en bas) · survolez une image pour la remplacer</div>}
      {(toast || busy) && <div style={{ position: "fixed", left: "50%", bottom: 70, transform: "translateX(-50%)" }} className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-lg">{busy || toast}</div>}
      <style>{`html.studio-editing body { cursor: text; } html.studio-editing a, html.studio-editing button { cursor: text; }`}</style>
    </div>
  )
  return createPortal(<>{ui}<ChangesDialog open={showChanges} onOpenChange={setShowChanges} state={chg} onChanged={() => { cache.current.clear(); location.reload() }} /></>, document.body)
}
