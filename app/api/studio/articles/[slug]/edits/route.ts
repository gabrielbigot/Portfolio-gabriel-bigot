import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { SLUG_RE } from "@/lib/articles/annotations"
import { editOp, readEdits } from "@/lib/articles/edits-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Modifications directes d'un article ou d'un sous-article : text | layout | add | dup.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  return NextResponse.json(await readEdits(slug))
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const b = await req.json().catch(() => null); if (!b) return fail("requête", 400)
  try { const r = await editOp(slug, b); return NextResponse.json(r, { status: r.ok ? 200 : 400 }) } catch (e) { return fail(e) }
}
