"use client"
import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"
import { AiPromptDialog } from "@/components/studio/EditorPanels"

type Row = { slug: string; title: string; status: "draft" | "public"; notes: number; subs: number; images: number; published?: string }
const btn = "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground/50 disabled:opacity-40"

export default function ArticlesPanel({ onOpen, onChanged }: { onOpen: (path: string) => void; onChanged: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState("")
  const load = useCallback(async () => {
    try { const r = await fetch("/api/studio/articles"); const j = await r.json(); if (!r.ok) throw new Error(j.error || `Erreur ${r.status}`); setRows(j.articles); setError("") } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }, [])
  useEffect(() => { load() }, [load])
  const setStatus = async (slug: string, status: "draft" | "public") => {
    setBusy(slug)
    try { const r = await fetch("/api/studio/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, status }) }); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Erreur ${r.status}`); await load(); onChanged() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }
  const [naming, setNaming] = useState(false), [title, setTitle] = useState(""), [aiDlg, setAiDlg] = useState(false)
  const writeAi = async (prompt: string) => {
    setBusy("ai")
    try { const r = await fetch("/api/studio/ai/article", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || `Erreur ${r.status}`); location.href = `/studio/write/article/${j.slug}` }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); setAiDlg(false); setBusy("") }
  }
  const create = async () => {
    setBusy("new")
    try { const r = await fetch("/api/studio/new/article", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || `Erreur ${r.status}`); setNaming(false); setTitle(""); await load(); onChanged(); location.href = `/studio/write/article/${j.slug}` }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy("") }
  }
  return (
    <div className="space-y-4">
      {naming ? <div className="flex flex-wrap items-center gap-2"><input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") create() }} placeholder="Titre du dossier" className="min-w-[16rem] flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm" /><button className={btn} disabled={busy === "new"} onClick={create}>Créer et ouvrir</button><button className={btn} onClick={() => setNaming(false)}>Annuler</button></div> : <div className="flex flex-wrap gap-2"><button className={btn} onClick={() => setNaming(true)}>+ Nouvel article vierge</button><button className={btn + " border-violet-500/50"} disabled={busy === "ai"} onClick={() => setAiDlg(true)}>{busy === "ai" ? "Claude écrit…" : "✨ Nouvel article avec Claude"}</button></div>}
      {aiDlg && <AiPromptDialog rect={{ left: 380, top: 90 }} title="Nouvel article avec Claude" hint="De quoi parle l'article ? Votre thèse, le ton, la longueur, les idées à défendre… (Claude n'inventera ni chiffres ni sources)" busy={busy === "ai"} onSubmit={pr => writeAi(pr)} onClose={() => setAiDlg(false)} />}
      <p className="text-sm text-muted-foreground">Un seul type d'écrit : l'article (essai d'opinion ou dossier sourcé, avec ou sans graphiques et sources). « ✎ Écrire » ouvre l'éditeur ; « Ouvrir et annoter » ajoute notes, images et sous-articles (sélectionnez du texte). Rien n&apos;est visible du public tant que vous n&apos;avez pas passé l&apos;article en « public » <em>et</em> cliqué sur « Publier… ». Les échanges avec l&apos;IA ne sont jamais publiés.</p>
      {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</div>}
      {!rows ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement…</div> : rows.map(a => (
        <div key={a.slug} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-xs ${a.status === "public" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" : "border-amber-500/40 bg-amber-500/10 text-amber-600"}`}>{a.status === "public" ? "Public après publication" : "Brouillon"}</span>
            <span className="text-xs text-muted-foreground">{a.notes} note(s) · {a.subs} sous-article(s) · {a.images} image(s)</span>
          </div>
          <h3 className="mt-2 font-medium">{a.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={btn} onClick={() => onOpen(`/articles/${a.slug}`)}><ExternalLink className="h-4 w-4" />Ouvrir et annoter</button>
            <a className={btn} href={`/studio/write/article/${a.slug}`}>✎ Écrire</a>
            <button className={btn} disabled={busy === a.slug} onClick={() => setStatus(a.slug, a.status === "public" ? "draft" : "public")}>{a.status === "public" ? "Repasser en brouillon" : "Marquer comme public"}</button>
          </div>
        </div>
      ))}
    </div>
  )
}
