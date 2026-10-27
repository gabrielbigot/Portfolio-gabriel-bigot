// Marquage « invisible » des textes affichés (mode studio uniquement).
// Chaque texte éditable est suivi d'une signature en caractères de largeur nulle qui dit D'OÙ il vient (contenu + chemin JSON).
// L'éditeur direct sur le site retrouve ainsi, à partir du texte affiché, le champ à modifier. Jamais actif sur le site public.
const Z0 = "‌", Z1 = "‍", D = "⁠"
export const MARK_RE = /⁠([‌‍]+)⁠/g

export function encodePayload(s: string): string {
  let bits = ""
  for (const b of new TextEncoder().encode(s)) bits += b.toString(2).padStart(8, "0")
  return D + bits.replace(/0/g, Z0).replace(/1/g, Z1) + D
}
export function decodePayload(marker: string): string | null {
  const bits = marker.replace(new RegExp(D, "g"), "").replace(/‌/g, "0").replace(/‍/g, "1")
  if (!bits || bits.length % 8) return null
  const bytes = new Uint8Array(bits.length / 8); for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2)
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes) } catch { return null }
}
/** Texte sans signatures (pour les comparaisons dans le code). */
export const stripMarks = (s: string) => s.replace(MARK_RE, "")

// Champs qui ne sont PAS du texte affiché (identifiants, liens, dates, filtres…) : jamais marqués, le code les compare ou les parse.
const BLOCK = new Set(["id", "slug", "url", "href", "link", "links", "image", "images", "logo", "src", "icon", "cover", "video", "poster", "file", "path", "email", "phone", "cvurl", "github", "demo", "website", "linkedin",
  "date", "startdate", "enddate", "birthdate", "createdat", "updatedat", "publishedat", "type", "status", "category", "categories", "tags", "technologies", "company", "color", "key", "variant", "readtime", "period", "siteurl", "ogimage", "twitterhandle", "sitekeywords",
  // réglages (pas du texte) : mise en page, blocs, pages
  "bg", "align", "width", "py", "side", "columns", "order", "hidden", "anchor", "lang", "style", "published", "after", "blocks", "extras", "rules", "pages", "rule", "html", "source", "kind"])
const looksFunctional = (v: string) => v.length < 2 || /^(https?:)?\/\//.test(v) || v.startsWith("/") || /\.(png|jpe?g|webp|gif|svg|avif|pdf|mp4)(\?.*)?$/i.test(v) || /^\d{4}-\d{2}(-\d{2})?/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[\d\s.,:+\-/]+$/.test(v)

/** Règle commune (serveur : signer ; client : retrouver les textes non signés par leur valeur). */
export function isMarkable(contentKey: string, path: string[], v: string, blockedAncestor = false): boolean {
  if (contentKey === "strings") return !!v.trim()
  const leaf = [...path].reverse().find(s => !/^\d+$/.test(s))?.toLowerCase() ?? ""
  return !(blockedAncestor || BLOCK.has(leaf) || looksFunctional(v))
}
/** Un ancêtre bloqué (ex. « technologies », « tags ») bloque aussi toutes les valeurs qu'il contient. */
export const blockedAncestorOf = (path: string[]) => path.slice(0, -1).some(s => BLOCK.has(s.toLowerCase()))
export const isFunctionalValue = looksFunctional

/** Copie profonde du contenu avec signatures sur les textes affichables. `strings` : tout est du texte. */
export function markContent<T>(contentKey: string, data: T): T {
  const walk = (v: unknown, path: string[]): unknown => {
    if (typeof v === "string") return isMarkable(contentKey, path, v, blockedAncestorOf(path)) ? v + encodePayload([contentKey, ...path].join("|")) : v
    if (Array.isArray(v)) return v.map((x, i) => walk(x, [...path, String(i)]))
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, [...path, k])]))
    return v
  }
  return walk(data, []) as T
}

/** Copie profonde sans signatures (métadonnées de page : titre, description…). */
export function stripDeep<T>(v: T): T {
  if (typeof v === "string") return stripMarks(v) as unknown as T
  if (Array.isArray(v)) return v.map(stripDeep) as unknown as T
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) return Object.fromEntries(Object.entries(v as object).map(([k, x]) => [k, stripDeep(x)])) as T
  return v // URL, Date… : intacts
}

/** Sépare un texte de sa signature (si présente) : pour re-signer chaque morceau d'un texte découpé en paragraphes. */
export function splitMark(s: string): { text: string; marker: string } {
  const m = [...s.matchAll(MARK_RE)]; if (!m.length) return { text: s, marker: "" }
  return { text: stripMarks(s), marker: m[m.length - 1][0] }
}
