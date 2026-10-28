import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs"
import path from "node:path"
import { studioEnabled } from "@/lib/studio/guard"
import { getStore } from "@/lib/studio/store"
import { readEdits } from "@/lib/articles/edits-store"
import { applyEdits, withEditor, applyFigureOverrides, parseReportData } from "@/lib/articles/edits.mjs"
import { readTree, SLUG_RE, IMG_RE, imgPath } from "@/lib/articles/annotations"
import { transformIndex, subPages, publicTree } from "@/lib/articles/emit.mjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TYPES: Record<string, string> = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", mjs: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8", json: "application/json", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", glb: "model/gltf-binary", wasm: "application/wasm", woff2: "font/woff2", woff: "font/woff", txt: "text/plain; charset=utf-8", md: "text/plain; charset=utf-8" }
// registre des sources (d'origine + ajoutées dans le studio) : infobulles des pastilles des sections écrites dans l'éditeur d'écriture
async function evMap(store: ReturnType<typeof getStore>, root: string, ed: { evidence?: Record<string, string>[] }) {
  const m = new Map<string, Record<string, string>>(); const b = await store.readDraft(`${root}/build/data/report-data.js`)
  if (b) { try { for (const e of parseReportData(b.toString("utf8")).evidence || []) m.set(e.key, e) } catch { /* registre illisible */ } }
  for (const e of ed.evidence || []) m.set(e.key, e); return m
}
const ok = (body: string | Uint8Array, type: string, cache = "no-store") => new NextResponse(typeof body === "string" ? body : new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": cache, "X-Robots-Tag": "noindex" } })

// Copie privée du studio : sert les articles (brouillons compris) sous les mêmes adresses que le site public (/articles/<slug>/…),
// avec le moteur de notes en mode auteur. Tout est lu dans le BROUILLON (fichiers locaux ou branche GitHub).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; path?: string[] }> }) {
  if (!studioEnabled()) return new NextResponse(null, { status: 404 })
  const { slug, path: segs = [] } = await params; if (!SLUG_RE.test(slug)) return new NextResponse(null, { status: 404 })
  const rel = segs.join("/").replace(/\/$/, ""); if (rel.includes("..") || /[^A-Za-z0-9._\/ -]/.test(rel)) return new NextResponse(null, { status: 404 })
  const store = getStore(); const root = `content/articles/${slug}`
  try {
    const metaB = await store.readDraft(`${root}/article.json`); if (!metaB) return new NextResponse(null, { status: 404 })
    const meta = JSON.parse(metaB.toString("utf8"))
    if (rel === "" || rel === "index.html") { const h = await store.readDraft(`${root}/build/index.html`); if (!h) return new NextResponse(null, { status: 404 }); const ed = await readEdits(slug); return ok(withEditor(applyEdits(transformIndex(h.toString("utf8"), slug, "draft"), ed.pages[""], { mode: "draft", evidence: await evMap(store, root, ed), registry: meta.createdInStudio && !meta.adopted ? ed.evidence : undefined }), slug, "", !!meta.createdInStudio), TYPES.html) }
    if (rel === "data/report-data.js") { const rb = await store.readDraft(`${root}/build/data/report-data.js`); if (!rb) return new NextResponse(null, { status: 404 }); const ed = await readEdits(slug); return ok(applyFigureOverrides(rb.toString("utf8"), ed.figures, ed.evidence), TYPES.js) }
    if (rel === "assets/edit.js") return ok(fs.readFileSync(path.join(process.cwd(), "lib/articles/edit.js")), TYPES.js)
    if (rel === "assets/annotate.js") return ok(fs.readFileSync(path.join(process.cwd(), "lib/articles/annotate.js")), TYPES.js)
    if (rel === "annotations.public.json") { const t = await readTree(slug); return ok(JSON.stringify({ slug, ...publicTree(t) }), TYPES.json) }
    if (rel.startsWith("annotation-images/")) { const f = rel.slice("annotation-images/".length); if (!IMG_RE.test(f)) return new NextResponse(null, { status: 404 }); const b = await store.readDraft(imgPath(slug, f)); return b ? ok(b, TYPES[f.split(".").pop()!] || "application/octet-stream") : new NextResponse(null, { status: 404 }) }
    const sub = /^s\/([A-Za-z0-9]{3,40})((?:\/s\/[A-Za-z0-9]{3,40})*)$/.exec(rel)
    if (sub) { const ids = [sub[1], ...sub[2].split("/s/").filter(Boolean)]; const t = await readTree(slug); const page = subPages(slug, meta, t.notes, "draft").find((p: { ids: string[] }) => p.ids.join("/") === ids.join("/")); if (!page) return new NextResponse(null, { status: 404 }); const ed = await readEdits(slug); const key = ids.join("/"); return ok(withEditor(applyEdits(page.html, ed.pages[key], { mode: "draft" }), slug, key), TYPES.html) }
    let b = await store.readDraft(`${root}/build/${rel}`)
    if (!b && meta.createdInStudio && /^(assets|vendor)\//.test(rel)) { try { b = fs.readFileSync(path.join(process.cwd(), "content/articles/_template/build", rel)) } catch { /* absent */ } } // dossier créé dans le studio : moteur d'affichage partagé
    if (!b) return new NextResponse(null, { status: 404 })
    return ok(b, TYPES[rel.split(".").pop()!.toLowerCase()] || "application/octet-stream", "private, max-age=600") // ressources de l'article (d3, moteurs de graphiques…) : peu de changements, évite des appels GitHub répétés
  } catch (e) { return new NextResponse(String(e instanceof Error ? e.message : e), { status: 500 }) }
}
