"use client"
// Plan guidé (modèle de décision) : fenêtre commune aux éditeurs d'écriture.
import { useEffect, useState } from "react"

type Sec = { heading: string; goal: string; format: string; why: string; needs: string; intent: string; chart: { intent: string; label: string; options: { type: string; when: string; fresh: boolean }[] } | null }
export type PlanSec = Sec
export function PlanDialog({ plan, aiOn, onRun, onInsert, onClose, initial = "", autorun = false }: { plan: { busy: boolean; sections: Sec[]; thesis: string; msg: string }; aiOn: boolean | null; onRun: (p: string) => void; onInsert: (s: Sec[]) => void; onClose: () => void; initial?: string; autorun?: boolean }) {
  const [t, setT] = useState(initial)
  useEffect(() => { if (autorun && initial && aiOn) onRun(initial) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const FMT: Record<string, string> = { paragraphe: "¶", liste: "•", tableau: "▦", citation: "❝", image: "▣", graphique: "▤", schéma: "◇" }
  return <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-5 shadow-2xl">
      <div className="flex items-center"><h2 className="font-medium">✨ Plan guidé : le bon format pour chaque partie</h2><div className="flex-1" /><button onClick={onClose} className="rounded px-2 hover:bg-muted">×</button></div>
      <p className="mt-1 text-xs text-muted-foreground">Décrivez le sujet ou la thèse. Claude propose les parties et, pour chacune, le format qui sert le mieux l&apos;idée (modèle de décision : texte, liste, tableau, graphique…) en expliquant pourquoi. Pour un graphique, il propose les formes classées par le modèle de décision. Rien n&apos;est inventé : les données restent à fournir.</p>
      <textarea autoFocus value={t} onChange={e => setT(e.target.value)} rows={3} placeholder="Ex. : pourquoi les petites équipes gagneront avec les agents IA, avec des exemples concrets et une comparaison chiffrée" className="mt-3 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none" />
      <div className="mt-2 flex items-center gap-2"><button disabled={plan.busy || !t.trim() || aiOn === false} onClick={() => onRun(t)} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40">{plan.busy ? "Claude réfléchit…" : "Proposer un plan"}</button>{aiOn === false && <span className="text-xs text-red-500">IA indisponible : ANTHROPIC_API_KEY absente de ce studio</span>}</div>
      {plan.msg && <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{plan.msg}</p>}
      {plan.sections.length > 0 && <>
        {plan.thesis && <p className="mt-4 text-sm"><b>Thèse :</b> {plan.thesis}</p>}
        <ol className="mt-3 space-y-2">{plan.sections.map((s, i) => <li key={i} className="rounded-lg border border-border p-3 text-sm">
          <div className="flex items-start gap-2"><span className="mt-0.5 rounded-md border border-border px-1.5 py-0.5 text-xs">{FMT[s.format] || "¶"} {s.format}</span><b className="flex-1">{s.heading}</b></div>
          {s.goal && <p className="mt-1 text-muted-foreground">{s.goal}</p>}
          {s.why && <p className="mt-1 text-xs"><i>Pourquoi ce format :</i> {s.why}</p>}
          {s.needs && <p className="mt-1 text-xs text-muted-foreground"><i>Données à fournir :</i> {s.needs}</p>}
          {s.chart && <div className="mt-2 text-xs"><span className="text-muted-foreground">{s.chart.label} →</span> {s.chart.options.map(o => <span key={o.type} title={o.when} className="mr-1.5 inline-block rounded-full border border-border px-2 py-0.5">{o.type}{o.fresh ? " · neuve" : ""}</span>)}</div>}
        </li>)}</ol>
        <p className="mt-3 text-xs text-muted-foreground">« Insérer » ajoute un titre et un paragraphe vide par partie. Les graphiques sont à construire dans un dossier (article), pas dans un essai.</p>
        <div className="mt-3 flex gap-2"><button onClick={() => onInsert(plan.sections)} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">Insérer le plan</button><button onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-sm">Fermer</button></div>
      </>}
    </div>
  </div>
}
