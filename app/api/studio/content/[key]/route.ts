import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore, invalidateDraftCache } from "@/lib/studio/store"
import { CONTENT_BY_KEY, contentPath } from "@/lib/site-content-registry"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Lecture / écriture du BROUILLON d'un contenu. Le site public n'est jamais touché ici.
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const no = studioGuard(req); if (no) return no
  const def = CONTENT_BY_KEY[(await params).key]; if (!def) return fail("contenu inconnu", 404)
  try {
    const store = getStore(); const draftOnly = new URL(req.url).searchParams.get("draftOnly") === "1"
    const [d, p] = await Promise.all([store.readDraft(contentPath(def.file)), draftOnly ? Promise.resolve(null) : store.readPublished(contentPath(def.file))])
    return NextResponse.json({ key: def.key, draft: d ? JSON.parse(d.toString("utf8")) : null, published: p ? JSON.parse(p.toString("utf8")) : null })
  } catch (e) { return fail(e) }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const no = studioGuard(req); if (no) return no
  const def = CONTENT_BY_KEY[(await params).key]; if (!def) return fail("contenu inconnu", 404)
  const body = await req.json().catch(() => null); if (!body || !("data" in body)) return fail("requête invalide", 400)
  try {
    const store = getStore(); const path = contentPath(def.file)
    // garde-fou : la forme racine (liste / objet) ne doit pas changer, sinon les pages casseraient
    const pub = await store.readPublished(path)
    if (pub) { const ref = JSON.parse(pub.toString("utf8")); if (Array.isArray(ref) !== Array.isArray(body.data) || typeof ref !== typeof body.data) return fail("la structure racine ne correspond pas au contenu publié", 400) }
    await store.writeDraft(path, JSON.stringify(body.data, null, 2) + "\n"); invalidateDraftCache()
    return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}
