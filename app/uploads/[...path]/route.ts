import { NextRequest, NextResponse } from "next/server"
import { studioEnabled } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" }
// Studio uniquement : sert les images du BROUILLON (celles de la version publiée sont des fichiers statiques de public/uploads/).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!studioEnabled()) return new NextResponse(null, { status: 404 })
  const name = (await params).path.join("/"); if (!/^[A-Za-z0-9._-]{1,120}$/.test(name)) return new NextResponse(null, { status: 404 })
  try {
    const b = await getStore().readDraft(`public/uploads/${name}`); if (!b) return new NextResponse(null, { status: 404 })
    return new NextResponse(new Uint8Array(b), { headers: { "Content-Type": TYPES[name.split(".").pop()!.toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" } })
  } catch { return new NextResponse(null, { status: 404 }) }
}
