// Notes, images et sous-articles des articles — stockés dans content/articles/<slug>/annotations.json (brouillon dans le studio,
// publié sur main). Lecture/écriture par le stockage du studio (fichiers locaux ou branche GitHub), jamais directement sur disque.
import { getStore, ART_IMG_RE } from "@/lib/studio/store"

export type Sub = { title: string; summary?: string; body: string; updated?: string; notes?: Note[]; pictures?: Picture[] }
export type Note = {
  id: string; quote: string; prefix?: string; suffix?: string; mode?: string
  thread: { role: string; text: string }[]
  created?: string; status?: "draft" | "public"; comment?: string; includeThread?: boolean
  sub?: Sub // approfondissement (sous-article) rattaché à cette note ; il a ses propres notes, images et sous-articles (récursif)
}
export type Picture = { id: string; quote: string; prefix?: string; suffix?: string; status?: "draft" | "public"; created?: string; images: { file: string; caption?: string }[] }
export const IMG_RE = /^[a-z0-9]{6,40}\.(png|jpe?g|webp|gif)$/
export const ID_RE = /^[a-zA-Z0-9]{3,40}$/
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,90}$/
export const annPath = (slug: string) => `content/articles/${slug}/annotations.json`
export const imgPath = (slug: string, file: string) => `content/articles/${slug}/annotation-images/${file}`

const cleanPics = (pictures: any): Picture[] => (Array.isArray(pictures) ? pictures : []).filter(p => p && typeof p.id === "string" && typeof p.quote === "string").map(p => ({
  id: p.id.slice(0, 40), quote: p.quote.slice(0, 3000), prefix: (p.prefix || "").slice(0, 80), suffix: (p.suffix || "").slice(0, 80),
  status: p.status === "public" ? "public" as const : "draft" as const, created: p.created || new Date().toISOString(),
  images: (Array.isArray(p.images) ? p.images : []).filter((i: any) => i && IMG_RE.test(String(i.file))).slice(0, 8).map((i: any) => ({ file: String(i.file), caption: String(i.caption || "").slice(0, 400) })),
}))
const cleanSub = (sub: any): Sub => ({ title: String(sub.title || "").slice(0, 200), summary: String(sub.summary || "").slice(0, 400), body: String(sub.body || "").slice(0, 80000), updated: sub.updated || new Date().toISOString(), notes: cleanNotes(sub.notes), pictures: cleanPics(sub.pictures) })
function cleanNotes(notes: any): Note[] {
  return (Array.isArray(notes) ? notes : []).filter(n => n && typeof n.id === "string" && typeof n.quote === "string").map(n => ({
    id: n.id.slice(0, 40), quote: n.quote.slice(0, 3000), prefix: (n.prefix || "").slice(0, 80), suffix: (n.suffix || "").slice(0, 80), mode: n.mode || "note",
    thread: [], // les échanges avec l'IA ne sont plus conservés
    created: n.created || new Date().toISOString(), status: n.status === "public" ? "public" as const : "draft" as const,
    comment: String(n.comment || "").slice(0, 4000), includeThread: false,
    ...(n.sub && typeof n.sub === "object" ? { sub: cleanSub(n.sub) } : {}),
  }))
}
type Tree = { slug: string; notes: Note[]; pictures: Picture[] }
export async function readTree(slug: string): Promise<Tree> {
  const b = await getStore().readDraft(annPath(slug))
  try { const d = JSON.parse(b ? b.toString("utf8") : "{}"); return { slug, notes: d.notes || [], pictures: d.pictures || [] } } catch { return { slug, notes: [], pictures: [] } }
}
async function writeTree(slug: string, t: Tree) {
  const out = { slug, notes: cleanNotes(t.notes), pictures: cleanPics(t.pictures) }
  await getStore().writeDraft(annPath(slug), JSON.stringify(out, null, 1) + "\n"); return out
}
type NodeView = { notes: Note[]; pictures: Picture[]; sub?: Sub; note?: Note }
/** Nœud-document désigné par un chemin d'identifiants de notes (« a/b » = sous-article de b dans le sous-article de a). */
function getNode(t: Tree, ids: string[]): NodeView | null {
  let node: NodeView = t
  for (const id of ids) {
    const n = node.notes.find(x => x.id === id); if (!n || !n.sub) return null
    n.sub.notes = n.sub.notes || []; n.sub.pictures = n.sub.pictures || []
    node = { notes: n.sub.notes, pictures: n.sub.pictures, sub: n.sub, note: n }
  }
  return node
}
export const parsePath = (q: string | null): string[] | null => { const ids = (q || "").split("/").filter(Boolean); return ids.length <= 6 && ids.every(i => ID_RE.test(i)) ? ids : null }

export async function readAnnotations(slug: string, ids: string[] = []) {
  const t = await readTree(slug); const node = getNode(t, ids); if (!node) return null
  return { slug, path: ids, notes: node.notes, pictures: node.pictures, sub: node.sub ? { title: node.sub.title, summary: node.sub.summary || "", body: node.sub.body } : null, noteStatus: node.note?.status || null }
}
/** Écriture des notes/images d'UN document : les sous-articles existants sont conservés tels quels côté serveur. */
export async function writeAnnotations(slug: string, notes: Note[], pictures: Picture[] = [], ids: string[] = []) {
  const t = await readTree(slug); const node = getNode(t, ids); if (!node) return null
  const old = new Map(node.notes.map(n => [n.id, n.sub]))
  const incoming = (Array.isArray(notes) ? notes : []).map(n => ({ ...n, sub: old.get(n.id) })) as Note[]
  node.notes.splice(0, node.notes.length, ...incoming); node.pictures.splice(0, node.pictures.length, ...(pictures as Picture[]))
  const out = await writeTree(slug, t); const fresh = getNode(out, ids)!
  return { notes: fresh.notes, pictures: fresh.pictures }
}
/** Sous-articles : create | update | delete | status (statut de la note qui porte le sous-article). */
export async function subOp(slug: string, ids: string[], noteId: string, action: string, data: any = {}) {
  const t = await readTree(slug); const node = getNode(t, ids); if (!node) return { ok: false, error: "chemin" }
  const n = node.notes.find(x => x.id === noteId); if (!n) return { ok: false, error: "note" }
  if (action === "create") { if (!n.sub) n.sub = { title: String(data.title || "Approfondissement"), summary: String(data.summary || ""), body: String(data.body || ""), notes: [], pictures: [], updated: new Date().toISOString() } }
  else if (action === "update" && n.sub) { for (const k of ["title", "summary", "body"] as const) if (typeof data[k] === "string") (n.sub as any)[k] = data[k]; n.sub.updated = new Date().toISOString() }
  else if (action === "delete") delete n.sub
  else if (action === "status") n.status = data.status === "public" ? "public" : "draft"
  else return { ok: false, error: "action" }
  await writeTree(slug, t); return { ok: true }
}

export function sniffImage(b: Buffer): string | null {
  if (b.length > 12 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png"
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg"
  if (b.length > 6 && b.toString("latin1", 0, 4) === "GIF8") return "gif"
  if (b.length > 12 && b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP") return "webp"
  return null
}
export const imageAllowed = (slug: string, file: string) => ART_IMG_RE.test(imgPath(slug, file))
