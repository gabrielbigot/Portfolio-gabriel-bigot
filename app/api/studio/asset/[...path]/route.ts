import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs"
import path from "node:path"
import { studioEnabled } from "@/lib/studio/guard"
import { getStore, ASSET_RE } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif" }
// Studio : images statiques du site servies depuis le BROUILLON (celles qu'on a remplacées), sinon depuis le fichier d'origine.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!studioEnabled()) return new NextResponse(null, { status: 404 })
  const rel = (await params).path.join("/"); const file = `public/${rel}`
  if (!ASSET_RE.test(file)) return new NextResponse(null, { status: 404 })
  let buf: Buffer | null = null
  try { buf = await getStore().readDraft(file) } catch { /* brouillon indisponible */ }
  if (!buf) { const f = path.join(process.cwd(), file); if (fs.existsSync(f)) buf = fs.readFileSync(f) }
  if (!buf) return new NextResponse(null, { status: 404 })
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": TYPES[rel.split(".").pop()!.toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" } })
}
