import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore, invalidateDraftCache } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// Publier : un commit sur la branche publiée avec les seuls fichiers de contenu modifiés → Vercel redéploie le site public.
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const { message } = (await req.json().catch(() => ({}))) as { message?: string }
  const msg = (message || "").trim().slice(0, 140) || "Mise à jour du contenu"
  try { const r = await getStore().publish(`contenu : ${msg}\n\nPublié depuis le studio.`); invalidateDraftCache(); return NextResponse.json(r, { status: r.ok ? 200 : 500 }) } catch (e) { return fail(e) }
}
