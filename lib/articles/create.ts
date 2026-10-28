// Création d'un article dans le BROUILLON du studio : fichiers de base + entrée de manifeste (statut brouillon par défaut).
import { getStore } from "@/lib/studio/store"
import { readManifestDraft, writeManifestDraft, type ArticleEntry } from "@/lib/articles/list"

type Meta = { slug: string; title: string; subtitle?: string; summary?: string; tags?: string[]; series?: string; published?: string; updated?: string; readingMinutes?: number; sourceCount?: number; status?: string }
export async function createArticle(a: { meta: Meta; html: string; data: string; edits: unknown }) {
  const st = getStore(), root = `content/articles/${a.meta.slug}`, m = a.meta
  await st.writeDraft(`${root}/article.json`, JSON.stringify(a.meta, null, 2) + "\n")
  await st.writeDraft(`${root}/build/index.html`, a.html)
  await st.writeDraft(`${root}/build/data/report-data.js`, a.data)
  await st.writeDraft(`${root}/edits.json`, JSON.stringify(a.edits, null, 1) + "\n")
  await st.writeDraft(`${root}/annotations.json`, JSON.stringify({ notes: [], pictures: [] }, null, 2) + "\n")
  const man = await readManifestDraft()
  const entry: ArticleEntry = { slug: m.slug, title: m.title, subtitle: m.subtitle || "", summary: m.summary || "", tags: m.tags || [], series: m.series || "Articles", published: m.published, updated: m.updated, readingMinutes: m.readingMinutes || 1, sourceCount: m.sourceCount || 0, status: (m.status as "draft" | "public") || "draft" }
  man.articles.unshift(entry); await writeManifestDraft(man)
}
