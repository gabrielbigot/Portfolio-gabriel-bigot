import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { runAiEssay } from "@/lib/studio/ai"
import { readManifestDraft } from "@/lib/articles/list"
import { createArticle } from "@/lib/articles/create"
import { essayToArticle } from "@/lib/articles/essay-convert.mjs"
import { SLUG_RE } from "@/lib/articles/annotations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const slugify = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70)

// Nouvel article écrit par Claude : sections numérotées, en BROUILLON (public seulement après « Marquer comme public » puis « Publier »).
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || typeof b.prompt !== "string") return fail("requête", 400)
  try {
    const m = await readManifestDraft(), r = await runAiEssay({ prompt: b.prompt, categories: [] })
    const base = slugify(r.title) || "nouvel-article"; let slug = base.length >= 3 ? base : base + "-article", n = 2
    while (m.articles.some(a => a.slug === slug) || !SLUG_RE.test(slug)) { slug = `${base}-${n++}`; if (n > 99) return fail("adresse indisponible", 409) }
    const words = [r.excerpt, ...r.content.map(c => c.text || (c.items || []).join(" "))].join(" ").split(/\s+/).filter(Boolean).length
    const a = essayToArticle({ slug, title: r.title, excerpt: r.excerpt, date: new Date().toISOString().slice(0, 10), readingTime: `${Math.max(1, Math.round(words / 200))} min`, category: r.category, published: false, content: r.content })
    const meta = { ...a.meta, series: "Articles", migratedFromEssay: undefined }
    await createArticle({ meta, html: a.html, data: a.data, edits: a.edits })
    return NextResponse.json({ ok: true, slug, title: r.title, sections: a.edits.pages[""].added.length })
  } catch (e) { return fail(e, /absente|Limite|vide|illisible|incomplet/.test(String((e as Error)?.message)) ? 422 : 502) }
}
