import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { runAiPlan } from "@/lib/studio/ai"
import model from "@/lib/articles/chart-model/decision-model.json"
import hist from "@/lib/articles/chart-model/history.json"
import { knownType } from "@/lib/articles/chart-rank"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Intent = { id: string; label: string; options: [string, number, string][] }
const intents = (model as unknown as { intents: Intent[] }).intents
const used = new Set((hist as { articles: { figures: { type: string }[] }[] }).articles.flatMap(a => a.figures.map(f => f.type)))

// Plan guidé : pour chaque partie, le format conseillé et pourquoi (modèle de décision) ; pour un graphique, les formes classées par le modèle.
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || typeof b.prompt !== "string") return fail("requête", 400)
  try {
    const r = await runAiPlan({ prompt: b.prompt, intents: intents.map(i => ({ id: i.id, label: i.label })),
      options: id => (intents.find(i => i.id === id)?.options || []).filter(o => knownType(o[0])).sort((a, c) => c[1] - a[1] || +used.has(a[0]) - +used.has(c[0])).slice(0, 3).map(o => ({ type: o[0], when: o[2], fresh: !used.has(o[0]) })) })
    return NextResponse.json(r)
  } catch (e) { return fail(e, /absente|Limite|vide|illisible|incomplet/.test(String((e as Error)?.message)) ? 422 : 502) }
}
