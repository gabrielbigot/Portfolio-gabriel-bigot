import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"
import { SLUG_RE } from "@/lib/articles/annotations"
import { readEdits } from "@/lib/articles/edits-store"
import { parseReportData } from "@/lib/articles/edits.mjs"
import { alternatives, contractOf, knownType, missingNumbers } from "@/lib/articles/chart-rank"
import { parseData, baseFigure } from "@/lib/articles/figure-data"
import { runAiChart, aiEnabled } from "@/lib/studio/ai"
import model from "@/lib/articles/chart-model/decision-model.json"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Nouvelle figure à partir de données collées (modèle de décision). action « draft » : figure de base + formes classées ; « convert » : même données, autre forme (Claude).
// Rien n'est enregistré ici : l'insertion passe par /edits (op « figure ») puis la section de l'article.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const rb = await getStore().readDraft(`content/articles/${slug}/build/data/report-data.js`); const ed = await readEdits(slug)
  let evidence: { key: string; fact: string; state?: string }[] = []; try { if (rb) evidence = parseReportData(rb.toString("utf8")).evidence || [] } catch { /* registre illisible */ }
  evidence = [...evidence, ...((ed.evidence || []) as { key: string; fact: string }[])]
  return NextResponse.json({ ai: aiEnabled(), intents: (model as unknown as { intents: { id: string; label: string }[] }).intents.map(i => ({ id: i.id, label: i.label })), evidence: evidence.map(e => ({ key: e.key, fact: String(e.fact).slice(0, 140) })) })
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const b = await req.json().catch(() => null); if (!b) return fail("requête", 400)
  try {
    if (b.action === "draft") {
      const title = String(b.title || "").trim().slice(0, 200); if (!title) return fail("donnez un titre à la figure (une affirmation)", 400)
      const state = ["actual", "estimate", "forecast", "derived", "claim"].includes(b.state) ? b.state : "claim", src = /^K\d{1,4}$/.test(String(b.src || "")) ? String(b.src) : ""
      const fig = baseFigure(parseData(String(b.text || "")), { title, unit: String(b.unit || "").slice(0, 20), state, src })
      const r = alternatives(fig, [], 8, typeof b.intent === "string" && b.intent ? b.intent : undefined)
      return NextResponse.json({ figure: fig, brief: r.brief, alts: r.alts, ai: aiEnabled() })
    }
    if (b.action === "convert") {
      if (!b.figure || typeof b.figure !== "object" || !knownType(String(b.type))) return fail("requête", 400)
      if (String(b.figure.type) === String(b.type)) return NextResponse.json({ figure: b.figure, model: "", missing: [] })
      const rb = await getStore().readDraft(`content/articles/${slug}/build/data/report-data.js`), ed = await readEdits(slug); let keys: string[] = []
      try { if (rb) keys = (parseReportData(rb.toString("utf8")).evidence || []).map((e: { key: string }) => e.key) } catch { /* registre illisible */ }
      const r = await runAiChart({ figure: b.figure, target: String(b.type), contract: contractOf(String(b.type)), evidence: new Set([...keys, ...(ed.evidence || []).map(e => e.key)]) })
      return NextResponse.json({ figure: r.figure, model: r.model, missing: missingNumbers(b.figure, r.figure) })
    }
    return fail("action", 400)
  } catch (e) { return fail(e, /absente|Limite|impossible|illisible|refusée|volumineuse|collez|titre/.test(String((e as Error)?.message)) ? 422 : 502) }
}
