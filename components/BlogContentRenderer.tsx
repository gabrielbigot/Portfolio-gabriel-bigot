import { renderInline } from "@/lib/inline-md"
import FigureFrame from "@/components/FigureFrame"

type ContentSection = {
  type: "heading" | "paragraph" | "list" | "quote" | "code" | "image" | "divider" | "figure"
  text?: string
  items?: string[]
  ordered?: boolean // list : numérotée
  level?: 2 | 3 // heading : sous-titre
  src?: string; alt?: string; caption?: string // image
  figure?: Record<string, unknown>; title?: string; reading?: string; source?: string // figure : graphique du moteur des dossiers
}

export function getHeadingId(text: string | undefined, index: number) {
  const slug = (text || "section")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return `${slug || "section"}-${index}`
}

export default function BlogContentRenderer({ content }: { content: ContentSection[] }) {
  if (!content || content.length === 0) return null

  return (
    <div className="essay-content space-y-7">
      {content.map((block, i) => {
        switch (block.type) {
          case "heading":
            if (block.level === 3) return <h3 key={i} id={getHeadingId(block.text, i)} className="font-editorial text-2xl sm:text-3xl leading-snug mt-10 mb-4">{renderInline(block.text)}</h3>
            return (
              <h2
                key={i}
                id={getHeadingId(block.text, i)}
                className="font-editorial text-3xl sm:text-4xl leading-tight mt-16 mb-6 first:mt-0"
              >
                {renderInline(block.text)}
              </h2>
            )
          case "paragraph":
            return (
              <p key={i} className="font-editorial text-xl sm:text-[1.35rem] text-foreground/90 leading-[1.75]">
                {renderInline(block.text)}
              </p>
            )
          case "list":
            if (block.ordered) return (
              <ol key={i} className="space-y-3 ml-6 list-decimal pl-6 marker:text-foreground/50">
                {block.items?.map((item, j) => <li key={j} className="text-lg text-muted-foreground leading-relaxed pl-1">{renderInline(item)}</li>)}
              </ol>
            )
            return (
              <ul key={i} className="space-y-3 ml-6">
                {block.items?.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-lg text-muted-foreground leading-relaxed"
                  >
                    <span className="text-foreground/50 mt-1.5">•</span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            )
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-accent pl-6 sm:pl-8 py-2 my-10"
              >
                <p className="font-editorial text-2xl sm:text-3xl italic text-foreground/90 leading-relaxed">
                  {renderInline(block.text)}
                </p>
              </blockquote>
            )
          case "code":
            return (
              <div key={i} className="my-6">
                <pre className="p-6 bg-foreground/[0.05] border border-border rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono text-foreground whitespace-pre">
                    {block.text}
                  </code>
                </pre>
              </div>
            )
          case "image":
            return block.src ? (
              <figure key={i} className="my-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.alt || block.caption || ""} className="w-full rounded-lg border border-border" loading="lazy" />
                {block.caption && <figcaption className="mt-3 text-sm text-muted-foreground">{renderInline(block.caption)}</figcaption>}
              </figure>
            ) : null
          case "figure":
            return block.figure ? (
              <figure key={i} className="my-12">
                {block.title && <h3 className="font-editorial text-2xl leading-snug mb-4">{renderInline(block.title)}</h3>}
                <FigureFrame figure={block.figure} title={block.title} source={block.source} />
                {(block.reading || block.source) && <figcaption className="mt-3 text-sm text-muted-foreground leading-relaxed">{block.reading && <><strong className="text-foreground/80">Lecture :</strong> {renderInline(block.reading)}</>}{block.source && <span className="block mt-1">Source : {renderInline(block.source)}</span>}</figcaption>}
              </figure>
            ) : null
          case "divider":
            return <hr key={i} className="my-12 border-border" />
          default:
            return null
        }
      })}
    </div>
  )
}
