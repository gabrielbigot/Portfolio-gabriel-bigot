import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore, isAllowedPath, invalidateDraftCache } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Annule les modifications d'UN fichier : le brouillon reprend la version publiée.
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const { path } = (await req.json().catch(() => ({}))) as { path?: string }
  if (!path || !isAllowedPath(path)) return fail("chemin refusé", 400)
  try { await getStore().discard(path); invalidateDraftCache(); return NextResponse.json({ ok: true }) } catch (e) { return fail(e) }
}
