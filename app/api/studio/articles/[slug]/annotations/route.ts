import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { readAnnotations, writeAnnotations, parsePath, SLUG_RE } from "@/lib/articles/annotations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Notes et images d'un article (ou d'un de ses sous-articles : ?path=a/b). Brouillon seulement.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const ids = parsePath(new URL(req.url).searchParams.get("path")); if (!ids) return fail("chemin", 400)
  try { const d = await readAnnotations(slug, ids); return d ? NextResponse.json({ ...d, published: false }) : fail("sous-article introuvable", 404) } catch (e) { return fail(e) }
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const ids = parsePath(new URL(req.url).searchParams.get("path")); if (!ids) return fail("chemin", 400)
  const body = await req.json().catch(() => null); if (!body || !Array.isArray(body.notes)) return fail("format", 400)
  try { const out = await writeAnnotations(slug, body.notes, body.pictures || [], ids); return out ? NextResponse.json(out) : fail("sous-article introuvable", 404) } catch (e) { return fail(e) }
}
