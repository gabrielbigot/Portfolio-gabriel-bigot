// Liste des articles (content/articles.json) : `status` « public » = visible sur le site public. Le studio voit aussi les brouillons.
import manifest from "@/content/articles.json"
import { isStudioMode } from "@/lib/site-content"
import { getStore, ART_MANIFEST } from "@/lib/studio/store"

export type ArticleEntry = { slug: string; title: string; subtitle?: string; summary?: string; tags?: string[]; series?: string; published?: string; updated?: string; readingMinutes?: number | null; sourceCount?: number | null; status: "draft" | "public" }

export async function loadArticles(): Promise<ArticleEntry[]> {
  let list: ArticleEntry[] = (manifest as { articles: ArticleEntry[] }).articles
  if (isStudioMode()) { const b = await getStore().readDraft(ART_MANIFEST); if (b) list = JSON.parse(b.toString("utf8")).articles }
  return isStudioMode() ? list : list.filter(a => a.status === "public")
}
export async function readManifestDraft(): Promise<{ articles: ArticleEntry[] }> {
  const b = await getStore().readDraft(ART_MANIFEST); return b ? JSON.parse(b.toString("utf8")) : { articles: [] }
}
export async function writeManifestDraft(m: { articles: ArticleEntry[] }) { await getStore().writeDraft(ART_MANIFEST, JSON.stringify(m, null, 2) + "\n") }
