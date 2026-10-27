import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { studioGuard, fail } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"
import { SLUG_RE, IMG_RE, imgPath, sniffImage } from "@/lib/articles/annotations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Images attachées aux notes / insérées dans les sous-articles (png, jpg, webp, gif ; 8 Mo ; pas de SVG).
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const f = (await req.formData().catch(() => null))?.get("file"); if (!f || typeof f === "string") return fail("fichier manquant", 400)
  const buf = Buffer.from(await (f as File).arrayBuffer()); if (buf.length > 8 * 1024 * 1024) return fail("image trop lourde (8 Mo max)", 413)
  const ext = sniffImage(buf); if (!ext) return fail("format non pris en charge (png, jpg, webp, gif)", 415)
  const file = crypto.randomBytes(6).toString("hex") + "." + ext
  try { await getStore().writeDraft(imgPath(slug, file), buf); return NextResponse.json({ file }) } catch (e) { return fail(e) }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const no = studioGuard(req); if (no) return no
  const { slug } = await params; if (!SLUG_RE.test(slug)) return fail("article inconnu", 404)
  const file = new URL(req.url).searchParams.get("file") || ""; if (!IMG_RE.test(file)) return fail("nom", 400)
  try { await getStore().deleteDraft(imgPath(slug, file)); return NextResponse.json({ ok: true }) } catch (e) { return fail(e) }
}
