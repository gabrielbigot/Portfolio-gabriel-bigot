import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"
import { SLUG_RE } from "@/lib/articles/annotations"
import { readEdits } from "@/lib/articles/edits-store"
import { parseReportData } from "@/lib/articles/edits.mjs"
import { alternatives, contractOf, knownType, missingNumbers } from "@/lib/articles/chart-rank"
import { runAiChart, aiEnabled } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// « Propose d'autres graphiques » pour une figure d'article : GET = formes candidates (modèle de décision) ; POST = conversion par Claude
// des mêmes données vers une forme choisie (aperçu seulement : rien n'est enregistré ici ; l'application passe par /edits, op « figure »).
async function figureOf(slug: string, id: string) {
  const b = await getStore().readDraft(`content/articles/${slug}/build/data/report-data.js`); if (!b) return null
  const data = parseReportData(b.toString("utf8")), ed = await readEdits(slug), orig = data.figures?.[id]; if (!orig) return null
  const over = ed.figures?.[id]; return { original: orig as Record<string, any>, current: (over || orig) as Record<string, any>, overridden: !!over, evidence: new Set<string>((data.evidence || []).map((e: { key: string }) => e.key)), usedHere: Object.values(data.figures || {}).map((f: any) => String(f.type)) }
}
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; const fig = new URL(req.url).searchParams.get("fig") || ""
  if (!SLUG_RE.test(slug) || !/^fig-[a-z0-9-]{1,50}$/.test(fig)) return fail("requête", 400)
  try {
    const f = await figureOf(slug, fig); if (!f) return fail("figure introuvable", 404)
    if (String(f.current.type) === "lieflat") return NextResponse.json({ current: "lieflat", overridden: f.overridden, alts: [], note: "Figure externe (Lieflat) : pas de conversion automatique.", ai: aiEnabled() })
    const r = alternatives(f.current, f.usedHere.filter(t => t !== String(f.current.type) || false), 6)
    return NextResponse.json({ ...r, overridden: f.overridden, originalType: String(f.original.type), ai: aiEnabled() })
  } catch (e) { return fail(e) }
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; const b = await req.json().catch(() => null)
  if (!SLUG_RE.test(slug) || !b || !/^fig-[a-z0-9-]{1,50}$/.test(String(b.fig)) || !knownType(String(b.type))) return fail("requête", 400)
  try {
    const f = await figureOf(slug, String(b.fig)); if (!f) return fail("figure introuvable", 404)
    const r = await runAiChart({ figure: f.original, target: String(b.type), contract: contractOf(String(b.type)), evidence: f.evidence })
    return NextResponse.json({ figure: r.figure, model: r.model, missing: missingNumbers(f.original, r.figure) })
  } catch (e) { return fail(e, /absente|Limite|impossible|illisible|refusée|volumineuse/.test(String((e as Error)?.message)) ? 422 : 502) }
}
