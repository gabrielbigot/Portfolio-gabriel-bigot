import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Traces de l'IA (studio seulement, jamais publiées) : quel texte a été écrit ou changé par l'IA, à partir de quelle demande.
// Stockées dans `.studio/ai-trace.json` (branche brouillon ou dossier local), hors des chemins publiables.
type Entry = { prompt: string; before: string; after: string; at: string; model: string; status: "ai" | "reviewed" | "edited" }
const NAME = "ai-trace.json", ID_RE = /^[A-Za-z0-9_-]{1,60}(\|[A-Za-z0-9_./-]{0,300})?$/
async function load(): Promise<{ version: 1; items: Record<string, Entry> }> { const b = await getStore().readMeta(NAME); try { const j = b ? JSON.parse(b.toString("utf8")) : null; return { version: 1, items: j && typeof j.items === "object" ? j.items : {} } } catch { return { version: 1, items: {} } } }
const cut = (v: unknown, n: number) => String(v ?? "").slice(0, n)

export async function GET(req: NextRequest) { const no = studioGuard(req); if (no) return no; try { return NextResponse.json(await load()) } catch (e) { return fail(e) } }
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); if (!b || (b.op !== "setMany" && !ID_RE.test(String(b.id)))) return fail("requête", 400)
  try {
    const t = await load(); const id = String(b.id ?? "")
    if (b.op === "set") { if (Object.keys(t.items).length >= 500 && !t.items[id]) return fail("trop de traces", 413); t.items[id] = { prompt: cut(b.entry?.prompt, 2000), before: cut(b.entry?.before, 8000), after: cut(b.entry?.after, 8000), at: new Date().toISOString(), model: cut(b.entry?.model, 60), status: "ai" } }
    else if (b.op === "setMany") { for (const it of (Array.isArray(b.items) ? b.items : []).slice(0, 80)) { if (!ID_RE.test(String(it?.id))) continue; if (Object.keys(t.items).length >= 500 && !t.items[String(it.id)]) break; t.items[String(it.id)] = { prompt: cut(it.entry?.prompt, 2000), before: cut(it.entry?.before, 8000), after: cut(it.entry?.after, 8000), at: new Date().toISOString(), model: cut(it.entry?.model, 60), status: "ai" } } }
    else if (b.op === "remove") delete t.items[id]
    else if (b.op === "review" || b.op === "edited") { if (t.items[id]) { t.items[id].status = b.op === "review" ? "reviewed" : "edited"; if (b.op === "edited" && typeof b.after === "string") t.items[id].after = cut(b.after, 8000) } }
    else return fail("opération", 400)
    await getStore().writeMeta(NAME, JSON.stringify(t, null, 1) + "\n"); return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}
