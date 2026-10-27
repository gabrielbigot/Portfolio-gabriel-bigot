import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { readManifestDraft, writeManifestDraft } from "@/lib/articles/list"
import { readTree } from "@/lib/articles/annotations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const count = (notes: any[]): { notes: number; subs: number; pub: number } => notes.reduce((a, n) => { const c = n.sub ? count(n.sub.notes || []) : { notes: 0, subs: 0, pub: 0 }; return { notes: a.notes + 1 + c.notes, subs: a.subs + (n.sub ? 1 : 0) + c.subs, pub: a.pub + (n.status === "public" ? 1 : 0) + c.pub } }, { notes: 0, subs: 0, pub: 0 })

// Liste des articles du brouillon (avec décompte de notes) / publier ou dépublier un article.
export async function GET(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  try { const m = await readManifestDraft(); return NextResponse.json({ articles: await Promise.all(m.articles.map(async a => { const t = await readTree(a.slug); const c = count(t.notes); return { ...a, counts: { ...c, pictures: t.pictures.length } } })) }) } catch (e) { return fail(e) }
}
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const { slug, status } = (await req.json().catch(() => ({}))) as { slug?: string; status?: string }
  if (!slug || (status !== "public" && status !== "draft")) return fail("requête invalide", 400)
  try {
    const m = await readManifestDraft(); const a = m.articles.find(x => x.slug === slug); if (!a) return fail("article introuvable", 404)
    a.status = status; if (status === "public" && !a.published) a.published = new Date().toISOString().slice(0, 10); a.updated = new Date().toISOString().slice(0, 10)
    await writeManifestDraft(m); return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}

// Retire un article de la liste (les fichiers restent sur disque : rien n'est perdu, la suppression se publie comme le reste).
export async function DELETE(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string }
  if (!slug) return fail("requête invalide", 400)
  try {
    const m = await readManifestDraft(); if (!m.articles.some(x => x.slug === slug)) return fail("article introuvable", 404)
    m.articles = m.articles.filter(x => x.slug !== slug); await writeManifestDraft(m); return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}
