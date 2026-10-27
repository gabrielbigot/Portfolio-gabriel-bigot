import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { runAiSection } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Section écrite par Claude à partir d'une demande : renvoie un bloc validé (types et champs autorisés, liens filtrés, pas d'image).
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || typeof b.prompt !== "string") return fail("requête", 400)
  try { return NextResponse.json(await runAiSection({ prompt: b.prompt, type: typeof b.type === "string" ? b.type : undefined, context: String(b.context ?? "") })) }
  catch (e) { return fail(e, /absente|Limite|vide|reconnu|illisible/.test(String((e as Error)?.message)) ? 422 : 502) }
}
