import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"
import { SLUG_RE } from "@/lib/articles/annotations"
import { readManifestDraft, writeManifestDraft } from "@/lib/articles/list"
import { blankDossier } from "@/lib/articles/blank.mjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Titre, sous-titre et résumé d'un dossier créé dans le studio (couverture régénérée). Les dossiers importés se modifient en place.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const b = await getStore().readDraft(`content/articles/${slug}/article.json`); if (!b) return fail("article inconnu", 404)
  const m = JSON.parse(b.toString("utf8")); return NextResponse.json({ title: m.title, subtitle: m.subtitle || "", summary: m.summary || "", createdInStudio: !!m.createdInStudio, status: m.status, series: m.series || "", adopted: !!m.adopted })
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const b = (await req.json().catch(() => ({}))) as { title?: string; subtitle?: string; summary?: string }
  try {
    const st = getStore(), root = `content/articles/${slug}`, mb = await st.readDraft(`${root}/article.json`); if (!mb) return fail("article inconnu", 404)
    const meta = JSON.parse(mb.toString("utf8")); if (!meta.createdInStudio) return fail("dossier importé : modifiez sa couverture en place", 400)
    const title = String(b.title ?? meta.title).trim().slice(0, 140) || meta.title, subtitle = String(b.subtitle ?? meta.subtitle ?? "").trim().slice(0, 300), summary = String(b.summary ?? meta.summary ?? "").trim().slice(0, 600), date = new Date().toISOString().slice(0, 10)
    if (meta.adopted) { // dossier adopté : la couverture d'origine est conservée, seuls titre et chapô sont remplacés
      let html = (await st.readDraft(`${root}/build/index.html`))?.toString("utf8") || ""
      const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/, (_m, a, c) => a + esc(title) + c).replace(/(<p class="vra-dek"[^>]*>)[\s\S]*?(<\/p>)/, (_m, a, c) => a + esc(subtitle) + c).replace(/(<title>)[\s\S]*?(<\/title>)/, (_m, a, c) => a + esc(title) + c)
      await st.writeDraft(`${root}/build/index.html`, html)
      await st.writeDraft(`${root}/article.json`, JSON.stringify({ ...meta, title, subtitle, summary, updated: date }, null, 2) + "\n")
      const m2 = await readManifestDraft(); const a2 = m2.articles.find(x => x.slug === slug); if (a2) { Object.assign(a2, { title, subtitle, summary, updated: date }); await writeManifestDraft(m2) }
      return NextResponse.json({ ok: true })
    }
    const d = blankDossier({ slug, title, subtitle, date: meta.published || date, tags: meta.tags, series: meta.series, summary, readingMinutes: meta.readingMinutes })
    await st.writeDraft(`${root}/build/index.html`, d.html)
    await st.writeDraft(`${root}/article.json`, JSON.stringify({ ...meta, title, subtitle, summary, updated: date }, null, 2) + "\n")
    const m = await readManifestDraft(); const a = m.articles.find(x => x.slug === slug); if (a) { Object.assign(a, { title, subtitle, summary, updated: date }); await writeManifestDraft(m) }
    return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}
