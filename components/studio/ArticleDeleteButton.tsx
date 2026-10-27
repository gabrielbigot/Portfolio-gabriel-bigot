"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

// Bouton « supprimer » d'une carte d'article, affiché seulement dans le studio.
export default function ArticleDeleteButton({ slug, title }: { slug: string; title: string }) {
  const [busy, setBusy] = useState(false)
  const del = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!window.confirm(`Supprimer « ${title} » ? Il disparaît de la liste (à publier pour le retirer du site) ; ses fichiers restent sur le disque.`)) return
    setBusy(true)
    try { const r = await fetch("/api/studio/articles", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }) }); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Échec"); location.reload() }
    catch (err) { setBusy(false); window.alert(err instanceof Error ? err.message : String(err)) }
  }
  return <button type="button" onClick={del} disabled={busy} title="Supprimer cet article" className="absolute right-3 top-3 z-10 rounded-md border border-border bg-background p-2 text-muted-foreground opacity-0 shadow transition-opacity hover:text-red-600 group-hover:opacity-100 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
}
