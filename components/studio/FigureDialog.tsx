"use client"
// Création d'un graphique à partir de données collées (modèle de décision) : dossiers (avec registre de sources) et essais (source en texte libre).
import { useEffect, useState } from "react"
import { studioApi } from "@/components/studio/ChangesDialog"
import FigureFrame from "@/components/FigureFrame"

type Raw = Record<string, any>
type Alt = { type: string; fit: number; when: string; uses: number; fresh: boolean; inLast2: boolean; why: string[] }
type Ev = { key: string; fact: string }
const api = <T,>(u: string, body: unknown) => studioApi<T>(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

/** aperçu vivant d'une figure avec le moteur des dossiers (cadre isolé) */
export function FigurePreview({ figure, source, evidence }: { figure: Raw; source?: string; evidence?: Raw[] }) { return <FigureFrame figure={figure} source={source} evidence={evidence} /> }

export default function FigureDialog({ prefill, endpoint, essay = false, intents, evidence, aiOn, onClose, onInsert }: { prefill?: { title: string; text: string; unit: string }; endpoint: string; essay?: boolean; intents: { id: string; label: string }[]; evidence: Ev[]; aiOn: boolean | null; onClose: () => void; onInsert: (fig: Raw, title: string, source: string) => void }) {
  const [title, setTitle] = useState(prefill?.title || ""); const [text, setText] = useState(prefill?.text || ""); const [unit, setUnit] = useState(prefill?.unit || ""); const [state, setState] = useState("claim"); const [src, setSrc] = useState(""); const [source, setSource] = useState(""); const [intent, setIntent] = useState("")
  const [res, setRes] = useState<null | { figure: Raw; alts: Alt[]; brief: Raw }>(null); const [cur, setCur] = useState<Raw | null>(null); const [curType, setCurType] = useState(""); const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [note, setNote] = useState("")
  const inp = "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none"
  const draft = async () => { setBusy("draft"); setErr(""); setNote("")
    try { const r = await api<{ figure: Raw; alts: Alt[]; brief: Raw }>(endpoint, { action: "draft", title, text, unit, state, src: essay ? (source ? "S1" : "") : src, intent }); setRes(r); setCur(r.figure); setCurType(String(r.figure.type)) } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy("") } }
  useEffect(() => { if (prefill?.text && prefill.title) draft() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const pick = async (type: string) => { if (!res) return; setBusy(type); setErr(""); setNote("")
    try { const r = await api<{ figure: Raw; missing: number[] }>(endpoint, { action: "convert", figure: res.figure, type }); setCur(r.figure); setCurType(type); if (r.missing?.length) setNote(`Attention : ${r.missing.length} valeur(s) de vos données absentes de la nouvelle forme (${r.missing.slice(0, 6).join(", ")}). Vérifiez l'aperçu.`) }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy("") } }
  return <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="w-full max-w-3xl rounded-xl border border-border bg-background p-5 shadow-2xl">
      <div className="flex items-center"><h2 className="font-medium">Nouveau graphique : le modèle de décision choisit la forme</h2><div className="flex-1" /><button onClick={onClose} className="rounded px-2 hover:bg-muted">×</button></div>
      <p className="mt-1 text-xs text-muted-foreground">Collez vos données (une ligne par élément : « libellé ; valeur », « libellé ; avant ; après », ou « 2019 ; valeur » pour une évolution). Rien n&apos;est inventé : le graphique ne contient que ce que vous collez. Sans source, les données sont marquées « affirmation ».</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre : ce que montre la figure (une affirmation)" className={inp + " sm:col-span-2"} />
        <textarea value={text} onChange={e => setText(e.target.value)} rows={7} placeholder={"France ; 12,5\nAllemagne ; 9,8\nEspagne ; 7,1"} className={inp + " font-mono sm:col-span-2"} />
        <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unité (%, M€, points…)" className={inp} />
        <select value={intent} onChange={e => setIntent(e.target.value)} className={inp}><option value="">Intention : automatique</option>{intents.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}</select>
        <select value={state} onChange={e => setState(e.target.value)} className={inp}><option value="claim">Affirmation (sans source)</option><option value="actual">Réel</option><option value="estimate">Estimation</option><option value="forecast">Prévision</option><option value="derived">Calculé</option></select>
        {essay ? <input value={source} onChange={e => { setSource(e.target.value); if (e.target.value && state === "claim") setState("actual") }} placeholder="Source (organisme, lien) — affichée sous le graphique" className={inp} />
          : <select value={src} onChange={e => { setSrc(e.target.value); if (e.target.value && state === "claim") setState("actual") }} className={inp}><option value="">Source : aucune</option>{evidence.map(e => <option key={e.key} value={e.key}>{e.key} — {e.fact.slice(0, 70)}</option>)}</select>}

      </div>
      <div className="mt-3 flex items-center gap-2"><button disabled={!!busy || !title.trim() || !text.trim()} onClick={draft} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40">{busy === "draft" ? "…" : "Proposer des graphiques"}</button><span className="text-xs text-muted-foreground">{essay ? "Données telles que vous les collez : rien n'est inventé." : "Sources : ajoutez-les d'abord via « Citer une source »."}</span></div>
      {err && <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
      {res && cur && <div className="mt-4">
        <div className="mb-2 flex flex-wrap gap-1.5 text-xs">{[{ type: String(res.figure.type), fit: 0, when: "forme de départ (vos données telles quelles)", uses: 0, fresh: false, inLast2: false, why: [] } as Alt, ...res.alts.filter(a => a.type !== String(res.figure.type))].map(a => <button key={a.type} title={a.when + (a.why.length ? " — " + a.why.join(" ; ") : "")} disabled={!!busy || (a.type !== String(res.figure.type) && aiOn === false)} onClick={() => pick(a.type)}
          className={`rounded-full border px-2.5 py-1 hover:bg-muted disabled:opacity-40 ${curType === a.type ? "border-foreground bg-muted" : "border-border"}`}>{busy === a.type ? "…" : a.type}{a.fresh ? " · neuve" : a.uses ? ` · ${a.uses}× déjà` : ""}</button>)}</div>
        {aiOn === false && <p className="mb-2 text-xs text-muted-foreground">Sans clé IA, seule la forme de départ est disponible (la conversion vers une autre forme passe par Claude, sans changer vos données).</p>}
        <p className="mb-1 text-xs text-muted-foreground">{res.alts.find(a => a.type === curType)?.when || "Forme de départ"} · classement du modèle de décision selon vos données ({String(res.brief.n || "?")} éléments{res.brief.time ? ", temps" : ""}{res.brief.signed ? ", valeurs négatives" : ""}).</p>
        <div className="rounded-lg border border-border"><FigurePreview figure={cur} source={essay ? source : undefined} /></div>
        {note && <p className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">{note}</p>}
        <div className="mt-3 flex gap-2"><button onClick={() => onInsert(cur, title, source)} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">Insérer ce graphique</button><button onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-sm">Annuler</button></div>
      </div>}
    </div></div>
}
