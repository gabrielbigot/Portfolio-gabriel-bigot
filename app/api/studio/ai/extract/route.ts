import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { runAiExtract } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Valeurs chiffrées d'un passage (pour un graphique) : seules celles qui figurent mot pour mot dans le texte sont conservées.
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || typeof b.text !== "string") return fail("requête", 400)
  try { return NextResponse.json(await runAiExtract({ text: b.text, topic: typeof b.topic === "string" ? b.topic : undefined })) }
  catch (e) { return fail(e, /absente|Limite|vide|illisible/.test(String((e as Error)?.message)) ? 422 : 502) }
}
