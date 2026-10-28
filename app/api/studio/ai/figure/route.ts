import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { runAiFigure } from "@/lib/studio/ai"
import { cleanSvg } from "@/lib/articles/edits.mjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Graphique ou schéma dessiné par Claude (SVG assaini : aucune balise ni adresse externe, aucun script). Rien n'est enregistré ici.
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || typeof b.source !== "string") return fail("requête", 400)
  try {
    const r = await runAiFigure({ request: String(b.request || ""), source: b.source, topic: typeof b.topic === "string" ? b.topic : undefined, previous: typeof b.previous === "string" ? b.previous : undefined, instruction: typeof b.instruction === "string" ? b.instruction : undefined })
    const svg = cleanSvg(r.svg); if (!svg) return fail("le dessin produit est inutilisable : réessayez ou demandez un graphique de la galerie", 422)
    return NextResponse.json({ ...r, svg })
  } catch (e) { return fail(e, /absente|Limite|vide|illisible|honnête|inutilisable|rien/.test(String((e as Error)?.message)) ? 422 : 502) }
}
