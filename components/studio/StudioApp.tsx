"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Check, ExternalLink, Loader2, Monitor, RefreshCw, Smartphone, Upload as UploadIcon, Code2, ListTree, PanelRightClose, PanelRightOpen } from "lucide-react"
import { ChangesDialog, useStudioChanges } from "@/components/studio/ChangesDialog"
import { JsonEditor, RawJsonEditor } from "@/components/studio/JsonEditor"
import ArticlesPanel from "@/components/studio/ArticlesPanel"
import { AiPromptDialog } from "@/components/studio/EditorPanels"
import { type Json } from "@/lib/studio/json-utils"
import type { ContentDef, ContentGroup } from "@/lib/site-content-registry"

const GROUPS: ContentGroup[] = ["Profil", "Projets & expérience", "Articles", "Pages", "Interface", "Anglais"]
const btn = "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground/50 disabled:opacity-40"

async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init); const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || j.note || `Erreur ${r.status}`)
  return j
}

async function shrink(file: File): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file
  try {
    const bm = await createImageBitmap(file); const k = Math.min(1, 2000 / Math.max(bm.width, bm.height)); if (k === 1 && file.size < 1_200_000) return file
    const cv = document.createElement("canvas"); cv.width = Math.round(bm.width * k); cv.height = Math.round(bm.height * k); cv.getContext("2d")!.drawImage(bm, 0, 0, cv.width, cv.height)
    const blob: Blob | null = await new Promise(r => cv.toBlob(r, "image/webp", 0.88)); return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" }) : file
  } catch { return file }
}

export default function StudioApp({ defs }: { defs: ContentDef[] }) {
  const [active, setActive] = useState(defs[0].key)
  const def = useMemo(() => defs.find(d => d.key === active)!, [defs, active])
  const [data, setData] = useState<Json | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [error, setError] = useState("")
  const [raw, setRaw] = useState(false)
  const [artMode, setArtMode] = useState(false)
  const chg = useStudioChanges(); const { changes, conflicts, backend, refresh: refreshChanges } = chg
  const [showChanges, setShowChanges] = useState(false)
  const [preview, setPreview] = useState(true)
  const [mobile, setMobile] = useState(false)
  const [previewPath, setPreviewPath] = useState(defs[0].preview || "/portfolio")
  const [nonce, setNonce] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<Json | null>(null)

  const flush = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    const d = pending.current; if (d === null) return; pending.current = null
    setSaveState("saving")
    try { await api(`/api/studio/content/${active}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: d }) }); setSaveState("saved"); setError(""); setNonce(n => n + 1); refreshChanges() }
    catch (e) { setSaveState("error"); setError(e instanceof Error ? e.message : String(e)) }
  }, [active, refreshChanges])

  const select = async (key: string) => {
    await flush(); setArtMode(false); setActive(key); const d = defs.find(x => x.key === key)!; setPreviewPath(d.preview || previewPath); setLoading(true); setRaw(false); setSaveState("idle")
  }
  useEffect(() => {
    let off = false; setLoading(true)
    api<{ draft: Json }>(`/api/studio/content/${active}`).then(r => { if (!off) { setData(r.draft); setLoading(false); setError("") } }).catch(e => { if (!off) { setError(e.message); setLoading(false) } })
    return () => { off = true }
  }, [active])

  const edit = (v: Json) => { setData(v); pending.current = v; setSaveState("saving"); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(flush, 900) }
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (pending.current !== null) { e.preventDefault() } }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h) }, [])

  const upload = useCallback(async (file: File) => {
    const fd = new FormData(); fd.append("file", await shrink(file)); const r = await api<{ path: string }>("/api/studio/upload", { method: "POST", body: fd }); refreshChanges(); return r.path
  }, [refreshChanges])

  useEffect(() => { if (new URLSearchParams(window.location.search).get("changes") === "1") { refreshChanges(); setShowChanges(true) } }, [refreshChanges])
  const changedKeys = useMemo(() => new Set(changes.map(c => c.path)), [changes])
  const isChanged = (d: ContentDef) => changedKeys.has(`content/site/${d.file}`)
  const label = (p: string) => p.startsWith("content/articles") ? "Articles : " + (p.match(/^content\/articles\/([^/]+)/)?.[1] ?? "liste") : defs.find(d => `content/site/${d.file}` === p)?.label ?? p.replace(/^public\//, "")

  const onChanged = async () => { try { const r = await api<{ draft: Json }>(`/api/studio/content/${active}`); setData(r.draft) } catch { /* ignore */ } setNonce(n => n + 1) }

  const previewSrc = `${previewPath}${previewPath.includes("?") ? "&" : "?"}_s=${nonce}`
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5">
        <div className="font-medium">Studio</div>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-600">Copie privée — rien n&apos;est public avant « Publier »</span>
        {backend && <span className="text-xs text-muted-foreground">stockage : {backend === "github" ? "GitHub (branche brouillon)" : "fichiers locaux"}</span>}
        <div className="flex-1" />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          {saveState === "saving" && <><Loader2 className="h-3.5 w-3.5 animate-spin" />Enregistrement…</>}{saveState === "saved" && <><Check className="h-3.5 w-3.5 text-emerald-500" />Brouillon enregistré</>}{saveState === "error" && <span className="text-red-500">Échec</span>}
        </span>
        <button className={btn} onClick={() => { refreshChanges(); setShowChanges(true) }}>Changements{changes.length > 0 && <span className="rounded-full bg-foreground px-1.5 text-xs text-background">{changes.length}</span>}</button>
        <button className={btn + " bg-foreground text-background hover:border-foreground"} disabled={!changes.length || conflicts.length > 0} onClick={() => { refreshChanges(); setShowChanges(true) }}><UploadIcon className="h-4 w-4" />Publier…</button>
      </header>
      {conflicts.length > 0 && <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-700">{conflicts.length} fichier(s) modifié(s) aussi sur le site publié : <button className="underline" onClick={() => setShowChanges(true)}>résoudre avant de publier</button></div>}
      {error && <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</div>}
      <div className="flex min-h-0 flex-1">
        <nav className="w-64 shrink-0 overflow-y-auto border-r border-border p-3 text-sm">
          {GROUPS.map(g => (
            <div key={g} className="mb-4">
              <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g}</div>
              {defs.filter(d => d.group === g).map(d => (
                <button key={d.key} onClick={() => select(d.key)} className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-muted ${d.key === active ? "bg-muted font-medium" : ""}`}>
                  <span className="truncate">{d.label}</span>{isChanged(d) && <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" title="Modifié, non publié" />}
                </button>
              ))}
            </div>
          ))}
          <div className="mb-4">
            <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Articles</div>
            <button onClick={async () => { await flush(); setArtMode(true) }} className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-muted ${artMode ? "bg-muted font-medium" : ""}`}>
              <span>Articles</span>{[...changedKeys].some(p => p.startsWith("content/articles")) && <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" title="Modifié, non publié" />}
            </button>
          </div>
        </nav>
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            {artMode ? <><h1 className="mb-4 text-xl font-medium">Articles</h1><ArticlesPanel onOpen={p => { setPreviewPath(p); setPreview(true); setNonce(n => n + 1) }} onChanged={() => { refreshChanges() }} /></> : <>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div><h1 className="text-xl font-medium">{def.label}</h1>{def.hint && <p className="text-sm text-muted-foreground">{def.hint}</p>}</div>
              <div className="flex-1" />
              <button className={btn} onClick={() => setRaw(!raw)}>{raw ? <><ListTree className="h-4 w-4" />Formulaire</> : <><Code2 className="h-4 w-4" />JSON brut</>}</button>
            </div>
            {loading || data === null ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement…</div>
              : raw ? <RawJsonEditor key={active} value={data} onChange={edit} /> : <JsonEditor key={active} value={data} onChange={edit} upload={upload} />}
            </>}
          </div>
        </main>
        {preview ? (
          <aside className="hidden w-[44%] min-w-[360px] shrink-0 flex-col border-l border-border lg:flex">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <input className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs" value={previewPath} onChange={e => setPreviewPath(e.target.value)} aria-label="Page d'aperçu" />
              <button className={btn + " px-2"} onClick={() => setMobile(!mobile)} title="Largeur mobile / bureau">{mobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}</button>
              <button className={btn + " px-2"} onClick={() => setNonce(n => n + 1)} title="Recharger"><RefreshCw className="h-4 w-4" /></button>
              <a className={btn + " px-2"} href={previewPath} target="_blank" rel="noreferrer" title="Ouvrir"><ExternalLink className="h-4 w-4" /></a>
              <button className={btn + " px-2"} onClick={() => setPreview(false)} title="Masquer l'aperçu"><PanelRightClose className="h-4 w-4" /></button>
            </div>
            <div className="flex min-h-0 flex-1 justify-center bg-muted/30"><iframe key={previewPath + nonce} src={previewSrc} title="Aperçu du site" className={`h-full border-0 bg-background ${mobile ? "w-[390px] shadow-lg" : "w-full"}`} /></div>
          </aside>
        ) : <button className="hidden border-l border-border px-2 text-muted-foreground hover:text-foreground lg:block" onClick={() => setPreview(true)} title="Afficher l'aperçu"><PanelRightOpen className="h-4 w-4" /></button>}
      </div>
      <ChangesDialog open={showChanges} onOpenChange={setShowChanges} state={chg} onChanged={onChanged} />
    </div>
  )
}
