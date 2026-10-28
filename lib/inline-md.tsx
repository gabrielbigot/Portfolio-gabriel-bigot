// Mise en forme dans le texte des essais : sous-ensemble de Markdown (**gras**, *italique*, `code`, [texte](lien)), échappement par « \ ».
// Une seule grammaire pour l'affichage (React, sans HTML brut) et pour l'éditeur d'écriture du studio (HTML ↔ Markdown).
import type { ReactNode } from "react"

export type Inline = { t: "text"; v: string } | { t: "b"; c: Inline[] } | { t: "i"; c: Inline[] } | { t: "code"; v: string } | { t: "a"; href: string; c: Inline[] } | { t: "src"; k: string } | { t: "note"; raw: string; c: Inline[] }
export { safeHref, parseInline } from "@/lib/inline-md-core.mjs"
import { parseInline as parse, safeHref } from "@/lib/inline-md-core.mjs"
const parseInline = parse as unknown as (s: string) => Inline[]

export function renderInline(text: string | undefined): ReactNode {
  if (!text) return text
  if (!/[*`\[\\{]/.test(text)) return text // cas courant : aucun balisage, le texte reste un seul nœud (édition en place inchangée)
  const r = (n: Inline[], k = ""): ReactNode[] => n.map((x, i) => { const key = k + i
    if (x.t === "text") return x.v
    if (x.t === "b") return <strong key={key}>{r(x.c, key)}</strong>
    if (x.t === "i") return <em key={key}>{r(x.c, key)}</em>
    if (x.t === "note") return <span key={key} className="text-[0.85em] text-muted-foreground"> ({r(x.c, key)})</span>
    if (x.t === "src") return <sup key={key} className="text-[0.7em] text-muted-foreground">{x.k}</sup>
    if (x.t === "code") return <code key={key} className="rounded bg-foreground/[0.07] px-1 py-0.5 font-mono text-[0.85em]">{x.v}</code>
    return <a key={key} href={x.href} className="underline decoration-accent underline-offset-4 hover:text-accent" {...(x.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{r(x.c, key)}</a> })
  return <>{r(parseInline(text))}</>
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
/** Markdown → HTML pour l'éditeur (contenteditable) */
export function mdToHtml(md: string): string {
  const h = (n: Inline[]): string => n.map(x => x.t === "text" ? esc(x.v) : x.t === "note" ? `<span class="sn" contenteditable="false" data-note="${esc(x.raw)}">[note]</span>` : x.t === "b" ? `<b>${h(x.c)}</b>` : x.t === "i" ? `<i>${h(x.c)}</i>` : x.t === "code" ? `<code>${esc(x.v)}</code>` : x.t === "src" ? `<a class="src" data-src="${x.k}" contenteditable="false">${x.k}</a>` : `<a href="${esc(x.href)}">${h(x.c)}</a>`).join("")
  // espaces insécables (typographie française) : isolés dans des éléments non éditables, car le navigateur les normalise en espaces à la frappe
  return h(parseInline(md)).replace(/[\u00a0\u202f]/g, c => `<span data-sp="${c.charCodeAt(0).toString(16)}" contenteditable="false">${c === "\u00a0" ? "&nbsp;" : "&#8239;"}</span>`)
}
const escMd = (t: string) => t.replace(/[\\*`\[\]]/g, "\\$&")
/** HTML de l'éditeur → Markdown (balises inconnues : texte seul) */
export function nodeToMd(root: Node): string {
  const walk = (n: Node): string => {
    if (n.nodeType === 3) return escMd((n.nodeValue || "").replace(/\u200b/g, "")) // les espaces insécables (typographie française) sont conservés
    if (n.nodeType !== 1) return ""
    const e = n as HTMLElement, inner = Array.from(e.childNodes).map(walk).join(""), tag = e.tagName
    if (tag === "BR") return " "
    if (tag === "SPAN" && e.hasAttribute("data-sp")) return String.fromCharCode(parseInt(e.getAttribute("data-sp") || "20", 16))
    if (tag === "SPAN" && e.hasAttribute("data-note")) return `{{note:${(e.getAttribute("data-note") || "").replace(/\}\}/g, "} }")}}}`
    if (!inner) return ""
    if (tag === "B" || tag === "STRONG" || /font-weight:\s*(bold|[6-9]00)/.test(e.getAttribute("style") || "")) return `**${inner}**`
    if (tag === "I" || tag === "EM" || /font-style:\s*italic/.test(e.getAttribute("style") || "")) return `*${inner}*`
    if (tag === "CODE") return "`" + (e.textContent || "").replace(/`/g, "") + "`"
    if (tag === "A" && e.classList.contains("src")) return `{{${(e.getAttribute("data-src") || "").replace(/[^KDV0-9-]/g, "")}}}`
    if (tag === "A") { const href = safeHref(e.getAttribute("href") || ""); return href ? `[${inner}](${href})` : inner }
    return inner
  }
  return Array.from(root.childNodes).map(walk).join("").replace(/\*\*\*\*/g, "").replace(/[ \u00a0\u202f]+$/, "")
}
