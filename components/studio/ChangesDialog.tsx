"use client"
// État des modifications du brouillon (liste, conflits, annulation, publication) — partagé par le studio (formulaires) et l'éditeur direct sur le site.
import { useCallback, useEffect, useState } from "react"
import { Loader2, Upload as UploadIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { diffJson } from "@/lib/studio/json-utils"
import { CONTENT } from "@/lib/site-content-registry"

export type Change = { path: string; status: "modified" | "added" | "deleted"; before: string | null; after: string | null; binary: boolean }
const btn = "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground/50 disabled:opacity-40"
export const studioBtn = btn

export async function studioApi<T = any>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init); const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || j.note || `Erreur ${r.status}`)
  return j
}
const label = (p: string) => CONTENT.find(d => `content/site/${d.file}` === p)?.label ?? p.replace(/^public\//, "")

export function useStudioChanges() {
  const [changes, setChanges] = useState<Change[]>([]); const [conflicts, setConflicts] = useState<string[]>([]); const [backend, setBackend] = useState(""); const [error, setError] = useState("")
  const refresh = useCallback(async () => {
    try { const r = await studioApi<{ backend: string; changes: Change[]; conflicts?: string[] }>("/api/studio/changes"); setChanges(r.changes); setConflicts(r.conflicts || []); setBackend(r.backend); setError("") }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }, [])
  useEffect(() => { refresh() }, [refresh])
  return { changes, conflicts, backend, error, refresh, setError }
}

export function ChangesDialog({ open, onOpenChange, state, onChanged }: { open: boolean; onOpenChange: (o: boolean) => void; state: ReturnType<typeof useStudioChanges>; onChanged?: () => void }) {
  const { changes, conflicts, refresh } = state
  const [message, setMessage] = useState(""); const [publishing, setPublishing] = useState(false); const [notice, setNotice] = useState("")
  const [aiPending, setAiPending] = useState(0)
  useEffect(() => { if (!open) return; studioApi<{ items: Record<string, { status: string }> }>("/api/studio/ai-trace").then(r => setAiPending(Object.values(r.items || {}).filter(t => t.status === "ai").length)).catch(() => setAiPending(0)) }, [open, changes.length])
  const post = (url: string, body: unknown) => studioApi(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  const discard = async (path: string) => { if (!window.confirm("Annuler les modifications de ce fichier ? Il reprendra la version publiée.")) return; try { await post("/api/studio/discard", { path }); await refresh(); onChanged?.() } catch (e) { setNotice(e instanceof Error ? e.message : String(e)) } }
  const resolve = async (path: string, choice: "mine" | "theirs") => {
    if (choice === "theirs" && !window.confirm("Remplacer votre version de ce fichier par celle du site publié ? Vos modifications de ce fichier seront perdues.")) return
    try { await post("/api/studio/resolve", { path, choice }); await refresh(); onChanged?.() } catch (e) { setNotice(e instanceof Error ? e.message : String(e)) }
  }
  const publish = async () => {
    if (!window.confirm(`Publier ${changes.length} fichier(s) sur le site public ? Le site se met à jour après le redéploiement.`)) return
    setPublishing(true); setNotice("")
    try { const r = await post("/api/studio/publish", { message }); setNotice(r.note + (r.commit ? ` (commit ${r.commit})` : "")); setMessage(""); await refresh(); onChanged?.() } catch (e) { setNotice("Échec : " + (e instanceof Error ? e.message : String(e))) } finally { setPublishing(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-studio-ui className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>Modifications non publiées</DialogTitle><DialogDescription>Comparaison entre votre brouillon et le site public. Rien ne change en ligne tant que vous ne cliquez pas sur « Publier sur le site ».</DialogDescription></DialogHeader>
        {aiPending > 0 && <p className="rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm">✨ {aiPending} texte(s) écrit(s) par l'IA n'ont pas encore été relus (soulignés en pointillé violet sur les pages). La publication reste possible : relisez-les d'abord.</p>}
        {changes.length === 0 ? <p className="text-sm text-muted-foreground">Aucune modification : le brouillon est identique au site public.</p> : (
          <div className="space-y-4">
            {conflicts.length > 0 && (
              <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                <div className="font-medium text-amber-700">Conflits à résoudre</div>
                <p className="text-xs text-muted-foreground">Ces fichiers ont été modifiés à la fois dans votre brouillon et sur le site publié (autre appareil, autre publication). Les champs différents ont été fusionnés automatiquement ; seuls les champs modifiés des deux côtés sont en conflit. Votre version a été conservée en attendant votre choix.</p>
                {conflicts.map(path => (
                  <div key={path} className="flex flex-wrap items-center gap-2"><span className="flex-1 truncate font-medium">{label(path)}</span>
                    <button className={btn} onClick={() => resolve(path, "mine")}>Garder ma version</button><button className={btn} onClick={() => resolve(path, "theirs")}>Prendre la version publiée</button></div>
                ))}
              </div>
            )}
            {changes.map(c => {
              const diffs = c.binary ? [] : diffJson(c.before ? JSON.parse(c.before) : undefined, c.after ? JSON.parse(c.after) : undefined)
              return (
                <div key={c.path} className="rounded-lg border border-border">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.status === "added" ? "ajouté" : c.status === "deleted" ? "supprimé" : "modifié"}</span>
                    <span className="flex-1 truncate font-medium">{label(c.path)}</span>
                    <button className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => discard(c.path)}>Annuler ces modifications</button>
                  </div>
                  {c.binary ? <div className="p-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={c.path.replace(/^public/, "")} alt="" className="max-h-32 rounded border border-border" /></div>
                    : <ul className="max-h-64 divide-y divide-border/60 overflow-y-auto text-xs">
                      {diffs.slice(0, 80).map((d, i) => (<li key={i} className="px-3 py-1.5"><div className="font-medium text-muted-foreground">{d.path}</div><div className="grid grid-cols-2 gap-2"><span className="break-words text-red-500/90 line-through decoration-red-500/40">{d.before}</span><span className="break-words text-emerald-600">{d.after}</span></div></li>))}
                      {diffs.length > 80 && <li className="px-3 py-1.5 text-muted-foreground">… et {diffs.length - 80} autres différences</li>}
                    </ul>}
                </div>
              )
            })}
            <div className="space-y-2 border-t border-border pt-4">
              <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Description de la mise à jour (facultatif)" value={message} onChange={e => setMessage(e.target.value)} />
              <button className={btn + " bg-foreground text-background hover:border-foreground"} disabled={publishing || conflicts.length > 0} onClick={publish}>{publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" />}Publier sur le site</button>
            </div>
          </div>
        )}
        {notice && <p className="rounded-md border border-border bg-muted/50 p-3 text-sm">{notice}</p>}
      </DialogContent>
    </Dialog>
  )
}
