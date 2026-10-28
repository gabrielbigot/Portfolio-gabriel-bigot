import { NextRequest, NextResponse } from "next/server"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Modifications du brouillon non encore publiées (brouillon ≠ main).
export async function GET(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  try { const store = getStore(); const changes = await store.changes(); return NextResponse.json({ backend: store.name, changes, conflicts: await store.conflicts() }) } catch (e) { return fail(e) }
}
