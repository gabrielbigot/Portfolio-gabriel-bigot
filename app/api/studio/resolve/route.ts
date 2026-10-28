import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore, isAllowedPath, invalidateDraftCache } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Conflit (fichier modifié à la fois dans le brouillon et sur le site publié) : garder ma version ou prendre la version publiée.
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const { path, choice } = (await req.json().catch(() => ({}))) as { path?: string; choice?: string }
  if (!path || !isAllowedPath(path) || (choice !== "mine" && choice !== "theirs")) return fail("requête invalide", 400)
  try { await getStore().resolve(path, choice); invalidateDraftCache(); return NextResponse.json({ ok: true }) } catch (e) { return fail(e) }
}
