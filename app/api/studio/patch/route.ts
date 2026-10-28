import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore, invalidateDraftCache } from "@/lib/studio/store"
import { CONTENT_BY_KEY, contentPath } from "@/lib/site-content-registry"
import { applyOp, type Op } from "@/lib/studio/ops"
import { isSafeHtml } from "@/lib/studio/html-safe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Édition directe sur le site : une opération sur le brouillon d'un contenu (modifier, supprimer, déplacer, dupliquer).
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = (await req.json().catch(() => null)) as { key?: string } & Partial<Op> | null
  const def = b?.key ? CONTENT_BY_KEY[b.key] : null
  if (!b || !def || !Array.isArray(b.path) || !b.path.every(s => typeof s === "string") || !b.op) return fail("requête invalide", 400)
  // sections copiées : le HTML ne doit contenir ni script, ni gestionnaire d'évènement, ni formulaire
  const val = (b as { value?: unknown }).value; if (def.key === "pages" && val !== undefined && !isSafeHtml(JSON.stringify(val))) return fail("contenu HTML refusé (script, formulaire ou trop volumineux)", 400)
  try {
    const store = getStore(); const p = contentPath(def.file)
    const cur = await store.readDraft(p); if (!cur) return fail("contenu introuvable", 404)
    const next = applyOp(JSON.parse(cur.toString("utf8")), b as Op)
    await store.writeDraft(p, JSON.stringify(next, null, 2) + "\n"); invalidateDraftCache()
    return NextResponse.json({ ok: true })
  } catch (e) { return fail(e, 400) }
}
