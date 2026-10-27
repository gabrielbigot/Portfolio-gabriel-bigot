import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { readManifestDraft } from "@/lib/articles/list"
import { createArticle } from "@/lib/articles/create"
import { blankDossier, starterSections } from "@/lib/articles/blank.mjs"
import { SLUG_RE } from "@/lib/articles/annotations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70)

// Crée un dossier vierge (brouillon) : squelette HTML + registre vide + entrée de manifeste. Se modifie ensuite dans l'éditeur d'articles.
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = (await req.json().catch(() => ({}))) as { title?: string; subtitle?: string }
  const title = String(b.title || "").trim().slice(0, 140) || "Nouvel article"
  try {
    const m = await readManifestDraft(); const base = slugify(title) || "nouveau-dossier"; let slug = base.length >= 3 ? base : base + "-dossier", n = 2
    while (m.articles.some(a => a.slug === slug) || !SLUG_RE.test(slug)) { slug = `${base}-${n++}`; if (n > 99) return fail("adresse indisponible", 409) }
    const date = new Date().toISOString().slice(0, 10), d = blankDossier({ slug, title, subtitle: String(b.subtitle || "").trim().slice(0, 300), date, series: "Articles" })
    await createArticle({ meta: { ...d.meta, status: "draft" }, html: d.html, data: d.data, edits: { pages: { "": starterSections() }, figures: {}, evidence: [] } })
    return NextResponse.json({ ok: true, slug })
  } catch (e) { return fail(e) }
}
