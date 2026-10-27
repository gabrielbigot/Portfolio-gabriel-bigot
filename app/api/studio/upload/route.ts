import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { studioGuard, fail } from "@/lib/studio/guard"
import fs from "node:fs"
import path from "node:path"
import { getStore, ASSET_RE } from "@/lib/studio/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function sniff(b: Buffer): string | null {
  if (b.length > 12 && b[0] === 0x89 && b.toString("latin1", 1, 4) === "PNG") return "png"
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg"
  if (b.length > 6 && b.toString("latin1", 0, 4) === "GIF8") return "gif"
  if (b.length > 12 && b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP") return "webp"
  return null // pas de SVG : il peut contenir du script
}

// Envoi d'une image dans le BROUILLON (public/uploads/). Elle n'est publique qu'après « Publier ».
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const f = (await req.formData().catch(() => null))?.get("file"); if (!f || typeof f === "string") return fail("fichier manquant", 400)
  const buf = Buffer.from(await (f as File).arrayBuffer()); if (buf.length > 8 * 1024 * 1024) return fail("image trop lourde (8 Mo max)", 413)
  const ext = sniff(buf); if (!ext) return fail("format non pris en charge (png, jpg, webp, gif)", 415)
  const base = ((f as File).name || "image").replace(/\.[^.]*$/, "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image"
  // remplacement « à l'identique » d'une image statique du site (même chemin, même nom) : ?replace=/projects/x/y.png
  const rep = new URL(req.url).searchParams.get("replace")
  if (rep) {
    const target = "public" + rep.split("?")[0]
    if (!ASSET_RE.test(target) || rep.includes("..")) return fail("chemin d'image refusé", 400)
    if (target.split(".").pop()!.toLowerCase().replace("jpeg", "jpg") !== ext && !(ext === "webp" || ext === "png" || ext === "jpg")) return fail("format incompatible", 400)
    try { await getStore().writeDraft(target, buf); return NextResponse.json({ path: rep.split("?")[0], replaced: true }) } catch (e) { return fail(e) }
  }
  const name = `${base}-${crypto.randomBytes(3).toString("hex")}.${ext}`
  try { await getStore().writeDraft(`public/uploads/${name}`, buf); return NextResponse.json({ path: `/uploads/${name}` }) } catch (e) { return fail(e) }
}
