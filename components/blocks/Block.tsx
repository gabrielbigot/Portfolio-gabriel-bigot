// Sections « ajoutées » (content/site/pages.json) : rendu dans le style du site. Utilisé par les pages créées (/p/…) et par les sections
// ajoutées aux pages existantes. Les textes viennent des données : ils sont donc modifiables directement sur la page.
import type { ReactNode } from "react"
import { splitMark } from "@/lib/studio/stega"
import { isSafeHtml } from "@/lib/studio/html-safe"

export type BlockData = { id: string; type: string; [k: string]: any }

// Texte avec **gras** et [lien](adresse). Chaque morceau garde la signature du champ (édition directe).
function Rich({ value }: { value: string }): ReactNode {
  const { text, marker } = splitMark(String(value ?? ""))
  const paras = text.split(/\n{2,}/).filter(p => p.trim())
  return paras.map((p, i) => (
    <p key={i} className="leading-relaxed text-muted-foreground">
      {p.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).filter(Boolean).map((tok, j) => {
        const b = /^\*\*([^*]+)\*\*$/.exec(tok); if (b) return <strong key={j} className="font-medium text-foreground">{b[1] + marker}</strong>
        const l = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)
        if (l) { const href = /^(https?:\/\/|\/|mailto:|#)/.test(l[2]) ? l[2] : "#"; return <a key={j} href={href} className="underline underline-offset-4 hover:text-foreground">{l[1] + marker}</a> }
        return <span key={j}>{tok + marker}</span>
      })}
    </p>
  ))
}
const T = ({ v, className, as: As = "span" }: { v?: string; className?: string; as?: any }) => (v ? <As className={className}>{v}</As> : null)
const safeHref = (h?: string) => (h && /^(https?:\/\/|\/|mailto:|#)/.test(h) ? h : "#")

function Inner({ b }: { b: BlockData }): ReactNode {
  switch (b.type) {
    case "heading":
      return (<div className="space-y-4">
        <T v={b.eyebrow} as="div" className="text-sm text-muted-foreground font-mono tracking-wider" />
        <T v={b.title} as="h2" className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight" />
        <T v={b.subtitle} as="p" className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl" />
      </div>)
    case "text":
      return (<div className="space-y-4"><T v={b.title} as="h2" className="text-2xl sm:text-3xl font-light" /><div className="space-y-4 max-w-3xl">{b.body ? <Rich value={b.body} /> : null}</div></div>)
    case "imageText":
      return (<div className={`grid gap-8 items-center md:grid-cols-2 ${b.side === "left" ? "" : "md:[&>*:first-child]:order-2"}`}>
        {b.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.image} alt={b.alt || ""} className="w-full rounded-xl border border-border object-cover" /> : <div className="aspect-video rounded-xl border border-dashed border-border" />}
        <div className="space-y-4"><T v={b.title} as="h2" className="text-2xl sm:text-3xl font-light" />{b.body ? <Rich value={b.body} /> : null}</div>
      </div>)
    case "cards":
      return (<div className="space-y-6"><T v={b.title} as="h2" className="text-2xl sm:text-3xl font-light" />
        <div className={`grid gap-4 sm:grid-cols-2 ${b.columns === "3" ? "lg:grid-cols-3" : ""}`}>
          {(b.items || []).map((it: any, i: number) => {
            const inner = (<>{it.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.image} alt={it.alt || ""} className="mb-3 aspect-video w-full rounded-lg object-cover" /> : null}<T v={it.title} as="h3" className="font-medium" /><div className="mt-1.5 text-sm">{it.text ? <Rich value={it.text} /> : null}</div></>)
            return it.link ? <a key={i} href={safeHref(it.link)} className="block rounded-xl border border-border p-5 hover:border-muted-foreground/50 transition-colors">{inner}</a> : <div key={i} className="rounded-xl border border-border p-5">{inner}</div>
          })}
        </div></div>)
    case "gallery":
      return (<div className="space-y-6"><T v={b.title} as="h2" className="text-2xl sm:text-3xl font-light" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(b.images || []).map((im: any, i: number) => (
          <figure key={i} className="space-y-2">{im.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={im.image} alt={im.alt || ""} className="w-full rounded-lg border border-border object-cover" /> : <div className="aspect-video rounded-lg border border-dashed border-border" />}<T v={im.caption} as="figcaption" className="text-xs text-muted-foreground" /></figure>))}</div></div>)
    case "quote":
      return (<blockquote className="space-y-3 border-l-2 border-border pl-6"><T v={b.text} as="p" className="text-xl sm:text-2xl font-light leading-relaxed" /><T v={b.author} as="footer" className="text-sm text-muted-foreground" /></blockquote>)
    case "cta":
      return (<div className="space-y-4 rounded-xl border border-border p-8 text-center"><T v={b.title} as="h2" className="text-2xl sm:text-3xl font-light" />{b.text ? <div className="mx-auto max-w-xl"><Rich value={b.text} /></div> : null}
        {b.label ? <a href={safeHref(b.link)} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-medium text-background hover:bg-foreground/90 transition-colors">{b.label}</a> : null}</div>)
    case "list":
      return (<div className="space-y-4"><T v={b.title} as="h2" className="text-2xl sm:text-3xl font-light" /><ul className="list-disc space-y-2 pl-5 text-muted-foreground">{(b.items || []).map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></div>)
    case "divider":
      return <hr className="border-border" />
    default:
      return null
  }
}

export default function Block({ block, as: Tag = "section" }: { block: BlockData; as?: "section" | "div" }) {
  // section copiée d'une page existante : HTML déjà rendu (mêmes classes) ; refusé s'il ressemble à du script
  if (block.type === "html") return <div data-cb={block.id} data-html dangerouslySetInnerHTML={{ __html: isSafeHtml(block.html) ? block.html : "" }} />
  return <Tag data-cb={block.id} className="py-10 sm:py-14"><Inner b={block} /></Tag>
}
