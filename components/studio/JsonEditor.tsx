"use client"
// Éditeur générique de contenu JSON : champs texte, longs textes, nombres, interrupteurs, images (téléversement), listes
// (ajouter / dupliquer / déplacer / supprimer) et objets. Aucune configuration par contenu : la forme vient des données.
import { useRef, useState, memo } from "react"
import { ChevronDown, ChevronRight, Copy, ImagePlus, Plus, Trash2, ArrowUp, ArrowDown, X } from "lucide-react"
import { blank, humanize, isImageKey, isLongText, itemTitle, looksLikeImage, type Json } from "@/lib/studio/json-utils"

type Upload = (file: File) => Promise<string>
type Props = { value: Json; onChange: (v: Json) => void; label?: string; k?: string; depth?: number; upload: Upload }

const cls = {
  input: "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/60",
  btn: "inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/50 disabled:opacity-40",
}

function AutoTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  return (
    <textarea ref={ref} className={cls.input + " min-h-[4.5rem] resize-y leading-relaxed"} value={value} rows={Math.min(14, Math.max(3, Math.ceil(value.length / 90) + value.split("\n").length - 1))}
      onChange={e => onChange(e.target.value)} />
  )
}

function ImageField({ value, onChange, upload }: { value: string; onChange: (v: string) => void; upload: Upload }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("")
  const pick = async (f?: File | null) => { if (!f) return; setBusy(true); setErr(""); try { onChange(await upload(f)) } catch (e) { setErr(e instanceof Error ? e.message : "échec") } finally { setBusy(false) } }
  const showable = value && (value.startsWith("/") || value.startsWith("http"))
  return (
    <div className="flex gap-3 items-start">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40 flex items-center justify-center">
        {showable ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-full w-full object-cover" onError={e => ((e.target as HTMLImageElement).style.opacity = "0.2")} /> : <ImagePlus className="h-5 w-5 text-muted-foreground/60" />}
      </div>
      <div className="flex-1 space-y-1.5">
        <input className={cls.input} value={value} placeholder="/chemin/image.png ou https://…" onChange={e => onChange(e.target.value)} />
        <div className="flex items-center gap-2">
          <label className={cls.btn + " cursor-pointer"}><ImagePlus className="h-3.5 w-3.5" />{busy ? "Envoi…" : "Téléverser une image"}<input type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => { pick(e.target.files?.[0]); e.target.value = "" }} /></label>
          {err && <span className="text-xs text-red-500">{err}</span>}
        </div>
      </div>
    </div>
  )
}

function Node({ value, onChange, label, k = "", depth = 0, upload }: Props) {
  if (typeof value === "string") {
    const img = isImageKey(k) || (looksLikeImage(value) && !value.includes(" "))
    return (
      <Row label={label}>
        {img ? <ImageField value={value} onChange={onChange as (v: string) => void} upload={upload} />
          : isLongText(k, value) ? <AutoTextarea value={value} onChange={onChange as (v: string) => void} />
          : <input className={cls.input} value={value} onChange={e => onChange(e.target.value)} />}
      </Row>
    )
  }
  if (typeof value === "number") return <Row label={label}><input type="number" className={cls.input + " max-w-[10rem]"} value={value} onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></Row>
  if (typeof value === "boolean") return (
    <Row label={label}><button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`h-6 w-11 rounded-full border border-border transition-colors ${value ? "bg-foreground" : "bg-muted"}`}><span className={`block h-4 w-4 rounded-full bg-background transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} /></button></Row>
  )
  if (value === null) return <Row label={label}><button type="button" className={cls.btn} onClick={() => onChange("")}>Valeur vide — ajouter un texte</button></Row>
  if (Array.isArray(value)) return <ListNode value={value} onChange={onChange} label={label} k={k} depth={depth} upload={upload} />
  return <ObjectNode value={value as { [k: string]: Json }} onChange={onChange} label={label} depth={depth} upload={upload} />
}
const NodeM = memo(Node)

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return <div className="space-y-1">{label && <div className="text-xs font-medium text-muted-foreground">{label}</div>}{children}</div>
}

function ObjectNode({ value, onChange, label, depth, upload }: { value: { [k: string]: Json }; onChange: (v: Json) => void; label?: string; depth: number; upload: Upload }) {
  const [open, setOpen] = useState(false)
  const keys = Object.keys(value).length
  // blocs de premier niveau (ex. une page ou un composant dans « tous les textes ») : repliés par défaut
  if (depth === 1 && keys > 3) return (
    <div className="rounded-lg border border-border/70">
      <button type="button" className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm font-medium" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}<span>{label}</span><span className="text-xs font-normal text-muted-foreground">({keys})</span>
      </button>
      {open && <div className="space-y-3 border-t border-border/70 p-3">{Object.entries(value).map(([key, v]) => <NodeM key={key} k={key} label={humanize(key)} value={v} depth={depth + 1} upload={upload} onChange={nv => onChange({ ...value, [key]: nv })} />)}</div>}
    </div>
  )
  const wrap = (children: React.ReactNode) => depth === 0 ? <div className="space-y-4">{children}</div> : <div className="space-y-3 rounded-lg border border-border/70 p-3">{label && <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>}{children}</div>
  return wrap(Object.entries(value).map(([key, v]) => (
    <NodeM key={key} k={key} label={humanize(key)} value={v} depth={depth + 1} upload={upload} onChange={nv => onChange({ ...value, [key]: nv })} />
  )))
}

function ListNode({ value, onChange, label, k, depth, upload }: { value: Json[]; onChange: (v: Json) => void; label?: string; k: string; depth: number; upload: Upload }) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const primitives = value.every(x => typeof x === "string")
  const objects = value.length > 0 && value.every(x => x && typeof x === "object" && !Array.isArray(x))
  const set = (i: number, v: Json) => onChange(value.map((x, j) => (j === i ? v : x)))
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= value.length) return; const n = [...value]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); setOpen({}) }
  const remove = (i: number) => { if (window.confirm("Supprimer cet élément ?")) { onChange(value.filter((_, j) => j !== i)); setOpen({}) } }
  const dup = (i: number) => onChange([...value.slice(0, i + 1), JSON.parse(JSON.stringify(value[i])), ...value.slice(i + 1)])
  const add = () => onChange([...value, value.length ? blank(value[value.length - 1]) : primitives || k.match(/tags|images|steps|features|results|categories|technologies|items/i) ? "" : ""])
  if (value.length > 0 && !primitives && !objects) return <RawNode value={value} onChange={onChange} label={label} />
  return (
    <div className="space-y-2">
      {label && <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label} <span className="font-normal normal-case text-muted-foreground/70">({value.length})</span></div>}
      {(primitives || value.length === 0) ? (
        <div className="space-y-1.5">
          {value.map((x, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {isImageKey(k) || (typeof x === "string" && looksLikeImage(x as string) && !(x as string).includes(" ")) ? <div className="flex-1"><ImageField value={x as string} onChange={v => set(i, v)} upload={upload} /></div>
                : typeof x === "string" && isLongText("", x) ? <div className="flex-1"><AutoTextarea value={x} onChange={v => set(i, v)} /></div>
                : <input className={cls.input} value={x as string} onChange={e => set(i, e.target.value)} />}
              <button type="button" className={cls.btn} onClick={() => move(i, -1)} aria-label="Monter"><ArrowUp className="h-3 w-3" /></button>
              <button type="button" className={cls.btn} onClick={() => move(i, 1)} aria-label="Descendre"><ArrowDown className="h-3 w-3" /></button>
              <button type="button" className={cls.btn} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Retirer"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {value.map((x, i) => {
            const isOpen = !!open[i]
            return (
              <div key={i} className="rounded-lg border border-border">
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <button type="button" className="flex flex-1 items-center gap-1.5 text-left text-sm font-medium" onClick={() => setOpen({ ...open, [i]: !isOpen })}>
                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}<span className="truncate">{itemTitle(x, i)}</span>
                  </button>
                  <button type="button" className={cls.btn} onClick={() => move(i, -1)} aria-label="Monter"><ArrowUp className="h-3 w-3" /></button>
                  <button type="button" className={cls.btn} onClick={() => move(i, 1)} aria-label="Descendre"><ArrowDown className="h-3 w-3" /></button>
                  <button type="button" className={cls.btn} onClick={() => dup(i)} aria-label="Dupliquer"><Copy className="h-3 w-3" /></button>
                  <button type="button" className={cls.btn} onClick={() => remove(i)} aria-label="Supprimer"><Trash2 className="h-3 w-3" /></button>
                </div>
                {isOpen && <div className="border-t border-border/70 p-3"><NodeM value={x} depth={depth + 1} upload={upload} onChange={v => set(i, v)} /></div>}
              </div>
            )
          })}
        </div>
      )}
      <button type="button" className={cls.btn} onClick={add}><Plus className="h-3 w-3" /> Ajouter</button>
    </div>
  )
}

function RawNode({ value, onChange, label }: { value: Json; onChange: (v: Json) => void; label?: string }) {
  const [txt, setTxt] = useState(JSON.stringify(value, null, 2)); const [err, setErr] = useState("")
  return (
    <Row label={label}>
      <textarea className={cls.input + " font-mono text-xs"} rows={8} value={txt} onChange={e => { setTxt(e.target.value); try { onChange(JSON.parse(e.target.value)); setErr("") } catch { setErr("JSON invalide — non appliqué") } }} />
      {err && <div className="text-xs text-red-500">{err}</div>}
    </Row>
  )
}

export function JsonEditor(props: Props) { return <NodeM {...props} depth={0} /> }
export function RawJsonEditor({ value, onChange }: { value: Json; onChange: (v: Json) => void }) { return <RawNode value={value} onChange={onChange} /> }
