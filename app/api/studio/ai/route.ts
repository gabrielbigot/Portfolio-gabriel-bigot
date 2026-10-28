import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { aiEnabled, aiModel, runAi } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Assistant d'écriture : GET → disponibilité ; POST { instruction, original, context, multiline } → { text }.
export async function GET(req: NextRequest) { const no = studioGuard(req); if (no) return no; return NextResponse.json({ enabled: aiEnabled(), model: aiModel() }) }
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || typeof b.instruction !== "string") return fail("requête", 400)
  try { const r = await runAi({ instruction: b.instruction, original: String(b.original ?? ""), context: String(b.context ?? ""), multiline: !!b.multiline }); return NextResponse.json(r) }
  catch (e) { return fail(e, /absente|Limite|Refusé|vide|consigne/.test(String((e as Error)?.message)) ? 422 : 502) }
}
