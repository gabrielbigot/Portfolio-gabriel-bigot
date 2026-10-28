import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { alternatives, contractOf, knownType, missingNumbers } from "@/lib/articles/chart-rank"
import { parseData, baseFigure } from "@/lib/articles/figure-data"
import { runAiChart, aiEnabled } from "@/lib/studio/ai"
import model from "@/lib/articles/chart-model/decision-model.json"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Graphique pour un ESSAI (pas de registre de sources) : mêmes actions que /articles/<slug>/figure — « draft » puis « convert ». Rien n'est enregistré ici.
export async function GET(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  return NextResponse.json({ ai: aiEnabled(), intents: (model as unknown as { intents: { id: string; label: string }[] }).intents.map(i => ({ id: i.id, label: i.label })), evidence: [] })
}
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b) return fail("requête", 400)
  try {
    if (b.action === "draft") {
      const title = String(b.title || "").trim().slice(0, 200); if (!title) return fail("donnez un titre à la figure (une affirmation)", 400)
      const state = ["actual", "estimate", "forecast", "derived", "claim"].includes(b.state) ? b.state : "claim"
      const fig = baseFigure(parseData(String(b.text || "")), { title, unit: String(b.unit || "").slice(0, 20), state, src: b.src === "S1" ? "S1" : "" })
      const r = alternatives(fig, [], 8, typeof b.intent === "string" && b.intent ? b.intent : undefined)
      return NextResponse.json({ figure: fig, brief: r.brief, alts: r.alts, ai: aiEnabled() })
    }
    if (b.action === "convert") {
      if (!b.figure || typeof b.figure !== "object" || !knownType(String(b.type))) return fail("requête", 400)
      if (String(b.figure.type) === String(b.type)) return NextResponse.json({ figure: b.figure, model: "", missing: [] })
      const r = await runAiChart({ figure: b.figure, target: String(b.type), contract: contractOf(String(b.type)), evidence: new Set<string>(["S1"]) })
      return NextResponse.json({ figure: r.figure, model: r.model, missing: missingNumbers(b.figure, r.figure) })
    }
    return fail("action", 400)
  } catch (e) { return fail(e, /absente|Limite|impossible|illisible|refusée|volumineuse|collez|titre/.test(String((e as Error)?.message)) ? 422 : 502) }
}
