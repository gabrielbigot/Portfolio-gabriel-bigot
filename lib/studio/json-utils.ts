// Utilitaires de l'éditeur de contenu (client).
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

const LABELS: Record<string, string> = {
  title: "Titre", subtitle: "Sous-titre", name: "Nom", description: "Description", shortDescription: "Description courte", longDescription: "Description longue",
  content: "Contenu", text: "Texte", summary: "Résumé", slug: "Identifiant (URL)", id: "Identifiant", image: "Image", images: "Images", logo: "Logo",
  tags: "Étiquettes", category: "Catégorie", categories: "Catégories", company: "Entreprise", position: "Poste", location: "Lieu", startDate: "Début",
  endDate: "Fin", current: "En cours", featured: "À la une", published: "Publié", url: "Lien", link: "Lien", github: "GitHub", demo: "Démo",
  year: "Année", label: "Libellé", level: "Niveau", type: "Type", date: "Date", author: "Auteur", tagline: "Accroche", email: "E-mail", cvUrl: "Lien du CV",
  technologies: "Technologies", features: "Fonctionnalités", results: "Résultats", challenges: "Défis", steps: "Étapes", readTime: "Temps de lecture",
}
export const humanize = (k: string) => LABELS[k] ?? k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, c => c.toUpperCase())

const TITLE_KEYS = ["title", "name", "company", "position", "label", "slug", "year", "id", "degree", "school"]
export function itemTitle(v: Json, i: number): string {
  if (v && typeof v === "object" && !Array.isArray(v)) { for (const k of TITLE_KEYS) { const x = v[k]; if (typeof x === "string" && x.trim()) return x.length > 70 ? x.slice(0, 70) + "…" : x } }
  if (typeof v === "string") return v.slice(0, 70) || `Élément ${i + 1}`
  return `Élément ${i + 1}`
}

/** Gabarit d'un nouvel élément : même structure que l'exemple, valeurs vidées. */
export function blank(v: Json): Json {
  if (Array.isArray(v)) return []
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]))
  if (typeof v === "string") return ""
  if (typeof v === "number") return 0
  if (typeof v === "boolean") return false
  return null
}

export const isImageKey = (k: string) => /(image|logo|cover|photo|thumbnail|avatar|screenshot|poster|banner|icon)$/i.test(k)
export const looksLikeImage = (s: string) => /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(s) || /^\/(uploads|projects|companies|about|portfolio|newsletters)\//.test(s)
const LONG_KEYS = /^(description|shortDescription|longDescription|content|text|summary|body|excerpt|intro|tagline|answer)$/i
export const isLongText = (k: string, s: string) => LONG_KEYS.test(k) || s.length > 110 || s.includes("\n")

export type Diff = { path: string; before: string; after: string }
const short = (v: unknown) => { const s = typeof v === "string" ? v : JSON.stringify(v); return s === undefined ? "∅" : s.length > 140 ? s.slice(0, 140) + "…" : s }
export function diffJson(a: unknown, b: unknown, path = "", out: Diff[] = []): Diff[] {
  if (out.length >= 300) return out
  if (JSON.stringify(a) === JSON.stringify(b)) return out
  const ao = a && typeof a === "object", bo = b && typeof b === "object"
  if (ao && bo && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)])
    for (const k of keys) diffJson((a as any)[k], (b as any)[k], path ? `${path} › ${Array.isArray(a) ? "#" + (+k + 1) : k}` : Array.isArray(a) ? "#" + (+k + 1) : k, out)
    return out
  }
  out.push({ path: path || "(racine)", before: a === undefined ? "∅" : short(a), after: b === undefined ? "∅" : short(b) }); return out
}
