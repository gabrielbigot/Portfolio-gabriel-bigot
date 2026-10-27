import { NextResponse } from "next/server"

export const studioEnabled = () => process.env.STUDIO_MODE === "1"
/**
 * Garde commune des routes /api/studio/* : active seulement quand STUDIO_MODE=1 (copie privée protégée par Vercel Authentication,
 * ou développement local). Le site public n'a jamais cette variable : toutes ces routes y répondent 404.
 * Refuse aussi les requêtes émises depuis un autre site.
 */
export function studioGuard(req: Request): NextResponse | null {
  if (!studioEnabled()) return NextResponse.json({ error: "introuvable" }, { status: 404 })
  const o = req.headers.get("origin")
  if (o) { try { if (new URL(o).host !== req.headers.get("host")) return NextResponse.json({ error: "origine refusée" }, { status: 403 }) } catch { return NextResponse.json({ error: "origine" }, { status: 400 }) } }
  return null
}
export const fail = (e: unknown, status = 500) => NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status })
