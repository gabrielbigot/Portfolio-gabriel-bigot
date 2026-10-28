import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { runAiJev } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Consigne libre de l'éditeur d'écriture → liste d'actions validées (exécutées côté éditeur, après aperçu).
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || typeof b.text !== "string") return fail("requête", 400)
  try { return NextResponse.json(await runAiJev({ text: b.text, nearby: Array.isArray(b.nearby) ? b.nearby.map(String) : [], sections: Array.isArray(b.sections) ? b.sections.map(String) : [], selection: typeof b.selection === "string" ? b.selection : undefined })) }
  catch (e) { return fail(e, /absente|Limite|vide|illisible/.test(String((e as Error)?.message)) ? 422 : 502) }
}
