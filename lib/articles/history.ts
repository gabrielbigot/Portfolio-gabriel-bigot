// Historique des versions d'un article (studio) : points de restauration de edits.json + article.json, rangés dans .studio/ (jamais publiés).
// Automatique : un point avant la première modification d'une série (au plus un toutes les 10 minutes) ; manuel : « Créer un point » ; avant chaque restauration.
import crypto from "node:crypto"
import { getStore } from "@/lib/studio/store"

type Item = { id: string; at: string; label: string; sections: number; words: number; h: string }
const sh = (slug: string) => crypto.createHash("sha1").update(slug).digest("hex").slice(0, 8)
const idxName = (slug: string) => `hi-${sh(slug)}.json`, snapName = (slug: string, id: string) => `h-${sh(slug)}-${id}.json`
const file = (slug: string) => `content/articles/${slug}/edits.json`, metaFile = (slug: string) => `content/articles/${slug}/article.json`
const MAX = 30, GAP = 10 * 60_000

async function readIndex(slug: string): Promise<Item[]> { const b = await getStore().readMeta(idxName(slug)); try { return b ? JSON.parse(b.toString("utf8")).items || [] : [] } catch { return [] } }
const stats = (edits: string) => { try { const added = JSON.parse(edits).pages?.[""]?.added || []; return { sections: added.length, words: added.reduce((n: number, s: any) => n + JSON.stringify(s.blocks || []).replace(/<[^>]+>/g, " ").split(/\s+/).length, 0) } } catch { return { sections: 0, words: 0 } } }

export async function snapshot(slug: string, label = "auto", force = false): Promise<string | null> {
  const st = getStore(), cur = await st.readDraft(file(slug)); if (!cur) return null
  const edits = cur.toString("utf8"), h = crypto.createHash("sha1").update(edits).digest("hex").slice(0, 12), items = await readIndex(slug), last = items[0]
  if (last && last.h === h) return null
  if (!force && last && Date.now() - Date.parse(last.at) < GAP) return null
  const id = Date.now().toString(36), art = (await st.readDraft(metaFile(slug)))?.toString("utf8") || ""
  await st.writeMeta(snapName(slug, id), JSON.stringify({ id, edits, article: art }))
  const next = [{ id, at: new Date().toISOString(), label, ...stats(edits), h }, ...items]
  for (const old of next.slice(MAX)) { try { await st.deleteDraft(`.studio/${snapName(slug, old.id)}`) } catch { /* déjà absent */ } }
  await st.writeMeta(idxName(slug), JSON.stringify({ slug, items: next.slice(0, MAX) }))
  return id
}
export async function listHistory(slug: string) { return readIndex(slug) }
export async function diffWithCurrent(slug: string, id: string) {
  const st = getStore(), b = await st.readMeta(snapName(slug, id)); if (!b) return null
  const snap = JSON.parse(b.toString("utf8")), cur = (await st.readDraft(file(slug)))?.toString("utf8") || "{}"
  const sa: any[] = JSON.parse(snap.edits).pages?.[""]?.added || [], ca: any[] = JSON.parse(cur).pages?.[""]?.added || [], out: { id: string; title: string; status: "ajoutée depuis" | "supprimée depuis" | "modifiée depuis" | "identique" }[] = []
  for (const s of sa) { const c = ca.find(x => x.id === s.id); out.push({ id: s.id, title: s.title, status: !c ? "supprimée depuis" : JSON.stringify(c.blocks) !== JSON.stringify(s.blocks) || c.title !== s.title ? "modifiée depuis" : "identique" }) }
  for (const c of ca) if (!sa.some(x => x.id === c.id)) out.push({ id: c.id, title: c.title, status: "ajoutée depuis" })
  return out
}
export async function restore(slug: string, id: string) {
  const st = getStore(), b = await st.readMeta(snapName(slug, id)); if (!b) throw new Error("version introuvable")
  const snap = JSON.parse(b.toString("utf8")); await snapshot(slug, "avant restauration", true)
  await st.writeDraft(file(slug), snap.edits); if (snap.article) await st.writeDraft(metaFile(slug), snap.article)
}
