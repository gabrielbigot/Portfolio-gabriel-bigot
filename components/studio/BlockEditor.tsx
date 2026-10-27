"use client"
// Éditeur de blocs façon Notion, partagé par l'éditeur d'écriture des essais et celui des dossiers : menu « / », Entrée = nouveau bloc,
// Retour arrière, raccourcis Markdown (# - 1. > ---), **gras** / *italique* / `code` à la frappe, glisser pour réordonner, barre à la sélection,
// images (envoi / collage / glisser), Claude (bloc et sélection). Le parent possède les blocs et l'enregistrement.
import { useEffect, useMemo, useRef, useState } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { studioApi } from "@/components/studio/ChangesDialog"
import { mdToHtml, nodeToMd } from "@/lib/inline-md"
import { looksLikeInstruction } from "@/lib/studio/jev-detect"

export type K = "p" | "h2" | "h3" | "lede" | "bullet" | "number" | "quote" | "code" | "callout" | "image" | "divider" | "table" | "figure" | "gloss" | "html" | "genfig" | "loading"
export type Ai = { prompt: string; before?: string; after?: string; reviewed?: boolean; at?: string } // provenance d'un texte écrit par Claude (demande, texte d'avant, état de relecture)
export type B = { id: string; k: K; text: string; src?: string; ver: number; ai?: Ai; x?: Record<string, any> }
/** ce que l'auteur a réellement demandé (les anciens blocs ont gardé la consigne interne envoyée à Claude : on en extrait la question) */
export const userRequest = (ai: Ai): string => {
  const p = ai.prompt || "", q = /Question\s*:\s*([\s\S]+)$/.exec(p); if (q) return q[1].trim()
  const d = /^Définis « (.+?) »/.exec(p); if (d) return `C'est quoi ${d[1]} ?`
  return p
}
export type Proposal = { label: string; before: string; after: string[]; apply: () => void; list?: string[] } // aperçu avant application
export type Hint = { key: string; label: string; accept?: () => void; ai?: string; shown?: string; enter?: boolean; prio?: number } // ai : consigne envoyée à Claude (remplace le bloc) ; enter : ↵ accepte
export type Item = { id: string; label: string; hint: string; kw: string; k?: K; act?: string }

let seq = 0
export const nid = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`
export const mk = (k: K, text = "", extra: Partial<B> = {}): B => ({ id: nid(), k, text, ver: 0, ...extra })
const TEXT_KINDS = new Set<K>(["p", "h2", "h3", "lede", "bullet", "number", "quote", "code", "callout"])
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const BASE_ITEMS: Item[] = [
  { id: "p", label: "Texte", hint: "Paragraphe", kw: "texte paragraphe", k: "p" },
  { id: "h2", label: "Titre", hint: "# ", kw: "titre heading h1 h2", k: "h2" },
  { id: "h3", label: "Sous-titre", hint: "## ", kw: "sous-titre h3", k: "h3" },
  { id: "bullet", label: "Liste à puces", hint: "- ", kw: "liste puces bullet", k: "bullet" },
  { id: "number", label: "Liste numérotée", hint: "1. ", kw: "liste numerotee number", k: "number" },
  { id: "quote", label: "Citation", hint: "> ", kw: "citation quote", k: "quote" },
  { id: "code", label: "Code", hint: "```", kw: "code", k: "code" },
  { id: "image", label: "Image", hint: "envoi", kw: "image photo", act: "image" },
  { id: "divider", label: "Séparateur", hint: "---", kw: "separateur ligne divider", k: "divider" },
  { id: "ai", label: "✨ Écrire avec Claude", hint: "consigne", kw: "claude ia ai ecrire generer", act: "ai" },
]
const SHORT: [RegExp, K][] = [[/^#\s$/, "h2"], [/^##\s$/, "h3"], [/^[-*]\s$/, "bullet"], [/^1[.)]\s$/, "number"], [/^>\s$/, "quote"], [/^```$/, "code"], [/^---$/, "divider"]]
export const CLS: Record<string, string> = {
  p: "font-editorial text-xl sm:text-[1.35rem] leading-[1.75] text-foreground/90", lede: "font-editorial text-2xl leading-[1.55] text-foreground", h2: "font-editorial text-3xl sm:text-4xl leading-tight mt-8", h3: "font-editorial text-2xl sm:text-3xl leading-snug mt-4",
  bullet: "text-lg leading-relaxed", number: "text-lg leading-relaxed", quote: "font-editorial text-2xl italic leading-relaxed", callout: "text-lg leading-relaxed", code: "font-mono text-sm whitespace-pre-wrap rounded-lg bg-foreground/[0.05] border border-border p-4",
}
const PH: Record<string, string> = { p: "Écrivez, ou tapez « / » pour les blocs…", lede: "Chapô : la réponse directe", h2: "Titre", h3: "Sous-titre", bullet: "Élément de liste", number: "Élément de liste", quote: "Citation", code: "Code", callout: "Texte de l'encadré" }
const api = <T,>(u: string, body: unknown) => studioApi<T>(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

function Text({ b, onInput, onKey, onFocus, skin, onPasteTable, onHover, busy }: { b: B; onInput: (el: HTMLElement, e?: Event) => void; onKey: (e: React.KeyboardEvent<HTMLElement>, b: B) => void; onFocus: () => void; skin?: string; onPasteTable?: (id: string, text: string) => void; onHover?: (e: React.MouseEvent<HTMLElement> | null, b: B) => void; busy?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) { if (b.k === "code") ref.current.textContent = b.text; else ref.current.innerHTML = mdToHtml(b.text) } }, [b.id, b.k, b.ver]) // eslint-disable-line react-hooks/exhaustive-deps
  const Tag = (skin ? (b.k === "h2" || b.k === "h3" ? "h3" : b.k === "code" ? "pre" : "p") : "div") as "div"
  const cls = (busy ? "ew-shimmer " : "") + (skin ? `ew-text outline-none ${b.k === "lede" ? "lede" : ""} ${b.k === "quote" ? "italic" : ""} ${b.ai && !b.ai.reviewed ? "ew-ai" : ""}` : `ew-text outline-none ${CLS[b.k]} ${b.ai && !b.ai.reviewed ? "ew-ai" : ""}`)
  return <Tag ref={ref} id={b.k === "h2" || b.k === "h3" ? `h-${b.id}` : undefined} data-bid={b.id} contentEditable suppressContentEditableWarning spellCheck data-ph={PH[b.k]} className={cls}
    onInput={e => onInput(e.currentTarget, e.nativeEvent)} onKeyDown={e => onKey(e, b)} onFocus={onFocus} 
    onPaste={e => { if (e.clipboardData.files.length) return; e.preventDefault(); const t = e.clipboardData.getData("text/plain"); if (b.k !== "code" && onPasteTable && /\t/.test(t) && /\n/.test(t.trim())) { onPasteTable(b.id, t); return } document.execCommand("insertText", false, b.k === "code" ? t : t.replace(/\s*\n\s*/g, " ")) }} />
}

export default function BlockEditor({ blocks, onChange, items = BASE_ITEMS, onAction, special, wrap, aiContext, aiOn, onError, sourceButton, uploader, suggest, loose, skin, onPasteTable, onProposal, onSuggestNext, children }: {
  blocks: B[]; onChange: (fn: (b: B[]) => B[]) => void; items?: Item[]; onAction?: (act: string, blockId: string) => void
  special?: (b: B, upd: (p: Partial<B>) => void) => React.ReactNode; wrap?: (b: B, inner: React.ReactNode, upd: (p: Partial<B>) => void) => React.ReactNode
  aiContext: string; aiOn: boolean | null; onError: (m: string) => void; sourceButton?: () => void; uploader?: (f: File) => Promise<string>; suggest?: (b: B, all: B[]) => Hint[]; loose?: boolean; skin?: "dossier"; onPasteTable?: (blockId: string, text: string) => void; onProposal?: (p: Proposal) => void; onSuggestNext?: (blockId: string) => void; children?: React.ReactNode
}) {
  const [menu, setMenu] = useState<null | { id: string; q: string; i: number; x: number; y: number }>(null)
  const [focusReq, setFocusReq] = useState<null | { id: string; end: boolean }>(null)
  const [aiBox, setAiBox] = useState<null | { id: string }>(null); const [aiBusy, setAiBusy] = useState(false); const [busyId, setBusyId] = useState<string | null>(null)
  const [bar, setBar] = useState<null | { x: number; y: number }>(null)
  const [drag, setDrag] = useState<{ id: string; over: string } | null>(null)
  const ref = useRef(blocks); ref.current = blocks
  // suppression avec « Annuler » (8 s) : on garde l'état d'avant
  const [undo, setUndo] = useState<null | { prev: B[]; n: number }>(null); const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const removeBlocks = (ids: string[], keepFocus?: string) => {
    if (!ids.length) return; const prev = ref.current
    onChange(bs => { const out = bs.filter(b => !ids.includes(b.id)); return out.length ? out : [mk("p")] })
    setUndo({ prev, n: ids.length }); if (undoTimer.current) clearTimeout(undoTimer.current); undoTimer.current = setTimeout(() => setUndo(null), 8000)
    if (keepFocus) setFocusReq({ id: keepFocus, end: true })
  }
  const undoRemove = () => { if (!undo) return; const p = undo.prev; onChange(() => p); setUndo(null) }
  const fileRef = useRef<HTMLInputElement>(null); const imgFor = useRef<string | null>(null); const selRange = useRef<Range | null>(null); const root = useRef<HTMLDivElement>(null)
  // Jev ambiant : propositions discrètes (graphique, source, plan, demande à Claude) calculées localement après une pause d'écriture
  const [hintIdx, setHintIdx] = useState(0)
  const [tip, setTip] = useState<null | { id: string; x: number; y: number }>(null); const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hover = (el: HTMLElement | null, b: B) => { if (tipTimer.current) clearTimeout(tipTimer.current); if (!el) { tipTimer.current = setTimeout(() => setTip(null), 300); return } const r = el.getBoundingClientRect(); setTip({ id: b.id, x: Math.max(8, Math.min(window.innerWidth - 316, r.right - 300)), y: Math.min(window.innerHeight - 200, r.bottom + 6) }) }
  // survol du texte écrit par Claude : la carte apparaît après une courte pause, près du pointeur
  const hoverText = (e: React.MouseEvent<HTMLElement> | null, b: B) => { if (tipTimer.current) clearTimeout(tipTimer.current); if (!e) { tipTimer.current = setTimeout(() => setTip(null), 300); return } const x = e.clientX, y = e.clientY; tipTimer.current = setTimeout(() => setTip({ id: b.id, x: Math.max(8, Math.min(window.innerWidth - 316, x - 40)), y: Math.min(window.innerHeight - 200, y + 18) }), 450) }
  const [hints, setHints] = useState<null | { id: string; list: Hint[] }>(null); const dismissed = useRef(new Set<string>()); const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintsFor = (id: string): Hint[] => {
    const b = ref.current.find(x => x.id === id); if (!b || !TEXT_KINDS.has(b.k) || b.k === "code") return []
    const list: Hint[] = []
    if (aiOn && b.k === "p" && looksLikeInstruction(b.text)) list.push({ key: "ai", label: "✨ Demande à Claude détectée : ↵ pour qu'il l'écrive", ai: b.text, enter: true })
    for (const h of suggest?.(b, ref.current) || []) list.push(h)
    return list.filter(h => !dismissed.current.has(`${id}:${h.key}`)).sort((a, z) => (z.prio ?? (z.enter ? 5 : 0)) - (a.prio ?? (a.enter ? 5 : 0)))
  }
  const compute = (id: string) => { const l = hintsFor(id); setHintIdx(0); setHints(l.length ? { id, list: l } : null) }
  const accept = (id: string, h: Hint) => { setHints(null); if (h.ai) runWrite(id, h.ai, true, h.shown); else h.accept?.() }
  const schedule = (id: string, delay = 1100) => { if (hintTimer.current) clearTimeout(hintTimer.current); setHints(h => h && h.id === id ? h : null); hintTimer.current = setTimeout(() => compute(id), delay) }
  const upd = (id: string, p: Partial<B>) => onChange(bs => bs.map(b => b.id === id ? { ...b, ...p } : b))

  useEffect(() => { if (!focusReq) return; const el = document.querySelector<HTMLElement>(`[data-bid="${focusReq.id}"]`); if (el) { el.focus(); const r = document.createRange(); r.selectNodeContents(el); r.collapse(!focusReq.end); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r) } setFocusReq(null) }, [focusReq, blocks])
  useEffect(() => {
    const f = () => { const s = getSelection(); if (!s || s.isCollapsed || !s.rangeCount) { setBar(null); return } const a = (s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode as Element : s.anchorNode.parentElement))?.closest(".ew-text"); if (!a || !root.current?.contains(a) || a.getAttribute("data-ph") === PH.code) { setBar(null); return } const r = s.getRangeAt(0).getBoundingClientRect(); selRange.current = s.getRangeAt(0).cloneRange(); setBar({ x: r.left + r.width / 2, y: r.top }) }
    document.addEventListener("selectionchange", f); return () => document.removeEventListener("selectionchange", f)
  }, [])

  const fmt = (cmd: string) => { document.execCommand(cmd) }
  const link = () => { const u = window.prompt("Adresse du lien (https://…)", "https://"); if (u && /^(https?:\/\/|mailto:|\/|#)/i.test(u)) document.execCommand("createLink", false, u) }
  const codeSel = () => { const t = getSelection()?.toString() || ""; if (t) document.execCommand("insertHTML", false, `<code>${esc(t)}</code>`) }
  const rewriteSel = async () => {
    const t = getSelection()?.toString() || ""; if (!t) return; const ins = window.prompt("Que faut-il faire de ce passage ? (ex. : plus concis, plus direct, reformule)"); if (!ins) return
    const r = selRange.current; setAiBusy(true)
    try { const a = await api<{ text: string }>("/api/studio/ai", { instruction: ins, original: t, context: aiContext, multiline: false }); const s = getSelection(); if (r) { s?.removeAllRanges(); s?.addRange(r) } document.execCommand("insertText", false, a.text) }
    catch (e) { onError(e instanceof Error ? e.message : String(e)) } finally { setAiBusy(false) }
  }

  const splitDivider = (id: string) => onChange(bs => { const i = bs.findIndex(x => x.id === id), nb = mk("p"); const out = bs.slice(); out[i] = { ...bs[i], k: "divider", text: "", ver: bs[i].ver + 1 }; out.splice(i + 1, 0, nb); setTimeout(() => setFocusReq({ id: nb.id, end: false }), 0); return out })
  const onInput = (el: HTMLElement, e0?: Event) => {
    const id = el.getAttribute("data-bid")!, b = ref.current.find(x => x.id === id); if (!b) return
    const raw = el.textContent || ""
    if (b.k === "p") { const sh = SHORT.find(([re]) => re.test(raw)); if (sh) { const k = sh[1]; if (k === "divider") splitDivider(id); else { upd(id, { k, text: "", ver: b.ver + 1 }); setTimeout(() => setFocusReq({ id, end: false }), 0) } setMenu(null); return } }
    if (b.k !== "code" && (e0 as InputEvent | undefined)?.inputType === "insertText") { // Markdown tapé : **gras**, *italique*, `code`
      const sel = getSelection(), n = sel?.anchorNode
      if (sel && sel.isCollapsed && n && n.nodeType === 3) { const before = (n.nodeValue || "").slice(0, sel.anchorOffset), m = /\*\*([^*\s][^*]*)\*\*$/.exec(before) || /(?:^|[\s(])\*([^*\s][^*]*)\*$/.exec(before) || /`([^`]+)`$/.exec(before)
        if (m) { const tag = m[0].includes("**") ? "b" : m[0].includes("`") ? "code" : "i", start = before.length - (m[0].startsWith(" ") || m[0].startsWith("(") ? m[0].length - 1 : m[0].length), end = sel.anchorOffset
          setTimeout(() => { const r = document.createRange(); r.setStart(n, start); r.setEnd(n, end); const s2 = getSelection(); s2?.removeAllRanges(); s2?.addRange(r); document.execCommand("insertHTML", false, `<${tag}>${esc(m[1])}</${tag}>​`) }, 0); return } }
    }
    const text = b.k === "code" ? (el.innerText || "").replace(/\n$/, "") : nodeToMd(el)
    if (b.k === "p" && /^\/[^\s]{0,20}$/.test(raw)) { const r = el.getBoundingClientRect(); setMenu({ id, q: raw.slice(1), i: 0, x: r.left, y: r.bottom + 4 }) } else setMenu(null)
    onChange(bs => bs.map(x => x.id === id ? { ...x, text, ...(x.ai && !x.ai.reviewed ? { ai: { ...x.ai, reviewed: true } } : {}) } : x)); schedule(id)
  }
  const matches = useMemo(() => menu ? items.filter(it => !menu.q || norm(it.label + " " + it.kw).includes(norm(menu.q))) : [], [menu, items])
  const clear = (id: string) => upd(id, { text: "", ver: (ref.current.find(x => x.id === id)?.ver || 0) + 1 })
  const choose = (it: Item) => {
    if (!menu) return; const id = menu.id; setMenu(null)
    if (it.act === "image") { imgFor.current = id; fileRef.current?.click(); return }
    if (it.act === "ai") { clear(id); if (aiOn === false) { onError("IA indisponible : ANTHROPIC_API_KEY absente de ce studio"); return } setAiBox({ id }); return }
    if (it.act) { clear(id); onAction?.(it.act, id); return }
    if (it.k === "divider") { splitDivider(id); return }
    const k = it.k!, base: Partial<B> = { k, text: "", ver: (ref.current.find(x => x.id === id)?.ver || 0) + 1 }
    if (k === "callout") base.x = { variant: it.id === "opinion" ? "opinion" : it.id === "warn" ? "warn" : "keep", title: it.id === "opinion" ? "Position de l'auteur" : "" }
    if (k === "table") { base.x = { head: ["Colonne 1", "Colonne 2"], rows: [["", ""], ["", ""]], caption: "" }; upd(id, base); return }
    if (k === "gloss") { base.x = { terms: [{ term: "", def: "" }] }; upd(id, base); return }
    upd(id, base); setFocusReq({ id, end: false })
  }

  const onKey = (e: React.KeyboardEvent<HTMLElement>, b: B) => {
    const el = e.currentTarget
    if (menu && menu.id === b.id && matches.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMenu({ ...menu, i: (menu.i + 1) % matches.length }); return }
      if (e.key === "ArrowUp") { e.preventDefault(); setMenu({ ...menu, i: (menu.i - 1 + matches.length) % matches.length }); return }
      if (e.key === "Enter") { e.preventDefault(); choose(matches[menu.i]); return }
      if (e.key === "Escape") { e.preventDefault(); setMenu(null); return }
    }
    const sel = getSelection(); const collapsed = !!sel && sel.isCollapsed
    if (!collapsed && sel && sel.rangeCount && (e.key === "Backspace" || e.key === "Delete")) { // sélection sur plusieurs blocs : on supprime le passage et les blocs entre les deux
      const r = sel.getRangeAt(0), blk = (n: Node) => ((n.nodeType === 1 ? n as Element : n.parentElement)?.closest("[data-bid]") as HTMLElement | null)
      const a = blk(r.startContainer), z = blk(r.endContainer)
      if (a && z && a !== z) {
        e.preventDefault(); const ia = ref.current.findIndex(x => x.id === a.getAttribute("data-bid")), iz = ref.current.findIndex(x => x.id === z.getAttribute("data-bid"))
        const head = document.createRange(); head.selectNodeContents(a); head.setEnd(r.startContainer, r.startOffset); const tail = document.createRange(); tail.selectNodeContents(z); tail.setStart(r.endContainer, r.endOffset)
        const text = nodeToMd(head.cloneContents()) + nodeToMd(tail.cloneContents()), keep = ref.current[ia].id, drop = ref.current.slice(ia + 1, iz + 1).map(x => x.id), prev = ref.current
        onChange(bs => bs.filter(x => !drop.includes(x.id)).map(x => x.id === keep ? { ...x, text, ver: x.ver + 1 } : x)); setUndo({ prev, n: drop.length + 1 }); if (undoTimer.current) clearTimeout(undoTimer.current); undoTimer.current = setTimeout(() => setUndo(null), 8000); setFocusReq({ id: keep, end: false }); return
      }
    }
    if (e.key === "Tab" && !e.shiftKey && b.k === "p" && collapsed && sel!.rangeCount && onSuggestNext && aiOn && (el.textContent || "").length >= 30) { // Tab en fin de paragraphe : proposer la phrase suivante
      const r = sel!.getRangeAt(0), tail = document.createRange(); tail.selectNodeContents(el); tail.setStart(r.endContainer, r.endOffset)
      if (!tail.toString().trim()) { e.preventDefault(); onSuggestNext(b.id); return }
    }
    if (e.key === "Enter" && !e.shiftKey && b.k === "p") { const h = hintsFor(b.id).find(x => x.enter); if (h) { e.preventDefault(); accept(b.id, h); return } }
    if (e.key === "Enter" && !e.shiftKey && b.k !== "code" && collapsed && sel!.rangeCount) {
      e.preventDefault(); schedule(b.id, 350)
      if ((b.k === "bullet" || b.k === "number" || b.k === "quote" || b.k === "callout" || b.k === "lede") && !(el.textContent || "").length) { upd(b.id, { k: "p", ver: b.ver + 1 }); setFocusReq({ id: b.id, end: false }); return }
      const r = sel!.getRangeAt(0), tail = document.createRange(); tail.selectNodeContents(el); tail.setStart(r.endContainer, r.endOffset)
      const frag = tail.cloneContents(), tailMd = nodeToMd(frag); tail.deleteContents(); const headMd = nodeToMd(el), nb = mk(b.k === "bullet" || b.k === "number" ? b.k : "p", tailMd)
      onChange(bs => { const i = bs.findIndex(x => x.id === b.id), out = bs.slice(); out[i] = { ...bs[i], text: headMd, ver: bs[i].ver + 1 }; out.splice(i + 1, 0, nb); return out }); setFocusReq({ id: nb.id, end: false }); return
    }
    if (e.key === "Backspace" && collapsed && sel!.rangeCount) {
      const r = sel!.getRangeAt(0), head = document.createRange(); head.selectNodeContents(el); head.setEnd(r.startContainer, r.startOffset)
      if (head.toString().length === 0) {
        e.preventDefault(); const bs = ref.current, i = bs.findIndex(x => x.id === b.id), empty = !(el.textContent || "").length
        if (b.k !== "p") { upd(b.id, { k: "p", ver: b.ver + 1, x: undefined }); setFocusReq({ id: b.id, end: false }); return }
        const prev = bs[i - 1]; if (!prev) return
        if (!TEXT_KINDS.has(prev.k)) { if (empty) onChange(x => x.filter(y => y.id !== b.id)); else onChange(x => x.filter(y => y.id !== prev.id)); return }
        if (empty) { onChange(x => x.filter(y => y.id !== b.id)); setFocusReq({ id: prev.id, end: true }); return }
        const mdNow = nodeToMd(el); onChange(x => x.filter(y => y.id !== b.id).map(y => y.id === prev.id ? { ...y, text: y.text + mdNow, ver: y.ver + 1 } : y)); setFocusReq({ id: prev.id, end: true })
      }
    }
    if (e.key === "Escape") (el as HTMLElement).blur()
  }
  const addAt = (after: string) => { const nb = mk("p"); onChange(bs => { const i = bs.findIndex(x => x.id === after), out = bs.slice(); out.splice(i + 1, 0, nb); return out }); setFocusReq({ id: nb.id, end: false }) }

  const upload = async (file: File, id: string | null) => {
    const fd = new FormData(); fd.append("file", file)
    try { const path = uploader ? await uploader(file) : (await studioApi<{ path: string }>("/api/studio/upload", { method: "POST", body: fd })).path
      onChange(bs => { const i = id ? bs.findIndex(x => x.id === id) : bs.length - 1, out = bs.slice(), nb = mk("image", "", { src: path }); const cur = out[i]; if (cur && cur.k === "p" && !cur.text) out[i] = nb; else out.splice(i + 1, 0, nb); return out }) }
    catch (e) { onError(e instanceof Error ? e.message : String(e)) }
  }
  const runWrite = async (id: string, instruction: string, replace = false, shown?: string) => {
    setAiBusy(true); setHints(null); setBusyId(id)
    try {
      const cur = ref.current.find(x => x.id === id), curText = cur?.text || ""
      const r = await api<{ text: string }>("/api/studio/ai", { instruction, original: "", context: `${aiContext} — ${ref.current.filter(b => b.text && b.id !== id).slice(-4).map(b => b.text).join(" / ").slice(0, 400)}`, multiline: true })
      const at = new Date().toISOString(), parts = r.text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean).slice(0, 12)
      const nbs = parts.map((p, k) => { const li = /^[-*•]\s+/.test(p), t = p.replace(/^[-*•]\s+/, "").replace(/^#{1,3}\s+/, ""); return mk(li ? "bullet" : /^#{1,3}\s/.test(p) ? "h3" : "p", t, { ai: { prompt: shown || instruction, after: t, at, ...(replace && k === 0 ? { before: curText } : {}) } }) })
      const apply = () => { if (nbs.length) onChange(bs => { const i = bs.findIndex(x => x.id === id), out = bs.slice(); if (out[i] && (replace || !out[i].text) && TEXT_KINDS.has(out[i].k)) out.splice(i, 1, ...nbs); else out.splice(i + 1, 0, ...nbs); return out }); setAiBox(null) }
      if (onProposal && nbs.length) { setAiBox(null); onProposal({ label: (shown || instruction).slice(0, 80), before: replace ? curText : "", after: nbs.map(x => x.text), apply }) } else apply()
    } catch (e) { onError(e instanceof Error ? e.message : String(e)) } finally { setAiBusy(false); setBusyId(null) }
  }
  const undoAi = (b: B) => { setTip(null); if (b.ai && b.ai.before !== undefined) upd(b.id, { text: b.ai.before, ver: b.ver + 1, ai: undefined }); else removeBlocks([b.id]) }
  const reviewAi = (b: B) => { setTip(null); if (b.ai) upd(b.id, { ai: { ...b.ai, reviewed: true } }) }
  const dropOn = (over: string) => { if (!drag || drag.id === over) { setDrag(null); return } onChange(bs => { const a = bs.findIndex(x => x.id === drag.id), out = bs.slice(), [m] = out.splice(a, 1), b = out.findIndex(x => x.id === over); out.splice(b < a ? b : b + 1, 0, m); return out }); setDrag(null) }
  const last = blocks[blocks.length - 1]
  // clic dans le vide sous le dernier bloc : écrire à la suite (nouveau paragraphe si le dernier bloc n'est pas un paragraphe vide)
  const appendAtEnd = () => { if (last && last.k === "p" && !last.text) setFocusReq({ id: last.id, end: true }); else { const nb = mk("p"); onChange(bs => [...bs, nb]); setFocusReq({ id: nb.id, end: false }) } }
  // clic dans un interstice entre deux blocs : curseur à la fin du bloc le plus proche
  const gapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement; if (t !== e.currentTarget && !t.classList.contains("ew-row")) return
    const rows = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-bid]")]; if (!rows.length) { appendAtEnd(); return }
    let best = rows[0], d = Infinity; for (const r of rows) { const b = r.getBoundingClientRect(), c = e.clientY < b.top ? b.top - e.clientY : e.clientY > b.bottom ? e.clientY - b.bottom : 0; if (c < d) { d = c; best = r } }
    setFocusReq({ id: best.getAttribute("data-bid")!, end: true })
  }

  return (
    <div ref={root} onClick={gapClick} className={skin ? "" : loose ? "space-y-5" : "space-y-1"} onDragOver={e => { if (e.dataTransfer.types.includes("Files")) e.preventDefault() }} onDrop={e => { const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith("image/")) { e.preventDefault(); e.stopPropagation(); upload(f, null) } }}
      onPaste={e => { const f = Array.from(e.clipboardData.files).find(x => x.type.startsWith("image/")); if (f) { e.preventDefault(); upload(f, null) } }}>
      {blocks.map((b, i) => {
        const n = b.k === "number" ? (() => { let c = 0; for (let j = i; j >= 0 && blocks[j].k === "number"; j--) c++; return c })() : 0
        const up = (p: Partial<B>) => upd(b.id, p)
        const inner = b.k === "divider" ? <hr className="my-6 border-border" />
          : b.k === "image" ? <figure className="my-4">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={b.src} alt="" className="w-full rounded-lg border border-border" /><input value={b.text} onChange={e => up({ text: e.target.value })} placeholder="Légende (et source)" className="mt-2 w-full bg-transparent text-sm text-muted-foreground outline-none" /></figure>
          : TEXT_KINDS.has(b.k) ? <div className={b.k === "quote" ? "border-l-2 border-accent pl-5" : ""}><Text b={b} onInput={onInput} onKey={onKey} onFocus={() => setBar(null)} skin={skin} onPasteTable={onPasteTable} onHover={hoverText} busy={busyId === b.id} /></div>
          : special?.(b, up) ?? null
        return (
          <div key={b.id} className={`ew-row group relative flex items-start gap-1 ${drag && drag.over === b.id && drag.id !== b.id ? "border-t-2 border-violet-500" : ""}`}
            onDragOver={e => { if (drag) { e.preventDefault(); if (drag.over !== b.id) setDrag({ ...drag, over: b.id }) } }} onDrop={e => { if (drag) { e.preventDefault(); e.stopPropagation(); dropOn(b.id) } }}>
            <div className="ew-tools absolute -left-20 top-1.5 flex items-center opacity-0 transition-opacity">
              <button type="button" className="rounded p-0.5 text-muted-foreground hover:bg-muted" title="Ajouter un bloc dessous" onClick={() => addAt(b.id)}><Plus className="h-4 w-4" /></button>
              <button type="button" className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-red-500" title="Supprimer ce bloc" onClick={() => { const i = ref.current.findIndex(x => x.id === b.id), near = ref.current[i - 1] || ref.current[i + 1]; removeBlocks([b.id], near && TEXT_KINDS.has(near.k) ? near.id : undefined) }}><Trash2 className="h-4 w-4" /></button>
              <span draggable onDragStart={e => { e.dataTransfer.setData("text/plain", b.id); setDrag({ id: b.id, over: b.id }) }} onDragEnd={() => setDrag(null)} className="cursor-grab rounded p-0.5 text-muted-foreground hover:bg-muted" title="Glisser pour déplacer"><GripVertical className="h-4 w-4" /></span>
            </div>
            {b.k === "bullet" && <span className="mt-0.5 w-6 shrink-0 pt-1 text-center text-lg text-foreground/50">•</span>}
            {b.k === "number" && <span className="mt-0.5 w-6 shrink-0 pt-1 text-right text-lg text-foreground/50">{n}.</span>}
            <div className="min-w-0 flex-1">
              {TEXT_KINDS.has(b.k) || b.k === "image" ? (wrap ? wrap(b, inner, up) : inner)
                : <div tabIndex={0} className="rounded-md outline-none focus:ring-2 focus:ring-violet-500/40" title="Sélectionné : Suppr pour supprimer" onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Delete" || e.key === "Backspace")) { e.preventDefault(); removeBlocks([b.id]) } }}>{wrap ? wrap(b, inner, up) : inner}</div>}
              {b.ai && !b.ai.reviewed && TEXT_KINDS.has(b.k) && <div className="ew-aicap pointer-events-none absolute left-3.5 top-full z-10 -mt-1 max-w-[90%] translate-y-0 text-xs italic leading-snug text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ fontFamily: "var(--vra-sans, system-ui)" }}>✨ « {userRequest(b.ai).length > 140 ? userRequest(b.ai).slice(0, 140) + "…" : userRequest(b.ai)} »</div>}
              {busyId === b.id && <div className="ew-busy mt-1.5 flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "var(--vra-sans, system-ui)" }}><span className="ew-spin" />✨ Claude écrit…</div>}
              {hints?.id === b.id && (() => { const h = hints.list[hintIdx % hints.list.length], more = hints.list.length - 1; return <div className="my-1 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/5 px-3 py-1 text-xs">
                <span>{h.label}</span><button type="button" className="rounded-full bg-foreground px-2 py-0.5 text-background" onMouseDown={e => { e.preventDefault(); accept(b.id, h) }}>Oui</button>
                <button type="button" className="text-muted-foreground hover:text-foreground" onMouseDown={e => { e.preventDefault(); dismissed.current.add(`${b.id}:${h.key}`); compute(b.id) }}>Ignorer</button>
                {more > 0 && <button type="button" className="text-muted-foreground hover:text-foreground" title="Voir une autre proposition" onMouseDown={e => { e.preventDefault(); setHintIdx(i => i + 1) }}>+{more} autre{more > 1 ? "s" : ""}</button>}</span></div> })()}
              {aiBox?.id === b.id && <AiBox busy={aiBusy} onRun={t => runWrite(b.id, t)} onClose={() => setAiBox(null)} />}
            </div>
          </div>
        )
      })}
      <div className={skin ? "h-14 cursor-text" : "h-24 cursor-text"} title="Cliquez ici pour écrire à la suite" onClick={appendAtEnd} />
      {children}
      {tip && (() => { const b = blocks.find(x => x.id === tip.id); if (!b || !b.ai || b.ai.reviewed) return null; const edited = b.ai.after !== undefined && b.ai.after !== b.text, bef = b.ai.before && b.ai.before !== b.ai.prompt ? b.ai.before : ""
        return <div style={{ position: "fixed", left: tip.x, top: tip.y, width: 300 }} className="z-50 rounded-xl border border-border bg-background p-3.5 text-sm shadow-lg" onMouseEnter={() => { if (tipTimer.current) clearTimeout(tipTimer.current) }} onMouseLeave={() => hover(null, b)}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>✨</span><span>Écrit par Claude{edited ? " · modifié depuis" : ""}{b.ai.at ? ` · ${new Date(b.ai.at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}</span></div>
          <p className="mt-2 leading-snug"><span className="text-muted-foreground">Votre demande · </span><i>« {b.ai.prompt.length > 160 ? b.ai.prompt.slice(0, 160) + "…" : b.ai.prompt} »</i></p>
          {bef && <details className="mt-1.5 text-xs text-muted-foreground"><summary className="cursor-pointer">Texte d&apos;avant</summary><p className="mt-1 italic">{bef.slice(0, 240)}{bef.length > 240 ? "…" : ""}</p></details>}
          <div className="mt-3 flex items-center gap-2"><button className="rounded-lg bg-foreground px-3 py-1 text-xs text-background" onMouseDown={e => { e.preventDefault(); reviewAi(b) }}>OK, relu</button><button className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted" onMouseDown={e => { e.preventDefault(); undoAi(b) }}>{b.ai.before !== undefined ? "Revenir à avant" : "Supprimer"}</button></div></div> })()}
      {undo && <div style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)" }} className="z-50 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2 text-sm shadow-xl">{undo.n > 1 ? `${undo.n} blocs supprimés` : "Bloc supprimé"}<button className="rounded-md bg-foreground px-2.5 py-0.5 text-xs text-background" onClick={undoRemove}>Annuler</button></div>}
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, imgFor.current); e.target.value = "" }} />
      {menu && matches.length > 0 && <div style={{ position: "fixed", left: menu.x, top: Math.min(menu.y, window.innerHeight - 340) }} className="z-40 max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-background p-1 shadow-xl">
        {matches.map((it, j) => <button key={it.id} type="button" onMouseDown={e => { e.preventDefault(); choose(it) }} onMouseEnter={() => setMenu({ ...menu, i: j })} className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm ${j === menu.i ? "bg-muted" : ""}`}><span>{it.label}</span><span className="text-xs text-muted-foreground">{it.hint}</span></button>)}
      </div>}
      {bar && <div style={{ position: "fixed", left: bar.x, top: bar.y - 44, transform: "translateX(-50%)" }} className="z-40 flex items-center gap-0.5 rounded-lg border border-border bg-background px-1 py-1 text-sm shadow-xl" onMouseDown={e => e.preventDefault()}>
        <button className="rounded px-2 py-1 font-bold hover:bg-muted" title="Gras (⌘B)" onClick={() => fmt("bold")}>B</button>
        <button className="rounded px-2 py-1 italic hover:bg-muted" title="Italique (⌘I)" onClick={() => fmt("italic")}>I</button>
        <button className="rounded px-2 py-1 font-mono text-xs hover:bg-muted" title="Code" onClick={codeSel}>{"</>"}</button>
        <button className="rounded px-2 py-1 hover:bg-muted" title="Lien" onClick={link}>Lien</button>
        {sourceButton && <button className="rounded px-2 py-1 hover:bg-muted" title="Citer une source (pastille K)" onClick={sourceButton}>Source</button>}
        <button className="rounded px-2 py-1 text-violet-500 hover:bg-muted disabled:opacity-40" disabled={aiBusy || aiOn === false} title={aiOn === false ? "IA indisponible : ANTHROPIC_API_KEY absente" : "Demander à Claude de réécrire ce passage"} onClick={rewriteSel}>{aiBusy ? "…" : "✨"}</button>
      </div>}
    </div>
  )
}

function AiBox({ busy, onRun, onClose }: { busy: boolean; onRun: (t: string) => void; onClose: () => void }) {
  const [t, setT] = useState("")
  return <div className="my-2 rounded-lg border border-violet-500/40 bg-violet-500/5 p-3 text-sm">
    <div className="mb-1.5 font-medium">✨ Que doit écrire Claude ici ?</div>
    <textarea autoFocus value={t} onChange={e => setT(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && t.trim()) { e.preventDefault(); onRun(t) } if (e.key === "Escape") onClose() }} rows={2} placeholder="Ex. : un paragraphe qui explique pourquoi les agents échouent sur les tâches longues, ton direct" className="w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 outline-none" />
    <div className="mt-2 flex items-center gap-2"><button disabled={busy || !t.trim()} onClick={() => onRun(t)} className="rounded-md bg-foreground px-3 py-1 text-xs text-background disabled:opacity-40">{busy ? "Claude écrit…" : "Écrire"}</button><button onClick={onClose} className="rounded-md border border-border px-3 py-1 text-xs">Annuler</button><span className="text-xs text-muted-foreground">Claude n&apos;invente ni chiffres ni sources ; le texte est marqué à relire.</span></div>
  </div>
}
