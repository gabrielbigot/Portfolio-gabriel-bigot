"use client"
// Figure du moteur de graphiques des dossiers, affichée dans une page du site (essais, aperçus du studio) via un cadre isolé : /figure-engine/frame.html.
import { useEffect, useRef, useState } from "react"

// en mode studio, les textes portent des marqueurs invisibles (repérage de l'édition en place) : on les retire avant de dessiner
const MARKS = /[\u2060\u200b-\u200d\ufeff]/g
const clean = (v: unknown): unknown => typeof v === "string" ? v.replace(MARKS, "") : Array.isArray(v) ? v.map(clean) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, clean(x)])) : v

export default function FigureFrame({ figure, title, source, evidence, minHeight = 260 }: { figure: Record<string, unknown>; title?: string; source?: string; evidence?: Record<string, unknown>[]; minHeight?: number }) {
  const ref = useRef<HTMLIFrameElement>(null); const [h, setH] = useState(minHeight)
  useEffect(() => {
    const theme = () => (document.documentElement.classList.contains("dark") || document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light")
    const send = () => ref.current?.contentWindow?.postMessage({ type: "fig", figure: clean(figure), theme: theme(), evidence: evidence ? clean(evidence) : [{ key: "S1", fact: (source || "").replace(MARKS, "") || "Source non précisée", value: "", state: "actual", unit: "", sourceClass: "", sourceName: (source || "").replace(MARKS, "") || "Source non précisée", publicationDate: "", observationDate: "", url: (/https?:\/\/\S+/.exec((source || "").replace(MARKS, "")) || [""])[0], formula: "", limitations: "" }] }, "*")
    const on = (e: MessageEvent) => { if (e.source !== ref.current?.contentWindow) return; if (e.data?.type === "fig-ready") send(); if (e.data?.type === "fig-height" && typeof e.data.h === "number") setH(Math.max(minHeight, Math.min(1600, e.data.h))) }
    window.addEventListener("message", on); const fr = ref.current; fr?.addEventListener("load", send); const mo = new MutationObserver(send); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] }); send()
    return () => { window.removeEventListener("message", on); fr?.removeEventListener("load", send); mo.disconnect() }
  }, [figure, minHeight, source, evidence])
  return <iframe ref={ref} src="/figure-engine/frame.html" title={title || "Figure"} loading="lazy" style={{ width: "100%", height: h, border: 0, background: "transparent" }} />
}
