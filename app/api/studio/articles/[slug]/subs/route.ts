import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { subOp, parsePath, SLUG_RE, ID_RE } from "@/lib/articles/annotations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Sous-articles : create | update | delete | status.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const b = await req.json().catch(() => null); const ids = parsePath(Array.isArray(b?.path) ? b.path.join("/") : "")
  if (!b || !ids || !ID_RE.test(String(b.noteId))) return fail("requête", 400)
  try { const r = await subOp(slug, ids, String(b.noteId), String(b.action), b.data || {}); return NextResponse.json(r, { status: r.ok ? 200 : 400 }) } catch (e) { return fail(e) }
}
