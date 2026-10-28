import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { SLUG_RE } from "@/lib/articles/annotations"
import { snapshot, listHistory, diffWithCurrent, restore } from "@/lib/articles/history"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Historique des versions : liste (GET), différences avec l'état actuel (GET ?id=), point de restauration manuel et restauration (POST).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  try { const id = new URL(req.url).searchParams.get("id"); if (id) { if (!/^[a-z0-9]{4,12}$/.test(id)) return fail("version", 400); return NextResponse.json({ diff: await diffWithCurrent(slug, id) }) } return NextResponse.json({ items: await listHistory(slug) }) } catch (e) { return fail(e) }
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const b = await req.json().catch(() => null); if (!b) return fail("requête", 400)
  try {
    if (b.op === "snapshot") { const id = await snapshot(slug, String(b.label || "point manuel").slice(0, 80), true); return NextResponse.json({ ok: true, id }) }
    if (b.op === "restore" && /^[a-z0-9]{4,12}$/.test(String(b.id))) { await restore(slug, String(b.id)); return NextResponse.json({ ok: true }) }
    return fail("opération", 400)
  } catch (e) { return fail(e) }
}
