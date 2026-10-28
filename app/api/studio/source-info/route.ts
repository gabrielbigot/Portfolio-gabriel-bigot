import { NextRequest, NextResponse } from "next/server"
import dns from "node:dns/promises"
import net from "node:net"
import { parse } from "node-html-parser"
import { studioGuard, fail } from "@/lib/studio/guard"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Compléter la fiche d'une source à partir de son adresse : lit les métadonnées de la page (titre, éditeur, date, description). Rien d'interprété :
// ce sont des propositions à vérifier. Refuse les adresses locales ou privées (pas d'accès au réseau interne).
const privateIp = (ip: string) => net.isIP(ip) === 4 ? /^(10\.|127\.|169\.254\.|192\.168\.|0\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(ip) : /^(::1?|fc|fd|fe80)/i.test(ip)
async function safeFetch(url: string, hops = 0): Promise<{ html: string; final: string }> {
  const u = new URL(url); if (!/^https?:$/.test(u.protocol)) throw new Error("adresse non prise en charge")
  const addrs = net.isIP(u.hostname) ? [{ address: u.hostname }] : await dns.lookup(u.hostname, { all: true }); if (!addrs.length || addrs.some(a => privateIp(a.address))) throw new Error("adresse locale ou privée refusée")
  const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(9000), headers: { "user-agent": "Mozilla/5.0 (compatible; StudioMetadata/1.0)", accept: "text/html,application/xhtml+xml" } })
  if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { if (hops >= 3) throw new Error("trop de redirections"); return safeFetch(new URL(r.headers.get("location")!, u).toString(), hops + 1) }
  if (!r.ok) throw new Error(`la page répond ${r.status}`); const ct = r.headers.get("content-type") || ""; if (!/html|xml/.test(ct)) throw new Error("ce n'est pas une page web (PDF, image… : remplissez à la main)")
  const buf = new Uint8Array(await r.arrayBuffer()).slice(0, 600_000); return { html: new TextDecoder("utf-8").decode(buf), final: u.toString() }
}
const meta = (root: ReturnType<typeof parse>, ...keys: string[]) => { for (const k of keys) { const e = root.querySelector(`meta[property="${k}"]`) || root.querySelector(`meta[name="${k}"]`); const v = e?.getAttribute("content")?.trim(); if (v) return v } return "" }
export async function POST(req: NextRequest) {
  const no = studioGuard(req); if (no) return no
  const b = await req.json().catch(() => null); const url = String(b?.url || "").trim(); if (!/^https?:\/\//i.test(url) || url.length > 500) return fail("adresse invalide (https://…)", 400)
  try {
    const { html, final } = await safeFetch(url), root = parse(html), host = new URL(final).hostname.replace(/^www\./, "")
    let date = meta(root, "article:published_time", "og:published_time", "datePublished", "date", "DC.date.issued", "pubdate") || root.querySelector("time[datetime]")?.getAttribute("datetime") || ""
    if (!date) { const ld = /"datePublished"\s*:\s*"([^"]+)"/.exec(html); if (ld) date = ld[1] }
    const dm = /(\d{4})-(\d{2})-(\d{2})/.exec(date), title = meta(root, "og:title", "twitter:title") || root.querySelector("title")?.text.trim() || ""
    const cls = /(\.gouv\.fr|\.gov(\.|$)|europa\.eu|insee\.fr|\.edu|\.ac\.[a-z]{2}|oecd\.org|who\.int|worldbank\.org|un\.org)$/.test(host) ? "official" : /(lemonde|lefigaro|liberation|lesechos|franceinfo|bfmtv|nytimes|reuters|bbc|theguardian|mediapart|leparisien|ouest-france)\./.test(host) ? "press" : "other"
    return NextResponse.json({ title: title.slice(0, 300), siteName: meta(root, "og:site_name", "application-name") || host, author: meta(root, "author", "article:author").slice(0, 120), description: meta(root, "og:description", "description").slice(0, 400), date: dm ? dm[0] : "", url: final, sourceClass: cls })
  } catch (e) { return fail(e, 422) }
}
