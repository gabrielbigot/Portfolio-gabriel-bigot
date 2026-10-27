// Sections « copiées » : du HTML déjà rendu par le site (mêmes classes, donc même apparence). Deux garde-fous :
//  - snapshotElement (client) reconstruit le HTML à partir d'une liste blanche de balises et d'attributs ;
//  - isSafeHtml (serveur + client) refuse tout ce qui ressemble à du script avant d'écrire ou d'afficher.
export const MAX_HTML = 600_000
const BAD = /<\s*(script|iframe|object|embed|style|link|meta|base|form|input|textarea|select|template|frame|frameset|applet)\b|\son[a-z]+\s*=|javascript:|vbscript:|data:text\/html|srcdoc\s*=|expression\s*\(/i
export const isSafeHtml = (html: unknown): html is string => typeof html === "string" && html.length <= MAX_HTML && !BAD.test(html)

const TAGS = new Set("div span p h1 h2 h3 h4 h5 h6 a ul ol li img section header footer nav article aside figure figcaption strong em b i u s br hr blockquote table thead tbody tfoot tr th td caption time small code pre sup sub mark button label details summary dl dt dd abbr cite q svg path circle rect line polyline polygon ellipse g defs lineargradient stop title".split(" "))
const SVG = new Set("svg path circle rect line polyline polygon ellipse g defs lineargradient stop".split(" "))
const ATTR = new Set("class href src alt title target rel style role width height colspan rowspan datetime loading decoding aria-hidden aria-label aria-current viewbox d fill stroke stroke-width stroke-linecap stroke-linejoin stroke-opacity fill-opacity fill-rule clip-rule cx cy r rx ry x y x1 x2 y1 y2 points transform xmlns opacity offset stop-color stop-opacity gradientunits".split(" "))
const MARKS = /[⁠‌‍]/g
const okUrl = (v: string) => /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i.test(v.trim())
const okImg = (v: string) => /^(https?:\/\/|\/(?!\/)|data:image\/(png|jpe?g|webp|gif|avif);base64,)/i.test(v.trim())

/** Copie « propre » d'un élément déjà affiché : balises et attributs autorisés seulement, signatures invisibles retirées, formulaires neutralisés. */
export function snapshotElement(src: Element): string {
  const doc = document.implementation.createHTMLDocument("")
  const build = (n: Node, into: Node) => {
    if (n.nodeType === 3) { const t = (n.nodeValue || "").replace(MARKS, ""); if (t) into.appendChild(doc.createTextNode(t)); return }
    if (!(n instanceof Element)) return
    if (n.closest("[data-studio-ui]") || n.hasAttribute("data-studio-ui")) return
    const tag = n.tagName.toLowerCase()
    if (["script", "style", "noscript", "template", "iframe", "object", "embed", "link", "meta", "input", "textarea", "select", "option", "canvas", "video", "audio", "form"].includes(tag)) { if (tag === "form") n.childNodes.forEach(c => build(c, into)); return }
    if (!TAGS.has(tag)) { n.childNodes.forEach(c => build(c, into)); return } // balise inconnue : on garde son contenu
    const e = SVG.has(tag) ? doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
    for (const a of [...n.attributes]) {
      const name = a.name.toLowerCase(); let v = a.value.replace(MARKS, "")
      if (!ATTR.has(name) && !name.startsWith("aria-label")) continue
      if (name === "href" && !okUrl(v)) continue
      if (name === "src" && !okImg(v)) continue
      if (name === "style" && /url\(|expression|javascript|behavior|@import/i.test(v)) continue
      if (name === "target" && v !== "_blank") continue
      e.setAttribute(a.name, v)
    }
    if (tag === "a" && e.getAttribute("target") === "_blank") e.setAttribute("rel", "noopener noreferrer")
    n.childNodes.forEach(c => build(c, e)); into.appendChild(e)
  }
  const box = doc.createElement("div"); build(src, box)
  return box.innerHTML
}
