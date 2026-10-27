"use client"
// Panneaux de l'éditeur direct : thème (couleurs, arrondi, police), pages, réglages d'une section, choix d'un type de section.
import { useCallback, useEffect, useRef, useState } from "react"
import { ExternalLink, Plus, Trash2, X } from "lucide-react"
import { studioApi } from "@/components/studio/ChangesDialog"
import { FONT_STACKS, themeCss, type Theme } from "@/lib/site-theme"
import { BLOCK_TYPES, newId, slugify } from "@/lib/studio/block-templates"
import { snapshotElement } from "@/lib/studio/html-safe"

const post = (url: string, body: unknown) => studioApi(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
const field = "w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-foreground/60"
const Panel = ({ title, onClose, children, width = 340 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) => (
  <div data-studio-ui style={{ position: "fixed", right: 14, bottom: 64, width, maxHeight: "74vh", pointerEvents: "auto" }} className="flex flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl">
    <div className="flex items-center justify-between border-b border-border px-3 py-2 text-sm font-medium">{title}<button onClick={onClose} className="rounded p-1 hover:bg-muted" aria-label="Fermer"><X className="h-4 w-4" /></button></div>
    <div className="overflow-y-auto p-3">{children}</div>
  </div>
)

/* ---------- thème ---------- */
const TOKENS: [string, string][] = [["background", "Fond de page"], ["foreground", "Texte"], ["card", "Cartes et blocs"], ["muted", "Zones atténuées"], ["muted-foreground", "Texte atténué"], ["accent", "Accent"], ["accent-foreground", "Texte sur accent"], ["primary", "Principal (boutons)"], ["primary-foreground", "Texte sur principal"], ["secondary", "Secondaire"], ["border", "Bordures"]]
const FONT_LABELS: Record<string, string> = { geist: "Geist (actuelle)", serif: "Serif éditoriale", sans: "Sans système", mono: "Monospace" }
export function ThemePanel({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [theme, setTheme] = useState<Theme | null>(null); const [mode, setMode] = useState<"light" | "dark">(typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light")
  const [state, setState] = useState(""); const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  useEffect(() => { studioApi<{ draft: Theme }>("/api/studio/content/theme?draftOnly=1").then(r => setTheme(r.draft)).catch(e => setState(String(e.message))) }, [])
  const live = useCallback((t: Theme) => { let el = document.getElementById("studio-theme-live") as HTMLStyleElement | null; if (!el) { el = document.createElement("style"); el.id = "studio-theme-live"; document.head.appendChild(el) } el.textContent = themeCss(t).replace(/;/g, " !important;").replace(/ !important !important/g, " !important") }, [])
  const save = (key: string, body: unknown) => { clearTimeout(timers.current[key]); setState("Enregistrement…"); timers.current[key] = setTimeout(async () => { try { await post("/api/studio/patch", { key: "theme", ...(body as object) }); setState("Brouillon enregistré"); onSaved() } catch (e) { setState(e instanceof Error ? e.message : String(e)) } }, 500) }
  if (!theme) return <Panel title="Thème" onClose={onClose}><p className="text-xs text-muted-foreground">{state || "Chargement…"}</p></Panel>
  const set = (token: string, v: string) => { const t = { ...theme, [mode]: { ...theme[mode], [token]: v } }; setTheme(t); live(t); save(`${mode}.${token}`, { op: "put", path: [mode, token], value: v }) }
  return (
    <Panel title="Thème du site" onClose={onClose}>
      <div className="mb-3 flex gap-1 rounded-md border border-border p-0.5 text-xs">{(["light", "dark"] as const).map(m => <button key={m} className={`flex-1 rounded px-2 py-1 ${mode === m ? "bg-foreground text-background" : ""}`} onClick={() => setMode(m)}>{m === "light" ? "Mode clair" : "Mode sombre"}</button>)}</div>
      <div className="space-y-2">
        {TOKENS.map(([tok, label]) => (
          <label key={tok} className="flex items-center gap-2 text-xs"><input type="color" value={/^#[0-9a-f]{6}$/i.test(theme[mode][tok] || "") ? theme[mode][tok] : "#000000"} onChange={e => set(tok, e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent p-0" />
            <span className="flex-1">{label}</span><input className={field + " !w-24 font-mono"} value={theme[mode][tok] || ""} onChange={e => /^#[0-9a-fA-F]{0,8}$/.test(e.target.value) && set(tok, e.target.value)} /></label>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
        <label className="block">Arrondi des coins : <b>{theme.radius}</b><input type="range" min={0} max={1.5} step={0.125} value={parseFloat(theme.radius)} className="w-full" onChange={e => { const t = { ...theme, radius: `${e.target.value}rem` }; setTheme(t); live(t); save("radius", { op: "set", path: ["radius"], value: `${e.target.value}rem` }) }} /></label>
        <label className="block">Police<select className={field} value={theme.font} onChange={e => { const t = { ...theme, font: e.target.value }; setTheme(t); live(t); save("font", { op: "set", path: ["font"], value: e.target.value }) }}>{Object.keys(FONT_STACKS).map(k => <option key={k} value={k}>{FONT_LABELS[k] || k}</option>)}</select></label>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">{state || "Les changements s'affichent tout de suite et vont dans le brouillon."}</p>
    </Panel>
  )
}

/* ---------- réglages d'une section ---------- */
export type Rule = { order?: number; hidden?: boolean; bg?: string; py?: string; width?: string; align?: string }
const BGS: [string, string][] = [["", "Aucun (par défaut)"], ["card", "Carte"], ["muted", "Atténué"], ["secondary", "Secondaire"], ["accent", "Accent"], ["foreground", "Sombre (inversé)"]]
export function SectionSettings({ rule, rect, onChange, onClose }: { rule: Rule; rect: { left: number; top: number }; onChange: (r: Rule) => void; onClose: () => void }) {
  const set = (k: keyof Rule, v: string) => { const n = { ...rule } as any; if (v === "") delete n[k]; else n[k] = v; onChange(n) }
  const customBg = rule.bg && !BGS.some(([k]) => k === rule.bg)
  return (
    <div data-studio-ui style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 270, rect.left)), top: Math.min(window.innerHeight - 300, rect.top + 30), width: 260, pointerEvents: "auto" }} className="space-y-2.5 rounded-lg border border-border bg-background p-3 text-xs shadow-2xl">
      <div className="flex items-center justify-between font-medium">Réglages de la section<button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-3.5 w-3.5" /></button></div>
      <label className="block">Fond<select className={field} value={customBg ? "custom" : rule.bg || ""} onChange={e => set("bg", e.target.value === "custom" ? "#ece8de" : e.target.value)}>{BGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}<option value="custom">Couleur personnalisée…</option></select></label>
      {customBg && <input type="color" value={/^#[0-9a-f]{6}$/i.test(rule.bg || "") ? rule.bg : "#ece8de"} onChange={e => set("bg", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-border" />}
      <label className="block">Espacement vertical<select className={field} value={rule.py || ""} onChange={e => set("py", e.target.value)}>{[["", "Par défaut"], ["none", "Aucun"], ["s", "Petit"], ["m", "Moyen"], ["l", "Grand"], ["xl", "Très grand"]].map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label className="block">Largeur du contenu<select className={field} value={rule.width || ""} onChange={e => set("width", e.target.value)}><option value="">Normale</option><option value="narrow">Étroite (lecture)</option></select></label>
      <label className="block">Alignement du texte<select className={field} value={rule.align || ""} onChange={e => set("align", e.target.value)}>{[["", "Par défaut"], ["left", "Gauche"], ["center", "Centré"], ["right", "Droite"]].map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
    </div>
  )
}

/* ---------- choix d'un type de section ---------- */
export type Clip = { kind: "html" | "data"; label: string; html?: string; block?: Record<string, unknown> }
export function SectionPicker({ rect, clip, onPick, onPaste, onLibrary, onAi, onClose }: { rect: { left: number; top: number }; clip: Clip | null; onPick: (type: string) => void; onPaste: () => void; onLibrary: () => void; onAi?: () => void; onClose: () => void }) {
  return (
    <div data-studio-ui style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 320, rect.left)), top: Math.max(8, Math.min(window.innerHeight - 470, rect.top + 30)), width: 310, pointerEvents: "auto" }} className="rounded-lg border border-border bg-background p-2 shadow-2xl">
      <div className="mb-1 flex items-center justify-between px-2 pt-1 text-xs font-medium">Ajouter une section<button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-3.5 w-3.5" /></button></div>
      <div className="grid max-h-[420px] grid-cols-1 gap-0.5 overflow-y-auto">
        {clip && <button className="rounded-md border border-dashed border-foreground/40 px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={onPaste}><span className="font-medium">Coller la section copiée</span><span className="block truncate text-[11px] text-muted-foreground">{clip.label}</span></button>}
        {onAi && <button className="rounded-md border border-violet-500/50 bg-violet-500/10 px-2 py-1.5 text-left text-xs hover:bg-violet-500/20" onClick={onAi}><span className="font-medium">✨ Écrire cette section avec Claude…</span><span className="block text-[11px] text-muted-foreground">Décrivez ce que vous voulez : titre, texte, cartes, liste…</span></button>}
        <button className="rounded-md bg-muted/60 px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={onLibrary}><span className="font-medium">Reprendre une section existante du site…</span><span className="block text-[11px] text-muted-foreground">Copie exacte (même apparence) d&apos;une section d&apos;une autre page</span></button>
        <div className="px-2 pt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Sections vierges</div>
        {BLOCK_TYPES.map(b => (
          <button key={b.type} className="rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={() => onPick(b.type)}><span className="font-medium">{b.label}</span><span className="block text-[11px] text-muted-foreground">{b.hint}</span></button>))}
      </div>
    </div>
  )
}

/* ---------- bibliothèque : sections existantes des autres pages ---------- */
export const SITE_ROUTES: [string, string][] = [["/portfolio", "Accueil"], ["/projects", "Projets"], ["/work", "Expériences"], ["/about", "À propos"], ["/uses", "Uses"], ["/blog", "Essais"], ["/en/portfolio", "Home (EN)"], ["/en/projects", "Projects (EN)"], ["/en/work", "Experience (EN)"], ["/en/about", "About (EN)"], ["/en/uses", "Uses (EN)"]]
export function SectionLibrary({ rect, onPick, onClose }: { rect: { left: number; top: number }; onPick: (html: string, label: string) => void; onClose: () => void }) {
  const [route, setRoute] = useState(SITE_ROUTES[0][0]); const [items, setItems] = useState<{ name: string; preview: string; html: string }[] | null>(null); const [err, setErr] = useState("")
  const [extra, setExtra] = useState<[string, string][]>([])
  useEffect(() => { studioApi<{ draft: { pages: { slug: string; title: string }[] } }>("/api/studio/content/pages?draftOnly=1").then(r => setExtra(r.draft.pages.map(p => [`/p/${p.slug}`, p.title.replace(/[\u2060\u200c\u200d]/g, "")] as [string, string]))).catch(() => {}) }, [])
  useEffect(() => {
    let off = false; setItems(null); setErr("")
    fetch(route, { cache: "no-store" }).then(r => r.text()).then(t => {
      if (off) return; const doc = new DOMParser().parseFromString(t, "text/html"); const main = doc.querySelector("main")
      if (!main) { setItems([]); return }
      setItems([...main.children].filter(e => !["STYLE", "SCRIPT", "TEMPLATE"].includes(e.tagName)).map(el => {
        const txt = (el.textContent || "").replace(/[\u2060\u200c\u200d]/g, "").replace(/\s+/g, " ").trim()
        const h = (el.querySelector("h1,h2,h3")?.textContent || "").replace(/[\u2060\u200c\u200d]/g, "").trim()
        return { name: h.slice(0, 50) || txt.slice(0, 50) || el.tagName.toLowerCase(), preview: txt.slice(0, 110), html: snapshotElement(el) }
      }).filter(i => i.html.trim()))
    }).catch(e => !off && setErr(String(e.message || e)))
    return () => { off = true }
  }, [route])
  return (
    <div data-studio-ui style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 400, rect.left - 40)), top: Math.max(8, Math.min(window.innerHeight - 520, rect.top)), width: 390, pointerEvents: "auto" }} className="rounded-lg border border-border bg-background p-2 shadow-2xl">
      <div className="mb-2 flex items-center justify-between px-2 pt-1 text-xs font-medium">Sections existantes du site<button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-3.5 w-3.5" /></button></div>
      <select className={field + " mb-2"} value={route} onChange={e => setRoute(e.target.value)}>{[...SITE_ROUTES, ...extra].map(([r, l]) => <option key={r} value={r}>{l} — {r}</option>)}</select>
      <div className="max-h-[420px] space-y-1 overflow-y-auto">
        {err && <p className="p-2 text-[11px] text-red-500">{err}</p>}
        {items === null && !err && <p className="p-2 text-xs text-muted-foreground">Chargement de la page…</p>}
        {items && items.length === 0 && <p className="p-2 text-xs text-muted-foreground">Aucune section trouvée sur cette page.</p>}
        {items?.map((it, i) => (<button key={i} className="block w-full rounded-md border border-border px-2.5 py-2 text-left text-xs hover:border-foreground/50 hover:bg-muted" onClick={() => onPick(it.html, `${it.name} · ${route}`)}><span className="font-medium">{it.name}</span><span className="mt-0.5 block text-[11px] text-muted-foreground">{it.preview}</span></button>))}
      </div>
      <p className="mt-2 px-1 text-[10px] text-muted-foreground">Copie fidèle de l&apos;apparence. Les interactions (carrousels, formulaires) ne sont pas reprises ; les textes et images de la copie se modifient ensuite librement.</p>
    </div>
  )
}

/* ---------- pages ---------- */
type PageRow = { slug: string; title: string; description?: string; blocks: unknown[] }
export function PagesPanel({ onClose, onChanged }: { onClose: () => void; onChanged: (goto?: string) => void }) {
  const [pages, setPages] = useState<PageRow[] | null>(null); const [title, setTitle] = useState(""); const [err, setErr] = useState("")
  const load = useCallback(() => studioApi<{ draft: { pages: PageRow[] } }>("/api/studio/content/pages?draftOnly=1").then(r => setPages(r.draft.pages)).catch(e => setErr(e.message)), [])
  useEffect(() => { load() }, [load])
  const create = async () => {
    const t = title.trim(); if (!t) return; let slug = slugify(t); const taken = new Set((pages || []).map(p => p.slug)); let n = 2; while (taken.has(slug)) slug = `${slugify(t)}-${n++}`
    try {
      await post("/api/studio/patch", { key: "pages", op: "insert", path: ["pages"], value: { slug, title: t, description: "", blocks: [BLOCK_TYPES[0].make(newId()), BLOCK_TYPES[1].make(newId())].map((b: any, i) => (i === 0 ? { ...b, title: t, eyebrow: "NOUVELLE PAGE" } : b)) } })
      setTitle(""); onChanged(`/p/${slug}`)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  const set = async (i: number, k: "title" | "description", v: string) => { setPages(p => p && p.map((x, j) => (j === i ? { ...x, [k]: v } : x))); try { await post("/api/studio/patch", { key: "pages", op: "set", path: ["pages", String(i), k], value: v }) } catch (e) { setErr(String(e)) } }
  const del = async (i: number) => { if (!window.confirm("Supprimer cette page et ses sections ?")) return; try { await post("/api/studio/patch", { key: "pages", op: "remove", path: ["pages", String(i)] }); await load(); onChanged() } catch (e) { setErr(String(e)) } }
  return (
    <Panel title="Pages ajoutées" onClose={onClose} width={360}>
      <div className="mb-3 flex gap-1.5"><input className={field} placeholder="Titre de la nouvelle page" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && create()} /><button className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1 text-xs text-background" onClick={create}><Plus className="h-3.5 w-3.5" />Créer</button></div>
      {pages === null ? <p className="text-xs text-muted-foreground">Chargement…</p> : pages.length === 0 ? <p className="text-xs text-muted-foreground">Aucune page ajoutée. Une page créée ici s&apos;ouvre sur <code>/p/identifiant</code>, avec ses sections modifiables comme le reste du site. Pour la relier au site, ajoutez une section « Appel à l&apos;action » ou « Cartes » avec le lien <code>/p/identifiant</code>.</p> : (
        <div className="space-y-3">{pages.map((p, i) => (
          <div key={p.slug} className="space-y-1.5 rounded-lg border border-border p-2.5 text-xs">
            <div className="flex items-center gap-1.5"><a className="inline-flex flex-1 items-center gap-1 truncate font-medium underline" href={`/p/${p.slug}`}>/p/{p.slug}<ExternalLink className="h-3 w-3" /></a><button className="rounded p-1 text-red-500 hover:bg-muted" onClick={() => del(i)} title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button></div>
            <input className={field} defaultValue={p.title} onBlur={e => e.target.value !== p.title && set(i, "title", e.target.value)} placeholder="Titre (onglet du navigateur)" />
            <input className={field} defaultValue={p.description || ""} onBlur={e => e.target.value !== (p.description || "") && set(i, "description", e.target.value)} placeholder="Description (référencement)" />
          </div>))}</div>)}
      {err && <p className="mt-2 text-[11px] text-red-500">{err}</p>}
    </Panel>
  )
}

/** Fenêtre de demande à Claude (section ou essai) : studio seulement. */
export function AiPromptDialog({ rect, title, hint, withType, busy, onSubmit, onClose }: { rect: { left: number; top: number }; title: string; hint: string; withType?: boolean; busy?: boolean; onSubmit: (prompt: string, type: string) => void; onClose: () => void }) {
  const [prompt, setPrompt] = useState(""); const [type, setType] = useState("")
  return (
    <div data-studio-ui style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 400, rect.left)), top: Math.max(8, Math.min(window.innerHeight - 300, rect.top + 30)), width: 390, pointerEvents: "auto", zIndex: 2147483000 }} className="rounded-xl border border-border bg-background p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between text-sm font-medium">✨ {title}<button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <textarea autoFocus className="w-full resize-y rounded-md border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-foreground/60" rows={5} placeholder={hint} value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && prompt.trim() && !busy) onSubmit(prompt, type) }} />
      {withType && <select className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs" value={type} onChange={e => setType(e.target.value)}><option value="">Type : au choix de Claude</option>{BLOCK_TYPES.filter(b => b.type !== "divider" && b.type !== "gallery").map(b => <option key={b.type} value={b.type}>{b.label}</option>)}</select>}
      <div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Envoyé à Claude. Le résultat est un brouillon à relire (souligné en violet).</span>
        <button className="inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40" disabled={!prompt.trim() || busy} onClick={() => onSubmit(prompt, type)}>{busy ? "Claude écrit…" : "Générer ⌘↵"}</button></div>
    </div>
  )
}
